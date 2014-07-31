"use strict";

onGameStart(function() {
  var $canvas = $("#playground"),
      UNIT_TO_PX = 10,
      W = $canvas.width()/UNIT_TO_PX,
      H = $canvas.height() / UNIT_TO_PX,
      fps = 24,
      ctx = $canvas[0].getContext("2d"),
      timerId;

  var player1 = new Player("left", ctx);
  var player2 = new Player("right", ctx);
  var ball = new Ball(W/2, H/2, ctx);
  ball.sendInRandomDir();

  initKeyboardController(player1.keyboardHandler);

  function Player(side, context) {
    var sections = [ new Tile(0, 0, context),
                    new Tile(0, 1, context),
                    new Tile(0, 2, context),
                    new Tile(0, 3, context)];
    var dir = "none"
    var x = (side == "left" ? 0 : W-1), y = 0;

    this.draw = function() {
      sections.forEach(function(section) {
        section.draw(x, y);
      });
    }

    this.update = function() {
      switch(dir) {
        case "up":
          if(y-1 >= 0)
            y--;
          break;
        case "down":
          if(y+sections.length < H)
            y++;
          break;
        case "none":
          break;
      }

      sections.forEach(function(section) {
        //var sX = section.x + that.x;
        //var sY = section.y + that.y;
        //if(sX == ball.x && sY == ball.y)

      });
    }

    this.keyboardHandler = function(newDir) {
      dir = newDir;
    }
  }

  function Tile(x, y, context, texture) {
    this.x = x;
    this.y = y;
    this.context = context;
    this.texture = texture;
    var that = this;

    this.collide = function(point) {
      return (this.x == point.x && this.y == point.y);
    }
  }

  Tile.prototype.draw = function(parentX, parentY) {

      var globalX = this.x + parentX,
          globalY = this.y + parentY;

      if(globalX < 0 || globalY < 0 || globalX >= W || globalY >= H)
        return;

      if(!this.texture)
        ctx.fillRect(globalX * UNIT_TO_PX, globalY * UNIT_TO_PX, UNIT_TO_PX, UNIT_TO_PX);
      else {
        ctx.drawImage(this.texture, globalX * UNIT_TO_PX, globalY * UNIT_TO_PX, UNIT_TO_PX, UNIT_TO_PX);
      }
    }

  function Ball(x, y, context) {
    this.x = x;
    this.y = y;
    this.dir = {x: 0, y: 0};
    this.speed = 1;
    this.context = context;
    var that = this;

    this.update = function() {
      that.x += that.dir.x * that.speed;
      that.y += that.dir.y * that.speed;

      if(that.x >= W-1 || that.x < 0) {
        that.dir.x *= -1;
        that.x += that.dir.x * that.speed;
      }
      else if(that.y >= H-1 || that.y < 0) {
        that.dir.y *= -1;
        that.y += that.dir.y * that.speed;
      }
    }

    this.sendInRandomDir = function() {
      var ang = Math.random() * 2 * Math.PI - Math.PI;
      that.dir.x = Math.cos(ang);
      that.dir.y = Math.sin(ang);

    }

    this.draw = function(parentX, parentY) {

      var globalX = that.x,
          globalY = that.y;

      if(globalX < 0 || globalY < 0 || globalX >= W || globalY >= H)
        return;

      ctx.fillRect(globalX * UNIT_TO_PX, globalY * UNIT_TO_PX, UNIT_TO_PX, UNIT_TO_PX);
    }
  }

  function initKeyboardController(callback) {
    var dict = {
                38 : "up",
                40 : "down"
              };

    $(document).keydown(function( event ) {
      if(dict[event.which])
        callback(dict[event.which]);
    });

    $(document).keyup(function( event ) {
      if(dict[event.which])
        callback("none");
    });
  }

  timerId = setInterval(loop, 1000 / fps);

  function loop() {
    update();
    render();
  }

  function update() {
    player1.update();
    player2.update();
    ball.update();
  }

  function render() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W * UNIT_TO_PX, H * UNIT_TO_PX);
    ctx.fillStyle = "white";

    for(var i=0; i<H; i+=2) {
      ctx.fillRect(W/2 * UNIT_TO_PX, i * UNIT_TO_PX, UNIT_TO_PX/2, UNIT_TO_PX)
    }

    player1.draw();
    player2.draw();
    ball.draw();
  }

});
