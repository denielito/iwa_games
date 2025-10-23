// ==================== CONFIGURACIÓN ====================
const HEXAGON_BUTTONS = [
    { name: 'Ajo', color: 'verde-azulado', image: '/static/assets/sprites/semillas/ajo.png' },
    { name: 'Tomate', color: 'verde-limon', image: '/static/assets/sprites/semillas/tomate.png' },
    { name: 'Cilantro', color: 'verde-limon', image: '/static/assets/sprites/semillas/cilantro.png' },
    { name: 'Col', color: 'verde-petroleo', image: '/static/assets/sprites/semillas/col.png' },
    { name: 'Cebolla', color: 'verde-azulado', image: '/static/assets/sprites/semillas/cebolla.png' },
    { name: 'Menta', color: 'blanco', image: '/static/assets/sprites/semillas/menta.png' },
    { name: 'Orquidea', color: 'verde-petroleo', image: '/static/assets/sprites/semillas/orquidea.png' },
    { name: 'Pimiento', color: 'verde-azulado', image: '/static/assets/sprites/semillas/pimiento.png' }
];

// ==================== ESTADO GLOBAL ====================
let state = {
    rectImages: new Array(6).fill(null),
    modalActive: false,
    modalBotonOrigen: null,
    activeInfo: null,
    serialData: {
        temp: '---',
        hum: '---',
        agua: '---',
        suelo: ['---', '---', '---', '---', '---', '---']
    },
    connected: false,
    rectPositions: [],
    mobileMenuOpen: false
};

// ==================== INICIALIZACIÓN ====================
function init() {
    createMobileToggle();
    createMobileOverlay();
    createHexagonButtons();
    createRectangles();
    setupModalEvents();
    setupConnectionModalEvents();
    setupInfoPanelEvents();
    setupMobileMenu();
    setupWebSocket();
    handleResize();
    window.addEventListener('resize', handleResize);
}

// ==================== MENÚ MÓVIL ====================
function createMobileToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'mobile-toggle';
    toggle.id = 'mobileToggle';
    toggle.innerHTML = '+';
    document.body.appendChild(toggle);
}

function createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    overlay.id = 'mobileOverlay';
    document.body.appendChild(overlay);
}

function setupMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const overlay = document.getElementById('mobileOverlay');
    const leftPanel = document.getElementById('leftPanel');
    
    toggle.addEventListener('click', () => {
        state.mobileMenuOpen = !state.mobileMenuOpen;
        
        if (state.mobileMenuOpen) {
            leftPanel.classList.add('active');
            overlay.classList.add('active');
            toggle.innerHTML = '×';
        } else {
            leftPanel.classList.remove('active');
            overlay.classList.remove('active');
            toggle.innerHTML = '+';
        }
    });
    
    overlay.addEventListener('click', () => {
        if (state.mobileMenuOpen) {
            state.mobileMenuOpen = false;
            leftPanel.classList.remove('active');
            overlay.classList.remove('active');
            toggle.innerHTML = '+';
        }
    });
}

function handleResize() {
    const leftPanel = document.getElementById('leftPanel');
    const overlay = document.getElementById('mobileOverlay');
    const toggle = document.getElementById('mobileToggle');
    
    // Si la pantalla es mayor a 640px, asegurarse de que el panel esté visible
    if (window.innerWidth > 640) {
        leftPanel.classList.remove('active');
        overlay.classList.remove('active');
        toggle.innerHTML = '+';
        state.mobileMenuOpen = false;
    } else {
        // En móvil, mantener el estado actual
        if (!state.mobileMenuOpen) {
            leftPanel.classList.remove('active');
        }
    }
}

