// jshint maxerr: 999
// jshint loopfunc: true

var canvas = document.getElementById("gameCanvas");
var uiCanvas = document.getElementById("uiCanvas");
var ctx = canvas.getContext("2d");
var uiCtx = uiCanvas.getContext("2d");
var levelAlpha;

var game = {
	width: 250,
	_width: 250,
	uiWidth: 200,
	_uiWidth: 250,
	height: 500,
	_height: 500,
	loop: null,
	firstLoop: true,
	pauseTime: null,
  paused: false,
  over: false,
  numTurns: 0,
  time: {
    start: null,
    curr: null,
    elapsed: null
  },
  level: 1,
  target: {
    curr: 0,  //points required to advance to the next level
    mult: 0.5, //target multiplier
    start: 50  //beginning target
  },
  speed: {
  	curr: 0,
  	start: 60,
  	mult: 2.5
  },
  score: 0,
  last: {
	  score: 0,
	  completed: 0,
	  quickMult: 0
  },
  deltaScore: 0,
  levelChanged: false,
  highScore: 0,
  scoreChange: 0,
  points: {
    block: 1, //points for each block dropped
    line: 5, //points for each line cleared
    mult: 1,  //score multiplier (increases by level according to curve)
    stack: 1.4,  //rewards multiple lines cleared by one block
    quickMult: 1, //rewards lines cleared in quick succession
    curve: 1.4
  },
  
  save: function() {
  	localStorage.setItem("saved", true);
  	
  	for(let i = 0; i < grid.height; i++) {
  		localStorage.setItem("gridData_" + i, JSON.stringify(grid.data[i]));
  	}
  	
  	localStorage.setItem("weights", JSON.stringify(block.weights));
  	
  	localStorage.setItem("block", block.id);
  	localStorage.setItem("blockNext", block.next);
  	localStorage.setItem("blockStored", block.stored);
  	localStorage.setItem("blockX", block.x);
  	localStorage.setItem("blockY", block.y);
  	localStorage.setItem("blockRot", block.rot);
  	
  	localStorage.setItem("level", this.level);
  	localStorage.setItem("score", this.score);
  	localStorage.setItem("numTurns", game.numTurns);
  },
  
  load: function() {
  	for(let i = 0; i < grid.height; i++) {
  		grid.data[i] = JSON.parse(localStorage.getItem("gridData_" + i));
  	}
  	
  	block.weights = JSON.parse(localStorage.getItem("weights"));
  	
  	block.id = parseInt(localStorage.getItem("block"));
  	block.next = parseInt(localStorage.getItem("blockNext"));
  	block.stored = parseInt(localStorage.getItem("blockStored"));
  	block.x = parseInt(localStorage.getItem("blockX"));
  	block.y = parseInt(localStorage.getItem("blockY"));
  	block.rot = parseInt(localStorage.getItem("blockRot"));
  	block.grounded = false;
  	
  	this.level = parseInt(localStorage.getItem("level"));
  	this.score = parseInt(localStorage.getItem("score"));
  	this.numTurns = parseInt(localStorage.getItem("numTurns"));
  },
  
  clear: function() {
		window.cancelAnimationFrame(game.loop);
  	localStorage.clear();
		localStorage.setItem("highScore", game.highScore);
		localStorage.setItem("width", game.width);
		localStorage.setItem("uiWidth", game.uiWidth);
		localStorage.setItem("height", game.height);
		localStorage.setItem("saved", false);
  },
  
  end: function() {
		this.clear();
  	this.over = true;
  	grid.clearCounter = grid.height - 1;
  }
};

var grid = {
  buffer: [],
  data: [],
  fullData: [],
  width: 10,
  height: 20,
  bufferHeight: 2,
  cellWidth: null,
  cellHeight: null,
  clearCounter: 0
};

//_____ BLOCK FUNCTIONS _____//

