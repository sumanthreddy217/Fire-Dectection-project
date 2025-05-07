// camera.js

const video = document.getElementById('camera');
const startCameraBtn = document.getElementById('startCameraBtn');
const stopCameraBtn = document.getElementById('stopCameraBtn');
let stream;
let captureInterval;
const beep = new Audio('/static/beep.mp3'); // Beep sound
const resultBox = document.getElementById('resultBox'); // result display div


// Start Camera
startCameraBtn.addEventListener('click', async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Start capturing frames every 1 second
    captureInterval = setInterval(captureFrameAndSend, 1000); // 1000ms = 1 second
  } catch (error) {
    console.error('Error accessing camera:', error);
    alert('Cannot access camera.');
  }
});

// Stop Camera
stopCameraBtn.addEventListener('click', () => {
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    video.srcObject = null;
  }
  clearInterval(captureInterval);

  // Also stop any beep sound when camera stops
  beep.pause();
  beep.currentTime = 0;
});

// Capture current frame and send to backend
function captureFrameAndSend() {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    const formData = new FormData();
    formData.append('file', blob, 'frame.jpg');

    fetch('http://127.0.0.1:5000/detect', {  // Backend URL
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(result => {
      console.log("🔥 Detection result:", result);

      // Show result on screen
      resultBox.style.display = 'block';
      resultBox.textContent = result;

      if (result.includes('Fire detected')) {
        // If not already playing, play the beep
        if (beep.paused) {
          beep.loop = true;      // 🔁 Make beep repeat
          beep.play();
        }
      } else {
        // No fire → stop beep immediately
        if (!beep.paused) {
          beep.pause();
          beep.currentTime = 0;
          beep.loop = false;
        }
      }

      // if (result.includes('Fire detected')) {
      //   beep.play();
        
      //   // Stop beep after 3 seconds
      //   setTimeout(() => {
      //     beep.pause();
      //     beep.currentTime = 0;
      //   }, 3000);
      // } else {
      //   beep.pause();
      //   beep.currentTime = 0;
      // }
    })
    .catch(error => {
      console.error('Error sending frame:', error);
    });
  }, 'image/jpeg');
}
