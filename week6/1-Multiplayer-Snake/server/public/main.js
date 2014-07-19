$(function() {
  var c = document.getElementById("playground"),
      $canvas = $("#playground"),
      ctx = c.getContext("2d"),
      UNIT_TO_PX = 10,
      W = $canvas.width()/UNIT_TO_PX,
      H = $canvas.height() / UNIT_TO_PX,
      fps = 1,
      snake,
      guestSnake,
      background,
      treat,
      timerId = -1,
      points = 0,
      playing = false,
      isPaused = false,
      reverse = false,
      ignoreKeyboard = true,
      playerSnake,
      opponentSnake;

      var test = false;

  $("#btn-settings").click(function() {
    pause();
    $("#modal-points").text(points);
  });

  $('#myModal').on('hidden.bs.modal', function() {
    if(playing)
      resume();
  });

  $('#enterNameModal').on('hidden.bs.modal', function() {
    $("#modal-name").val("");
    startGame();
  });

  $("#save-changes").click(function() {
    if(playing) {
      pause();
    }

    if(reverse) {
      playerSnake.reverse();
      reverse = false;
      $("#modal-reverse").prop("checked", false);
    }
  });

  $("#modal-reverse").on("change", function() {
    var isChecked = $(this).prop("checked");
    if(isChecked)
      reverse = true;
  });

  function pause(byUser) {

    if(timerId != -1) {
      clearInterval(timerId);
      timerId = -1;
    }

    if(byUser) {
      isPaused = true;

      if(labelTimer != -1) {
        clearInterval(labelTimer);
        labelTimer = -1;
      }
      timerId = -1;
      visible = true;
      labelTimer = setInterval(function() {
        visible = !visible;
        render();
      }, 700);

      render();
    }
  }

  function resume(byUser) {

    if(timerId == -1)
      timerId = setInterval(loop, 1000 / fps);

    if(labelTimer != -1) {
        clearInterval(labelTimer);
        labelTimer = -1;
      }

    if(byUser) {
      isPaused = false;
      visible = false;
    }
  }

  function pressAnyKeyToContinue() {
    visible = true;
    if(labelTimer != -1)
      clearInterval(labelTimer);
    labelTimer = setInterval(function() {
      visible = !visible;
      render();
    }, 700);
    $(document).unbind('keydown');
    initKeyboardController(function() {
      if(ignoreKeyboard)
        return;

      playing = true;
      visible = false;
      $(document).unbind('keydown');
      resume();
      initKeyboardController(Snake.prototype.keyboardHandler);
      if(labelTimer != -1)
        clearInterval(labelTimer);
      labelTimer = -1;
    });
  }

  function startGame() {
    playing = false;
    pressAnyKeyToContinue();

    pause();
    points = 0;
    reverse = false;
    snake = new Snake(c, 2, 18, "#5EFF71", 2);
    guestSnake = new Snake(c, 2, 22, "blue", 2);
    var grass = document.createElement("IMG");
    grass.src = 'grass.png';
    background = new Background(c, grass);
    var bullet = document.createElement("IMG");
    treat = new Treat(0, 0, c, bullet);
    treat.randomize();

    grass.onload = function() {
      bullet.src = 'bullet.png';
      bullet.onload = function() {
        render();
      }
    }
  }

  function Tile(x, y, context, texture) {
    this.x = x;
    this.y = y;
    this.context = context;
    this.texture = texture;
  }

  Tile.prototype.draw = function() {

    if(!this.texture)
      ctx.fillRect(this.x * UNIT_TO_PX, this.y * UNIT_TO_PX, UNIT_TO_PX, UNIT_TO_PX);
    else {
      ctx.drawImage(this.texture, this.x * UNIT_TO_PX, this.y * UNIT_TO_PX, UNIT_TO_PX, UNIT_TO_PX);
    }
  }

  function Treat(x, y, context, texture) {

    this.x = x;
    this.y = y;
    this.context = context;
    this.texture = texture;

    this.randomize = function() {
      var x = Math.floor(Math.random() * W),
        y = Math.floor(Math.random() * H);

      this.x = x;
      this.y = y;
    }
  }

  Treat.prototype.draw = Tile.prototype.draw;

  function Snake(context, headX, headY, color, speed) {
    var that = this;
    this.context = context;
    this.color = color;
    this.speed = speed;
    this.state = "alive";
    this.dir = {x: 1, y: 0};
    this.oldDir = {x: 1, y: 0};
    this.tiles = [new Tile(headX+0-2, headY+0, context),
                  new Tile(headX+1-2, headY+0, context),
                  new Tile(headX+2-2, headY+0, context)];

    this.isAlive = function() {
      return this.state === "alive";
    }

    this.getColor = function() {
      return this.color;
    }

    this.setColor = function(color) {
      this.color = color;
    };

    this.reverse = function() {
      this.tiles.reverse();
      this.dir.x *= -1;
      this.dir.y *= -1;
    };

    this.getSpeed = function() {
      return this.speed;
    }

    this.setSpeed = function(speed) {
      that.speed = speed;
      switch(speed) {
        case 1:
          fps = 6;
          break;
        case 2:
          fps = 10;
          break;
        case 3:
          fps = 20;
          break;
      }
    }

    this.setSpeed(this.speed);

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
        this.setAlive(false);
        //playing = false;
        //$("#modal-died-score").text(points);
        //$('#enterNameModal').modal("show");
      }

      if(this.checkTreat()) {
        treat.randomize();
        points++;
        var tail = this.tiles[0];
        var newTail = new Tile(tail.x, tail.y, context);
        this.tiles.unshift(newTail);
      }

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
      return (head.x == treat.x && head.y == treat.y);
    }

    this.restoreSections = function(sections) {
      this.tiles = [];
      sections.forEach(function(section) {
        var tile = new Tile(section.x, section.y, that.context);
        this.tiles.push(tile);
        console.log("tile=", tile)
      });
    }

    this.getSections = function() {

      var sections = [];
      this.tiles.forEach(function(tile) {
        sections.push({x: tile.x, y: tile.y});
      });

      return sections;
    }

    this.draw = function() {
      if(!this.isAlive()) {
        ctx.fillStyle = "red"
      }
      else {
        ctx.fillStyle = this.color;
      }

      this.tiles.forEach(function(tile) {
        tile.draw();
      });

      if(!this.isAlive()) {
        ctx.fillStyle = this.color;
      }
    };
  }

  Snake.prototype.keyboardHandler = function(dir) {
    switch(dir) {
      case "up":
        if(!playerSnake.oldDir.y) {
          playerSnake.dir.x = 0;
          playerSnake.dir.y = -1;
        }
        break;
      case "down":
        if(!playerSnake.oldDir.y) {
          playerSnake.dir.x = 0;
          playerSnake.dir.y = 1;
        }
        break;
      case "left":
        if(!playerSnake.oldDir.x) {
          playerSnake.dir.x = -1;
          playerSnake.dir.y = 0;
        }
        break;
      case "right":
        if(!playerSnake.oldDir.x) {
          playerSnake.dir.x = 1;
          playerSnake.dir.y = 0;
        }
        break;
      case "reverse":
        playerSnake.reverse();
        break;
    }
  };

  function Background(context, texture) {

    var tiles = [];
    var that = this;

    for(var i=0; i<H; i++) {
      for(var j=0; j<W; j++) {
        tiles[j+W*i] = new Tile(j, i, context, texture);
      }
    }

    this.draw = function() {
      tiles.forEach(function(tile) {
        tile.draw();
      });
    };
  }

  function loop() {
    update();
    render();
  }



  function update() {
    playerSnake.update();
    //guestSnake.update();

    var data = {};
    data.snake = (isHost ? "host" : "guest");
    data.snakeSections = playerSnake.getSections();
    data.snakePoints = points;

    if(!test)
      emitMove(data);
    test = true;
  }

  var visible;
  var labelTimer;

  function render() {
    ctx.clearRect(0, 0, W * UNIT_TO_PX, H * UNIT_TO_PX);
    background.draw();
    snake.draw();
    guestSnake.draw();
    treat.draw();

    makeText((!player1 ? "Player1: " : player1+": ")+points, 10, 10, 15);
    makeText((!player2 ? "Player2: " : player2+": ")+points, 10, 10, 35);

    if(isPaused && visible)
      makeText("Game Paused", 25, 270, 190);
    else if(visible)
      makeText("Press Any Key", 25, 250, 190);
  }

  function makeText(text, size, x, y) {
    var fillStyle = ctx.fillStyle;
    ctx.fillStyle = "white";
    ctx.font = size+"px myFont";
    ctx.fillText(text, x, y);
    ctx.fillStyle = fillStyle;
  }

  function initKeyboardController(callback) {
    var dict = {38 : "up",
                40 : "down",
                37 : "left",
                39 : "right",
                82: "reverse"
              };

    $(document).keydown(function( event ) {
      callback(dict[event.which]);
    });
  }

  onGameStart(function() {
    ignoreKeyboard = false;
    playerSnake = (isHost ? snake : guestSnake);
    opponentSnake = (isHost ? guestSnake : snake);
  });

  onRender(function(data) {
    if((isHost && data.snake === "host") || (!isHost && data.snake === "guest"))
      return;

    opponentSnake.restoreSections(data.snakeSections);

  });

  startGame();
});
