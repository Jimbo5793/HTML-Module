alert("If you see this, everything should be working!")

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

    const heuristic = document.querySelector('input[name="heuristic"]:checked').value;

    const openSet = new Set([start]);
    const cameFrom = new Map();
    const gScore = new Map([[start, 0]]);
    const fScore = new Map([[start, heuristic === "euclidean" ? euclideanHeuristic(...start, ...end) : manhattanHeuristic(...start, ...end)]]);

    while (openSet.size > 0) {
        const current = [...openSet].reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);
        if (current[0] === end[0] && current[1] === end[1]) {
            drawPath(cameFrom, end);
            return;
        }
        openSet.delete(current);
        const neighbors = [
            [current[0] - 1, current[1] - 1],
            [current[0] - 1, current[1]],
            [current[0] - 1, current[1] + 1],
            [current[0], current[1] - 1],
            [current[0], current[1] + 1],
            [current[0] + 1, current[1] - 1],
            [current[0] + 1, current[1]],
            [current[0] + 1, current[1] + 1],
        ];
        
        neighbors.forEach(neighbor => {
            if (neighbor[0] < 0 || neighbor[0] >= maxSize || neighbor[1] < 0 || neighbor[1] >= maxSize || grid[neighbor[1]][neighbor[0]] === 1) {
                return;
            }

            const tentativeGScore = gScore.get(current) + 1;

            if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                fScore.set(neighbor, tentativeGScore + (heuristic === "euclidean" ? euclideanHeuristic(...neighbor, ...end) : manhattanHeuristic(...neighbor, ...end)));
                openSet.add(neighbor);
            }
        });
    }

    alert("No path found.");
}

function drawPath(cameFrom, current) {
    while (cameFrom.has(current)) {
        const prev = cameFrom.get(current);
        ctx.beginPath();
        ctx.moveTo(current[0] * cellSize + cellSize / 2, current[1] * cellSize + cellSize / 2);
        ctx.lineTo(prev[0] * cellSize + cellSize / 2, prev[1] * cellSize + cellSize / 2);
        ctx.strokeStyle = "#0000FF";
        ctx.stroke();
        current = prev;
    }
}

canvas.addEventListener("click", event => {
    const x = Math.floor(event.offsetX / cellSize);
    const y = Math.floor(event.offsetY / cellSize);
    if (x < 0 || x >= maxSize || y < 0 || y >= maxSize) {
        return;
    }
    if (start && start[0] === x && start[1] === y) {
        start = null;
        drawEmpty(x, y);
        return;
    }
    if (end && end[0] === x && end[1] === y) {
        end = null;
        drawEmpty(x, y);
        return;
    }
    if (!start) {
        start = [x, y];
        drawStart(x, y);
    } else if (!end) {
        end = [x, y];
        drawEnd(x, y);
    } else {
        grid[y][x] = grid[y][x] === 1 ? 0 : 1;
        grid[y][x] === 1 ? drawWall(x, y) : drawEmpty(x, y);
    }
});

document.getElementById("find-path-button").addEventListener("click", findPath);

document.getElementById("clear-canvas-button").addEventListener("click", clearCanvas);