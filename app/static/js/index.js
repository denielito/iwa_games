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

// Manejo del formulario de Login y Registro
document.addEventListener('DOMContentLoaded', () => {
    // Evento para el botón de Login
    const loginBtn = document.querySelector('#loginTab .submit-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await manejarLogin();
        });
    }

    // Evento para el botón de Registro
    const registerBtn = document.querySelector('#registerTab .submit-btn');
    if (registerBtn) {
        registerBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await manejarRegistro();
        });
    }
});

// Función para manejar el registro
async function manejarRegistro() {
    const nombre = document.getElementById('registerName').value.trim();
    const apodo = document.getElementById('registerUser').value.trim();
    const contraseña = document.getElementById('registerPassword').value;

    if (!nombre || !apodo || !contraseña) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const response = await fetch('/api/auth/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                apodo: apodo,
                contraseña: contraseña
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('¡Registro exitoso! Ahora inicia sesión');
            // Limpiar formulario
            document.getElementById('registerName').value = '';
            document.getElementById('registerUser').value = '';
            document.getElementById('registerPassword').value = '';
            // Cambiar a tab de login
            document.querySelector('[data-tab="login"]').click();
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Intenta de nuevo.');
    }
}

// Función para manejar el login
async function manejarLogin() {
    const apodo = document.getElementById('loginUser').value.trim();
    const contraseña = document.getElementById('loginPassword').value;

    if (!apodo || !contraseña) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const response = await fetch('/api/auth/ingreso', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                apodo: apodo,
                contraseña: contraseña
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`¡Bienvenido ${data.nombre}!`);
            // Limpiar formulario
            document.getElementById('loginUser').value = '';
            document.getElementById('loginPassword').value = '';
            // Cerrar modal
            modal.classList.remove('active');
            // Mostrar juegos después del login
            setTimeout(() => {
                document.querySelector('.btn-jugar').click();
            }, 500);
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión. Intenta de nuevo.');
    }
}

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

            const nombreJuego = juego.html.replace('.html', '');

            gameCard.innerHTML = `
                <img src="${juego.portada}" alt="${juego.nombre}" class="game-image">
                <div class="game-name">${juego.nombre}</div>
                <div class="game-description-overlay">${juego.descripcion}</div>
            `;

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