// ==================== CREAR BOTONES HEXÁGONOS ====================
function createHexagonButtons() {
    const leftPanel = document.getElementById('leftPanel');
    const plantsGrid = document.createElement('div');
    plantsGrid.className = 'plants-grid';

    // 🌸 Flor (Fila 1, Col 1)
    const flor = HEXAGON_BUTTONS[0];
    const btnFlor = document.createElement('button');
    btnFlor.className = `hexagon-btn ${flor.color}`;
    btnFlor.innerHTML = `<img src="${flor.image}" alt="${flor.name}">`;
    btnFlor.style.gridColumn = '1';
    btnFlor.style.gridRow = '1';
    btnFlor.addEventListener('click', () => {
        openModal(flor.name);
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnFlor);

    // 🧼 Limpiar (Fila 1, Col 2)
    const btnLimpiar = document.createElement('button');
    btnLimpiar.className = 'hexagon-half-top';
    btnLimpiar.textContent = 'Limpiar';
    btnLimpiar.style.gridColumn = '2';
    btnLimpiar.style.gridRow = '1';
    btnLimpiar.addEventListener('click', () => {
        openModal('Limpiar');
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnLimpiar);

    // 🍅 Tomate (Fila 2, Col 1)
    const tomate = HEXAGON_BUTTONS[1];
    const btnTomate = document.createElement('button');
    btnTomate.className = `hexagon-btn ${tomate.color}`;
    btnTomate.innerHTML = `<img src="${tomate.image}" alt="${tomate.name}">`;
    btnTomate.style.gridColumn = '1';
    btnTomate.style.gridRow = '2';
    btnTomate.addEventListener('click', () => {
        openModal(tomate.name);
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnTomate);

    // 🌿 Cilantro (Fila 2, Col 2)
    const cilantro = HEXAGON_BUTTONS[2];
    const btnCilantro = document.createElement('button');
    btnCilantro.className = `hexagon-btn ${cilantro.color}`;
    btnCilantro.innerHTML = `<img src="${cilantro.image}" alt="${cilantro.name}">`;
    btnCilantro.style.gridColumn = '2';
    btnCilantro.style.gridRow = '2';
    btnCilantro.addEventListener('click', () => {
        openModal(cilantro.name);
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnCilantro);

    // 🧄 Ajo (Fila 3, Col 1)
    const ajo = HEXAGON_BUTTONS[3];
    const btnAjo = document.createElement('button');
    btnAjo.className = `hexagon-btn ${ajo.color}`;
    btnAjo.innerHTML = `<img src="${ajo.image}" alt="${ajo.name}">`;
    btnAjo.style.gridColumn = '1';
    btnAjo.style.gridRow = '3';
    btnAjo.addEventListener('click', () => {
        openModal(ajo.name);
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnAjo);

    // 🥬 Col (Fila 3, Col 2)
    const col = HEXAGON_BUTTONS[4];
    const btnCol = document.createElement('button');
    btnCol.className = `hexagon-btn ${col.color}`;
    btnCol.innerHTML = `<img src="${col.image}" alt="${col.name}">`;
    btnCol.style.gridColumn = '2';
    btnCol.style.gridRow = '3';
    btnCol.addEventListener('click', () => {
        openModal(col.name);
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnCol);

    // 🌱 Menta (Fila 4, Col 1)
    const menta = HEXAGON_BUTTONS[5];
    const btnMenta = document.createElement('button');
    btnMenta.className = `hexagon-btn ${menta.color}`;
    btnMenta.innerHTML = `<img src="${menta.image}" alt="${menta.name}">`;
    btnMenta.style.gridColumn = '1';
    btnMenta.style.gridRow = '4';
    btnMenta.addEventListener('click', () => {
        openModal(menta.name);
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnMenta);

    // 🍓 Fresa (Fila 4, Col 2)
    const fresa = HEXAGON_BUTTONS[6];
    const btnFresa = document.createElement('button');
    btnFresa.className = `hexagon-btn ${fresa.color}`;
    btnFresa.innerHTML = `<img src="${fresa.image}" alt="${fresa.name}">`;
    btnFresa.style.gridColumn = '2';
    btnFresa.style.gridRow = '4';
    btnFresa.addEventListener('click', () => {
        openModal(fresa.name);
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnFresa);

    // 🌶️ Pimiento (Fila 5, Col 1)
    const pimiento = HEXAGON_BUTTONS[7];
    const btnPimiento = document.createElement('button');
    btnPimiento.className = `hexagon-btn ${pimiento.color}`;
    btnPimiento.innerHTML = `<img src="${pimiento.image}" alt="${pimiento.name}">`;
    btnPimiento.style.gridColumn = '1';
    btnPimiento.style.gridRow = '5';
    btnPimiento.addEventListener('click', () => {
        openModal(pimiento.name);
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnPimiento);

    // 🔌 Conectar (Fila 5, Col 2)
    const btnConectar = document.createElement('button');
    btnConectar.className = 'hexagon-half-bottom';
    btnConectar.id = 'btnConectar';
    btnConectar.textContent = 'Conectar';
    btnConectar.style.gridColumn = '2';
    btnConectar.style.gridRow = '5';
    btnConectar.addEventListener('click', () => {
        openConnectionModal();
        closeMobileMenu();
    });
    plantsGrid.appendChild(btnConectar);

    leftPanel.appendChild(plantsGrid);
}

function closeMobileMenu() {
    if (window.innerWidth <= 640 && state.mobileMenuOpen) {
        state.mobileMenuOpen = false;
        document.getElementById('leftPanel').classList.remove('active');
        document.getElementById('mobileOverlay').classList.remove('active');
        document.getElementById('mobileToggle').innerHTML = '+';
    }
}

// ==================== CREAR RECTÁNGULOS ====================
function createRectangles() {
    const container = document.getElementById('containerRect');
    for (let i = 0; i < 6; i++) {
        const rect = document.createElement('div');
        rect.className = 'rect-item';
        rect.dataset.index = i;
        rect.addEventListener('click', (e) => handleRectClick(i, e));
        container.appendChild(rect);
    }
}

// ==================== MODAL DE CONEXIÓN ====================
function openConnectionModal() {
    document.getElementById('connectionModal').classList.add('active');
    document.getElementById('comPort').focus();
}

function setupConnectionModalEvents() {
    const confirmBtn = document.getElementById('btnConfirmConnection');
    const cancelBtn = document.getElementById('btnCancelConnection');
    const comInput = document.getElementById('comPort');

    confirmBtn.addEventListener('click', () => {
        const comPort = comInput.value.trim();
        if (!comPort || comPort < 1 || comPort > 50) {
            alert('Por favor ingresa un número de puerto válido (1-50)');
            return;
        }
        conectarArduino(comPort);
    });

    cancelBtn.addEventListener('click', () => {
        document.getElementById('connectionModal').classList.remove('active');
    });

    comInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmBtn.click();
        }
    });

    document.getElementById('connectionModal').addEventListener('click', (e) => {
        if (e.target.id === 'connectionModal') {
            document.getElementById('connectionModal').classList.remove('active');
        }
    });
}

// ==================== MODAL SELECCIÓN ====================
function openModal(component) {
    state.modalActive = true;
    state.modalBotonOrigen = component;
    document.getElementById('modalHeader').textContent = `En que maceta pondrás tu ${component}?`;
    document.getElementById('modal').classList.add('active');

    const modalMiniaturas = document.getElementById('modalMiniaturas');
    modalMiniaturas.innerHTML = '';

    for (let i = 0; i < 6; i++) {
        const miniatura = document.createElement('div');
        miniatura.className = 'miniatura';
        miniatura.dataset.index = i;
        miniatura.addEventListener('click', () => selectRectangle(i));
        modalMiniaturas.appendChild(miniatura);
    }
}

function setupModalEvents() {
    document.getElementById('modalClose').addEventListener('click', () => {
        state.modalActive = false;
        document.getElementById('modal').classList.remove('active');
    });

    document.getElementById('modal').addEventListener('click', (e) => {
        if (e.target.id === 'modal') {
            state.modalActive = false;
            document.getElementById('modal').classList.remove('active');
        }
    });
}

function selectRectangle(index) {
    if (state.modalBotonOrigen === 'Limpiar') {
        state.rectImages[index] = null;
    } else {
        const component = state.modalBotonOrigen;
        const plantData = HEXAGON_BUTTONS.find(btn => btn.name === component);
        if (plantData) {
            state.rectImages[index] = plantData;
        }
    }

    state.modalActive = false;
    document.getElementById('modal').classList.remove('active');
    render();
}

// ==================== MANEJO DE CLICS EN RECTÁNGULOS ====================
function handleRectClick(index, e) {
    if (state.rectImages[index]) {
        state.activeInfo = index;
        showInfoPanel(index, e.target.closest('.rect-item'));
    }
}

function setupInfoPanelEvents() {
    document.getElementById('infoClose').addEventListener('click', () => {
        state.activeInfo = null;
        document.getElementById('infoPanel').classList.remove('active');
    });
}

function showInfoPanel(index, rectElement) {
    const data = state.serialData;
    const infoPanel = document.getElementById('infoPanel');
    const infoContent = document.getElementById('infoContent');
    const plantData = state.rectImages[index];

    // Establecer imagen de fondo
    if (plantData && plantData.image) {
        infoPanel.style.backgroundImage = `url('${plantData.image}')`;
    }

    const content = `
        <div class="data-line">🌱 <strong>Planta:</strong> ${plantData ? plantData.name : '---'}</div>
        <div class="data-line">💧 <strong>Humedad tierra:</strong> ${data.suelo[index] || '---'}%</div>
        <div class="data-line">🌡️ <strong>Temperatura:</strong> ${data.temp}°C</div>
        <div class="data-line">💨 <strong>Humedad aire:</strong> ${data.hum}%</div>
        <div class="data-line">💦 <strong>Nivel agua:</strong> ${data.agua}L</div>
    `;

    infoContent.innerHTML = content;
    infoPanel.classList.add('active');

    // Posicionar el panel sobre el rectángulo (ajustado para responsive)
    const rect = rectElement.getBoundingClientRect();
    const panelWidth = 280;
    
    // En móvil, centrar el panel
    if (window.innerWidth <= 640) {
        infoPanel.style.left = '50%';
        infoPanel.style.top = '50%';
        infoPanel.style.transform = 'translate(-50%, -50%)';
    } else {
        infoPanel.style.transform = 'none';
        infoPanel.style.left = (rect.left + rect.width / 2 - panelWidth / 2) + 'px';
        infoPanel.style.top = (rect.top - 80) + 'px';
    }
}


// ==================== CONEXIÓN CON ARDUINO ====================
function conectarArduino(comPort) {
    const btn = document.getElementById('btnConectar');
    btn.disabled = true;
    document.getElementById('loading').classList.add('active');
    document.getElementById('connectionModal').classList.remove('active');

    fetch('/api/connect-arduino', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ port: `COM${comPort}` })
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('loading').classList.remove('active');
            if (data.success) {
                alert('✅ Arduino conectado correctamente');
                state.connected = true;
                btn.textContent = 'Desconectar';
                btn.classList.remove('conectar-btn');
                btn.classList.add('desconectar-btn');
            } else {
                alert('❌ Error: ' + data.message);
                btn.disabled = false;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('❌ Error al conectar con Arduino');
            document.getElementById('loading').classList.remove('active');
            btn.disabled = false;
        });
}


// ==================== WEBSOCKET ====================
function setupWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            state.serialData.temp = data.temp || '---';
            state.serialData.hum = data.hum || '---';
            state.serialData.agua = data.agua || '---';
            state.serialData.suelo = data.suelo || ['---', '---', '---', '---', '---', '---'];

            if (state.activeInfo !== null) {
                const rectElement = document.querySelector(`[data-index="${state.activeInfo}"]`);
                if (rectElement) {
                    showInfoPanel(state.activeInfo, rectElement);
                }
            }
        } catch (e) {
            console.error('Error procesando datos WebSocket:', e);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket desconectado');
    };
}

// ==================== RENDERIZADO ====================
function render() {
    document.querySelectorAll('.rect-item').forEach((rect, index) => {
        rect.innerHTML = '';
        if (state.rectImages[index]) {
            const img = document.createElement('img');
            img.src = state.rectImages[index].image;
            img.alt = state.rectImages[index].name;
            rect.appendChild(img);
        }
    });
}

// Inicializar
document.addEventListener('DOMContentLoaded', init);