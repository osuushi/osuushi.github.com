(() => {
  const parent = document.scripts[document.scripts.length - 1].parentElement;
  const container = document.createElement('div');
  parent.appendChild(container)
  container.style.width = '100%';
  container.style.boxShadow = '4px 4px 9px rgb(0 0 0 / 20%)'
  container.style.borderRadius = '10px';
  container.style.overflow = 'hidden';

  // Add the canvas for the demo
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 500;
  canvas.style.width = '100%';
  container.appendChild(canvas);

  // Add the slider
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = 0;
  slider.max = 30;
  // Slider can increment by 1
  slider.step = 1;
  slider.value = 0;

  slider.style.width = '100%';
  container.appendChild(slider);

  const background = new Image();
  background.src = "/images/2022-06-12/demobg.jpg";

  const renderLoop = () => {
    // These constants are not actual pixels. We will transform to get the scale to the size we want
    const markingWidth = 10;
    const vernierSpacing = 90;
    const vernierTopPad = 5
    const mainScaleSpacing = 100;
    const mainScaleWidth = 100;
    const partialVernierSize = 3;
    const vernierColors = ['rgb(61, 99, 175)', 'rgb(140, 130, 40)', 'rgb(175, 99, 61)'];
    const mainScaleColor = 'rgb(6, 165, 81)';
    const highlightColor = 'rgb(255, 100, 255)';
    const scaleHeight = 80;

    // Clear the canvas
    const ctx = canvas.getContext('2d');
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(0.9, 0.9);
    ctx.save(); // save for showing the background later
    ctx.translate(150, 30)

    const highlightedValue = slider.value % 10;

    const partialScaleForMark = (value) => {
      if (value == 0) { // 0 is a special case
        return 2;
      }
      return Math.floor((value - 1) / 3)
    }

    const partialMarkXValue = (value) => {
      if (value == 0) {
        return partialMarkXValue(9) + vernierSpacing;
      }
      return (vernierSpacing * value) % (partialVernierSize * mainScaleSpacing)
    }

    // Track the x positions where we highlighted marks. This is pretty hacky,
    // but it will let us draw the corresponding colors on the main scale.
    const highlightedMarks = {};

    // Draw the vernier scales
    for (let i = 0; i < 10; i++) {
      // Check if the mark is highlighted
      const isHighlighted = i == highlightedValue;
      // Determine which partial scale we're drawing
      const partialScale = partialScaleForMark(i);
      // Determine the color of the mark
      const markColor = isHighlighted ? highlightColor : vernierColors[partialScale];
      // Determine the x value for the mark. We start the marks at 0 and transform elsewhere
      let fullMarkX = i * vernierSpacing;
      if (i == 0) {
        fullMarkX += 10 * vernierSpacing;
      }
      // Determine the x value for the partial vernier mark
      const partialMarkX = partialMarkXValue(i);

      const partialMarkY = scaleHeight * partialScale + (1 * partialScale) * (vernierTopPad + markingWidth);
      // Draw the partial mark
      ctx.fillStyle = markColor;
      ctx.fillRect(partialMarkX, partialMarkY + markingWidth, markingWidth, scaleHeight);

      ctx.fillStyle = vernierColors[partialScale]
      // If the next mark is on the same scale, draw the top bar to it
      if (partialScaleForMark((i + 1) % 10) == partialScale) {
        ctx.fillRect(partialMarkX, partialMarkY, vernierSpacing + markingWidth, markingWidth);
      }

      // Draw the number next to the mark
      // Set the font
      ctx.font = '30px Arial';
      // Determine the x value for the number
      const numberX = partialMarkX + markingWidth + 3;
      // Determine the y value for the number
      const numberY = partialMarkY + markingWidth + 30
      // Draw the number
      ctx.fillText(i, numberX, numberY);

      // Draw the full vernier mark
      const fullMarkY = scaleHeight * 3 + 4 * (vernierTopPad + markingWidth);
      ctx.fillStyle = markColor;
      ctx.fillRect(fullMarkX, fullMarkY + markingWidth, markingWidth, scaleHeight);
      ctx.fillStyle = vernierColors[partialScale];

      // Draw the text
      ctx.font = '30px Arial';
      ctx.fillText(i, fullMarkX + markingWidth + 3, fullMarkY + markingWidth + 30);

      // Draw the top bar (except for 0)
      if (i != 0) {
        // If not the same scale, make the top bar light gray, and don't overlap the existing bar
        if (partialScaleForMark((i + 1) % 10) == partialScale) {
          ctx.fillRect(fullMarkX, fullMarkY, vernierSpacing + markingWidth, markingWidth);
        } else {
          ctx.fillStyle = 'rgb(200, 200, 200)';
          ctx.fillRect(fullMarkX + markingWidth, fullMarkY, vernierSpacing, markingWidth);
        }

      }

      if (isHighlighted) {
        highlightedMarks[partialMarkX] = true;
        highlightedMarks[fullMarkX] = true;
      }
    }

    // Draw the main scale. Ideally, we'd figure out what marks to draw from the
    // viewport, but this is simple and fast enough not to worry about it.
    const mainScaleX = -(slider.value * mainScaleSpacing / 10);
    const mainScaleY = markingWidth + 4 * (vernierTopPad + markingWidth + scaleHeight)
    for (let i = 0; i < mainScaleWidth; i++) {
      let markX = i * mainScaleSpacing;
      // Translate by the current slider value
      markX += mainScaleX
      // Check if the mark is highlighted
      const isHighlighted = highlightedMarks[markX];
      // Determine the color of the mark
      const markColor = isHighlighted ? highlightColor : mainScaleColor;
      // Draw the mark
      ctx.fillStyle = markColor;
      ctx.fillRect(markX, mainScaleY, markingWidth, scaleHeight);
    }
    // Draw the bar under the main scale
    ctx.fillStyle = mainScaleColor;
    ctx.fillRect(mainScaleX, mainScaleY + scaleHeight, mainScaleWidth * mainScaleSpacing, markingWidth);

    // Draw the two vertical bars on the left side.
    const zeroBarX = -(slider.value * mainScaleSpacing / 10);
    const barsHeight = mainScaleY
    ctx.fillStyle = 'black'
    ctx.fillRect(zeroBarX, 0, markingWidth, barsHeight);

    ctx.fillRect(0, 0, markingWidth, barsHeight);

    // Draw the dotted line for the distance indicator between the two bars
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, barsHeight / 2);
    ctx.lineTo(zeroBarX, barsHeight / 2);
    ctx.stroke();

    // Draw the text for how many millimiters we're now at
    ctx.font = '30px Arial';
    ctx.textAlign = "right"
    ctx.shadowColor = "white";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = "white";
    // Intensify shadow with several render passes
    for (let i = 0; i < 10; i++) {
      ctx.fillText(slider.value + " mm", -markingWidth + 3, barsHeight / 2 - 30);
    }
    ctx.fillStyle = "black";
    ctx.fillText(slider.value + " mm", -markingWidth + 3, barsHeight / 2 - 30);

    // Lighten everything before drawing the background
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = 'white';
    ctx.fillRect(-1000, -1000, 2000, 2000);
    ctx.restore();
    // Draw the background
    let bgX = (-(slider.value * mainScaleSpacing) / 10) % background.width;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(background, bgX, 0, background.width, background.height);
    // Restore back to top of save stack
    ctx.restore();

    requestAnimationFrame(renderLoop);
  }

  renderLoop()
})()