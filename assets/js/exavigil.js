'use strict';

// ============================================================
// EXAVIGIL — PROJECT DOCUMENTATION
// Reading Progress | Chapter Navigation | Reveal | Evidence
// ============================================================

(() => {
  const root = document.documentElement;
  const progressBar = document.getElementById('xp-reading-progress');
  const chapters = [...document.querySelectorAll('.xp-chapter[id]')];
  const railLinks = [...document.querySelectorAll('.xp-rail-link')];
  const revealElements = [...document.querySelectorAll('.xp-reveal')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let updateScheduled = false;

  // ----------------------------------------------------------
  // 1. READING PROGRESS & CURRENT CHAPTER
  // ----------------------------------------------------------
  function updateReadingProgress() {
    if (!progressBar) return;

    const page = document.documentElement;
    const distance = Math.max(0, page.scrollHeight - page.clientHeight);
    const fraction = distance > 0
      ? Math.min(1, Math.max(0, window.scrollY / distance))
      : 0;

    progressBar.style.transform = `scaleX(${fraction})`;
  }

  function updateActiveChapter() {
    if (!chapters.length) return;

    // A point below the sticky header is used to select the
    // chapter the reader has most recently reached.
    const threshold = Math.max(120, Math.min(200, window.innerHeight * 0.24));
    let current = chapters[0].id;

    for (const chapter of chapters) {
      if (chapter.getBoundingClientRect().top <= threshold) {
        current = chapter.id;
      } else {
        break;
      }
    }

    for (const link of railLinks) {
      const isCurrent = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('is-current', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    }
  }

  function updatePageState() {
    updateScheduled = false;
    updateReadingProgress();
    updateActiveChapter();
  }

  function schedulePageUpdate() {
    if (updateScheduled) return;
    updateScheduled = true;
    window.requestAnimationFrame(updatePageState);
  }

  window.addEventListener('scroll', schedulePageUpdate, { passive: true });
  window.addEventListener('resize', schedulePageUpdate);
  window.addEventListener('load', schedulePageUpdate);
  window.addEventListener('pageshow', schedulePageUpdate);

  // ----------------------------------------------------------
  // 2. ACCESSIBLE SCROLL REVEAL
  // ----------------------------------------------------------
  const canAnimate =
    !reducedMotion.matches && 'IntersectionObserver' in window;

  if (canAnimate) {
    root.classList.add('xp-js');

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, {
      threshold: 0,
      rootMargin: '0px 0px -4% 0px'
    });

    for (const element of revealElements) observer.observe(element);

    // Reveal a deep-linked chapter immediately, rather than
    // allowing CSS to leave it transparent during navigation.
    const hashTarget = getHashTarget();
    const linkedChapter = hashTarget?.closest('.xp-chapter');
    if (linkedChapter) linkedChapter.classList.add('is-visible');
  } else {
    for (const element of revealElements) {
      element.classList.add('is-visible');
    }
  }

  // ----------------------------------------------------------
  // 3. VALIDATION EVIDENCE — ALL CHAPTER LINKS
  // ----------------------------------------------------------
  function getHashTarget() {
    const hash = window.location.hash.slice(1);
    if (!hash) return null;
    try {
      return document.getElementById(decodeURIComponent(hash));
    } catch (_) {
      return null;
    }
  }

  function revealTarget(target) {
    const chapter = target.closest('.xp-chapter');
    if (chapter) chapter.classList.add('is-visible');

    if (target.matches('details.xp-val-case')) {
      target.open = true;
    }
  }

  function scrollToTarget(target, animated = false) {
    window.requestAnimationFrame(() => {
      target.scrollIntoView({
        behavior: animated && !reducedMotion.matches ? 'smooth' : 'auto',
        block: 'start'
      });
      schedulePageUpdate();
    });
  }

  function activateLocationHash(shouldScroll = true) {
    const target = getHashTarget();
    if (!target) {
      schedulePageUpdate();
      return;
    }

    revealTarget(target);
    if (shouldScroll) scrollToTarget(target);
  }

  // The matrix, evidence cards and demonstration links all work.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#test-"]');
    if (!link) return;

    const hash = link.getAttribute('href');
    const id = hash?.slice(1);
    const target = id ? document.getElementById(id) : null;
    if (!target || !target.matches('details.xp-val-case')) return;

    event.preventDefault();
    revealTarget(target);

    if (window.location.hash !== hash) {
      window.history.pushState(null, '', hash);
    }

    scrollToTarget(target, true);
  });

  window.addEventListener('hashchange', () => activateLocationHash());
  window.addEventListener('popstate', () => activateLocationHash());
  window.addEventListener('load', () => activateLocationHash(false));
  activateLocationHash();

  // ----------------------------------------------------------
  // 4. MISSING FIGURES & SCREENSHOTS
  // ----------------------------------------------------------
  const imageSelector = [
    '.xp-overview-figure img',
    '.xp-val-gallery img',
    '.xp-d6-preview img'
  ].join(', ');

  for (const img of document.querySelectorAll(imageSelector)) {
    const markMissing = () => {
      if (img.dataset.missing === 'true') return;
      img.dataset.missing = 'true';

      const path = img.getAttribute('src') || 'Unknown file';
      const link = img.closest('a');
      const holder = link || img.parentElement;
      if (!holder) return;

      img.hidden = true;
      img.style.display = 'none';
      holder.classList.add('xp-media-unavailable');

      if (link) {
        link.removeAttribute('href');
        link.removeAttribute('target');
        link.setAttribute('aria-disabled', 'true');
      }

      const message = document.createElement('div');
      message.className = 'xp-media-fallback';
      message.setAttribute('role', 'status');
      message.textContent = `Image unavailable: ${path}. Check the filename, extension and GitHub path.`;
      holder.appendChild(message);

      // A separate VIEW FULL SIZE link must not lead to a 404.
      const figure = img.closest('.xp-overview-figure');
      const fullSize = figure?.querySelector('.xp-figure-open');
      if (fullSize) {
        fullSize.removeAttribute('href');
        fullSize.removeAttribute('target');
        fullSize.setAttribute('aria-disabled', 'true');
        fullSize.classList.add('xp-media-link-disabled');
      }

      console.warn('EXAVIGIL: missing image', path);
    };

    img.addEventListener('error', markMissing, { once: true });
    if (img.complete && img.naturalWidth === 0) markMissing();
  }

  // Ensure loading images / expanding evidence refresh the progress.
  document.addEventListener('toggle', event => {
    if (event.target.matches?.('.xp-val-case')) schedulePageUpdate();
  }, true);

  schedulePageUpdate();
})();
