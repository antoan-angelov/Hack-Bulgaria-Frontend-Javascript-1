$(function() {
  var c = document.getElementById("playground"),
      $canvas = $("#playground"),
      ctx = c.getContext("2d"),
      UNIT_TO_PX = 10,
      W = $canvas.width()/UNIT_TO_PX,
      H = $canvas.height() / UNIT_TO_PX,
      fps = 12,
      snake,
      background,
      treat,
      timerId = -1,
      points = 0,
      reverse = false;

  if(!localStorage.scores)
    localStorage.scores = JSON.stringify([]);

  $("#btn-settings").click(function() {
    pause();
    $("#modal-color").val(snake.getColor());
    $("#modal-speed").val(snake.getSpeed());
    $("#modal-points").text(points);
  });

  $('#myModal').on('hidden.bs.modal', function() {
    resume();
  });

  $('#enterNameModal').on('hidden.bs.modal', function() {
    $("#modal-name").val("");
    startGame();
  });

  $('#highScores').on('shown.bs.modal', function() {

    var source   = $("#row-template").html();
    var template = Handlebars.compile(source);
    var html = template({"scores" : JSON.parse(localStorage.scores)});
    $("#highScoresTable tbody").html(html);
  });

  $("#save-score").click(function() {
    var scores = JSON.parse(localStorage.scores);
    var score = {"name" : $("#modal-name").val(), "score" : points};

    scores.push(score);

    scores.sort(function(a, b) {
      return b.score - a.score;
    });

    if(scores.length > 10)
      scores = scores.slice(0, 10);

    localStorage.scores = JSON.stringify(scores);
  });

  $("#save-changes").click(function() {

    var snake_speed = $("#modal-speed").val();
    var snake_color = $("#modal-color").val();

    localStorage.snake_speed = snake_speed;
    localStorage.snake_color = snake_color;
    snake.setSpeed(parseInt(snake_speed, 10));
    snake.setColor(snake_color);
    pause();
    resume();

    if(reverse) {
      snake.reverse();
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
    if(timerId != -1)
      clearInterval(timerId);
    timerId = -1;
  }

  function resume() {
    if(timerId == -1)
      timerId = setInterval(loop, 1000 / fps);
  }

  function pressAnyKeyToContinue() {
    visible = true;
    labelTimer = setInterval(function() {
      visible = !visible;
      render();
    }, 700);
    $(document).unbind('keydown');
    initKeyboardController(function() {
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
    pressAnyKeyToContinue();

    pause();
    points = 0;
    reverse = false;
    snake = new Snake(c);
    var grass = document.createElement("IMG");
    grass.src = 'grass.png';
    background = new Background(c, grass);
    var bullet = document.createElement("IMG");
    treat = new Treat(0, 0, c, bullet);
    treat.randomize();
    $("#modal-color").val(snake.getColor());
    $("#modal-speed").val(snake.getSpeed());

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

  function Snake(context) {
    var that = this;
    this.context = context;
    this.color = (localStorage.snake_color ? localStorage.snake_color : "#5EFF71");
    this.speed = (localStorage.snake_speed ? parseInt(localStorage.snake_speed) : 2);
    this.state = "alive";
    this.dir = {x: 1, y: 0};
    this.oldDir = {x: 1, y: 0};
    this.tiles = [new Tile(0, 0, context),
                  new Tile(1, 0, context),
                  new Tile(2, 0, context)];

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
        snake.setAlive(false);
        $("#modal-died-score").text(points);
        $('#enterNameModal').modal("show");
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
      case "pause":
        if(timerId != -1)
          pause();
        else
          resume();
        break;
      case "reverse":
        snake.reverse();
        break;
    }
  };

  function Background(context, texture) {

    var tiles = [];
    var that = this;

    for(var i=0; i<W * H; i++) {
      tiles[i] = new Tile(i%W, Math.floor(i/H), context, texture);
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
    snake.update();
  }

  var visible;
  var labelTimer;

  function render() {
    ctx.clearRect(0, 0, W * UNIT_TO_PX, H * UNIT_TO_PX);
    background.draw();
    snake.draw();
    treat.draw();

    if(visible) {
      var fillStyle = ctx.fillStyle;
      ctx.fillStyle = "white";
      ctx.font = "25px myFont";
      ctx.fillText("Press Any Key", 50, 190);
      ctx.fillStyle = fillStyle;
    }
  }

  function initKeyboardController(callback) {
    var dict = {38 : "up",
                40 : "down",
                37 : "left",
                39 : "right",
                80 : "pause",
                82: "reverse"
              };

    $(document).keydown(function( event ) {
      callback(dict[event.which]);
    });
  }

  startGame();
});
