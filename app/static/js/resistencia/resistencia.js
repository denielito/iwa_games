// ==================== CONFIGURACIÓN ====================
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 800;
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
    DARK_CABLE: 'rgb(20, 20, 25)'
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
    constructor(text, x, y) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.timer = 120;
        this.alpha = 1;
    }

    update() {
        this.timer -= 1;
        this.alpha = Math.max(0, this.timer / 120);
        return this.timer > 0;
    }
}

class Electron {
    constructor(x, y, lane, level, gameHeight, gameWidth) {
        this.initialX = x;
        this.initialY = y;
        this.x = x;
        this.y = y;
        this.lane = lane;
        this.voltage = 5.0;
        this.speed = 1 + level * 0.2;
        this.radius = 15;
        this.gameHeight = gameHeight;
        this.gameWidth = gameWidth;
        this.colliding = false;
    }

    update(gameSpeed) {
        this.y += this.speed * gameSpeed;

        const offset = 80 / this.gameHeight; // ángulo de inclinación ajustado
        if (this.lane === 0) {
            this.x = this.initialX - (this.y - this.initialY) * offset - 10;
        } else if (this.lane === 1) {
            this.x = this.initialX; // centro alineado
        } else if (this.lane === 2) {
            this.x = this.initialX + (this.y - this.initialY) * offset + 12;
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
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 2, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.fillStyle = COLORS.WHITE;
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.voltage.toFixed(1) + 'V', this.x, this.y - 25);
    }
}

class Player {
    constructor(lanes, gameX, gameY, gameHeight, gameWidth) {
        this.lanes = lanes;
        this.gameX = gameX;
        this.gameY = gameY;
        this.lane = 1;
        this.targetLane = 1;

        // Tamaño proporcional
        this.width = gameWidth * 0.09;
        this.height = gameHeight * 0.09;

        // Posición inicial (centrado en la línea)
        this.y = this.gameY + gameHeight * 0.68;
        this.x = this.lanes[this.lane];
        this.targetX = this.x;

        this.moveSpeed = 8;
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
        // Mismo offset que los electrones
        const offset = 80 / 680;

        // Posición X exacta sobre la línea
        if (this.targetLane === 0) {
            this.targetX = this.lanes[0] - (this.y - this.gameY) * offset - 10;
        } else if (this.targetLane === 1) {
            this.targetX = this.lanes[1];
        } else if (this.targetLane === 2) {
            this.targetX = this.lanes[2] + (this.y - this.gameY) * offset + 27;
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
        // Centrado exacto sobre la línea (ajuste fino con -width/2)
        const x = this.x - this.width / 2;
        const y = this.y - this.height / 2;

        // Cuerpo del jugador
        ctx.fillStyle = COLORS.PLAYER_BROWN;
        ctx.fillRect(x, y, this.width, this.height);

        // Bandas negras verticales
        const stripeWidth = this.width * 0.125;
        ctx.fillStyle = COLORS.BLACK;
        ctx.fillRect(x + this.width * 0.125, y + this.height * 0.1, stripeWidth, this.height * 0.8);
        ctx.fillRect(x + this.width * 0.625, y + this.height * 0.1, stripeWidth, this.height * 0.8);

        // Borde dorado opcional para visibilidad
        ctx.strokeStyle = COLORS.GOLD;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, this.width, this.height);
    }
}


class ResistenciaOhm {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.WIDTH = canvas.width;
        this.HEIGHT = canvas.height;

        this.gameWidth = this.WIDTH * 0.4;
        this.gameHeight = this.HEIGHT * 0.8;

        this.gameX = (this.WIDTH - this.gameWidth) * 0.5;
        this.gameY = (this.HEIGHT - this.gameHeight) * 0.5;

        // === POSICIONES X DE LAS LÍNEAS ===
        const centerX = this.gameX + this.gameWidth / 2;
        const laneSpacing = this.gameWidth / 3;
        this.lanes = [
            centerX - laneSpacing / 1.5, // Izquierda
            centerX,                     // Centro
            centerX + laneSpacing / 1.5  // Derecha
        ];

        this.cableColor = CABLE_COLORS[Math.floor(Math.random() * CABLE_COLORS.length)];

        this.player = new Player(this.lanes, this.gameX, this.gameY, this.gameHeight, this.gameWidth);
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
        this.bossRadius = 25;

        this.updateSpawnInterval();
        this.setupEventListeners();
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    handleKeyDown(e) {
        if (this.state === GameState.PLAYING) {
            if (['a', 'A', 'q', 'Q'].includes(e.key)) {
                this.player.moveUp();
            } else if (['d', 'D'].includes(e.key)) {
                this.player.moveDown();
            }
        } else if (this.state === GameState.GAME_OVER) {
            if (['r', 'R'].includes(e.key)) {
                this.restartGame();
            }
        }
    }

    handleClick(e) {
        if (this.state !== GameState.MENU) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.WIDTH / rect.width);
        const y = (e.clientY - rect.top) * (this.HEIGHT / rect.height);

        const buttonX = this.WIDTH / 2 - 80;
        const buttonY = this.HEIGHT / 2 + 100;
        const buttonW = 160;
        const buttonH = 50;

