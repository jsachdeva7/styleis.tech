
from flask import Blueprint, jsonify, send_from_directory
import os
import requests

@app.route("/remove-bg", methods=["POST "])
def remove_bg():
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

if __name__ == "__main__":
    app.run(debug=True)
