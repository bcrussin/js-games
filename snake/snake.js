// jshint maxerr: 999
// jshint loopfunc: true

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var game = {
	w: 500,
	h: 500,
	paused: false,
	over: false,
	endPos: [],
	
	end: function(pos) {
		this.over = true;
		this.endPos = pos;
	}
};

var time = {
	start: null,
	now: null,
	last: null,
	elapsed: 0
};

var grid = {
	data: [],
	w: 30,
	h: 30,
	cw: null,
	ch: null,
};

var apple = {
	x: null,
	y: null,
	get pos() {
		return [this.x, this.y];
	},
	
	spawn: function() {
		this.x = this.y = -1;
		
		do {
			this.x = random(1, grid.w - 2);
			this.y = random(1, grid.h - 2);
		} while(this.pos === p.pos
						|| this.inTail());
	},
	
	inTail: function() {
		for(let i = 0; i < p.tail.length; i++) {
			if(this.x === p.tail[i][0]
				&& this.y === p.tail[i][1]) return true;
		}
		return false;
	}
};

var p = {
	x: null,
	y: null,
	get pos() {
		return [this.x, this.y];
	},
	rot: -1,	//0: up, 1: right, 2: down, 3: left
	spd: 85,
	tail: [],
	size: 0,
	
	canTurn: true,
	lastMove: null,
	
	init: function() {
		this.x = Math.round(grid.w / 2);
		this.y = Math.round(grid.h / 2);
		
		this.lastMove = time.now;
	},
	
	update: function() {
			//get key presses and change direction
		if(this.canTurn) {
			if(key.get('up') && key.last === 'up' && this.rot !== 2) {
				this.rot = 0;
				this.canTurn = false;
			}
			if(key.get('right') && key.last === 'right' && this.rot !== 3) {
				this.rot = 1;
				this.canTurn = false;
			}
			if(key.get('down') && key.last === 'down' && this.rot !== 0) {
				this.rot = 2;
				this.canTurn = false;
			}
			if(key.get('left') && key.last === 'left' && this.rot !== 1) {
				this.rot = 3;
				this.canTurn = false;
			}
		}
		
			//move player and leave behind trail
		if(time.now - this.lastMove >= this.spd) {
			this.lastMove = time.now;
			this.canTurn = true;
			
			this.tail.push(this.pos);
			if(this.tail.length > this.size) {
				this.tail.shift();
			}
			
			switch(this.rot) {
				case 0:
					this.y--;
					break;
				case 1:
					this.x++;
					break;
				case 2:
					this.y++;
					break;
				case 3:
					this.x--;
					break;
			}
			
			if(arraysEqual(this.pos, apple.pos)) {
				this.size += 5;
				apple.spawn();
			}
			
			for(let i = 0; i < this.tail.length; i++) {
				if(arraysEqual(this.tail[i], this.pos)) game.end(this.pos);
			}
			
			if(this.x < 0 || this.x > grid.w - 1 || this.y < 0 || this.y > grid.h - 1) game.end(this.pos);
		}
	}
};

//_____ INPUT FUNCTIONS _____//

var key = {
	pressed: {},
	last: undefined,
	noPress: {},
	names: {
		up: [87, 38],
		right: [68, 39],
		down: [83, 40],
		left: [65, 37]
	},
	
	press: function(keyCode) {
		if(!this.noPress.hasOwnProperty(keyCode)) {
			Object.keys(this.names).forEach(function(e) {
				if(this.names[e].includes(keyCode)) {
					this.pressed[e] = true;
					this.last = e;
				}
			}, this);
		}
	},
	
	release: function(keyCode) {
		
		Object.keys(this.names).forEach(function(e) {
			if(this.names[e].includes(keyCode)) {
				delete this.pressed[e];
			}
		}, this);
	},
	
	get: function(keyCode) {
		return this.pressed.hasOwnProperty(keyCode);
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

//_____ SETUP AND UPDATE FUNCTIONS _____//

function setup() {
  canvas.width = game.w;
	canvas.height = game.h;
	
	grid.cw = game.w / grid.w;
	grid.ch = game.h / grid.h;
	
	p.init();
	apple.spawn();
	
	time.start = window.performance.now();
	window.requestAnimationFrame(update);
}

function update() {
	c.clear();
	
		//update time
	time.last = time.now;
	time.now = window.performance.now();
	time.elapsed = time.now - time.last;
	time.delta = (time.curr - time.last) / (1000/60);
	
		//update stuff
	if(!game.paused && !game.over) {
		p.update();
	}
	
		//draw stuff
	c.rect(p.x * grid.cw, p.y * grid.ch, grid.cw, grid.ch, "#2eb82e");
	c.rect(apple.x * grid.cw, apple.y * grid.ch, grid.cw, grid.ch, "red");
	for(let i = 0; i < p.tail.length; i++) {
		var s = Math.min(Math.max((p.tail.length - i) * (1 / Math.max((p.tail.length * 0.5), 10)), 0.3), 2);
		c.rect(p.tail[i][0] * grid.cw + s, p.tail[i][1] * grid.ch + s, grid.cw - (s * 2), grid.ch - (s * 2), "#5cd65c");
	}
	
	if(game.over) {
		c.rect(game.endPos[0] * grid.cw, game.endPos[1] * grid.ch, grid.cw, grid.ch, "grey");
	}
	
	window.requestAnimationFrame(update);
}

setup();