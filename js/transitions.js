/**
 * transitions.js — Nicholas Pokluda Portfolio
 * Handles fade page-exit and page-enter transitions
 * on internal link navigation.
 */

/* ============================================================
   PAGE ENTER — fade in on load
   ============================================================ */
function initPageEnter() {
  // Start invisible, then fade in
  document.body.classList.add('page-enter');

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove('page-enter');
      document.body.classList.add('page-loaded');
    });
  });
}

/* ============================================================
   PAGE EXIT — fade out on internal navigation
   ============================================================ */
function initPageExit() {
  const currentOrigin = window.location.origin;
  const currentPathname = window.location.pathname;

  document.addEventListener('click', e => {
    // Find closest anchor tag
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip: external links, new-tab, anchors-only, mailto, tel
    if (
      link.target === '_blank' ||
      link.hasAttribute('download') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('http') && !href.startsWith(currentOrigin) ||
      href.startsWith('#')
    ) return;

    // Resolve absolute URL
    let absoluteHref;
    try {
      absoluteHref = new URL(href, window.location.href).href;
    } catch (_) {
      return;
    }

    // Skip if same page (allow hash navigation without transition)
    const targetUrl = new URL(absoluteHref);
    if (targetUrl.pathname === currentPathname && targetUrl.hash) return;

    // Prevent default and fade out
    e.preventDefault();

    document.body.classList.remove('page-loaded');
    document.body.classList.add('page-exit');

    setTimeout(() => {
      window.location.href = absoluteHref;
    }, 310); // slightly longer than the 300ms CSS transition
  });
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initPageEnter();
  initPageExit();
});
