from flask import Flask, send_from_directory
from pathlib import Path

app = Flask(__name__)

# Path to the frontend folder
FRONTEND_PATH = Path(__file__).parent.parent / "frontend"

@app.route("/")
def index():
    return send_from_directory(FRONTEND_PATH, "landing.html")

@app.route("/<path:filename>")
def frontend_files(filename):
    return send_from_directory(FRONTEND_PATH, filename)

@app.route("/health")
def health():
    return {"status": "ok"}

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
