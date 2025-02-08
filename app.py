from flask import Flask, request, jsonify, render_template
import numpy as np
import librosa
import tensorflow as tf

app = Flask(__name__)

# Load the pre-trained model
model = tf.keras.models.load_model('Voice_Emotion_Engine.keras')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    audio_file = request.files['audio']
    audio_file.save('uploaded_audio.wav')  # Save the uploaded audio file

    # Process the audio file
    y, sr = librosa.load('uploaded_audio.wav', sr=22050)
    # Extract features here (this is just an example; replace with your actual feature extraction)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    mfccs = np.mean(mfccs.T, axis=0)

    # Make prediction
    prediction = model.predict(np.expand_dims(mfccs, axis=0))
    emotion = np.argmax(prediction, axis=1)

    # Map the predicted class index to the corresponding emotion label
    emotion_labels = ['Anger', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']  # Adjust based on your model
    predicted_emotion = emotion_labels[emotion[0]]

    return jsonify({'emotion': predicted_emotion})

if __name__ == '__main__':
    app.run(debug=True)
