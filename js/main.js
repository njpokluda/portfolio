/* =========================================================
   Nicholas Pokluda — Portfolio main.js
   Scroll progress bar, nav scroll state, back-to-top,
   mobile menu, scroll-reveals, animated stat counters,
   work tabs, accordion, footer year.
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Footer year ---------- */
  // Set the copyright year dynamically.
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Scroll progress bar ---------- */
  // Tracks vertical scroll progress and fills the top bar 0–100%.
  const progressBar = document.querySelector('.scroll-progress');

  function updateScrollProgress() {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = percent + '%';
  }

  /* ---------- Nav: scrolled state + back-to-top ---------- */
  const siteNav = document.querySelector('.site-nav');
  const backToTop = document.querySelector('.back-to-top');

  function updateNavState() {
    const y = window.scrollY;
    if (siteNav) {
      siteNav.classList.toggle('is-scrolled', y > 24);
    }
    if (backToTop) {
      backToTop.classList.toggle('is-visible', y > 400);
    }
  }

  if (backToTop) {
    backToTop.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Combined scroll handler with rAF throttle for smoothness.
  let scrollScheduled = false;
  function onScroll() {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(function () {
      updateScrollProgress();
      updateNavState();
      scrollScheduled = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  // Initial state.
  updateScrollProgress();
  updateNavState();

  /* ---------- Mobile menu ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  function setMobileNav(open) {
    if (!navToggle || !mobileNav) return;
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileNav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      setMobileNav(!isOpen);
    });
    // Close menu when a link is tapped.
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMobileNav(false); });
    });
    // Close on escape.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMobileNav(false);
    });
  }

  /* ---------- Hero load animation ---------- */
  // Stagger fade-in of hero elements once DOM is parsed.
  const heroAnimEls = document.querySelectorAll('.hero-anim');
  if (heroAnimEls.length) {
    heroAnimEls.forEach(function (el, i) {
      const delay = parseInt(el.dataset.delay || (i * 150), 10);
      setTimeout(function () { el.classList.add('is-in'); }, delay);
    });
  }

  /* ---------- Scroll reveals ---------- */
  // IntersectionObserver to fade-up elements as they enter viewport.
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Optional stagger via data-stagger index (ms).
          const delay = parseInt(el.dataset.stagger || 0, 10);
          if (delay) el.style.transitionDelay = delay + 'ms';
          el.classList.add('is-visible');
          revealObserver.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    // No IO support — show everything.
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Animated stat counters ---------- */
  // Counts up from 0 to the target value when the .stats-band enters view.
  const counters = document.querySelectorAll('[data-counter]');

  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    const duration = parseInt(el.dataset.duration || 1600, 10);
    const decimals = parseInt(el.dataset.decimals || 0, 10);
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic for a decelerating finish.
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = formatNumber(value, target, decimals);
      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = formatNumber(target, target, decimals);
      }
    }
    requestAnimationFrame(frame);
  }

  function formatNumber(value, target, decimals) {
    // If target is >= 1000, format with K shorthand for display when target is exactly 89000-style large.
    // We keep this simple: render whole numbers and add 'K' if data-suffix='K'.
    const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    return fixed;
  }

  if ('IntersectionObserver' in window && counters.length) {
    const counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) {
      el.textContent = '0';
      counterObserver.observe(el);
    });
  } else {
    counters.forEach(function (el) {
      el.textContent = el.dataset.counter;
    });
  }

  /* ---------- Featured work tabs ---------- */
  const tabs = document.querySelectorAll('[data-tab]');
  const panels = document.querySelectorAll('[data-panel]');

  function activateTab(name) {
    tabs.forEach(function (t) {
      const isActive = t.dataset.tab === name;
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
      t.tabIndex = isActive ? 0 : -1;
    });
    panels.forEach(function (p) {
      p.classList.toggle('is-active', p.dataset.panel === name);
    });
  }

  if (tabs.length && panels.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activateTab(tab.dataset.tab);
      });
      tab.addEventListener('keydown', function (e) {
        const order = Array.from(tabs);
        const idx = order.indexOf(tab);
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const next = order[(idx + 1) % order.length];
          next.focus();
          activateTab(next.dataset.tab);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prev = order[(idx - 1 + order.length) % order.length];
          prev.focus();
          activateTab(prev.dataset.tab);
        }
      });
    });
  }

  /* ---------- Smooth scroll for in-page anchors ---------- */
  // Handle hash links cleanly even when they include a path (e.g. /index.html#work).
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href*="#"]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href) return;
    // Same-page anchor only.
    const url = new URL(link.href, window.location.href);
    if (url.pathname === window.location.pathname && url.hash) {
      const target = document.querySelector(url.hash);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', url.hash);
      }
    }
  });

})();
