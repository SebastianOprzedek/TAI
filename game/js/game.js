const c = document.getElementById("canvas");
const context = c.getContext("2d");
//const context = c.getContext("bird");
const height = window.innerHeight;
const width = window.innerWidth;
const platformBottomMargin = 200;
const platformWidth = 250;
const platformHeight = 50;
const platformYPosition = height - platformHeight - platformBottomMargin;
const platformGap = 150;
const squareSize = 100;
//const numberOfPlatforms = Math.round((width + platformGap) / (platformWidth + platformGap));
const numberOfPlatforms = 20;
const fillColor = '#F93';
const strokeSize = 5;
const strokeColor = '#C40';
const period = 0.0005;
const borderPlayerShift = 400;
const moveValue = 4;
voiceVolumeTriggerLevel = 250;
numberOfSamples = 10;
xAxisFromStart = 0;
points = 0;
let x = 0;
let y = 0;

let moving = false;
let over = false;

initializeCanvas(c);
setInterval(function () {
    refresh();
}, period);
document.addEventListener("keyup", keyUpAction);
document.addEventListener("keydown", keyDownAction);

function refresh() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    shouldReset();
    drawRect(context, x, platformYPosition - squareSize - y, squareSize, squareSize, fillColor, strokeSize, strokeColor);
    if(x <= borderPlayerShift){
        //drawImage(context, x, platformYPosition - squareSize - y, squareSize, squareSize, fillColor, strokeSize, strokeColor);
        for (let i = 0; i < numberOfPlatforms; i++) {
            drawRect(context, i * (platformWidth + platformGap), platformYPosition, platformWidth, platformHeight, fillColor, strokeSize, strokeColor);
        }
    }
    else{
        if(moving){
            xAxisFromStart = xAxisFromStart + moveValue;
            x = x - moveValue;
            //drawImage(context, x, platformYPosition - squareSize - y, squareSize, squareSize, fillColor, strokeSize, strokeColor);
        }
        for (let i = 0; i < numberOfPlatforms; i++) {
            drawRect(context, i * (platformWidth + platformGap) - xAxisFromStart, platformYPosition, platformWidth, platformHeight, fillColor, strokeSize, strokeColor);
        }
    } 
}

// function refresh() {
//     context.clearRect(0, 0, canvas.width, canvas.height);
//     shouldReset();
//         drawRect(context, x, platformYPosition - squareSize - y, squareSize, squareSize, fillColor, strokeSize, strokeColor);
//         for (let i = 0; i < numberOfPlatforms; i++) {
//             drawRect(context, i * (platformWidth + platformGap), platformYPosition, platformWidth, platformHeight, fillColor, strokeSize, strokeColor);
//     }   
// }

function shouldReset(){
    if(!over) {
        calculatePositions();
        checkIfOver();
    }
    else {
        y--;
        if((y + platformHeight + squareSize) < -platformBottomMargin)
            resetGame();
    }
}

function resetGame(){
    x = 0;
    y = 0;
    moving = false;
    over = false;
    xAxisFromStart = 0;
}

function checkIfOver(){
    if(y < 0)
        over = true;
}

function calculatePositions(){
    if(moving)
        x = x + moveValue;
    if (isJumpTriggered())
        jump();
    if (isMovingTriggered())
        startMoving();
    else
        stopMoving();
    if (x > (width + squareSize))
        x = 0;
    if(y > 0 || !isOnPlatform())
        y--;
}

function isOnPlatform(){
    for (let i = 0; i < numberOfPlatforms; i++) {
        //let platformPosition = i * (platformWidth + platformGap);
        let platformPosition = i * (platformWidth + platformGap) - xAxisFromStart;
        if((x + squareSize) > platformPosition && x < platformPosition + platformWidth){
            points = i;
            document.getElementById("points").innerHTML = "points: " + points;
            return true;
        }     
    }
    return false;
}

function initializeCanvas(canvas) {
    //startScreen();
    canvas.width = width;
    canvas.height = height;
}

function setFigureStyle(ctx, fillColor, strokeSize, strokeColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.lineWidth = strokeSize;
    ctx.stroke();
    ctx.strokeStyle = strokeColor;
}

function drawCircle(ctx, x, y, r, fillColor, strokeSize, strokeColor) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    setFigureStyle(ctx, fillColor, strokeSize, strokeColor);
}

function drawRect(ctx, x, y, width, height, fillColor, strokeSize, strokeColor) {
    //myGamePiece = new component(30, 30, "smiley.gif", 10, 120, "image");
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    setFigureStyle(ctx, fillColor, strokeSize, strokeColor);
    //ctx.toDataURL("assets/bird-icon/png");
    //ctx.drawImage("C:\Users\azslo\Desktop\SIiM\multimedia\assets\bird-icon.png", 10, 10); 
}

function drawImage(ctx, x, y, width, height, fillColor, strokeSize, strokeColor) {
    ctx.beginPath();
    var sticky = new Image();
    sticky.src = "assets\bird-icon.png";
    sticky.refresh = function() {
        context.drawImage(sticky, 0, 0);
    };
    //ctx.drawImage(, x, y, width, height); 
    //ctx.stroke();
    //setFigureStyle(ctx, fillColor, strokeSize, strokeColor);
    //ctx.toDataURL("assets/bird-icon/png");
    //ctx.drawImage("C:\Users\azslo\Desktop\SIiM\multimedia\assets\bird-icon.png", 10, 10); 
}

function keyUpAction(e) {
    if(!over) {
        let keyCode = e.keyCode;
        if (keyCode === 39) // RIGHT
            stopMoving();
    }
}

function keyDownAction(e) {
    if(!over) {
        let keyCode = e.keyCode;
        if(keyCode === 38) // UP
            jump();
        if(keyCode === 39) // RIGHT
            startMoving();
    }
}

function jump(){
    y += 50;
    if(y > (height - platformBottomMargin))
        y = (height - platformBottomMargin);
}

function startMoving(){
    moving = true;
}

function stopMoving(){
    moving = false;
}