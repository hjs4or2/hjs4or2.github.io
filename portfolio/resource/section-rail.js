/* Native section links with a passive, position-based current-section marker. */
(() => {
  'use strict';
  try {
    const rail = document.querySelector('.section-rail');
    if (!rail) return;
    const links = Array.from(rail.querySelectorAll('a[href^="#"]'));
    const entries = links.map(link => ({ link, section: document.getElementById(link.hash.slice(1)) })).filter(entry => entry.section);
    if (!entries.length) return;
    let pending = false;
    function update() {
      pending = false;
      try {
        const height = window.innerHeight || document.documentElement.clientHeight;
        const scroll = window.scrollY || document.documentElement.scrollTop || 0;
        let current = entries[0];
        entries.forEach(entry => {
          if (entry.section.getBoundingClientRect().top <= height * .35) current = entry;
        });
        const fullHeight = Math.max(document.documentElement.scrollHeight, document.body ? document.body.scrollHeight : 0);
        if (scroll > 0 && scroll + height >= fullHeight - 2) current = entries[entries.length - 1];
        links.forEach(link => {
          const active = link === current.link;
          link.classList.toggle('is-current', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      } catch (_) { /* Keep the last usable native-link state. */ }
    }
    function schedule() {
      if (pending) return;
      pending = true;
      if (typeof window.requestAnimationFrame === 'function') {
        try { window.requestAnimationFrame(update); } catch (_) { update(); }
      } else update();
    }
    window.addEventListener('scroll', schedule, { passive: true });
    ['resize', 'hashchange', 'pageshow', 'load'].forEach(type => window.addEventListener(type, schedule));
    document.addEventListener('toggle', schedule, true);
    update();
  } catch (_) { /* Missing features leave all anchor navigation native. */ }
})();
