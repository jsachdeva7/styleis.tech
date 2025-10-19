from flask import Blueprint, request, jsonify, send_file
from rembg import remove
from PIL import Image
import io

remove_bg_bp = Blueprint('images', __name__)
@remove_bg_bp.route("/remove-bg", methods=["POST"])
def remove_bg():
    # Check for image
    if "image" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Optional metadata from form fields
    category = request.form.get("category")
    price = request.form.get("price")
    condition = request.form.get("condition")

    # Read image bytes
    input_data = file.read()

    try:
        output_data = remove(input_data)
        output_image = Image.open(io.BytesIO(output_data))

        img_io = io.BytesIO()
        output_image.save(img_io, "PNG")
        img_io.seek(0)

        # You can log or process the metadata here
        print(f"Category: {category}, Price: {price}, Condition: {condition}")

        # Return both the image and metadata
        return send_file(img_io, mimetype="image/png")

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    