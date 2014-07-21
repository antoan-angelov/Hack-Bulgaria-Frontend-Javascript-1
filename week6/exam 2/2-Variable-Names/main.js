"use strict";

$(function() {

  var source   = $("#name-template").html();
  var template = Handlebars.compile(source);

  loadNames();

  function loadNames() {
    $.ajax({
      url: "http://localhost:8080/names",
      dataType: "json"
    })
    .done(function(data) {
      populate(data);
    });
  }

  function populate(names) {
    var html = template({names: names});
    $("#cont").html(html);

    $(".update-name").prop('disabled', true);

    $(".enter-name").keyup(function() {
      $(this).parent().parent().find(".update-name").prop('disabled', false);
    });

    $(".update-name").click(function() {
      var name = $(this).parent().find(".enter-name").val();
      var nameId = parseInt($(this).data("name-id"));
      var data = {name: name, nameId: nameId};

      $.ajax({
        type: "POST",
        data: JSON.stringify(data),
        url: "http://localhost:8080/name",
        dataType: "json",
        contentType: 'application/json'
      })
      .done(function(data) {
        if(data.status === "NAME_SAVED") {
          loadNames();
        }
      });
    });
  }

  function getNameById(names, nameId) {
    var res = null;
    names.forEach(function(name) {
      if(name.nameId == nameId) {
        res = name;
        return;
      }
    });

    return res;
  }
});
