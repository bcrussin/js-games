//jshint maxerr: 999

var key = {
	pressed: {},
	held: {},
	noPress: {},
	timers: {},
	hasCooldowns: typeof cooldowns !== 'undefined',
	
	press: function(keyName) {
		if(!this.noPress.hasOwnProperty(keyName)) {
			this.pressed[keyName] = true;
			this.held[keyName] = true;
			//console.log(this.pressed);
			if(this.hasCooldowns) this.timers[keyName] = cooldowns[keyName];
		}
	},
	
	release: function(keyName) {
		delete this.pressed[keyName];
		delete this.held[keyName];
	},
	
	update: function() {
		for(var i in this.timers) {
			if(this.hasCooldowns && cooldowns[i] > 0) {
				if(this.timers[i] === cooldowns[i] && !this.noPress.hasOwnProperty(i)) {
					this.noPress[i] = true;
					delete this.pressed[i];
				}
				this.timers[i]--;
				if(this.timers[i] < 0) {
					delete this.noPress[i];
					if(this.held[i]) this.pressed[i] = true;
				}
			}
		}
		
		//console.log(this.pressed);
	},
	
	get: function(keyName) {
		return this.pressed.hasOwnProperty(keyName);
	}
};

var c = {
	rect: function(x, y, w, h, c, alpha) {
		if(isNaN(alpha)) ctx.globalAlpha = 1;
		else ctx.globalAlpha = alpha;
		ctx.fillStyle = c;
		ctx.fillRect(x, y, w, h);
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
	
	dashLine: function(x1, y1, x2, y2, thickness, c, dash, alpha) {
		if(isNaN(alpha)) ctx.globalAlpha = 1;
		else ctx.globalAlpha = alpha;
		ctx.setLineDash(dash);
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
	
	textFont: function(text, x, y, size, font, c, centered, alpha) {
		if(isNaN(alpha)) ctx.globalAlpha = 1;
		else ctx.globalAlpha = alpha;
		if(centered === true) ctx.textAlign = "center";
		else ctx.textAlign = "left";
		ctx.font = size + "px " + font;
		ctx.fillStyle = c;
		ctx.textAlign = centered;
		ctx.fillText(text, x, y);
	},
	
	img: function(name, x, y, w, h, rot, centered) {
		if(images.loaded) {
			rot = rot || 0;
			centered = centered || false;
			let offsetX = centered ? (w / 2) : 0;
			let offsetY = centered ? (h / 2) : 0;
			let image = images.data[name];
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(rot * Math.PI / 180);
			ctx.drawImage(images.data[name], 0 - offsetX, 0 - offsetY, w, h);
			ctx.restore();
		}
	},
	
	clear: function() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}
};


//_____ NUMBER FUNCTIONS _____//

function randomf(min, max) {
	return (Math.random() * (max - min)) + min;
}

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (a.length != b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
