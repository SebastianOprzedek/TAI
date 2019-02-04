const c = document.getElementById("canvas");
const context = c.getContext("2d");
//const context = c.getContext("bird");
const height = window.innerHeight;
const width = window.innerWidth;
const platformBottomMargin = 200;
const platformWidth = 250;
const platformHeight = 50;
const bonusHeight = 50;
const bonusBottomMargin = 600;
const platformYPosition = height - platformHeight - platformBottomMargin;
const bonusYPosition = height - bonusHeight - bonusBottomMargin;
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

// Get the modal
let modal = document.getElementById('myModal');

// Get the <span> element that closes the modal
let span = document.getElementsByClassName("close")[0];

let scoreElement = document.getElementById('score');
let lifeElement = document.getElementById("life");
let lifesCounter = 2;
document.getElementById("life").innerHTML = "lifes: " + lifesCounter.toString();

voiceVolumeTriggerLevel = 250;
numberOfSamples = 10;
xAxisFromStart = 0;
points = 0;
listOfPlatforms = new Array();
listOfBonuses = new Array();
sumOfXAxisOfPreviousPlatforms = 0;
let x = 0;
let y = 0;
let moving = false;
let over = false;
let isModalClosed = true;
let isScreenLoaded = false;

loadingScreen();
initializeCanvas(c);
createPlatformList();
createBonusList();
setInterval(function () {
    refresh();
}, period);
document.addEventListener("keyup", keyUpAction);
document.addEventListener("keydown", keyDownAction);

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
    isModalClosed = true;
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
        isModalClosed = true;
    }
};

