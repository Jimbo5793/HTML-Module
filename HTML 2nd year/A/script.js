		///////////LISTENERS
        document.addEventListener('resize',resizeCanvas);
        ////////////LISTENERS END

        ////////VARIABLES
        var myVar = setInterval(runAlways,75);
        window.onload = init;
        var c = document.getElementById("pathfindcanvas");
        var ctx = c.getContext("2d");
        /////////VARIABLES END

        /////////CANVAS LISTENERS
        c.addEventListener('mousemove',mouseMove);
        c.addEventListener('mousedown',mouseDown);
        c.addEventListener('mouseup',mouseUp);
        /////////END

        //////OBJECTS
        var map;
        var mapNodeTypes = {
            empty : 0,
            block : 1,
            normalNode : 2,
            startNode : 3,
            endNode : 4
        }
        var mapColors = ["#4d4d4d","#4d4dFF","#4dFF4d","#FF4d4d","#000000"];//empty,block,normnal,start,end
        var gameOpt = {
            shapeSize : 25,
            width : 1000,
            height : 1000,
            emptySize : 1,
            backgroundColor : "#ffe0cc",
            drawModeOn : false
        }
        var mouse = {
            posx : 0,
            posy : 0
        }
        var startNode,endNode;
    
        function drawRoundedRectangle(x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();
            ctx.fill();
        }
        function drawMap(){
            var maxx = Math.floor(gameOpt.width/gameOpt.shapeSize);
            var maxy = Math.floor(gameOpt.height/gameOpt.shapeSize);
            for(var i = 0;i < maxx;i++)
                for(var j = 0;j < maxy;j++) {
                    var posx = i*gameOpt.shapeSize;
                    var posy = j*gameOpt.shapeSize;
                    ctx.fillStyle = mapColors[map[i][j]];
                    drawRoundedRectangle(posx+gameOpt.emptySize,posy+gameOpt.emptySize,gameOpt.shapeSize-2*gameOpt.emptySize,gameOpt.shapeSize-2*gameOpt.emptySize,6);
                }
        }
        function clearBackground(){
            ctx.clearRect(0,0,c.width,c.height);
            ctx.fillStyle = gameOpt.backgroundColor;
            ctx.fillRect(0,0,gameOpt.width,gameOpt.height);
        }
        //////END
        //////LISTENERS FUNCTIONS
        function mouseMove(e){
            var rect = c.getBoundingClientRect();
            mouse.posx = e.clientX - rect.left;
            mouse.posy = e.clientY - rect.top;
            if(gameOpt.drawModeOn)
                createBlockToMousePos();
        }
        function mouseDown(e){
            if(e.button != 0)
                return;
            gameOpt.drawModeOn = true;
            createBlockToMousePos();
        }
        function mouseUp(e){
            if(e.button != 0)
                return;
            gameOpt.drawModeOn = false;
        }
    
        function resizeCanvas(){
            c.width = gameOpt.width;
            c.height = gameOpt.height;
            }
        //////END
        //////GAME FUNCTIONS
        function calculateFcost(start,end,node){
            var gcost;//distance from start 
            var hcost;//distance from end
            gcost = Math.abs(node.x - start.x) + Math.abs(node.y - start.y);
            hcost = Math.abs(node.x - end.x) + Math.abs(node.y-end.y);
            node.fcost = start.fcost+hcost;
            return node;
        }
        function getNeighbor(node){
            var nodes = [];
            var maxx = Math.floor(gameOpt.width/gameOpt.shapeSize);
            var maxy = Math.floor(gameOpt.height/gameOpt.shapeSize);
            if(node.x+1 < maxx && map[node.x+1][node.y] != mapNodeTypes.block)
                nodes.push({x : node.x+1,y : node.y,fcost : 0,parentI : 0});
            if(node.y+1 < maxy && map[node.x][node.y+1] != mapNodeTypes.block)
                nodes.push({x : node.x,y : node.y + 1,fcost : 0,parentI : 0});
            if(node.x-1 >= 0 && map[node.x-1][node.y] != mapNodeTypes.block)
                nodes.push({x : node.x-1,y : node.y,fcost : 0,parentI : 0});
            if(node.y-1 >= 0 && map[node.x][node.y-1] != mapNodeTypes.block)
                nodes.push({x : node.x,y : node.y-1,fcost : 0,parentI : 0});
            return nodes;
        }
        function searchInNodeList(nodeList,node){
            var i = 0;
            var finded = -1;
            var size = nodeList.length;
            while(i < size && finded < 0){
                if(nodeList[i].x == node.x && nodeList[i].y == node.y)
                    finded = i;
            i++;
        }
        return finded;
        }
        function getNodeWithMinFcost(nodeList){
            var min = 0;
            var minindex = 0;
            min = nodeList[0].fcost;
            for(var i = 1;i < nodeList.length;i++){
                if(nodeList[i].fcost < min){
                    min = nodeList[i].fcost;
                    minindex = i;
                }
            }
        return minindex;
        }
        function nodeMatch(node1,node2){
            return (node1.x == node2.x && node1.y == node2.y) ? true : false;
        }
        function runAstar(){
            var open = [];
            var closed = [];
            var neighbors = [];
            startNode.fcost = 0;
            open.push(startNode);
            var searchOpen;
            while(open.length > 0) {
                cIndex = getNodeWithMinFcost(open);
                if(nodeMatch(open[cIndex],endNode)){
                    closed.push(open[cIndex]);
                    break;
                }
                neighbors = getNeighbor(open[cIndex]);
                closed.push(open[cIndex]);
                for(var i = 0;i < neighbors.length;i++){
                    if(searchInNodeList(closed,neighbors[i]) == -1){
                        neighbors[i] = calculateFcost(open[cIndex],endNode,neighbors[i]);
                        searchOpen = searchInNodeList(open,neighbors[i]); 
                        neighbors[i].parentI = closed.length-1;
                        if(searchOpen == -1)
                            open.push(neighbors[i]);
                        else if(open[searchOpen].fcost > neighbors[i].fcost)
                            open[searchOpen].fcost = neighbors[i].fcost;
                    }
                }
                open.splice(cIndex,1);
            }
            var i = closed[closed.length-1].parentI;
            while(!nodeMatch(closed[i],startNode)){
                map[closed[i].x][closed[i].y] = mapNodeTypes.normalNode;
                i = closed[i].parentI;
            }
            document.getElementById("Text").innerHTML = str;
        }
        function createBlockToMousePos(){
            var x = Math.floor(mouse.posx/gameOpt.shapeSize);
            var y = Math.floor(mouse.posy/gameOpt.shapeSize)
            if(map[x][y] == mapNodeTypes.empty)
                map[x][y] = mapNodeTypes.block;
        }
        function initMap(){
            map = new Array();
            var maxX = Math.floor(gameOpt.width/gameOpt.shapeSize);
            var maxY = Math.floor(gameOpt.width/gameOpt.shapeSize);
            for(var i = 0;i < maxX;i++){
                map[i] = new Array();
                for(var j = 0;j < maxY;j++)
                    map[i][j] = 0;
            }
            startNode = {x : 0,y : 0,fcost : 0,parentI : -1};
            endNode = {x : maxX-1,y : maxY-1,fcost : 0,parentI : -1};
            map[startNode.x][startNode.y] = mapNodeTypes.startNode;
            map[endNode.x][endNode.y] = mapNodeTypes.endNode;
        }
        //END
        /////MAIN FUNCTIONS
        function refreshMap(justPath){
            if(justPath){
                var maxX = Math.floor(gameOpt.width/gameOpt.shapeSize);
                var maxY = Math.floor(gameOpt.width/gameOpt.shapeSize);
                    for(var i = 0;i < maxX;i++)
                        for(var j = 0;j < maxY;j++)
                            if(map[i][j] == mapNodeTypes.normalNode)
                                map[i][j] = mapNodeTypes.empty;
            }
            else
                init();
        }
        function init(){
            resizeCanvas();
            initMap();
            runAlways();
        }
        function runAlways(){
            clearBackground();
            drawMap();
        }
        /////END
    
