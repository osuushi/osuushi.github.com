---
layout: post
title: Optimization by accepting side effects
---

Optimization has been fascinating to me for a long time. Past the basic techniques of removing code,
working in parallel, and vectorization, you start to get into less obvious territory. One kind of
meta-technique that I've run into over and over again is something I think of as "accepting side 
effects".

By "side effects", I don't exactly mean the sense used when talking about functional programming
(although that concept is related). What I mean is that you want to achieve a result, and there
are ways to achieve that result which have other benign effects as well. If you were to define the
problem in terms of only achieving the result you need with no side effects, you might miss those
methods even when they are faster.

# An example

A side project I've been working on recently is a library for compressing and decompressing
transparent images lossily, called [JPEllucent](https://github.com/osuushi/JPEllucent). This uses
ImageMagick to split a PNG into its RGB and alpha components, pack JPEGs of the components into a
json file and then put them back together in the browser for display.

The example I want to talk about is on the decoder side.

## The desired result

When the alpha channel is decoded, it comes out as a grayscale image mask. What we need is to take
these grayscale values and put them into the alpha channel of the decoded RGB image. The canvas API
in HTML5, powerful though it is, does not provide a simple way to do this.

## The obvious methods

The most obvious method is to use `getImageData` to convert both the RGB and alpha components into
byte arrays, and then loop through them, copying the alpha channel data into the RGB data. That
works, but it involves two allocations and five copying operations (two to draw the data into the
canvas, two from `getImageData`, and one from `putImageData`), plus a non-native loop to merge the
pixel data.

It would look something like this:


{% highlight coffeescript tabsize=4 %}

cx = canvas.getContext '2d'
#Get ImageData for mask image
cx.globalCompositeOperation = 'copy'
cx.drawImage alpha, 0, 0
maskData = cx.getImageData 0, 0, w, h
#Get ImageData for RGB image
cx.drawImage color, 0, 0
colorData = cx.getImageData 0, 0, w, h
#Copy mask to alpha
colorData.data[i+3] = maskData.data[i] for i in [0...4*maskData.data.length] by 4
#Move data back into canvas
cx.putImageData colorData


{% endhighlight %}

## Exploiting compositing operations

With a little knowledge of compositing operations, we can get rid of both an allocation and a copy.
I won't get into an in-depth descripition of Porter & Duff's operations, but the long and short of
it is that we can use the "in" operator to achieve what we want. Simply put, for an opaque image "S"
and a partially transparent image "D", "S in D" will mean "S with the alpha channel of D".

So we draw the mask, call `getImageData`, move the gray values into the alpha values, and then
call `putImageData` to put it back into the canvas. Then we draw the RGB image into the canvas using
"source-in" compositing, and we have the result we want.

This is faster, but it still involves a non-native loop:

{% highlight coffeescript tabsize=4 %}

cx = canvas.getContext '2d'
#Get ImageData for mask image
cx.globalCompositeOperation = 'copy'
cx.drawImage alpha, 0, 0
maskData = cx.getImageData 0, 0, w, h
#Copy mask to alpha
maskData.data[i+3] = maskData.data[i] for i in [0...4*maskData.data.length] by 4
#Move data back into canvas
cx.putImageData maskData
#Draw RGB image into the canvas
cx.globalCompositeOperation = 'source-in'
cx.drawImage color, 0, 0

{% endhighlight %}

## Tolerating side effects

Here's where we can be tricksy.

The alpha image is grayscale with no alpha, but canvas doesn't believe in grayscale with no alpha.
When we draw the image into the canvas, it gets converted into RGBA. When we call `getImageData`, we
get a buffer containing those RGBA values end to end, as RGBARGBARGBARGBARGBARGBA... (gesundheit). Each
of those RGB values contains the value we want A to be, and each A value is equal to 255.

Here's where the tolerable side effect comes in: we don't care at all what the RGB values are in our
result. So instead of meticulously copying into the alpha values, we can simply *shift* the array
over. We still need a loop to copy it (you can't just set the data property on an ImageData object,
unfortunately), but thanks to the `set` method of TypedArrays, that loop is native, not JavaScript.

The CoffeeScript code for the shift looks like this:

{% highlight coffeescript tabsize=4 %}

offsetData = maskData.data.subarray 0, maskData.data.length - 1
maskData.data.set offsetData, 1

{% endhighlight %}

The first line looks like a copy, but it's not. We're simply creating a new *view* into the buffer,
which is 1 element shorter to leave room for it to shift over (in the C world, this would be the
same idea as a new pointer to the second element in the buffer). The second line then copies from
this view into the same buffer, from the second element on.

Pseudo-code for this might, for each pixel, look something like this:

{% highlight coffeescript tabsize=4 %}

pixel[i].alpha = pixel[i].blue
pixel[i].blue = pixel[i].green
pixel[i].green = pixel[i].red
pixel[i].red = pixel[i-1].alpha

{% endhighlight %}

In fact, it is only the first line we care about - copying the blue value into the alpha value.
Everything after that is a *side effect*. We've actually corrupted the RGB values of the image. But
because the RGB values are ignored after we use the "in" operator, we simply don't care.

#In Conclusion

The intuitive thing to do when optimizing is to try to make your code do as little as possible. So
it may initially be surprising that having your code create entirely separate undesirable (but
ignorable) results can actually make it *faster*. Of course, there are tons of examples where doing
more is faster.

Dividing image processing into tiles, for example, is clearly more work. And yet by leveraging
caching it can often be much faster than the alternative (and I intend to explore this technique
with JPEllucent in the future).

Another example is restructuring your code to take advantage of branch prediction. Again, you may 
end up "doing more", yet your code can end up being orders of magnitude more efficient.

But side effect tolerance is a little different, and it's a tricky thing.  Its advantage doesn't
always come from the same place. In many cases it is a matter of exploiting facilities which have
better performance than you can achieve yourself. That's the case here, as it is when the discrete
cosine transform is computed by its relationship to the fourier transform. But I've also often seen
it used not with an optimized API, but with a mathematical property, or a quirk of hardware timing.

I don't know of any systematic way to spot these kinds of opportunities. It seems to just involve
staring at documentation or mathematical formulas and thinking.