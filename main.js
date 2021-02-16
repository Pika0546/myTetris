const myCanvas = document.getElementById("myCanvas");
const nextCanvas = document.getElementById("nextCanvas");
const gridCanvas = document.getElementById("grid");
const nextGridCanvas = document.getElementById("nextGrid");
const reBtn = document.getElementById("restart");
const nextGrid = nextGridCanvas.getContext("2d");
const gridCtx = gridCanvas.getContext("2d");
const ctx = myCanvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");
var dropSpeed = 500;
const arenaW = 12;
const arenaH = 20;
const backgroundColor = "#ffa1d7";
var score = 0;
ctx.scale(20, 20);
nextCtx.scale(20,20);
const types = "ILJOTSZ";
var arena = createMatrix(arenaW, arenaH);
var main = new player();
var nextBrick = createBrick(types[Math.floor(types.length * Math.random())]);
var shadowBrick;
let dropCouter = 0;
let lastTime = 0;
var isOver = false;
var myloop;

const colors = [
    "null", 
    "#A001F1", 
    "#F8E608",
    "#EF8201",
    "#0100F1",
    "#F00001",
    "#02F102",
    "#00F0F0",
    "rgba(255, 255, 255, 0.65)"
];

function showScore(){
    document.getElementById("score").innerHTML = "Score: " + score;
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (var y = 0; y < m.length; y++) {
        for (var x = 0; x < m[y].length; x++) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix
}

function createBrick(type) {
    if (type === "T") {
        return [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0]
        ];
    }
    if (type === "O") {
        return [
            [2, 2],
            [2, 2]
        ];
    }
    if (type === "L") {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3]
        ];
    }
    if (type === "J") {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0]
        ];
    }
    if (type === "I") {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    }
    if(type ==="S"){
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0]
        ];
    }
    if(type ==="Z"){
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ];
    }
}

function createShaDow(player){
    var type = 0;
    var oriPos = player.pos.y;
    while(!collide(arena,player)){
        player.pos.y += 1;
    }
   
    player.pos.y -= 1;
    player.matrix.forEach((row, y) => {
        row.forEach((value,x) => {
            if(value != 0){
                type = value;
                player.matrix[y][x] = 8;
            }
        })
    })
    drawMatrix(player.matrix, player.pos, ctx);
    player.matrix.forEach((row, y) => {
        row.forEach((value,x) => {
            if(value != 0){
                player.matrix[y][x] = type;
            }
        })
    })

    player.pos.y = oriPos;
}

function rotateMatrix(matrix) {
    var tem = [];
    var n = matrix.length;
    for (var i = 0; i < n; i++) {
        var arrt = [];
        for (var j = 0; j < n; j++) {
            arrt.push(0);
        }
        tem.push(arrt);
    }
    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            tem[i][j] = matrix[n - j - 1][i];
        }
    }
    return tem;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    })
}

function drawMatrix(matrix, offset, context) {
    
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function drawNextCtx() {
    nextCtx.fillStyle = backgroundColor;
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
}

function drawGrid(context){
    let r = (context.canvas.width - 4) /20;
    let c = (context.canvas.height - 4)/20;
    for(var i = 0; i < r ; i++){
        for(var j = 0; j < c; j++){
            context.beginPath();
            context.strokeStyle = "white";
            context.rect(i*20,j*20,20,20);
            context.stroke();
            context.closePath();
        }
    }
   
}

function player() {
    this.pos = { x: 5, y: 5 };

    this.matrix = createBrick(types[Math.floor(types.length * Math.random())]);
    this.draw = function () {
        
        drawMatrix(this.matrix, this.pos, ctx);
    }
    this.goDown = function () {
        this.pos.y += 1;
        if (collide(arena, this)) {
            
            this.pos.y--;
            merge(arena, this);
            this.reset();
            this.matrix = nextBrick;
            this.pos.x = Math.floor((arena[0].length - this.matrix[0].length)/2)
            this.pos.y = 0;
            nextBrick = createBrick(types[Math.floor(types.length * Math.random())]);
            arenaSweep();
            showScore();
        }
    }
    this.move = function (dir) {
        this.pos.x += dir;
        if (collide(arena, this)) {
            this.pos.x -= dir;
        }
    }
    this.rotate = function () {
        const p = this.pos;
        let offset = 1;
        this.matrix = rotateMatrix(this.matrix);
        while (collide(arena, this)) {

            if (offset > this.matrix[0].length) {
                this.matrix = rotateMatrix(this.matrix);
                this.matrix = rotateMatrix(this.matrix);
                this.matrix = rotateMatrix(this.matrix);
                this.pos.x = p.x;
                return;
            }
            this.pos.x += offset;

            offset = -(offset + (offset > 0 ? 1 : -1));
        }
    }
    this.reset = function (){

        this.matrix = createBrick(types[Math.floor(types.length * Math.random())]);    
        this.pos.x = Math.floor((arena[0].length - this.matrix[0].length)/2)
        this.pos.y = 0;
        if(collide(arena, this)){

            isOver = true;
        }
    }
}

function init(){
    arena = createMatrix(arenaW, arenaH);
    main = new player();
    main.reset();
    shadowBrick = main.matrix;
    dropCouter = 0;
    lastTime = 0;
    score = 0;
    isOver = false;
    dropSpeed = 500;
    drawGrid(gridCtx);
    drawGrid(nextGrid);
}

function arenaSweep() {
    var t_score = 100;
    for(let y = arena.length - 1; y > 0 ; y--){
      let flag = true;
      for(let x = 0; x < arena[y].length; x++){
            if(arena[y][x] === 0){
                flag = false;
                break;
            }
      }
      if(flag){
          const row = arena.splice(y,1)[0].fill(0);
          arena.unshift(row);
          y++;
          score += t_score;
          t_score *= 2;
      }
  }
}


function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCouter += deltaTime;
    if (dropCouter > dropSpeed) {
        main.goDown();
        dropCouter = 0;
    }
    if(isOver){
        document.getElementById("game-over").style.display = "block";
        cancelAnimationFrame(myloop);
    }

    ctx.fillStyle =backgroundColor;
    drawNextCtx();
    
    drawMatrix(nextBrick,{x: 1, y: 1},nextCtx);
    ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);
    drawMatrix(arena, { x: 0, y: 0 }, ctx);
    createShaDow(main);
    main.draw();
    myloop = requestAnimationFrame(update);
}

document.getElementById("left").addEventListener("mousedown", function (e) {
    main.move(-1);
})

document.addEventListener("keydown",function (e) {
    e.preventDefault();
    if(e.keyCode === 37)
        main.move(-1)
    else if(e.keyCode === 39)
        main.move(1);
    else if(e.keyCode === 40){
        main.goDown();
        dropCouter = 0;
    }else if(e.keyCode === 38)
        main.rotate();

})
document.getElementById("right").addEventListener("mousedown", function (e) {
    main.move(+1);
})
document.getElementById("down").addEventListener("mousedown", function (e) {
    main.goDown();
    dropCouter = 0;
})
document.getElementById("rotate").addEventListener("mousedown", function (e) {
    main.rotate();
})
document.getElementById("restart").addEventListener("mousedown",function (e){
    document.getElementById("game-over").style.display = "none";
    init();
    update();
})

init();

update();

