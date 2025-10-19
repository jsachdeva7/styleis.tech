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


    querystring = {"lat":"30.2672","lon":"-97.7431","start":start_date,"end":end_date}

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
        "longPants": 75,  # Changed from "long pants" to match frontend
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
            "in_jail": 0,  # Use boolean instead of 0
            "marked_for_donation": 0,  # Use boolean instead of 0
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
    """Create outfit of the day with selected clothing IDs and update donation scores."""
    print("POST /api/clothes/ootd hit")

    try:
        clothing_ids = request.json.get("clothing_ids", [])
        if not clothing_ids:
            return jsonify({"error": "No clothing_ids provided"}), 400

        updated = []

        # --- Update frequency for selected clothes ---
        for clothing_id in clothing_ids:
            doc_ref = db.collection("clothes").document(clothing_id)
            doc = doc_ref.get()
            if doc.exists:
                data = doc.to_dict()
                freq = data.get("frequency", 0) + 1
                doc_ref.update({
                    "frequency": freq,
                    "last_worn_date": pd.Timestamp.now().isoformat()
                })
                updated.append({"id": clothing_id, "new_frequency": freq})

        # --- Fetch all clothes ---
        clothes_ref = db.collection("clothes")
        all_docs = clothes_ref.stream()

        all_clothes = []
        for doc in all_docs:
            data = doc.to_dict()
            data["id"] = doc.id
            all_clothes.append(data)

        if not all_clothes:
            return jsonify({"error": "No clothes found in database"}), 404

        df = pd.DataFrame(all_clothes)

        # --- Fill missing values safely ---
        df["frequency"] = df["frequency"] if "frequency" in df else 0
        df["frequency"] = df["frequency"].fillna(0)
        df["condition"] = df.get("condition", 2).fillna(2)  # default: used
        df["cost"] = df.get("cost", "$").fillna("$")
        df["applicable_days"] = df.get("applicable_days", 1).fillna(1)
        df["last_worn_date"] = pd.to_datetime(
        df.get("last_worn_date", pd.Timestamp.now()),
        format="mixed",
        errors="coerce",
        utc=True
    )

        today = pd.Timestamp.now(tz="UTC")
        df["days_since_worn"] = (
        (today - df["last_worn_date"])
        .dt.days.clip(lower=0)
        .fillna(0)
        .astype(int)
    )

        # --- Compute donation score ---
        condition_map = {1: 0.33, 2: 0.66, 3: 1.0}
        cost_map = {"$": 0.33, "$$": 0.66, "$$$": 1.0}

        df["donation_score"] = (
            (1 - df["frequency"].rank(pct=True)) * 0.25 +
            (1 - df["condition"].map(condition_map)) * 0.25 +
            df["days_since_worn"].rank(pct=True) * 0.25 +
            (1 - df["applicable_days"].astype(float).rank(pct=True)) * 0.15 +
            (1 - df["cost"].map(cost_map)) * 0.10
        )

        # --- Mark jail status ---
        
        df["in_jail"] = (df["donation_score"] > 0.5).astype(int)  # True/False

        # --- Push updates back to Firestore ---
        for _, row in df.iterrows():
            db.collection("clothes").document(row["id"]).update({
                "in_jail": row["in_jail"],
                "donation_score": float(row["donation_score"]),
                "days_since_worn": int(row["days_since_worn"])
            })


        return jsonify({
            "message": "OOTD updated successfully",
            "updated": updated,
            "total_clothes_checked": len(df),
            "jail_count": int(df["in_jail"].sum())
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



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
   try:
        clothing_id = request.json.get("clothes_id")
        if not clothing_id:
            return jsonify({"error": "No clothing_id provided"}), 400
        doc_ref = db.collection("clothes").document(clothing_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Clothing item not found"}), 404
        doc_ref.update({"in_jail": 0})
        return jsonify({"message": f"Clothing item {clothing_id} removed from jail."}), 200
   except Exception as e:
        return jsonify({"error": str(e)}), 500



@clothes_bp.route("/jail/donate", methods=["POST"])
def confirm_donation():
    """Confirm that a clothing item will be donated"""
    try:
        clothing_id = request.json.get("clothes_id")
        if not clothing_id:
            return jsonify({"error": "No clothing_id provided"}), 400
        doc_ref = db.collection("clothes").document(clothing_id)
        doc = doc_ref.get()
        if not doc.exists:
            return jsonify({"error": "Clothing item not found"}), 404
        doc_ref.update({"marked_for_donation": 1})
        return jsonify({"message": f"Clothing item {clothing_id} marked for donation."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@clothes_bp.route("/donations", methods=["GET"])
def get_donation_basket():
    """See the donation basket - items marked for donation"""
    try:
        clothes_ref = db.collection("clothes")
        docs = clothes_ref.stream()
        donation_basket = []
        for doc in docs:
            data = doc.to_dict()
            # Firestore may store bools or ints, so check both
            marked_for_donation = data.get("marked_for_donation", 0)
            if marked_for_donation == 1:
                data["id"] = doc.id
                donation_basket.append(data)
        return jsonify({"donation_basket": donation_basket}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500





