// Global variable to hold the decision tree structure
var decisionTree = {};

// Function to build the decision tree based on user input
function buildDecisionTree(event) {
  event.preventDefault(); // Prevent form submission
  
  // Get user input
  var node = document.getElementById('node').value;
  var yes = document.getElementById('yes').value;
  var no = document.getElementById('no').value;
  
  // Add node to decision tree
  decisionTree[node] = {
    yes: yes,
    no: no
  };
  
  // Reset form fields
  document.getElementById('nodeForm').reset();
  
  // Rebuild the tree display
  rebuildTree();
}

// Function to rebuild the decision tree display
function rebuildTree() {
  var treeContainer = document.getElementById('tree');
  treeContainer.innerHTML = ''; // Clear previous tree
  
  // Recursive function to build tree nodes
  function buildNode(node, parentElement) {
    var container = document.createElement('div');
    container.innerHTML = node;
    
    var yesButton = document.createElement('button');
    yesButton.textContent = 'Yes';
    yesButton.addEventListener('click', function() {
      buildNode(decisionTree[node].yes, container);
    });
    container.appendChild(yesButton);
    
    var noButton = document.createElement('button');
    noButton.textContent = 'No';
    noButton.addEventListener('click', function() {
      buildNode(decisionTree[node].no, container);
    });
    container.appendChild(noButton);
    
    parentElement.appendChild(container);
  }
  
  // Build the root node
  var rootNode = Object.keys(decisionTree)[0];
  buildNode(rootNode, treeContainer);
}

// Event listener for form submission
document.getElementById('nodeForm').addEventListener('submit', buildDecisionTree);
