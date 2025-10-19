from flask import Blueprint, request, jsonify
from rembg import remove
from PIL import Image
import io, uuid, boto3
from google.cloud import firestore


import uuid
import io
from flask import Blueprint, request, jsonify
from PIL import Image
from rembg import remove
import boto3
import os


from dotenv import load_dotenv




load_dotenv()  #
clothes_bp = Blueprint('clothes', __name__)


# Initialize Firestore and S3 clients
# todo


# Replace these with your actual IAM access keys


aws_access_key_id = os.getenv("AWS_ACCESS_KEY_ID")
aws_secret_access_key = os.getenv("AWS_SECRET_ACCESS_KEY")






# Initialize an S3 client
s3 = boto3.client(
   "s3",
   region_name="us-east-1",  # replace with your bucket region
   aws_access_key_id=aws_access_key_id,
   aws_secret_access_key=aws_secret_access_key
)






# Change this to your actual S3 bucket name
BUCKET_NAME =  os.getenv("AWS_BUCKET_NAME")


clothes_bp = Blueprint("clothes", __name__)  # add creds if needed




@clothes_bp.route("", methods=["POST"])
def add_clothing_item():
   # Replace these with your actual IAM access keys
  


   # Initialize an S3 client
   s3 = boto3.client(
       "s3",
       region_name="us-east-1",  # replace with your bucket region
       aws_access_key_id=aws_access_key_id,
       aws_secret_access_key=aws_secret_access_key
   )






   # Change this to your actual S3 bucket name
  
   if "image" not in request.files:
       return jsonify({"error": "No image uploaded"}), 400


   file = request.files["image"]
   if file.filename == "":
       return jsonify({"error": "Empty filename"}), 400


   category = request.form.get("category")
   price = request.form.get("price")
   condition = request.form.get("condition")


   input_data = file.read()


   try:
       # Step 1: Remove background
       output_data = remove(input_data)
       print("before opening image")


       output_image = Image.open(io.BytesIO(output_data))


       # Step 2: Save to buffer
       img_io = io.BytesIO()
       print("before saving to local")


       output_image.save(img_io, format="PNG")
       img_io.seek(0)


       # Step 3: Upload to S3


       image_id = f"{uuid.uuid4()}.png"
       print("before s3.uploadfile")
       print(img_io)
       s3.upload_fileobj(
           Fileobj= img_io,
           Bucket= BUCKET_NAME,
           Key= image_id,
       )
       print("before s3 url")
       s3_url = f"https://{BUCKET_NAME}.s3.amazonaws.com/{image_id}"


       # Step 4: Send back response
       print(jsonify({
           "message": "Upload successful",
           "s3_url": s3_url,
           "category": category,
           "price": price,
           "condition": condition
       }), 200)
       return jsonify({
           "message": "Upload successful",
           "s3_url": s3_url,
           "category": category,
           "price": price,
           "condition": condition
       }), 200


   except Exception as e:
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




