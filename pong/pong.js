//jshint maxerr: 999

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var game = {
	winner: 0,
	paused: false,
	waiting: true,
	isMultiplayer: false,
	
	changeMode: function() {
		this.isMultiplayer = !this.isMultiplayer;
		if(this.isMultiplayer) {
			key.names.up1 = [87];
			key.names.down1 = [83];
			key.names.up2 = [38];
			key.names.down2 = [40];
		} else {
			key.names.up1 = [87, 38];
			key.names.down1 = [83, 40];
			key.names.up2 = [];
			key.names.down2 = [];
		}
	}
};

var doc = {
	paddleSize: null,
	paddleSlider: null
};

var time = {
	start: null,
	curr: null,
	elapsed: null,
	last: null,
	delta: null,
	round: {
		start: null,
		elapsed: null
	},
};

var p = {
	score: 0,
	x: null,
	y: null,
	w: 15,
	_h: 70,
	h: 70,
	spd: 7,
	
	update: function() {
		if(key.get('up1')) this.y -= this.spd;
		if(key.get('down1')) this.y += this.spd;
		
		if(b.yCap > this.spd) this.spd = b.yCap + 1;
		
		this.y = Math.min(Math.max(this.y, 0), canvas.height - this.h);
	}
};

var e = {
	score: 0,
	x: null,
	y: null,
	yVel: 0,
	w: 15,
	h: 70,
	response: 6,
	spd: 5,
	dir: 0,
	offSet: null,
	
	update: function() {
		if(game.isMultiplayer) {
			
			if(key.get('up2')) this.y -= this.spd;
			if(key.get('down2')) this.y += this.spd;
		
			if(b.yCap > this.spd) this.spd = b.yCap + 1;
		
			this.y = Math.min(Math.max(this.y, 0), canvas.height - this.h);
			
		} else {
			
			/*yDiff = ((eb.y + (b.size / 2)) - (this.y + (this.h / 2)));
			if(yDiff > this.spd * 10) this.dir = 1;
			else if(yDiff < this.spd * 10) this.dir = -1;
			else this.dir = 0;
			this.y += this.spd * this.dir;*/
			
			//if(Math.abs(eb.xVel) > 0)
			this.yVel += ((((eb.y + (b.size / 2)) - (this.y + (this.h / 2)) + this.offSet) / this.response) - this.yVel) / 3;
			//this.yVel = ((b.y + (b.size / 2)) - (this.y + (this.h / 2))) / this.response;
			//else this.yVel = 0;
			
			if(b.yCap > this.spd) this.spd = b.yCap + 0.5;
			
			this.y += Math.min(Math.abs(this.yVel), this.spd) * Math.sign(this.yVel);
			this.y = Math.min(Math.max(this.y, 0), canvas.height - this.h);
			
		}
	}
};

var eb = {
	x: null,
	y: null,
	xVel: 0,
	yVel: 0,
	error: 0,
	mult: 1.3,
	
	spawn: function() {
		this.x = b.x + (this.error * Math.sign(Math.random() - 0.5));
		this.y = b.y + (this.error * b.yVel * 0.2 * Math.sign(Math.random() - 0.5));
		this.xVel = (b.xVel * this.mult) + (this.error * 0.001 * Math.sign(Math.random() - 0.5));
		this.yVel = (b.yVel * this.mult) + (this.error * (b.yVel / b.yCap) * 0.0005 * Math.sign(Math.random() - 0.5)) + (b.yVel / 50);
		e.offSet = random(e.h * -0.3, e.h * 0.3);
	},
	
	update: function() {
		//if(this.y < 0 || this.y + b.size > canvas.height) this.yVel *= -1;
		
		if(this.x > e.x + e.w) {
			this.xVel = 0;
			this.yVel = 0;
		}
		
		if(this.y < 0) {
			this.yVel *= -1;
			this.xVel += randomf(-3, 3);
			this.y = 0;
		} else if(this.y + b.size > canvas.height) {
			this.yVel *= -1;
			this.xVel += randomf(-3, 3);
			this.y = canvas.height - b.size;
		}
		
		if(this.xVel === 0) this.yVel = (b.y - this.y) / 120;
		
		this.x += this.xVel;
		this.y += this.yVel;
	}
};

