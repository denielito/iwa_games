document.addEventListener("DOMContentLoaded", function () {
    // Crear el modal de bienvenida
    const welcomeOverlay = document.createElement("div");
    welcomeOverlay.classList.add("instructions-overlay", "show");
    welcomeOverlay.innerHTML = `
        <div class="instructions-modal">
            <h2>¡Bienvenido al Ecoinvernadero!</h2>
            <p>En esta simulación, aprenderás a <span class="highlight">conectar y programar tu Arduino</span> con diferentes componentes electrónicos.</p>
            <p>Tu misión es crear un <span class="highlight">sistema automatizado de riego</span> para tu invernadero inteligente.</p>
            <p>¡Prepárate para convertirte en un experto en IoT agrícola!</p>
            <button class="instructions-btn" id="startGame">Comenzar</button>
        </div>
    `;
    document.body.appendChild(welcomeOverlay);

    // Cuando el usuario haga clic en "Comenzar"
    document.getElementById("startGame").addEventListener("click", function () {
        welcomeOverlay.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(welcomeOverlay);
            showInstructions();
        }, 400);
    });

    function showInstructions() {
        const instructionsOverlay = document.createElement("div");
        instructionsOverlay.classList.add("instructions-overlay", "show");
        instructionsOverlay.innerHTML = `
            <div class="instructions-modal">
                <h2>Instrucciones</h2>
                <p>Para comenzar, selecciona los componentes del <span class="highlight">panel lateral izquierdo</span> para ubicarlos en tu espacio de trabajo.</p>
                <p>Una vez ubicados todos los componentes, podrás conectarlos entre sí.</p>
                <div class="component-list">
                    <p>📡 Sensor Ultrasónico</p>
                    <p>💧 Higrómetro</p>
                    <p>⚡ Relé</p>
                    <p>🌡️ DHT11</p>
                    <p>💦 Bomba de Agua</p>
                    <p>🔌 Protoboard</p>
                </div>
                <p><span class="highlight">Click derecho</span> sobre un componente para ver su información.</p>
                <button class="instructions-btn" id="startMission">Comenzar Misión</button>
            </div>
        `;
        document.body.appendChild(instructionsOverlay);

        // Cuando el usuario haga clic en "Comenzar Misión"
        document.getElementById("startMission").addEventListener("click", function () {
            instructionsOverlay.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(instructionsOverlay);
            }, 400);
        });
    }
});