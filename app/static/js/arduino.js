function conectarArduino(comPort) {
    const btn = document.getElementById('btnConectar');
    btn.disabled = true;
    document.getElementById('loading').classList.add('active');
    document.getElementById('connectionModal').classList.remove('active');

    fetch('/api/connect-arduino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: `COM${comPort}` })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById('loading').classList.remove('active');
        if (data.success) {
            alert('✅ Arduino conectado correctamente');
            state.connected = true;
            btn.textContent = 'Desconectar';
            setupWebSocket();
        } else {
            alert('❌ ' + data.message);
            btn.disabled = false;
        }
    })
    .catch(() => {
        alert('❌ Error al conectar con Arduino');
        document.getElementById('loading').classList.remove('active');
        btn.disabled = false;
    });
}
// static/js/arduino.js
function conectarArduino(comPort) {
    const btn = document.getElementById('btnConectar');
    btn.disabled = true;
    document.getElementById('loading').classList.add('active');
    document.getElementById('connectionModal').classList.remove('active');

    fetch('/api/connect-arduino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port: `COM${comPort}` })
    })
    .then(r => r.json())
    .then(data => {
        document.getElementById('loading').classList.remove('active');
        if (data.success) {
            alert('✅ Arduino conectado correctamente');
            state.connected = true;
            btn.textContent = 'Desconectar';
            setupWebSocket();
        } else {
            alert('❌ ' + data.message);
            btn.disabled = false;
        }
    })
    .catch(() => {
        alert('❌ Error al conectar con Arduino');
        document.getElementById('loading').classList.remove('active');
        btn.disabled = false;
    });
}
