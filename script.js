let color = 'red';
let shape = 'circle';
let highScore = localStorage.getItem('highScore') || 0;  // Retrieve high score from localStorage

// Display high score on the menu and in the game section
document.getElementById('highScore').textContent = highScore;
document.getElementById('menuHighScore').textContent = highScore;

const startGameBtn = document.getElementById('startGameBtn');
const changeColorBtn = document.getElementById('changeColorBtn');
const closeSiteBtn = document.getElementById('closeSiteBtn');
const shapeOptions = document.getElementById('shapeOptions');
const colorButtons = document.querySelectorAll('.colorBtn');
const shapeButtons = document.querySelectorAll('.shapeBtn');

const gameCanvas = document.getElementById('gameCanvas');
const ctx = gameCanvas.getContext('2d');
let player = { 
    x: (gameCanvas.width / 2) - 15,  // Center horizontally, assuming player width is 30
    y: (gameCanvas.height / 2) - 15, // Center vertically, assuming player height is 30
    width: 30, 
    height: 30, 
    speed: 10 
};
let obstacles = [];
let currentScore = 0;
let gameOver = false;

let scoreIncrementInterval = 30; // Slowed down score
let frameCount = 0;

// Responsive canvas resizing
function resizeCanvas() {
    gameCanvas.width = window.innerWidth * 0.9;
    gameCanvas.height = window.innerHeight * 0.9;

    // Recalculate player position to center after resizing
    player.x = (gameCanvas.width / 2) - (player.width / 2);
    player.y = (gameCanvas.height / 2) - (player.height / 2);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Control input variables
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

// Virtual Joystick Setup
let joystick = {
    active: false,
    x: 0,
    y: 0,
    baseX: 0,
    baseY: 0,
    threshold: 20,  // How far the stick needs to move to trigger movement
};

// Adding touch events for joystick-like movement on mobile devices
gameCanvas.addEventListener('touchstart', (e) => {
    joystick.active = true;
    const touch = e.touches[0];
    joystick.baseX = touch.clientX;
    joystick.baseY = touch.clientY;
});

gameCanvas.addEventListener('touchmove', (e) => {
    if (joystick.active) {
        const touch = e.touches[0];
        joystick.x = touch.clientX - joystick.baseX;
        joystick.y = touch.clientY - joystick.baseY;

        // Only register movement if joystick has moved past the threshold
        if (joystick.x < -joystick.threshold) {
            moveLeft = true;
        } else {
            moveLeft = false;
        }

        if (joystick.x > joystick.threshold) {
            moveRight = true;
        } else {
            moveRight = false;
        }

        if (joystick.y < -joystick.threshold) {
            moveUp = true;
        } else {
            moveUp = false;
        }

        if (joystick.y > joystick.threshold) {
            moveDown = true;
        } else {
            moveDown = false;
        }
    }
});

gameCanvas.addEventListener('touchend', () => {
    joystick.active = false;
    moveLeft = moveRight = moveUp = moveDown = false;
});

// Keyboard Controls for PC
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') moveLeft = true;
    if (e.key === 'ArrowRight') moveRight = true;
    if (e.key === 'ArrowUp') moveUp = true;
    if (e.key === 'ArrowDown') moveDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') moveLeft = false;
    if (e.key === 'ArrowRight') moveRight = false;
    if (e.key === 'ArrowUp') moveUp = false;
    if (e.key === 'ArrowDown') moveDown = false;
});

startGameBtn.addEventListener('click', startGame);
changeColorBtn.addEventListener('click', () => shapeOptions.classList.toggle('hide'));
closeSiteBtn.addEventListener('click', () => window.close());

colorButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        color = e.target.getAttribute('data-color');
        alert(`Selected color: ${color}`);
    });
});

shapeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        shape = e.target.getAttribute('data-shape');
        alert(`Selected shape: ${shape}`);
    });
});

function startGame() {
    document.getElementById('menu').classList.add('hide');
    document.getElementById('game').classList.remove('hide');
    const gameMusic = document.getElementById('gameMusic');
    gameMusic.play();

    gameLoop();
}

function createObstacle() {
    const obstacleSize = 10 + Math.random() * 80;
    const x = Math.random() * (gameCanvas.width - obstacleSize);
    const y = -obstacleSize;
    const speed = 0.05 + Math.random() * 20;
    obstacles.push({ x, y, width: obstacleSize, height: obstacleSize, speed });
}

function moveObstacles() {
    obstacles.forEach((obstacle, index) => {
        obstacle.y += obstacle.speed;
        if (obstacle.y > gameCanvas.height) obstacles.splice(index, 1);
    });
}

function checkCollision(player, obstacle) {
    return (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    );
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    if (moveLeft) player.x -= player.speed;
    if (moveRight) player.x += player.speed;
    if (moveUp) player.y -= player.speed;
    if (moveDown) player.y += player.speed;

    player.x = Math.max(0, Math.min(player.x, gameCanvas.width - player.width));
    player.y = Math.max(0, Math.min(player.y, gameCanvas.height - player.height));

    ctx.fillStyle = color;
    ctx.beginPath();
    if (shape === 'circle') {
        ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width / 2, 0, Math.PI * 2);
        ctx.fill();
    } else if (shape === 'square') {
        ctx.fillRect(player.x, player.y, player.width, player.height);
    } else if (shape === 'triangle') {
        ctx.moveTo(player.x, player.y + player.height);
        ctx.lineTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.closePath();
        ctx.fill();
    }

    moveObstacles();
    obstacles.forEach(obstacle => {
        ctx.fillStyle = 'black';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        if (checkCollision(player, obstacle)) {
            endGame();
        }
    });

    if (Math.random() < 0.02) createObstacle();

    frameCount++;
    if (frameCount % scoreIncrementInterval === 0) {
        currentScore++;
        document.getElementById('currentScore').textContent = currentScore;
    }

    requestAnimationFrame(gameLoop);
}

function endGame() {
    gameOver = true;
    const gameMusic = document.getElementById('gameMusic');
    gameMusic.pause();

    if (currentScore > highScore) {
        highScore = currentScore;
        localStorage.setItem('highScore', highScore);

        // Update high score on both the game screen and the main menu
        document.getElementById('highScore').textContent = highScore;
        document.getElementById('menuHighScore').textContent = highScore;
    }

    alert(`Game Over! Your score: ${currentScore}`);
    location.reload();
}
