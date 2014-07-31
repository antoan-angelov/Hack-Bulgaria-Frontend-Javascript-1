"use strict";

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
    gameMode,
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

  $("#single-player").click(function() {
    gameMode = "single";
    onGameStartCallback();
  });

  $("#multiplayer").click(function() {
    gameMode = "multi";
    onGameStartCallback();
  });

  $("#save-name").click(function() {
    localStorage.playerName = $("#modal-username").val();
    $('#playerNameModal').modal('hide');
    $('#chooseGameModeModal').modal('show');
  });

  source   = $("#match-template").html();
  template = Handlebars.compile(source);

  if(!localStorage.playerName) {
    $('#playerNameModal').modal('show');
      $('#playerNameModal').on('hide.bs.modal', function (e) {
        $('#chooseGameModeModal').modal('show');
      });
  }else
    $('#chooseGameModeModal').modal('show');

  socket.on("connect", function(data) {
    socketId = socket.io.engine.id;
console.log("socket connected")
    updateMatches();

    socket.on('render', function(data){
      if(onRenderCallback)
        onRenderCallback(data);
    });

    socket.on('start', function(data){
      gameStarted = true;
      //
      console.log('a user connected', data);


      if($('#waitingForOponent').hasClass('in'))
        $('#waitingForOponent').modal('hide');

      player1 = data.player1;
      player2 = data.player2;

      if(onGameStartCallback)
        onGameStartCallback();
    });

    socket.on("disconnect", function() {
      console.log("socket disconnecte!");
    });
  });
});

function hideMPSettings() {
  $('#multiplayerSettings').modal('hide');
  if(matchesTimeoutId != -1) {
    clearTimeout(matchesTimeoutId);
    matchesTimeoutId = -1;
  }
}

function updateMatches() {
  if(gameStarted) {
    if(matchesTimeoutId != -1) {
      clearTimeout(matchesTimeoutId);
      matchesTimeoutId = -1;
    }
    return;
  }

  $.getJSON("http://10.0.2.15:3000/games", function(data) {
    var matches = [];
    for(var key in data) {
      var host = _.find(data[key], function (x) { return x.isHost })
      matches.push({host: host.playerName, participants: data[key].length, gameId: key});
    }

    var html = template({"matches" : matches});
    $("#matchesTable tbody").html(html);

    $(".join-match").click(function() {
      gameId = $(this).data("game-id");
      post("http://10.0.2.15:3000/joinGame", {
        "playerName": localStorage.playerName,
        "socketId": socketId,
        "gameId" : gameId
      },
      function(data) {
        console.log("joined game!", data);
        hideMPSettings();
      });
    });

    matchesTimeoutId = setTimeout(updateMatches, 1000);
  });
}

$("#host-match").click(function() {
  console.log("hosts match click")
  post("http://10.0.2.15:3000/createGame", {
    "playerName": localStorage.playerName,
    "socketId": socketId
  },
  function(data) {
    console.log("game created success!", data);
    isHost = true;
    gameId = data.gameId;
    hideMPSettings();
    $('#waitingForOponent').modal('show');
  });
});

function emitMove(data) {
  data.gameId = gameId;
  socket.emit('move', data);
}

function onGameStart(callback) {
  onGameStartCallback = callback;
}

function onRender(callback) {
  onRenderCallback = callback;
}
