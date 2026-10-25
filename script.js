const landing = document.querySelector('#landing');
const portfolio = document.querySelector('#portfolio');
const landingCard = document.querySelector('#enter-portfolio');
const phrase = document.querySelector('#landing-phrase');
const pages = [...document.querySelectorAll('[data-view]')];
const pageButtons = [...document.querySelectorAll('.page-nav-button')];
const paletteControl = document.querySelector('#palette-control');
const paletteTrigger = document.querySelector('#palette-trigger');
const paletteMenu = document.querySelector('#palette-menu');
const paletteOptions = [...document.querySelectorAll('[data-theme-choice]')];

function setPalette(theme) {
  const selected = theme === 'knot' ? 'knot' : 'default';
  document.body.dataset.theme = selected === 'default' ? '' : selected;
  paletteOptions.forEach(option => option.setAttribute('aria-pressed', String(option.dataset.themeChoice === selected)));
  try { localStorage.setItem('portfolio-theme', selected); } catch {}
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', selected === 'knot' ? '#141211' : '#111110');
}

function togglePaletteMenu(open = paletteMenu.hidden) {
  paletteMenu.hidden = !open;
  paletteTrigger.setAttribute('aria-expanded', String(open));
}

paletteTrigger.addEventListener('click', () => togglePaletteMenu());
paletteOptions.forEach(option => option.addEventListener('click', () => {
  setPalette(option.dataset.themeChoice);
  togglePaletteMenu(false);
}));
document.addEventListener('click', event => {
  if (!paletteControl.contains(event.target)) togglePaletteMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !paletteMenu.hidden) {
    togglePaletteMenu(false);
    paletteTrigger.focus();
  }
});
try { setPalette(localStorage.getItem('portfolio-theme')); } catch { setPalette('default'); }

function wireTabs(buttonSelector, panelSelector, dataName) {
  const tabs = [...document.querySelectorAll(buttonSelector)];
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectTab(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      selectTab(tabs[next]);
    });
  });
  function selectTab(selected) {
    const key = selected.dataset[dataName];
    tabs.forEach(tab => {
      const active = tab === selected;
      tab.classList.toggle('selected', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll(panelSelector).forEach(panel => {
      panel.hidden = panel.dataset[dataName === 'project' ? 'projectDetail' : 'experiencePanel'] !== key;
      panel.classList.toggle('selected', !panel.hidden);
    });
  }
}

wireTabs('.project-tab', '[data-project-detail]', 'project');
wireTabs('.experience-tab', '[data-experience-panel]', 'experience');

const copyButton = document.querySelector('#copy-email');
const copyStatus = document.querySelector('#copy-status');
copyButton.addEventListener('click', async () => {
  const email = copyButton.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
  } catch {
    const input = document.createElement('textarea');
    input.value = email;
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.append(input);
    input.select();
    document.execCommand('copy');
    input.remove();
  }
  copyStatus.textContent = 'EMAIL COPIED TO CLIPBOARD';
  copyButton.textContent = 'COPIED ✓';
  window.setTimeout(() => {
    copyStatus.textContent = '';
    copyButton.textContent = 'COPY EMAIL';
  }, 2200);
});
document.querySelectorAll('.portrait-photo').forEach(image => {
  const usePhoto = () => image.closest('.cutout').classList.add('has-photo');
  image.addEventListener('load', usePhoto);
  image.addEventListener('error', () => {
    image.closest('.cutout').classList.add('show-fallback');
    image.remove();
  });
  if (image.complete && image.naturalWidth > 0) usePhoto();
});
const phrases = ['MY PORTFOLIO', 'CLICK ME'];
let phraseIndex = 0;

window.setInterval(() => {
  phrase.classList.add('fade');
  window.setTimeout(() => {
    phraseIndex = (phraseIndex + 1) % phrases.length;
    phrase.textContent = phrases[phraseIndex];
    phrase.classList.remove('fade');
  }, 250);
}, 1900);

function showPage(name, push = true) {
  const target = pages.find(page => page.dataset.view === name);
  if (!target) return;
  landing.hidden = true;
  portfolio.hidden = false;
  pages.forEach(page => {
    page.hidden = page !== target;
    page.classList.toggle('active', page === target);
  });
  pageButtons.forEach(button => {
    const active = button.dataset.page === name;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  if (push) history.pushState({ page: name }, '', `#${name}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showLanding(push = true) {
  portfolio.hidden = true;
  landing.hidden = false;
  if (push) history.pushState({ page: 'landing' }, '', location.pathname);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function enterPortfolio() { showPage('about'); }
landingCard.addEventListener('click', enterPortfolio);
landingCard.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    enterPortfolio();
  }
});
pageButtons.forEach(button => button.addEventListener('click', () => showPage(button.dataset.page)));
document.querySelector('#back-home').addEventListener('click', () => showLanding());
window.addEventListener('popstate', () => {
  const page = location.hash.slice(1);
  if (!page) showLanding(false);
  else showPage(page, false);
});

const initialPage = location.hash.slice(1);
if (pages.some(page => page.dataset.view === initialPage)) showPage(initialPage, false);

const visualLightbox = document.querySelector('#visual-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxCaption = document.querySelector('#lightbox-caption');
document.querySelectorAll('.gallery-tile').forEach(tile => {
  tile.addEventListener('click', () => {
    lightboxImage.src = tile.dataset.fullImage;
    lightboxImage.alt = tile.dataset.imageAlt || '';
    lightboxCaption.textContent = tile.querySelector('span')?.textContent.trim() || 'TRACKSEAT SCREENSHOT';
    visualLightbox.showModal();
  });
});
visualLightbox.querySelector('.lightbox-close').addEventListener('click', () => visualLightbox.close());
visualLightbox.addEventListener('click', event => {
  if (event.target === visualLightbox) visualLightbox.close();
});
