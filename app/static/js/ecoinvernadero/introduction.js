document.addEventListener("DOMContentLoaded", function () {

    // 🔹 Crear el panel de bienvenida
    const welcomeOverlay = document.createElement("div");
    welcomeOverlay.classList.add("instructions-overlay", "show");
    welcomeOverlay.innerHTML = `
        <div class="instructions-modal">
            <h2>🌱 ¡Bienvenido al Monitor del Invernadero!</h2>
            <p>Ya has llevado a cabo la <span class="highlight">misión de conectar</span>.</p>
            <p>Ahora prepárate para <span class="highlight">monitorear tu invernadero</span> y conocer cómo se sienten tus plantas.</p>
            <button class="instructions-btn" id="nextInstruction">Continuar</button>
        </div>
    `;
    document.body.appendChild(welcomeOverlay);

    // 🔹 Cuando el usuario presiona “Continuar”
    document.getElementById("nextInstruction").addEventListener("click", function () {
        welcomeOverlay.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(welcomeOverlay);
            showNextInstructions();
        }, 400);
    });

    // 🔹 Segundo panel de instrucción
    function showNextInstructions() {
        const instructionOverlay = document.createElement("div");
        instructionOverlay.classList.add("instructions-overlay", "show");
        instructionOverlay.innerHTML = `
            <div class="instructions-modal">
                <h2>🌿 Preparación del monitoreo</h2>
                <p>Acomoda tu <span class="highlight">maceta</span> y conéctale el <span class="highlight">higrómetro</span> para saber cómo se siente tu planta.</p>
                <p>Podrás observar los valores de humedad en tiempo real y actuar si tu planta necesita agua.</p>
                <button class="instructions-btn" id="startMonitor">Comenzar Monitoreo</button>
            </div>
        `;
        document.body.appendChild(instructionOverlay);

        // 🔹 Cuando el usuario hace clic en “Comenzar Monitoreo”
        document.getElementById("startMonitor").addEventListener("click", function () {
            instructionOverlay.classList.remove("show");
            setTimeout(() => {
                document.body.removeChild(instructionOverlay);
            }, 400);
        });
    }
});
