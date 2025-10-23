let sidebarVisible = true;
const usedComponents = new Set();
const connections = [];
let isDrawingConnection = false;
let connectionStart = null;
let tempLine = null;

let savedConnections = [];
let savedFixedLines = [];
let savedComponentLines = [];

// ✅ Variables de estado del panel de pasos
let completedConnections = new Set();
let currentStep = 1;
let currentA = null;
let currentB = null;

const componentInfo = {
    arduino: {
        name: 'Arduino',
        description: 'El núcleo de tu misión, el cerebro que controla todo el sistema.',
        specs: 'El Cerebro del Operativo, ¡Es tu comandante en esta aventura tecnológica!'
    },
    ultrasonido: {
        name: 'Sensor Ultrasónico',
        description: 'Tu guardián, siempre alerta. Mide distancias usando ondas sonoras.',
        specs: 'El Vigilante Silencioso, ¡Es tu radar personal en esta misión!'
    },
    higrometro: {
        name: 'Higrómetro',
        description: 'Tu detective del agua. Detecta la humedad del suelo y te da información vital para regar.',
        specs: 'El Explorador del Terreno, ¡Es tu sensor de vida en esta aventura!'
    },
    bomba: {
        name: 'Electrobomba',
        description: 'Tu salvadora en tiempos de sequía. Lleva agua a donde más se necesita.',
        specs: 'El Héroe del Riego, ¡Es tu héroe en esta misión!'
    },
    rele: {
        name: 'Módulo Rele',
        description: 'Tu protector. Controla dispositivos de alto voltaje con señales de bajo voltaje.',
        specs: 'El Guardián de la Energía, ¡Es tu escudo energético!'
    },
    dht11: {
        name: 'DHT11',
        description: 'Tu agente doble en el campo. Vigila la temperatura y la humedad del aire simultáneamente.',
        specs: 'El Espía Climático, ¡Es tu meteorólogo personal en esta misión!'
    },
    protoboard: {
        name: 'PROTOBOARD',
        description: 'Tu base de operaciones, el terreno donde todo se conecta. Aquí es donde tu estrategia cobra vida, permitiendo crear y modificar circuitos sin soldaduras.',
        specs: 'El Campo de Batalla, ¡Es el campo donde se forja tu victoria tecnológica!'
    }
};

const canvasFixed = document.getElementById('fixedCanvas');
const ctxFixed = canvasFixed.getContext('2d');
const canvas = document.getElementById('connectionCanvas');
const ctx = canvas.getContext('2d');

function saveAllLines() {
    savedConnections = [];

    connections.forEach(conn => {
        const startPos = getComponentCenter(conn.start);
        const endPos = getComponentCenter(conn.end);
        savedConnections.push({
            color: '#079382',
            width: 3,
            path: [
                { x: (startPos.x / canvas.width) * 100, y: (startPos.y / canvas.height) * 100 },
                { x: (endPos.x / canvas.width) * 100, y: (endPos.y / canvas.height) * 100 }
            ]
        });
    });

    if (jsonData && jsonData.connect_5v_gnd) {
        savedFixedLines = jsonData.connect_5v_gnd.map(line => ({ ...line }));
    }
}

