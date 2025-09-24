// CONFIGURA QUI IL TUO LINK NGROK HTTPS
const NGROK_URL = " https://8ce6e97c92f9.ngrok-free.app"; // ← sostituisci con il tuo link reale

const dropzone = document.getElementById('dropzone');
const viewer = document.getElementById('viewer');
const qrContainer = document.getElementById('qr');

// Drag over: evidenzia l'area
dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropzone.classList.add('dragging');
});

// Drag leave: ripristina stile
dropzone.addEventListener('dragleave', () => {
  dropzone.classList.remove('dragging');
});

// Drop: carica il file e genera QR
dropzone.addEventListener('drop', async (event) => {
  event.preventDefault();
  dropzone.classList.remove('dragging');

  const file = event.dataTransfer.files[0];
  if (!file || !file.name.endsWith('.glb')) {
    alert('Carica un file .glb valido');
    return;
  }

  // Prepara il form per invio al backend Flask
  const formData = new FormData();
  formData.append('file', file);

  try {
    // Upload al backend Flask
    const response = await fetch(`${NGROK_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Errore durante l\'upload');
    }

    const modelPath = await response.text(); // es: /models/model.glb
    const fullURL = `${NGROK_URL}${modelPath}`;

    // Aggiorna il model-viewer
    viewer.setAttribute('src', fullURL);

    // Genera QR code
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullURL)}&size=200x200`;
    qrContainer.innerHTML = `
      <p>Scannerizza per visualizzare in AR:</p>
      <img src="${qrURL}" alt="QR Code">
    `;
  } catch (error) {
    console.error(error);
    alert('Upload fallito. Verifica che Flask sia attivo e Ngrok correttamente configurato.');
  }
});