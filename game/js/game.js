const c = document.getElementById("canvas");
const context = c.getContext("2d");
const height = window.innerHeight;
const width = window.innerWidth;
const radius = 80;
const fillColor = '#F93';
const strokeSize = 5;
const strokeColor = '#C40';
const period = 0.5;
let x = radius;
let y = 0;

initializeCanvas(c);
setInterval(function () {
    refresh();
}, period);
document.addEventListener("keydown", onKeyDown);

function refresh() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    x++;
    if (x > (width + radius))
        x = radius;
    if(y > 0)
        y--;
    drawCircle(context, x, height - radius - y, radius, fillColor, strokeSize, strokeColor);
}

function initializeCanvas(canvas) {
    canvas.width = width;
    canvas.height = height;
}

function drawCircle(ctx, x, y, r, fillColor, strokeSize, strokeColor) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    context.fillStyle = fillColor;
    context.fill();
    ctx.lineWidth = strokeSize;
    ctx.stroke();
    context.strokeStyle = strokeColor;
}

function onKeyDown(){
    y += 100;
}