function refresh() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    shouldReset();
    drawRect(context, x, platformYPosition - squareSize - y, squareSize, squareSize, fillColor, strokeSize, strokeColor);
    let sumOfPlatformXAxis = 0;
    let sumOfBonusXAxis = 500;
    if (x <= borderPlayerShift) {
        //drawImage(context, x, platformYPosition - squareSize - y, squareSize, squareSize, fillColor, strokeSize, strokeColor);
        for (let i = 0; i < listOfPlatforms.length; i++) {
            drawRect(context, sumOfPlatformXAxis, platformYPosition, listOfPlatforms[i].platformWidth, platformHeight, listOfPlatforms[i].color, strokeSize, strokeColor);
            sumOfPlatformXAxis = sumOfPlatformXAxis + listOfPlatforms[i].platformWidth + listOfPlatforms[i].platformGap;
        }
        for (let j = 0; j < listOfBonuses.length; j++) {
            drawRect(context, sumOfBonusXAxis, bonusYPosition, listOfBonuses[j].bonusWidth, listOfBonuses[j].bonusHeight, listOfBonuses[j].color, strokeSize, strokeColor);
            sumOfBonusXAxis = sumOfBonusXAxis + listOfBonuses[j].bonusWidth + listOfBonuses[j].bonusGap;
        }
        sumOfPlatformXAxis = 0;
        sumOfBonusXAxis = 0;
    }
    else {
        if (moving) {
            xAxisFromStart = xAxisFromStart + moveValue;
            x = x - moveValue;
            //drawImage(context, x, platformYPosition - squareSize - y, squareSize, squareSize, fillColor, strokeSize, strokeColor);
        }
        for (let i = 0; i < listOfPlatforms.length; i++) {
            drawRect(context, sumOfPlatformXAxis - xAxisFromStart, platformYPosition, listOfPlatforms[i].platformWidth, platformHeight, listOfPlatforms[i].color, strokeSize, strokeColor);
            sumOfPlatformXAxis = sumOfPlatformXAxis + listOfPlatforms[i].platformWidth + listOfPlatforms[i].platformGap;
        }
        for (let j = 0; j < listOfBonuses.length; j++) {
            drawRect(context, sumOfBonusXAxis - xAxisFromStart, bonusYPosition, listOfBonuses[j].bonusWidth, listOfBonuses[j].bonusHeight, listOfBonuses[j].color, strokeSize, strokeColor);
            sumOfBonusXAxis = sumOfBonusXAxis + listOfBonuses[j].bonusWidth + listOfBonuses[j].bonusGap;
        }
        sumOfBonusXAxis = 0;
        sumOfPlatformXAxis = 0;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomColor() {
    let color = "#F" + getRandomInt(13, 160);
    return color;
}

function createPlatformList() {
    listOfPlatforms = [
        {platformGap: getRandomInt(100, 250), platformWidth: getRandomInt(80, 320), color: getRandomColor()},
    ];
    AddAdditionalPlatforms();
}

function createBonusList() {
    listOfBonuses = [
        {bonusGap: getRandomInt(1000, 2000), bonusWidth: 50, bonusHeight: 50, color: getRandomColor()}
    ];
    AddAdditionalBonuses();
}

function AddAdditionalPlatforms() {
    for (let i = 0; i < 8; i++) {
        listOfPlatforms.push({
            platformGap: getRandomInt(80, 250),
            platformWidth: getRandomInt(80, 320),
            color: getRandomColor()
        })
    }
}

function AddAdditionalBonuses() {
    for (let i = 0; i < 8; i++) {
        listOfBonuses.push({
            bonusGap: getRandomInt(500, 1000),
            bonusWidth: 50,
            bonusHeight: 50,
            color: getRandomColor()
        })
    }
}

function shouldReset() {
    if (!over) {
        calculatePositions();
        checkIfOver();
    }
    else {
        y--;
        if ((y + platformHeight + squareSize) < -platformBottomMargin) {
            //alert("You are dead! Your score: " + points);
            if (lifesCounter < 1) {
                scoreElement.innerText = points.toString();
                modal.style.display = "block";
                isModalClosed = false;
                resetGame();
            }
            else {
                triggerLifeLost();
                over = false;
            }
        }
    }
}

function resetGame() {
    x = 0;
    y = 0;
    moving = false;
    over = false;
    xAxisFromStart = 0;
    listOfPlatforms = [];
    listOfBonuses = [];
    createPlatformList();
    createBonusList();
}

function triggerLifeLost() {
    document.getElementById("life").innerHTML = "lifes: " + lifesCounter.toString();
    y = height;
}

function checkIfOver() {
    if (y < 0) {
        lifesCounter--;
        over = true;
    }
}

function calculatePositions() {
    if (moving)
        x = x + moveValue;
    if (isJumpTriggered() && isModalClosed)
        jump();
    if (isMovingTriggered() && isModalClosed)
        startMoving();
    else
        stopMoving();
    if (x > (width + squareSize))
        x = 0;
    if (y > 0 || !isOnPlatform())
        y--;
}

function isOnPlatform() {
    sumOfXAxisOfPreviousPlatforms = 0;
    for (let i = 0; i < listOfPlatforms.length; i++) {
        let platformPosition = sumOfXAxisOfPreviousPlatforms;
        sumOfXAxisOfPreviousPlatforms = platformPosition + (listOfPlatforms[i].platformWidth + listOfPlatforms[i].platformGap);
        if ((x + squareSize) > platformPosition - xAxisFromStart && x < platformPosition + listOfPlatforms[i].platformWidth - xAxisFromStart) {
            points = i;
            document.getElementById("points").innerHTML = "points: " + points;
            if (listOfPlatforms.length < points + 10) {
                AddAdditionalPlatforms();
            }
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
    sticky.refresh = function () {
        context.drawImage(sticky, 0, 0);
    };
    //ctx.drawImage(, x, y, width, height); 
    //ctx.stroke();
    //setFigureStyle(ctx, fillColor, strokeSize, strokeColor);
    //ctx.toDataURL("assets/bird-icon/png");
    //ctx.drawImage("C:\Users\azslo\Desktop\SIiM\multimedia\assets\bird-icon.png", 10, 10); 
}

function keyUpAction(e) {
    if (!over) {
        let keyCode = e.keyCode;
        if (keyCode === 39) // RIGHT
            stopMoving();
    }
}

function keyDownAction(e) {
    if (!over) {
        let keyCode = e.keyCode;
        if (keyCode === 38) // UP
            jump();
        if (keyCode === 39) // RIGHT
            startMoving();
    }
}

function jump() {
    y += 50;
    if (y > (height - platformBottomMargin))
        y = (height - platformBottomMargin);
}

function startMoving() {
    moving = true;
}

function stopMoving() {
    moving = false;
}

function loadingScreen() {
    var preload = document.getElementById("preload");
    var loading = 0;
    var id = setInterval(frame, 64);

    function frame() {
        if (loading === 60) {
            preload.style.display = "none";
            clearInterval(id);
            //window.open("welcome.html", "_self");
        }
        else {
            loading = loading + 1;
            if (loading === 50) {
                preload.style.animation = "fadeout 1s ease";
            }
        }
    }
}