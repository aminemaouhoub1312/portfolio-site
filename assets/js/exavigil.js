
'use strict';

// ============================================================
// EXAVIGIL — PROJECT DETAIL PAGE
// Scroll Progress | Section Reveal | Chapter Navigation
// ============================================================

(() => {

  // ==========================================================
  // 1. READING PROGRESS INDICATOR
  // ==========================================================

  const progressBar = document.getElementById(
    'xp-reading-progress'
  );

  let scrollUpdatePending = false;

  function updateReadingProgress() {

    if (!progressBar) return;

    const documentHeight =
      document.documentElement.scrollHeight;

    const viewportHeight =
      document.documentElement.clientHeight;

    const scrollableDistance =
      documentHeight - viewportHeight;

    const progress = scrollableDistance > 0
      ? Math.min(
          Math.max(window.scrollY / scrollableDistance, 0),
          1
        )
      : 0;

    progressBar.style.transform =
      `scaleX(${progress})`;
  }

  function requestProgressUpdate() {

    if (scrollUpdatePending) return;

    scrollUpdatePending = true;

    requestAnimationFrame(() => {
      updateReadingProgress();
      scrollUpdatePending = false;
    });
  }

  window.addEventListener(
    'scroll',
    requestProgressUpdate,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    requestProgressUpdate
  );

  window.addEventListener(
    'load',
    requestProgressUpdate
  );

  updateReadingProgress();


  // ==========================================================
  // 2. ACTIVE CHAPTER IN SIDE NAVIGATION
  // ==========================================================

  const chapters = [
    ...document.querySelectorAll('.xp-chapter[id]')
  ];

  const chapterLinks = [
    ...document.querySelectorAll('.xp-rail-link')
  ];

  function setActiveChapter(id) {

    chapterLinks.forEach(link => {

      const isCurrent =
        link.getAttribute('href') === `#${id}`;

      link.classList.toggle(
        'is-current',
        isCurrent
      );

      if (isCurrent) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }

    });

  }

  if ('IntersectionObserver' in window) {

    const chapterObserver = new IntersectionObserver(
      entries => {

        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          );

        if (!visible.length) return;

        setActiveChapter(visible[0].target.id);

      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0, 0.05, 0.15, 0.3]
      }
    );

    chapters.forEach(chapter => {
      chapterObserver.observe(chapter);
    });

  }


  // ==========================================================
  // 3. SCROLL REVEAL ANIMATIONS
  // ==========================================================

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  const revealElements = [
    ...document.querySelectorAll('.xp-reveal')
  ];

  if (!reducedMotion && 'IntersectionObserver' in window) {

    document.documentElement.classList.add('xp-js');

    const revealObserver = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add('is-visible');

          revealObserver.unobserve(entry.target);

        });

      },
      {
        threshold: 0.05,
        rootMargin: '0px 0px -5% 0px'
      }
    );

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  } else {

    revealElements.forEach(element => {
      element.classList.add('is-visible');
    });

  }

})();

// ============================================================
// END — EXAVIGIL PROJECT JAVASCRIPT
// ============================================================

