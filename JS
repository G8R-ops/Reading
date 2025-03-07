const sentences = [
  "Many children struggle to read even simple words, which can make everyday classroom activities feel frustrating and overwhelming.",
  "Reading difficulties can impact all areas of learning, causing students to fall behind in subjects like science, history, and even math.",
  "Without support, students can fall further behind, losing confidence in their abilities and disengaging from school entirely.",
  "Dyslexia is a common cause of reading challenges, affecting people of all ages and often going undiagnosed for years.",
  "Early intervention is key to improving literacy, helping children build the skills they need to succeed academically and in life."
];

let currentSentence = 0;
let totalStartTime, sentenceStartTime, totalTime = 0;
let scrambleInterval;

function scrambleWord(word) {
  if (word.length <= 3) return word;
  const middle = word.slice(1, -1).split('');
  const a = Math.floor(Math.random() * middle.length);
  let b = Math.floor(Math.random() * middle.length);
  while (b === a) b = Math.floor(Math.random() * middle.length);
  [middle[a], middle[b]] = [middle[b], middle[a]];
  return word[0] + middle.join('') + word[word.length - 1];
}

function scrambleText(text) {
  return text.split(' ').map(scrambleWord).join(' ');
}

function showSentence(index) {
  const textEl = document.getElementById('dyslexiaText');
  const originalText = sentences[index];

  clearInterval(scrambleInterval);
  scrambleInterval = setInterval(() => {
    textEl.textContent = scrambleText(originalText);
  }, 150);

  sentenceStartTime = Date.now();
}

document.getElementById('startButton').onclick = () => {
  currentSentence = 0;
  totalTime = 0;
  document.getElementById('startButton').style.display = 'none';
  document.getElementById('result').textContent = '';
  document.getElementById('nextButton').style.display = 'inline';
  document.getElementById('textContainer').style.display = 'block';
  totalStartTime = Date.now();
  showSentence(currentSentence);
};

document.getElementById('nextButton').onclick = () => {
  clearInterval(scrambleInterval);
  const sentenceTime = Date.now() - sentenceStartTime;
  totalTime += sentenceTime;

  currentSentence++;
  if (currentSentence < sentences.length) {
    showSentence(currentSentence);
  } else {
    endGame();
  }
};

function endGame() {
  clearInterval(scrambleInterval);

  const totalWords = sentences.join(' ').split(' ').length;
  const totalSeconds = totalTime / 1000;
  const playerWPM = Math.round((totalWords / totalSeconds) * 60);
  const averageWPM = 200;
  const percentOfAverage = Math.round((playerWPM / averageWPM) * 100);

  document.getElementById('dyslexiaText').textContent = '✅ All sentences complete!';
  document.getElementById('nextButton').style.display = 'none';
  document.getElementById('result').innerHTML = `
    <p>⏱️ Total time reading: ${totalSeconds.toFixed(2)} seconds.</p>
    <p>📝 Total words read: ${totalWords}</p>
    <p>🚀 Your reading speed: ${playerWPM} words per minute (WPM).</p>
    <p>📊 That's ${percentOfAverage}% of the average American reading speed (200 WPM).</p>
    <p>Imagine if every sentence you read required this much effort. For many with dyslexia, it does.</p>
    <p><a href="https://dyslexiaida.org/" target="_blank">Learn more about dyslexia here.</a></p>
  `;
}
