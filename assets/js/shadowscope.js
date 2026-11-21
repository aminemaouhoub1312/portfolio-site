
'use strict';

// ============================================================
// SHADOWSCOPE AM — PROJECT DOCUMENTATION
// Reading Progress | Navigation | Reveal | Figure Validation
// ============================================================

(() => {

  // ==========================================================
  // 1. ELEMENT REFERENCES
  // ==========================================================

  const root = document.documentElement;

  const progressBar = document.getElementById(
    'xp-reading-progress'
  );

  const chapters = [
    ...document.querySelectorAll('.xp-chapter[id]')
  ];

  const railLinks = [
    ...document.querySelectorAll('.xp-rail-link')
  ];

  const revealElements = [
    ...document.querySelectorAll('.xp-reveal')
  ];

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  );

  let updateScheduled = false;


  // ==========================================================
  // 2. READING PROGRESS
  // ==========================================================

  function updateReadingProgress() {

    if (!progressBar) return;

    const documentHeight =
      document.documentElement.scrollHeight;

    const viewportHeight =
      document.documentElement.clientHeight;

    const distance = Math.max(
      0,
      documentHeight - viewportHeight
    );

    const progress = distance > 0
      ? Math.min(
          1,
          Math.max(0, window.scrollY / distance)
        )
      : 0;

    progressBar.style.transform =
      `scaleX(${progress})`;

  }


  // ==========================================================
  // 3. ACTIVE CHAPTER NAVIGATION
  // ==========================================================

  function setActiveChapter(id) {

    railLinks.forEach(link => {

      const active =
        link.getAttribute('href') === `#${id}`;

      link.classList.toggle(
        'is-current',
        active
      );

      if (active) {
        link.setAttribute(
          'aria-current',
          'location'
        );
      } else {
        link.removeAttribute('aria-current');
      }

    });

  }


  function updateActiveChapter() {

    if (!chapters.length) return;

    const activationPoint = Math.max(
      110,
      Math.min(190, window.innerHeight * 0.24)
    );

    let currentId = chapters[0].id;

    chapters.forEach(chapter => {

      const position =
        chapter.getBoundingClientRect();

      if (position.top <= activationPoint) {
        currentId = chapter.id;
      }

    });

    setActiveChapter(currentId);

  }


  // ==========================================================
  // 4. OPTIMIZED PAGE UPDATES
  // ==========================================================

  function updatePageState() {

    updateScheduled = false;

    updateReadingProgress();
    updateActiveChapter();

  }


  function schedulePageUpdate() {

    if (updateScheduled) return;

    updateScheduled = true;

    window.requestAnimationFrame(
      updatePageState
    );

  }


  window.addEventListener(
    'scroll',
    schedulePageUpdate,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    schedulePageUpdate
  );

  window.addEventListener(
    'pageshow',
    schedulePageUpdate
  );


  // ==========================================================
  // 5. CHAPTER REVEAL ANIMATIONS
  // ==========================================================

  if (
    !reducedMotion.matches &&
    'IntersectionObserver' in window
  ) {

    root.classList.add('xp-js');

    const observer = new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add(
            'is-visible'
          );

          observer.unobserve(
            entry.target
          );

        });

      },
      {
        threshold: 0,
        rootMargin: '0px 0px -4% 0px'
      }
    );

    revealElements.forEach(element => {
      observer.observe(element);
    });

  } else {

    revealElements.forEach(element => {
      element.classList.add('is-visible');
    });

  }


  // ==========================================================
  // 6. DEEP-LINK NAVIGATION
  // ==========================================================

  function getCurrentHashTarget() {

    const rawHash =
      window.location.hash.slice(1);

    if (!rawHash) return null;

    try {

      const id = decodeURIComponent(rawHash);

      return document.getElementById(id);

    } catch (_) {
      return null;
    }

  }


  function activateHashTarget() {

    const target = getCurrentHashTarget();

    if (!target) {
      schedulePageUpdate();
      return;
    }

    const chapter = target.closest(
      '.xp-chapter'
    );

    if (chapter) {
      chapter.classList.add('is-visible');
    }

    schedulePageUpdate();

  }


  window.addEventListener(
    'hashchange',
    activateHashTarget
  );

  window.addEventListener(
    'popstate',
    activateHashTarget
  );

  activateHashTarget();


  // ==========================================================
  // 7. FIGURE LOADING VALIDATION
  // ==========================================================

  const figures = [
    ...document.querySelectorAll(
      '.ss-page .xp-overview-figure img'
    )
  ];


  figures.forEach(img => {

    function handleImageError() {

      if (img.dataset.missing === 'true') {
        return;
      }

      img.dataset.missing = 'true';

      const figure = img.closest(
        '.xp-overview-figure'
      );

      const imageLink = img.closest('a');

      const imagePath =
        img.getAttribute('src') || 'Unknown image';

      const holder =
        imageLink || img.parentElement;

      if (!holder) return;

      img.hidden = true;
      img.style.display = 'none';

      if (imageLink) {

        imageLink.removeAttribute('href');
        imageLink.removeAttribute('target');

        imageLink.setAttribute(
          'aria-disabled',
          'true'
        );

      }

      const fallback = document.createElement(
        'div'
      );

      fallback.className =
        'ss-image-fallback';

      fallback.setAttribute(
        'role',
        'status'
      );

      fallback.textContent =
        `Figure unavailable: ${imagePath}. ` +
        'Check the filename and repository path.';

      holder.appendChild(fallback);

      const fullSizeLink = figure?.querySelector(
        '.xp-figure-open'
      );

      if (fullSizeLink) {

        fullSizeLink.removeAttribute('href');
        fullSizeLink.removeAttribute('target');

        fullSizeLink.classList.add(
          'ss-disabled-image-link'
        );

        fullSizeLink.setAttribute(
          'aria-disabled',
          'true'
        );

      }

      console.warn(
        'ShadowScope AM — Missing figure:',
        imagePath
      );

      schedulePageUpdate();

    }


    img.addEventListener(
      'error',
      handleImageError,
      { once: true }
    );


    img.addEventListener(
      'load',
      schedulePageUpdate,
      { once: true }
    );


    if (
      img.complete &&
      img.naturalWidth === 0
    ) {
      handleImageError();
    }

  });


  // ==========================================================
  // 8. INITIAL PAGE STATE
  // ==========================================================

  window.addEventListener('load', () => {

    activateHashTarget();
    schedulePageUpdate();

  });

  schedulePageUpdate();

})();

// ============================================================
// END — SHADOWSCOPE AM JAVASCRIPT
// ============================================================

