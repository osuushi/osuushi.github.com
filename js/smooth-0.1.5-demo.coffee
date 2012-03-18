plotBox = null #The box containing the handles and path drawing canvas
canvas = null #canvas for drawing the path
cx = null #context for rendering the path

hit_cx = null #context used for hit-test

#config object passed to Smooth and controlled via the UI
smoothConfig = 
	method: 'lanczos'
	clip: 'clamp'
	lanczosFilterSize: 2
	cubicTension: 0

#Euclidean distance
distance = (a,b) -> Math.sqrt Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)

$ ->
	plotBox = $ '#plot-box' # get the plot box div

	#Create the canvas for drawing the curves into
	canvas = $("<canvas width=600 height=500 />").appendTo(plotBox)
	cx = canvas[0].getContext '2d' #get the canvas context

	#Create a hidden canvas for hit testing and get its context
	hit_cx = $("<canvas width=600 height=500 />").css(display: 'none').appendTo(plotBox)[0].getContext '2d'

	plotBox.dblclick plotBoxDoubleClick #bind double click handler to the plot box

	#Make some initial point handles
	makeHandle 50, 30
	makeHandle 200, 80
	makeHandle 400, 100
	makeHandle 380, 200
	makeHandle 180, 200
	makeHandle 60, 300
	makeHandle 120, 400
	makeHandle 300, 300
	makeHandle 400, 350

	###Set up UI elements###

	#Cubic tension slider
	$("#tension-slider").slider 
		min:0, max:1, step:.1
		value:smoothConfig.cubicTension
		slide:changeCubicSlider
		change:changeCubicSlider

	$("#lanczos-slider").slider 
		min:2, max:10, step:1
		value:smoothConfig.lanczosFilterSize
		slide:changeLanczosSlider
		change:changeLanczosSlider


	#Bind selects
	$('#method').change ->
		smoothConfig.method = $('#method option:selected').val()
		updateConfigBox()
		redraw()
	$('#clip').change ->
		smoothConfig.clip = $('#clip option:selected').val()
		redraw()

	updateConfigBox();
	redraw();

#Get the array of draggable DOM elements that control the points
getHandles = -> plotBox.children 'div.handle'

#Get the position for a handle DOM element as a two-element array
#	(adjusts for center)
getHandlePoint = (handle) ->
	{top, left} = $(handle).position()
	[left + 6, top + 6]

#Get the array of points (as two-element arrays), in DOM order.
getPoints = -> (getHandlePoint handle for handle in getHandles())

#Create and return a new handle DOM element for a point, and put it at the end of the handle list
makeHandle = (x, y) ->
	#Make the handle div, position it and append it to the plot box
	handle = $('<div/>').addClass('handle').appendTo(plotBox).css left: x - 6, top: y - 6

	#Make handle draggable via jQuery UI
	handle.draggable drag: redraw, stop: redraw

	#On double-click, remove handle
	handle.dblclick (ev) -> handleDoubleClick handle

	return handle

#Double-click handler for the plot box (off of any handle)
plotBoxDoubleClick = (ev) ->
	### Add a new handle at the clicked location ###
	#Translate location of click to local coordinates
	offset = plotBox.offset()
	[x, y] = [ev.pageX - offset.left, ev.pageY - offset.top]

	#Check if a segment was clicked, and get the handle that starts that segment.
	#We will place the new handle after that handle in the dom, thereby adding the point to the segment
	#in question.
	segmentStartHandle = getHandles()[hitTest x, y] #if no segment clicked, results in undefined

	#Make the new handle
	newHandle = makeHandle x, y

	if segmentStartHandle?
		#If we're adding to a segment, move the new handle after that segment's start point
		newHandle.insertAfter $(segmentStartHandle)
	else #If not adding to a segment handle goes at beginning or end
		[first, middle..., last, newPoint] = getPoints()
		if distance(first, newPoint) < distance(last, newPoint) #If closer to first point than last point,
			newHandle.insertBefore $(getHandles()[0])           #move before first point

	redraw()
	return false #don't propagate event

