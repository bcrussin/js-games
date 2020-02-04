//jshint maxerr: 999

function debug(d) {
	document.getElementById("debug").innerHTML = d;
}

var canvas = document.getElementById('gameCanvas');
var ctx = canvas.getContext('2d');

var levels = [
	[30, 40, 40, 15],
	[25, 50, 50, 50],
	[20, 70, 70, 75],
	[15, 80, 80, 80]
];

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
	roundTime: null,
};

var p = {
	score: 0,
	x: null,
	y: null,
	w: 15,
	_h: 140,
	h: null,
	_spd: 7,
	spd: 7,
	
	update: function() {
		if(key.get('up1')) this.y -= this.spd;
		if(key.get('down1')) this.y += this.spd;
		
		this.y = Math.min(Math.max(this.y, 0), canvas.height - this.h);
	}
};

var e = {
	score: 0,
	x: null,
	y: null,
	yVel: 0,
	w: 15,
	h: null,
	_response: 3,
	response: null,
	_spd: 7,
	spd: 7,
	dir: 0,
	offset: null,
	
	update: function() {
		if(game.isMultiplayer) {
			
			if(key.get('up2')) this.y -= this.spd;
			if(key.get('down2')) this.y += this.spd;
		
			if(b.yCap > this.spd) this.spd = b.yCap + 1;
		
			this.y = Math.min(Math.max(this.y, 0), canvas.height - this.h);
			
		} else {
			
			var per = 1 - (b.x / (canvas.width * 0.8));
			var eby = (per * (b.y - eb.y)) + eb.y;
			
			
			//document.getElementById("debug").innerHTML = Math.round(b.y) + ", " + Math.round(eb.y) + ", " + Math.round(eby);
			//c.rect(this.x - 20, eby, 15, 15, "green");
			
			this.yVel += ((((eby + (b.size / 2)) - (this.y + (this.h / 2)) + this.offset) / this.response) - this.yVel);
			//this.yVel = ((b.y + (b.size / 2)) - (this.y + (this.h / 2))) / this.response;
			//else this.yVel = 0;
			
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
	_xErr: 0.005,
	_yErr: 0.0003,
	xErr: null,
	yErr: null,
	_errorRate: 0.001,
	errorRate: null,
	error: 0,
	mult: 1.5,
	
	spawn: function() {
		this.x = b.x + (this.error * Math.sign(Math.random() - 0.5));
		this.y = b.y + (this.error * b.yVel * 0.2 * Math.sign(Math.random() - 0.5));
		this.xVel = (b.xVel * this.mult) + (this.error * this.xErr * Math.sign(Math.random() - 0.5));
		this.yVel = (b.yVel * this.mult) + (this.error * (b.yVel / b.yCap) * this.yErr * Math.sign(Math.random() - 0.5)) + (b.yVel / 100);
		e.offset = (Math.random() < 0.5 ? -1 : 1) * random(e.h * 0.1, e.h * 0.45);
	},
	
	update: function() {
		//if(this.y < 0 || this.y + b.size > canvas.height) this.yVel *= -1;
		
		if(this.x > e.x + e.w) {
			this.xVel = 0;
			this.yVel = 0;
		}
		
			//add margin of error when bouncing off wall
		if(this.y < 0 || this.y + b.size > canvas.height) {
			this.yVel *= -1;
			var scale = ((this.x / canvas.width) * 5);
			this.xVel += randomf(scale * -0.5, scale * 0.5);
			this.y = this.y < 0 ? 0 : canvas.height - b.size;
		}
		
		if(this.xVel === 0) this.yVel = (b.y - this.y) / 200;
		
		this.x += this.xVel;
		this.y += this.yVel;
	}
};

var b = {
	x: null,
	y: null,
	xVel: null,
	yVel: null,
	_xCap: 9,
	_yCap: 5,
	startXCap: 9,
	startYCap: 5,
	xCap: null,
	yCap: null,
	size: 10,
	
	update: function() {
			//increased speed as round progresses
		this.xCap = this.startXCap + (time.roundTime / 30000);
		this.yCap = this.startYCap + (time.roundTime / 30000);
		
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
		
			//give points if goal is scored
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
		
		eb.error = 0;
	}
};

//_____ BEGIN SETUP FUNCTION _____//

retroFont = new FontFace('retro', 'url(Square.ttf)');
retroFont.load().then(function(font) {
	document.fonts.add(font);
	setup();
});

//_____ HTML INPUT FUNCTIONS _____//

doc.easy = document.getElementById("easy");
doc.easyText = document.getElementById("easyText");
doc.medium = document.getElementById("medium");
doc.mediumText = document.getElementById("mediumText");
doc.hard = document.getElementById("hard");
doc.hardText = document.getElementById("hardText");
doc.extreme = document.getElementById("extreme");
doc.extremeText = document.getElementById("extremeText");

	//difficulty
doc.easyText.onclick = function() { doc.easy.click(); };
doc.easy.onclick = function() {
	setDifficulty(0);
	doc.easy.checked = true;
};

doc.mediumText.onclick = function() { doc.medium.click(); };
doc.medium.onclick = function() {
	setDifficulty(1);
	doc.medium.checked = true;
};

doc.hardText.onclick = function() { doc.hard.click(); };
doc.hard.onclick = function() {
	setDifficulty(2);
	doc.hard.checked = true;
};

doc.extremeText.onclick = function() { doc.extreme.click(); };
doc.extreme.onclick = function() {
	setDifficulty(3);
	doc.extreme.checked = true;
};

function setDifficulty(lv) {
	doc.paddleSlider.value = levels[lv][0];
	paddleSliderInput();
	
	doc.paddleSpeedSlider.value = levels[lv][1];
	paddleSpeedSliderInput();
	
	doc.ballSlider.value = levels[lv][2];
	ballSliderInput();
	
	doc.difficultySlider.value = levels[lv][3];
	difficultySliderInput();
}

doc.paddleSize = document.getElementById("paddleSize");
doc.paddleSlider = document.getElementById("paddleSlider");
doc.paddleSpeed = document.getElementById("paddleSpeed");
doc.paddleSpeedSlider = document.getElementById("paddleSpeedSlider");
doc.ballSpeed = document.getElementById("ballSpeed");
doc.ballSlider = document.getElementById("ballSlider");
doc.difficulty = document.getElementById("difficulty");
doc.difficultySlider = document.getElementById("difficultySlider");
doc.multiplayer = document.getElementById("multiplayer");
doc.multiplayerText = document.getElementById("multiplayerText");

doc.paddleSlider.value = 50;
doc.paddleSize.value = doc.paddleSlider.value;

doc.paddleSpeedSlider.value = 50;
doc.paddleSpeed.value = doc.paddleSpeedSlider.value;

doc.ballSlider.value = 50;
doc.ballSpeed.value = doc.ballSlider.value;
	
doc.difficultySlider.value = 50;
doc.difficulty.value = doc.difficultySlider.value;

	//paddle size
doc.paddleSlider.oninput = paddleSliderInput;

doc.paddleSize.onclick = function() {
	doc.paddleSlider.value = prompt("Input paddle size from 0 to 100:", 50);
	paddleSliderInput();
};

function paddleSliderInput() {
	var max = 200;
	var min = 10;
	
	var val = (((doc.paddleSlider.value - 0) * (max - min)) / (100 - 0)) + min;
	val = (val / ((max + min) / 2)) * p._h;
	
	p.y -= (val - p.h) / 2;
	p.h = val;
	
	e.y -= (val - e.h) / 2;
	e.h = val;
	
	doc.paddleSize.value = doc.paddleSlider.value;
	
	doc.easy.checked = false;
	doc.medium.checked = false;
	doc.hard.checked = false;
	doc.extreme.checked = false;
}

	//paddle speed
doc.paddleSpeedSlider.oninput = paddleSpeedSliderInput;

doc.paddleSpeed.onclick = function() {
	doc.paddleSpeedSlider.value = prompt("Input paddle speed from 0 to 100", 50);
	paddleSpeedSliderInput();
};

function paddleSpeedSliderInput() {
	var max = 200;
	var min = 25;
	
	var val = (((doc.paddleSpeedSlider.value - 0) * (max - min)) / (100 - 0)) + min;
	val = (val / ((max + min) / 2)) * p._spd;
	
	p.spd = val;
	e.spd = val;
	
	doc.paddleSpeed.value = doc.paddleSpeedSlider.value;
	
	doc.easy.checked = false;
	doc.medium.checked = false;
	doc.hard.checked = false;
	doc.extreme.checked = false;
}

	//ball speed
doc.ballSlider.oninput = ballSliderInput;

doc.ballSpeed.onclick = function() {
	doc.ballSlider.value = prompt("Input ball speed from 0 to 100", 50);
	ballSliderInput();
};

function ballSliderInput() {
	var max = 100;
	var min = 25;
	
	var val = (((doc.ballSlider.value - 0) * (max - min)) / (100 - 0)) + min;
	val = val / ((max + min) / 2);
	
	b.startXCap = val * b._xCap;
	b.startYCap = val * 0.8 * b._yCap;
	
	doc.ballSpeed.value = doc.ballSlider.value;
	
	doc.easy.checked = false;
	doc.medium.checked = false;
	doc.hard.checked = false;
	doc.extreme.checked = false;
}

	//AI difficulty
doc.difficultySlider.oninput = difficultySliderInput;

doc.difficulty.onclick = function() {
	doc.difficultySlider.value = prompt("Input difficulty from 0 to 100", 50);
	difficultySliderInput();
};

function difficultySliderInput() {
	var max = 90;
	var min = 40;
	
	var val = (((doc.difficultySlider.value - 0) * (max - min)) / (100 - 0)) + min;
	//val = val / ((max + min) / 2);
	invVal = (100 - val) / ((max + min) / 2);
	
	e.response = invVal * e._response;
	eb.xErr = invVal * 15 * eb._xErr;
	eb.yErr = invVal * 1 * eb._yErr;
	eb.errorRate = invVal * 15 * eb._errorRate;
	
	e.error = 0;
	
	doc.difficulty.value = doc.difficultySlider.value;
	
	doc.easy.checked = false;
	doc.medium.checked = false;
	doc.hard.checked = false;
	doc.extreme.checked = false;
}

doc.multiplayerText.onclick = function() {
	doc.multiplayer.click();
};

doc.multiplayer.onclick = function() {
	game.changeMode();
};

doc.restart = document.getElementById("restart");

doc.restart.onclick = function() {
	p.score = 0;
	e.score = 0;
	game.paused = false;
	b.reset(0);
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
  		if(!game.waiting && game.winner === 0) game.paused = !game.paused;
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
	
	doc.paddleSlider.value = 25;
	paddleSliderInput();
	
	doc.ballSlider.value = 50;
	ballSliderInput();
	
	doc.difficultySlider.value = 50;
	difficultySliderInput();
	
	doc.medium.click();
	
	time.start = new Date();
	time.last = time.start;
	window.requestAnimationFrame(update);
}

function update() {
	time.curr = new Date();
	time.delta = time.curr - time.last;
	time.last = time.curr;
	time.elapsed = time.start - time.curr;
	
	if(!game.paused && !game.waiting) time.roundTime += time.delta;
	
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	c.rect(0, 0, canvas.width, canvas.height, "black");
	
	if(!game.paused && !game.waiting && game.winner === 0) {
	
			//run updates
		b.update();
		eb.update();
		p.update();
		e.update();
		
		//eb.error = time.roundTime * eb.errorRate;
		eb.error += eb.errorRate + (Math.abs(b.yVel / b.yCap) / 50);
		//debug(eb.error + "  -  " + (Math.abs(b.yVel / b.yCap) / 50));
		
	} else if(game.waiting && game.winner === 0) {
		
		c.textFont("Press Space", canvas.width / 2, canvas.height * 0.4, 50, "retro", "white", true);
			//wait for spacekey press to launch ball
		if(key.get("enter")) {
			b.xVel = game.lastSide === 0 ? b.startXCap * -1 : b.startXCap;
			b.yVel = 0;
			
			b.xCap = b.startXCap;
			b.yCap = b.startYCap;
			eb.spawn();
			
			time.roundTime = 0;
			
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
	//c.rect(e.x, e.y + (e.h / 2) - e.offset, 7, 7, "red", 0.8);
	c.rect(b.x, b.y, b.size, b.size, "white");
	//c.rect(eb.x, eb.y, b.size, b.size, "yellow", 0.5);
	
	if(game.paused) {
		c.rect((canvas.width / 2) - 30, (canvas.height / 2) - 35, 60, 70, "black", 0.8);
		c.rect((canvas.width / 2) - 20, (canvas.height / 2) - 30, 10, 60, "white");
		c.rect((canvas.width / 2) + 10, (canvas.height / 2) - 30, 10, 60, "white");
	}
	//c.textFont("||", canvas.width / 2, canvas.height / 2, "retro", "white", true);
	if(game.winner > 0) c.textFont("You " + (game.winner === 1 ? "Win!" : "Lose"), canvas.width / 2, canvas.height * 0.4, 60, "retro", "white", true);
	
	window.requestAnimationFrame(update);
}
