"use strict";

var data = require("./data");
var obj = {}, res = [];

data.forEach(function(element) {
  var date = element.fields.date, id = element.fields.student;
  if(!obj[date])
    obj[date] = [];

  if(obj[date].indexOf(id) == -1)
    obj[date].push(id);
  else
    res.push(element);
});

console.log(res);
