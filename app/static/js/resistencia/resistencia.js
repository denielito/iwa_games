// ==================== CONFIGURACIÓN ====================
// Eliminamos las dimensiones fijas y usaremos el viewport completo
let GAME_WIDTH = window.innerWidth;
let GAME_HEIGHT = window.innerHeight;

const FPS = 60;

// Colores
const COLORS = {
    VERDE_PETROLEO: '#1a8055',
    BEIGE: '#d4c5a9',
    PLAYER_BROWN: 'rgb(139, 69, 19)',
    BLACK: '#000000',
    ELECTRON_YELLOW: '#ffff00',
    LED_BONUS: '#00ffff',
    WHITE: '#ffffff',
    LANE_GRAY: 'rgb(180, 140, 100)',
    PANEL_BLUE: '#1a1a2e',
    GOLD: '#ffd700',
    GRAY: 'rgb(170, 170, 170)',
    LED_RED: '#ff0000',
    DARK_CABLE: 'rgb(20, 20, 25)',
    TURQUESA: '#1FC9BA'
};

const CABLE_COLORS = [
    'rgb(0, 100, 255)',    // Azul
    'rgb(255, 50, 50)',    // Rojo
    'rgb(50, 200, 50)',    // Verde
    'rgb(255, 140, 0)'     // Naranja
];

const GameState = {
    MENU: 1,
    PLAYING: 2,
    GAME_OVER: 3
};

// ==================== CLASES ====================
class Notification {
    constructor(text, x, y, scaleFactor) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.timer = 120;
        this.alpha = 1;
        this.scaleFactor = scaleFactor;
    }

    update() {
        this.timer -= 1;
        this.alpha = Math.max(0, this.timer / 120);
        return this.timer > 0;
    }
}

class Electron {
    constructor(x, y, lane, level, gameHeight, gameWidth, scaleFactor) {
        this.initialX = x;
        this.initialY = y;
        this.x = x;
        this.y = y;
        this.lane = lane;
        this.voltage = 5.0;
        this.speed = 1 + level * 0.2;
        this.radius = 15 * scaleFactor;
        this.gameHeight = gameHeight;
        this.gameWidth = gameWidth;
        this.colliding = false;
        this.scaleFactor = scaleFactor;
    }

    update(gameSpeed) {
        this.y += this.speed * gameSpeed;

        const offset = (80 * this.scaleFactor) / this.gameHeight;
        if (this.lane === 0) {
            this.x = this.initialX - (this.y - this.initialY) * offset - (10 * this.scaleFactor);
        } else if (this.lane === 1) {
            this.x = this.initialX;
        } else if (this.lane === 2) {
            this.x = this.initialX + (this.y - this.initialY) * offset + (12 * this.scaleFactor);
        }
    }

    reduceVoltage(gameSpeed) {
        const reductionRate = 0.25 * gameSpeed;
        this.voltage = Math.max(0, this.voltage - reductionRate * (this.voltage / 5));
    }

