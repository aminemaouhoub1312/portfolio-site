
'use strict';

// ============================================================
// AMINE MAOUHOUB — PREMIUM PORTFOLIO
// Main JavaScript
// Features: Theme, Navigation, Images, Education Accordion
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
  // Local storage may be disabled by the browser.
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
      // Ignore browser storage errors.
    }

    syncThemeLabel();
  });
}


// ============================================================
// 2. MOBILE NAVIGATION MENU
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
    const isOpen = nav.classList.contains('open');
    setMenuOpen(!isOpen);
  });

  // Close the menu after selecting a navigation link.
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      setMenuOpen(false);
    });
  });

  // Close the menu when pressing Escape.
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      setMenuOpen(false);
    }
  });

  // Close the menu when clicking outside the navigation.
  document.addEventListener('click', event => {
    const isMenuOpen = nav.classList.contains('open');

    if (
      isMenuOpen &&
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

      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .sort(
          (a, b) =>
            b.intersectionRatio - a.intersectionRatio
        );

      if (!visibleSections.length) return;

      const activeId = visibleSections[0].target.id;

      setActiveNavigation(activeId);

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
// 4. AUTOMATIC IMAGE LOADING
// ============================================================

// Images are displayed only when the files are available.
// This keeps the portfolio visually clean before adding
// profile photos, project screenshots, and other images.

const optionalImages = document.querySelectorAll(
  '.profile-photo, .project-image'
);

optionalImages.forEach(img => {

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
// 6. EDUCATION — EXPAND / COLLAPSE DETAILS
// ============================================================

// Opens detailed information about each education entry.
// Supports ECE Paris and future education entries.

const educationButtons = document.querySelectorAll(
  '.timeline-toggle'
);

educationButtons.forEach(button => {

  const panelId = button.getAttribute('aria-controls');
  const panel = document.getElementById(panelId);

  if (!panel) return;

  function setEducationExpanded(expanded) {

    // Update accessibility state.
    button.setAttribute(
      'aria-expanded',
      String(expanded)
    );

    // Show or hide the education details.
    panel.hidden = !expanded;

    // Apply visual state to the button.
    button.classList.toggle('is-open', expanded);

    // Update the accessible button label.
    const educationName =
      panelId === 'ece-details'
        ? 'ECE Paris'
        : 'education';

    button.setAttribute(
      'aria-label',
      expanded
        ? `Close ${educationName} details`
        : `Open ${educationName} details`
    );
  }

  // Initialize the accordion in its current state.
  setEducationExpanded(
    button.getAttribute('aria-expanded') === 'true'
  );

  button.addEventListener('click', () => {

    const isExpanded =
      button.getAttribute('aria-expanded') === 'true';

    setEducationExpanded(!isExpanded);

  });

});


// ============================================================
// 7. INITIALIZATION COMPLETE
// ============================================================

// All portfolio interactions are ready.
// Additional interactive sections can be added below.
