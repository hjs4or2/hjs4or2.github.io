/* Decorative first-visit entrance. Content is visible without this script. */
(() => {
  const root = document.documentElement;
  const sessionKey = "portfolio.midnight.intro.v1";
  let timer;
  let motion;
  let listening = false;

  function finish() {
    root.classList.remove("intro-active");
    const overlay = document.querySelector(".site-intro");
    if (overlay) overlay.hidden = true;
    window.clearTimeout(timer);
    if (listening) {
      if (typeof motion.removeEventListener === "function") motion.removeEventListener("change", onMotionChange);
      else if (typeof motion.removeListener === "function") motion.removeListener(onMotionChange);
      listening = false;
    }
  }

  function onMotionChange(event) {
    if (event.matches) finish();
  }

  try {
    if (window.location.hash || typeof window.matchMedia !== "function") return;
    motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;
    const navigation = window.performance?.getEntriesByType?.("navigation")?.[0];
    if (navigation?.type === "back_forward" || window.performance?.navigation?.type === 2) return;
    // Restricted storage fails open rather than replaying the entrance every visit.
    if (window.sessionStorage.getItem(sessionKey)) return;
    window.sessionStorage.setItem(sessionKey, "seen");
    // Arm the escape hatch before enabling any visual state.
    timer = window.setTimeout(finish, 1800);
    window.addEventListener("pagehide", finish);
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) finish();
    });
    window.addEventListener("beforeprint", finish);
    document.addEventListener("animationend", (event) => {
      if (event.animationName === "midnight-hero-enter" && event.target.classList.contains("hero-showcase")) finish();
    });
    if (typeof motion.addEventListener === "function") {
      motion.addEventListener("change", onMotionChange);
      listening = true;
    } else if (typeof motion.addListener === "function") {
      motion.addListener(onMotionChange);
      listening = true;
    }
    root.classList.add("intro-active");
  } catch {
    finish();
  }
})();
