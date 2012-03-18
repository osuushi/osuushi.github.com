(function() {
  var canvas, cx, getPointHandles, getPoints, getSmoothConfig, handleDoubleClick, makePointHandle, plotBox, plotBoxDoubleClick, redraw, selectedClip, selectedMethod, updateConfigBox;

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
    $("#tension-slider").slider({
      min: 0,
      max: 1,
      step: .1,
      slide: redraw
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

  getSmoothConfig = function() {
    var config;
    config = {
      method: selectedMethod(),
      clip: selectedClip()
    };
    switch (config.method) {
      case 'cubic':
        config.cubicTension = $("#tension-slider").slider("value");
    }
    return config;
  };

  redraw = function() {
    var delta, dist, end, i, lastIndex, points, s, start, t;
    cx.clearRect(0, 0, canvas.width(), canvas.height());
    points = getPoints();
    cx.beginPath();
    s = Smooth(points, getSmoothConfig());
    cx.moveTo(s(0));
    lastIndex = points.length - 1;
    if (selectedClip() === 'periodic') lastIndex++;
    for (i = 0; 0 <= lastIndex ? i < lastIndex : i > lastIndex; 0 <= lastIndex ? i++ : i--) {
      start = s(i);
      end = s(i + 1);
      dist = Math.sqrt(Math.pow(start[0] - end[0], 2) + Math.pow(start[1] - end[1], 2));
      delta = 5 / dist;
      for (t = 0; t <= 1; t += delta) {
        cx.lineTo.apply(cx, s(i + t));
      }
      cx.lineTo.apply(cx, s(i + 1));
    }
    cx.lineJoin = 'round';
    cx.lineWidth = 2;
    cx.strokeStyle = '#0000FF';
    return cx.stroke();
  };

}).call(this);
