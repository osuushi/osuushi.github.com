(function() {
  var addCurveSegment, canvas, changeCubicSlider, changeLanczosSlider, cx, distance, getHandlePoint, getHandles, getPoints, handleDoubleClick, hitTest, hit_cx, makeHandle, plotBox, plotBoxDoubleClick, redraw, smoothConfig, updateConfigBox,
    __slice = Array.prototype.slice;

  plotBox = null;

  canvas = null;

  cx = null;

  hit_cx = null;

  smoothConfig = {
    method: 'lanczos',
    clip: 'clamp',
    lanczosFilterSize: 2,
    cubicTension: 0
  };

  distance = function(a, b) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
  };

  $(function() {
    plotBox = $('#plot-box');
    canvas = $("<canvas width=600 height=500 />").appendTo(plotBox);
    cx = canvas[0].getContext('2d');
    hit_cx = $("<canvas width=600 height=500 />").css({
      display: 'none'
    }).appendTo(plotBox)[0].getContext('2d');
    plotBox.dblclick(plotBoxDoubleClick);
    makeHandle(50, 30);
    makeHandle(200, 80);
    makeHandle(400, 100);
    makeHandle(380, 200);
    makeHandle(180, 200);
    makeHandle(60, 300);
    makeHandle(120, 400);
    makeHandle(300, 300);
    makeHandle(400, 350);
    /*Set up UI elements
    */
    $("#tension-slider").slider({
      min: 0,
      max: 1,
      step: .1,
      value: smoothConfig.cubicTension,
      slide: changeCubicSlider,
      change: changeCubicSlider
    });
    $("#lanczos-slider").slider({
      min: 2,
      max: 10,
      step: 1,
      value: smoothConfig.lanczosFilterSize,
      slide: changeLanczosSlider,
      change: changeLanczosSlider
    });
    $('#method').change(function() {
      smoothConfig.method = $('#method option:selected').val();
      updateConfigBox();
      return redraw();
    });
    $('#clip').change(function() {
      smoothConfig.clip = $('#clip option:selected').val();
      return redraw();
    });
    updateConfigBox();
    return redraw();
  });

  getHandles = function() {
    return plotBox.children('div.handle');
  };

  getHandlePoint = function(handle) {
    var left, top, _ref;
    _ref = $(handle).position(), top = _ref.top, left = _ref.left;
    return [left + 6, top + 6];
  };

  getPoints = function() {
    var handle, _i, _len, _ref, _results;
    _ref = getHandles();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      handle = _ref[_i];
      _results.push(getHandlePoint(handle));
    }
    return _results;
  };

  makeHandle = function(x, y) {
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
      return handleDoubleClick(handle);
    });
    return handle;
  };

  plotBoxDoubleClick = function(ev) {
    /* Add a new handle at the clicked location
    */
    var first, last, middle, newHandle, newPoint, offset, segmentStartHandle, x, y, _i, _ref, _ref2;
    offset = plotBox.offset();
    _ref = [ev.pageX - offset.left, ev.pageY - offset.top], x = _ref[0], y = _ref[1];
    segmentStartHandle = getHandles()[hitTest(x, y)];
    newHandle = makeHandle(x, y);
    if (segmentStartHandle != null) {
      newHandle.insertAfter($(segmentStartHandle));
    } else {
      _ref2 = getPoints(), first = _ref2[0], middle = 4 <= _ref2.length ? __slice.call(_ref2, 1, _i = _ref2.length - 2) : (_i = 1, []), last = _ref2[_i++], newPoint = _ref2[_i++];
      if (distance(first, newPoint) < distance(last, newPoint)) {
        newHandle.insertBefore($(getHandles()[0]));
      }
    }
    redraw();
    return false;
  };

  handleDoubleClick = function(handle) {
    handle.remove();
    redraw();
    return false;
  };

  updateConfigBox = function() {
    $('div.method-config').hide();
    return $("div#" + smoothConfig.method + "-config").show();
  };

  changeLanczosSlider = function(ev, ui) {
    smoothConfig.lanczosFilterSize = ui.value;
    $("#lanczosfiltersize").text(smoothConfig.lanczosFilterSize);
    return redraw();
  };

  changeCubicSlider = function(ev, ui) {
    smoothConfig.cubicTension = ui.value;
    $("#cubictension").text(smoothConfig.cubicTension.toFixed(1));
    return redraw();
  };

  addCurveSegment = function(context, i, points) {
    var averageLineLength, du, end, pieceCount, pieceLength, s, start, t, u, _ref, _ref2, _ref3;
    s = Smooth(points, smoothConfig);
    averageLineLength = 1;
    pieceCount = 2;
    for (t = 0, _ref = 1 / pieceCount; t < 1; t += _ref) {
      _ref2 = [s(i + t), s(i + t + 1 / pieceCount)], start = _ref2[0], end = _ref2[1];
      pieceLength = distance(start, end);
      du = averageLineLength / pieceLength;
      for (u = 0, _ref3 = 1 / pieceCount; 0 <= _ref3 ? u < _ref3 : u > _ref3; u += du) {
        context.lineTo.apply(context, s(i + t + u));
      }
    }
    return context.lineTo.apply(context, s(i + 1));
  };

  redraw = function() {
    var i, lastIndex, points;
    cx.clearRect(0, 0, canvas.width(), canvas.height());
    points = getPoints();
    if (points.length >= 2) {
      cx.beginPath();
      cx.moveTo.apply(cx, points[0]);
      lastIndex = points.length - 1;
      if (smoothConfig.clip === 'periodic') lastIndex++;
      for (i = 0; 0 <= lastIndex ? i < lastIndex : i > lastIndex; 0 <= lastIndex ? i++ : i--) {
        addCurveSegment(cx, i, points);
      }
      cx.lineWidth = 2;
      cx.strokeStyle = '#0000ff';
      cx.lineJoin = 'round';
      cx.lineCap = 'round';
      return cx.stroke();
    }
  };

  hitTest = function(x, y) {
    var i, points, _ref;
    points = getPoints();
    hit_cx.clearRect(0, 0, canvas.width(), canvas.height());
    for (i = 0, _ref = points.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      hit_cx.beginPath();
      hit_cx.moveTo(points[i]);
      addCurveSegment(hit_cx, i, points);
      hit_cx.color = "#FFFFFF";
      hit_cx.lineWidth = 20;
      hit_cx.lineCap = 'round';
      hit_cx.lineJoin = 'round';
      hit_cx.stroke();
      if (hit_cx.getImageData(x, y, 1, 1).data[3] === 255) return i;
    }
  };

}).call(this);
