"use strict";

$(function() {
  var studentsSource = $("#students-row-template").html();
  var studentsTemplate = Handlebars.compile(studentsSource);
  var visitsSource = $("#visits-row-template").html();
  var visitsTemplate = Handlebars.compile(visitsSource);
  var students;
  var COURSE_JS = "Frontend JavaScript";
  var COURSE_JAVA = "Core Java";
  var courses = [COURSE_JS, COURSE_JAVA];
  var course_dates = {};
  course_dates[COURSE_JS] = [];
  course_dates[COURSE_JAVA] = [];

  $("input[type='checkbox']").on('change', function(){
    var g1 = $("#group1"), g2 = $("#group2"), arr = [];

    if(g1.prop("checked"))
      arr.push(g1.val());
    if(g2.prop("checked"))
      arr.push(g2.val());

    populateStudentsTable(students.filter(function(student) {
      var res = false;
      student.courses.forEach(function(course) {
        if(arr.indexOf(course) != -1)
          res = true;
      });
      return res;
    }));
  });

  $.getJSON("https://hackbulgaria.com/api/checkins/")
  .done(function(data) {
    students = handleStudentsData(data);
    populateStudentsTable(students);
  });

  function populateStudentsTable(students) {
    var html = studentsTemplate({"students" : students});
    $("#students-table tbody").html(html);

    $('#students-table tbody tr').click(function() {
      $('#visits').modal('show');

      var student = getStudentById($(this).attr("id"));
      populateVisitsTable(student);
    });
  }

  function populateVisitsTable(student) {
    var visits = generateVisitsArray(student);
    var html = visitsTemplate({"visits" : visits});
    $("#visits-table tbody").html(html);
    $("#modal-student-name").text(student.name);
    $("#modal-course-name").text(student.courses[0]);
  }

  function generateVisitsArray(student) {
    var res = [];
    var course = student.courses[0];
    course_dates[course].forEach(function(date) {
      var visited = (student.visits.indexOf(date) != -1 ? "Yes" : "No");
      res.push({"lectureDate" : date, "visited" : visited});
    });

    return res.reverse();
  }

  function getStudentById(id) {
    var res = null;
    students.forEach(function(student) {
      if(student.id == id) {
        res = student;
        return;
      }
    });

    return res;
  }

  function handleStudentsData(visits) {
    var res = [];
    var temp = {};

    visits.forEach(function(visit) {
      var t;

      if(!temp[visit.student_id])
        t = {
          "id" : visit.student_id,
          "name" : visit.student_name,
          "courses" : [],
          "visits" : []};
      else
        t = temp[visit.student_id];

      visit.student_courses.forEach(function(course) {
        if(courses.indexOf(course.name) != -1) {
          if(t.courses.indexOf(course.name) == -1)
            t.courses.push(course.name);

          t.visits.push(visit.date);

          var dates = course_dates[course.name];
          if(dates.indexOf(visit.date) == -1)
            dates.push(visit.date);
        }
      });

      if(t.courses.length > 0)
        temp[visit.student_id] = t;
    });

    for(var key in temp) {
      res.push(temp[key]);
    }

    return res;
  }
});
