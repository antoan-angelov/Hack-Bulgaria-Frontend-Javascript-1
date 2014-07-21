"use strict";

$(function() {
  var c = $("#drawCanvas");
  var ctx = c[0].getContext("2d");
  var curr_triangle_vertices = [];
  var triangles = [];
  var color = '#FF0000';

  $("#pickColor").val(color);

  if(!localStorage.saves)
    localStorage.saves = JSON.stringify({});

  $("#clear").click(function() {
    ctx.clearRect(0, 0, c.width(), c.height());
    triangles = [];
  });

  $("#ok-save-name").click(function() {
    var saveName = $("#save-name").val();
    var saves = JSON.parse(localStorage.saves);
    saves[saveName] = getTriangles();

    localStorage.saves = JSON.stringify(saves);
  });

  $('#loadSaveModal').on('show.bs.modal', function () {
    var $select = $("#select-load");
    var saves = JSON.parse(localStorage.saves);
    for(var key in saves) {
      $select.append(["<option>", key, "</option>"].join(""));
    }
  });

  $("#load-save").click(function() {
    var save = $( "#select-load option:selected" ).text();
    var saves = JSON.parse(localStorage.saves);
    setTriangles(saves[save]);
  });

  function setTriangles(data) {
    data.forEach(function(triangleData) {
      triangles.push(new Triangle(ctx, triangleData.color, triangleData.vertices));
    });
    render();
  }

  function getTriangles() {
    var res = [];
    triangles.forEach(function(triangle) {
      res.push(triangle.getInfo());
    });

    return res;
  }

  function Triangle(context, color, coordinates) {

    this.draw = function() {
      context.beginPath();
      ctx.moveTo(coordinates[0].x, coordinates[0].y);
      for(var i=1; i<4; i++) {
        var k = i % 3;
        context.lineTo(coordinates[k].x, coordinates[k].y);
      }
      context.closePath();
      context.fillStyle = color;
      context.fill();
    }

    this.getInfo = function() {
      return {
        color: color,
        vertices: coordinates
      }
    }
  }

  function render() {
    triangles.forEach(function(triangle) {
      triangle.draw();
    });
  }

  $("#pickColor").change(function() {
    color = $(this).val();
  });

  c.click(function(event) {
    var point = {x: event.clientX, y: event.clientY };
    curr_triangle_vertices.push(point);

    if(curr_triangle_vertices.length == 3) {
      triangles.push(new Triangle(ctx, color, curr_triangle_vertices));
      curr_triangle_vertices = [];
      render();
    }

  });
});


