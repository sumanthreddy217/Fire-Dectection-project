from flask import Flask, request, render_template, send_from_directory
import cv2
import numpy as np
from ultralytics import YOLO
import os  # 👈 added for file handling (deleting temp video)

# Create Flask app with correct paths
app = Flask(__name__,
            template_folder='../Frontend/templates',
            static_folder='../Frontend/static')

# Load YOLO model
model = YOLO("firene.pt")

# Confidence threshold
CONFIDENCE_THRESHOLD = 0.5

# Route for main page
@app.route('/')
def home():
    return render_template('index.html')

# Route for Camera page
@app.route('/camera')
def camera():
    return render_template('camera.html')

# 🔥 Route for fire detection from uploaded VIDEO
@app.route('/detect', methods=['POST'])
def detect_fire():
    if 'file' not in request.files:
        return "No file uploaded", 400

    file = request.files['file']
    filename = file.filename.lower()

    npfile = np.frombuffer(file.read(), np.uint8)

    # If it's an image frame
    if filename.endswith(('.jpg', '.jpeg', '.png')):
        image = cv2.imdecode(npfile, cv2.IMREAD_COLOR)
        if image is None:
            return "Failed to decode image", 400

        results = model(image)

        for result in results:
            for box in result.boxes:
                confidence = box.conf
                if confidence > CONFIDENCE_THRESHOLD:
                    return "Fire detected"
        return "No fire"


    # Check if uploaded file is a video
    if filename.endswith(('.mp4', '.avi', '.mov', '.mkv')):
        # Save the uploaded video temporarily
        temp_file_path = 'temp_video.mp4'
        with open(temp_file_path, 'wb') as f:
            f.write(npfile)

        cap = cv2.VideoCapture(temp_file_path)

        if not cap.isOpened():
            return "Failed to open video", 400

        fire_detected = False
        frame_count = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            frame_count += 1

            # Process every 30th frame for faster detection
            if frame_count % 30 != 0:
                continue

            results = model(frame)

            for result in results:
                for box in result.boxes:
                    confidence = box.conf
                    if confidence > CONFIDENCE_THRESHOLD:
                        fire_detected = True
                        break
                if fire_detected:
                    break

            if fire_detected:
                break

        cap.release()
        cv2.destroyAllWindows()

        # After processing, delete the temporary video file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

        if fire_detected:
            return "Fire detected"
        else:
            return "No fire"

    else:
        return "Unsupported file format. Please upload a video file.", 400

# Server runner
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
