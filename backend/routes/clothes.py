import io
import uuid
import os
from flask import Blueprint, request, jsonify
from PIL import Image
from rembg import remove
import boto3
from google.oauth2 import service_account
from google.cloud import firestore as gc_firestore
from dotenv import load_dotenv
from datetime import date, timedelta
import pandas as pd
import requests
import json

def calculate_applicable_days(min_temp, max_temp):
    url = "https://meteostat.p.rapidapi.com/point/daily"
    # Get yesterday's date
    end_date = date.today() - timedelta(days=1)

    # Get one year before yesterday
    start_date = end_date - timedelta(days=365)


    # Format as yyyy-mm-dd
    start_date = start_date.strftime("%Y-%m-%d")
    end_date = end_date.strftime("%Y-%m-%d")


    querystring = {"lat":"52.5244","lon":"13.4105","start":start_date,"end":end_date}

    headers = {
        "x-rapidapi-key": "cea94ee8d2msha44e92992b315a3p10f03cjsn34baa9685b74",
        "x-rapidapi-host": "meteostat.p.rapidapi.com"
    }

    response = requests.get(url, headers=headers, params=querystring)


    weatherdata = pd.DataFrame(response.json()['data'])
    weatherdata['temperature_fahrenheit'] = weatherdata['tavg'] * 9/5 + 32 
    counter = 0
    for i, row in weatherdata.iterrows():
        if row['temperature_fahrenheit'] >= min_temp and row['temperature_fahrenheit'] <= max_temp:
            counter += 1
    
    return counter / 366




# Load environment variables from .env
load_dotenv()

clothes_bp = Blueprint("clothes", __name__)

# --- Firebase Setup ---
cred_path = 'firebaseCred.json'  # Path to your service account key file
# Initialize Firestore client using service account credentials
creds = service_account.Credentials.from_service_account_file(cred_path)
db = gc_firestore.Client(credentials=creds)

# --- AWS S3 Setup ---
aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")
BUCKET_NAME = os.getenv("AWS_BUCKET_NAME")

s3 = boto3.client(
    "s3",
    region_name="us-east-1",
    aws_access_key_id=aws_access_key_id,
    aws_secret_access_key=aws_secret_access_key
)

# --- Condition Mapping ---
CONDITION_MAPPING = {
    "new": 3,
    "used": 2,
    "worn": 1
}

# ----------------- Routes -----------------

@clothes_bp.route("", methods=["POST"])
def add_clothing_item():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    category = request.form.get("category")
    
    cost = request.form.get("cost")
    item_name = request.form.get("item_name")
    sub_category = request.form.get("sub_category")
    condition = request.form.get("condition", "worn").lower()  # default to 'worn'

    condition_numeric = CONDITION_MAPPING.get(condition, 1)

    min_temp_map = {
        "layers": 20,
        "shoes": -100,
        "longPants": 20,  # Changed from "long pants" to match frontend
        "shorts": 61,
        "shirts": 61,
        "headwear": -100,
        "winterwear": -100
    }

    max_temp_map = {
        "layers": 60,
        "shoes": 100,
        "longPants": 60,  # Changed from "long pants" to match frontend
        "shorts": 100,
        "shirts": 100,
        "headwear": 100,
        "winterwear": 19
    }
    min_temp = min_temp_map.get(sub_category, -100)  # Default to -100 if not found
    max_temp = max_temp_map.get(sub_category, 100)  # Default to 100 if not found

    input_data = file.read()



    try:
        # Step 1: Remove background
        output_data = remove(input_data)
        output_image = Image.open(io.BytesIO(output_data))

        # Step 2: Save to buffer
        img_io = io.BytesIO()
        output_image.save(img_io, format="PNG")
        img_io.seek(0)

        # Step 3: Upload to S3
        image_id = f"{uuid.uuid4()}.png"
        print(img_io)
        s3.upload_fileobj(
            Fileobj=img_io,
            Bucket=BUCKET_NAME,
            Key=image_id,
            ExtraArgs={'ContentType': 'image/png'}
        )
        s3_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{image_id}"

        # Step 4: Save metadata to Firestore
        doc_ref = db.collection("clothes").document(image_id)
        doc_ref.set({
            "clothing_id": str(uuid.uuid4()),  # Convert UUID to string
            "link": s3_url,
            "category": category,
            "sub_category": sub_category,  # Store subcategory
            "cost": cost,  # Now stores '$', '$$', or '$$$'
            "condition": condition,  # Now stores 'new', 'used', or 'worn'
            "frequency": 0,
            "in_jail": False,  # Use boolean instead of 0
            "marked_for_donation": False,  # Use boolean instead of 0
            "item_name": item_name, 
            "min_temp": int(min_temp),
            "max_temp": int(max_temp),
            "created_date": date.today().isoformat(),  # Convert date to ISO string
            "applicable_days": calculate_applicable_days(int(min_temp), int(max_temp)), 
            "last_worn_date": None
        })

        return jsonify({
            "success": True,
            "message": "Upload successful",
            "item": {
                "link": s3_url,
                "image_id": image_id,
                "item_name": item_name,
                "category": category,
                "sub_category": sub_category,
                "cost": cost,
                "condition": condition
            }
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500





@clothes_bp.route("", methods=["GET"])
def get_all_clothes():
    """Fetch all clothes and return as JSON"""
    print("GET /api/clothes hit")

    try:
        # Fetch all documents from the 'clothes' collection
        clothes_ref = db.collection("clothes")
        docs = clothes_ref.stream()

        clothes_list = []
        for doc in docs:
            item = doc.to_dict()
            item["id"] = doc.id  # include Firestore document ID
            clothes_list.append(item)

        return jsonify({
            "success": True,
            "count": len(clothes_list),
            "data": clothes_list
        }), 200

    except Exception as e:
        print("Error fetching clothes:", e)
        return jsonify({"success": False, "error": str(e)}), 500


@clothes_bp.route("/ootd", methods=["POST"])
def create_ootd():
   """Create outfit of the day with selected clothing IDs"""
   print("POST /api/clothes/ootd hit")
   # Expected: list of clothing IDs
   return jsonify({"message": "POST /api/clothes/ootd hit"})


@clothes_bp.route("/jail", methods=["GET"])
def get_jail_clothes():
    """Get clothes in 'jail' - items where in_jail == 1"""
    print("GET /api/clothes/jail hit")
    try:
        # Fetch all clothes documents
        clothes_ref = db.collection("clothes")
        docs = clothes_ref.stream()
        jail_clothes = []
        for doc in docs:
            data = doc.to_dict()
            # Firestore may store numbers as int or float, so check == 1
            if data.get("in_jail", 0) == 1:

                # Optionally add doc id
                data["id"] = doc.id
                jail_clothes.append(data)
        return jsonify({"jail_clothes": jail_clothes}), 200
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@clothes_bp.route("/jail/takeout", methods=["POST"])
def takeout_from_jail():
   """Take a clothing item out of jail"""
   print("POST /api/clothes/jail/takeout hit")
   # Expected: clothing ID
   return jsonify({"message": "POST /api/clothes/jail/takeout hit"})


@clothes_bp.route("/jail/donate", methods=["POST"])
def confirm_donation():
   """Confirm that a clothing item will be donated"""
   print("POST /api/clothes/jail/donate hit")
   # Expected: clothing ID
   return jsonify({"message": "POST /api/clothes/jail/donate hit"})


@clothes_bp.route("/donations", methods=["GET"])
def get_donation_basket():
   """See the donation basket - items marked for donation"""
   print("GET /api/clothes/donations hit")
   return jsonify({"message": "GET /api/clothes/donations hit"})




