"use strict";

$(function() {

  showSelected();

  $(window).on("hashchange", function() {
    showSelected();
  });

  function showSelected() {
    var pattern = /#tab\d+/g;
    var id = pattern.test(location.hash) ? location.hash.substr(1) : "tab1";
    $("div[id^=\"tab\"]").hide();
    $("#"+id).fadeIn("slow");
    $("a[href^=\"#\"]").css({"background": "#666"});
    $("a[href$=\"#"+id+"\"]").css({"background": "red"});
  }
});

