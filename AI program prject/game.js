<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Platformer Game</title>
    <style>
        body { margin: 0; overflow: hidden; }
        #gameCanvas { display: block; background-color: #87CEEB; }
        #gameOver, #levelComplete { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 40px; color: white; }
        #restart-btn { display: none; position: absolute; top: 60%; left: 50%; transform: translateX(-50%); font-size: 20px; padding: 10px; background-color: black; color: white; cursor: pointer; }
    </style>
</head>
<body>

<canvas id="gameCanvas"></canvas>
<div id="gameOver">Game Over!</div>
<div id="levelComplete">Level Complete!</div>
<button id="restart-btn">Restart</button>

<script>
// Set up the canvas and game context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restart-btn");
const gameOverElement = document.getElementById("gameOver");
const levelCompleteElement = document.getElementById("levelComplete");

let canvasWidth = window.innerWidth;
let canvasHeight = window.innerHeight;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Player setup
let player = {
    x: 50,
    y: canvasHeight - 70,
    width: 30,
    height: 30,
    speed: 6,
    dx: 0,
    dy: 0,
    gravity: 0.8,
    jumpStrength: -20, // Increased jump strength for faster jump
    isJumping: false,
    isCrouching: false
};

// Platforms
let platforms = [
    { x: 0, y: canvasHeight - 50, width: canvasWidth, height: 50 }, // Ground
    { x: 0.45 * canvasWidth, y: canvasHeight - 150, width: 200, height: 10 }, // Middle platform
    { x: 0.7 * canvasWidth, y: canvasHeight - 350, width: 150, height: 10 },  // Upper platform
    { x: 0.2 * canvasWidth, y: canvasHeight - 340, width: 205, height: 10 }, // Lower platform
    { x: 0.5 * canvasWidth, y: canvasHeight - 450, width: 200, height: 10 }, // Upper platform 2
    { x: 0. * canvasWidth, y: canvasHeight - 580, width: 100, height: 10 }, // Upper platform 2
    { x: 0.2 * canvasWidth, y: canvasHeight - 800, width: 50, height: 10 }, // Upper platform 2
    { x: 0.45 * canvasWidth, y: canvasHeight - 800, width: 50, height: 10 }, // Upper platform 2
];

// Enemies
let enemies = [
    { x: 0.5 * canvasWidth, y: canvasHeight - 150, width: 40, height: 40, dx: 2 },  // Enemy 1
    { x: 0.7 * canvasWidth, y: canvasHeight - 250, width: 40, height: 40, dx: 2 },   // Enemy 2
    { x: 0.3 * canvasWidth, y: canvasHeight - 300, width: 40, height: 40, dx: 2 },   // Enemy 3
    { x: 0.1 * canvasWidth, y: canvasHeight - 100, width: 40, height: 40, dx: 2 },   // Enemy 4
    { x: 0.6 * canvasWidth, y: canvasHeight - 400, width: 40, height: 40, dx: 2 },  // Enemy 5
    { x: 0.8 * canvasWidth, y: canvasHeight - 350, width: 40, height: 40, dx: 2 },   // Enemy 6
    { x: 0.1 * canvasWidth, y: canvasHeight - 500, width: 40, height: 40, dx: 2 },   // Enemy 7
    { x: 0.4 * canvasWidth, y: canvasHeight - 100, width: 40, height: 40, dx: 2 },   // Enemy 4
    { x: 0.2 * canvasWidth, y: canvasHeight - 400, width: 40, height: 40, dx: 2 },  // Enemy 5
    { x: 0.9 * canvasWidth, y: canvasHeight - 350, width: 40, height: 40, dx: 2 },   // Enemy 6
    { x: 0.5 * canvasWidth, y: canvasHeight - 500, width: 40, height: 40, dx: 2 },   // Enemy 7
];

// Endpoint (Goal)
let endpoint = { x: canvasWidth - 950, y: canvasHeight - 870, width: 40, height: 40 };

// Game state
let isGameOver = false;

// Resize canvas on window resize
window.addEventListener("resize", () => {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    resetGame();
});

// Keyboard controls
let keys = {
    w: false, // Jump
    a: false, // Move left
    d: false, // Move right
    s: false  // Crouch
};

