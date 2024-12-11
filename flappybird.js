//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 68; 
let birdHeight = 40;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64;
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//backgrounds
let bgImg;
let invertedBgImg;

//physics
let velocityX = -2; // Initial speed of pipes
let velocityY = 0; // Bird jump speed
let gravity = 0.4;

let gameOver = false;
let score = 0;

// Add a variable for pipe speed
let pipeSpeed = -2; // Initial speed of pipes

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // Load images
    birdImg = new Image();
    birdImg.src = "img/flappybird.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "img/toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "img/bottompipe.png";

    // Load background images
    bgImg = new Image();
    bgImg.src = "img/flappybirdbg.png";  // Normal background

    invertedBgImg = new Image();
    invertedBgImg.src = "img/flappybirdbginverted.png";  // Inverted background

    requestAnimationFrame(update);
    setInterval(placePipes, 2000);
    document.addEventListener("keydown", moveBird);
}

function update() {
    requestAnimationFrame(update);

    // Stop game if it's over
    if (gameOver) {
        return;  // Prevent further updates after the game is over
    }

    // Clear the canvas and draw the current background
    context.clearRect(0, 0, board.width, board.height);

    // Change background every 10 points
    if (Math.floor(score / 10) % 2 === 0) {
        context.drawImage(bgImg, 0, 0, board.width, board.height);  // Draw normal background
    } else {
        context.drawImage(invertedBgImg, 0, 0, board.width, board.height);  // Draw inverted background
    }

    context.strokeStyle = "Black"; // Border color
    context.lineWidth = 5; // Border thickness
    context.strokeRect(0, 0, board.width, board.height); // Draw the border

    // Bird physics
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); // Apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Increase the speed of pipes as score increases
    pipeSpeed = -2 - Math.floor(score / 5); // Every 5 points, pipes speed up

    // Pipe movement
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += pipeSpeed; // Use updated speed for the pipes
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        // Only add points for pipes that haven't been passed
        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; // Each pipe set is worth 0.5 to score
            pipe.passed = true;
        }

        // Stop the game if there's a collision with a pipe
        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Clear pipes offscreen only if the game is still active
    if (!gameOver) {
        while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
            pipeArray.shift(); // Removes the first pipe from the array
        }
    }

    // Score at the top center
    context.fillStyle = "white";
    context.font = "45px 'Bangers', sans-serif";  // Bubble font
    context.textAlign = "center"; // Center the text horizontally
    context.textBaseline = "top"; // Align text from the top

    // Draw the black outline by drawing the text multiple times with different offsets
    context.lineWidth = 5; // Outline thickness
    context.strokeText("Score: " + Math.floor(score), boardWidth / 2, 45);

    context.fillText("Score: " + Math.floor(score), boardWidth / 2, 45);

    if (gameOver) {
        // Center the "GAME OVER" message
        let centerX = boardWidth / 2;
        let centerY = boardHeight / 2;

        context.fillStyle = "white"; // Text color for "GAME OVER"
        context.font = "60px 'Bangers', sans-serif";  // Bubble font for Game Over
        context.lineWidth = 5; // Outline thickness

        // Draw the "GAME OVER" text with black outline
        context.strokeText("GAME OVER", centerX, centerY - 20);
        context.fillText("GAME OVER", centerX, centerY - 20);

        // Draw the score below the "GAME OVER" message
        context.fillStyle = "white"; // White color for the score
        context.font = "40px 'Bangers', sans-serif";  // Bubble font for score
        context.strokeText("Score: " + Math.floor(score), centerX, centerY + 40); // Score with black outline
        context.fillText("Score: " + Math.floor(score), centerX, centerY + 40); // Score with white fill
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    //(0-1) * pipeHeight/2.
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // Jump
        velocityY = -6;

        // Reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   // a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   // a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  // a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    // a's bottom left corner passes b's top left corner
}
