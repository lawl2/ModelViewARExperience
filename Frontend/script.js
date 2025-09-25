const NGROK_URL = " https://41c166f6fa4e.ngrok-free.app"; // ← Inserisci qui il tuo link HTTPS da Ngrok

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
  if (!file || (!file.name.endsWith('.glb') && !file.name.endsWith('.usdz'))) {
    alert('Carica un file .glb (Android) o .usdz (iOS)');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${NGROK_URL}/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Errore durante l\'upload');
    }

    const modelPath = await response.text(); // es: /models/model.glb
    const fullURL = `${NGROK_URL}${modelPath}`;

    // Imposta il file corretto nel model-viewer
    if (file.name.endsWith('.glb')) {
      viewer.setAttribute('src', fullURL);
      viewer.removeAttribute('ios-src');
    } else if (file.name.endsWith('.usdz')) {
      viewer.setAttribute('ios-src', fullURL);
      viewer.removeAttribute('src');
    }

    // Determina la piattaforma target in base al tipo di file
    const targetPlatform = file.name.endsWith('.usdz') ? 'iOS' : 'Android';

    // Genera QR code
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(fullURL)}&size=200x200`;
    qrContainer.innerHTML = `
      <p>Scannerizza per visualizzare in AR su ${targetPlatform}:</p>
      <img src="${qrURL}" alt="QR Code">
    `;
  } catch (error) {
    console.error(error);
    alert('Upload fallito. Verifica che Flask sia attivo e Ngrok correttamente configurato.');
  }
});