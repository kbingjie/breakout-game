const rulesBtn = document.querySelector("#rules-btn");
const closeBtn = document.querySelector("#close-btn");
const startBtn = document.querySelector('#start-btn');
const easyModeBtn = document.querySelector('#easy-mode');
const normalModeBtn = document.querySelector('#normal-mode');
const rules = document.querySelector("#rules");
const playAgainEl = document.querySelector('.play-again');
const playAgainBtn = document.querySelector('.play-again-btn');
const scoreListEl = document.querySelector('.score-list');
const finalScore = document.querySelector('.final-score');
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

let score = 0;
let pause = false;

/* * * * * * * * * * * * * Create elements in canvas* * * * * * * * * * * *  */
//create a ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 4,
    dx: 4,
    dy: -4
}

//create paddle props
const paddle = {
    x: canvas.width / 2 - 40,
    y: canvas.height - 20,
    w: 80,
    h: 10,
    speed: 8,
    dx: 0
}

//create brick props
const brickInfo = {
    w: 70,
    h: 20,
    padding: 10,
    offsetX: 45,
    offsetY: 60,
    visible: true
}

//create bricks
const brickRowCount = 9;
const brickColumnCount = 5;
const bricks = [];

for (let i = 0; i < brickRowCount; i++) {
    bricks[i] = [];
    for (let j = 0; j < brickColumnCount; j++) {
        const x = i * (brickInfo.w + brickInfo.padding) + brickInfo.offsetX;
        const y = j * (brickInfo.h + brickInfo.padding) + brickInfo.offsetY;
        bricks[i][j] = { x, y, ...brickInfo };
    }
}

/* * * * * * * * * * * * * Draw elements in canvas* * * * * * * * * * * *  */
//Draw paddle
function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddle.x, paddle.y, paddle.w, paddle.h);
    ctx.fillStyle = '#0095dd';
    ctx.fill();
    ctx.closePath();
}

//Draw ball on canvas
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095dd';
    ctx.fill();
    ctx.closePath();
}

//draw score
function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width - 100, 30);
}

//draw bricks on canvas
function drawBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            ctx.beginPath();
            ctx.rect(brick.x, brick.y, brick.w, brick.h);
            ctx.fillStyle = brick.visible ? "#0095dd" : "transparent";
            ctx.fill();
            ctx.closePath();
        })
    })
}

//Drawe everthing
function draw() {
    //clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBall();
    drawPaddle();
    drawScore();
    drawBricks();
}

/* * * * * * * * * * * * * Functions  * * * * * * * * * * * *  */

function increaseScore() {
    score++;
    if (score === brickRowCount * brickColumnCount) {
        showAllBricks();
    }
}

function showAllBricks() {
    bricks.forEach(column => {
        column.forEach(brick => {
            brick.visible = true;
        })
    })
}

//show final scores
function showScores(score) {
    if (score !== 0) {
        scoreListEl.innerHTML += `<li>${score}</li>`;
    }
}

function showFinalScore(score) {
    if (score !== 0) {
        finalScore.innerText = score;
    }
}

//Game over
function gameOver() {
    ball.y += 18;
    ball.x += -18;
    ball.dx = 0;
    ball.dy = 0;
    playAgainEl.style.display = "block";
}

//Play again
function playAgain() {
    score = 0;
    pause = false;
    showAllBricks();
    playAgainEl.style.display = "none";
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = canvas.width / 2 - 40;
    paddle.y = canvas.height - 20;
    update();
}

/* * * * * * * * * * * * * Animation Part * * * * * * * * * * * *  */
// Move paddle by set paddle.x 
function movePaddle() {
    paddle.x += paddle.dx;
    // Wall detection, make the paddle stop while hit the side walls
    if (paddle.x + paddle.w > canvas.width) {
        paddle.x = canvas.width - paddle.w;
    }

    if (paddle.x < 0) {
        paddle.x = 0;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (right/left), so when ball hit both side, it's position goes reverse
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx *= -1;
    }

    //Wall collision (up/down)
    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    // Paddle collision
    if (ball.x - ball.radius > paddle.x &&
        ball.x + ball.radius < paddle.x + paddle.w &&
        ball.y + ball.radius > paddle.y) {
        //same result as ball.dy *= -1
        ball.dy = -ball.speed;
    }

    // Brick collision. make hit ball to be invisible
    bricks.forEach(column => {
        column.forEach(brick => {
            if (brick.visible) {
                if (
                    ball.x - ball.radius > brick.x && //left brick side check
                    ball.x + ball.radius < brick.x + brick.w && //right brick side
                    ball.y + ball.radius > brick.y && //top
                    ball.y - ball.radius < brick.y + brick.h //bottom
                ) {
                    ball.dy *= -1;
                    brick.visible = false;
                    increaseScore();
                }
            }
        })
    })

    // Hit bottom wall - lose
    if (ball.y + ball.radius > canvas.height) {
        gameOver();
        showFinalScore(score);
        showScores(score);
        pause = true;
    }
}

/* * * * * * * * * * * * * Update canvas drawing and animation* * * * * * * * * * * *  */

function update() {
    if (pause) return;
    movePaddle();
    moveBall();
    //draw everthing
    draw();
    requestAnimationFrame(update);
}


/* * * * * * * * * * * * * Event funcitons* * * * * * * * * * * *  */
// when press right or left key, make the paddle move as the speed
//every movement is drawing a whole new canvas
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        paddle.dx = paddle.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        paddle.dx = -paddle.speed;
    }
}

// When the key is up, set dx value to 0 to stop paddle movement
function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Right' || e.key === 'Left') {
        paddle.dx = 0;
    }
}


/* * * * * * * * * * * * * Event handler* * * * * * * * * * * *  */
rulesBtn.addEventListener('click', () => {
    rules.classList.add("show");
})

closeBtn.addEventListener('click', () => {
    rules.classList.remove('show');
})

startBtn.addEventListener('click', update);

easyModeBtn.addEventListener('click', () => {
    paddle.w = 100;
})
normalModeBtn.addEventListener('click', () => {
    paddle.w = 80;
})
playAgainBtn.addEventListener('click', playAgain);

//Keyboard event
document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

draw();