var block = {
  id: NaN,
  next: NaN,
  stored: NaN,
  canStore: true,
  x: NaN,
  y: NaN,
  rot: NaN,
  speed: 0,
  dropSpeed: 1,
  currSpeed: NaN,
  frame: 0,
  pos: null,
  _grounded: null,
  get grounded() {
  	this._grounded = !this.isFree(0, 1, 0);
  	return this._grounded;
  },
  set grounded(n) {
  	this._grounded = n;
  },
  moveDelay: 10,
  minDelay: 40,
  weights: [],
  
  spawn: function(id, rot) {
    if(id === 0) {
      if(!isNaN(this.next)) this.id = this.next;
      else this.id = randomBlock();
      
      this.next = randomBlock();
      
      for(let i = 0; i < this.weights.length; i++) {
      	if(i === this.next - 1) this.weights[i] *= 0.4;
      	else if(this.weights[i] < 10) this.weights[i] *= 1.3;
      	else this.weights[i] *= 1.1;
      	
      	if(this.weights[i] > 40) this.weights[i] = 40;
      	
      	this.weights[i] = this.weights[i].roundTens(3);
      }
      //console.log(blockRef[this.next] + " (" + (this.next - 1) + ")");
      //console.log(this.weights);
    } else {
      this.id = id;
    }
    
    if(rot === 0) this.rot = random(1, 4);
    else this.rot = rot;
    
    this.x = (grid.width / 2);
    this.y = 0;
    this.grounded = false;
    
    if(!this.isFree(0, 0, this.rot)) game.end;
    if(!this.isFree(0, 2, this.rot)) game.end;
  },
  
  update: function() {
  	this.speed = Math.round(game.speed.start - ((game.level - 1) * game.speed.mult) - (game.numTurns / Math.max(game.level * 2, 7)));
  	if(this.speed < 1) this.speed = 1;
    this.pos = blocks[blockRef[this.id]][this.rot];
    
    if(key.pressed[0] && this.isFree(1, 0, 0)) {
      this.x++;
      if(this.grounded) this.frame = Math.max(0, this.frame - this.moveDelay);
    }
    if(key.pressed[1] && this.isFree(-1, 0, 0)) {
      this.x--;
      if(this.grounded) this.frame = Math.max(0, this.frame - this.moveDelay);
    }
    if(key.pressed[2]) {
    		//rotate normally if possible
    	var rotated = false;
    	
    	if(this.isFree(0, 0, (this.rot + 1 > 4) ? 1 : this.rot + 1)) {
        this.rot++;
      } else {
	      	//if piece is against wall, push it away before rotating
	    	for(let i = 1; i <= 2; i++) {
	    		if(this.isFree(i, 0, (this.rot + 1 > 4) ? 1 : this.rot + 1)) {
		        this.rot++;
		        this.x += i;
		        rotated = true;
		        break;
		      } else if(this.isFree(-i, 0, (this.rot + 1 > 4) ? 1 : this.rot + 1)) {
		        this.rot++;
		        this.x -= i;
		        rotated = true;
		        break;
		      }
	    	}
	    		//pif piece is against ground, push it up before rotation
	    	if(this.isFree(0, -1, (this.rot + 1 > 4) ? 1 : this.rot + 1) && !rotated) {
	    		this.y--;
	    		this.rot++;
	    	}
      }
      
      if(this.rot > 4) this.rot = 1;
      if(this.grounded) this.frame = Math.max(0, this.frame - 10);
    }
    if(key.pressed[3]) {
      this.currSpeed = this.dropSpeed;
    } else {
      this.currSpeed = this.speed;
    }
    if(key.pressed[4]) {
      this.store();
    }
    if(key.pressed[5]) {
    	while(this.isFree(0, 1, 0)) this.drop();
    	this.drop();
    	this.drop();
    	key.keys[5] = false;
    }
    
    if(this.frame > (this.grounded && !key.pressed[3] ? Math.max(this.currSpeed, this.minDelay) : this.currSpeed)) {
      this.drop();
    } else {
      this.frame++;
    }
    
    c.block(this.id, this.x, this.y, this.rot);
  },
  
  drop: function() {
  	if(this.isFree(0, 1, 0)) {
      this.y++;
    } else if(!this.grounded) {
    	this.grounded = true;
    } else {
	    
	    if(this.y > 0) {
	      try {
		      for(let i = 0; i < this.pos.length; i++) {
		        grid.data[this.y + this.pos[i][1]][this.x + this.pos[i][0]] = this.id;
		      }
			    this.canStore = true;
			    game.score += Math.round(game.points.block * game.points.mult);
			  	//console.log("     +" + Math.round(game.points.block * game.points.mult));
			    if(game.points.quickMult > 1) game.points.quickMult -= ((game.points.quickMult - 1) / 5) + 0.2;
			    else game.points.quickMult = 1;
			    game.last.quickMult = game.points.quickMult;
			    this.spawn(0, 1);
			    this.frame = 0;
			    game.numTurns++;
	      }
	      catch(e) {
	      	game.end();
	      }
	    } else {
      	game.end();
	    }
	    
    }
    this.frame = 0;
    if(!game.over) game.save();
  },
  
  isFree: function(xChange, yChange, rot) {
    if(rot === 0) rot = this.rot;
    var tempPos = this.pos = blocks[blockRef[this.id]][rot];
    for(let i = 0; i < tempPos.length; i++) {
      if(this.y + tempPos[i][1] + yChange >= 0) {
        //alert(this.y + this.pos[i][1] + yChange);
        if(
          this.y + tempPos[i][1] + yChange + 1 > grid.height
          || this.x + tempPos[i][0] + xChange < 0
          || this.x + tempPos[i][0] + xChange > grid.width - 1
          || grid.data[this.y + tempPos[i][1] + yChange][this.x + tempPos[i][0] + xChange] > 0
          ) {
            return false;
          }
      } else {
      	if(
          this.x + tempPos[i][0] + xChange < 0
          || this.x + tempPos[i][0] + xChange > grid.width - 1
          ) {
            return false;
          }
      }
    }
    
    return true;
  },
  
  store: function() {
    if(this.canStore) {
      if(isNaN(this.stored)) {
        this.stored = this.id;
        this.spawn(0, 1);
      } else {
        var temp = this.stored;
        this.stored = this.id;
        this.spawn(temp, 1);
      }
      this.canStore = false;
    }
  },
  
  border: function() {
    for(let i = 0; i < this.pos.length; i++) {
      ctx.strokeStyle = borderColors[this.id - 1];
      ctx.lineWidth = 2;
      ctx.strokeRect(
        (this.x * grid.cellWidth) + (this.pos[i][0] * grid.cellWidth),
        (this.y * grid.cellHeight) + (this.pos[i][1] * grid.cellHeight),
        grid.cellWidth,
        grid.cellHeight);
    }
  }
};

