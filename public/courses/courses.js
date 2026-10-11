const filterButtons = [...document.querySelectorAll('[data-filter]')];
const topics = [...document.querySelectorAll('[data-topic]')];
const search = document.querySelector('#search');
let activeFilter = 'all';

function updateCatalogue() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  for (const topic of topics) {
    let visible = 0;
    for (const card of topic.querySelectorAll('.course-card')) {
      const matches = (activeFilter === 'all' || topic.dataset.topic === activeFilter)
        && card.textContent.toLocaleLowerCase().includes(query);
      card.hidden = !matches;
      if (matches) visible++;
    }
    topic.hidden = visible === 0;
    topic.querySelector('.topic-count').textContent = `${visible} 个课件`;
    count += visible;
  }
  for (const button of filterButtons) {
    button.setAttribute('aria-pressed', String(button.dataset.filter === activeFilter));
  }
  document.querySelector('#result-count').textContent = `共 ${count} 个互动课件`;
  document.querySelector('#empty').hidden = count !== 0;
}

for (const button of filterButtons) {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    updateCatalogue();
  });
}
search.addEventListener('input', updateCatalogue);
document.querySelector('#clear-search').addEventListener('click', () => {
  search.value = '';
  activeFilter = 'all';
  updateCatalogue();
  search.focus();
});
