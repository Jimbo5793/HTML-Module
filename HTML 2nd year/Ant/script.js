// Define the canvas and context variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Define the ant class
class Ant {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }
}

// Define the food class
class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
  }
}

// Create ants and food objects
var ants = [
  new Ant(100, 100),
  new Ant(200, 200),
  new Ant(300, 300)
];
var foods = [];

// Function to draw the ants and food on the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw ants
  ants.forEach(function(ant) {
    ant.draw();
  });

  // Draw food
  foods.forEach(function(food) {
    food.draw();
  });
}

// Function to handle mouse click event and add food at clicked location
function addFood(event) {
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;
  foods.push(new Food(x, y));
  draw();
}

// Add event listener for mouse click to add food
canvas.addEventListener("click", addFood);

// Initial drawing
draw();
