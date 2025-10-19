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
    min_temp = request.form.get("min_temp")

    max_temp = request.form.get("max_temp")

    condition = request.form.get("condition", "worn").lower()  # default to 'worn'

    condition_numeric = CONDITION_MAPPING.get(condition, 1)

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
            "link": s3_url,
            "category": category,
            "cost": cost,
            "condition": condition_numeric,
            "usage_count": 0,
            "in_jail": False,
            "marked_for_donation": False,
            "condition": condition_numeric, 
            "item_name": item_name, 
            "min_temp": int(min_temp),
            "max_temp": int(max_temp),
            "applicable_days": calculate_applicable_days(int(min_temp), int(max_temp))
        })

        return jsonify({
            "message": "Upload successful",
            "link": s3_url,
            "category": category,
            "cost": cost,
        

            
        }), 200

    except Exception as e:
        import traceback
        print("🔥 ERROR TRACEBACK 🔥")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500





@clothes_bp.route("", methods=["GET"])
def get_all_clothes():
   """Fetch all clothes - frontend will filter by category"""
   print("GET /api/clothes hit")
   return jsonify({"message": "GET /api/clothes hit"})
@clothes_bp.route("/ootd", methods=["POST"])
def create_ootd():
   """Create outfit of the day with selected clothing IDs"""
   print("POST /api/clothes/ootd hit")
   # Expected: list of clothing IDs
   return jsonify({"message": "POST /api/clothes/ootd hit"})


@clothes_bp.route("/jail", methods=["GET"])
def get_jail_clothes():
   """Get clothes in 'jail' - the five least used items"""
   print("GET /api/clothes/jail hit")
   return jsonify({"message": "GET /api/clothes/jail hit"})


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




