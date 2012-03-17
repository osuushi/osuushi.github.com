(function() {
  var canvas, cx, getPointHandles, getPoints, handleDoubleClick, makePointHandle, plotBox, plotBoxDoubleClick, redraw;

  plotBox = null;

  canvas = null;

  cx = null;

  $(function() {
    plotBox = $('#plot-box');
    canvas = $("<canvas width=" + (plotBox.width()) + " height=" + (plotBox.height()) + "/>").appendTo(plotBox);
    cx = canvas[0].getContext('2d');
    plotBox.dblclick(plotBoxDoubleClick);
    makePointHandle(50, 30);
    makePointHandle(400, 100);
    makePointHandle(70, 400);
    return redraw();
  });

  getPointHandles = function() {
    return plotBox.children('div.handle');
  };

  getPoints = function() {
    var handle, left, top, _i, _len, _ref, _ref2, _results;
    _ref = getPointHandles();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      handle = _ref[_i];
      _ref2 = $(handle).position(), top = _ref2.top, left = _ref2.left;
      _results.push([left + 6, top + 6]);
    }
    return _results;
  };

  makePointHandle = function(x, y) {
    var handle;
    handle = $('<div/>').addClass('handle').appendTo(plotBox).css({
      left: x - 6,
      top: y - 6
    });
    handle.draggable({
      drag: redraw,
      stop: redraw
    });
    return handle.dblclick(function(ev) {
      handleDoubleClick(handle);
      return false;
    });
  };

  plotBoxDoubleClick = function(ev) {
    var offset, x, y;
    offset = plotBox.offset();
    x = ev.pageX - offset.left;
    y = ev.pageY - offset.top;
    makePointHandle(x, y);
    redraw();
    return false;
  };

  handleDoubleClick = function(handle) {
    handle.remove();
    return redraw();
  };

  redraw = function() {
    var p, points, _i, _len;
    cx.clearRect(0, 0, canvas.width(), canvas.height());
    points = getPoints();
    cx.beginPath();
    cx.moveTo.apply(cx, points.shift());
    for (_i = 0, _len = points.length; _i < _len; _i++) {
      p = points[_i];
      cx.lineTo.apply(cx, p);
    }
    cx.lineWidth = 2;
    cx.strokeStyle = '#0000FF';
    return cx.stroke();
  };

}).call(this);
