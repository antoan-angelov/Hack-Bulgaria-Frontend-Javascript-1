var socket = new io("http://10.0.2.15:3000"),
    gameId,
    socketId,
    isHost = false,
    player1,
    player2,
    delayShowMPSettings = false,
    matchesTimeoutId = -1,
    source,
    template,
    onGameStartCallback,
    onRenderCallback,
    gameStarted = false;

function post(url, data, callback) {
  $.ajax({
    type: "POST",
    url: url,
    data: JSON.stringify(data),
    contentType: 'application/json'
  })
  .done(callback);
}

function get(url, data, callback) {
  $.ajax({
    url: url,
    data: JSON.stringify(data),
    contentType: 'application/json'
  })
  .done(callback);
}

$(function() {

  window.socket = socket;

  socket.on("connect", function(data) {
    socketId = socket.io.engine.id;
    console.log("socket connected")

    socket.on('render', function(data){
      console.log("render event", data);
    });

    socket.on('start', function(data){
      console.log('a user connected', data);

      player1 = data.player1;
      player2 = data.player2;
    });

    socket.on("disconnect", function() {
      console.log("socket disconnecte!");
    });
  });
});

$("#host").click(function() {
  console.log("hosts match click")
  post("http://10.0.2.15:3000/createGame", {
    "playerName": "RadoRado",
    "socketId": socketId
  },
  function(data) {
    console.log("game created success!", data);
    gameId = data.gameId;
  });
});

$("#move").click(function() {
  var data = {};
  data.gameId = gameId;
  console.log("emitting data", data);
  socket.emit('move', data);
});

$("#join").click(function() {
  gameId = $("#gameId").val();
  post("http://10.0.2.15:3000/joinGame", {
    "playerName": "RadoRado",
    "socketId": socketId,
    "gameId" : gameId
  },
  function(data) {
    console.log("joined game!", data);
  });
});

function emitMove(data) {
  data.gameId = gameId;
  console.log("emitting data", data);
  socket.emit('move', data);
}

function onGameStart(callback) {
  onGameStartCallback = callback;
}

function onRender(callback) {
  onRenderCallback = callback;
}
