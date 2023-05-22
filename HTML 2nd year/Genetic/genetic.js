// Constants
const NUM_CITIES = 10; // Number of cities
const POPULATION_SIZE = 100; // Number of individuals in the population
const MUTATION_RATE = 0.01; // Rate of mutation

// Create an initial population of random individuals
function createInitialPopulation() {
  let population = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const individual = createRandomIndividual();
    population.push(individual);
  }
  return population;
}

// Create a random individual (path)
function createRandomIndividual() {
  let individual = [];
  for (let i = 0; i < NUM_CITIES; i++) {
    individual.push(i);
  }
  individual = shuffleArray(individual);
  return individual;
}

// Shuffle an array randomly
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Calculate the total distance of a path
function calculateTotalDistance(path) {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const cityA = path[i];
    const cityB = path[i + 1];
    totalDistance += calculateDistance(cityA, cityB);
  }
  return totalDistance;
}

// Calculate the Euclidean distance between two cities
function calculateDistance(cityA, cityB) {
  // Assuming the cities are represented by their coordinates
  const x1 = cityA.x;
  const y1 = cityA.y;
  const x2 = cityB.x;
  const y2 = cityB.y;
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Perform crossover between two parents to create a child
function crossover(parent1, parent2) {
  const start = Math.floor(Math.random() * NUM_CITIES);
  const end = Math.floor(Math.random() * NUM_CITIES);
  const child = parent1.slice(start, end);
  for (let i = 0; i < parent2.length; i++) {
    const gene = parent2[i];
    if (!child.includes(gene)) {
      child.push(gene);
    }
  }
  return child;
}

// Mutate an individual by swapping two cities
function mutate(individual) {
  for (let i = 0; i < individual.length; i++) {
    if (Math.random() < MUTATION_RATE) {
      const indexA = i;
      const indexB = Math.floor(Math.random() * individual.length);
      [individual[indexA], individual[indexB]] = [individual[indexB], individual[indexA]];
    }
  }
  return individual;
}

// Select the best individuals from the population based on their fitness
function selection(population) {
  population.sort((a, b) => calculateTotalDistance(a) - calculateTotalDistance(b));
  return population.slice(0, POPULATION_SIZE / 2);
}

// Run the genetic algorithm
function runGeneticAlgorithm() {
  let population = createInitialPopulation();
  let bestPath = population[0];
  let bestDistance = calculateTotalDistance(bestPath);

  // Visualization: Initialize canvas and draw the best path
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  drawPath(ctx, bestPath);

  let generation = 0;
  const interval = setInterval(() => {
    population = selection(population);
    const children = [];
    while (children.length < POPULATION_SIZE / 2) {
      const parent1 = population[Math.floor(Math.random() * population.length)];
      const parent2 = population[Math.floor(Math.random() * population.length)];
      const child = crossover(parent1, parent2);
      children.push(mutate(child));
    }
    population = population.concat(children);
    const currentBestPath = population[0];
    const currentBestDistance = calculateTotalDistance(currentBestPath);
    if (currentBestDistance < bestDistance) {
      bestPath = currentBestPath;
      bestDistance = currentBestDistance;
      // Visualization: Clear canvas and draw the new best path
      clearCanvas(ctx);
      drawPath(ctx, bestPath);
    }
    generation++;
    if (generation === 100) {
      clearInterval(interval);
    }
  }, 100);
}

// Start the genetic algorithm
function startAlgorithm() {
  runGeneticAlgorithm();
}
