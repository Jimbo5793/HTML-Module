// Global variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var spray = false;
var line = false;
var previousX, previousY;

// Event listeners
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mousedown", setPosition);
canvas.addEventListener("mouseenter", setPosition);

// Set the position of the drawing cursor
function setPosition(e) {
  if (spray || line) {
    previousX = e.offsetX;
    previousY = e.offsetY;
  }
}

// Draw on the canvas
function draw(e) {
  if (!spray && !line) return;
  
  if (spray) {
    if (e.buttons !== 1) return;
    ctx.beginPath();
    ctx.arc(e.offsetX, e.offsetY, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (line) {
    if (e.buttons !== 1) {
      previousX = null;
      previousY = null;
      return;
    }
    ctx.beginPath();
    ctx.moveTo(previousX, previousY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    previousX = e.offsetX;
    previousY = e.offsetY;
  }
}

// Toggle between different drawing tools
function toggleTool(tool) {
  spray = tool === "spray";
  line = tool === "line";
}

// Clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