//_____ INPUT FUNCTIONS _____//

var key = {
  keys: [], //right, left, up, down, store, drop, pause
  pressed: [],
  cooldown: [2, 2, 20, 2, 50, 0, 0],
  timer: [],
  
  delay: 5,
  firstPress: [false, false],
  
  setup: function() {
    this.keys = new Array(7).fill(false);
    this.timer = new Array(7).fill(0);
  },
  
  press: function(key) {
    if(this.cooldown[key] === 0) {
      this.keys[key] = true;
    } else {
      if(this.timer[key] < 0) {
        if((key === 0 || key === 1) && !this.keys[key]) {
        	this.timer[key] = this.cooldown[key] * this.delay;
        	this.firstPress[key] = true;
        } else if(this.cooldown[key] > 0) {
        	this.timer[key] = this.cooldown[key];
        }
        this.keys[key] = true;
        this.pressed[key] = true;
      }
    }
  },
  
  release: function(key) {
    this.keys[key] = false;
    this.timer[key] = -1;
  },
  
  update: function() {
    for(let i = 0; i < this.timer.length; i++) {
      if(this.timer[i] >= 0) {
      	this.timer[i] -= 1;
      } else if(this.keys[i]) {
      	this.pressed[i] = true;
      	this.timer[i] = this.cooldown[i];
      } else {
      	this.timer[i] = -1;
      }
      
      if(i < this.firstPress.length && this.firstPress[i] && this.timer[i] < this.cooldown[i] * this.delay) {
      	this.firstPress[i] = false;
      	this.pressed[i] = false;
      } else if(this.timer[i] != this.cooldown[i]) this.pressed[i] = false;
    }
  }
  
};

document.addEventListener('keydown', function(e) {
  e.preventDefault();
  switch(e.keyCode) {
    case 13:
      key.press(4);
      break;
    case 39:
      key.press(0);
      break;
    case 37:
      key.press(1);
      break;
    case 38:
      key.press(2);
      break;
    case 40:
      key.press(3);
      break;
    case 32:
      key.press(5);
      break;
    case 80:
      game.paused = !game.paused;
      if(game.paused) {
      	game.pauseTime = new Date();
      } else if(game.time.curr - game.pauseTime > 3000) {
      	game.firstLoop = true;
      }
      break;
  }
});

document.addEventListener('keyup', function(e) {
  e.preventDefault();
  switch(e.keyCode) {
    case 13:
      key.release(4);
      break;
    case 39:
      key.release(0);
      break;
    case 37:
      key.release(1);
      break;
    case 38:
      key.release(2);
      break;
    case 40:
      key.release(3);
      break;
    case 32:
      key.release(5);
      break;
    case 80:
      key.release(6);
      break;
  }
});

