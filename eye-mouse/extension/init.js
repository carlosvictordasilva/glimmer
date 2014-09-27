var height = 480;
var width = 640;
var drawPt;
var cGaze = new camgaze.Camgaze(
    width,
    height,
    "eye-mouse-canvas"
    );

  var eye_movement_max = 20;
var eyeTracker = new camgaze.EyeTracker(width, height);
var eyeFilter = new camgaze.EyeFilter();
var drawer = new camgaze.drawing.ImageDrawer();
//var mappedMovingAverage = new camgaze.structures.MovingAveragePoints( new camgaze.structures.Point(0,0), 10);
var runningAvg = new Array();
var lftAvg = new Array();
var lft;
var rtAvg = new Array();
var rt;
var lwink_counter = 0;
var rwink_counter = 0;
var wink_threshold = 16;
for (var i = 0; i < 8; i++){
  runningAvg.push(new camgaze.structures.Point(-1,-1));
 lftAvg.push(new camgaze.structures.Point(-1,-1));
 rtAvg.push(new camgaze.structures.Point(-1,-1));
}

function average(pts) {
  xsum = 0; ysum = 0;
  for (var i = 0; i < pts.length; i++) {
    xsum += pts[i].getX();
    ysum += pts[i].getY();
  }
  return new camgaze.structures.Point(xsum/pts.length, ysum/pts.length);
}
function reasonable_eye_pos(left, right) {
  if (!calibrating)
    return (Math.abs(left.getY() - right.getY()) < eye_movement_max);
  else
    return true;
}
var calibrating = true;

function isCalibrated() {
  if (calibrating) {
    for (var i = 0; i < runningAvg.length; i++) {
      if (runningAvg[i].getX() < 0 || runningAvg[i].getY() < 0 ||
          lftAvg[i].getX() < 0 || lftAvg[i].getY() < 0 ||
          rtAvg[i].getX() < 0 || rtAvg[i].getY() < 0) 
        return false;
    }
  }
  if (calibrating) {
    set_gaze_center(average(runningAvg));
    console.log (" CALIBRATED!!! ");
  }
  calibrating = false;
  return true;
}

function reCalibrate() {
  for (var i = 0; i < runningAvg.length; i++) {
    runningAvg[i] = new camgaze.structures.Point(-1, -1);
    lftAvg[i] = new camgaze.structures.Point(-1, -1);
    rtAvg[i] = new camgaze.structures.Point(-1, -1);
  }
  calibrating = true;
}

var frameOp = function (image_data, video) {
  var lookingPt;
  var trackingData = eyeTracker.track(image_data, video);
  var gazeList = eyeFilter.getFilteredGaze(trackingData);
  if (trackingData.eyeList.length == 2 && gazeList[0] != undefined && gazeList[1] != undefined) {
    lwink_counter = 0;
    rwink_counter = 0;
    gazeList = eyeFilter.getFilteredGaze(trackingData);
    var lft_eye = gazeList[0].centroid.unfiltered;
    var rt_eye = gazeList[1].centroid.unfiltered;
    if (reasonable_eye_pos(lft_eye, rt_eye)) {
      if (lft_eye.getX() > rt_eye.getX()) {
        var tmp = lft_eye;
        lft_eye = rt_eye;
        rt_eye = tmp;
      }
      var ctr_eye = lft_eye.add(rt_eye);
      runningAvg.push(new camgaze.structures.Point(ctr_eye.getX()/2, ctr_eye.getY()/2));
      runningAvg.shift();

      lftAvg.push(lft_eye);
      lftAvg.shift();

     rtAvg.push(rt_eye);
      rtAvg.shift();

      var eyeCenter = average(runningAvg);
      lft = average(lftAvg);
      rt = average(rtAvg);
      // FOR DEBUGGING PURPOSES
      image_data = drawer.drawCircle(image_data, eyeCenter, 3, -1, "red");
      image_data = drawer.drawCircle(image_data, lft, 3, -1, "blue");
      image_data = drawer.drawCircle(image_data, rt, 3, -1, "blue");
      if (isCalibrated())
        move_from_centroid(eyeCenter);
    }
  } else if (!calibrating && trackingData.eyeList.length == 1 && gazeList[0] != undefined) {
    var winkEye = gazeList[0].centroid.unfiltered;
    if (winkEye.distTo(lft) < winkEye.distTo(rt)) {
      lwink_counter++; rwink_counter = 0;
      if (lwink_counter == wink_threshold) wink("left");
    } else {
      rwink_counter++; lwink_counter = 0;
      if (rwink_counter == wink_threshold) wink("right");
    }
  } else {
    move_from_centroid(average(runningAvg));
  }
  return image_data;
};
cGaze.setFrameOperator(frameOp);
