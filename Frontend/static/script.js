// This JS For Index.html File

// Get form, file input, and preview div
const beep = new Audio('/static/beep.mp3');
const uploadForm = document.getElementById('uploadForm');
const fileInput = uploadForm.querySelector('input[type="file"]');
const preview = document.getElementById('preview');

// Handle file selection and show preview
fileInput.addEventListener('change', function () {
  const file = fileInput.files[0];
  preview.innerHTML = ''; // Clear previous preview

  if (file) {
    const url = URL.createObjectURL(file);

    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.width = 400; // Set preview width
      preview.appendChild(video);
    }
  }
});

// Handle form submit
uploadForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) {
    alert('Please select a file first.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  fetch('http://127.0.0.1:5000/detect', { // Update URL if needed
    method: 'POST',
    body: formData
  })
  .then(response => response.text())
  .then(result => {
    const resultBox = document.getElementById('resultBox');
    resultBox.style.display = 'block';  // Show the box
    resultBox.textContent = result;     // Show result message

    if (result.includes('Fire detected')) {
      // Play beep sound
      //setTimeout(() => {
        beep.play(); // Start beep after small delay

        setTimeout(() => {
          beep.pause(); // Stop Beep
          beep.currentTime = 0; // Reset Beep
        }, 5000); //stop after 5 seconds (5000 milli seconds = 5s)
      //}, 100); // 100ms delay after alert
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error sending file to server.');
  });
});
