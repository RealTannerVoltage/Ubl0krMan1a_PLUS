let catalog = { allGames: [] };
let activeCategory = 'All';

const elements = {
  featuredGrid: document.getElementById('featured-games-grid'),
  allGrid: document.getElementById('all-games-grid'),
  featuredSection: document.getElementById('featured-games'),
  search: document.getElementById('search-input'),
  filters: document.getElementById('category-filters'),
  modal: document.getElementById('game-modal'),
  frame: document.getElementById('game-frame'),
  title: document.getElementById('player-title'),
  toast: document.getElementById('toast')
};

function visibleGames(games) {
  const query = elements.search.value.trim().toLowerCase();
  return games.filter((game) => {
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    const searchable = `${game.title} ${game.description} ${game.category}`.toLowerCase();
    return !game.hidden && matchesCategory && searchable.includes(query);
  });
}

function cardTemplate(game) {
  const card = document.createElement('article');
  card.className = 'game-card';
  const image = document.createElement('img');
  image.className = 'game-image'; image.src = game.image; image.alt = `${game.title} cover`; image.loading = 'lazy';
  image.addEventListener('click', () => playGame(game));
  image.addEventListener('error', () => { image.removeAttribute('src'); image.alt = 'Cover unavailable'; });
  const info = document.createElement('div'); info.className = 'game-info';
  const title = document.createElement('h3'); title.textContent = game.title;
  const description = document.createElement('p'); description.textContent = game.description || 'Ready when you are.';
  const meta = document.createElement('p'); meta.className = 'game-meta'; meta.innerHTML = `<span>${game.category || 'Game'}</span><span>${game.release ? game.release.slice(0, 4) : ''}</span>`;
  info.append(title, description, meta);
  const button = document.createElement('button'); button.className = 'play-button'; button.type = 'button'; button.textContent = 'Play now  ↗'; button.addEventListener('click', () => playGame(game));
  card.append(image, info, button); return card;
}

function renderGrid(grid, games, count) {
  grid.replaceChildren(); count.textContent = `${games.length} ${games.length === 1 ? 'game' : 'games'}`;
  if (!games.length) { const empty = document.createElement('p'); empty.className = 'empty'; empty.textContent = 'Nothing matched that search.'; grid.append(empty); return; }
  games.forEach((game) => grid.append(cardTemplate(game)));
}

function render() {
  const all = visibleGames(catalog.allGames);
  const featured = all.filter((game) => game.featured);
  elements.featuredSection.hidden = Boolean(elements.search.value.trim() || activeCategory !== 'All');
  renderGrid(elements.featuredGrid, featured, document.getElementById('featured-count'));
  renderGrid(elements.allGrid, all, document.getElementById('all-count'));
}

function renderFilters() {
  const categories = ['All', ...new Set(catalog.allGames.filter((game) => !game.hidden).map((game) => game.category).filter(Boolean))];
  elements.filters.replaceChildren();
  categories.forEach((category) => { const button = document.createElement('button'); button.className = `filter${category === activeCategory ? ' active' : ''}`; button.type = 'button'; button.textContent = category; button.addEventListener('click', () => { activeCategory = category; renderFilters(); render(); }); elements.filters.append(button); });
}

function playGame(game) {
  elements.frame.replaceChildren(); elements.title.textContent = game.title;
  if (game.ruffle && window.RufflePlayer) { const player = window.RufflePlayer.newest().createPlayer(); elements.frame.append(player); player.load({ url: game.url }); }
  else { const iframe = document.createElement('iframe'); iframe.src = game.url; iframe.title = game.title; iframe.allow = 'fullscreen'; elements.frame.append(iframe); }
  elements.modal.hidden = false; document.body.style.overflow = 'hidden';
}

function closeGame() { elements.modal.hidden = true; elements.frame.replaceChildren(); document.body.style.overflow = ''; }
function showToast(message) { elements.toast.textContent = message; elements.toast.classList.add('show'); setTimeout(() => elements.toast.classList.remove('show'), 3500); }

document.getElementById('close-game').addEventListener('click', closeGame);
document.getElementById('fullscreen-game').addEventListener('click', () => elements.modal.requestFullscreen?.());
document.getElementById('request-game').addEventListener('click', () => showToast('Game requests are coming soon.'));
elements.search.addEventListener('input', render);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !elements.modal.hidden) closeGame(); });

fetch('assets/stuff.json').then((response) => response.json()).then((data) => { catalog = data; renderFilters(); render(); }).catch(() => showToast('The game catalog could not load.'));
