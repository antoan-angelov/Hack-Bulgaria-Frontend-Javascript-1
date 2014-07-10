"use strict";

$(function() {
  $("dt a").on("click", function() {
    var $toHide = $("dd:visible");
    var $toShow = $(this).parent().next("dd");

    if($toHide.get(0) === $toShow.get(0))
      return;

    $toHide.slideUp("slow");
    $toShow.hide();
    $toShow.slideDown("slow");
  });
});
