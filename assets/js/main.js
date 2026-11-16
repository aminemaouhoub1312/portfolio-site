
'use strict';

// ============================================================
// AMINE MAOUHOUB — PREMIUM PORTFOLIO
// Main JavaScript
// Theme | Navigation | Images | Education Accordion
// ============================================================


// ============================================================
// 1. LIGHT / DARK THEME
// ============================================================

const root = document.documentElement;
const themeButton = document.getElementById('theme-toggle');

try {
  const savedTheme = localStorage.getItem('amine-portfolio-theme');

  if (savedTheme === 'light' || savedTheme === 'dark') {
    root.dataset.theme = savedTheme;
  }
} catch (_) {
  // Browser storage may be unavailable.
}

function syncThemeLabel() {
  const isDark = root.dataset.theme !== 'light';

  if (themeButton) {
    themeButton.setAttribute(
      'aria-label',
      isDark ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  const themeMeta = document.querySelector(
    'meta[name="theme-color"]'
  );

  if (themeMeta) {
    themeMeta.setAttribute(
      'content',
      isDark ? '#090c0f' : '#f3f5ef'
    );
  }
}

syncThemeLabel();

if (themeButton) {

  themeButton.addEventListener('click', () => {

    root.dataset.theme =
      root.dataset.theme === 'light' ? 'dark' : 'light';

    try {
      localStorage.setItem(
        'amine-portfolio-theme',
        root.dataset.theme
      );
    } catch (_) {
      // Ignore storage errors.
    }

    syncThemeLabel();
  });

}


// ============================================================
// 2. MOBILE NAVIGATION
// ============================================================

const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('nav');

function setMenuOpen(open) {
  if (!nav || !menuToggle) return;

  nav.classList.toggle('open', open);

  menuToggle.setAttribute(
    'aria-expanded',
    String(open)
  );

  menuToggle.setAttribute(
    'aria-label',
    open ? 'Close navigation menu' : 'Open navigation menu'
  );
}

if (menuToggle && nav) {

  menuToggle.addEventListener('click', () => {
    setMenuOpen(!nav.classList.contains('open'));
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });

  document.addEventListener('click', event => {
    if (
      nav.classList.contains('open') &&
      !nav.contains(event.target) &&
      !menuToggle.contains(event.target)
    ) {
      setMenuOpen(false);
    }
  });

}


// ============================================================
// 3. ACTIVE NAVIGATION LINK
// ============================================================

const navLinks = [
  ...document.querySelectorAll('.nav-link')
];

const sections = [
  ...document.querySelectorAll('main section[id]')
];

function setActiveNavigation(id) {

  navLinks.forEach(link => {
    const isActive =
      link.getAttribute('href') === `#${id}`;

    link.classList.toggle('active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });

}

if ('IntersectionObserver' in window) {

  const activeObserver = new IntersectionObserver(
    entries => {

      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort(
          (a, b) =>
            b.intersectionRatio - a.intersectionRatio
        );

      if (!visible.length) return;

      setActiveNavigation(visible[0].target.id);

    },
    {
      rootMargin: '-18% 0px -42% 0px',
      threshold: [0, 0.1, 0.3, 0.6]
    }
  );

  sections.forEach(section => {
    activeObserver.observe(section);
  });

}


// ============================================================
// 4. OPTIONAL IMAGE LOADING
// ============================================================

document.querySelectorAll(
  '.profile-photo, .project-image'
).forEach(img => {

  function showIfReady() {
    if (img.naturalWidth > 0) {
      img.classList.add('loaded');
    }
  }

  if (img.complete) {
    showIfReady();
  } else {
    img.addEventListener(
      'load',
      showIfReady,
      { once: true }
    );
  }

});


// ============================================================
// 5. AUTOMATIC COPYRIGHT YEAR
// ============================================================

const yearElement = document.getElementById('year');

if (yearElement) {
  yearElement.textContent = new Date().getFullYear();
}


// ============================================================
// 6. EDUCATION ACCORDION
// ECE PARIS + ENSA TANGIER
// ============================================================

const educationButtons = document.querySelectorAll(
  '.timeline-toggle'
);

educationButtons.forEach(button => {

  const panelId = button.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);

  if (!panel) return;

  let schoolName = 'Education';

  if (panelId === 'ece-details') {
    schoolName = 'ECE Paris';
  }

  if (panelId === 'ensa-details') {
    schoolName = 'ENSA Tangier';
  }

  function setEducationExpanded(expanded) {

    button.setAttribute(
      'aria-expanded',
      String(expanded)
    );

    button.setAttribute(
      'aria-label',
      expanded
        ? `Close ${schoolName} details`
        : `Open ${schoolName} details`
    );

    panel.hidden = !expanded;

    button.classList.toggle(
      'is-open',
      expanded
    );
  }

  // Initialize in the collapsed state.
  setEducationExpanded(false);

  button.addEventListener('click', () => {

    const expanded =
      button.getAttribute('aria-expanded') === 'true';

    setEducationExpanded(!expanded);

  });

});


// ============================================================
// END OF MAIN JAVASCRIPT
// ============================================================