var b = {
	x: null,
	y: null,
	xVel: null,
	yVel: null,
	startXCap: 9,
	startYCap: 5,
	xCap: null,
	yCap: null,
	size: 10,
	
	update: function() {
		this.xCap = this.startXCap + (time.round.elapsed / 30000);
		this.yCap = this.startYCap + (time.round.elapsed / 30000);
		
			//calculate collision
		cx = this.x + this.xVel;
		cy = this.y + this.yVel;
		
		if(this.y < 0) {
			this.yVel *= -1;
			this.y = 0;
		} else if(this.y + this.size > canvas.height) {
			this.yVel *= -1;
			this.y = canvas.height - this.size;
		}
		
		plr = [p, e];
		for(let i = 0; i < 2; i++) {
			if(   cx + this.size > plr[i].x
				 && cx < plr[i].x + plr[i].w
				 && cy + this.size > plr[i].y
				 && cy < plr[i].y + plr[i].h)
					{
							//bounce the ball off a paddle
						this.xVel = (this.xVel * -1) - (Math.abs(this.yVel / 2) * Math.sign(this.xVel));
						this.yVel += ((this.y + (this.size / 2)) - (plr[i].y + (plr[i].h / 2))) / 4;
						
							//constrain to max speed
						this.xVel = Math.min(Math.abs(this.xVel), this.xCap) * Math.sign(this.xVel);
						this.yVel = Math.min(Math.abs(this.yVel), this.yCap) * Math.sign(this.yVel);
						
							//spawn a ghost ball for the AI
						eb.spawn();
					}
		}
		
		
		this.x += this.xVel;
		this.y += this.yVel;
		
		if(this.x < 0) {
			e.score++;
			this.reset(0);
		} else if(this.x + this.size >= canvas.width) {
			p.score++;
			this.reset(1);
		}
	},
	
	reset: function(side) {
		this.x = (canvas.width / 2) - (this.size / 2);
		this.y = (canvas.height / 2) - (this.size / 2);
				
		p.y = (canvas.height / 2) - (p.h / 2);
		e.y = (canvas.height / 2) - (e.h / 2);
		
		game.lastSide = side;
		game.waiting = true;
	}
};

//_____ BEGIN SETUP FUNCTION _____//

retroFont = new FontFace('retro', 'url(Square.ttf)');
retroFont.load().then(function(font) {
	document.fonts.add(font);
	setup();
});

//_____ HTML INPUT FUNCTIONS _____//


doc.paddleSize = document.getElementById("paddleSize");
doc.paddleSlider = document.getElementById("paddleSlider");
doc.multiplayer = document.getElementById("multiplayer");
doc.multiplayerText = document.getElementById("multiplayerText");

doc.paddleSlider.value = 50;
doc.paddleSize.value = doc.paddleSlider.value;
	
doc.paddleSlider.oninput = function() {
	var val = (this.value / 50) * p._h;
	p.y -= (val - p.h) / 2;
	p.h = val;
	
	e.y -= (val - e.h) / 2;
	e.h = val;
	
	doc.paddleSize.value = this.value;
};

doc.multiplayerText.onclick = function() {
	doc.multiplayer.click();
};

doc.multiplayer.onclick = function() {
	game.changeMode();
};

//_____ INPUT FUNCTIONS _____//
var key = {
	pressed: {},
	last: undefined,
	noPress: {},
	names: {
		up1: [87, 38],
		down1: [83, 40],
		enter: [32]
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


//_____ SETUP & UPDATE FUNCTIONS _____//

function setup() {
	canvas.width = 750;
	canvas.height = 500;
	
	p.x = 25;
	p.y = (canvas.height / 2) - (p.h / 2);
	
	e.x = canvas.width - e.w - 25;
	e.y = p.y;
	
	b.x = (canvas.width / 2) - (b.size / 2);
	b.y = (canvas.height / 2) - (b.size / 2);
	
	eb.x = b.x;
	eb.y = b.y;
	
	game.lastSide = 0;
	
	time.start = new Date();
	time.last = time.start;
	time.round.start = time.start;
	window.requestAnimationFrame(update);
}

function update() {
	time.curr = new Date();
	time.delta = time.curr - time.last;
	time.last = time.curr;
	time.elapsed = time.start - time.curr;
	
	if(!game.paused && !game.waiting) time.round.elapsed += time.delta;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	c.rect(0, 0, canvas.width, canvas.height, "black");
	
	if(!game.paused && !game.waiting && game.winner === 0) {
	
			//run updates
		b.update();
		eb.update();
		p.update();
		e.update();
		
		eb.error = time.round.elapsed * 0.0005;
	} else if(game.waiting && game.winner === 0) {
		
		c.textFont("Press Space", canvas.width / 2, canvas.height * 0.4, 50, "retro", "white", true);
			//wait for spacekey press to launch ball
		if(key.get("enter")) {
			b.xVel = game.lastSide === 0 ? b.startXCap * -1 : b.startXCap;
			b.yVel = 0;
			
			b.xCap = b.startXCap;
			b.yCap = b.startYCap;
			eb.spawn();
			
			time.round.start = new Date();
			
			game.waiting = false;
		}
		
	}
	
	if(p.score > 8) game.winner = 1;
	if(e.score > 8) game.winner = 2;
	
		//draw stuff
	c.dashLine(canvas.width / 2, 0, canvas.width / 2, canvas.height, 3, "white", [10, 10]);
	c.textFont(p.score, (canvas.width / 2) - 50, 50, 50, "retro", "white", true);
	c.textFont(e.score, (canvas.width / 2) + 50, 50, 50, "retro", "white", true);
		
	c.rect(p.x, p.y, p.w, p.h, "white");
	c.rect(e.x, e.y, e.w, e.h, "white");
	c.rect(b.x, b.y, b.size, b.size, "white");
	//c.rect(eb.x, eb.y, b.size, b.size, "yellow", 0.5);
	
	if(game.winner > 0) c.textFont("You " + (game.winner === 1 ? "Win!" : "Lose"), canvas.width / 2, canvas.height * 0.4, 60, "retro", "white", true);
	
	window.requestAnimationFrame(update);
}
