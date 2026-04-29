/* =========================================================
   transitions.js — Nicholas Pokluda Portfolio
   Lightweight page fade-out/fade-in transitions on internal
   link clicks. No external dependencies.
   ========================================================= */

(function () {
  'use strict';

  // On load, body starts with .page-enter (set inline on <body>);
  // remove it on next tick to fade in.
  document.documentElement.classList.add('js');

  function fadeIn() {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.body.classList.remove('page-enter');
      });
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fadeIn();
  } else {
    document.addEventListener('DOMContentLoaded', fadeIn);
  }

  // Fade out on internal link click, then navigate.
  function isInternalLink(link) {
    if (!link || !link.href) return false;
    if (link.target && link.target !== '_self') return false;
    if (link.hasAttribute('download')) return false;

    const url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return false;

    // Skip same-page hash links — main.js handles smooth scroll.
    if (
      url.pathname === window.location.pathname &&
      url.hash &&
      (url.search === window.location.search)
    ) {
      return false;
    }

    // Skip non-HTML resources (e.g., PDF asset).
    if (/\.(pdf|zip|png|jpg|jpeg|gif|svg|webp|mp4|mp3)$/i.test(url.pathname)) {
      return false;
    }

    // Skip mailto / tel.
    const proto = url.protocol;
    if (proto === 'mailto:' || proto === 'tel:') return false;

    return true;
  }

  document.addEventListener('click', function (e) {
    // Allow modifier-clicks to pass through to the browser.
    if (e.defaultPrevented) return;
    if (e.button !== 0) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    const link = e.target.closest('a');
    if (!isInternalLink(link)) return;

    e.preventDefault();
    const href = link.href;
    document.body.classList.add('page-exit');
    // Wait for CSS transition (~300ms) before navigating.
    setTimeout(function () {
      window.location.href = href;
    }, 300);
  });

  // If the user navigates back via bfcache, ensure body is visible.
  window.addEventListener('pageshow', function (e) {
    document.body.classList.remove('page-exit');
    document.body.classList.remove('page-enter');
  });

})();
