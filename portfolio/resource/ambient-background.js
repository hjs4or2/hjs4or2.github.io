/* Decorative motion only; unsupported environments keep a static background. */
(() => {
  'use strict';
  const root = document.documentElement;
  const button = document.querySelector('.ambient-toggle');
  function failOpen() {
    root.classList.remove('ambient-running');
    if (button) button.hidden = true;
  }
  try {
    if (!button || typeof window.matchMedia !== 'function') return failOpen();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const forced = window.matchMedia('(forced-colors: active)');
    const desktop = window.matchMedia('(min-width: 768px)');
    let paused = false, printing = false, departed = false;
    function copy() {
      const en = root.lang === 'en';
      button.textContent = en ? (paused ? 'Play background' : 'Pause background') : (paused ? '배경 재생' : '배경 정지');
      button.setAttribute('aria-pressed', String(paused));
    }
    function sync() {
      const eligible = !reduce.matches && !forced.matches && desktop.matches;
      button.hidden = !eligible;
      root.classList.toggle('ambient-running', eligible && !paused && !printing && !departed && !document.hidden);
      copy();
    }
    for (const query of [reduce, forced, desktop]) {
      if (typeof query.addEventListener === 'function') query.addEventListener('change', sync);
      else if (typeof query.addListener === 'function') query.addListener(sync);
      else return failOpen();
    }
    button.addEventListener('click', () => { paused = !paused; sync(); });
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', () => { departed = true; sync(); });
    window.addEventListener('pageshow', () => { departed = false; sync(); });
    window.addEventListener('beforeprint', () => { printing = true; sync(); });
    window.addEventListener('afterprint', () => { printing = false; sync(); });
    window.renderPortfolioAmbientCopy = copy;
    sync();
  } catch (_) { failOpen(); }
})();