window.addEventListener('keydown', (e) => {
    if (e.key === "w" && !player.isJumping) {
        player.dy = player.jumpStrength;
        player.isJumping = true;
    }
    if (e.key === "a") player.dx = -player.speed;
    if (e.key === "d") player.dx = player.speed;
    if (e.key === "s") player.isCrouching = true; // Crouch
});

window.addEventListener('keyup', (e) => {
    if (e.key === "a" || e.key === "d") player.dx = 0;
    if (e.key === "s") player.isCrouching = false; // Stop crouch
});

// Restart game
restartBtn.addEventListener('click', () => {
    resetGame();
    update();
});

// Reset the game state
function resetGame() {
    player = {
        x: 50,
        y: canvasHeight - 70,
        width: 30,
        height: 30,
        speed: 6,
        dx: 0,
        dy: 0,
        gravity: 0.8,
        jumpStrength: -20, // Increased jump strength for faster jump
        isJumping: false,
        isCrouching: false
    };
    isGameOver = false;
    gameOverElement.style.display = "none";
    levelCompleteElement.style.display = "none";
    restartBtn.style.display = "none";
}

// Clear the canvas
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Draw the player on canvas
function drawPlayer() {
    ctx.fillStyle = "green";
    if (player.isCrouching) {
        ctx.fillRect(player.x, player.y + 30, player.width, player.height / 2); // Crouch
    } else {
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }
}

// Draw platforms
function drawPlatforms() {
    ctx.fillStyle = "brown";
    platforms.forEach(platform => ctx.fillRect(platform.x, platform.y, platform.width, platform.height));
}

// Draw enemies
function drawEnemies() {
    ctx.fillStyle = "red";
    enemies.forEach(enemy => ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height));
}

// Draw endpoint
function drawEndpoint() {
    ctx.fillStyle = "gold";
    ctx.fillRect(endpoint.x, endpoint.y, endpoint.width, endpoint.height);
}

// Update player position and handle jumping and gravity
function updatePlayerPosition() {
    player.x += player.dx;
    player.y += player.dy;

    // Apply gravity
    if (player.y + player.height < canvasHeight) {
        player.dy += player.gravity;
    } else {
        player.dy = 0;
        player.isJumping = false;
        player.y = canvasHeight - player.height;
    }

    // Handle collisions with platforms
    platforms.forEach(platform => {
        if (player.x + player.width > platform.x && player.x < platform.x + platform.width &&
            player.y + player.height <= platform.y && player.y + player.height + player.dy >= platform.y) {
            player.dy = 0;
            player.isJumping = false;
            player.y = platform.y - player.height;
        }
    });

    // Check for game over (enemy collision)
    enemies.forEach(enemy => {
        if (player.x + player.width > enemy.x && player.x < enemy.x + enemy.width &&
            player.y + player.height > enemy.y && player.y < enemy.y + enemy.height) {
            gameOver();
        }
    });

    // Check if player reaches the endpoint
    if (player.x + player.width > endpoint.x && player.x < endpoint.x + endpoint.width &&
        player.y + player.height > endpoint.y && player.y < endpoint.y + endpoint.height) {
        levelComplete();
    }
}

// Update enemies' positions
function updateEnemies() {
    enemies.forEach(enemy => {
        enemy.x += enemy.dx;

        // Reverse direction when hitting canvas edges
        if (enemy.x <= 0 || enemy.x + enemy.width >= canvasWidth) {
            enemy.dx = -enemy.dx;
        }
    });
}

// Game over function
function gameOver() {
    isGameOver = true;
    gameOverElement.style.display = "block";
    restartBtn.style.display = "inline-block";
}

// Level complete function
function levelComplete() {
    levelCompleteElement.style.display = "block";
    restartBtn.style.display = "inline-block";
}

// Main update loop
function update() {
    if (isGameOver) return;

    // Update player and enemies
    updatePlayerPosition();
    updateEnemies();

    // Draw everything
    clear();
    drawPlatforms();
    drawEnemies();
    drawPlayer();
    drawEndpoint();

    // Request the next animation frame
    requestAnimationFrame(update);
}

// Start the game loop
update();
</script>

</body>
</html>
