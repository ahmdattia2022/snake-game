const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15 };
let dx = 1;
let dy = 0;
let score = 0;
let gameOver = false;
let gameStarted = false;

const levels = {
    'Easy': 300,
    'Medium': 200,
    'Hard': 150,
    'Expert': 100
};

let gameSpeed = levels['Medium']; // Default speed

let lastValidDirection = { dx: 1, dy: 0 };

// Color palette
const colors = {
    background: '#f0f0f0',
    snake: {
        body: '#4CAF50',
        border: '#45a049'
    },
    food: '#FF5722',
    text: '#333333'
};

let foodAnimationFrame = 0;
let gameOverAnimationFrame = 0;

let lastUpdateTime = 0;

function startGame() {
    const levelSelect = document.getElementById('levelSelect');
    gameSpeed = levels[levelSelect.value];
    gameStarted = true;
    gameOver = false;
    score = 0;
    snake = [{ x: 10, y: 10 }];
    dx = 1;
    dy = 0;
    lastValidDirection = { dx: 1, dy: 0 };
    generateFood();
    lastUpdateTime = 0;
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameStarted) {
        showStartMessage();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameOver) {
        showGameOver(timestamp);
        requestAnimationFrame(gameLoop);
        return;
    }

    if (timestamp - lastUpdateTime >= gameSpeed) {
        updateGame();
        lastUpdateTime = timestamp;
    }

    drawGame(timestamp);
    requestAnimationFrame(gameLoop);
}

function updateGame() {
    moveSnake();
    checkCollision();
    if (!gameOver) {
        checkFoodCollision();
    }
}

function drawGame(timestamp) {
    clearCanvas();
    drawGrid();
    drawSnake(timestamp);
    drawFood(timestamp);
    drawScore();
}

function clearCanvas() {
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (!(head.x === food.x && head.y === food.y)) {
        snake.pop();
    }
}

function drawSnake(timestamp) {
    snake.forEach((segment, index) => {
        ctx.fillStyle = colors.snake.body;
        ctx.strokeStyle = colors.snake.border;
        ctx.lineWidth = 2;
        const x = segment.x * gridSize;
        const y = segment.y * gridSize;
        const size = gridSize - 2;
        const radius = size / 4;

        // Add a subtle pulsing effect to the snake
        const pulseFactor = 1 + Math.sin(timestamp / 200 + index * 0.5) * 0.05;
        const adjustedSize = size * pulseFactor;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + adjustedSize, y, x + adjustedSize, y + adjustedSize, radius);
        ctx.arcTo(x + adjustedSize, y + adjustedSize, x, y + adjustedSize, radius);
        ctx.arcTo(x, y + adjustedSize, x, y, radius);
        ctx.arcTo(x, y, x + adjustedSize, y, radius);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        if (index === 0) {
            // Draw eyes
            const eyeSize = adjustedSize / 8;
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(x + adjustedSize / 3, y + adjustedSize / 3, eyeSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + adjustedSize * 2/3, y + adjustedSize / 3, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(x + adjustedSize / 3, y + adjustedSize / 3, eyeSize / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + adjustedSize * 2/3, y + adjustedSize / 3, eyeSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawFood(timestamp) {
    ctx.fillStyle = colors.food;
    const x = food.x * gridSize;
    const y = food.y * gridSize;
    const size = gridSize - 2;

    // Add a bouncing effect to the food
    foodAnimationFrame += 0.1;
    const bounceFactor = Math.abs(Math.sin(foodAnimationFrame)) * 3;

    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2 - bounceFactor, size/2, 0, Math.PI * 2);
    ctx.fill();
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    food = newFood;
    foodAnimationFrame = 0;
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        return;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            return;
        }
    }
}

function checkFoodCollision() {
    const head = snake[0];
    if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();
    }
}

function drawScore() {
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Score: ${score}`, 10, 10);
}

function showStartMessage() {
    ctx.fillStyle = colors.text;
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Select a level and click Start', canvas.width / 2, canvas.height / 2);
}

function showGameOver(timestamp) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    gameOverAnimationFrame += 0.05;
    const scaleFactor = 1 + Math.sin(gameOverAnimationFrame) * 0.1;

    ctx.fillStyle = 'white';
    ctx.font = `bold ${30 * scaleFactor}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.font = '20px Arial';
    ctx.fillText('Select a level and click Start to play again', canvas.width / 2, canvas.height / 2 + 70);
}

document.addEventListener('keydown', (e) => {
    if (gameStarted && !gameOver) {
        switch (e.key) {
            case 'ArrowUp':
                if (lastValidDirection.dy !== 1) {
                    dx = 0;
                    dy = -1;
                    lastValidDirection = { dx: 0, dy: -1 };
                }
                break;
            case 'ArrowDown':
                if (lastValidDirection.dy !== -1) {
                    dx = 0;
                    dy = 1;
                    lastValidDirection = { dx: 0, dy: 1 };
                }
                break;
            case 'ArrowLeft':
                if (lastValidDirection.dx !== 1) {
                    dx = -1;
                    dy = 0;
                    lastValidDirection = { dx: -1, dy: 0 };
                }
                break;
            case 'ArrowRight':
                if (lastValidDirection.dx !== -1) {
                    dx = 1;
                    dy = 0;
                    lastValidDirection = { dx: 1, dy: 0 };
                }
                break;
        }
    }
});
document.addEventListener('DOMContentLoaded', function() {
    // This ensures the game starts when the popup is opened
    showStartMessage();
});
document.getElementById('startButton').addEventListener('click', startGame);
showStartMessage();