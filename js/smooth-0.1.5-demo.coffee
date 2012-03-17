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
	

redraw = ->
	#Clear the context
	cx.clearRect 0, 0, canvas.width(), canvas.height()
	#Draw lines between points
	points = getPoints()
	cx.beginPath()
	cx.moveTo points.shift()...
	for p in points
		cx.lineTo p...

	cx.lineWidth = 2
	cx.strokeStyle = '#0000FF'
	cx.stroke()
	