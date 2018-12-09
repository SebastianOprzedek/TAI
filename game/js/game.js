const c = document.getElementById("canvas");
const context = c.getContext("2d");
const height = window.innerHeight;
const width = window.innerWidth;
const radius = 80;
const platformWidth = 250;
const platformHeight = 50;
const platformYPosition = height - platformHeight - 200;
const platformGap = 200;
const numberOfPlatforms = Math.floor((width + platformGap) / (platformWidth + platformGap));
const fillColor = '#F93';
const strokeSize = 5;
const strokeColor = '#C40';
const period = 0.0005;
voiceVolumeTriggerLevel = 250;
numberOfSamples = 10;
let x = radius;
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
    if(!over) {
        calculatePositions();
        checkIfOver();
    }
    else
        y--;
    drawCircle(context, x, platformYPosition - radius - y, radius, fillColor, strokeSize, strokeColor);
    for (let i = 0; i < numberOfPlatforms; i++) {
        drawPlatform(context, i * (platformWidth + platformGap), platformYPosition, platformWidth, platformHeight, fillColor, strokeSize, strokeColor);
    }
}

function checkIfOver(){
    if(y < 0)
        over = true;
}

function calculatePositions(){
    if(moving)
        x++;
    if (isJumpTriggered())
        jump();
    if (isMovingTriggered())
        startMoving();
    if (isMovingStopped())
        stopMoving();
    if (x > (width + radius))
        x = radius;
    if(y > 0 || !isOnPlatform())
        y--;
}

function isOnPlatform(){
    for (let i = 0; i < numberOfPlatforms; i++) {
        let platformPosition = i * (platformWidth + platformGap);
        if(x > platformPosition && x < platformPosition + platformWidth)
            return true;
    }
    return false;
}

function initializeCanvas(canvas) {
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

function drawPlatform(ctx, x, y, width, height, fillColor, strokeSize, strokeColor) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    setFigureStyle(ctx, fillColor, strokeSize, strokeColor);
}

function keyUpAction(e) {
    let keyCode = e.keyCode;
    if(keyCode === 39) // RIGHT
        stopMoving();
}

function keyDownAction(e) {
    let keyCode = e.keyCode;
    if(keyCode === 38) // UP
        jump();
    if(keyCode === 39) // RIGHT
        startMoving();
}

function jump(){
    y += 100;
    if(y > (height - radius))
        y = (height - radius);
}

function startMoving(){
    moving = true;
}

function stopMoving(){
    moving = false;
}