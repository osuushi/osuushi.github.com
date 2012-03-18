plotBox = null
canvas = null
cx = null
$ ->
	plotBox = $ '#plot-box' # get the plot box div
	canvas = $("<canvas width=#{plotBox.width()} height=#{plotBox.height()}/>").appendTo(plotBox)
	cx = canvas[0].getContext '2d'
	plotBox.dblclick plotBoxDoubleClick #bind double click

	makePointHandle 50, 30
	makePointHandle 400, 100
	makePointHandle 70, 400

	#Set up sliders
	$("#tension-slider").slider min:0, max:1, step:.1, slide: redraw

	#Bind selects
	$('#method').change ->
		updateConfigBox()
		redraw()
	$('#clip').change redraw

	updateConfigBox();
	redraw();

getPointHandles = -> plotBox.children 'div.handle'

getPoints = ->
	for handle in getPointHandles()
		{top, left} = $(handle).position()
		[left + 6, top + 6]


makePointHandle = (x, y) ->
	#Set up handle
	handle = $('<div/>').addClass('handle').appendTo( plotBox).css left: x - 6, top: y - 6

	#Make handle draggable
	handle.draggable drag: redraw, stop: redraw
	#On double-click, remove handle
	handle.dblclick (ev) ->
		handleDoubleClick handle
		return false

plotBoxDoubleClick = (ev) ->
	#Translate location of click to local coordinates
	offset = plotBox.offset()
	x = ev.pageX - offset.left
	y = ev.pageY - offset.top
	#Add a new handle
	makePointHandle x, y
	redraw()
	return false

handleDoubleClick = (handle) -> 
	handle.remove()
	redraw()

selectedMethod = -> $('#method option:selected').val()

selectedClip = -> $('#clip option:selected').val()


updateConfigBox = ->
	method = selectedMethod()
	#Hide all method boxes
	$('div.method-config').hide()
	$("div##{method}-config").show()


getSmoothConfig = ->
	config = method: selectedMethod(), clip: selectedClip()
	switch config.method
		when 'cubic'
			config.cubicTension = $("#tension-slider").slider "value"


	return config



redraw = ->
	#Clear the context
	cx.clearRect 0, 0, canvas.width(), canvas.height()

	points = getPoints()
	cx.beginPath()


	#Create the smooth function
	s = Smooth points, getSmoothConfig()
	#Draw lines between points
	cx.moveTo s 0

	lastIndex = points.length - 1
	lastIndex++ if selectedClip() is 'periodic'
	
	for i in [0...lastIndex]
		#compute reasonable delta
		start = s i
		end = s i+1
		dist = Math.sqrt Math.pow(start[0] - end[0], 2) + Math.pow(start[1] - end[1], 2)
		delta = 5/dist
		cx.lineTo s(i + t)... for t in [0..1] by delta
		cx.lineTo s(i+1)...
	cx.lineJoin = 'round'
	cx.lineWidth = 2
	cx.strokeStyle = '#0000FF'
	cx.stroke()
	