function restoreAllLines() {
    const totalComponents = document.querySelectorAll('.placed-component').length;
    const activeComponents = document.querySelectorAll('.placed-component.active').length;
    const allActive = activeComponents === totalComponents;

    if (savedConnections.length > 0) {
        savedConnections.forEach(line => {
            const points = line.path.map(p => ({
                x: (parseFloat(p.x) / 100) * canvas.width,
                y: (parseFloat(p.y) / 100) * canvas.height
            }));

            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
            ctx.strokeStyle = line.color;
            ctx.lineWidth = line.width;
            ctx.stroke();
        });
    }

    if (allActive && savedFixedLines.length > 0) {
        savedFixedLines.forEach(line => {
            const points = line.path.map(p => ({
                x: (parseFloat(p.x) / 100) * canvasFixed.width,
                y: (parseFloat(p.y) / 100) * canvasFixed.height
            }));

            ctxFixed.beginPath();
            ctxFixed.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctxFixed.lineTo(points[i].x, points[i].y);
            }
            ctxFixed.strokeStyle = line.color;
            ctxFixed.lineWidth = line.width;
            ctxFixed.stroke();
        });
        console.log("🔋 Líneas fijas restauradas (todos activos).");
    } else if (!allActive) {
        console.log("⏸️ No se restauran las líneas fijas: aún hay componentes grises.");
    }

    if (savedComponentLines.length > 0) {
        savedComponentLines.forEach(line => {
            const points = line.path.map(p => ({
                x: (parseFloat(p.x) / 100) * canvasFixed.width,
                y: (parseFloat(p.y) / 100) * canvasFixed.height
            }));

            ctxFixed.beginPath();
            ctxFixed.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                ctxFixed.lineTo(points[i].x, points[i].y);
            }
            ctxFixed.strokeStyle = line.color;
            ctxFixed.lineWidth = line.width;
            ctxFixed.stroke();
        });

        console.log("✅ Líneas de connect_components restauradas tras resize");
    }
}

let jsonData = null;

fetch('/static/assets/data/connections.json')
    .then(response => response.json())
    .then(data => {
        jsonData = data;
        correctConnections = data.correct_connections || [];
        console.log("Conexiones cargadas:", jsonData);
    })
    .catch(err => console.error("Error cargando connections.json:", err));

function drawFixedConnections() {
    if (!jsonData || !jsonData.connect_5v_gnd) return;

    const totalComponents = document.querySelectorAll('.placed-component').length;
    const activeComponents = document.querySelectorAll('.placed-component.active').length;
    if (activeComponents < totalComponents) {
        console.log("⏸️ Aún hay componentes grises, no se dibujan las líneas de poder.");
        return;
    }

    if (drawFixedConnections.hasDrawn) return;
    drawFixedConnections.hasDrawn = true;

    jsonData.connect_5v_gnd.forEach(line => {
        const points = line.path.map(p => ({
            x: (parseFloat(p.x) / 100) * canvasFixed.width,
            y: (parseFloat(p.y) / 100) * canvasFixed.height
        }));

        ctxFixed.beginPath();
        ctxFixed.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctxFixed.lineTo(points[i].x, points[i].y);
        }
        ctxFixed.strokeStyle = line.color;
        ctxFixed.lineWidth = line.width;
        ctxFixed.stroke();
    });

    console.log("🔋 Líneas de alimentación dibujadas (5V y GND)");
}

function resizeCanvas() {
    saveAllLines();

    const container = document.querySelector('.main-container');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    canvasFixed.width = container.offsetWidth;
    canvasFixed.height = container.offsetHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxFixed.clearRect(0, 0, canvasFixed.width, canvasFixed.height);

    restoreAllLines();

    console.log("🎨 Canvas redimensionado y conexiones restauradas");
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('load', resizeCanvas);

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggleBtn');
    const arrow = document.getElementById('arrow');

    sidebarVisible = !sidebarVisible;

    if (sidebarVisible) {
        sidebar.classList.remove('hidden');
        toggleBtn.classList.remove('collapsed');
        arrow.innerHTML = '&#8249;';
    } else {
        sidebar.classList.add('hidden');
        toggleBtn.classList.add('collapsed');
        arrow.innerHTML = '&#8250;';
    }
}

function limpiar() {
    usedComponents.clear();
    document.querySelectorAll('.component-item').forEach(i => i.classList.remove('used'));
    document.querySelectorAll('.placed-component').forEach(c => {
        c.classList.remove('active');
        c.classList.add('grayscale');
    });

    connections.length = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctxFixed.clearRect(0, 0, canvasFixed.width, canvasFixed.height);

    tempLine = null;
    connectionStart = null;
    isDrawingConnection = false;
    drawFixedConnections.hasDrawn = false;

    savedComponentLines = [];
    completedConnections.clear();

    resetearTareas();

    console.log("🧹 Simulación limpiada completamente");
}

