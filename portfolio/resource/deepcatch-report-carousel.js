/* Optional, silent report previews. Existing slide clicks still open media. */
(() => {
  "use strict";

  const mounted = new WeakMap();
  const controllers = new Set();

  function mount(root) {
    if (!root) return;
    const existing = mounted.get(root);
    if (existing) {
      existing.copy();
      return;
    }

    const slides = Array.from(root.querySelectorAll(".deepcatch-report-slide"));
    const previous = root.querySelector("[data-carousel-prev]");
    const next = root.querySelector("[data-carousel-next]");
    const toggle = root.querySelector("[data-carousel-toggle]");
    const count = root.querySelector("[data-carousel-count]");
    if (slides.length < 2 || !previous || !next || !toggle || !count) return;
    const stage = root.querySelector(".deepcatch-report-stage");
    const originalTabIndexes = slides.map(slide => slide.getAttribute("tabindex"));
    const motionClasses = ["is-report-enter-next", "is-report-leave-next", "is-report-enter-prev", "is-report-leave-prev"];
    const toggleLabel = toggle.querySelector("[data-carousel-toggle-label]") || toggle;
    const disclosure = root.closest(".project-disclosure");
    let current = 0;
    let paused = false;
    let pointerHover = false;
    let mouseHover = false;
    let focusInside = false;
    let inViewport = false;
    let pageActive = true;
    let printing = false;
    let reduced = true;
    let automaticAvailable = false;
    let timer = null;
    let nextAutoAt = null;
    let transition = null;
    let intersection;
    let modalObserver;

    function inside(target) {
      try { return !!target && (target === root || root.contains(target)); }
      catch (_) { return false; }
    }

    function copy() {
      const english = /^en(?:-|$)/i.test(document.documentElement.lang || "");
      root.setAttribute("aria-label", english ? "Institution-specific report examples" : "기관별 리포트 예시");
      const previousLabel = english ? "Previous report" : "이전 리포트";
      const nextLabel = english ? "Next report" : "다음 리포트";
      previous.setAttribute("aria-label", previousLabel);
      previous.setAttribute("title", previousLabel);
      next.setAttribute("aria-label", nextLabel);
      next.setAttribute("title", nextLabel);
      const toggleCopy = english
        ? (paused ? "Play automatic slides" : "Pause automatic slides")
        : (paused ? "자동 전환 재생" : "자동 전환 일시정지");
      toggleLabel.textContent = toggleCopy;
      toggle.setAttribute("aria-label", toggleCopy);
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.hidden = !automaticAvailable || reduced;
    }

    function renderSlides(outgoing = -1) {
      slides.forEach((slide, position) => {
        const active = position === current;
        slide.hidden = !active && position !== outgoing;
        slide.setAttribute("aria-hidden", String(!active));
        if (active) {
          slide.setAttribute("aria-current", "true");
          slide.removeAttribute("inert");
          if (originalTabIndexes[position] === null) slide.removeAttribute("tabindex");
          else slide.setAttribute("tabindex", originalTabIndexes[position]);
        } else {
          slide.removeAttribute("aria-current");
          slide.setAttribute("inert", "");
          slide.setAttribute("tabindex", "-1");
        }
      });
      count.textContent = (current + 1) + "/" + slides.length;
    }

    function settleTransition() {
      transition = null;
      slides.forEach(slide => slide.classList.remove(...motionClasses));
      if (stage) {
        stage.classList.remove("is-report-sliding");
        stage.style.removeProperty("height");
      }
      renderSlides();
    }

    function now() {
      const time = window.performance && typeof window.performance.now === "function"
        ? window.performance.now() : Date.now();
      if (!Number.isFinite(time)) throw new Error("Carousel clock unavailable");
      return time;
    }

    function show(index, direction = 0) {
      settleTransition();
      const outgoing = current;
      current = (index + slides.length) % slides.length;
      if (!direction || outgoing === current || !canMove()) {
        renderSlides();
        return;
      }
      // Hold the existing image/caption box while both grid panels move.
      const height = stage.getBoundingClientRect().height;
      if (Number.isFinite(height) && height > 0) stage.style.height = height + "px";
      renderSlides(outgoing);
      void stage.offsetWidth;
      const suffix = direction > 0 ? "next" : "prev";
      transition = {
        incoming: slides[current],
        animationName: "deepcatch-report-enter-" + suffix,
        finishAt: now() + 450
      };
      stage.classList.add("is-report-sliding");
      slides[outgoing].classList.add("is-report-leave-" + suffix);
      slides[current].classList.add("is-report-enter-" + suffix);
    }

    function stop() {
      const pending = timer;
      timer = null;
      if (pending !== null) window.clearTimeout(pending);
    }

    function failOpen() {
      automaticAvailable = false;
      nextAutoAt = null;
      try { stop(); } catch (_) { /* Retain manual controls if timers fail. */ }
      try { settleTransition(); } catch (_) { /* Keep the selected report visible. */ }
      try { if (intersection) intersection.disconnect(); } catch (_) { /* Optional. */ }
      try { if (modalObserver) modalObserver.disconnect(); } catch (_) { /* Optional. */ }
      try { copy(); } catch (_) { /* Never break the surrounding portfolio. */ }
    }

    function safe(action) {
      return function (event) {
        try { action(event); }
        catch (_) { failOpen(); }
      };
    }

    function canMove() {
      return automaticAvailable && !reduced && stage && inViewport && pageActive
        && !printing && !document.hidden && !root.hidden && root.isConnected !== false
        && disclosure && disclosure.open
        && !(document.body && document.body.classList.contains("modal-open"));
    }

    function eligible() {
      return canMove() && !paused && !pointerHover && !mouseHover
        && !focusInside && !inside(document.activeElement);
    }

    function reconcile() {
      stop();
      if (!canMove()) {
        nextAutoAt = null;
        settleTransition();
        return;
      }
      const time = now();
      if (!eligible()) {
        nextAutoAt = null;
      } else if (nextAutoAt === null) nextAutoAt = time + 2000;
      const due = transition ? Math.min(transition.finishAt, nextAutoAt ?? Infinity) : nextAutoAt;
      if (due === null) return;
      // One timer handles the transition escape hatch and the next auto start.
      timer = window.setTimeout(safe(() => {
        timer = null;
        if (!canMove()) { reconcile(); return; }
        const tickTime = now();
        if (transition && tickTime >= transition.finishAt) settleTransition();
        if (eligible() && nextAutoAt !== null && tickTime >= nextAutoAt) {
          nextAutoAt = tickTime + 2000;
          show(current + 1, 1);
        }
        reconcile();
      }), Math.max(0, due - time));
    }

    function navigate(direction) {
      stop();
      nextAutoAt = null;
      show(current + direction, direction);
      reconcile();
    }

    const controller = { copy: safe(copy) };
    mounted.set(root, controller);
    controllers.add(controller);

    safe(() => {
      show(0);
      previous.addEventListener("click", safe(() => navigate(-1)));
      next.addEventListener("click", safe(() => navigate(1)));
      toggle.addEventListener("click", safe(() => {
        paused = !paused;
        if (paused) { nextAutoAt = null; settleTransition(); }
        copy();
        reconcile();
      }));
      root.addEventListener("animationend", safe((event) => {
        if (transition && event.target === transition.incoming && event.animationName === transition.animationName) {
          settleTransition();
          reconcile();
        }
      }));
      root.addEventListener("pointerenter", safe(() => { pointerHover = true; reconcile(); }));
      root.addEventListener("pointerleave", safe(() => { pointerHover = false; reconcile(); }));
      root.addEventListener("mouseenter", safe(() => { mouseHover = true; reconcile(); }));
      root.addEventListener("mouseleave", safe(() => { mouseHover = false; reconcile(); }));
      root.addEventListener("focusin", safe(() => { focusInside = true; reconcile(); }));
      root.addEventListener("focusout", safe((event) => {
        focusInside = inside(event.relatedTarget);
        reconcile();
        // activeElement may still be the old button during focusout dispatch.
        if (!focusInside) Promise.resolve().then(safe(reconcile));
      }));
      if (disclosure) disclosure.addEventListener("toggle", safe(reconcile));
      document.addEventListener("visibilitychange", safe(reconcile));
      window.addEventListener("pagehide", safe(() => { pageActive = false; reconcile(); }));
      window.addEventListener("pageshow", safe(() => { pageActive = true; reconcile(); }));
      window.addEventListener("beforeprint", safe(() => { printing = true; reconcile(); }));
      window.addEventListener("afterprint", safe(() => { printing = false; reconcile(); }));

      try {
        if (stage && typeof window.matchMedia === "function" && typeof window.IntersectionObserver === "function"
          && typeof window.setTimeout === "function" && typeof window.clearTimeout === "function") {
          const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
          reduced = motion.matches;
          const onMotion = safe((event) => { reduced = event.matches; copy(); reconcile(); });
          if (typeof motion.addEventListener === "function") motion.addEventListener("change", onMotion);
          else if (typeof motion.addListener === "function") motion.addListener(onMotion);
          else throw new Error("Motion preference changes unavailable");
          intersection = new window.IntersectionObserver(safe((entries) => {
            entries.forEach((entry) => {
              if (entry.target === root) inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.1;
            });
            reconcile();
          }), { threshold: 0.1 });
          automaticAvailable = true;
          intersection.observe(root);
        }
      } catch (_) { failOpen(); }

      // Modal observation is optional; the timer also checks modal state.
      try {
        if (automaticAvailable && typeof window.MutationObserver === "function" && document.body) {
          modalObserver = new window.MutationObserver(safe(reconcile));
          modalObserver.observe(document.body, { attributes: true, attributeFilter: ["class"] });
        }
      } catch (_) {
        try { if (modalObserver) modalObserver.disconnect(); } catch (_) { /* Optional. */ }
      }
      copy();
      previous.disabled = false;
      next.disabled = false;
      toggle.disabled = false;
    })();
  }

  window.mountDeepcatchReportCarousel = (root) => {
    try { mount(root); } catch (_) { /* Incomplete optional markup is harmless. */ }
  };
  window.renderDeepcatchReportCarouselCopy = () => controllers.forEach(controller => controller.copy());
  try { window.mountDeepcatchReportCarousel(document.getElementById("deepcatch-report-carousel")); }
  catch (_) { /* The renderer may mount the reports later. */ }
})();
