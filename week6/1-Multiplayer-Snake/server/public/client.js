"use strict";

var socket = new io("http://10.0.2.15:3000"),
    gameId,
    socketId,
    isHost = false;

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
  socket.on("connect", function(data) {
    socketId = socket.io.engine.id;

    $("#host").click(function() {
      post("/createGame", {
        "playerName": "RadoRado",
        "socketId": socketId
      },
      function(data) {
        console.log("success!", data);
        isHost = true;
        gameId = data.gameId;
      });
    });

    $("#join").click(function() {

      $.getJSON("/games", function(data) {
        console.log("games: ", data);
      });

      /*post("/joinGame", {
        "playerName": "RadoRado2",
        "socketId": socketId,
        "gameId" : $("#gameId").val()
      },
      function(data) {
        console.log("success!", data);
        gameId = $("#gameId").val();
      });*/
    });
  });
});

socket.on('start', function(socket){
  console.log('a user connected');
});
