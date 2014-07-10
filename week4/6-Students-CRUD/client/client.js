"use strict";

$(function() {

  var source   = $("#row-template").html();
  var template = Handlebars.compile(source);
  var students;

  $("#modal-save").click(function() {
    var facultyNumber = $("#modal-number").val();
    var name = $("#modal-name").val();
    var courses = [];

    $( "#modal-courses option:selected" ).each(function() {
      courses.push($(this).text());
    });

    var student = {
                    "facultyNumber" : facultyNumber,
                    "name" : name,
                    "courses" : courses};
    addStudent(student, function(data) {

      var st = getStudent(student.facultyNumber);

      if(!st) {
        students.push(student);
      }
      else {
        var index = students.indexOf(st);
        students[index] = student;
      }
      displayAllStudents();
    });
  });

  function clearModal() {
    $("#modal-number").val("");
    $("#modal-name").val("");
    $("#modal-courses").val([]);
    $("#modal-number").prop('disabled', false);
  }

  $('#myModal').on('hidden.bs.modal', function() {
      clearModal();
  });

  function getAllStudents(success, error) {
    $.ajax({
      url: "http://localhost:3030/students"
    })
    .done(success)
    .fail(error);
  }

  function getStudent(facultyNumber, success, error) {
    $.ajax({
      url: "http://localhost:3030/student/" + facultyNumber
    })
    .done(success)
    .fail(error);
  }

  function addStudent(student, success, error) {
    $.ajax({
      type: "POST",
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(student),
      url: "http://localhost:3030/student"
    })
    .done(success)
    .fail(error);
  }

  function deleteStudent(facultyNumber, success, error) {
    $.ajax({
      type: "DELETE",
      url: "http://localhost:3030/student/" + facultyNumber
    })
    .done(success)
    .fail(error);
  }

  getAllStudents(function(data) {
    students = data;
    displayAllStudents();
  });

  function displayAllStudents() {
    var result = template({"students" : students});
    $("#cont").html(result);

    $(".btn-student-edit").click(function() {
      var student = getStudent($(this).data("student-id"));

      $("#modal-number").val(student.facultyNumber);
      $("#modal-name").val(student.name);
      $("#modal-courses").val(student.courses);
      $("#modal-number").prop('disabled', true);
    });

    $(".btn-student-delete").click(function() {
      var facultyNumber = $(this).data("student-id");
      deleteStudent($(this).data("student-id"), function() {
        var student = getStudent(facultyNumber);
        var index = students.indexOf(student);
        console.log($(this).data("student-id"))
        students.splice(index, 1);
        displayAllStudents();
      });
    });
  }

  function getStudent(facultyNumber) {
    var res = null;

    students.forEach(function(student) {
      if(student.facultyNumber == facultyNumber) {
        res = student;
        return;
      }
    });

    return res;
  }
});
