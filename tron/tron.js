var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var oppRot = [2, 3, 0, 1];

game = {
	width: 1000,
	height: 500,
	fps: 60,
	refreshRate: 1,
	paused: false,
	freeze: false,
	freezeStage: 0,
	itemsEnabled: false,
	numPlayers: 0,
	numItems: 0,
	over: false,
	loser: 0
};

time = {
	start: null,
	now: null,
	last: null,
	elapsed: 0,
	dt: 0
};

grid = {
	data: [],
	colors: [],
	width: 140,
	height: 70,
	cellWidth: null,
	cellHeight: null,
	flashAlpha: 0,
	
	clear: function() {
		this.data = [];
		this.data = new Array(this.height).fill(0);
		for(let i = 0; i < this.width; i++) {
			this.data[i] = new Array(this.width).fill(0);
		}
	},
	
	check: function(y, x) {
		if(y >= 0 && y < this.height && x >= 0 && x < this.width) {
			return this.data[Math.round(y)][Math.round(x)];
		} else {
			return false;
		}
	},
	
	set: function(y, x, input) {
		if(y >= 0 && y < this.height && x >= 0 && x < this.width) {
			this.data[Math.round(y)][Math.round(x)] = input;
			return true;
		} else {
			return false;
		}
	}
};

var items = [];
var itemData = [
	{
		name: "swap",
		color: "#737373",
		chance: 0.001,
	}
];

function spawnItem(id, pos) {
	items.push(new Item(id, [pos[0], pos[1]]));
}

function Item(id, pos) {
	this.x = pos[0];
	this.y = pos[1];
	this.id = id;
}

players = [];


function playerID(id) {
	return players[id];
}

