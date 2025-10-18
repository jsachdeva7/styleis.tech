from flask import Flask
from flask_cors import CORS
from routes import home_bp

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="/")
CORS(app)

# Register blueprints
app.register_blueprint(home_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)