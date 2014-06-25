"use strict";

var _ = require("lodash");

var htmlGenerator = {
    link : function(data) {
      return _.template("<a href=\"<%= href %>\" title=\"<%= title %>\"><%= label %></a>", data);
    },
    paragraph: function(data) {
      return _.template("<p><%= label %></p>", data);
    },
    list: function(data) {
      var list = "<% _.forEach(children, function(name) { %><li><%- name.label %></li><% }); %>";
      return _.template("<<%= type %>><%=val %></<%= type %>>",
          {"type" : data.type, val : _.template(list, data) });
    },
    tag: function(data) {

      var attributes = "";

      if(data.attributes) {
        var attributesList = " <% _.forEach(attributes, function(attr) { %><%- attr.key %>=\"<%- attr.value %>\" <% }); %>";
        attributes = _.template(attributesList, data);
      }

      return _.template("<<%= tag %><%= attributes %>><%= content %></<%= tag %>>",
        {"tag":data.tagName, "attributes":attributes, "content":data.data});
    }
};

console.log(htmlGenerator.paragraph({label:"Hack Bulgaria"}));

console.log(htmlGenerator.link({
    href: "https://hackbulgaria.com",
    title: "Hack Bulgaria",
    label: "Курсове по Програмиране!"
}));

console.log(htmlGenerator.list({
    type: "ol",
    children: [{
        label: "Item 1"
    }, {
        label: "Item 2"
    }]
}));

console.log(htmlGenerator.tag({
    tagName: "div",
    data: htmlGenerator.tag({
        tagName: "h1",
        data: "Hello!"
    }),
    attributes: [{
        key: "class",
        value: "container"
    }, {
        key: "id",
        value: "main-container"
    }]
}));