function Player(pos, att, controls) {
	this.x = this.startX = pos.x;
	this.y = this.startY = pos.y;
	this.rot = this.startRot = pos.rot;
		//0: right, 1: down, 2: left, 3: right
	this.c = att.c;
	this.speed = att.speed;
	this.startSpeed = this.speed;
	this.losses = 0;
	this.isPlayer = att.isPlayer === undefined ? true : att.isPlayer;
	
	this.up = controls.up;
	this.down = controls.down;
	this.left = controls.left;
	this.right = controls.right;
	
	this.counter = 0;
	this.lastMove = time.now;
	
	this.id = game.numPlayers;
	game.numPlayers++;
	
	grid.colors.push(att.c);
	
	this.update = function() {
		if(this.isPlayer) {
				//get key presses and change direction
			if(key.get(this.right) && this.rot !== 2) {
				this.rot = 0;
			}
			if(key.get(this.down) && this.rot !== 3) {
				this.rot = 1;
			}
			if(key.get(this.left) && this.rot !== 0) {
				this.rot = 2;
			}
			if(key.get(this.up) && this.rot !== 1) {
				this.rot = 3;
			}
		} else {
				//update AI
			var pl = this.id === 0 ? players[1] : players[0];
			var test, newP, newE, rotP, rotE = [];
			
				//test each possible rotation
			for(let n = 0; n < 3; n++) {
				
					//determine possible rotations
				var rot = [0, 1, 2, 3];
				rot.splice(oppRot[this.rot], 1);
				
					//initialize grid array
				test = [];
				for(let i = 0; i < grid.height; i++) {
					test.push(grid.data[i].slice());
				}
				
				switch(this.rot) {
					case 0:
						newP = [[this.x + 1, this.y]];
						break;
					case 1:
						newP = [[this.x, this.y + 1]];
						break;
					case 2:
						newP = [[this.x - 1, this.y]];
						break;
					case 3:
						newP = [[this.x, this.y - 1]];
						break;
				}
				
				test[newP[0][1]][newP[0][0]] = this.id;
				
				
				newE = [[pl.x, pl.y]];
				rotE = [pl.rot];
				var index;
				var counter = 0;
				
					//first step
				/*for(let v = 0; v < 3; v++) {
					for(let i = 0; i < grid.height; i++) {
						for(let j = 0; j < grid.width; j++) {
							var p = arrayIncludes(newP, [i, j]);
							if(p > -1) {
								for(let r = 0; r < 3; r++) {
									switch(rot[r]) {
										case 0:
											if(test[newP[p][1] + 1][newP[p][0]] === 0) test[newP[p][1] + 1][newP[p][0]] = 1;
											break;
										case 1:
											if(test[newP[p][1]][newP[p][0] + 1] === 0) test[newP[p][1]][newP[p][0] + 1] = 1;
											break;
										case 2:
											if(test[newP[p][1] - 1][newP[p][0]] === 0) alert(3);//test[newP[p][1] - 1][newP[p][0]] = 1;
											break;
										case 3:
											if(test[newP[p][1]][newP[p][0] - 1] === 0) alert(4);//test[newP[p][1]][newP[p][0] - 1] = 1;
											break;
									}
								}
							}
						}
					}
				}*/
				
					//until test grid is full
				for(let v = 0; v < 1; v++) { //while(!test.includes(-1)) {
				
					for(let i = 0; i < grid.height; i++) {
						for(let j = 0; j < grid.width; j++) {
							
							var p = arrayIncludes(newP, [i, j]);
							if(p > -1) {
								for(let r = 0; r < 4; r++) {
									var a = addRot(r);
									//if(test[newP[p][1] + r[0]][newP[p][0] + r[1]] === 0) test[newP[p][1] + r[0]][newP[p][0] + r[1]] = this.id;
								}
							}
							
						}
					}
					
				}
			}
		}
		
			//wrap around edges of screen
		if(this.x >= grid.width) this.x = 0;
		if(this.x < 0) this.x = grid.width - 1;
		if(this.y >= grid.height) this.y = 0;
		if(this.y < 0) this.y = grid.height - 1;
		
			//if both players are on same tile, call a draw
		for(let i = 0; i < game.numPlayers; i++) {
				//if(this.id === 1) console.log(this.c + ", " + this.id + ", " + i + ", (" + this.x + ", " + players[i].x + ")");
			if(i != this.id && this.x === players[i].x && this.y === players[i].y) {
				game.over = true;
				game.loser = 0;
				break;
			}
		}
		
			//if player is not on empty grid, game over
		if(grid.check(this.y, this.x) !== 0) {
			game.over = true;
			game.loser = this.id;
			this.losses++;
		}
		
			//check for item collision
		for(let i = 0; i < items.length; i++) {
			if(this.x === items[i].x && this.y === items[i].y) {
				switch(items[i].id) {
					case 0:
						grid.set(this.x, this.y, 0);
						c.freeze();
						items.splice(i, 1);
						grid.set(this.x, this.y, 0);
						break;
				}
			}
		}
		
			//move player and leave behind trail
			console.log(time.now + ", " + this.lastMove);
		if(time.now - this.lastMove >= this.speed * game.refreshRate) {
			this.lastMove = time.now;
			grid.set(this.y, this.x, this.id + 1);
			switch(this.rot) {
				case 0:
					this.x++;
					break;
				case 1:
					this.y++;
					break;
				case 2:
					this.x--;
					break;
				case 3:
					this.y--;
					break;
			}
		}
		
		this.counter++;
	};
	
	this.draw = function() {
		c.gridRect(this.x, this.y, "#4f4f4f");
	};
	
	this.reset = function() {
		this.x = this.startX;
		this.y = this.startY;
		this.rot = this.startRot;
		items = [];
		game.freeze = false;
		game.refreshRate = 1;
	};
}

//_____ INPUT FUNCTIONS _____//

var key = {
	pressed: {},
	held: {},
	noPress: {},
	timers: {},
	
	press: function(keyName) {
		if(!this.noPress.hasOwnProperty(keyName)) {
			this.pressed[keyName] = true;
			this.held[keyName] = true;
			//console.log(this.pressed);
			//this.timers[keyName] = cooldowns[keyName];
		}
	},
	
	release: function(keyName) {
		delete this.pressed[keyName];
		delete this.held[keyName];
	},
	
	get: function(keyName) {
		return this.pressed.hasOwnProperty(keyName);
	}
};

document.addEventListener('keydown', function(e) {
  e.preventDefault();
  switch(e.keyCode) {
  	case 80:
  		game.paused = !game.paused;
  		break;
		default:
  		key.press(e.keyCode);
  		break;
  }
});

document.addEventListener('keyup', function(e) {
  e.preventDefault();
  key.release(e.keyCode);
});

//_____ CANVAS RENDER FUNCTIONS _____//