function iniciarSimulacion() {
    const activeCount = document.querySelectorAll('.placed-component.active').length;
    if (activeCount === 0) {
        alert('Por favor, activa al menos un componente antes de iniciar la simulación');
        return;
    }
    console.log('Iniciando simulación con ' + activeCount + ' componentes');
    alert('Simulación iniciada con ' + activeCount + ' componentes');
}

function checkScreenSize() {
    if (window.innerWidth <= 768 && sidebarVisible) {
        toggleSidebar();
    }
}

window.addEventListener('resize', checkScreenSize);
window.addEventListener('load', checkScreenSize);

document.querySelectorAll('.component-item').forEach(item => {
    item.addEventListener('click', function () {
        const componentName = this.getAttribute('data-component');

        if (usedComponents.has(componentName)) {
            return;
        }

        usedComponents.add(componentName);
        this.classList.add('used');

        const workspaceComponent = document.getElementById('workspace-' + componentName);
        if (workspaceComponent) {
            workspaceComponent.classList.remove('grayscale');
            workspaceComponent.classList.add('active');
        }
        if (sidebarVisible) {
            toggleSidebar();
        }
        checkAllComponentsActive();

        console.log('Componente activado:', componentName);
    });
});

document.getElementById('workspace').addEventListener('click', function (e) {
    if (isDrawingConnection && !e.target.closest('.placed-component')) {
        isDrawingConnection = false;
        if (connectionStart) {
            connectionStart.style.border = '';
            connectionStart = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawConnections();
        tempLine = null;
        console.log("❌ Conexión cancelada (clic fuera del componente)");
    }
});

document.querySelectorAll('.placed-component').forEach(comp => {
    comp.addEventListener('contextmenu', e => {
        if (isDrawingConnection) {
            e.preventDefault();
            isDrawingConnection = false;
            if (connectionStart) {
                connectionStart.style.border = '';
                connectionStart = null;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawConnections();
            tempLine = null;
            console.log("❌ Conexión cancelada (clic derecho)");
        }
    });
});

function checkAllComponentsActive() {
    const totalComponents = document.querySelectorAll('.placed-component').length;
    const activeComponents = document.querySelectorAll('.placed-component.active').length;

    if (activeComponents === totalComponents) {
        console.log("✅ Todos los componentes están activos. Se dibujan líneas de poder.");
        drawFixedConnections();
    } else {
        console.log(`🕓 Faltan ${totalComponents - activeComponents} componentes por activar.`);
    }
}

document.querySelectorAll('.placed-component').forEach(component => {
    component.addEventListener('contextmenu', function (e) {
        e.preventDefault();

        if (!this.classList.contains('active')) return;

        const componentName = this.getAttribute('data-component');
        showInfoPanel(componentName);
    });

    component.addEventListener('click', function (e) {
        if (!this.classList.contains('active')) return;

        const allActive = document.querySelectorAll('.placed-component.active').length === 7;
        if (!allActive) return;

        if (!isDrawingConnection) {
            isDrawingConnection = true;
            connectionStart = this;
            this.style.border = '3px solid #079382';
        } else {
            if (this !== connectionStart) {
                const componentEnd = this;
                drawTempLine(connectionStart, componentEnd);
                showConfirmModal(connectionStart, componentEnd);
            }
            connectionStart.style.border = '';
            connectionStart = null;
            isDrawingConnection = false;
        }
    });
});

function showInfoPanel(componentName) {
    const panel = document.getElementById('infoPanel');
    const title = document.getElementById('infoPanelTitle');
    const content = document.getElementById('infoPanelContent');

    const info = componentInfo[componentName];

    title.textContent = info.name;
    content.innerHTML = `
                <p>${info.description}</p>
                <p>${info.specs}</p>
            `;

    panel.classList.add('show');
}

function closeInfoPanel() {
    document.getElementById('infoPanel').classList.remove('show');
}

function getComponentCenter(component) {
    const rect = component.getBoundingClientRect();
    const containerRect = document.querySelector('.main-container').getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top
    };
}

function drawTempLine(start, end) {
    const startPos = getComponentCenter(start);
    const endPos = getComponentCenter(end);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawConnections();

    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
    ctx.lineTo(endPos.x, endPos.y);
    ctx.strokeStyle = '#FEDF59';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.stroke();
    ctx.setLineDash([]);

    tempLine = { start, end };
}

function drawComponentConnectionFixed(connData) {
    const drawSinglePath = (path) => {
        const points = path.map(p => ({
            x: (parseFloat(p.x) / 100) * canvasFixed.width,
            y: (parseFloat(p.y) / 100) * canvasFixed.height
        }));

        ctxFixed.beginPath();
        ctxFixed.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctxFixed.lineTo(points[i].x, points[i].y);
        }
        ctxFixed.strokeStyle = connData.color || "#079382";
        ctxFixed.lineWidth = connData.width || 3;
        ctxFixed.stroke();
    };

    if (connData.paths) {
        connData.paths.forEach(drawSinglePath);
    } else if (connData.path) {
        drawSinglePath(connData.path);
    }
}

