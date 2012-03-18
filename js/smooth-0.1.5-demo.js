(function() {
  var canvas, changeCubicSlider, changeLanczosSlider, cubicTension, cx, drawSmoothCurve, getPointHandles, getPoints, getSmoothConfig, handleDoubleClick, hitTest, hit_cx, lanczosFilterSize, makePointHandle, plotBox, plotBoxDoubleClick, redraw, selectedClip, selectedMethod, updateConfigBox;

  plotBox = null;

  canvas = null;

  cx = null;

  hit_cx = null;

  cubicTension = 0;

  lanczosFilterSize = 2;

  $(function() {
    var hit_canvas;
    plotBox = $('#plot-box');
    canvas = $("<canvas width=600 height=500 />").appendTo(plotBox);
    canvas.css({
      zIndex: 2
    });
    cx = canvas[0].getContext('2d');
    hit_canvas = $("<canvas width=600 height=500 />").appendTo(plotBox).css({
      opacity: 0,
      position: 'absolute',
      top: 0,
      left: 0
    });
    hit_cx = hit_canvas[0].getContext('2d');
    plotBox.dblclick(plotBoxDoubleClick);
    makePointHandle(50, 30);
    makePointHandle(200, 80);
    makePointHandle(400, 100);
    makePointHandle(380, 200);
    makePointHandle(180, 200);
    makePointHandle(60, 300);
    makePointHandle(120, 400);
    makePointHandle(300, 300);
    makePointHandle(400, 350);
    $("#tension-slider").slider({
      min: 0,
      max: 1,
      step: .1,
      slide: changeCubicSlider,
      change: changeCubicSlider
    });
    $("#lanczos-slider").slider({
      min: 2,
      max: 10,
      step: 1,
      value: 2,
      slide: changeLanczosSlider,
      change: changeLanczosSlider
    });
    $('#method').change(function() {
      updateConfigBox();
      return redraw();
    });
    $('#clip').change(redraw);
    updateConfigBox();
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
    handle.dblclick(function(ev) {
      handleDoubleClick(handle);
      return false;
    });
    return handle;
  };

  plotBoxDoubleClick = function(ev) {
    var beforeHandle, index, newHandle, offset, x, y;
    offset = plotBox.offset();
    x = ev.pageX - offset.left;
    y = ev.pageY - offset.top;
    index = hitTest(x, y);
    if (index != null) beforeHandle = getPointHandles()[index];
    newHandle = makePointHandle(x, y);
    if (beforeHandle != null) newHandle.insertAfter($(beforeHandle));
    redraw();
    return false;
  };

  handleDoubleClick = function(handle) {
    handle.remove();
    return redraw();
  };

  selectedMethod = function() {
    return $('#method option:selected').val();
  };

  selectedClip = function() {
    return $('#clip option:selected').val();
  };

  updateConfigBox = function() {
    var method;
    method = selectedMethod();
    $('div.method-config').hide();
    return $("div#" + method + "-config").show();
  };

  changeLanczosSlider = function(ev, ui) {
    lanczosFilterSize = ui.value;
    $("#lanczosfiltersize").text(lanczosFilterSize);
    return redraw();
  };

  changeCubicSlider = function(ev, ui) {
    cubicTension = ui.value;
    $("#cubictension").text(cubicTension.toFixed(1));
    return redraw();
  };

  getSmoothConfig = function() {
    var config;
    config = {
      method: selectedMethod(),
      clip: selectedClip()
    };
    switch (config.method) {
      case 'cubic':
        config.cubicTension = cubicTension;
        break;
      case 'lanczos':
        config.lanczosFilterSize = lanczosFilterSize;
    }
    return config;
  };

  drawSmoothCurve = function(context, color, lineWidth, segmentIndex) {
    var delta, dist, end, i, lastIndex, mid, points, s, start, t;
    if (lineWidth == null) lineWidth = 2;
    context.clearRect(0, 0, canvas.width(), canvas.height());
    points = getPoints();
    if (!(points.length > 1)) return;
    context.beginPath();
    s = Smooth(points, getSmoothConfig());
    context.moveTo.apply(context, s(0));
    lastIndex = points.length - 1;
    if (selectedClip() === 'periodic') lastIndex++;
    for (i = 0; 0 <= lastIndex ? i < lastIndex : i > lastIndex; 0 <= lastIndex ? i++ : i--) {
      if (segmentIndex != null) if (i !== segmentIndex) continue;
      start = s(i);
      mid = s(0.5);
      end = s(i + 1);
      dist = Math.sqrt(Math.pow(start[0] - mid[0], 2) + Math.pow(start[1] - mid[1], 2));
      dist += Math.sqrt(Math.pow(mid[0] - end[0], 2) + Math.pow(mid[1] - end[1], 2));
      delta = 10 / dist;
      for (t = 0; t <= 1; t += delta) {
        context.lineTo.apply(context, s(i + t));
      }
      context.lineTo.apply(context, s(i + 1));
    }
    context.lineJoin = 'round';
    context.lineWidth = lineWidth;
    context.strokeStyle = color;
    return context.stroke();
  };

  redraw = function() {
    return drawSmoothCurve(cx, '#0000ff');
  };

  hitTest = function(x, y) {
    var i, _ref;
    for (i = 0, _ref = getPoints().length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      drawSmoothCurve(hit_cx, "#FFFFFF", 10, i);
      if (hit_cx.getImageData(x, y, 1, 1).data[0]) return i;
    }
  };

}).call(this);
