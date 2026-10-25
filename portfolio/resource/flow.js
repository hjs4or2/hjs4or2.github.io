/* Decorative workflow highlights; every step remains readable at all times. */
(() => {
  const grid = document.querySelector("#flow .flow-grid");
  const button = document.querySelector("#flow .flow-toggle");
  const steps = grid ? Array.from(grid.querySelectorAll(".flow-step")) : [];
  let observer;
  let motion;
  let timer = null;
  let currentIndex = 0;
  let inViewport = false;
  let manualPaused = false;
  let reducedMotion = false;
  let printing = false;
  let pageInactive = false;
  let failed = false;

  function stop() {
    if (timer !== null) window.clearTimeout(timer);
    timer = null;
    steps.forEach((step) => step.classList.remove("is-current"));
  }

  function renderControls() {
    if (!button) return;
    const english = document.documentElement.lang === "en";
    const label = manualPaused
      ? (english ? "Resume step highlights" : "순환 강조 다시 시작")
      : (english ? "Pause step highlights" : "순환 강조 일시정지");
    button.textContent = label;
    button.setAttribute("aria-label", label);
    button.hidden = failed || reducedMotion;
  }

  function canRun() {
    return !failed && inViewport && !document.hidden && !manualPaused
      && !reducedMotion && !printing && !pageInactive;
  }

  function showCurrent() {
    steps.forEach((step, index) => step.classList.toggle("is-current", index === currentIndex));
  }

  function tick() {
    timer = null;
    if (!canRun()) { reconcile(); return; }
    try {
      currentIndex = (currentIndex + 1) % steps.length;
      showCurrent();
      timer = window.setTimeout(tick, 1400);
    } catch {
      failOpen();
    }
  }

  function reconcile() {
    try {
      renderControls();
      if (!canRun()) { stop(); return; }
      if (timer !== null) return;
      showCurrent();
      timer = window.setTimeout(tick, 1400);
    } catch {
      failOpen();
    }
  }

  function onMotionChange(event) { reducedMotion = event.matches; reconcile(); }
  function onPause() { manualPaused = !manualPaused; reconcile(); }
  function beforePrint() { printing = true; reconcile(); }
  function afterPrint() { printing = false; reconcile(); }
  function pageHide() { pageInactive = true; reconcile(); }
  function pageShow() { pageInactive = false; reconcile(); }

  function failOpen() {
    failed = true;
    stop();
    if (button) button.hidden = true;
    try { observer?.disconnect(); } catch { /* Content stays visible. */ }
    if (motion) {
      if (typeof motion.removeEventListener === "function") motion.removeEventListener("change", onMotionChange);
      else if (typeof motion.removeListener === "function") motion.removeListener(onMotionChange);
    }
    button?.removeEventListener("click", onPause);
    document.removeEventListener("visibilitychange", reconcile);
    window.removeEventListener("beforeprint", beforePrint);
    window.removeEventListener("afterprint", afterPrint);
    window.removeEventListener("pagehide", pageHide);
    window.removeEventListener("pageshow", pageShow);
    if (window.renderPortfolioFlowControls === renderControls) delete window.renderPortfolioFlowControls;
  }

  try {
    if (!grid || !button || steps.length !== 5
      || typeof window.IntersectionObserver !== "function"
      || typeof window.matchMedia !== "function") return;
    motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (typeof motion.addEventListener !== "function" && typeof motion.addListener !== "function") return;
    reducedMotion = motion.matches;
    observer = new window.IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === grid) inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.12;
      }
      reconcile();
    }, { threshold: 0.12 });
    if (typeof motion.addEventListener === "function") motion.addEventListener("change", onMotionChange);
    else motion.addListener(onMotionChange);
    button.addEventListener("click", onPause);
    document.addEventListener("visibilitychange", reconcile);
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);
    window.addEventListener("pagehide", pageHide);
    window.addEventListener("pageshow", pageShow);
    window.renderPortfolioFlowControls = renderControls;
    renderControls();
    observer.observe(grid);
  } catch {
    failOpen();
  }
})();
