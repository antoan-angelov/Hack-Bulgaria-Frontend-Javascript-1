$(function() {
  var c = document.getElementById("playground"),
      $canvas = $("#playground"),
      ctx = c.getContext("2d"),
      UNIT_TO_PX = 10,
      W = $canvas.width()/UNIT_TO_PX,
      H = $canvas.height() / UNIT_TO_PX,
      fps = 6,
      snake,
      guestSnake,
      background,
      treat,
      timerId = -1,
      playing = false,
      isPaused = false,
      reverse = false,
      ignoreKeyboard = true,
      playerSnake,
      opponentSnake,
      hostColor = "#5EFF71",
      guestColor = "yellow";

  $("#modal-server").val(SERVER_BASE);

  $("#btn-settings").click(function() {
    pause();
    $("#modal-points").text(playerSnake.getPoints());
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

    localStorage.server = $("#modal-server").val();

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

  function pause() {

    if(timerId != -1) {
      clearInterval(timerId);
      timerId = -1;
    }
  }

  function resume() {

    if(timerId == -1)
      startLoop();

    if(labelTimer != -1) {
      clearInterval(labelTimer);
      labelTimer = -1;
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

      playerSnake.resetStarveTimer();
      playerSnake.unlock();
      opponentSnake.unlock();

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

  function startLoop() {
    timerId = setInterval(loop, 1000 / fps);
  }

  function startGame() {
    playing = false;
    pressAnyKeyToContinue();
    startLoop();

    reverse = false;
    snake = new Snake(c, 2, 18, hostColor);
    guestSnake = new Snake(c, 2, 22, guestColor);
    var grass = document.createElement("IMG");
    grass.src = 'grass.png';
    background = new Background(c, grass);
    var bullet = document.createElement("IMG");
    treat = new Treat(-1, -1, c, bullet);

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

    if(this.x < 0 || this.y < 0 || this.x >= W || this.y >= H)
      return;

    if(!this.texture)
      ctx.fillRect(this.x * UNIT_TO_PX, this.y * UNIT_TO_PX, UNIT_TO_PX, UNIT_TO_PX);
    else {
      ctx.drawImage(this.texture, this.x * UNIT_TO_PX, this.y * UNIT_TO_PX, UNIT_TO_PX, UNIT_TO_PX);
    }
  }

  function Treat(x, y, context, texture) {

    var that = this;
    this.x = x;
    this.y = y;
    this.context = context;
    this.texture = texture;

    this.randomize = function() {
      var x = Math.floor(Math.random() * (W-1)),
          y = Math.floor(Math.random() * (H-1));

      that.x = x;
      that.y = y;
    }

    this.restore = function(data) {
      that.x = data.x;
      that.y = data.y;
    }
  }

  Treat.prototype.draw = Tile.prototype.draw;

  function Snake(context, headX, headY, color) {

    var that = this;
    this.context = context;
    this.locked = true;
    this.color = color;
    this.points = 0;
    this.state = "alive";
    this.dir = {x: 1, y: 0};
    that.timeLeft = Snake.STARVE_TIMEOUT;
    this.oldDir = {x: 1, y: 0};
    this.tiles = [new Tile(headX+0-2, headY+0, context),
                  new Tile(headX+1-2, headY+0, context),
                  new Tile(headX+2-2, headY+0, context)];

    this.resetStarveTimer = function() {
      if(that.starveTimer)
        clearInterval(that.starveTimer);
      that.timeLeft = Snake.STARVE_TIMEOUT;
      that.starveTimer = setInterval(function() {
        that.timeLeft--;

        if(that.starveTimer && that.timeLeft == 0) {
          clearInterval(that.starveTimer);
          that.setAlive(false);
        }
      }, 1000);
    }

    this.unlock = function() {
      that.locked = false;
    }

    this.getStarveSecondsLeft = function() {
      return that.timeLeft;
    }

    this.isAlive = function() {
      return that.state === "alive";
    }

    this.getPoints = function() {
      return that.points;
    }

    this.addPoints = function() {
      that.points++;
    }

    this.setPoints = function(pts) {
      that.points = pts;
    }

    this.getColor = function() {
      return that.color;
    }

    this.setColor = function(color) {
      that.color = color;
    };

    this.reverse = function() {
      that.tiles.reverse();
      that.dir.x *= -1;
      that.dir.y *= -1;
    };

    this.setAlive = function(alive) {
      that.state = (alive ? "alive" : "dead");
    }

    this.update = function() {
      if(!that.isAlive() || that.locked)
        return;

      var head = that.tiles[that.tiles.length-1],
          newX = head.x + that.dir.x,
          newY = head.y + that.dir.y;

      if(!that.collidesWithWall(newX, newY)
          && !that.collidesWithSelf(newX, newY)) {

        var popped = that.tiles.shift();
        popped.x = newX;
        popped.y = newY;
        that.tiles.push(popped);
      }
      else {
        that.setAlive(false);
        //playing = false;
        //$("#modal-died-score").text(points);
        //$('#enterNameModal').modal("show");
      }

      if(that.checkTreat()) {
        that.resetStarveTimer();
        treat.randomize();
        playerSnake.addPoints();
        var tail = that.tiles[0];
        var newTail = new Tile(tail.x, tail.y, context);
        that.tiles.unshift(newTail);
      }

      that.oldDir.x = that.dir.x;
      that.oldDir.y = that.dir.y;
    };

    this.collidesWithSelf = function(x, y) {
      var res = false;
      that.tiles.forEach(function(tile) {
        if(x == tile.x && y == tile.y)
          res = true;
      });

      return res;
    }

    this.collidesWithWall = function(x, y) {
      return x >= W || y >= H || x < 0 || y < 0;
    }

    this.checkTreat = function() {
      var head = that.tiles[that.tiles.length-1];
      return (head.x == treat.x && head.y == treat.y);
    }

    this.restoreSections = function(sections) {

      if(sections.length > that.tiles.length) {
        var diff = sections.length - that.tiles.length;
        for(var i=0; i<diff; i++) {
          that.tiles.push(new Tile(0, 0, that.context));
        }
      }
      else if(sections.length < that.tiles.length) {
        var diff = sections.length - that.tiles.length;
        that.tiles = that.tiles.slice(0, diff);
      }

      sections.forEach(function(section, index) {
        var tile = that.tiles[index];
        tile.x = section.x;
        tile.y = section.y;
      });
    }

    this.getSections = function() {

      var sections = [];
      that.tiles.forEach(function(tile) {
        sections.push({x: tile.x, y: tile.y});
      });

      return sections;
    }

    this.draw = function() {
      if(!that.isAlive()) {
        ctx.fillStyle = "red"
      }
      else {
        ctx.fillStyle = that.color;
      }

      that.tiles.forEach(function(tile) {
        tile.draw();
      });

      if(!that.isAlive()) {
        ctx.fillStyle = that.color;
      }
    };
  }

  Snake.STARVE_TIMEOUT = 30;

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
    if(playerSnake)
      playerSnake.update();

    sync();
  }

  function sync() {
    var data = {};
    data.hostSnake = {};
    data.hostSnake.sections = snake.getSections();
    data.hostSnake.alive = snake.isAlive();
    data.hostSnake.points = snake.getPoints();

    data.guestSnake = {};
    data.guestSnake.sections = guestSnake.getSections();
    data.guestSnake.alive = guestSnake.isAlive();
    data.guestSnake.points = guestSnake.getPoints();

    data.treat = {x: treat.x, y:treat.y};

    emitMove(data);
  }

  var visible;
  var labelTimer;

  function render() {
    ctx.clearRect(0, 0, W * UNIT_TO_PX, H * UNIT_TO_PX);
    background.draw();
    snake.draw();
    guestSnake.draw();
    treat.draw();

    makeText((!player1 ? "Player 1: " : player1+": ")+(snake ? snake.getPoints() : 0), 10, 10, 15, hostColor);
    makeText((!player2 ? "Player 2: " : player2+": ")+(guestSnake ? guestSnake.getPoints() : 0), 10, 10, 35, guestColor);

    makeText((playerSnake ? formatString(playerSnake.getStarveSecondsLeft()) : formatString(Snake.STARVE_TIMEOUT)), 25, 350, 25);

    if(isPaused && visible)
      makeText("Game Paused", 25, 270, 190);
    else if(visible)
      makeText("Press Any Key", 25, 250, 190);

    if(opponentSnake && !opponentSnake.isAlive()) {
      makeText("YOU WIN", 25, 330, 190);
      if(timerId != -1)
        pause();
    }
    else if(playerSnake && !playerSnake.isAlive()) {
      makeText("YOU LOSE", 25, 300, 190);
      if(timerId != -1)
        pause();
    }
  }

  function formatString(num) {
    var mins = Math.floor(num / 60), secs = num % 60;
    mins = (mins < 10 ? "0"+mins : mins+"");
    secs = (secs < 10 ? "0"+secs : secs+"");
    return mins + ":" + secs;
  }

  function makeText(text, size, x, y, color) {

    if(!color)
      color = "white";

    var fillStyle = ctx.fillStyle;
    ctx.fillStyle = color;
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

    if(isHost) {
      treat.randomize();
      sync();
    }
  });

  onRender(function(data) {

    if(!isHost) {
      snake.restoreSections(data.hostSnake.sections);
      snake.setAlive(data.hostSnake.alive);
      snake.setPoints(data.hostSnake.points);
    }
    else {
      guestSnake.restoreSections(data.guestSnake.sections);
      guestSnake.setAlive(data.guestSnake.alive);
      guestSnake.setPoints(data.guestSnake.points);
    }
    treat.restore(data.treat);
  });

  startGame();
});
