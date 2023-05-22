var container = document.getElementById('container');

function createAnt(id, x, y) {
  var ant = document.createElement('div');
  ant.id = 'ant_' + id;
  ant.className = 'ant';
  ant.style.left = x + 'px';
  ant.style.top = y + 'px';
  container.appendChild(ant);
}

function placeFood() {
  var foodX = Math.floor(Math.random() * 480) + 10;
  var foodY = Math.floor(Math.random() * 480) + 10;
  
  var food = document.createElement('div');
  food.className = 'food';
  food.style.left = foodX + 'px';
  food.style.top = foodY + 'px';
  container.appendChild(food);
}

// Example usage: create ants
createAnt(1, 100, 100);
createAnt(2, 200, 200);
createAnt(3, 300, 300);
