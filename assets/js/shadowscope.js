
'use strict';

/* ============================================================
   SHADOWSCOPE AM — PROJECT DOCUMENTATION
   Reading Progress | Chapter Navigation | Reveal
   Evidence Gallery | Image Validation | Security Deep Links
============================================================ */

(() => {

  // ==========================================================
  // 01 / ELEMENT REFERENCES
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

  const scenarioPattern = /^as0[1-8]$/;

  let updatePending = false;


  // ==========================================================
  // 02 / READING PROGRESS
  // ==========================================================

  function updateReadingProgress() {

    if (!progressBar) return;

    const documentHeight =
      document.documentElement.scrollHeight;

    const viewportHeight =
      document.documentElement.clientHeight;

    const scrollableDistance = Math.max(
      0,
      documentHeight - viewportHeight
    );

    const progress = scrollableDistance > 0
      ? Math.min(
          1,
          Math.max(
            0,
            window.scrollY / scrollableDistance
          )
        )
      : 0;

    progressBar.style.transform =
      `scaleX(${progress})`;

  }


  // ==========================================================
  // 03 / ACTIVE CHAPTER NAVIGATION
  // ==========================================================

  function setActiveChapter(id) {

    railLinks.forEach(link => {

      const isActive =
        link.getAttribute('href') === `#${id}`;

      link.classList.toggle(
        'is-current',
        isActive
      );

      if (isActive) {

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
      Math.min(
        190,
        window.innerHeight * 0.24
      )
    );

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
  // 04 / OPTIMIZED PAGE UPDATES
  // ==========================================================

  function updatePageState() {

    updatePending = false;

    updateReadingProgress();
    updateActiveChapter();

  }


  function schedulePageUpdate() {

    if (updatePending) return;

    updatePending = true;

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

  window.addEventListener(
    'load',
    schedulePageUpdate
  );


  // ==========================================================
  // 05 / CHAPTER REVEAL ANIMATIONS
  // ==========================================================

  if (
    !reducedMotion.matches &&
    'IntersectionObserver' in window
  ) {

    root.classList.add('xp-js');

    const revealObserver = new IntersectionObserver(

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
        threshold: 0,
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
  // 06 / DEEP LINK NAVIGATION
  // Chapters | Figures | Security Scenarios
  // ==========================================================

  function getCurrentHashId() {

    const rawHash =
      window.location.hash.slice(1);

    if (!rawHash) return '';

    try {

      return decodeURIComponent(rawHash);

    } catch (_) {

      return '';

    }

  }


  function activateHashTarget() {

    const id = getCurrentHashId();

    if (!id) {

      schedulePageUpdate();
      return;

    }

    const target = document.getElementById(id);

    if (!target) {

      schedulePageUpdate();
      return;

    }

    // Open a parent accordion when a deep link targets
    // content located inside a collapsed details element.

    const parentDetails = target.closest('details');

    if (parentDetails) {

      parentDetails.open = true;

    }

    // Open the targeted security scenario.

    if (
      scenarioPattern.test(id) &&
      target.matches('details.ss-a5-case')
    ) {

      target.open = true;

    }

    // Make the destination chapter visible immediately.

    const chapter = target.closest('.xp-chapter');

    if (chapter) {

      chapter.classList.add('is-visible');

    }

    // Update navigation and scroll after expansion.

    window.requestAnimationFrame(() => {

      if (scenarioPattern.test(id)) {

        target.scrollIntoView({
          behavior: 'auto',
          block: 'start'
        });

      }

      schedulePageUpdate();

    });

  }


  window.addEventListener(
    'hashchange',
    activateHashTarget
  );

  window.addEventListener(
    'popstate',
    activateHashTarget
  );


  // ==========================================================
  // 07 / SECURITY TEST MATRIX NAVIGATION
  // AS01 — AS08
  // ==========================================================

  document.querySelectorAll(
    '.ss-a5-matrix a[href^="#as0"]'
  ).forEach(link => {

    link.addEventListener('click', () => {

      const id =
        link.getAttribute('href').slice(1);

      if (!scenarioPattern.test(id)) return;

      const target = document.getElementById(id);

      if (
        target &&
        target.matches('details.ss-a5-case')
      ) {

        target.open = true;

      }

    });

  });


  // ==========================================================
  // 08 / ACCORDION STATE UPDATES
  // Security Scenarios | Demonstration Archive
  // ==========================================================

  document.querySelectorAll(
    'details'
  ).forEach(details => {

    details.addEventListener(
      'toggle',
      schedulePageUpdate
    );

  });


  // ==========================================================
  // 09 / PROJECT FIGURE VALIDATION
  // Chapters 01–08
  // ==========================================================

  const projectImages = [
    ...document.querySelectorAll(
      '.ss-page .xp-overview-figure img, ' +
      '.ss-page .ss-a8-shot img, ' +
      '.ss-page .ss-a8-case img'
    )
  ];


  projectImages.forEach(img => {

    function handleImageError() {

      if (img.dataset.missing === 'true') {
        return;
      }

      img.dataset.missing = 'true';

      const figure = img.closest('figure');

      const imageLink = img.closest('a');

      const imagePath =
        img.getAttribute('src') || 'Unknown image';

      const holder =
        imageLink || img.parentElement;

      if (!holder) return;

      // Hide the unavailable image.

      img.hidden = true;
      img.style.display = 'none';


      // Disable its full-size image link.

      if (imageLink) {

        imageLink.removeAttribute('href');
        imageLink.removeAttribute('target');

        imageLink.setAttribute(
          'aria-disabled',
          'true'
        );

        imageLink.classList.add(
          'ss-disabled-image-link'
        );

      }


      // Insert a visible fallback message.

      const fallback = document.createElement('div');

      fallback.className = 'ss-image-fallback';

      fallback.setAttribute(
        'role',
        'status'
      );

      fallback.textContent =
        `Image unavailable: ${imagePath}. ` +
        'Verify the exact filename and repository path.';

      holder.appendChild(fallback);


      // Disable any additional full-size figure link.

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
        '[ShadowScope AM] Missing image:',
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


    // Detect an image that failed before the listener
    // was registered.

    if (
      img.complete &&
      img.naturalWidth === 0
    ) {

      handleImageError();

    }

  });


  // ==========================================================
  // 10 / INITIAL PAGE STATE
  // ==========================================================

  activateHashTarget();

  schedulePageUpdate();

})();


/* ============================================================
   END — SHADOWSCOPE AM JAVASCRIPT
============================================================ */
