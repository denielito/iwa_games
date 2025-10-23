// 🔹 Tamaño base de diseño (ajusta según tu medida real)
const BASE_WIDTH = 1366;
const BASE_HEIGHT = 651;

// 🔹 Porcentaje mínimo antes de mostrar aviso (90%)
const MIN_RATIO = 0.97;
const overlay = document.getElementById('resizeOverlay');

function scaleInterface() {
    const root = document.getElementById('root');
    if (!root) return;

    // Escala proporcional al tamaño actual
    const scaleX = window.innerWidth / BASE_WIDTH;
    const scaleY = window.innerHeight / BASE_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    root.style.transform = `scale(${scale})`;
    root.style.transformOrigin = 'top left';
}

function checkWindowSize() {
    const MIN_WIDTH = BASE_WIDTH * MIN_RATIO;
    const MIN_HEIGHT = BASE_HEIGHT * MIN_RATIO;

    if (window.innerWidth < MIN_WIDTH || window.innerHeight < MIN_HEIGHT) {
        overlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } else {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';

        // ⚡ Redibuja líneas solo si ya hay algo cargado

        if (typeof restoreAllLines === 'function') {
            restoreAllLines();
        }
    }
}

window.addEventListener('resize', () => {
    scaleInterface();
    checkWindowSize();
});

window.addEventListener('load', () => {
    scaleInterface();
    checkWindowSize();
});