import { processData, convertRawData, loading } from './utils.js';

const printQuizList = (payload) => {
  const content = document.querySelector('#content');
  const list = document.createElement('div');
  list.classList.add('quiz-list');

  list.innerHTML += payload.reduce((html, card, i) => {
    return html += `<a class="quiz-list_item" href="#quiz-${i + 2}">
      <h2>${card.quiz_name}</h2>
      <img src="${card.picture}" alt="${card.title}">
    </a>`;
  }, '');

  content.appendChild(list);
}

const googleSheetFirstPageUrl = 'https://spreadsheets.google.com/feeds/cells/1Ogb_U93wn7705jUb7mdv56aSxFf0wnukMA611C-2F8M/1/public/full?alt=json';

const listQuizes = () => {
  loading(true);

  fetch(googleSheetFirstPageUrl)
    .then(res => res.json())
    .then(processData)
    .then(convertRawData)
    .then(printQuizList)
    .finally(() => {
      setTimeout(() => {
        loading(false);
      }, 1500);
    });
}

export {
  listQuizes
}
