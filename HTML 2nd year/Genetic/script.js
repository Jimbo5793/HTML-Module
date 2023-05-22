// Genetic algorithm parameters
const populationSize = 100;
const mutationRate = 0.1;
const elitismCount = 2;
const maxGeneration = 100;

// Start the algorithm
function startAlgorithm() {
    const input = document.getElementById("input").value;
    const tests = parseTests(input);

    let generation = 0;

    // Create initial population
    let population = [];
    for (let i = 0; i < populationSize; i++) {
        population.push(generateCode());
    }

    // Evolve the population
    while (generation < maxGeneration) {
        // Evaluate fitness of each solution
        const fitness = evaluateFitness(population, tests);

        // Sort population by fitness (best to worst)
        population.sort((a, b) => fitness[b] - fitness[a]);

        // Display best solution
        const bestSolution = population[0];
        document.getElementById("output").textContent = bestSolution;

        // Generate next generation
        const nextGeneration = [];
        for (let i = 0; i < elitismCount; i++) {
            nextGeneration.push(population[i]);
        }
        while (nextGeneration.length < populationSize) {
            const parentA = selectParent(population, fitness);
            const parentB = selectParent(population, fitness);
            const child = crossover(parentA, parentB);
            nextGeneration.push(child);
        }
        population = nextGeneration;

        generation++;
    }
}

// Parse tests from CSV input
function parseTests(input) {
    const lines = input.trim().split("\n");
    const tests = [];
    for (let i = 0; i < lines.length; i++) {
        const parts = lines[i].split(",");
        tests.push({
            input: parts[0],
            expectedOutput: parts[1]
        });
    }
    return tests;
}

// Generate a random code solution
function generateCode() {
    // Generate a random string of code
    const codeLength = Math.floor(Math.random() * 20) + 10;
    let code = "";
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
}

// Evaluate fitness of each solution
function evaluateFitness(population, tests) {
    const fitness = [];
    for (let i = 0; i < population.length; i++) {
        const solution = population[i];
        let score = 0;
        for (let j = 0; j < tests.length; j++) {
            const test = tests[j];
            const output = executeCode(solution, test.input);
            if (output === test.expectedOutput) {
                score++;
            }
        }
        fitness[i] = score;
    }
    return fitness;
}

// Execute the code and get the output
function executeCode(code, input) {
    // Replace a placeholder in the code with the input
    const placeholder = "#input";
    const modifiedCode = code.replace(placeholder, input);

    // Execute the code (custom implementation for demonstration purposes)
    // Replace this with your actual code execution logic
    const output = "Result: " + modifiedCode;

    return output;
}

// Select a parent based on fitness (roulette wheel selection)
function selectParent(population, fitness) {
    const totalFitness = fitness.reduce((a, b) => a + b, 0);
    let threshold = Math.random() * totalFitness;
    let sum = 0;
    for (let i = 0; i < population.length; i++) {
        sum += fitness[i];
        if (sum >= threshold) {
            return population[i];
        }
    }
}

// Crossover two parents to create a child
function crossover(parentA, parentB) {
    const splitPoint = Math.floor(Math.random() * parentA.length);
    const child = parentA.slice(0, splitPoint) + parentB.slice(splitPoint);
    return mutate(child);
}

// Mutate a code string by randomly changing characters
function mutate(code) {
    const codeArray = code.split("");
    for (let i = 0; i < codeArray.length; i++) {
        if (Math.random() < mutationRate) {
            const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
            const randomIndex = Math.floor(Math.random() * characters.length);
            codeArray[i] = characters.charAt(randomIndex);
        }
    }
    return codeArray.join("");
}
