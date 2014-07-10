"use strict";

Handlebars.registerHelper('list', function(items, options) {
  var out = "";

  for(var i=0, l=items.length; i<l; i++) {
    out += options.fn(items[i]) + (i < l-1 ? ", " : "");
  }

  return out;
});