    draw(ctx, fontSize) {
        ctx.fillStyle = COLORS.ELECTRON_YELLOW;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        if (this.voltage >= 3.0 && this.voltage <= 3.3) {
            ctx.strokeStyle = COLORS.LED_BONUS;
            ctx.lineWidth = 3 * this.scaleFactor;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + (2 * this.scaleFactor), 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = COLORS.WHITE;
        ctx.font = `bold ${fontSize * this.scaleFactor}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.voltage.toFixed(1) + 'V', this.x, this.y - (25 * this.scaleFactor));
    }
}

class Player {
    constructor(lanes, gameX, gameY, gameHeight, gameWidth, scaleFactor) {
        this.lanes = lanes;
        this.gameX = gameX;
        this.gameY = gameY;
        this.lane = 1;
        this.targetLane = 1;
        this.scaleFactor = scaleFactor;

        this.width = gameWidth * 0.09;
        this.height = gameHeight * 0.09;

        this.y = this.gameY + gameHeight * 0.68;
        this.x = this.lanes[this.lane];
        this.targetX = this.x;

        this.moveSpeed = 8 * scaleFactor;
        this.gameHeight = gameHeight;
        this.gameWidth = gameWidth;
    }

    moveUp() {
        if (this.targetLane > 0) {
            this.targetLane -= 1;
            this.updateTargetPosition();
        }
    }

    moveDown() {
        if (this.targetLane < 2) {
            this.targetLane += 1;
            this.updateTargetPosition();
        }
    }

    updateTargetPosition() {
        const offset = (80 * this.scaleFactor) / 680;

        if (this.targetLane === 0) {
            this.targetX = this.lanes[0] - (this.y - this.gameY) * offset - (10 * this.scaleFactor);
        } else if (this.targetLane === 1) {
            this.targetX = this.lanes[1];
        } else if (this.targetLane === 2) {
            this.targetX = this.lanes[2] + (this.y - this.gameY) * offset + (27 * this.scaleFactor);
        }
    }

    updatePosition() {
        if (Math.abs(this.x - this.targetX) > 0.5) {
            this.x += (this.targetX - this.x) * 0.2;
        } else {
            this.x = this.targetX;
            this.lane = this.targetLane;
        }
        this.updateTargetPosition();
    }

    draw(ctx) {
        const x = this.x - this.width / 2;
        const y = this.y - this.height / 2;

        ctx.fillStyle = COLORS.PLAYER_BROWN;
        ctx.fillRect(x, y, this.width, this.height);

        const stripeWidth = this.width * 0.125;
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(x + this.width * 0.125, y + this.height * 0.1, stripeWidth, this.height * 0.8);
        ctx.fillRect(x + this.width * 0.625, y + this.height * 0.1, stripeWidth, this.height * 0.8);

        ctx.strokeStyle = COLORS.GOLD;
        ctx.lineWidth = 2 * this.scaleFactor;
        ctx.strokeRect(x, y, this.width, this.height);
    }
}

class ResistenciaOhm {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.resize();
        
        // Escala para mantener proporciones en diferentes pantallas
        this.scaleFactor = Math.min(this.WIDTH, this.HEIGHT) / 800;

        this.cableColor = CABLE_COLORS[Math.floor(Math.random() * CABLE_COLORS.length)];

        this.player = new Player(this.lanes, this.gameX, this.gameY, this.gameHeight, this.gameWidth, this.scaleFactor);
        this.electrons = [];
        this.notifications = [];

        this.points = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1.0;
        this.state = GameState.MENU;

        this.spawnTimer = 0;
        this.currentSpawnInterval = 360;
        this.minSpawnInterval = 60;
        this.spawnReductionPerLevel = 30;

        this.ledBonusEffect = 0;
        this.bossY = this.gameY + this.gameHeight * 0.1;
        this.bossLane = 1;
        this.bossRadius = 25 * this.scaleFactor;

        // Touch controls
        this.touchStartX = 0;
        this.touchActive = false;

        this.updateSpawnInterval();
        this.setupEventListeners();
        
        // Agregar listener para redimensionamiento
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        // Actualizar dimensiones del canvas
        this.WIDTH = window.innerWidth;
        this.HEIGHT = window.innerHeight;
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        
        // Recalcular factor de escala
        this.scaleFactor = Math.min(this.WIDTH, this.HEIGHT) / 800;
        
        // Recalcular dimensiones del juego
        this.gameWidth = this.WIDTH * 0.4;
        this.gameHeight = this.HEIGHT * 0.8;

        this.gameX = (this.WIDTH - this.gameWidth) * 0.5;
        this.gameY = (this.HEIGHT - this.gameHeight) * 0.5;

        const centerX = this.gameX + this.gameWidth / 2;
        const laneSpacing = this.gameWidth / 3;
        this.lanes = [
            centerX - laneSpacing / 1.5,
            centerX,
            centerX + laneSpacing / 1.5
        ];
        
        // Recrear jugador con nuevas dimensiones
        this.player = new Player(this.lanes, this.gameX, this.gameY, this.gameHeight, this.gameWidth, this.scaleFactor);
        
        // Recalcular radio del jefe
        this.bossRadius = 25 * this.scaleFactor;
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), false);
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), false);
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), false);
    }

    handleKeyDown(e) {
        if (this.state === GameState.PLAYING) {
            // Izquierda: A, Q, ArrowLeft
            if (['a', 'A', 'q', 'Q', 'ArrowLeft'].includes(e.key)) {
                this.player.moveUp();
            }
            // Derecha: D, ArrowRight
            else if (['d', 'D', 'ArrowRight'].includes(e.key)) {
                this.player.moveDown();
            }
        } else if (this.state === GameState.GAME_OVER) {
            if (['r', 'R'].includes(e.key)) {
                this.restartGame();
            }
        }
    }

    handleKeyUp(e) {
        // Aquí puedes agregar lógica de liberación de tecla si la necesitas
    }

    handleTouchStart(e) {
        if (this.state !== GameState.PLAYING) return;

        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchActive = true;
        e.preventDefault();
    }

    handleTouchMove(e) {
        if (this.state !== GameState.PLAYING || !this.touchActive) return;
        e.preventDefault();
    }

    handleTouchEnd(e) {
        if (this.state !== GameState.PLAYING || !this.touchActive) return;

        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const diff = touchEndX - this.touchStartX;
        const minSwipeDistance = 30 * this.scaleFactor;

        if (Math.abs(diff) > minSwipeDistance) {
            if (diff < 0) {
                // Deslizó a la izquierda
                this.player.moveUp();
            } else {
                // Deslizó a la derecha
                this.player.moveDown();
            }
        }

        this.touchActive = false;
        e.preventDefault();
    }

    handleClick(e) {
        if (this.state !== GameState.MENU) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (this.HEIGHT / rect.height);

        const buttonX = this.WIDTH / 2 - 80 * this.scaleFactor;
        const buttonY = this.HEIGHT / 2 + 100 * this.scaleFactor;
        const buttonW = 160 * this.scaleFactor;
        const buttonH = 50 * this.scaleFactor;

        if (x >= buttonX && x <= buttonX + buttonW && y >= buttonY && y <= buttonY + buttonH) {
            this.state = GameState.PLAYING;
        }
    }

    showNotification(text) {
        const notif = new Notification(text, this.WIDTH * 0.7, this.HEIGHT * 0.1, this.scaleFactor);
        this.notifications.push(notif);
    }

    updateSpawnInterval() {
        const newInterval = 360 - ((this.level - 1) * this.spawnReductionPerLevel);
        this.currentSpawnInterval = Math.max(newInterval, this.minSpawnInterval);
    }

    spawnElectron() {
        const lane = Math.floor(Math.random() * 3);
        this.bossLane = lane;
        const electron = new Electron(
            this.lanes[lane],
            this.gameY + this.gameHeight * 0.05,
            lane,
            this.level,
            this.gameHeight,
            this.gameWidth,
            this.scaleFactor
        );
        this.electrons.push(electron);
    }

    update() {
        if (this.state !== GameState.PLAYING) return;

        this.player.updatePosition();

        this.spawnTimer -= 1;
        if (this.spawnTimer <= 0) {
            this.spawnElectron();
            this.spawnTimer = this.currentSpawnInterval;
        }

        for (let i = this.electrons.length - 1; i >= 0; i--) {
            const electron = this.electrons[i];
            electron.update(this.gameSpeed);

            const playerRect = {
                x: this.player.x - this.player.width / 2,
                y: this.player.y - this.player.height / 2,
                w: this.player.width,
                h: this.player.height
            };

            const hitbox = {
                x: playerRect.x + playerRect.w * 0.125,
                y: playerRect.y + playerRect.h * 0.125,
                w: playerRect.w * 0.75,
                h: playerRect.h * 0.75
            };

            const electronRect = {
                x: electron.x - electron.radius,
                y: electron.y - electron.radius,
                w: electron.radius * 2,
                h: electron.radius * 2
            };

            if (this.rectCollision(electronRect, hitbox)) {
                electron.colliding = true;
                electron.reduceVoltage(this.gameSpeed);
            } else {
                electron.colliding = false;
            }

            if (electron.y >= this.gameY + this.gameHeight * 0.9167) {
                if (electron.voltage > 3.3) {
                    this.lives--;
                    this.showNotification('¡Sobrecarga de voltaje!');
                } else if (electron.voltage >= 3.0 && electron.voltage <= 3.3) {
                    this.points += 20;
                    this.lives++;
                    this.showNotification('¡BONUS! +1 VIDA, +20 PUNTOS');
                    this.ledBonusEffect = 30;
                } else if (electron.voltage >= 1) {
                    this.points += 10;
                    this.showNotification('+10 PUNTOS');
                } else {
                    this.showNotification('¡Voltaje insuficiente!');
                }

                const newLevel = Math.floor(this.points / 50) + 1;
                if (newLevel > this.level) {
                    this.level = newLevel;
                    this.updateSpawnInterval();
                    this.showNotification(`¡NIVEL ${this.level}!`);
                }

                this.electrons.splice(i, 1);
            }
        }

        this.notifications = this.notifications.filter(n => n.update());

        if (this.ledBonusEffect > 0) this.ledBonusEffect--;

        if (this.lives <= 0) this.state = GameState.GAME_OVER;
    }

    rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.w &&
            rect1.x + rect1.w > rect2.x &&
            rect1.y < rect2.y + rect2.h &&
            rect1.y + rect1.h > rect2.y;
    }

    restartGame() {
        this.electrons = [];
        this.notifications = [];
        this.points = 0;
        this.lives = 3;
        this.level = 1;
        this.gameSpeed = 1;
        this.state = GameState.PLAYING;
        this.spawnTimer = this.currentSpawnInterval;
        this.ledBonusEffect = 0;
        this.cableColor = CABLE_COLORS[Math.floor(Math.random() * CABLE_COLORS.length)];
        this.player.lane = 1;
        this.player.targetLane = 1;
        this.player.x = this.lanes[1];
        this.player.targetX = this.player.x;
        this.updateSpawnInterval();
    }

    drawLanes() {
        const startY = this.gameY;
        const endY = this.gameY + this.gameHeight;
        const offset = 100 * this.scaleFactor;
        const centerX = this.gameX + this.gameWidth / 2;
        const laneSpacing = this.gameWidth / 3;

        const xPositions = [
            centerX - laneSpacing / 1.5,
            centerX,
            centerX + laneSpacing / 1.5
        ];

        this.ctx.strokeStyle = COLORS.LANE_GRAY;
        this.ctx.lineWidth = 6 * this.scaleFactor;

        for (let i = 0; i < xPositions.length; i++) {
            this.ctx.beginPath();
            if (i === 0) {
                this.ctx.moveTo(xPositions[i], startY);
                this.ctx.lineTo(xPositions[i] - offset, endY);
            } else if (i === 1) {
                this.ctx.moveTo(xPositions[i], startY);
                this.ctx.lineTo(xPositions[i], endY);
            } else {
                this.ctx.moveTo(xPositions[i], startY);
                this.ctx.lineTo(xPositions[i] + offset, endY);
            }
            this.ctx.stroke();
        }
    }

    drawCableBorders() {
        const startY = this.gameY;
        const endY = this.gameY + this.gameHeight;
        const leftStartX = this.gameX;
        const leftEndX = this.gameX - 100 * this.scaleFactor;
        const rightStartX = this.gameX + this.gameWidth;
        const rightEndX = this.gameX + this.gameWidth + 100 * this.scaleFactor;

        this.ctx.strokeStyle = this.cableColor;
        this.ctx.lineWidth = 15 * this.scaleFactor;

        this.ctx.beginPath();
        this.ctx.moveTo(leftStartX, startY);
        this.ctx.lineTo(leftEndX, endY);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(rightStartX, startY);
        this.ctx.lineTo(rightEndX, endY);
        this.ctx.stroke();
    }

    drawGameArea() {
        const points = [
            [this.gameX, this.gameY],
            [this.gameX + this.gameWidth, this.gameY],
            [this.gameX + this.gameWidth + 100 * this.scaleFactor, this.gameY + this.gameHeight],
            [this.gameX - 100 * this.scaleFactor, this.gameY + this.gameHeight]
        ];

        this.ctx.fillStyle = COLORS.DARK_CABLE;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i][0], points[i][1]);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawLED() {
        const ledColor = this.ledBonusEffect > 0 ? COLORS.LED_BONUS : COLORS.LED_RED;
        const ledX = this.gameX + this.gameWidth * 0.5;
        const ledY = this.gameY + this.gameHeight * 0.9167;

        this.ctx.fillStyle = ledColor;
        this.ctx.beginPath();
        this.ctx.moveTo(ledX, ledY);
        this.ctx.lineTo(ledX - this.gameWidth * 0.05, ledY + this.gameHeight * 0.05);
        this.ctx.lineTo(ledX + this.gameWidth * 0.05, ledY + this.gameHeight * 0.05);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawBossElectron() {
        const offset = (80 * this.scaleFactor) / this.gameHeight;
        let bossX = this.lanes[this.bossLane];
        if (this.bossLane === 0) bossX -= (this.bossY - this.gameY) * offset;
        else if (this.bossLane === 2) bossX += (this.bossY - this.gameY) * offset;

        this.ctx.fillStyle = COLORS.ELECTRON_YELLOW;
        this.ctx.beginPath();
        this.ctx.arc(bossX, this.bossY, this.bossRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = COLORS.WHITE;
        this.ctx.lineWidth = 2 * this.scaleFactor;
        this.ctx.beginPath();
        this.ctx.arc(bossX, this.bossY, this.bossRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        const eyeRadius = 3 * this.scaleFactor;
        this.ctx.fillStyle = COLORS.BLACK;
        this.ctx.beginPath();
        this.ctx.arc(bossX - 7 * this.scaleFactor, this.bossY - 5 * this.scaleFactor, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(bossX + 7 * this.scaleFactor, this.bossY - 5 * this.scaleFactor, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = COLORS.BLACK;
        this.ctx.lineWidth = 2 * this.scaleFactor;
        this.ctx.beginPath();
        this.ctx.arc(bossX, this.bossY + 3 * this.scaleFactor, 8 * this.scaleFactor, Math.PI, 0);
        this.ctx.stroke();
    }

    drawUI() {
        const scaleFactor = this.scaleFactor;
        const panelW = 220 * scaleFactor;
        const panelH = 130 * scaleFactor;
        const panelX = this.gameX - (panelW + 30 * scaleFactor);
        const panelY = this.gameY + 20 * scaleFactor;
        const cornerRadius = 15 * scaleFactor;

        // Panel con bordes redondeados
        this.roundRect(this.ctx, panelX, panelY, panelW, panelH, cornerRadius, '#FFF7E6');
        this.ctx.strokeStyle = '#1FC9BA';
        this.ctx.lineWidth = 3 * scaleFactor;
        this.ctx.stroke();

        // Título
        this.ctx.fillStyle = '#079382';
        this.ctx.font = `bold ${20 * scaleFactor}px Comic Sans MS`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('📊 Estado', panelX + panelW / 2, panelY + 30 * scaleFactor);

        // Estadísticas
        const stats = [
            `💡 Vidas LED: ${this.lives}`,
            `✨ Puntos: ${this.points}`,
            `🚀 Nivel: ${this.level}`
        ];

        this.ctx.fillStyle = '#06473d';
        this.ctx.font = `${16 * scaleFactor}px Comic Sans MS`;
        let yOffset = panelY + 65 * scaleFactor;
        for (const stat of stats) {
            this.ctx.fillText(stat, panelX + panelW / 2, yOffset);
            yOffset += 25 * scaleFactor;
        }
    }

    drawNotifications() {
        for (const notif of this.notifications) {
            this.ctx.globalAlpha = notif.alpha;

            // Fondo redondeado para la notificación
            const notifW = 260 * notif.scaleFactor;
            const notifH = 50 * notif.scaleFactor;
            const notifX = notif.x - notifW / 2;
            const notifY = notif.y - notifH / 2;

            this.roundRect(this.ctx, notifX, notifY, notifW, notifH, 15 * notif.scaleFactor, '#FFF7E6');
            this.ctx.strokeStyle = '#CEED1B';
            this.ctx.lineWidth = 2 * notif.scaleFactor;
            this.ctx.stroke();

            // Texto de la notificación
            this.ctx.fillStyle = '#079382';
            this.ctx.font = `bold ${20 * notif.scaleFactor}px Comic Sans MS`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(notif.text, notif.x, notif.y + 7 * notif.scaleFactor);

            this.ctx.globalAlpha = 1;
        }
    }

    drawMenu() {
        // Fondo semitransparente
        this.ctx.fillStyle = 'rgba(6, 71, 61, 0.85)';
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        const menuW = 600 * this.scaleFactor;
        const menuH = 400 * this.scaleFactor;
        const menuX = this.WIDTH / 2 - menuW / 2;
        const menuY = this.HEIGHT / 2 - menuH / 2;

        // Panel principal con bordes redondeados
        this.roundRect(this.ctx, menuX, menuY, menuW, menuH, 25 * this.scaleFactor, '#FFF7E6');
        this.ctx.strokeStyle = '#1FC9BA';
        this.ctx.lineWidth = 4 * this.scaleFactor;
        this.ctx.stroke();

        // Título
        this.ctx.fillStyle = '#079382';
        this.ctx.font = `bold ${40 * this.scaleFactor}px Comic Sans MS`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌟 La Magia de la Ley de Ohm 🌟', this.WIDTH / 2, menuY + 60 * this.scaleFactor);

        const rules = [
            '1. Usa A/Q o D/Flechas para moverte ⚡',
            '2. Ajusta el voltaje de los electrones 💡',
            '3. Haz que el LED reciba entre 1V y 3.3V ✨',
            '4. Bonus si logras entre 3.0V y 3.3V 🚀'
        ];

        // Reglas
        this.ctx.fillStyle = '#06473d';
        this.ctx.font = `${20 * this.scaleFactor}px Comic Sans MS`;
        let yOffset = menuY + 110 * this.scaleFactor;
        for (const rule of rules) {
            this.ctx.fillText(rule, this.WIDTH / 2, yOffset);
            yOffset += 40 * this.scaleFactor;
        }

        // Botón de acción
        const btnW = 200 * this.scaleFactor;
        const btnH = 60 * this.scaleFactor;
        const btnX = this.WIDTH / 2 - btnW / 2;
        const btnY = menuY + menuH - 90 * this.scaleFactor;

        this.roundRect(this.ctx, btnX, btnY, btnW, btnH, 15 * this.scaleFactor, '#CEED1B');
        this.ctx.strokeStyle = '#079382';
        this.ctx.lineWidth = 3 * this.scaleFactor;
        this.ctx.stroke();

        this.ctx.fillStyle = '#06473d';
        this.ctx.font = `bold ${24 * this.scaleFactor}px Comic Sans MS`;
        this.ctx.fillText('¡JUGAR AHORA!', this.WIDTH / 2, btnY + 40 * this.scaleFactor);
    }

    drawGameOver() {
        // Fondo oscuro con color institucional
        this.ctx.fillStyle = 'rgba(7, 147, 130, 0.9)';
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        const panelW = 450 * this.scaleFactor;
        const panelH = 300 * this.scaleFactor;
        const panelX = (this.WIDTH - panelW) / 2;
        const panelY = (this.HEIGHT - panelH) / 2;

        // Panel redondeado
        this.roundRect(this.ctx, panelX, panelY, panelW, panelH, 25 * this.scaleFactor, '#FFF7E6');
        this.ctx.strokeStyle = '#1FC9BA';
        this.ctx.lineWidth = 4 * this.scaleFactor;
        this.ctx.stroke();

        // Título Game Over
        this.ctx.fillStyle = '#CEED1B';
        this.ctx.font = `bold ${50 * this.scaleFactor}px Comic Sans MS`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡Oh no! 😢', this.WIDTH / 2, panelY + 70 * this.scaleFactor);

        this.ctx.fillStyle = '#06473d';
        this.ctx.font = `${24 * this.scaleFactor}px Comic Sans MS`;
        this.ctx.fillText('El LED no sobrevivió...', this.WIDTH / 2, panelY + 120 * this.scaleFactor);

        this.ctx.fillStyle = '#079382';
        this.ctx.font = `${28 * this.scaleFactor}px Comic Sans MS`;
        this.ctx.fillText(`Puntaje: ${this.points}`, this.WIDTH / 2, panelY + 170 * this.scaleFactor);

        this.ctx.fillStyle = '#1FC9BA';
        this.ctx.font = `${20 * this.scaleFactor}px Comic Sans MS`;
        this.ctx.fillText('Presiona R para intentarlo de nuevo ✨', this.WIDTH / 2, panelY + 230 * this.scaleFactor);
    }

    // 📐 Función auxiliar para dibujar paneles con bordes redondeados
    roundRect(ctx, x, y, width, height, radius, fillColor) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    draw() {
        this.ctx.fillStyle = COLORS.VERDE_PETROLEO;
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        const panelX = 20 * this.scaleFactor;
        const panelY = 20 * this.scaleFactor;
        const panelW = this.WIDTH - 40 * this.scaleFactor;
        const panelH = this.HEIGHT - 40 * this.scaleFactor;
        this.roundRect(this.ctx, panelX, panelY, panelW, panelH, 30 * this.scaleFactor, COLORS.BEIGE);
        this.ctx.strokeStyle = COLORS.TURQUESA;
        this.ctx.lineWidth = 3 * this.scaleFactor;
        this.ctx.stroke();

        if (this.state === GameState.MENU) {
            this.drawMenu();
            return;
        }

        this.drawGameArea();
        this.drawCableBorders();
        this.drawLanes();
        this.player.draw(this.ctx);
        this.drawLED();
        this.drawBossElectron();

        for (const electron of this.electrons) {
            electron.draw(this.ctx, 14);
        }

        this.drawUI();
        this.drawNotifications();

        if (this.state === GameState.GAME_OVER) {
            this.drawGameOver();
        }
    }
}

// ==================== INICIALIZACIÓN ====================
function initGame() {
    const canvas = document.getElementById('gameCanvas');
    
    // Usar dimensiones del viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const game = new ResistenciaOhm(canvas);

    function gameLoop() {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

window.addEventListener('load', initGame);