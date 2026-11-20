
'use strict';

// ============================================================
// EXAVIGIL — PROJECT DOCUMENTATION
// Scroll Progress | Active Chapters | Reveal | Image Checks
// ============================================================

(() => {

  // ==========================================================
  // 1. ELEMENT REFERENCES
  // ==========================================================

  const progressBar = document.getElementById(
    'xp-reading-progress'
  );

  const chapters = [
    ...document.querySelectorAll('.xp-chapter[id]')
  ];

  const chapterLinks = [
    ...document.querySelectorAll('.xp-rail-link')
  ];

  const revealElements = [
    ...document.querySelectorAll('.xp-reveal')
  ];

  let updatePending = false;


  // ==========================================================
  // 2. READING PROGRESS
  // ==========================================================

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


  // ==========================================================
  // 3. ACTIVE CHAPTER NAVIGATION
  // ==========================================================

  function setActiveChapter(id) {

    chapterLinks.forEach(link => {

      const isCurrent =
        link.getAttribute('href') === `#${id}`;

      link.classList.toggle(
        'is-current',
        isCurrent
      );

      if (isCurrent) {
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

    const activationPoint =
      Math.max(135, window.innerHeight * 0.25);

    let activeId = chapters[0].id;

    chapters.forEach(chapter => {

      const rectangle =
        chapter.getBoundingClientRect();

      if (rectangle.top <= activationPoint) {
        activeId = chapter.id;
      }

    });

    setActiveChapter(activeId);

  }


  // ==========================================================
  // 4. OPTIMIZED SCROLL HANDLER
  // ==========================================================

  function updatePageState() {

    updateReadingProgress();
    updateActiveChapter();

    updatePending = false;

  }

  function requestPageUpdate() {

    if (updatePending) return;

    updatePending = true;

    window.requestAnimationFrame(
      updatePageState
    );

  }

  window.addEventListener(
    'scroll',
    requestPageUpdate,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    requestPageUpdate
  );

  window.addEventListener(
    'hashchange',
    requestPageUpdate
  );

  window.addEventListener(
    'load',
    requestPageUpdate
  );

  requestPageUpdate();


  // ==========================================================
  // 5. SCROLL REVEAL ANIMATIONS
  // ==========================================================

  const prefersReducedMotion =
    window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

  if (
    !prefersReducedMotion &&
    'IntersectionObserver' in window
  ) {

    document.documentElement.classList.add(
      'xp-js'
    );

    const revealObserver =
      new IntersectionObserver(

        entries => {

          entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            entry.target.classList.add(
              'is-visible'
            );

            revealObserver.unobserve(
              entry.target
            );

          });

        },

        {
          threshold: 0.02,
          rootMargin: '0px 0px -4% 0px'
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


  // ==========================================================
  // 6. PROJECT FIGURE IMAGE CHECKS
  // ==========================================================

  const projectImages = [
    ...document.querySelectorAll(
      '.xp-overview-figure img'
    )
  ];

  projectImages.forEach(img => {

    function handleImageError() {

      const imageLink = img.closest(
        '.xp-figure-image-link'
      );

      if (!imageLink) return;

      if (imageLink.querySelector('.xp-figure-error')) {
        return;
      }

      img.style.display = 'none';

      const errorMessage =
        document.createElement('div');

      errorMessage.className =
        'xp-figure-error';

      errorMessage.setAttribute(
        'role',
        'status'
      );

      errorMessage.textContent =
        'Figure unavailable. Verify the image filename and GitHub repository path.';

      imageLink.appendChild(errorMessage);

      console.warn(
        'EXAVIGIL: Missing figure:',
        img.getAttribute('src')
      );

    }

    img.addEventListener(
      'error',
      handleImageError,
      { once: true }
    );

    // Handle images that failed before the listener was added.
    if (img.complete && img.naturalWidth === 0) {
      handleImageError();
    }

  });

})();

// ============================================================
// END — EXAVIGIL PROJECT JAVASCRIPT
// ============================================================
