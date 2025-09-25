from flask import Flask, request, send_from_directory
from flask_cors import CORS
import os

# Configurazione cartelle
FRONTEND_FOLDER = 'frontend'
UPLOAD_FOLDER = 'models'

# Inizializza Flask
app = Flask(__name__, static_folder=FRONTEND_FOLDER, static_url_path='')
CORS(app)

# Assicurati che la cartella dei modelli esista
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Serve index.html e file statici
@app.route('/')
def index():
    return send_from_directory(FRONTEND_FOLDER, 'index.html')

# Serve file JS e CSS
@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory(FRONTEND_FOLDER, filename)

# Endpoint per upload dei file .glb
@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return "Nessun file ricevuto", 400

    file = request.files['file']
    if file.filename == '':
        return "Nome file vuoto", 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    return f"/models/{file.filename}"

# Serve i file .glb caricati
@app.route('/models/<filename>')
def serve_model(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# Avvia il server
if __name__ == '__main__':
    app.run(port=5500, debug=True)