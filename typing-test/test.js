quoteContent = document.querySelector('.quote-content');
typingArea = document.querySelector('.typing-area');
statsEl = document.querySelector('.stats');

const oneStrokeChars = /[a-z\d\s`=\[\];',\.\/\\-]/g

// Minimum number of characters of context before an error (always snaps to a word)
const ERROR_CONTEXT = 8

statFields = {};
for (let fieldName of ['wpm', 'cpm', 'quoteCount', 'historicWpm', 'totalWords']) {
  statFields[fieldName] = statsEl.querySelector('.' + fieldName);
}

typingArea.oninput = onInput;
typingArea.onkeydown = onKeyDown;

// If anything is going to change the selection, on the next tick we have to repair it because of prewrap spaces
typingArea.onselect = typingArea.onclick = typingArea.onmousedown = () => setTimeout(fixSelection, 0);

let noBreakSpace = ' ';

let history;
loadHistory();
const historyCap = 20;

const msPerMinute = 60 * 1000;

// Standard definition of "word" is five keystrokes
const keyStrokesPerWord = 5;

// Minimum quote length; if the quote is shorter than this, get another one and tack it on.
const minQuoteLength = 150;

// Cap on the number of quotes to fetch
const maxQuotes = 3;

let currentQuote;
let quoteCount;

let currentQuoteSamples = [];

let gameState = 'loading';
let startTime;

// Collection of typing errors, including some context. This is used to
// generate the "quote" for error reduction practice.
let errors = [];

const sampleRate = 200;
setInterval(sampleWpm, sampleRate);

async function initQuote (quote) {
  // quote can be passed in for practice mode
  if (!quote) {
    gameState = 'loading';
    typingArea.value = ''
    quoteContent.textContent = 'Loading…'
    quote = await getQuote();
  }

  // Reset errors
  errors = [];

  gameState = 'typing';
  currentQuoteSamples = [];
  startTime = null;

  setQuote(quote);
  typingArea.value = ''
  typingArea.focus();

  typingArea.classList.remove('invalid');
  typingArea.classList.remove('valid');
}

function setQuote (quote) {
  currentQuote = quote;
  quoteContent.textContent = quote;
  resizeAreas();
  updateStats();
}

function resizeAreas () {
  // Resize to content
  quoteContent.style.height = '20px';
  let height = quoteContent.scrollHeight;
  height = Math.max(height, 50);
  for (let el of [quoteContent, typingArea]) {
    el.style.height = height + 'px';
  }

  // Position the highlight area over the quote area
  let bounds = quoteContent.getBoundingClientRect();
}

function drawCharts () {
  drawCurrentChart();
  drawHistoryChart();
}

function drawCurrentChart () {
  let samples = currentQuoteSamples;

  Chartist.Line('.wpm-chart', {series: [samples]}, {height: '200px',
    fullWidth: true,
    showPoint: false,
    axisX: {showGrid: false},
    lineSmooth: Chartist.Interpolation.simple({divisor: 2, fillHoles: false}),
  });
}

function drawHistoryChart () {
  if (history.words.length < 2) return;
  let wpms = [];
  for (let i = 0; i < history.words.length; i++) {
    wpms.push(msPerMinute * history.words[i] / history.times[i])
  }

  Chartist.Line('.history-chart', {series: [wpms]}, {height: '200px', fullWidth: true});
}

function onInput (event) {
  if (gameState === 'typing' && startTime == null) startTime = Date.now();
  addPrewrapSpaces();
  updateHighlight();
  updateStats();
  checkCompletion();
  collectErrors();
}

function inputWithoutPrewrapSpaces () {
  return typingArea.value.replace(new RegExp(noBreakSpace, 'g'), '');
}

// Padd non-breaking spaces for the current word, ensuring that long words
// that wrap will wrap in the input field before they're fully typed
function addPrewrapSpaces () {
  let input = inputWithoutPrewrapSpaces();
  let paddedInput;
  let {selectionStart, selectionEnd, selectionDirection} = typingArea;
  selectionStart = Math.min(selectionStart, input.length);
  selectionEnd = Math.min(selectionEnd, input.length);

  // hyphens wrap differently
  if (input.slice(-1) === '-') {
    paddedInput = input;
  } else {
    // What's left of the current word (characters until next space/hyphen/end)
    let [wordRemainder] = currentQuote.slice(input.length).split(/[\s-]/, 1);
    let padding = new Array(wordRemainder.length).fill(noBreakSpace).join('');
    paddedInput = input + padding;
  }

  if (paddedInput !== typingArea.value) {
    typingArea.value = paddedInput;
    Object.assign(typingArea, {selectionStart, selectionEnd, selectionDirection});
  }
}

// Selection past end is possible because of prewrap spaces; this fixes that to make the prewrap spaces invisible
function fixSelection () {
  let input = inputWithoutPrewrapSpaces();
  let {selectionStart, selectionEnd, selectionDirection} = typingArea;
  selectionStart = Math.min(selectionStart, input.length);
  selectionEnd = Math.min(selectionEnd, input.length);
  Object.assign(typingArea, {selectionStart, selectionEnd, selectionDirection});
}

function updateStats () {
  if (gameState === 'complete') return;

  let input = inputWithoutPrewrapSpaces();
  let charCount = input.length;
  let wordCount = countWords(input);

  let minutes = (Date.now() - startTime) / msPerMinute
  statFields.wpm.textContent = (wordCount/minutes).toFixed(2);
  statFields.cpm.textContent = (charCount/minutes).toFixed(2);
  statFields.quoteCount.textContent = quoteCount;
  statFields.totalWords.textContent = countWords(currentQuote).toFixed(2);

  statFields.historicWpm.textContent = computeHistoricWpm().toFixed(2);
}

// Interval function that collects wpms for drawing chart at end of test
function sampleWpm () {
  if (gameState !== 'typing') return;
  if (startTime == null) return;
  let wordCount = countWords(inputWithoutPrewrapSpaces());
  if (wordCount < 1) return; // don't sample on first word; too skewed
  let minutes = (Date.now() - startTime) / msPerMinute
  currentQuoteSamples.push(wordCount/minutes);
}

function sum (arr) {
  return arr.reduce((sum, val) => sum + val, 0);
}

function computeHistoricWpm () {
  return msPerMinute * sum(history.words) / sum(history.times);
}

function checkCompletion () {
  if (inputWithoutPrewrapSpaces() === currentQuote && gameState !== 'complete') onComplete();
}

function onComplete () {
  gameState = 'complete';
  typingArea.classList.add('valid');
  let words = countWords(currentQuote);
  let time = Date.now() - startTime;
  history.words.push(words);
  history.times.push(time);
  if (history.words.length > historyCap) {
    history.words.shift();
    history.times.shift();
  }
  saveHistory();
  updateStats();
  drawCharts();
}

function onKeyDown (event) {
  switch(event.keyCode) {
    case 9: // tab, for error practice mode
      initQuote(getPracticeQuote());
      event.preventDefault();
      break;
    case 27: // esc
      initQuote();
      event.preventDefault();
      break;
    case 13: // enter
      if (gameState === 'complete') initQuote();
      event.preventDefault();
      break;
  }
  if (gameState === 'complete') event.preventDefault();
  setTimeout(fixSelection, 0);
}

function escapeChar (char) {
  let div = document.createElement('div');
  div.textContent = char;
  return div.innerHTML;
}

function updateHighlight () {
  let parts = [];
  let lastType = 'none';
  let input = inputWithoutPrewrapSpaces();
  let anyWrong = false;

  let getSnippet = function (type, whichSnippet) {
    if (type == 'none') return '';
    switch(whichSnippet) {
      case 'prefix':
        return `<span class="highlight ${type}">`;
      case 'suffix':
        return '</span>';
      default:
        throw new Error(`Unknown snippet ${whichSnippet}`);
    }
  }

  for (let i = 0; i < currentQuote.length; i++) {
    let actual = input[i], expected = currentQuote[i];
    let newType;

    if (actual == expected) newType = 'valid';
    else if (actual == null) newType = 'none';
    else newType = 'invalid';

    // Additional marking for the whole text field
    if (newType === 'invalid') anyWrong = true;

    if (newType !== lastType) {
      parts.push(getSnippet(lastType, 'suffix'), getSnippet(newType, 'prefix'));
      lastType = newType;
    }
    parts.push(escapeChar(expected));
  }

  parts.push(getSnippet(lastType, 'suffix'));
  quoteContent.innerHTML = parts.join('');

  typingArea.classList.toggle('invalid', anyWrong);
}

// If there are currently errors, collect them up, going back to the first
// word boundary before the error.
function collectErrors () {
  let input = inputWithoutPrewrapSpaces();
  let firstErrorIndex = -1;
  for (let i = 0; i < input.length; i++) {
    if (input[i] !== currentQuote[i]) {
      firstErrorIndex = i;
      break;
    }
  }
  if (firstErrorIndex < 0) return; // no errors

  // Add context to error
  firstErrorIndex -= ERROR_CONTEXT;

  let lastSpaceIndex = currentQuote.lastIndexOf(' ', firstErrorIndex);

  lastSpaceIndex = Math.max(0, lastSpaceIndex);

  errors.push(input.slice(lastSpaceIndex));
}

// Compile all errors into a new quote, for error reduction practice
function getPracticeQuote () {
  // Filter out all errors that are prefixes of other errors. This algorithm
  // is naive and O(M*N^2), where M is error length, and N is the number of
  // errors. Not very efficient, but M and N are relatively small.

  // First unique the errors, and store their indexes
  let indexMap = {};
  for (let i = 0; i < errors.length; i++) {
    let trimmed = errors[i].trim();
    if (trimmed in indexMap) continue;
    indexMap[trimmed] = i;
  }
  let uniqueErrors = Object.keys(indexMap);

  // sort and reverse unique errors so that we will always see prefixes first
  // (reverse because we're popping)
  uniqueErrors.sort().reverse();
  let filteredErrors = [];
  while (uniqueErrors.length) {
    let e = uniqueErrors.pop();
    // If no other error starts with e, keep it
    if (!uniqueErrors.some(other => other.startsWith(e))) {
      filteredErrors.push(e);
    }
  }

  // Restore original indexes
  filteredErrors.sort((a, b) => indexMap[a] - indexMap[b]);

  return filteredErrors.join(' ').replace(/\s+/g, ' ');
}

async function fetchQuoteText () {
  let response = await fetch('https://talaikis.com/api/quotes/random/', {method: 'GET'})
  // The api does a weird invalid escaping of apostrophes, so we have to fix it before we can parse
  let result = await response.json();
  let text = result.quote;

  // Normalize hard to type characters
  text = text.replace(/[“”]/g, '"');
  text = text.replace(/ʼ/g, "'");
  text = text.replace(/…/g, "...");
  text = text.replace(/[‒–—]/g, "-");

  return text.trim()
}

async function getQuote () {
  let totalLength = 0;
  let parts = [];
  while (parts.length < maxQuotes && totalLength < minQuoteLength) {
    let text = await fetchQuoteText();
    parts.push(text);
    totalLength += text.length;
  }
  quoteCount = parts.length;
  return parts.join(' ');
}

function countKeyStrokes (text) {
  let count = text.length;
  // filter out one-stroke characters
  let doubleStrokes = text.replace(oneStrokeChars, '');
  return count + doubleStrokes.length;
}

function countWords (text) {
  return countKeyStrokes(text) / keyStrokesPerWord;
}

function saveHistory () {
  localStorage.setItem('typingHistory', JSON.stringify(history));
}

function loadHistory () {
  let raw = localStorage.getItem('typingHistory');
  if (raw != null) {
    history = JSON.parse(raw);
  } else {
    history = {
      words: [],
      times: [],
    };
  }
}

drawCharts()
initQuote('This is a test');