function showConfirmModal(start, end) {
    const modal = document.getElementById('confirmModal');
    const message = document.getElementById('confirmMessage');

    const startName = componentInfo[start.getAttribute('data-component')].name;
    const endName = componentInfo[end.getAttribute('data-component')].name;

    message.textContent = `¿Desea conectar ${startName} con ${endName}?`;
    modal.classList.add('show');
}

let correctConnections = [];

fetch('/static/assets/data/connections.json')
    .then(response => response.json())
    .then(data => {
        correctConnections = data.correct_connections || [];
        console.log('Conexiones válidas cargadas:', correctConnections);
    })
    .catch(err => console.error('Error cargando conexiones.json:', err));

function confirmConnection(confirmed) {
    const modal = document.getElementById('confirmModal');
    modal.classList.remove('show');

    if (confirmed && tempLine) {
        const start = tempLine.start.getAttribute('data-component');
        const end = tempLine.end.getAttribute('data-component');

        const isCorrect =
            correctConnections.some(
                conn =>
                    (conn[0] === start && conn[1] === end) ||
                    (conn[0] === end && conn[1] === start)
            );

        if (isCorrect) {
            openSteps(tempLine.start, tempLine.end);
            const otherComponent = start === "arduino" ? end : start;

            marcarTareaCompletada(otherComponent);
        } else {
            showErrorModal(`La conexión entre ${start} y ${end} no es válida.`);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawConnections();
            tempLine = null;
        }
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawConnections();
        tempLine = null;
    }
}

function redrawConnections() {
    connections.forEach(conn => {
        const startPos = getComponentCenter(conn.start);
        const endPos = getComponentCenter(conn.end);

        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.strokeStyle = '#079382';
        ctx.lineWidth = 3;
        ctx.stroke();
    });
}

document.getElementById('infoPanel').addEventListener('click', function (e) {
    if (e.target === this) {
        closeInfoPanel();
    }
});

