
'use strict';

// 1. Light / dark theme (saved locally if the browser allows it).
const root = document.documentElement;
const themeButton = document.getElementById('theme-toggle');

try {
  const savedTheme = localStorage.getItem('amine-portfolio-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.dataset.theme = savedTheme;
  }
} catch (_) {
  /* Some browsers may disable local storage. */
}

function syncThemeLabel() {
  const dark = root.dataset.theme !== 'light';

  themeButton.setAttribute(
    'aria-label',
    dark ? 'Switch to light mode' : 'Switch to dark mode'
  );

  document.querySelector('meta[name="theme-color"]').setAttribute(
    'content',
    dark ? '#090c0f' : '#f3f5ef'
  );
}

syncThemeLabel();

themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';

  try {
    localStorage.setItem('amine-portfolio-theme', root.dataset.theme);
  } catch (_) {
    /* Ignore storage errors. */
  }

  syncThemeLabel();
});

// 2. Mobile navigation menu with automatic closing after a click.
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

function setMenuOpen(open) {
  nav.classList.toggle('open', open);

  menuToggle.setAttribute('aria-expanded', String(open));

  menuToggle.setAttribute(
    'aria-label',
    open ? 'Close navigation menu' : 'Open navigation menu'
  );
}

menuToggle.addEventListener('click', () => {
  setMenuOpen(!nav.classList.contains('open'));
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setMenuOpen(false));
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    setMenuOpen(false);
  }
});

// 3. Highlight the active navigation link based on the visible section.
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];

if ('IntersectionObserver' in window) {
  const activeObserver = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (!visible.length) return;

    const id = visible[0].target.id;

    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${id}`;

      link.classList.toggle('active', active);

      if (active) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }, {
    rootMargin: '-18% 0px -42% 0px',
    threshold: [0, 0.1, 0.3, 0.6]
  });

  sections.forEach(section => activeObserver.observe(section));
}

// 4. Display optional images only when they are available.
// The layout remains clean before adding profile photos and project screenshots.
document.querySelectorAll('.profile-photo, .project-image').forEach(img => {
  function showIfReady() {
    if (img.naturalWidth > 0) {
      img.classList.add('loaded');
    }
  }

  if (img.complete) {
    showIfReady();
  } else {
    img.addEventListener('load', showIfReady, { once: true });
  }
});

// 5. Automatically update the copyright year.
document.getElementById('year').textContent = new Date().getFullYear();
