///Main code

var canvas, ctx;
var WIDTH, HEIGHT;
var points = [];
var running;
var canvasMinX, canvasMinY;
var doPreciseMutate;

var POPULATION_SIZE;
var ELITE_RATE;
var CROSSOVER_PROBABILITY;
var MUTATION_PROBABILITY;
var OX_CROSSOVER_RATE;
var UNCHANGED_GENS;

var mutationTimes;
var dis;
var bestValue, best;
var currentGeneration;
var currentBest;
var population;
var values;
var fitnessValues;
var roulette;

$(function() {
  init();
  initData();
  points = data200;
  $('#addRandom_btn').click(function() {
    addRandomPoints(50);
    $('#status').text("");
    running = false;
  });
  $('#start_btn').click(function() { 
    if(points.length >= 3) {
      initData();
      GAInitialize();
      running = true;
    } else {
      alert("add some more points to the map!");
    }
  });
  $('#clear_btn').click(function() {
    running === false;
    initData();
    points = new Array();
  });
  $('#stop_btn').click(function() {
    if(running === false && currentGeneration !== 0){
      if(best.length !== points.length) {
          initData();
          GAInitialize();
      }
      running = true;
    } else {
      running = false;
    }
  });
});
function init() {
  ctx = $('#canvas')[0].getContext("2d");
  WIDTH = $('#canvas').width();
  HEIGHT = $('#canvas').height();
  setInterval(draw, 10);
  init_mouse();
}
function init_mouse() {
  $("canvas").click(function(evt) {
    if(!running) {
      canvasMinX = $("#canvas").offset().left;
      canvasMinY = $("#canvas").offset().top;
      $('#status').text("");

      x = evt.pageX - canvasMinX;
      y = evt.pageY - canvasMinY;
      points.push(new Point(x, y));
    }
  });
}
function initData() {
  running = false;
  POPULATION_SIZE = 30;
  ELITE_RATE = 0.3;
  CROSSOVER_PROBABILITY = 0.9;
  MUTATION_PROBABILITY  = 0.01;
  //OX_CROSSOVER_RATE = 0.05;
  UNCHANGED_GENS = 0;
  mutationTimes = 0;
  doPreciseMutate = true;

  bestValue = undefined;
  best = [];
  currentGeneration = 0;
  currentBest;
  population = []; //new Array(POPULATION_SIZE);
  values = new Array(POPULATION_SIZE);
  fitnessValues = new Array(POPULATION_SIZE);
  roulette = new Array(POPULATION_SIZE);
}
function addRandomPoints(number) {
  running = false;
  for(var i = 0; i<number; i++) {
    points.push(randomPoint());
  }
}
function drawCircle(point) {
  ctx.fillStyle   = '#000';
  ctx.beginPath();
  ctx.arc(point.x, point.y, 3, 0, Math.PI*2, true);
  ctx.closePath();
  ctx.fill();
}
function drawLines(array) {
  ctx.strokeStyle = '#f00';
  ctx.lineWidth = 1;
  ctx.beginPath();

  ctx.moveTo(points[array[0]].x, points[array[0]].y);
  for(var i=1; i<array.length; i++) {
    ctx.lineTo( points[array[i]].x, points[array[i]].y )
  }
  ctx.lineTo(points[array[0]].x, points[array[0]].y);

  ctx.stroke();
  ctx.closePath();
}
function draw() {
  if(running) {
    GANextGeneration();
    $('#status').text("There are " + points.length + " cities in the map, "
                      +"the " + currentGeneration + "th generation with "
                      + mutationTimes + " times of mutation. best value: "
                      + ~~(bestValue));
  } else {
    $('#status').text("There are " + points.length + " Cities in the map. ")
  }
  clearCanvas();
  if (points.length > 0) {
    for(var i=0; i<points.length; i++) {
      drawCircle(points[i]);
    }
    if(best.length === points.length) {
      drawLines(best);
    }
  }
}
function clearCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
}


///Main code ends

/////////////////////////////////////

///Algorithms

