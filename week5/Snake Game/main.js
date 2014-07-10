$(function() {
  var c = document.getElementById("playground"),
      $canvas = $("#playground"),
      ctx = c.getContext("2d"),
      UNIT_TO_PX = 10,
      W = $canvas.width()/UNIT_TO_PX,
      H = $canvas.height() / UNIT_TO_PX,
      fps = 12,
      snake = new Snake(c),
      treat = getRandomTreat();

  ctx.fillStyle = "green";

  function Tile(x, y, context) {
    this.x = x;
    this.y = y;
    this.context = context;

    this.draw = function() {
      ctx.fillRect(this.x * UNIT_TO_PX, this.y * UNIT_TO_PX, 10, 10);
    }
  }

  function getRandomTreat() {
    var x = Math.floor(Math.random() * W),
        y = Math.floor(Math.random() * H);
    return new Tile(x, y, c)
  }

  function Snake(context) {
    this.context = context;
    this.state = "alive";
    this.dir = {x: 1, y: 0};
    this.oldDir = {x: 1, y: 0};
    this.tiles = [new Tile(0, 0, context),
                  new Tile(1, 0, context),
                  new Tile(2, 0, context)];

    this.isAlive = function() {
      return this.state === "alive";
    }

    this.setAlive = function(alive) {
      this.state = (alive ? "alive" : "dead");
    }

    this.update = function() {

      if(!this.isAlive())
        return;

      var head = this.tiles[this.tiles.length-1],
          newX = head.x + this.dir.x,
          newY = head.y + this.dir.y;

      if(!this.collidesWithWall(newX, newY)
          && !this.collidesWithSelf(newX, newY)) {

        var popped = this.tiles.shift();
        popped.x = newX;
        popped.y = newY;
        this.tiles.push(popped);
      }
      else {
        snake.setAlive(false);
      }

      this.checkTreat();
      this.oldDir.x = this.dir.x;
      this.oldDir.y = this.dir.y;
    };

    this.collidesWithSelf = function(x, y) {
      var res = false;
      this.tiles.forEach(function(tile) {
        if(x == tile.x && y == tile.y)
          res = true;
      });

      return res;
    }

    this.collidesWithWall = function(x, y) {
      return x >= W || y >= H || x < 0 || y < 0;
    }

    this.checkTreat = function() {
      var head = this.tiles[this.tiles.length-1];
      if(head.x == treat.x && head.y == treat.y) {
        treat = getRandomTreat();
        var tail = this.tiles[0];
        var newTail = new Tile(tail.x, tail.y, context);
        this.tiles.unshift(newTail);
      }
    }

    this.draw = function() {
      if(!this.isAlive()) {
        ctx.fillStyle = "red"
      }

      this.tiles.forEach(function(tile) {
        tile.draw();
      });

      if(!this.isAlive()) {
        ctx.fillStyle = "green"
      }
    };
  }

  Snake.prototype.keyboardHandler = function(dir) {
    switch(dir) {
      case "up":
        if(!snake.oldDir.y) {
          snake.dir.x = 0;
          snake.dir.y = -1;
        }
        break;
      case "down":
        if(!snake.oldDir.y) {
          snake.dir.x = 0;
          snake.dir.y = 1;
        }
        break;
      case "left":
        if(!snake.oldDir.x) {
          snake.dir.x = -1;
          snake.dir.y = 0;
        }
        break;
      case "right":
        if(!snake.oldDir.x) {
          snake.dir.x = 1;
          snake.dir.y = 0;
        }
        break;
    }
  };

  initKeyboardController(Snake.prototype.keyboardHandler);

  render();
  setInterval(render, 1000 / fps);

  function render() {
    ctx.clearRect(0, 0, W * UNIT_TO_PX, H * UNIT_TO_PX);
    snake.update();
    snake.draw();
    treat.draw();
  }

  function initKeyboardController(callback) {
    var dict = {"38" : "up",
                "40" : "down",
                "37" : "left",
                "39" : "right"};

    $(document).keydown(function( event ) {
      callback(dict[event.which]);
    });
  }
});