document.getElementById("restartButton").onclick = function() {
	game.clear();
	setup(false);
};

//_____ CANVAS FUNCTIONS _____//

var c = {
  rect: function(x, y, w, h, c, alpha) {
    if(isNaN(alpha)) ctx.globalAlpha = 1;
    else ctx.globalAlpha = alpha;
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  },
  
  line: function(x1, y1, x2, y2, thickness, color, alpha) {
    if(isNaN(alpha)) ctx.globalAlpha = 1;
    else ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.lineWidth = thickness;
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  },
  
  text: function(text, x, y, size, c, centered, alpha) {
    if(isNaN(alpha)) ctx.globalAlpha = 1;
    else ctx.globalAlpha = alpha;
    if(centered === true) ctx.textAlign = "center";
    else ctx.textAlign = "left";
    ctx.font = size + "px Arial";
    ctx.fillStyle = c;
    ctx.textAlign = centered;
    ctx.fillText(text, x, y);
  },
  
  block: function(id, x, y, rot) {
    var pos = blocks[blockRef[id]][rot];
    
    for(let i = 0; i < pos.length; i++) {
      this.rect(
        (x * grid.cellWidth) + (pos[i][0] * grid.cellWidth),
        (y * grid.cellHeight) + (pos[i][1] * grid.cellHeight),
        grid.cellWidth,
        grid.cellHeight,
        colors[id - 1]);
    }
  }
};

var ui = {
  rect: function(x, y, w, h, c, alpha) {
    if(isNaN(alpha)) uiCtx.globalAlpha = 1;
    else uiCtx.globalAlpha = alpha;
    uiCtx.fillStyle = c;
    uiCtx.fillRect(x, y, w, h);
  },
  
  line: function(x1, y1, x2, y2, thickness, color, alpha) {
    if(isNaN(alpha)) uiCtx.globalAlpha = 1;
    else uiCtx.globalAlpha = alpha;
    uiCtx.strokeStyle = color;
    uiCtx.beginPath();
    uiCtx.lineWidth = thickness;
    uiCtx.moveTo(x1, y1);
    uiCtx.lineTo(x2, y2);
    uiCtx.stroke();
  },
  
  text: function(text, x, y, size, c, centered, alpha) {
    if(isNaN(alpha)) uiCtx.globalAlpha = 1;
    else uiCtx.globalAlpha = alpha;
    if(centered === true) uiCtx.textAlign = "center";
    else uiCtx.textAlign = "left";
    uiCtx.font = size + "px Arial";
    uiCtx.fillStyle = c;
    uiCtx.textAlign = centered;
    uiCtx.fillText(text, x, y);
  },
  
  block: function(id, x, y, rot) {
    var pos = blocks[blockRef[id]][rot];
    
    for(let i = 0; i < pos.length; i++) {
      this.rect(
        (x * grid.cellWidth) + (pos[i][0] * grid.cellWidth),
        (y * grid.cellHeight) + (pos[i][1] * grid.cellHeight),
        grid.cellWidth,
        grid.cellHeight,
        colors[id - 1]);
      
      uiCtx.strokeStyle = borderColors[id - 1];
      uiCtx.lineWidth = 2;
      uiCtx.strokeRect(
        (x * grid.cellWidth) + (pos[i][0] * grid.cellWidth),
        (y * grid.cellHeight) + (pos[i][1] * grid.cellHeight),
        grid.cellWidth,
        grid.cellHeight);
    }
  }
};

//_____ SETUP AND UPDATE, AND MISC FUNCTIONS _____//

function debug(text) {
  document.getElementById("debug").innerHTML = text;
}

function randomBlock() {
	var sum = block.weights.reduce((accumulator, currentValue) => accumulator + currentValue);
	var rand = randomf(0, sum);
	var total = 0;
	for(let i = 0; i < block.weights.length; i++) {
		if(rand < total + block.weights[i]) return (i + 1);
		total += block.weights[i];
	}
	return rand;
}

Number.prototype.roundTens = function(tens) {
	return Math.round(this * Math.pow(10, tens)) / Math.pow(10, tens);
};

function updateLastLoad() {
	localStorage.setItem('lastLoad', new Date());
	return localStorage.getItem('lastLoad');
}

function clearHighScore() {
	localStorage.removeItem("highScore");
	game.highScore = 0;
	return true;
}

function setScale(scale) {
	game.width = game._width * scale;
	game.uiWidth = game._uiWidth * scale;
	game.height = game._height * scale;
	
	localStorage.setItem("width", game.width);
	localStorage.setItem("uiWidth", game.uiWidth);
	localStorage.setItem("height", game.height);
	
	window.cancelAnimationFrame(game.loop);
	setup(true);
}