function GAInitialize() {
    countDistances();
    for(var i=0; i<POPULATION_SIZE; i++) {
      population.push(randomIndivial(points.length));
    }
    setBestValue();
  }
  function GANextGeneration() {
    currentGeneration++;
    selection();
    crossover();
    mutation();
  
    setBestValue();
  }
  function tribulate() {
    for(var i=population.length>>1; i<POPULATION_SIZE; i++) {
      population[i] = randomIndivial(points.length);
    }	
  }
  function selection() {
    var parents = new Array();
    var initnum = 4;
    parents.push(population[currentBest.bestPosition]);
    parents.push(doMutate(best.clone()));
    parents.push(pushMutate(best.clone()));
    parents.push(best.clone());
  
    setRoulette();
    for(var i=initnum; i<POPULATION_SIZE; i++) {
      parents.push(population[wheelOut(Math.random())]);
    }
    population = parents;
  }
  function crossover() {
    var queue = new Array();
    for(var i=0; i<POPULATION_SIZE; i++) {
      if( Math.random() < CROSSOVER_PROBABILITY ) {
        queue.push(i);
      }
    } 
    queue.shuffle();
    for(var i=0, j=queue.length-1; i<j; i+=2) {
      doCrossover(queue[i], queue[i+1]);
      //oxCrossover(queue[i], queue[i+1]);
    }
  }
  function doCrossover(x, y) {
    child1 = getChild('next', x, y);
    child2 = getChild('previous', x, y);
    population[x] = child1;
    population[y] = child2;
  }
  function getChild(fun, x, y) {
    solution = new Array();
    var px = population[x].clone();
    var py = population[y].clone();
    var dx,dy;
    var c = px[randomNumber(px.length)];
    solution.push(c);
    while(px.length > 1) {
      dx = px[fun](px.indexOf(c));
      dy = py[fun](py.indexOf(c));
      px.deleteByValue(c);
      py.deleteByValue(c);
      c = dis[c][dx] < dis[c][dy] ? dx : dy;
      solution.push(c);
    }
    return solution;
  }
  function mutation() {
    for(var i=0; i<POPULATION_SIZE; i++) {
      if(Math.random() < MUTATION_PROBABILITY) {
        if(Math.random() > 0.5) {
          population[i] = pushMutate(population[i]);
        } else {
          population[i] = doMutate(population[i]);
        }
        i--;
      }
    }
  }
  function preciseMutate(orseq) {  
    var seq = orseq.clone();
    if(Math.random() > 0.5){
      seq.reverse();
    }
    var bestv = evaluate(seq);
    for(var i=0; i<(seq.length>>1); i++) {
      for(var j=i+2; j<seq.length-1; j++) {
        var new_seq = swap_seq(seq, i,i+1,j,j+1);
        var v = evaluate(new_seq);
        if(v < bestv) {bestv = v, seq = new_seq; };
      }
    }
    //alert(bestv);
    return seq;
  }
  function preciseMutate1(orseq) {  
    var seq = orseq.clone();
    var bestv = evaluate(seq);
  
    for(var i=0; i<seq.length-1; i++) {
      var new_seq = seq.clone();
      new_seq.swap(i, i+1);
      var v = evaluate(new_seq);
      if(v < bestv) {bestv = v, seq = new_seq; };
    }
    //alert(bestv);
    return seq;
  }
  function swap_seq(seq, p0, p1, q0, q1) {
    var seq1 = seq.slice(0, p0);
    var seq2 = seq.slice(p1+1, q1);
    seq2.push(seq[p0]);
    seq2.push(seq[p1]);
    var seq3 = seq.slice(q1, seq.length);
    return seq1.concat(seq2).concat(seq3);
  }
  function doMutate(seq) {
    mutationTimes++;
    // m and n refers to the actual index in the array
    // m range from 0 to length-2, n range from 2...length-m
    do {
      m = randomNumber(seq.length - 2);
      n = randomNumber(seq.length);
    } while (m>=n)
  
      for(var i=0, j=(n-m+1)>>1; i<j; i++) {
        seq.swap(m+i, n-i);
      }
      return seq;
  }
  function pushMutate(seq) {
    mutationTimes++;
    var m,n;
    do {
      m = randomNumber(seq.length>>1);
      n = randomNumber(seq.length);
    } while (m>=n)
  
    var s1 = seq.slice(0,m);
    var s2 = seq.slice(m,n)
    var s3 = seq.slice(n,seq.length);
    return s2.concat(s1).concat(s3).clone();
  }
  function setBestValue() {
    for(var i=0; i<population.length; i++) {
      values[i] = evaluate(population[i]);
    }
    currentBest = getCurrentBest();
    if(bestValue === undefined || bestValue > currentBest.bestValue) {
      best = population[currentBest.bestPosition].clone();
      bestValue = currentBest.bestValue;
      UNCHANGED_GENS = 0;
    } else {
      UNCHANGED_GENS += 1;
    }
  }
  function getCurrentBest() {
    var bestP = 0,
    currentBestValue = values[0];
  
    for(var i=1; i<population.length; i++) {
      if(values[i] < currentBestValue) {
        currentBestValue = values[i];
        bestP = i;
      }
    }
    return {
      bestPosition : bestP
      , bestValue    : currentBestValue
    }
  }
  function setRoulette() {
    //calculate all the fitness
    for(var i=0; i<values.length; i++) { fitnessValues[i] = 1.0/values[i]; }
    //set the roulette
    var sum = 0;
    for(var i=0; i<fitnessValues.length; i++) { sum += fitnessValues[i]; }
    for(var i=0; i<roulette.length; i++) { roulette[i] = fitnessValues[i]/sum; }
    for(var i=1; i<roulette.length; i++) { roulette[i] += roulette[i-1]; }
  }
  function wheelOut(rand) {
    var i;
    for(i=0; i<roulette.length; i++) {
      if( rand <= roulette[i] ) {
        return i;
      }
    }
  }
  function randomIndivial(n) {
    var a = [];
    for(var i=0; i<n; i++) {
      a.push(i);
    }
    return a.shuffle();
  }
  function evaluate(indivial) {
    var sum = dis[indivial[0]][indivial[indivial.length - 1]];
    for(var i=1; i<indivial.length; i++) {
      sum += dis[indivial[i]][indivial[i-1]];
    }
    return sum;
  }
  function countDistances() {
    var length = points.length;
    dis = new Array(length);
    for(var i=0; i<length; i++) {
      dis[i] = new Array(length);
      for(var j=0; j<length; j++) {
        dis[i][j] = ~~distance(points[i], points[j]); 
      }
    }
  }
  
  ///Algorithms End

  ///////////////////////////////////////

  ///Utilities

  Array.prototype.clone = function() { return this.slice(0); }
