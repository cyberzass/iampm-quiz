import Siema from '../lib/siema.js';
import { getPageNumber, processData, loading } from './utils.js';
import { listQuizes } from './list.js';
import quiz from './quiz.js';

window.addEventListener('load', () => {
  if (!location.hash) {
    listQuizes();
  } else {
    handleRoute();
  }
});

window.addEventListener('hashchange', handleRoute);

function handleRoute() {
  const page = getPageNumber();

  loading(true);

  fetch(`https://spreadsheets.google.com/feeds/cells/1Ogb_U93wn7705jUb7mdv56aSxFf0wnukMA611C-2F8M/${page}/public/full?alt=json`)
    .then(res => res.json())
    .then(processData)
    .then(quiz)
    .finally(() => {
      setTimeout(() => {
        loading(false);
      }, 1500);
    });
}

// todo
// - add facebook share button
// - prepare bundle for production
// - add fb description for head with text only
// + validate slide for choosen answer
// + add styles from sheet
// + add result button text from sheet
// + set meta tags for specific quiz
// + check hash on page load
// + add loader while meta data is loading
// + add first slide with quiz description