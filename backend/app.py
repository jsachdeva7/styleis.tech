from flask import Flask, request, send_file, jsonify
from rembg import remove
from PIL import Image
import io
from werkzeug.utils import secure_filename

app = Flask(__name__)


@app.route("/", methods=["GET"])
def home():
    return "Hello, world!"