function openSteps(start, end) {
    currentA = start.getAttribute('data-component');
    currentB = end.getAttribute('data-component');

    // ✅ Verificar que todos los elementos existen
    const stepsPanel = document.getElementById('connectionSteps');
    const compNameTitle = document.getElementById('compNameTitle');
    const compNameTitleO = document.getElementById('compNameTitleO');
    const connectionText = document.getElementById('connectionText');

    if (!stepsPanel || !compNameTitle || !connectionText) {
        console.error("❌ Error: Elementos del panel no encontrados");
        return;
    }

    // Determinar paso inicial
    currentStep = completedConnections.size === 0 ? 1 : 2;

    console.log(`🔄 Abriendo pasos. Conexiones: ${completedConnections.size}, Paso: ${currentStep}`);
    console.log(completedConnections.size);
    const nonArduinoComp = (currentA.toLowerCase() === "arduino") ? currentB : currentA;

    // Actualizar título
    compNameTitle.textContent = componentInfo[currentB].name;
    compNameTitleO.textContent = componentInfo[currentA].name;

    // Actualizar imágenes
    const img1 = document.getElementById('img1');
    const img2 = document.getElementById('img2');
    const img3 = document.getElementById('img3');
    const img4 = document.getElementById('img4');

    if (img1) img1.src = `/static/assets/sprites/componentes/ide.PNG`;
    if (img2) img2.src = `/static/assets/sprites/componentes/${nonArduinoComp}/2.png`;
    if (img3) img3.src = `/static/assets/sprites/componentes/${nonArduinoComp}/3.png`;
    if (img4) img4.src = `/static/assets/sprites/componentes/code/${completedConnections.size}.png`;

    // Actualizar texto de conexión
    let connectionMessage = "";
    switch (nonArduinoComp) {
        case "dht11":
            connectionMessage = "Data en el pin 9";
            break;
        case "ultrasonido":
            connectionMessage = "Echo en el pin 10, Trigger en el pin 11";
            break;
        case "bomba":
            connectionMessage = "Conéctala en el pin 8";
            break;
        case "higrometro":
            connectionMessage = "Conéctalo en el pin A0";
            break;
        case "rele":
            connectionMessage = "Conéctalo en el pin 7";
            break;
        default:
            connectionMessage = "Conecta los pines según las indicaciones.";
    }
    connectionText.textContent = connectionMessage;

    // ✅ Activar el paso correcto
    const allSteps = document.querySelectorAll('.step');
    allSteps.forEach((step, index) => {
        if (index + 1 === currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Actualizar botones
    updateStepButtons();

    // Mostrar panel
    stepsPanel.classList.add('show');

    console.log(`✅ Panel abierto en paso ${currentStep}`);
}

function closeSteps() {
    document.getElementById('connectionSteps').classList.remove('show');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawConnections();
    tempLine = null;
}

function showErrorModal(msg) {
    const modal = document.getElementById('errorModal');
    document.getElementById('errorMessage').textContent = msg;
    modal.classList.add('show');
}

function closeErrorModal() {
    document.getElementById('errorModal').classList.remove('show');
}

function nextStep() {
    if (currentStep < 4) {
        currentStep++;
        updateSteps();
    }
}

function prevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateSteps();
    }
}

function updateSteps() {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index + 1 === currentStep);
    });

    const container = document.getElementById('stepsContainer');
    if (container) {
        container.classList.remove('fade-in');
        void container.offsetWidth;
        container.classList.add('fade-in');
    }

    updateStepButtons();

    console.log(`📍 Paso actualizado a: ${currentStep}`);
}

function updateStepButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const confirmBtn = document.getElementById('confirmBtn');

    if (prevBtn) prevBtn.classList.toggle('hidden', currentStep === 1);
    if (nextBtn) nextBtn.classList.toggle('hidden', currentStep === 4);
    if (confirmBtn) confirmBtn.classList.toggle('hidden', currentStep !== 4);
}

function drawComponentConnection(connData) {
    const points = connData.path.map(p => ({
        x: (parseFloat(p.x) / 100) * canvas.width,
        y: (parseFloat(p.y) / 100) * canvas.height
    }));

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = connData.color || "#079382";
    ctx.lineWidth = connData.width || 3;
    ctx.stroke();
}

