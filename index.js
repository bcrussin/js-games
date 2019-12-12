var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var menu = {
  x: -1000,
  index: 0,
  spacing: 350,
  speed: 10,
  dir: null,
  dest: null,
  selected: false,
  
  select: function() {
    var loc = window.location.pathname;
    this.dir = loc.substring(0, loc.lastIndexOf('/'));
    this.dest = imageData[menu.index].dest;
    this.selected = true;
  }
};

//_____ IMAGE DATA _____//
//var images = document.images;

var imageData = [
  {
    name: "Tetris",
    dest: "/tetris/tetris.html",
    img: "tetris"
  },
  /*{
    name: "Flood",
    dest: "/flood/flood.html",
    img: "flood"
  },*/
  {
  	name: "Snake",
  	dest: "/snake/snake.html",
  	img: "snake"
  },
  /*{
    name: "Knockoff",
    dest: "/knockoff/knockoff.html",
    img: "knockoff"
  },*/
  {
    name: "Tron",
    dest: "/tron/tron.html",
    img: "tron"
  },
  /*{
    name: "Raycast",
    dest: "/raycast/raycast.html",
    img: "raycast"
  },
  {
    name: "Map Maker",
    dest: "/map-maker/map_maker.html",
    img: "map_maker"
  },
  {
    name: "Asteroids",
    dest: "/asteroids/asteroids.html",
    img: "asteroids"
  },
  {
  	name: "Auto Sim",
  	dest: "/auto Sim/auto_sim.html",
  	img: "auto_sim"
  },
  {
  	name: "Survival",
  	dest: "/survival/survival.html",
  	img: "survival"
  }*/
];

var images = [];
for(let i = 0; i < imageData.length; i++) {
	images[i] = document.getElementById(imageData[i].img);
}

//_____ RENDER FUNCTIONS _____//

var c = {
  rect: function(x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  },
  
  text: function(text, x, y, size, c, centered) {
    if(centered === true) ctx.textAlign = "center";
    else ctx.textAlign = "left";
    ctx.font = size + "px Arial";
    ctx.fillStyle = c;
    ctx.textAlign = centered;
    ctx.fillText(text, x, y);
  }
};

//_____ KEYBOARD INPUT _____//

var key = {
  right: false,
  left: false,
  select: false
};

document.addEventListener('keydown', function(e) {
  e.preventDefault();
  switch(e.keyCode) {
    case 39:
      key.right = true;
      if(menu.index < imageData.length - 1) menu.index++;
      else menu.index = 0;
      break;
    case 37:
      key.left = true;
      if(menu.index > 0) menu.index--;
      else menu.index = imageData.length - 1;
      break;
    case 32:
      key.select = true;
      menu.select();
      break;
  }
});

document.addEventListener('keyup', function(e) {
  e.preventDefault();
  switch(e.keyCode) {
    case 39:
      key.right = false;
      break;
    case 37:
      key.left = false;
      break;
    case 32:
      key.select = false;
      break;
  }
});

//_____ SETUP AND UPDATE FUNCTIONS _____//

function setup() {
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 25;
  window.requestAnimationFrame(update);
}

function update() {
  canvas.width = window.innerWidth - 10;
  canvas.height = window.innerHeight - 25;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if(menu.selected) {
    if(menu.x > -900) menu.x += (-1000 - menu.x) / menu.speed;
    else window.location = menu.dir + menu.dest;
  } else {
    menu.x += ((menu.index * menu.spacing) - menu.x) / menu.speed;
  }
  
  //c.text(menu.index, 5, 25, 20, "white");
  
  var left = Math.floor(((canvas.width / 2) / menu.spacing) - menu.index) - 1;
  var right = Math.ceil(((canvas.width / 2) / menu.spacing) + menu.index);
  
  console.log(left + ", " + right);
  
  for(var i = Math.max(left, 0); i < Math.min(imageData.length, right); i++) {
    var sizeMod = (Math.pow((i * menu.spacing) - menu.x, 2) / 100000) + 1.5;
    sizeMod /= canvas.height / 500;
    
    var newWidth = images[i].width / sizeMod;
    var newHeight = images[i].height / sizeMod;
    
    ctx.drawImage(images[i], ((canvas.width / 2) - (newWidth / 2)) + ((i * menu.spacing) - menu.x), canvas.height / 20, newWidth, newHeight);
    c.text(imageData[i].name, ((canvas.width / 2) + ((i * menu.spacing) - menu.x)), ((images[i].height * 1.25) / sizeMod), 100 / sizeMod, "white", true);
  }
  
  c.text("(use arrows + space to navigate)", canvas.width / 2, canvas.height - 10, 15, "white", true);
  
  window.requestAnimationFrame(update);
}

setup();