function setup(delay) {
  if(localStorage.getItem("width") !== null) {
  	game.width = parseInt(localStorage.getItem("width"));
  	game.uiWidth = parseInt(localStorage.getItem("uiWidth"));
  	game.height = parseInt(localStorage.getItem("height"));
  } else {
	  game.width = 250;
	  game.uiWidth = 200;
  	game.height = 500;
  }
  
  canvas.width = game.width;
  canvas.height = game.height;
  uiCanvas.width = game.uiWidth;
  uiCanvas.height = game.height;
  
	localStorage.setItem("width", game.width);
	localStorage.setItem("uiWidth", game.uiWidth);
	localStorage.setItem("height", game.height);
  
  for(let i = 0; i < grid.bufferHeight; i++) {
    grid.buffer[i] = new Array(grid.width).fill(0);
  }
  
  for(let i = 0; i < grid.height; i++) {
    grid.data[i] = new Array(grid.width).fill(0);
  }
  
  
  if(localStorage.getItem("saved") !== null && localStorage.getItem("saved") !== "false") {
  	game.load();
  } else {
  	game.score = 0;
  	game.level = 1;
  	game.numTurns = 0;
  	block.stored = NaN;
  	block.canStore = true;
  	block.weights = new Array(7).fill(10);
  	block.spawn(0, 1);
  }
  
  if(localStorage.getItem("highScore") !== null) game.highScore = parseInt(localStorage.getItem("highScore"));
  else game.highScore = 0;
  
  grid.cellWidth = canvas.width / grid.width;
  grid.cellHeight = canvas.height / grid.height;
  
  key.setup();
  
  if(game.time.start === null) game.time.start = new Date();
  if(delay === null) game.firstLoop = true;
  else game.firstLoop = delay;
  game.last.score = game.score;
	game.over = false;
  localStorage.setItem('lastLoad', new Date());
  //setInterval(updateLastLoad, 1000);
  game.loop = window.requestAnimationFrame(update);
}

function draw() {
	//RENDER BLOCKS
    for(let i = 0; i < grid.data.length; i++) {
      for(let j = 0; j < grid.data[0].length; j++) {
        if(grid.data[i][j] > 0) {
          c.rect(
            j * grid.cellWidth,
            i * grid.cellHeight,
            grid.cellWidth,
            grid.cellHeight,
            colors[grid.data[i][j] - 1]);
        }
      }
    }
    
    //RENDER GRID LINES
    for(let i = 0; i < grid.width; i++) {
      c.line(i * grid.cellWidth, 0, i * grid.cellWidth, canvas.height, 1, "#999999");
    }
    
    for(let i = 0; i < grid.height; i++) {
      c.line(0, i * grid.cellHeight, canvas.width, i * grid.cellHeight, 1, "#999999");
    }
    
    //RENDER BLOCK BORDERS
    for(let i = 0; i < grid.height; i++) {
      for(let j = 0; j < grid.width; j++) {
        if(grid.data[i][j] > 0) {
          ctx.strokeStyle = borderColors[grid.data[i][j] - 1];
          ctx.lineWidth = 2;
          ctx.strokeRect(
            j * grid.cellWidth,
            i * grid.cellHeight,
            grid.cellWidth,
            grid.cellHeight);
        }
      }
    }
      
  return true;
}

