const modal = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const gamesContainer = document.getElementById('gamesContainer');
const loginContainer = document.getElementById('loginContainer');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Botón Jugar
document.querySelector('.btn-jugar').addEventListener('click', async () => {
    gamesContainer.style.display = 'block';
    loginContainer.style.display = 'none';
    modal.classList.add('active');
    await renderGames();
});

// Botón Ingresar
document.querySelector('.btn-ingresar').addEventListener('click', () => {
    loginContainer.style.display = 'flex';
    gamesContainer.style.display = 'none';
    modal.classList.add('active');
});

// Botón Salir
document.querySelector('.btn-salir').addEventListener('click', () => {
    window.location.href = 'https://www.iwaingenieria.com/';
});

// Cerrar Modal
closeModalBtn.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});

// Tabs Login/Register
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(tabName + 'Tab').classList.add('active');
    });
});

// Renderizar Juegos desde JSON
async function renderGames() {
    try {
        const response = await fetch("/static/assets/data/juegos.json");
        const data = await response.json();
        const juegos = data.juegos;

        gamesContainer.innerHTML = '<div class="games-grid"></div>';
        const grid = gamesContainer.querySelector('.games-grid');

        juegos.forEach(juego => {
            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            // Obtener el nombre del archivo sin extensión
            const nombreJuego = juego.html.replace('.html', '');

            gameCard.innerHTML = `
                <img src="${juego.portada}" alt="${juego.nombre}" class="game-image">
                <div class="game-name">${juego.nombre}</div>
                <div class="game-description-overlay">${juego.descripcion}</div>
            `;

            // Añadir evento de clic para navegar al juego
            gameCard.addEventListener('click', () => {
                window.location.href = `/${nombreJuego}`;
            });

            gameCard.style.cursor = 'pointer';
            grid.appendChild(gameCard);
        });
    } catch (error) {
        console.error("Error al cargar los juegos:", error);
        gamesContainer.innerHTML = "<p>Error al cargar los juegos.</p>";
    }
}