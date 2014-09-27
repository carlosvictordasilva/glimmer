$(document).ready(function () {
  var $videolink = $('#video-link');
  var $overlaydiv = $('#overlay-div');
  var $overlayvideo = $('#overlay-video');
  $videolink.click(function(event) {
    event.preventDefault();
    $overlaydiv.removeClass('hide');
    $overlayvideo.removeClass('hide');
  });
  $overlaydiv.click(function() {
    $overlaydiv.addClass('hide');
    $overlayvideo.addClass('hide');
  });
})
