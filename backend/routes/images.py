from flask import Blueprint, request, jsonify, send_file
from rembg import remove
from PIL import Image
import io

remove_bg_bp = Blueprint("remove_bg_bp", __name__)

@remove_bg_bp.route("/remove-bg", methods=["GET", "POST"])
def remove_bg():
    # Check if file part exists
    if "image" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Read the uploaded image bytes
    input_data = file.read()

    try:
        # Remove background
        output_data = remove(input_data)
        output_image = Image.open(io.BytesIO(output_data))

        # Save to BytesIO to send back to React
        img_io = io.BytesIO()
        output_image.save(img_io, "PNG")
        img_io.seek(0)

        return send_file(img_io, mimetype="image/png")
    except Exception as e:
        return jsonify({"error": str(e)}), 500
