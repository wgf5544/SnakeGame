// 获取游戏元素
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const restartButton = document.getElementById('restart-btn');
const speedSlider = document.getElementById('speed-slider');
const speedValue = document.getElementById('speed-value');

// 游戏配置
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let speed = parseInt(localStorage.getItem('snakeSpeed')) || 7; // 蛇的速度，从本地存储加载或默认为7

// 游戏状态
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;

// 蛇的初始位置和大小
let snake = [
    { x: 10, y: 10 }
];

// 蛇的移动方向
let dx = 0;
let dy = 0;

// 食物位置
let food = generateFood();

// 更新最高分显示
highScoreElement.textContent = highScore;

// 初始化游戏控制按钮状态
pauseButton.disabled = true;

// 初始化速度滑块值
speedSlider.value = speed;
speedValue.textContent = speed;

// 事件监听器
startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', restartGame);
document.addEventListener('keydown', changeDirection);
speedSlider.addEventListener('input', changeSpeed);

// 更改游戏速度
function changeSpeed() {
    speed = parseInt(speedSlider.value);
    speedValue.textContent = speed;
    localStorage.setItem('snakeSpeed', speed);
}

// 生成随机食物位置
function generateFood() {
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // 检查食物是否生成在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    return newFood;
}

// 开始游戏
function startGame() {
    if (gameOver || !gameRunning) {
        gameRunning = true;
        gameOver = false;
        gamePaused = false;
        
        if (gameOver) {
            snake = [{ x: 10, y: 10 }];
            dx = 0;
            dy = 0;
            score = 0;
            scoreElement.textContent = score;
            food = generateFood();
        }
        
        startButton.disabled = true;
        pauseButton.disabled = false;
        
        // 如果蛇还没有移动方向，设置默认向右移动
        if (dx === 0 && dy === 0) {
            dx = 1;
            dy = 0;
        }
        
        gameLoop();
    }
}

// 暂停/继续游戏
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? '继续' : '暂停';
        
        if (!gamePaused) {
            gameLoop();
        }
    }
}

// 重新开始游戏
function restartGame() {
    gameRunning = false;
    gameOver = true;
    gamePaused = false;
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    food = generateFood();
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = '暂停';
    drawGame(); // 重新绘制游戏界面
}

// 改变蛇的移动方向
function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    
    // 防止蛇反向移动
    if (event.keyCode === LEFT_KEY && dx !== 1) {
        dx = -1;
        dy = 0;
    } else if (event.keyCode === UP_KEY && dy !== 1) {
        dx = 0;
        dy = -1;
    } else if (event.keyCode === RIGHT_KEY && dx !== -1) {
        dx = 1;
        dy = 0;
    } else if (event.keyCode === DOWN_KEY && dy !== -1) {
        dx = 0;
        dy = 1;
    }
    
    // 如果游戏未开始但按下了方向键，自动开始游戏
    if (!gameRunning && !gameOver) {
        startGame();
    }
}

// 游戏主循环
function gameLoop() {
    if (gameOver || !gameRunning || gamePaused) {
        return;
    }
    
    setTimeout(function() {
        clearCanvas();
        moveSnake();
        checkCollision();
        drawFood();
        drawSnake();
        
        if (!gameOver) {
            gameLoop();
        }
    }, 1000 / speed);
}

// 清空画布
function clearCanvas() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 移动蛇
function moveSnake() {
    // 创建新的蛇头
    const head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };
    
    // 将新蛇头添加到蛇身前面
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        // 增加分数
        score += 10;
        scoreElement.textContent = score;
        
        // 更新最高分
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        
        // 生成新的食物
        food = generateFood();
    } else {
        // 如果没有吃到食物，移除蛇尾
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        gameRunning = false;
        startButton.disabled = false;
        pauseButton.disabled = true;
        showGameOver();
        return;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver = true;
            gameRunning = false;
            startButton.disabled = false;
            pauseButton.disabled = true;
            showGameOver();
            return;
        }
    }
}

// 绘制蛇
function drawSnake() {
    snake.forEach((segment, index) => {
        // 蛇头使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#4CAF50';
        } else {
            // 蛇身使用渐变色
            const greenValue = Math.floor(150 - (index * 3));
            ctx.fillStyle = `rgb(0, ${Math.max(greenValue, 100)}, 0)`;
        }
        
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
        
        // 为蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            
            // 根据移动方向确定眼睛位置
            if (dx === 1) { // 向右
                ctx.fillRect((segment.x * gridSize) + 12, (segment.y * gridSize) + 4, 4, 4);
                ctx.fillRect((segment.x * gridSize) + 12, (segment.y * gridSize) + 12, 4, 4);
            } else if (dx === -1) { // 向左
                ctx.fillRect((segment.x * gridSize) + 4, (segment.y * gridSize) + 4, 4, 4);
                ctx.fillRect((segment.x * gridSize) + 4, (segment.y * gridSize) + 12, 4, 4);
            } else if (dy === -1) { // 向上
                ctx.fillRect((segment.x * gridSize) + 4, (segment.y * gridSize) + 4, 4, 4);
                ctx.fillRect((segment.x * gridSize) + 12, (segment.y * gridSize) + 4, 4, 4);
            } else if (dy === 1) { // 向下
                ctx.fillRect((segment.x * gridSize) + 4, (segment.y * gridSize) + 12, 4, 4);
                ctx.fillRect((segment.x * gridSize) + 12, (segment.y * gridSize) + 12, 4, 4);
            }
        }
    });
}

// 绘制食物
function drawFood() {
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.arc(
        (food.x * gridSize) + (gridSize / 2),
        (food.y * gridSize) + (gridSize / 2),
        gridSize / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// 显示游戏结束
function showGameOver() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('游戏结束!', canvas.width / 2, canvas.height / 2 - 30);
    
    ctx.font = '20px Arial';
    ctx.fillText(`得分: ${score}`, canvas.width / 2, canvas.height / 2 + 10);
    
    if (score >= highScore) {
        ctx.fillStyle = '#FFD700';
        ctx.fillText('新纪录!', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// 初始绘制游戏
function drawGame() {
    clearCanvas();
    drawFood();
    drawSnake();
    
    if (gameOver) {
        showGameOver();
    }
}

// 初始化游戏界面
drawGame();