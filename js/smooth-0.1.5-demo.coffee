plotBox = null
canvas = null
cx = null #context for rendering the path

hit_cx = null #context used for hit-test



cubicTension = 0
lanczosFilterSize = 2

$ ->
	plotBox = $ '#plot-box' # get the plot box div

	#Create the canvas
	canvas = $("<canvas width=600 height=500 />").appendTo(plotBox)
	canvas.css
	cx = canvas[0].getContext '2d' #get the canvas context

	#Create the hidden hit test canvas
	hit_canvas = $("<canvas width=600 height=500 />").appendTo(plotBox)
		.css opacity: 0, position: 'absolute', top:0, left:0
	hit_cx = hit_canvas[0].getContext '2d'

	plotBox.dblclick plotBoxDoubleClick #bind double click

	makePointHandle 50, 30
	makePointHandle 200, 80
	makePointHandle 400, 100
	makePointHandle 380, 200
	makePointHandle 180, 200
	makePointHandle 60, 300
	makePointHandle 120, 400
	makePointHandle 300, 300
	makePointHandle 400, 350

	#Set up sliders
	$("#tension-slider").slider 
		min:0, max:1, step:.1, slide:changeCubicSlider, change:changeCubicSlider

	$("#lanczos-slider").slider 
		min:2, max:10, step:1, value:2, slide:changeLanczosSlider, change:changeLanczosSlider

	#Bind selects
	$('#method').change ->
		updateConfigBox()
		redraw()
	$('#clip').change redraw

	updateConfigBox();
	redraw();

getHandles = -> plotBox.children 'div.handle'

getHandlePoint = (handle) ->
	{top, left} = $(handle).position()
	[left + 6, top + 6]

getPoints = -> (getHandlePoint handle for handle in getHandles())


makePointHandle = (x, y) ->
	#Set up handle
	handle = $('<div/>').addClass('handle').appendTo( plotBox).css left: x - 6, top: y - 6

	#Make handle draggable
	handle.draggable drag: redraw, stop: redraw
	#On double-click, remove handle
	handle.dblclick (ev) ->
		handleDoubleClick handle
		return false

	return handle

distance = (a,b) -> Math.sqrt Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)

plotBoxDoubleClick = (ev) ->
	#Translate location of click to local coordinates
	offset = plotBox.offset()
	x = ev.pageX - offset.left
	y = ev.pageY - offset.top

	#Find the index of the point starting the clicked segment
	index = hitTest x, y
	
	beforeHandle = getHandles()[index] if index?

	#Add a new handle
	newHandle = makePointHandle x, y

	#move new handle if needed
	if beforeHandle?
		newHandle.insertAfter $(beforeHandle)
	else		
		#If not adding to a segment, see if we're closer to star or end to decide where to add the point
		[first, middle..., last, newPoint] = getPoints()
		#Move before first if nearer first than last
		newHandle.insertBefore $(getHandles()[0]) if distance(first, newPoint) < distance(last, newPoint)



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


changeLanczosSlider = (ev, ui) ->
	lanczosFilterSize = ui.value
	$("#lanczosfiltersize").text lanczosFilterSize
	redraw()

changeCubicSlider = (ev, ui) ->
	cubicTension = ui.value
	$("#cubictension").text cubicTension.toFixed 1
	redraw()

getSmoothConfig = ->
	config = method: selectedMethod(), clip: selectedClip()
	switch config.method
		when 'cubic'
			config.cubicTension = cubicTension
		when 'lanczos'
			config.lanczosFilterSize = lanczosFilterSize


	return config

drawSmoothCurve = (context, color, lineWidth = 2, segmentIndex) ->

	#Clear the context
	context.clearRect 0, 0, canvas.width(), canvas.height()

	points = getPoints()
	return unless points.length > 1
	context.beginPath()


	#Create the smooth function
	s = Smooth points, getSmoothConfig()


	if segmentIndex?
		context.moveTo s(segmentIndex)...
	else
		context.moveTo s(0)...

	lastIndex = points.length - 1
	lastIndex++ if selectedClip() is 'periodic'
	
	for i in [0...lastIndex]
		if segmentIndex? then continue if i isnt segmentIndex
		#compute reasonably smooth delta

		#Approximate length of line by measuring end points to mid point
		start = s i
		mid = s 0.5
		end = s i+1
		dist = distance(start, mid) + distance(mid, end)
		averageSegmentLength = 10
		dt = averageSegmentLength/dist
		context.lineTo s(i + t)... for t in [0..1] by dt
		context.lineTo s(i+1)...
	context.lineJoin = 'round'
	context.lineWidth = lineWidth
	context.strokeStyle = color
	context.stroke()

redraw = ->
	drawSmoothCurve cx, '#0000ff'

#Find out which segment hits a point (giving lower index segments precedent)
# return undefined if no segment hit
hitTest = (x, y) ->
	for i in [0...getPoints().length]
		#Draw the curve
		drawSmoothCurve hit_cx, "#FFFFFF", 10, i
		#Check the pixel
		return i if hit_cx.getImageData(x, y, 1, 1).data[3] is 255
	return undefined