function update() {
	
		//calculate delta time
  game.time.curr = new Date();
  game.time.elapsed = game.time.curr - game.time.start;
  
  
  	//validate score change, end game if score isn't legitimate
  	//if score change isn't possible given current point
  //if(game.last.score !== game.score) console.log(game.last.score + ", " + game.score + " (" + game.levelChanged + ")");
  game.deltaScore = game.score - game.last.score;
  game.last.score = game.score;
  
  var lv = game.levelChanged ? game.level - 1 : game.level;
  var mult = Math.pow(game.points.curve, lv - 1);
  //if(game.deltaScore > 0) console.log(game.deltaScore + ", " + (game.points.block * mult) + ", (" + (Math.round(game.points.block * mult) + Math.round((game.points.line * (game.points.stack * game.last.completed)) * mult * game.last.quickMult)) + ")");
  if(game.deltaScore !== Math.round(game.points.block * mult)
  	&& game.deltaScore !== Math.round(game.points.block * mult) + Math.round((game.points.line * (game.points.stack * game.last.completed)) * mult * game.last.quickMult)
  	&& game.deltaScore !== Math.round((game.points.line * (game.points.stack * game.last.completed)) * mult * game.last.quickMult)
  	&& game.deltaScore !== 0) {
  		game.score = -999;
  		game.end();
  	}
  game.levelChanged = false;
  
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
  
  if(game.paused && !game.over) {
  		//don't update game if it is paused
    c.text("-PAUSED-", canvas.width / 2, canvas.height / 2, game.width / 10, "black", true);
  } else {
  		//combine onscreen and offscreen space
    grid.fullData = grid.buffer.concat(grid.data);
  
    game.points.mult = Math.pow(game.points.curve, game.level - 1);
    
    if(!game.over) {
	    block.update();
	    key.update();
	    
	    	//check if any lines are completed
		  var completed = 0;
		  for(let i = 0; i < grid.data.length; i++) {
		    var counter = 0;
		    for(let j = 0; j < grid.data[0].length; j++) {
		      if(grid.data[i][j] > 0) counter++;
		    }
		    
		    if(counter === grid.width) {
		      grid.data.splice(i, 1);
		      grid.data.unshift(new Array(grid.width).fill(0));
		      completed++;
		      break;
		    }
		  }
		  
		  game.last.completed = completed;
		  
		  	//award points based on completed lines
		  if(completed > 0) {
		  	//console.log("     +" + Math.round((game.points.line * (game.points.stack * completed)) * game.points.mult * game.points.quickMult));
		    game.score += Math.round((game.points.line * (game.points.stack * completed)) * game.points.mult * game.points.quickMult);
		  }
	    game.last.quickMult = game.points.quickMult;
	    game.points.quickMult = 2.5;
    } else {
    		//clear the screen if game is over
    	if(grid.clearCounter >= 0) {
    		for(let i = 0; i < grid.width; i++) {
    			grid.data[grid.clearCounter][i] = random(1, 7);
    		}
    		grid.clearCounter--;
    	}
    }
  
    draw();
    
    if(!game.over) block.border();
  }
  
  if(game.firstLoop) c.rect(0, 0, game.width, game.height, "black", 0.5);
  
  //_____ SCORE CALCULATIONS _____//
  game.score = Math.round(game.score);
  if(game.score > game.highScore) game.highScore = game.score;
  
  game.target.curr = Math.round((90 * Math.exp(game.target.mult * game.level) * (game.level === 1 ? 0 : 1)) + game.target.start);
  //if(!game.over) console.log("     " + game.score + ", " + game.target.curr)
  if(game.score > game.target.curr) {
    game.level++;
    game.levelChanged = true;
    levelAlpha = 0.75;
  }
  
  if(levelAlpha > 0) {
    c.text(game.level, canvas.width / 2, canvas.height / 1.75, 250, "grey", true, levelAlpha);
    levelAlpha -= 0.01;
  }
  
  //_____ UI RENDERING _____//
  var textSize = game.width / 10;
  
  ui.rect(5, 0, uiCanvas.width - 10, uiCanvas.height / 3, "white");
  ui.rect(5, (uiCanvas.height / 3) + 5, uiCanvas.width - 10, uiCanvas.height / 3, "white");
  ui.text("Next:", 10, textSize, textSize, "black", false);
  ui.text("Stored:", 10, (uiCanvas.height / 3) + (textSize * 1.25), textSize, "black", false);
  
  var scoreText = "Score: " + game.score;
  var targetText = "Target: " + game.target.curr;
  var levelText = "Level: " + game.level;
  var highScoreText = "Highscore: " + game.highScore;
  ui.text(scoreText, 10, uiCanvas.height / 1.35, textSize, "white", false);
  ui.text(targetText, 10, (uiCanvas.height / 1.35) + (textSize * 1.25), textSize, "white", false);
  ui.text(levelText, 10, (uiCanvas.height / 1.35) + (textSize * 2.5), textSize, "white", false);
  ui.text(highScoreText, 10, uiCanvas.height - 8, textSize / 1.3, "white", false);
  
  ui.block(block.next, 3.25, 3.25, 1);
  if(!isNaN(block.stored)) ui.block(block.stored, 3.25, 10.25, 1);
  
  if(game.firstLoop) {
  	game.loop = setTimeout(update, 1000);
  	game.firstLoop = false;
  } else {
  	game.loop = window.requestAnimationFrame(update);
  }
}

if(new Date() - Date.parse(localStorage.getItem('lastLoad')) > 1500) setup(true);
else setup(false);