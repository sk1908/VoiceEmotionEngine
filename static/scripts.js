let mediaRecorder;
let recordedChunks = [];
let audioBlob;
let audioElement = new Audio();

// Function to start recording
document.getElementById('start-btn').addEventListener('click', () => {
    console.log('Start button clicked, trying to access microphone...');
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            console.log('Microphone access granted');
            mediaRecorder = new MediaRecorder(stream);
            recordedChunks = [];  // Clear previous recordings

            mediaRecorder.ondataavailable = event => {
                recordedChunks.push(event.data);
                console.log('Data available from media recorder');
            };

            mediaRecorder.start();
            console.log('Recording started...');
            document.getElementById('recording-status').innerText = 'Recording...'; // Update status

            // Update button states
            document.getElementById('start-btn').disabled = true;
            document.getElementById('stop-btn').disabled = false;
            document.getElementById('play-btn').disabled = true;
            document.getElementById('predict-btn').disabled = true;
        })
        .catch(error => {
            console.error('Error accessing media devices.', error);
            alert('Microphone access is required for this feature. Please enable the microphone and try again.');
        });
});

// Function to stop recording
document.getElementById('stop-btn').addEventListener('click', () => {
    console.log('Stop button clicked');
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        console.log('Recording stopped.');

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
            audioElement.src = URL.createObjectURL(audioBlob);
            console.log('Audio blob created:', audioBlob);

            // Update status and button states
            document.getElementById('recording-status').innerText = 'Recording stopped.';
            document.getElementById('start-btn').disabled = false;
            document.getElementById('stop-btn').disabled = true;
            document.getElementById('play-btn').disabled = false;
            document.getElementById('predict-btn').disabled = false;
        };
    } else {
        console.error('No recording in progress.');
    }
});

// Function to play the recorded audio
document.getElementById('play-btn').addEventListener('click', () => {
    if (audioElement.src) {
        console.log('Playing recorded audio...');
        audioElement.play();
    } else {
        console.error('No audio recorded yet.');
        alert('No audio recorded yet. Please record your voice first.');
    }
});

// Function to send the recorded audio to the backend for emotion prediction
document.getElementById('predict-btn').addEventListener('click', () => {
    if (!audioBlob) {
        console.error('No audio recorded to predict.');
        alert('No audio recorded to predict.');
        return;
    }

    console.log('Sending audio for prediction...');
    let formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    // Send the audio to the backend for prediction
    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Prediction received:', data);
        document.getElementById('prediction-result').innerText = `Predicted Emotion: ${data.emotion}`;
    })
    .catch(error => {
        console.error('Error during prediction:', error);
    });
});