#Double click callback for point handles
handleDoubleClick = (handle) -> 
	handle.remove()
	redraw()
	return false #don't propagate the event


#When the interpolation method changes, the supplementary config box needs to swap out
updateConfigBox = ->
	#Hide all method boxes
	$('div.method-config').hide()
	#Show the box specific to the current method
	$("div##{smoothConfig.method}-config").show()


changeLanczosSlider = (ev, ui) -> #callback for lanczos slider
	#update the config
	smoothConfig.lanczosFilterSize = ui.value
	#update the ui
	$("#lanczosfiltersize").text smoothConfig.lanczosFilterSize
	redraw()

changeCubicSlider = (ev, ui) ->
	#update the config
	smoothConfig.cubicTension = ui.value
	#update the ui
	$("#cubictension").text smoothConfig.cubicTension.toFixed 1
	redraw()



#Add a curve segment to `context` according to current settings
#	cachedPoints: result of getPoints because reading them from the DOM is expensive
addCurveSegment = (context, i, cachedPoints) ->
	#Get the current points
	points = cachedPoints ? getPoints()

	#copy the config (current Smooth.js version will modify it; this will be fixed in the next release)
	config = {}
	config[k] = v for own k,v of smoothConfig

	#Create the smooth function
	s = Smooth points, config

	#average step distance
	averageLineLength = 1 

	#Incrementing the index by a constant amount does not result in a constant distance advancement
	#To ameliorate this, we divide the segment into a few pieces and compute a different increment for
	#each piece to approximate the advancement distance we want.

	pieceCount = 2 #should be a power of two so the floating point math comes out exact
	for t in [0...1] by 1/pieceCount
		[start, end] = [s(i + t), s(i + t + 1/pieceCount)]
		pieceLength = distance start, end
		#compute du so that we get the desired average line length
		du = averageLineLength/pieceLength
		context.lineTo s(i + t + u)... for u in [0...1/pieceCount] by du
	
	#ensure that the path actually passes through the end points
	context.lineTo s(i+1)...



redraw = ->
	#Clear the canvas
	cx.clearRect 0, 0, canvas.width(), canvas.height()

	points = getPoints()
	if points.length >= 2 #Draw curve if there are at least two points
		#Clear path and move to the start point
		cx.beginPath()
		cx.moveTo points[0]...
		
		#Last index to draw is the last index of the array...
		lastIndex = points.length - 1

		#...unless the clip is periodic, in which case we connect back to the start
		lastIndex++ if smoothConfig.clip is 'periodic'

		#Add all of the curve segments
		addCurveSegment cx, i, points for i in [0...lastIndex]

		#Set drawing style
		cx.lineWidth = 2
		cx.strokeStyle = '#0000ff'
		cx.lineJoin = 'round'
		cx.lineCap = 'round'

		#Draw the path
		cx.stroke()

# Find out which segment hits a point (giving lower index segments precedent)
# return undefined if no segment hit
hitTest = (x, y) ->
	# The pixel hit test leverages our drawing code, and an invisible canvas
	points = getPoints()
	for i in [0...points.length] #For each segment
		#Clear out the canvas and reset the path
		hit_cx.clearRect 0, 0, canvas.width(), canvas.height()
		hit_cx.beginPath()

		#Move to the segment start and add the curve segment
		hit_cx.moveTo points[i]
		addCurveSegment hit_cx, i, points

		#Draw the segment with a thick, white stroke
		hit_cx.color = "#FFFFFF"
		hit_cx.lineWidth = 20 # corresponds to tolerance; wider lines are easier to click on
		hit_cx.lineCap = 'round'
		hit_cx.lineJoin = 'round'
		hit_cx.stroke()
		#if the pixel is opaque, this segment was clicked
		return i if hit_cx.getImageData(x, y, 1, 1).data[3] is 255
	return undefined