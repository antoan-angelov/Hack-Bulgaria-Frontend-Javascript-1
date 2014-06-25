"use strict";

var beerAndFries = function(data) {

  if(data.length === 0)
    return 0;

  var scores = {"beer" : [], "fries" : [] };

  data.forEach(function(element) {
    scores[element.type].push(element.score);
  });

  var sorter = function(a,b) {
    return a - b;
  };

  scores.beer.sort(sorter);
  scores.fries.sort(sorter);

  return scores.beer.map(function(el, index) {
    return el * scores.fries[index];
  }).reduce(function(previousValue, currentValue){
    return previousValue + currentValue;
  });
};

exports.beerAndFries = beerAndFries;
