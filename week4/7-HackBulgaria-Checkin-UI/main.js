"use strict";

$(function() {
  var MILLIS_IN_A_WEEK = 1000 * 60 * 60 * 24 * 7,
      FIRST_LECTURE_TIMESTAMP = Date.parse("2014-05-26"),
      GROUP_JS = 1,
      GROUP_JAVA = 2,
      GROUP_ALL = 0,
      TYPE_DAY = "day",
      TYPE_WEEK = "week",
      TYPE_MONTH = "month",
      COURSE_JS = "Frontend JavaScript",
      COURSE_JAVA = "Core Java",
      all_students,
      groups = [COURSE_JS, COURSE_JAVA],
      current_course = COURSE_JS,
      current_group = 0,
      num_pages,
      current_page = -1,
      grouped_students,
      chart_type = "day",
      months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

  // Get the context of the canvas element we want to select
  var ctx = $("#myChart").get(0).getContext("2d");

  var pagesSource = $("#pages-template").html();
  var pagesTemplate = Handlebars.compile(pagesSource);

  $("input[name=courses]").change(function () {
    current_course = $(this).val();
    current_page = -1;
    grouped_students = processData(all_students, current_course, current_group, chart_type, current_page);
  });

  $("input[name=types]").change(function () {
    chart_type = $(this).val();
    current_page = -1;
    grouped_students = processData(all_students, current_course, current_group, chart_type, current_page);
  });

  $("input[type='checkbox']").on('change', function(){
    var val1 = $("#group1").prop("checked");
    var val2 = $("#group2").prop("checked");

    if(val1 && !val2) {
      current_group = GROUP_JS;
    }
    else if(!val1 && val2) {
      current_group = GROUP_JAVA;
    }
    else if(val1 && val2) {
      current_group = GROUP_ALL;
    }

    current_page = -1;
    grouped_students = processData(all_students, current_course, current_group, chart_type, current_page);
  });

  function addDataset(datasets, name, data) {
    datasets.push({
                  label: name,
                  fillColor: "rgba(220,220,220,0.5)",
                  strokeColor: "rgba(220,220,220,0.8)",
                  highlightFill: "rgba(220,220,220,0.75)",
                  highlightStroke: "rgba(220,220,220,1)",
                  data: data
              });
  }

  function processData(students, course, group, type, page) {
    var groupedByDates = (page == -1 ? groupBy(all_students, course, group, type) : grouped_students),
        dates = Object.keys(groupedByDates),
        visits = [],
        max = 0;

    if(page == -1) {
      page = 1;
      current_page = 1;
    }

    var recentDates = dates.slice(Math.max(dates.length-5*page, 0), Math.min(dates.length-5*(page-1), dates.length)),
        data = {
          labels: recentDates,
          datasets: []
        };

    addDataset(data.datasets, course, visits);

    recentDates.forEach(function(date) {
      var courses = groupedByDates[date],
          numVisitors = (courses[course] ? courses[course].length : 0);

      visits.push(numVisitors);
      if(max < numVisitors)
        max = numVisitors;
    });

    num_pages = Math.ceil(dates.length / 5);

    var pages = [];
    for(var i=1; i<= num_pages; i++)
      pages.push(i);

    populatePages(pages);

    new Chart(ctx).Bar(data, {scaleOverride: true,
      scaleStepWidth: Math.ceil(max/20), scaleSteps: 20});

    return groupedByDates;
  }

  function populatePages(pages) {
    var html = pagesTemplate({"pages" : pages});
    $("#pages-cont").html(html);

    $("#btn-prev-page").click(function() {
      if(current_page - 1 >= 1)
        processData(all_students, current_course, current_group, chart_type, --current_page);
    });

    $("#btn-next-page").click(function() {
      if(current_page + 1 <= num_pages)
        processData(all_students, current_course, current_group, chart_type, ++current_page);
    });

    $(".btn-page").click(function() {
      current_page = parseInt($(this).text());
      processData(all_students, current_course, current_group, chart_type, current_page);
    });
  }

  $.getJSON("https://hackbulgaria.com/api/checkins/")
  .done(function(data) {
    all_students = data;
    current_page = -1;
    grouped_students = processData(all_students, current_course, current_group, chart_type, current_page);
  });

  function hasCourse(student) {
    var courses = student.student_courses;

    var res = false;
    courses.forEach(function(course) {
      groups.forEach(function(group) {
        if(course.name === group)
          res = true;
      });
    });

    return res;
  }

  function isDateValid(student) {
    var date = new Date(Date.parse(student.date));
    var weekday = date.getDay();
    return (weekday === 2 || weekday === 4 || weekday === 6 );
  }

  function groupBy(students, course, group, type) {
    var res = {};

    all_students.forEach(function(student) {
      if(isDateValid(student)) {
        var student_course = null;
        student.student_courses.forEach(function(c){
          if(c.name == course) {
            student_course = c;
            return;
          }
        });

        if(student_course
          && (group == GROUP_ALL || (group != GROUP_ALL
            && student_course.group == group))) {

          var key;

          if(type == TYPE_MONTH) {
            var date = new Date(Date.parse(student.date));
            key = months[date.getMonth()];
          }
          else if(type == TYPE_WEEK) {
            var week = Math.floor((Date.parse(student.date)
              - FIRST_LECTURE_TIMESTAMP) / MILLIS_IN_A_WEEK) - 1;
            key = "Week "+week;
          }
          else if(type == TYPE_DAY) {
            key = student.date;
          }

          if(!res[key]) {
            res[key] = {};
          }

          if(!res[key][course])
            res[key][course] = [];

          res[key][course].push(student);
        }
      }
    });

    return res;
  }
});