var c = {
	rect: function(x, y, w, h, c, alpha) {
		if(isNaN(alpha)) ctx.globalAlpha = 1;
		else ctx.globalAlpha = alpha;
		ctx.fillStyle = c;
		ctx.fillRect(x, y, w, h);
	},
	
	gridRect: function(x, y, c, alpha) {
		if(isNaN(alpha)) ctx.globalAlpha = 1;
		else ctx.globalAlpha = alpha;
		ctx.fillStyle = c;
		ctx.fillRect(x * grid.cellWidth, y * grid.cellHeight, grid.cellWidth, grid.cellHeight);
	},
	
	item: function(id, pos) {
		var size = 0.8;
		ctx.fillStyle = itemData[id].color;
		ctx.fillRect((pos[0] * grid.cellWidth) + (grid.cellWidth * (1 - size)),
								 (pos[1] * grid.cellHeight) + (grid.cellHeight * (1 - size)),
								 grid.cellWidth * size,
								 grid.cellHeight * size);
	},
		
	ellipse: function(x, y, w, h, c, rot, startAngle, endAngle, switchDir, alpha) {
		if(isNaN(alpha)) ctx.globalAlpha = 1;
		else ctx.globalAlpha = alpha;
		rot = rot || 0;
		startAngle = startAngle || 0;
		endAngle = endAngle || Math.PI * 2;
		if(isNaN(switchDir)) switchDir = false;
		ctx.fillStyle = c;
		ctx.beginPath();
		ctx.ellipse(x, y, w, h, rot, startAngle, endAngle, switchDir);
		ctx.fill();
	},
	
	stroke: {
		rect: function(x, y, w, h, c, alpha) {
			if(isNaN(alpha)) ctx.globalAlpha = 1;
			else ctx.globalAlpha = alpha;
			ctx.strokeStyle = c;
			ctx.strokeRect(x, y, w, h);
		},
		
		ellipse: function(x, y, w, h, t, c, rot, startAngle, endAngle, switchDir, alpha) {
			if(isNaN(alpha)) ctx.globalAlpha = 1;
			else ctx.globalAlpha = alpha;
			rot = rot || 0;
			startAngle = startAngle || 0;
			endAngle = endAngle || Math.PI * 2;
			if(isNaN(switchDir)) switchDir = false;
			ctx.strokeStyle = c;
			ctx.lineWidth = t;
			ctx.beginPath();
			ctx.ellipse(x, y, w, h, rot, startAngle, endAngle, switchDir);
			ctx.stroke();
		}
	},
  
	line: function(x1, y1, x2, y2, thickness, c, alpha) {
		if(isNaN(alpha)) ctx.globalAlpha = 1;
		else ctx.globalAlpha = alpha;
		ctx.strokeStyle = c;
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
	
	freeze: function() {
		game.freeze = true;
		game.freezeStage = 0;
	}
};

//_____ MISC FUNCTIONS _____//
function debug(text) {
  document.getElementById("debug").innerHTML = text;
}

function round(num, interval) {
  return num - (num % interval);
}

function random(min, max, isRounded) {
  if(isRounded) {
    return Math.floor(Math.random() * (max - min) + min);
  } else {
    return Math.random() * (max - min) + min;
  }
}

function arrayIncludes(arr, check) {
	var counter;
    for(let i = 0; i < arr.length; i++) {
    	counter = 0;
    	for(let j = 0; j < check.length; j++) {
	    	if(arr[i].includes(check[j])) counter++;
    	}
    	if(counter >= check.length) return i;
    }
    return -1;
};

function getRot(rot) {
	var r = [0, 1, 2, 3];
	r.splice(rot, 1);
	return r;
}

function addRot(rot) {
	var output = [];
	switch(rot) {
		case 0:
			output = [1, 0];
			break;
		case 1:
			output = [0, 1];
			break;
		case 2:
			output = [-1, 0];
			break;
		case 3:
			output = [0, -1];
			break;
	}
	
	return output;
}

//_____ SETUP, UPDATE, AND OTHER IMPORTANT FUNCTIONS _____//
function randomNum(min, max) {
	min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resizeCanvas() {
	
	canvas.width = round((window.innerHeight - 75) * (game.width / game.height), grid.width);
	canvas.height = round(window.innerHeight - 75, grid.height);
	
	grid.cellWidth = canvas.width / grid.width;
	grid.cellHeight = canvas.height / grid.height;
}

function swapColors() {
	var tempPlayer = players[0];
	
	players[0] = players[1];
	players[1] = tempPlayer;
	
	players[0].id = 1;
	players[1].id = 2;
	
	
	var temp = {x: players[0].x, y: players[0].y, rot: players[0].rot};
	
	players[0].x = players[1].x;
	players[0].y = players[1].y;
	players[0].rot = players[1].rot;
	
	players[1].x = temp.x;
	players[1].y = temp.y;
	players[1].rot = temp.rot;
	
	var tempColor = grid.colors[0];
	
	grid.colors[0] = grid.colors[1];
	grid.colors[1] = tempColor;
}

function setup() {
	resizeCanvas();
	
	game.fps = 100/game.fps;
	
	grid.clear();
	
	players[0] = new Player({x:(grid.width / 2) - 10,y:Math.round(grid.height/2),rot:2}, {c:'#3399ff',speed:30}, {up:87,down:83,left:65,right:68});
	players[1] = new Player({x:(grid.width / 2) + 10,y:Math.round(grid.height/2),rot:0}, {c:'#ff9966',speed:30,isPlayer:true}, {up:38,down:40,left:37,right:39});
	
	time.start = window.performance.now();
	
	//setTimeout(update, 1);
	window.requestAnimationFrame(update);
}

function update() {
	
	time.last = time.now;
	time.now = window.performance.now();
	time.elapsed = time.now - time.last;
	
	
	resizeCanvas();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	if(!game.paused && !game.frozen && !game.over) {
		
		for(let i = 0; i < players.length; i++) {
			players[i].update();
		}
	
	}
	
	//UPDATE CANVAS
	
	if(game.over) {
		
		c.rect(0, 0, canvas.width / 2, canvas.height, players[0].c);
		c.rect(canvas.width / 2, 0, canvas.width / 2, canvas.height, players[1].c);
		
		if(game.loser === 0) {
			c.text("DRAW", canvas.width * 0.25, canvas.height / 3, 36, 'black', true);
			c.text("DRAW", canvas.width * 0.75, canvas.height / 3, 36, 'black', true);
		} else if(game.loser === 1) {
			c.text("LOSER", canvas.width * 0.25, canvas.height / 3, 36, 'black', true);
			c.text("WINNER", canvas.width * 0.75, canvas.height / 3, 36, 'black', true);
		} else if(game.loser === 2) {
			c.text("WINNER", canvas.width * 0.25, canvas.height / 3, 36, 'black', true);
			c.text("LOSER", canvas.width * 0.75, canvas.height / 3, 36, 'black', true);
		}
	
		c.text(players[1].losses, canvas.width * 0.25, canvas.height / 1.75, 96, players[1].c, true);
		c.text(players[0].losses, canvas.width * 0.75, canvas.height / 1.75, 96, players[0].c, true);
		c.rect(0, canvas.height - 50, canvas.width, 50, 'white');
		c.text("Press space to continue", canvas.width / 2, canvas.height - 18, 24, 'black', true);
		
		if(key.get(32)) {
			grid.clear();
			players[0].reset();
			players[1].reset();
			game.over = false;
			game.loser = 0;
		}
		
	} else {
		
		for(let i = 0; i < grid.height; i++) {
			for(let j = 0; j < grid.width; j++) {
				if(grid.data[i][j] > 0) {
					c.gridRect(j, i, grid.colors[grid.data[i][j] - 1]);
				}
			}
		}
		
		for(let i = 0; i < players.length; i++) {
			players[i].draw();
		}
		
		items.forEach(function(e) {
			c.item(e.id, [e.x, e.y]);
		});
		
			//ITEMS
		if(game.itemsEnabled) {
			for(let i = 0; i < itemData.length; i++) {
				var num = Math.random();
				if(num < itemData[i].chance) spawnItem(0, [randomNum(0, grid.width), randomNum(0, grid.height)]);
			}
		}
		
		
			//FREEZE
		if(game.freeze) {
			if(game.refreshRate < 85 && game.freezeStage === 0) {
				game.refreshRate *= 1.07;
				
				if(game.refreshRate >= 25) {
					game.freezeStage = 1
					swapColors();
				}
			}
			
			if(game.refreshRate > 1 && game.freezeStage === 1) {
				game.refreshRate /= 1.06;
			} else if(game.freezeState === 1) {
				game.refreshRate = 1;
				game.freezeStage = 2;
			}
		}
	}
	
	//c.gridRect(10, 50, 'white');
	//setTimeout(update, game.refreshRate);
	window.requestAnimationFrame(update);
}

setup();