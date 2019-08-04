const getPageNumber = () => window.location.hash.split('-')[1];

const processData = (data) => {
  let content = {
    title: '',
    payload: []
  };
  let entries = [];

  content.title = data.feed.title.$t;

  data.feed.entry.forEach((el, i, arr) => {
    const nextEl = arr[i + 1] || {};
    const curr = el.gs$cell;
    const next = nextEl.gs$cell;

    if (next &&
        curr.row === next.row) {
      entries.push(curr.$t);
    } else {
      if (entries.length) {
        entries.push(curr.$t);
        content.payload.push(entries);
        entries = [];
      }
    }
  });

  return content;
}

const convertRawData = ({ payload }) => {
  let content = [];

  payload.forEach((e) => {
    let quiz = {};

    e.forEach((value, i) => {
      quiz[payload[0][i]] = value;
    });

    content.push(quiz);
  });

  localStorage.list = JSON.stringify(content.slice(1));
  return content.slice(1);
}

const loading = (state) => {
  if (state) {
    const loader = document.createElement('div');
    loader.className = 'loader-overlay';
    loader.innerHTML = '<div class="loader">Загрузка...</div>';

    document.querySelector('body').appendChild(loader);
  } else {
    document.querySelector('.loader-overlay').remove();
  }
}

export {
  getPageNumber,
  processData,
  convertRawData,
  loading
}
