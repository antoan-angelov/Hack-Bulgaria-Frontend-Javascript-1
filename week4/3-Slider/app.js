"use strict";

google.load('search', '1');

var imageSearch;
var results;
var currentResultId;

$(function() {
  $("#next").click(function() {
    if(currentResultId + 1 < results.length) {
      loadImage(++currentResultId);
    }
  });

  $("#prev").click(function() {
    if(currentResultId - 1 >= 0) {
      loadImage(--currentResultId);
    }
  });

  $("#search").click(function() {
    var query = $("#query").val();
    imageSearch.execute(query);
    currentResultId = 0;
  });
});

function loadImage(id) {
  var url = results[id].url;
  $("#current-image").fadeOut(500, function() {
    $("#current-image").attr("src", url);
    $("#current-image").fadeIn(500);
  });
}

function searchComplete() {

  // Check that we got results
  if (imageSearch.results && imageSearch.results.length > 0) {
    console.log(imageSearch.results);
    results = imageSearch.results;
    loadImage(currentResultId);
  }
}

function OnLoad() {

  // Create an Image Search instance.
  imageSearch = new google.search.ImageSearch();

  // Set searchComplete as the callback function when a search is
  // complete.  The imageSearch object will have results in it.
  imageSearch.setSearchCompleteCallback(this, searchComplete, null);

  // Include the required Google branding
  google.search.Search.getBranding('branding');
}
google.setOnLoadCallback(OnLoad);
