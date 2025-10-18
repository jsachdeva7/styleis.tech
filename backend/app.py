from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app)

@app.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask!"})

@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)