/* One viewport entrance; observation never hides the waiting content. */
(() => {
  const grid = document.querySelector("#flow .flow-grid");
  let observer;
  let motion;
  let timer;
  let finished = false;
  let played = false;
  let listening = false;

  function finish() {
    finished = true;
    observer?.disconnect();
    grid?.classList.remove("flow-enter");
    window.clearTimeout(timer);
    if (listening) {
      if (typeof motion.removeEventListener === "function") motion.removeEventListener("change", onMotionChange);
      else if (typeof motion.removeListener === "function") motion.removeListener(onMotionChange);
      listening = false;
    }
    window.removeEventListener("beforeprint", finish);
    window.removeEventListener("pagehide", finish);
  }

  function onMotionChange(event) {
    if (event.matches) finish();
  }

  try {
    if (!grid || typeof window.IntersectionObserver !== "function" || typeof window.matchMedia !== "function") return;
    motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    observer = new window.IntersectionObserver((entries) => {
      if (finished || played || !entries.some((entry) => entry.target === grid && entry.isIntersecting)) return;
      played = true;
      try {
        observer.disconnect();
        timer = window.setTimeout(finish, 1200);
        grid.classList.add("flow-enter");
      } catch {
        finish();
      }
    }, { threshold: 0.12 });
    if (typeof motion.addEventListener === "function") {
      motion.addEventListener("change", onMotionChange);
      listening = true;
    } else if (typeof motion.addListener === "function") {
      motion.addListener(onMotionChange);
      listening = true;
    }
    window.addEventListener("beforeprint", finish);
    window.addEventListener("pagehide", finish);
    observer.observe(grid);
  } catch {
    finish();
  }
})();