        if (x >= buttonX && x <= buttonX + buttonW && y >= buttonY && y <= buttonY + buttonH) {
            this.state = GameState.PLAYING;
        }
    }

    showNotification(text) {
        const notif = new Notification(text, this.WIDTH * 0.7, this.HEIGHT * 0.1);
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
            this.gameWidth
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
        const offset = 100;
        const centerX = this.gameX + this.gameWidth / 2;
        const laneSpacing = this.gameWidth / 3;

        const xPositions = [
            centerX - laneSpacing / 1.5,
            centerX,
            centerX + laneSpacing / 1.5
        ];

        this.ctx.strokeStyle = COLORS.LANE_GRAY;
        this.ctx.lineWidth = 6;

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
        const leftEndX = this.gameX - 100;
        const rightStartX = this.gameX + this.gameWidth;
        const rightEndX = this.gameX + this.gameWidth + 100;

        this.ctx.strokeStyle = this.cableColor;
        this.ctx.lineWidth = 15;

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
            [this.gameX + this.gameWidth + 100, this.gameY + this.gameHeight],
            [this.gameX - 100, this.gameY + this.gameHeight]
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
        const offset = 80 / this.gameHeight;
        let bossX = this.lanes[this.bossLane];
        if (this.bossLane === 0) bossX -= (this.bossY - this.gameY) * offset;
        else if (this.bossLane === 2) bossX += (this.bossY - this.gameY) * offset;

        this.ctx.fillStyle = COLORS.ELECTRON_YELLOW;
        this.ctx.beginPath();
        this.ctx.arc(bossX, this.bossY, this.bossRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = COLORS.WHITE;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(bossX, this.bossY, this.bossRadius, 0, Math.PI * 2);
        this.ctx.stroke();

        // ojos y sonrisa
        const eyeRadius = 3;
        this.ctx.fillStyle = COLORS.BLACK;
        this.ctx.beginPath();
        this.ctx.arc(bossX - 7, this.bossY - 5, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(bossX + 7, this.bossY - 5, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = COLORS.BLACK;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(bossX, this.bossY + 3, 8, Math.PI, 0);
        this.ctx.stroke();
    }

    drawUI() {
        const panelX = this.gameX - 250;
        const panelY = this.gameY + 20;
        const panelW = 220;
        const panelH = 130;

        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(panelX, panelY, panelW, panelH);

        this.ctx.strokeStyle = COLORS.GOLD;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(panelX, panelY, panelW, panelH);

        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';

        const stats = [
            `Vidas LED: ${this.lives}`,
            `Puntos: ${this.points}`,
            `Nivel: ${this.level}`
        ];

        let yOffset = panelY + 60;
        for (const stat of stats) {
            this.ctx.fillText(stat, panelX + panelW / 2, yOffset);
            yOffset += 25;
        }
    }

    drawNotifications() {
        for (const notif of this.notifications) {
            this.ctx.globalAlpha = notif.alpha;
            this.ctx.fillStyle = 'rgba(30, 30, 30, 0.8)';
            this.ctx.fillRect(notif.x - 100, notif.y - 20, 200, 40);

            this.ctx.fillStyle = COLORS.GOLD;
            this.ctx.font = 'bold 18px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(notif.text, notif.x, notif.y + 5);
            this.ctx.globalAlpha = 1;
        }
    }

    drawMenu() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        const menuX = this.WIDTH / 2 - 300;
        const menuY = this.HEIGHT / 2 - 150;
        const menuW = 600;
        const menuH = 300;

        this.ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
        this.ctx.fillRect(menuX, menuY, menuW, menuH);

        this.ctx.strokeStyle = COLORS.GOLD;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(menuX, menuY, menuW, menuH);

        this.ctx.fillStyle = COLORS.GOLD;
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Reglas del Juego', this.WIDTH / 2, menuY + 40);

        const rules = [
            '1. Usa A (Izquierda) y D (Derecha) para moverte',
            '2. Ajusta el voltaje de los electrones',
            '3. Objetivo: que lleguen al LED entre 1V y 3.3V',
            '4. ¡Si logras entre 3.0V y 3.3V obtienes bonus!'
        ];

        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.font = '16px Arial';
        let yOffset = menuY + 90;
        for (const rule of rules) {
            this.ctx.fillText(rule, this.WIDTH / 2, yOffset);
            yOffset += 35;
        }

        this.ctx.fillStyle = COLORS.GOLD;
        this.ctx.fillRect(this.WIDTH / 2 - 80, this.HEIGHT / 2 + 100, 160, 50);
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText('Acción', this.WIDTH / 2, this.HEIGHT / 2 + 132);
    }

    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        const panelW = 400;
        const panelH = 250;
        const panelX = (this.WIDTH - panelW) / 2;
        const panelY = (this.HEIGHT - panelH) / 2;

        this.ctx.fillStyle = 'rgba(30, 30, 30, 0.95)';
        this.ctx.fillRect(panelX, panelY, panelW, panelH);

        this.ctx.strokeStyle = COLORS.GOLD;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelW, panelH);

        this.ctx.fillStyle = COLORS.GOLD;
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡GAME OVER!', this.WIDTH / 2, panelY + 60);

        this.ctx.fillStyle = COLORS.WHITE;
        this.ctx.font = '28px Arial';
        this.ctx.fillText(`Puntos: ${this.points}`, this.WIDTH / 2, panelY + 120);

        this.ctx.fillStyle = 'rgb(200, 200, 200)';
        this.ctx.font = '18px Arial';
        this.ctx.fillText('Presiona R para reiniciar', this.WIDTH / 2, panelY + 180);
    }

    draw() {
        this.ctx.fillStyle = COLORS.VERDE_PETROLEO;
        this.ctx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

        this.ctx.fillStyle = COLORS.BEIGE;
        this.ctx.fillRect(20, 20, this.WIDTH - 40, this.HEIGHT - 40);

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
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;

    const game = new ResistenciaOhm(canvas);

    function gameLoop() {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
    }

    gameLoop();
}

window.addEventListener('load', initGame);