Array.prototype.shuffle = function() {
  for(var j, x, i = this.length-1; i; j = randomNumber(i), x = this[--i], this[i] = this[j], this[j] = x);
  return this;
};
Array.prototype.indexOf = function (value) {	
  for(var i=0; i<this.length; i++) {
    if(this[i] === value) {
      return i;
    }
  }
}
Array.prototype.deleteByValue = function (value) {
  var pos = this.indexOf(value);
  this.splice(pos, 1);
}
Array.prototype.next = function (index) {
  if(index === this.length-1) {
    return this[0];
  } else {
    return this[index+1];
  }
}
Array.prototype.previous = function (index) {
  if(index === 0) {
    return this[this.length-1];
  } else {
    return this[index-1];
  }
}
Array.prototype.swap = function (x, y) {
  if(x>this.length || y>this.length || x === y) {return}
  var tem = this[x];
  this[x] = this[y];
  this[y] = tem;
}
Array.prototype.roll = function () {
  var rand = randomNumber(this.length);
  var tem = [];
  for(var i = rand; i<this.length; i++) {
    tem.push(this[i]);
  }
  for(var i = 0; i<rand; i++) {
    tem.push(this[i]);
  }
  return tem;
}
Array.prototype.reject = function (array) {
  return $.map(this,function (ele) {
    return $.inArray(ele, array) < 0 ? ele : null;
  })
}
function intersect(x, y) {
  return $.map(x, function (xi) {
    return $.inArray(xi, y) < 0 ? null : xi;
  })
}
function Point(x, y) {
  this.x = x;
  this.y = y;
}
function randomPoint() {
  var randomx = randomNumber(WIDTH);
  var randomy = randomNumber(HEIGHT);
  var randomPoint = new Point(randomx, randomy);
  return randomPoint; 
}
function randomNumber(boundary) {
  return parseInt(Math.random() * boundary);
  //return Math.floor(Math.random() * boundary);
}
function distance(p1, p2) {
  return euclidean(p1.x-p2.x, p1.y-p2.y);
}
function euclidean(dx, dy) {
  return Math.sqrt(dx*dx + dy*dy);
}

