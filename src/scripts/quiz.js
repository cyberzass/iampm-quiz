import Siema from '../lib/siema.js';
import { getPageNumber, processData } from './utils.js';

// const getQuizData = () => {
//   const page = getPageNumber();

//   fetch(`https://spreadsheets.google.com/feeds/cells/1Ogb_U93wn7705jUb7mdv56aSxFf0wnukMA611C-2F8M/${page}/public/full?alt=json`)
//     .then(res => res.json())
//     .then(processData)
//     .then(initQuiz);
// }

function prepareQuestions(questions) {
  let list = '';

  questions.slice(1).forEach((e, i) => {
    list += `<div class="question-item">${e.reduce((h, q, j) => {
      if (j === 0) {
        return h += `
          <h3>${q}</h3>`;
      } else {
        return h += `
          <div class="question">
            <label>
              <input value="answer${j}" name="question${i}" type="radio">
              <span>${q}</span>
            </label>
          </div>`;
      }
    }, '')}</div>`;
  });

  return list;
}

function prepareResults(results) {
  let answers = [];

  for (let i = 1; i < results[0].length; i++) {
    answers.push({
      [results[0][0]]: results[0][i],
      [results[1][0]]: results[1][i],
      [results[2][0]]: results[2][i]
    });
  }

  return answers.reduce((h, a, i) => {
    return h += `
    <div class="answer${++i}" style="display: none">
      <h4>${a.result}</h4>
      <img src="${a.image}" alt="">
      ${a.description}
    </div>`;
  }, '');
}

function setIntro(quizName) {
  const query = `sq=quizname="${encodeURI(quizName)}"`;

  fetch(`https://spreadsheets.google.com/feeds/list/1Ogb_U93wn7705jUb7mdv56aSxFf0wnukMA611C-2F8M/1/public/full?alt=json&${query}`)
    .then(res => res.json())
    .then(data => {
      const {feed: {entry}} = data;

      prepareIntro(entry[0]);
      setMetaData(entry[0]);
    });
}

function prepareIntro(meta) {
  const intro = document.createElement('div');
  intro.className = 'quiz-container quiz-intro';
  intro.innerHTML = `
    <h1>${meta.gsx$quizname.$t}</h1>
    <img src="${meta.gsx$picture.$t}">
    ${meta.gsx$description.$t}
    <button id="start" class="btn" type="button">Пройти тест</button>
    <div class="fb-share-button" data-href="${window.location}" data-layout="button" data-size="large" data-mobile-iframe="true"><a class="fb-xfbml-parse-ignore" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURI(window.location)}&amp;src=sdkpreparse">Поделиться</a></div>`;

  document.querySelector('#content').appendChild(intro);
  document.querySelector('#start').addEventListener('click', () => {
    intro.setAttribute('hidden', '');
    document.querySelector('.quiz-content').removeAttribute('hidden');
  });
}

function setMetaData(meta) {
  document.querySelector('[property="og:url"]').content = window.location;
  document.querySelector('[property="og:title"]').content = meta.gsx$quizname.$t;
  document.querySelector('[property="og:description"]').content = meta.gsx$description.$t;
  document.querySelector('[property="og:image"]').content = meta.gsx$fbposter.$t;

  let styles = document.createElement('style');
  styles.innerHTML =  meta.gsx$customcss.$t;
  document.querySelector('head').appendChild(styles);
}

function initQuiz(data) {
  document.querySelector('body').classList.add('quiz');

  if (document.querySelector('.quiz-list')) {
    document.querySelector('.quiz-list').setAttribute('hidden', '');
  }

  const quiz = document.createElement('div');
  quiz.className = 'quiz-container quiz-content';
  document.querySelector('#content').appendChild(quiz);

  setIntro(data.title);

  const resIndex = data.payload.findIndex(e => e[0].toLowerCase() === 'result');
  const questions = data.payload.slice(0, resIndex);
  const results = data.payload.slice(resIndex);

  quiz.innerHTML = `
    <div class="siema">${prepareQuestions(questions)}</div>
    <button class="next btn" disabled>Следующий вопрос</button>`;

    document.querySelector('.siema')
    .innerHTML += `<div class="result">${prepareResults(results)}</div>`;

  const siema = new Siema({
    draggable: false,
    onChange: getSlideIndex
  });
  const nextBtn = document.querySelector('.next');

  nextBtn.addEventListener('click', () => siema.next());

  document.querySelector('.quiz-container').addEventListener('change', () => {
    nextBtn.removeAttribute('disabled');
  });

  quiz.setAttribute('hidden', '');

  function getSlideIndex() {
    nextBtn.setAttribute('disabled', 'true');

    if (this.currentSlide >= this.innerElements.length - 2) {
      nextBtn.textContent = 'Узнай свой результат!';
    }
    if (this.currentSlide === this.innerElements.length - 1) {
      nextBtn.setAttribute('hidden', '');

      let results = [];

      document.querySelectorAll('.question-item input:checked').forEach(e => {
        results.push(e.value);
      });

      let counts = {};
      results.forEach((x) => counts[x] = (counts[x] || 0) + 1);

      let answers = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

      document.querySelector(`.${answers[0]}`).style.display = 'block';
    }
  }
};

export default initQuiz;