function confirmFinal() {
    if (!tempLine || !jsonData) {
        console.error("❌ Error: tempLine o jsonData no disponible");
        return;
    }

    const compA = currentA;
    const compB = currentB;
    const key1 = `${compA}-${compB}`;
    const key2 = `${compB}-${compA}`;

    console.log(`🔍 Buscando conexión: ${key1} o ${key2}`);

    const connData = jsonData.connect_components[key1] || jsonData.connect_components[key2];

    if (connData) {
        drawComponentConnectionFixed(connData);

        const keyToSave = key1 in jsonData.connect_components ? key1 : key2;
        completedConnections.add(keyToSave);

        savedComponentLines.push({ ...connData });

        console.log(`✅ Conexión completada: ${keyToSave}`);
        console.log(`📊 Total conexiones: ${completedConnections.size}/${jsonData.correct_connections.length}`);
    } else {
        console.warn("⚠️ No se encontró la conexión en connect_components:", key1, key2);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawConnections();
    drawFixedConnections();

    tempLine = null;

    const stepsPanel = document.getElementById('connectionSteps');
    if (stepsPanel) {
        stepsPanel.classList.remove('show');
    }

    // ✅ Solo resetear las variables de componente
    currentA = null;
    currentB = null;

    if (completedConnections.size === jsonData.correct_connections.length) {
        console.log("🎉 ¡Todas las conexiones correctas han sido completadas!");

        // 🔹 Mostrar el panel de éxito
        const overlay = document.getElementById('statusOverlay');
        const panel = document.getElementById('statusPanel');
        const title = document.getElementById('statusTitle');
        const message = document.getElementById('statusMessage');
        const continueBtn = document.getElementById('continueBtn');

        title.textContent = "LO HAS LOGRADO";
        message.textContent = "¡Lo has logrado!\nAhora ve a presionar 'Iniciar'";
        continueBtn.classList.add('hidden'); // No mostrar el botón de continuar

        overlay.classList.add('show');
        setTimeout(() => panel.classList.add('show'), 50);
    }

}

function iniciarSimulacion() {
    // 🔹 Cierra el sidebar si está visible
    const sidebar = document.getElementById('sidebar');
    if (!sidebar.classList.contains('hidden')) toggleSidebar();

    // 🔹 Contar las conexiones completadas
    const totalConnections = completedConnections.size;

    // 🔹 Elementos del modal
    const overlay = document.getElementById('statusOverlay');
    const panel = document.getElementById('statusPanel');
    const title = document.getElementById('statusTitle');
    const message = document.getElementById('statusMessage');
    const continueBtn = document.getElementById('continueBtn');

    // 🔹 Mensaje según cantidad de conexiones
    if (totalConnections < 4) {
        title.textContent = "NO TE DESANIMES";
        message.textContent = "¡Ánimo, aún hay conexiones por hacer!";
        continueBtn.classList.add('hidden');
    } else {
        title.textContent = "OBJETIVO CUMPLIDO";
        message.textContent = "¿Estás listo para monitorear tu invernadero?\nPresiona Continuar.";
        continueBtn.classList.remove('hidden');
    }

    // 🔹 Mostrar modal y animar apertura
    overlay.classList.add('show');
    setTimeout(() => panel.classList.add('show'), 50);
}

// 🔹 Cerrar el panel y el fondo modal
function closeStatusPanel() {
    const overlay = document.getElementById('statusOverlay');
    const panel = document.getElementById('statusPanel');
    panel.classList.remove('show');
    setTimeout(() => overlay.classList.remove('show'), 300);
}


function marcarTareaCompletada(componente) {
    const tarea = document.querySelector(`#taskList li[data-task="${componente}"]`);
    if (tarea) {
        tarea.classList.add("completed");
    }
}

function resetearTareas() {
    document.querySelectorAll('#taskList li').forEach(t => t.classList.remove('completed'));
    console.log("🔄 Tareas reiniciadas");
}


// static/js/simulacion.js
function goToMonitor() {
    if (typeof ecoinvernaderoUrl === 'undefined') {
        console.error("❌ La URL del ecoinvernadero no está definida. Verifica el template conectar.html.");
        alert("Error: No se pudo obtener la ruta del monitor.");
        return;
    }

    console.log("🔗 Redirigiendo a:", ecoinvernaderoUrl);
    window.location.href = ecoinvernaderoUrl;
}
