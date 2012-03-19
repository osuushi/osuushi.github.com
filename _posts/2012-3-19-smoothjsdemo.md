---
layout: post
title: Fluid curves with Smooth.js and HTML5 canvas
---

To show off the sort of stuff you can do with the
[Smooth.js interpolation library](https://github.com/osuushi/Smooth.js), I've put together 
[a demo](/plotdemo016.html) showing how it can be used to perform highly customizable interpolation of two 
dimensional points. You can check out
[CoffeeScript source](https://github.com/osuushi/osuushi.github.com/blob/master/js/smooth-0.1.6-demo.coffee)
for this demo.

There's a lot going on in there, and most of it is code for handling the UI, but I want to talk specifically
about the drawing code.


<h3>addCurveSegment</h3>

The main function driving the drawing is the `addCurveSegment` function, which takes the set of points, and 
adds the the segment from `points[i]` to `point[i+1]` to the path of the passed context. I'll talk further 
down about the reason for rendering each curve segment separately like this.

{ % highlight coffeescript %}

#Add a curve segment to `context` according to current settings
#	points: the entire array of points
addCurveSegment = (context, i, points) ->
	#Create the smooth function
	s = Smooth points, smoothConfig

	#average step distance
	averageLineLength = 1 

	#Incrementing the index by a constant amount does not result in a constant distance advancement
	#To ameliorate this, we divide the segment into a few pieces and compute a different increment for
	#each piece to approximate the advancement distance we want.

	pieceCount = 2 #should be a power of two so the for loop comes out exact
	for t in [0...1] by 1/pieceCount
		[start, end] = [s(i + t), s(i + t + 1/pieceCount)]
		pieceLength = distance start, end
		#compute du so that we get the desired average line length
		du = averageLineLength/pieceLength
		context.lineTo s(i + t + u)... for u in [0...1/pieceCount] by du
	
	#ensure that the path actually passes through the end points
	context.lineTo s(i+1)...

{ % endhighlight % }

So first we do the obvious; we make the smooth function `s` (since Smooth.js uses lazy evaluation, recreating
`s` each time is inexpensive).

The next chunk of code needs some explanation. Basically what we want to do turn the parametric function s 
into a sequence of connected line segments approximating the function.

The most obvious way to do that is to vary `t` from `i` to `i+1`, stepping by, say 0.1 . Unfortunately, that's
not good enough for longer curve segments, because you need the lines to be short enough that the curve 
appears smooth.

So the next obvious step is to estimate the length of the curve (by breaking it into a few segments via the 
previous method), and then dividing that into the desired line length to get your step size for t. That's 
gets us closer, but it's still not good enough. The problem is that the distance traveled as you increase t
is not constant.

Ideally, we'd like a solution where we can figure out exactly how much to increase t by to move ahead x 
distance. For some kinds of curves, you can use calculus to get a closed form solution for this. For others,
you can use more expensive numerical methods.

Instead, we'll exploit the fact that *for sufficiently small intervals along t*, distance traveled *does* 
remain approximately constant as t increases. In fact, for our purposes, simply splitting the curve into two
pieces does the trick. Within each of those pieces we once again estimate the length of the piece and then
divide that into the desired line length, and we get a nice smooth result.

<h3>redraw</h3>

The redraw function is straightforward and there's not much point in pasting the code here. In short, it 
clears out the canvas, calls `addCurveSegment` for each segment, and then strokes the path. Simple

<h3>hitTest</h3>

Now we get to the question of why we are handling each segment separately.

So the goal of the `hitTest` function is to determine if a double-click was near a curve segment so that we 
can add a point to that segment rather than at the end of the path. One way we could do that is to iterate
along the smoothed function, checking point distances along the way. That would work, but advancing by small
steps is even more crucial in that case than when drawing.

But there is an easier way:

{% highlight coffeescript %}

hitTest = (x, y) ->
	# The pixel hit test leverages our drawing code, and an invisible canvas
	points = getPoints()
	#Clear out the canvas
	hit_cx.clearRect 0, 0, canvas.width(), canvas.height()
	for i in [0...points.length] #For each segment
		#reset the path
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

{% endhighlight %}

Drawing code in a hit test function? What's going on here?

This is actually a fairly well-known trick that's good to know if you're ever doing hit testing on a graphical
element that can't be approximated by a simple rectangle or other primitive shape.

What we're doing is drawing each curve segment as before into an invisible canvas, and then seeing if the 
pixel we care about has been drawn into. By varying the line width, we can change the precision with which
the user must click on the path. A line width of 20 gives the user a nice 10 pixel radius to click on.

A side note: the above implementation of the hit test is not very efficient. You can achieve the same result
with a 1x1 pixel canvas by using transforms. That code is harder to understand though, and for a small canvas
like the one in this demo, even my six-year-old MacBook handles it without blinking.