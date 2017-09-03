quoteContent = document.querySelector('.quote-content');
typingArea = document.querySelector('.typing-area');
statsEl = document.querySelector('.stats');

statFields = {};
for (let fieldName of ['wpm', 'cpm', 'quoteCount', 'historicWpm']) {
  statFields[fieldName] = statsEl.querySelector('.' + fieldName);
}

typingArea.oninput = onInput;
typingArea.onkeydown = onKeyDown;

let history;
loadHistory();
const historyCap = 20;

// Words are standardized to five keystrokes. To simplify, we define in terms
// of characters, and assume that ~2% of characters involve two keystrokes.
const charsPerWord = 5 / 1.02;

// Minimum quote length; if the quote is shorter than this, get another one and tack it on.
const minQuoteLength = 150;

// Cap on the number of quotes to fetch
const maxQuotes = 3;

let currentQuote;
let quoteCount;

let gameState = 'loading';
let startTime;

async function initQuote () {
  gameState = 'loading';
  quoteContent.textContent = 'Loading…'
  let quote = await getQuote();

  gameState = 'typing';
  startTime = null;

  setQuote(quote);
  typingArea.value = ''


  typingArea.value = '';
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

function onInput (event) {
  if (gameState === 'typing' && startTime == null) startTime = Date.now();
  updateHighlight();
  updateStats();
  checkCompletion();
}

function updateStats () {
  if (gameState === 'complete') return;

  // standardize word as
  let input = typingArea.value;
  let charCount = input.length;
  let wordCount = charCount / charsPerWord;

  let minutes = (Date.now() - startTime) / (60 * 1000)
  statFields.wpm.textContent = (wordCount/minutes).toFixed(2);
  statFields.cpm.textContent = (charCount/minutes).toFixed(2);
  statFields.quoteCount.textContent = quoteCount;

  statFields.historicWpm.textContent = computeHistoricWpm().toFixed(2);
}

function sum (arr) {
  return arr.reduce((sum, val) => sum + val, 0);
}

function computeHistoricWpm () {
  return 60 * 1000 * sum(history.words) / sum(history.times);
}

function checkCompletion () {
  if (typingArea.value === currentQuote && gameState !== 'complete') onComplete();
}

function onComplete () {
  gameState = 'complete';
  typingArea.classList.add('valid');
  let words = currentQuote.length / charsPerWord;
  let time = Date.now() - startTime;
  history.words.push(words);
  history.times.push(time);
  if (history.words.length > historyCap) {
    history.words.shift();
    history.times.shift();
  }
  saveHistory();
  updateStats();
}

function onKeyDown (event) {
  switch(event.keyCode) {
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
}

function escapeChar (char) {
  let div = document.createElement('div');
  div.textContent = char;
  return div.innerHTML;
}

function updateHighlight () {
  let parts = [];
  let lastType = 'none';
  let input = typingArea.value;
  let anyWrong = false;

  let getSnippet = function (type, whichSnippet) {
    if (type == 'none') return '';
    switch(whichSnippet) {
      case 'prefix':
        return `<span class="${type}">`;
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

    // Additional marking for the
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

initQuote();
