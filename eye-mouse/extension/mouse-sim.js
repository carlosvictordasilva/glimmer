// append required DOM elements
$('body').before('<div id="eye-mouse-cursor"></div>');
$('body').after('\
  <canvas id="eye-mouse-canvas"></canvas>\
  <video id="eye-mouse-video" style="display: none; visibility:hidden" autoplay></video>\
');

$eyeMouseCanvas = $('#eye-mouse-canvas')

$eyeMouseCanvas.mouseenter(function () {
  $eyeMouseCanvas.animate({
    opacity: 1
  });
});

$eyeMouseCanvas.click(function () {
  $eyeMouseCanvas.animate({
    right: '0px',
    bottom: '0px',
    opacity: 1
  });
});

$eyeMouseCanvas.mouseleave(function () {
  $eyeMouseCanvas.animate({
    right: '-480px',
    bottom: '-360px',
    opacity: 0.5
  });
});

var prevx = $(window).innerWidth()/2;
var prevy = $(window).innerHeight()/2;
var x = prevx;
var y = prevy;
var simx = x;
var simy = y;
var ampy = 25;
var ampx = 35;

var running_xavg = new Array();
var running_yavg = new Array();

var scroll_threshold = 200;

function check_for_scroll(x, y) {
  var from_bottom = $(window).innerHeight() - y;
  var from_top = y;
  if (from_bottom < scroll_threshold) window.scrollBy(0,-(from_bottom - scroll_threshold)/10);
  else if (from_top < scroll_threshold) window.scrollBy(0, -(scroll_threshold-from_top)/10);
}

var nearby_link_threshold = 20;
var nearby_link;

distance = function(x, y, x0, y0) {
  return Math.sqrt((x -= x0) * x + (y -= y0) * y);
};

function highlight_nearest_link(x, y) {
  /*var closest_link = $.nearest({x: x, y: y}, 'a')
  if (closest_link != undefined) { //&& distance(x, y, closest_link.offset().left, closest_link.offset().top) < nearby_link_threshold) {
    $(closest_link).addClass("link_focus");
    if (nearby_link != undefined) $(nearby_link).removeClass("link_focus");
    nearby_link = closest_link;
  } else {
    nearby_link = undefined;
  }*/
}

var clicked = false;
function update_cursor(x, y) {
  if (document.getElementById("eye-mouse-cursor") == undefined) return;
  if (!clicked) document.getElementById("eye-mouse-cursor").style.backgroundColor = "#0f0";// = "url("+chrome.extension.getURL("cursor_images/standard.gif") + ")";
  document.getElementById("eye-mouse-cursor").style.top=(y+1).toString() + "px";
  document.getElementById("eye-mouse-cursor").style.left=(x+1).toString() + "px";
  check_for_scroll(x, y);
  highlight_nearest_link(x, y);
}

var min = 5;
var xmax = $(window).innerWidth()-1;
var ymax = $(window).innerHeight()-1;
var gaze_center =  new camgaze.structures.Point(xmax/2, ymax/2);

function set_gaze_center (new_center) {
  x = new_center.getX();
  y = new_center.getY();
  prevx = x; 
  prevy = y;
  simx = x;
  simy = y;
  for (var i = 0; i < 6; i++) {
    running_xavg.push(x);
    running_yavg.push(y);
  }
}

function bounds_check() {
  if (simx < min) simx = min;
  if (simy < min) simy = min;
  if (simx >= $(window).innerWidth()) simx = $(window).innerWidth()-1 - min;
  if (simy >= $(window).innerHeight()) simy = $(window).innerHeight()-1 - min;
}

function move_from_centroid(c) {
  prevx = x; prevy = y;
  x = c.getX();
  y = c.getY();
  simx -= (x - prevx) * ampx;
  simy += (y - prevy) * ampy;
  bounds_check();
  running_xavg.push(simx);
  running_xavg.shift();
  running_yavg.push(simy);
  running_yavg.shift();
  var xavg = running_xavg.reduce(function(a,b) { return a+b }) / running_xavg.length;
  var yavg = running_yavg.reduce(function(a,b) { return a+b }) / running_yavg.length;
  update_cursor(xavg, yavg);
}
 var output_id = "#keyboard_output";
  function wink(side) {
    //console.log(simx, simy);
    var e = document.elementFromPoint(simx, simy);
    update_cursor(simx, simy);
    //if (typeof e.onclick == "function")
    //  e.onclick.apply(e);
    //if (typeof e.mousedown == "function") e.mousedown();
    if (e != null && e.tagName == "A" && e.hasAttribute("HREF")) {
      clicked = true;
      window.location.replace(e.getAttribute("HREF"));
      $("#eye-mouse-cursor").css("background-color","#00f");
    }
    if (e != null && $(e).hasClass("osk-key")) {
      $("#eye-mouse-cursor").css("background-color","#00f");
      var txt = $(output_id).text() + $(e).text();
      console.log(txt);
      $(output_id).text(txt);
    }
  }
$(window).load(function() {
  update_cursor(simx, simy);
});

