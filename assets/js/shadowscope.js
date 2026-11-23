 'use strict';

/* ============================================================
   SHADOWSCOPE AM — PROJECT DOCUMENTATION
   Chapters 01–09 | Scroll progress | Navigation | Figures
   Scenario deep links | Responsive gallery | Image validation
============================================================ */

(() => {
  const page = document.querySelector('.ss-page');
  if (!page) return;

  const root = document.documentElement;
  const progressBar = document.getElementById('xp-reading-progress');
  const chapters = [...document.querySelectorAll('.xp-chapter[id]')];
  const chapterLinks = [...document.querySelectorAll('.xp-rail-link, .ss-nav .nav-link')];
  const revealElements = [...document.querySelectorAll('.xp-reveal')];
  const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scenarioPattern = /^as0[1-8]$/;
  let framePending = false;

  // 01 / Reading progress and current chapter.
  function updateReadingProgress() {
    if (!progressBar) return;
    const distance = Math.max(0, root.scrollHeight - root.clientHeight);
    const progress = distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
    progressBar.style.transform = `scaleX(${progress})`;
  }

  function updateCurrentChapter() {
    if (!chapters.length) return;
    const marker = Math.max(110, Math.min(190, window.innerHeight * 0.24));
    let chapterId = chapters[0].id;
    chapters.forEach((chapter) => {
      if (chapter.getBoundingClientRect().top <= marker) chapterId = chapter.id;
    });
    chapterLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${chapterId}`;
      link.classList.toggle('is-current', active);
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function updatePage() {
    framePending = false;
    updateReadingProgress();
    updateCurrentChapter();
  }

  function scheduleUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(updatePage);
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);

  // 02 / Reveal elements. With reduced motion or missing API, content stays visible.
  if (!preferReducedMotion.matches && 'IntersectionObserver' in window) {
    root.classList.add('xp-js');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -4% 0px' });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  // 03 / Accessible deep links to AS01–AS08 and content inside details.
  function currentHashId() {
    const value = window.location.hash.slice(1);
    try { return decodeURIComponent(value); }
    catch (_) { return ''; }
  }

  function activateHashTarget() {
    const id = currentHashId();
    if (!id) return scheduleUpdate();
    const target = document.getElementById(id);
    if (!target) return scheduleUpdate();
    if (target.matches('details')) target.open = true;
    let parent = target.closest('details');
    while (parent) {
      parent.open = true;
      parent = parent.parentElement?.closest('details');
    }
    target.closest('.xp-chapter')?.classList.add('is-visible');
    window.requestAnimationFrame(() => {
      if (scenarioPattern.test(id)) target.scrollIntoView({ behavior: 'auto', block: 'start' });
      scheduleUpdate();
    });
  }

  document.querySelectorAll('.ss-a5-matrix a[href^="#as0"]').forEach((link) => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href')?.slice(1) || '';
      if (!scenarioPattern.test(id)) return;
      const target = document.getElementById(id);
      if (target?.matches('details.ss-a5-case')) target.open = true;
    });
  });
  document.querySelectorAll('details').forEach((element) => {
    element.addEventListener('toggle', scheduleUpdate);
  });
  window.addEventListener('hashchange', activateHashTarget);
  window.addEventListener('popstate', activateHashTarget);

  // 04 / All project images. Report missing paths instead of broken boxes.
  const imageSelector = [
    '.ss-page .xp-overview-figure img',
    '.ss-page .ss-a8-shot img',
    '.ss-page .ss-a8-case img'
  ].join(', ');
  const projectImages = [...document.querySelectorAll(imageSelector)];

  projectImages.forEach((img) => {
    function handleImageError() {
      if (img.dataset.missing === 'true') return;
      img.dataset.missing = 'true';
      const path = img.getAttribute('src') || '(unknown)';
      const figure = img.closest('figure');
      const imageLink = img.closest('a');
      const parent = imageLink || img.parentElement;
      if (!parent) return;
      img.hidden = true;
      img.style.display = 'none';
      if (imageLink) {
        imageLink.removeAttribute('href');
        imageLink.removeAttribute('target');
        imageLink.classList.add('ss-disabled-image-link');
        imageLink.setAttribute('aria-disabled', 'true');
      }
      const fallback = document.createElement('div');
      fallback.className = 'ss-image-fallback';
      fallback.setAttribute('role', 'status');
      fallback.textContent = `Image unavailable: ${path}. Check the exact filename and repository path.`;
      parent.appendChild(fallback);
      figure?.querySelectorAll('.xp-figure-open').forEach((link) => {
        link.removeAttribute('href');
        link.removeAttribute('target');
        link.classList.add('ss-disabled-image-link');
        link.setAttribute('aria-disabled', 'true');
      });
      console.warn('[ShadowScope AM] Missing image:', path);
      scheduleUpdate();
    }
    img.addEventListener('error', handleImageError, { once: true });
    img.addEventListener('load', scheduleUpdate, { once: true });
    if (img.complete && img.naturalWidth === 0) handleImageError();
  });

  // 05 / Keyboard-operable lightbox. Ordinary image links still work if JS is unavailable.
  if ('HTMLDialogElement' in window && typeof HTMLDialogElement.prototype.showModal === 'function') {
    const imageLinks = projectImages.map((img) => img.closest('a[href]')).filter(Boolean);
    if (imageLinks.length) {
      const dialog = document.createElement('dialog');
      dialog.className = 'ss-lightbox';
      dialog.setAttribute('aria-label', 'Project figure viewer');
      const frame = document.createElement('div');
      frame.className = 'ss-lightbox-frame';
      const bar = document.createElement('div');
      bar.className = 'ss-lightbox-bar';
      const label = document.createElement('strong');
      label.className = 'ss-lightbox-label';
      const controls = document.createElement('div');
      controls.className = 'ss-lightbox-controls';
      const previous = document.createElement('button');
      previous.type = 'button';
      previous.textContent = '‹';
      previous.setAttribute('aria-label', 'Previous project figure');
      const next = document.createElement('button');
      next.type = 'button';
      next.textContent = '›';
      next.setAttribute('aria-label', 'Next project figure');
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = '×';
      close.setAttribute('aria-label', 'Close image viewer');
      controls.append(previous, next, close);
      bar.append(label, controls);
      const imageWrap = document.createElement('div');
      imageWrap.className = 'ss-lightbox-image-wrap';
      const image = document.createElement('img');
      image.className = 'ss-lightbox-image';
      image.alt = '';
      imageWrap.appendChild(image);
      const footer = document.createElement('div');
      footer.className = 'ss-lightbox-footer';
      const counter = document.createElement('span');
      const original = document.createElement('a');
      original.textContent = 'OPEN ORIGINAL ↗';
      original.target = '_blank';
      original.rel = 'noopener noreferrer';
      footer.append(counter, original);
      frame.append(bar, imageWrap, footer);
      dialog.appendChild(frame);
      document.body.appendChild(dialog);
      let active = 0;
      let focusedBefore = null;

      function showImage(index) {
        active = (index + imageLinks.length) % imageLinks.length;
        const link = imageLinks[active];
        const source = link.querySelector('img');
        if (!source || source.dataset.missing === 'true') return;
        const figure = link.closest('figure');
        label.textContent = figure?.querySelector('h3,h4')?.textContent.trim() || 'ShadowScope AM — Engineering Figure';
        image.src = source.currentSrc || source.src;
        image.alt = source.alt || label.textContent;
        original.href = link.href;
        counter.textContent = `FIGURE ${String(active + 1).padStart(2, '0')} / ${String(imageLinks.length).padStart(2, '0')}`;
      }
      imageLinks.forEach((link, index) => {
        link.addEventListener('click', (event) => {
          if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          const source = link.querySelector('img');
          if (!source || source.dataset.missing === 'true') return;
          event.preventDefault();
          focusedBefore = document.activeElement;
          showImage(index);
          if (!dialog.open) dialog.showModal();
          document.body.classList.add('ss-lightbox-open');
          close.focus();
        });
      });
      previous.addEventListener('click', () => showImage(active - 1));
      next.addEventListener('click', () => showImage(active + 1));
      close.addEventListener('click', () => dialog.close());
      dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
      dialog.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(active - 1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); showImage(active + 1); }
      });
      dialog.addEventListener('close', () => {
        document.body.classList.remove('ss-lightbox-open');
        focusedBefore?.focus?.();
      });
    }
  }

  activateHashTarget();
  scheduleUpdate();
})();
/* END — SHADOWSCOPE AM */
