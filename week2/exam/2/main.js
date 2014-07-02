"use strict";

$(function() {

  var secondsCount,
      secondsLeft,
      countType,
      intervalId = -1;

  $("#btnCountUp").click(function() {
    startTimer("up");
  });

  $("#btnCountDown").click(function() {
    startTimer("down");
  });

  $("#btnReset").click(function() {
    resetTimer();
    displayTime(0);
  });

  function startTimer(type) {
    var $minutes = $("#minutes"),
        $seconds = $("#seconds"),
        minutesVal = $minutes.val( ),
        secondsVal = $seconds.val( ),
        minutes = minutesVal.length > 0 ? parseInt( minutesVal, 10 ) : 0,
        seconds = secondsVal.length > 0 ? parseInt( secondsVal, 10 ) : 0;

    secondsCount = secondsLeft = minutes * 60 + seconds;
    countType = type;

    displayTime((countType === "down" ? secondsCount : 0), $minutes, $seconds);

    resetTimer();

    intervalId = setInterval(function() {
      secondsLeft --;
      if(secondsLeft === 0) {
        resetTimer();
      }

      var actualSeconds = (countType === "down" ? secondsLeft : secondsCount - secondsLeft);
      displayTime(actualSeconds);

    }, 1000);
  }

  function displayTime(actualSeconds) {
    var minutes = Math.floor( actualSeconds / 60 ),
        seconds = actualSeconds % 60,
        minutesString = format(minutes),
        secondsString = format(seconds);

    $("#minute-first-digit").html(minutesString[0]);
    $("#minute-second-digit").html(minutesString[1]);
    $("#second-first-digit").html(secondsString[0]);
    $("#second-second-digit").html(secondsString[1]);
  }

  function resetTimer() {
    if(intervalId != -1) {
      clearInterval(intervalId);
      intervalId = -1;
    }
  }

  function format(num) {
    return num < 10 ? "0" + num : num + "";
  }
});
