// Game canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVEMENT_SPEED = 5;

// Player object
const player = {
    x: 50,
    y: 200,
    width: 32,
    height: 32,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    color: 'red'
};

// Platform data
const platforms = [
    { x: 0, y: 350, width: 800, height: 50 },    // Ground
    { x: 300, y: 250, width: 200, height: 20 },  // Platform 1
    { x: 100, y: 150, width: 200, height: 20 },  // Platform 2
];

// Game controls
const keys = {
    left: false,
    right: false,
    up: false
};

// Event listeners for controls
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            keys.left = true;
            break;
        case 'ArrowRight':
            keys.right = true;
            break;
        case 'ArrowUp':
        case ' ':
            keys.up = true;
            if (!player.isJumping) {
                player.velocityY = JUMP_FORCE;
                player.isJumping = true;
            }
            break;
    }
});

document.addEventListener('keyup', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            keys.left = false;
            break;
        case 'ArrowRight':
            keys.right = false;
            break;
        case 'ArrowUp':
        case ' ':
            keys.up = false;
            break;
    }
});

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update game logic
function update() {
    // Horizontal movement
    if (keys.left) {
        player.velocityX = -MOVEMENT_SPEED;
    } else if (keys.right) {
        player.velocityX = MOVEMENT_SPEED;
    } else {
        player.velocityX = 0;
    }

    // Apply gravity
    player.velocityY += GRAVITY;

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Check platform collisions
    player.isJumping = true;
    for (const platform of platforms) {
        if (checkCollision(player, platform)) {
            // Top collision (landing)
            if (player.velocityY > 0 && 
                player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
            }
            // Bottom collision (hitting head)
            else if (player.velocityY < 0 && 
                     player.y >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Side collisions
            else if (player.velocityX > 0) {
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0) {
                player.x = platform.x + platform.width;
            }
        }
    }

    // Screen boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Render game
function render() {
    // Clear canvas
    ctx.fillStyle = '#87CEEB';  // Sky blue background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#8B4513';  // Brown color for platforms
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 