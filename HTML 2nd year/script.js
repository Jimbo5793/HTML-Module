alert("if you can see this, everything should be working!")

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const maxSize = 20;
const cellSize = Math.floor(canvas.width / maxSize);
const grid = new Array(maxSize).fill(null).map(() => new Array(maxSize).fill(0));
let start = null;
let end = null;

function drawEmpty(x, y) {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawWall(x, y) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawStart(x, y) {
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function drawEnd(x, y) {
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.forEach((row, y) => {
        row.forEach((cell, x) => {
            grid[y][x] = 0;
        });
    });
    start = null;
    end = null;
}

function euclideanHeuristic(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function manhattanHeuristic(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function findPath() {
    if (!start || !end) {
        alert("Please set start and end markers.");
        return;
    }
    
}

document.getElementById("find-path-button").addEventListener("click", findPath);

document.getElementById("clear-canvas-button").addEventListener("click", clearCanvas);