///Utilities End

///////////////////////////////////////////////////////////////

data40 = [{"x":116,"y":404},{"x":161,"y":617},{"x":16,"y":97},{"x":430,"y":536},{"x":601,"y":504},{"x":425,"y":461},{"x":114,"y":544},{"x":127,"y":118},{"x":163,"y":357},{"x":704,"y":104},{"x":864,"y":125},{"x":847,"y":523},{"x":742,"y":170},{"x":204,"y":601},{"x":421,"y":377},{"x":808,"y":49},{"x":860,"y":466},{"x":844,"y":294},{"x":147,"y":213},{"x":550,"y":124},{"x":238,"y":313},{"x":57,"y":572},{"x":664,"y":190},{"x":612,"y":644},{"x":456,"y":154},{"x":120,"y":477},{"x":542,"y":313},{"x":620,"y":29},{"x":245,"y":246},{"x":611,"y":578},{"x":627,"y":373},{"x":534,"y":286},{"x":577,"y":545},{"x":539,"y":340},{"x":794,"y":328},{"x":855,"y":139},{"x":700,"y":47},{"x":275,"y":593},{"x":130,"y":196},{"x":863,"y":35}];

data200 = [{"x":150,"y":172},{"x":822,"y":244},{"x":619,"y":220},{"x":243,"y":433},{"x":9,"y":48},{"x":541,"y":402},{"x":540,"y":212},{"x":479,"y":646},{"x":545,"y":90},{"x":811,"y":355},{"x":314,"y":325},{"x":337,"y":487},{"x":675,"y":76},{"x":629,"y":375},{"x":809,"y":105},{"x":269,"y":135},{"x":423,"y":592},{"x":558,"y":288},{"x":622,"y":70},{"x":740,"y":495},{"x":508,"y":79},{"x":40,"y":236},{"x":818,"y":252},{"x":811,"y":480},{"x":458,"y":220},{"x":293,"y":220},{"x":582,"y":275},{"x":188,"y":542},{"x":300,"y":235},{"x":690,"y":649},{"x":166,"y":565},{"x":400,"y":80},{"x":121,"y":498},{"x":603,"y":587},{"x":729,"y":89},{"x":723,"y":23},{"x":171,"y":609},{"x":523,"y":449},{"x":668,"y":102},{"x":328,"y":531},{"x":468,"y":588},{"x":600,"y":239},{"x":312,"y":636},{"x":344,"y":112},{"x":267,"y":184},{"x":292,"y":615},{"x":21,"y":401},{"x":650,"y":266},{"x":535,"y":393},{"x":796,"y":598},{"x":29,"y":412},{"x":528,"y":363},{"x":344,"y":152},{"x":314,"y":35},{"x":138,"y":191},{"x":643,"y":341},{"x":350,"y":423},{"x":319,"y":542},{"x":797,"y":659},{"x":66,"y":296},{"x":761,"y":574},{"x":26,"y":270},{"x":129,"y":509},{"x":24,"y":312},{"x":89,"y":635},{"x":454,"y":34},{"x":717,"y":189},{"x":476,"y":457},{"x":471,"y":212},{"x":74,"y":457},{"x":406,"y":221},{"x":701,"y":313},{"x":719,"y":642},{"x":573,"y":424},{"x":250,"y":231},{"x":748,"y":334},{"x":318,"y":453},{"x":815,"y":92},{"x":198,"y":47},{"x":79,"y":451},{"x":502,"y":582},{"x":471,"y":355},{"x":509,"y":257},{"x":727,"y":290},{"x":476,"y":281},{"x":609,"y":576},{"x":772,"y":72},{"x":263,"y":156},{"x":411,"y":203},{"x":100,"y":254},{"x":29,"y":208},{"x":625,"y":349},{"x":789,"y":163},{"x":300,"y":224},{"x":637,"y":57},{"x":789,"y":153},{"x":429,"y":427},{"x":571,"y":355},{"x":426,"y":348},{"x":620,"y":545},{"x":601,"y":322},{"x":600,"y":441},{"x":519,"y":357},{"x":59,"y":262},{"x":878,"y":621},{"x":712,"y":592},{"x":202,"y":341},{"x":300,"y":41},{"x":87,"y":647},{"x":735,"y":60},{"x":289,"y":110},{"x":126,"y":133},{"x":375,"y":584},{"x":421,"y":469},{"x":775,"y":341},{"x":656,"y":534},{"x":225,"y":634},{"x":520,"y":339},{"x":865,"y":515},{"x":457,"y":378},{"x":293,"y":141},{"x":202,"y":293},{"x":347,"y":423},{"x":186,"y":284},{"x":572,"y":600},{"x":319,"y":412},{"x":685,"y":73},{"x":845,"y":248},{"x":834,"y":339},{"x":391,"y":571},{"x":139,"y":346},{"x":635,"y":352},{"x":401,"y":117},{"x":381,"y":281},{"x":471,"y":552},{"x":793,"y":585},{"x":279,"y":520},{"x":783,"y":520},{"x":374,"y":38},{"x":458,"y":479},{"x":869,"y":15},{"x":626,"y":216},{"x":148,"y":604},{"x":560,"y":109},{"x":342,"y":141},{"x":426,"y":536},{"x":697,"y":414},{"x":283,"y":18},{"x":172,"y":181},{"x":206,"y":227},{"x":763,"y":291},{"x":439,"y":124},{"x":523,"y":388},{"x":338,"y":211},{"x":30,"y":593},{"x":187,"y":498},{"x":126,"y":86},{"x":4,"y":58},{"x":566,"y":329},{"x":524,"y":486},{"x":788,"y":334},{"x":346,"y":194},{"x":506,"y":231},{"x":135,"y":190},{"x":288,"y":406},{"x":200,"y":515},{"x":739,"y":91},{"x":300,"y":439},{"x":725,"y":420},{"x":83,"y":612},{"x":665,"y":336},{"x":848,"y":246},{"x":865,"y":521},{"x":3,"y":406},{"x":187,"y":431},{"x":462,"y":564},{"x":530,"y":648},{"x":708,"y":173},{"x":325,"y":96},{"x":4,"y":480},{"x":530,"y":512},{"x":780,"y":126},{"x":614,"y":610},{"x":359,"y":431},{"x":343,"y":640},{"x":453,"y":182},{"x":648,"y":477},{"x":447,"y":258},{"x":23,"y":465},{"x":455,"y":215},{"x":534,"y":396},{"x":869,"y":337},{"x":511,"y":290},{"x":683,"y":291},{"x":328,"y":370},{"x":160,"y":497},{"x":144,"y":203},{"x":717,"y":222},{"x":31,"y":376},{"x":452,"y":600}];
data500 = [{"x":780,"y":560},{"x":631,"y":173},{"x":452,"y":237},{"x":789,"y":506},{"x":308,"y":175},{"x":797,"y":157},{"x":524,"y":583},{"x":241,"y":7},{"x":340,"y":105},{"x":787,"y":19},{"x":168,"y":342},{"x":685,"y":386},{"x":739,"y":195},{"x":408,"y":550},{"x":581,"y":577},{"x":762,"y":406},{"x":14,"y":370},{"x":275,"y":610},{"x":38,"y":484},{"x":699,"y":148},{"x":780,"y":272},{"x":686,"y":611},{"x":42,"y":650},{"x":257,"y":329},{"x":1,"y":260},{"x":432,"y":448},{"x":805,"y":546},{"x":268,"y":472},{"x":174,"y":154},{"x":189,"y":432},{"x":869,"y":653},{"x":371,"y":337},{"x":192,"y":279},{"x":322,"y":118},{"x":842,"y":584},{"x":809,"y":381},{"x":717,"y":250},{"x":77,"y":575},{"x":654,"y":21},{"x":859,"y":146},{"x":534,"y":561},{"x":732,"y":227},{"x":154,"y":371},{"x":263,"y":148},{"x":64,"y":524},{"x":689,"y":553},{"x":316,"y":358},{"x":587,"y":374},{"x":679,"y":125},{"x":234,"y":501},{"x":282,"y":403},{"x":671,"y":107},{"x":703,"y":347},{"x":116,"y":408},{"x":655,"y":593},{"x":120,"y":196},{"x":111,"y":240},{"x":686,"y":271},{"x":237,"y":213},{"x":463,"y":562},{"x":543,"y":240},{"x":832,"y":406},{"x":705,"y":280},{"x":359,"y":252},{"x":494,"y":575},{"x":339,"y":85},{"x":719,"y":115},{"x":709,"y":564},{"x":752,"y":178},{"x":412,"y":599},{"x":207,"y":524},{"x":812,"y":359},{"x":13,"y":500},{"x":635,"y":477},{"x":243,"y":236},{"x":400,"y":381},{"x":639,"y":551},{"x":407,"y":65},{"x":39,"y":619},{"x":508,"y":170},{"x":150,"y":115},{"x":789,"y":353},{"x":64,"y":178},{"x":831,"y":434},{"x":539,"y":83},{"x":671,"y":317},{"x":806,"y":479},{"x":383,"y":335},{"x":405,"y":103},{"x":437,"y":549},{"x":62,"y":590},{"x":589,"y":296},{"x":536,"y":539},{"x":375,"y":541},{"x":659,"y":326},{"x":582,"y":600},{"x":482,"y":73},{"x":229,"y":8},{"x":545,"y":292},{"x":537,"y":174},{"x":704,"y":273},{"x":106,"y":487},{"x":759,"y":575},{"x":460,"y":358},{"x":85,"y":6},{"x":556,"y":112},{"x":347,"y":196},{"x":856,"y":88},{"x":612,"y":395},{"x":459,"y":195},{"x":198,"y":431},{"x":102,"y":14},{"x":750,"y":403},{"x":87,"y":37},{"x":719,"y":146},{"x":353,"y":405},{"x":633,"y":476},{"x":806,"y":313},{"x":529,"y":509},{"x":772,"y":55},{"x":298,"y":527},{"x":546,"y":522},{"x":7,"y":72},{"x":118,"y":337},{"x":377,"y":216},{"x":816,"y":327},{"x":227,"y":167},{"x":715,"y":422},{"x":324,"y":516},{"x":847,"y":170},{"x":752,"y":422},{"x":657,"y":570},{"x":539,"y":450},{"x":285,"y":556},{"x":381,"y":168},{"x":317,"y":251},{"x":303,"y":197},{"x":797,"y":50},{"x":820,"y":193},{"x":739,"y":85},{"x":623,"y":118},{"x":422,"y":73},{"x":696,"y":205},{"x":534,"y":450},{"x":511,"y":263},{"x":648,"y":110},{"x":601,"y":518},{"x":111,"y":627},{"x":771,"y":572},{"x":797,"y":303},{"x":335,"y":332},{"x":344,"y":492},{"x":345,"y":610},{"x":631,"y":340},{"x":863,"y":305},{"x":363,"y":406},{"x":414,"y":14},{"x":591,"y":26},{"x":602,"y":592},{"x":386,"y":273},{"x":687,"y":183},{"x":570,"y":27},{"x":613,"y":645},{"x":58,"y":268},{"x":668,"y":375},{"x":157,"y":349},{"x":634,"y":627},{"x":575,"y":465},{"x":175,"y":460},{"x":843,"y":625},{"x":425,"y":20},{"x":54,"y":411},{"x":459,"y":659},{"x":482,"y":176},{"x":593,"y":296},{"x":854,"y":512},{"x":132,"y":551},{"x":875,"y":577},{"x":774,"y":470},{"x":95,"y":584},{"x":575,"y":614},{"x":767,"y":635},{"x":426,"y":212},{"x":796,"y":38},{"x":33,"y":147},{"x":773,"y":95},{"x":141,"y":640},{"x":831,"y":257},{"x":684,"y":175},{"x":16,"y":534},{"x":399,"y":579},{"x":729,"y":185},{"x":759,"y":217},{"x":88,"y":327},{"x":43,"y":167},{"x":38,"y":161},{"x":331,"y":405},{"x":292,"y":130},{"x":527,"y":658},{"x":57,"y":288},{"x":546,"y":479},{"x":77,"y":118},{"x":810,"y":74},{"x":668,"y":101},{"x":125,"y":570},{"x":734,"y":267},{"x":790,"y":417},{"x":784,"y":204},{"x":242,"y":335},{"x":548,"y":458},{"x":373,"y":189},{"x":88,"y":216},{"x":738,"y":1},{"x":588,"y":384},{"x":600,"y":221},{"x":161,"y":340},{"x":862,"y":400},{"x":717,"y":82},{"x":434,"y":19},{"x":367,"y":476},{"x":373,"y":288},{"x":198,"y":508},{"x":781,"y":516},{"x":410,"y":401},{"x":96,"y":377},{"x":779,"y":653},{"x":319,"y":404},{"x":680,"y":66},{"x":209,"y":381},{"x":664,"y":41},{"x":230,"y":340},{"x":650,"y":499},{"x":524,"y":604},{"x":344,"y":287},{"x":517,"y":351},{"x":4,"y":10},{"x":146,"y":233},{"x":766,"y":185},{"x":154,"y":476},{"x":153,"y":534},{"x":797,"y":278},{"x":686,"y":434},{"x":241,"y":469},{"x":8,"y":550},{"x":292,"y":118},{"x":737,"y":118},{"x":600,"y":610},{"x":134,"y":405},{"x":541,"y":96},{"x":178,"y":53},{"x":283,"y":618},{"x":227,"y":559},{"x":724,"y":264},{"x":93,"y":192},{"x":218,"y":531},{"x":279,"y":395},{"x":635,"y":430},{"x":783,"y":424},{"x":15,"y":34},{"x":106,"y":406},{"x":371,"y":277},{"x":659,"y":222},{"x":29,"y":401},{"x":27,"y":194},{"x":417,"y":657},{"x":548,"y":12},{"x":394,"y":160},{"x":727,"y":410},{"x":217,"y":459},{"x":286,"y":629},{"x":748,"y":105},{"x":679,"y":514},{"x":65,"y":487},{"x":221,"y":160},{"x":42,"y":239},{"x":822,"y":390},{"x":452,"y":291},{"x":561,"y":107},{"x":389,"y":451},{"x":317,"y":94},{"x":34,"y":50},{"x":324,"y":284},{"x":768,"y":531},{"x":678,"y":432},{"x":663,"y":411},{"x":153,"y":27},{"x":287,"y":348},{"x":444,"y":184},{"x":686,"y":482},{"x":129,"y":122},{"x":667,"y":368},{"x":263,"y":78},{"x":109,"y":190},{"x":271,"y":208},{"x":72,"y":346},{"x":582,"y":5},{"x":546,"y":343},{"x":432,"y":305},{"x":805,"y":5},{"x":329,"y":100},{"x":747,"y":304},{"x":255,"y":283},{"x":319,"y":623},{"x":602,"y":145},{"x":818,"y":582},{"x":478,"y":491},{"x":151,"y":451},{"x":628,"y":605},{"x":803,"y":260},{"x":706,"y":636},{"x":192,"y":535},{"x":342,"y":177},{"x":259,"y":599},{"x":365,"y":229},{"x":583,"y":426},{"x":340,"y":562},{"x":405,"y":629},{"x":116,"y":260},{"x":533,"y":479},{"x":411,"y":615},{"x":382,"y":125},{"x":36,"y":272},{"x":863,"y":466},{"x":600,"y":288},{"x":30,"y":648},{"x":335,"y":269},{"x":302,"y":92},{"x":607,"y":98},{"x":522,"y":101},{"x":801,"y":339},{"x":412,"y":189},{"x":776,"y":446},{"x":77,"y":528},{"x":425,"y":547},{"x":535,"y":317},{"x":802,"y":229},{"x":698,"y":534},{"x":109,"y":109},{"x":321,"y":37},{"x":232,"y":115},{"x":168,"y":621},{"x":637,"y":502},{"x":177,"y":156},{"x":66,"y":376},{"x":646,"y":329},{"x":345,"y":290},{"x":861,"y":28},{"x":791,"y":184},{"x":745,"y":244},{"x":90,"y":370},{"x":610,"y":617},{"x":592,"y":452},{"x":410,"y":500},{"x":410,"y":288},{"x":645,"y":239},{"x":278,"y":163},{"x":761,"y":27},{"x":275,"y":33},{"x":185,"y":203},{"x":794,"y":129},{"x":121,"y":421},{"x":505,"y":126},{"x":750,"y":309},{"x":222,"y":518},{"x":276,"y":272},{"x":626,"y":61},{"x":665,"y":320},{"x":379,"y":38},{"x":459,"y":357},{"x":337,"y":450},{"x":307,"y":418},{"x":867,"y":631},{"x":191,"y":272},{"x":55,"y":465},{"x":861,"y":291},{"x":465,"y":101},{"x":792,"y":81},{"x":750,"y":278},{"x":630,"y":488},{"x":382,"y":539},{"x":282,"y":527},{"x":345,"y":575},{"x":24,"y":421},{"x":810,"y":491},{"x":270,"y":356},{"x":22,"y":646},{"x":663,"y":617},{"x":861,"y":452},{"x":879,"y":409},{"x":90,"y":515},{"x":672,"y":416},{"x":331,"y":68},{"x":165,"y":570},{"x":706,"y":384},{"x":760,"y":85},{"x":235,"y":477},{"x":42,"y":451},{"x":442,"y":598},{"x":551,"y":539},{"x":334,"y":419},{"x":417,"y":656},{"x":137,"y":610},{"x":717,"y":505},{"x":56,"y":619},{"x":695,"y":527},{"x":501,"y":514},{"x":796,"y":315},{"x":322,"y":218},{"x":818,"y":215},{"x":2,"y":239},{"x":143,"y":232},{"x":240,"y":38},{"x":165,"y":277},{"x":281,"y":91},{"x":77,"y":297},{"x":477,"y":18},{"x":617,"y":407},{"x":419,"y":170},{"x":876,"y":275},{"x":159,"y":277},{"x":777,"y":104},{"x":857,"y":25},{"x":506,"y":418},{"x":800,"y":170},{"x":121,"y":625},{"x":500,"y":579},{"x":762,"y":294},{"x":428,"y":614},{"x":818,"y":584},{"x":826,"y":101},{"x":513,"y":566},{"x":719,"y":638},{"x":366,"y":121},{"x":2,"y":142},{"x":176,"y":382},{"x":220,"y":280},{"x":141,"y":210},{"x":437,"y":419},{"x":139,"y":84},{"x":581,"y":449},{"x":238,"y":485},{"x":12,"y":139},{"x":140,"y":324},{"x":127,"y":542},{"x":328,"y":314},{"x":207,"y":123},{"x":805,"y":285},{"x":4,"y":566},{"x":603,"y":592},{"x":641,"y":77},{"x":863,"y":498},{"x":201,"y":387},{"x":373,"y":357},{"x":112,"y":322},{"x":867,"y":472},{"x":381,"y":633},{"x":467,"y":234},{"x":134,"y":63},{"x":533,"y":468},{"x":6,"y":185},{"x":574,"y":362},{"x":311,"y":451},{"x":100,"y":572},{"x":318,"y":47},{"x":114,"y":650},{"x":704,"y":641},{"x":375,"y":355},{"x":693,"y":391},{"x":549,"y":154},{"x":355,"y":167},{"x":340,"y":493},{"x":17,"y":98},{"x":331,"y":179},{"x":667,"y":431},{"x":231,"y":460},{"x":335,"y":270},{"x":351,"y":0},{"x":843,"y":449},{"x":785,"y":1},{"x":306,"y":86},{"x":302,"y":496},{"x":790,"y":236},{"x":69,"y":49},{"x":732,"y":160},{"x":515,"y":73},{"x":342,"y":253},{"x":150,"y":579},{"x":126,"y":317},{"x":272,"y":432},{"x":482,"y":301},{"x":607,"y":622},{"x":158,"y":53},{"x":711,"y":480},{"x":652,"y":193},{"x":681,"y":151},{"x":828,"y":359},{"x":563,"y":71},{"x":70,"y":138},{"x":755,"y":192},{"x":636,"y":133}];


