/* A single, silent throw on entry or native button activation. */
(() => {
  "use strict";

  try {
    const root = document.getElementById("hero-easter-egg");
    const button = document.getElementById("tech-throw-button");
    const icon = document.getElementById("tech-throw-icon");
    const name = document.getElementById("tech-throw-name");
    const hint = document.getElementById("tech-throw-hint");
    const taglineFirst = document.getElementById("tech-throw-tagline-first");
    const taglineSecond = document.getElementById("tech-throw-tagline-second");
    const block = button && button.querySelector(".throw-block");
    if (!root || !button || !icon || !name || !hint || !block) return;

    const skills = [
      ["C++", "brand-cplusplus"],
      ["Qt", "brand-qt"],
      ["Python", "brand-python"],
      ["MVVM", "concept-layers"],
      ["Action/Command", "concept-command"],
      ["TCP/IP", "concept-network"],
      ["Serial", "concept-serial"],
      ["DICOM", "concept-imaging"],
      ["DCMTK", "concept-medical-file"],
      ["AMX", "concept-controls"],
      ["QWebEngine", "brand-qt"],
      ["HTML/CSS", "brand-html5"],
      ["PDF/CSV", "concept-document"],
      ["JSON", "brand-json"],
      ["PostgreSQL", "brand-postgresql"],
      ["Qt SQL", "brand-qt"],
      ["TeamCity", "brand-teamcity"],
      ["Git/GitLab", "brand-git"]
    ];
    // Shuffle the throw order once; the decorative pile stays as authored.
    const queue = skills.map((_, index) => index).slice(1);
    for (let index = queue.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(Math.random() * (index + 1));
      [queue[index], queue[swap]] = [queue[swap], queue[index]];
    }
    let selected = 0;
    let hasPlayed = false;
    let running = false;
    let timer = null;
    let autoPending = true;
    let inViewport = false;
    let pageActive = true;
    let printing = false;
    let reduced = true;
    let effectsEnabled = false;
    let observer;
    let motion;

    function renderCopy() {
      const english = /^en(?:-|$)/i.test(document.documentElement.lang || "");
      const label = skills[selected][0];
      button.setAttribute("aria-label", english
        ? label + (running ? ": throwing. Click to throw again when finished." : ": click to throw again.")
        : label + (running ? ": 엎어치기 재생 중. 끝나면 클릭해서 다시 엎어치기." : ": 클릭해서 다시 엎어치기."));
      const first = english ? "Built in code," : "코드로 만들고,";
      const second = english ? "refined in the field." : "현장에서 완성합니다.";
      if (taglineFirst && taglineSecond) {
        taglineFirst.textContent = first;
        taglineSecond.textContent = second;
      } else {
        hint.textContent = first + " " + second;
      }
    }

    function clearTimer() {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    }

    function settle() {
      clearTimer();
      if (running) {
        running = false;
        button.classList.remove("is-throwing");
        button.classList.add("is-landed");
      }
      button.setAttribute("aria-disabled", "false");
      renderCopy();
    }

    // Optional browser features may fail in restricted or older environments.
    // Keep native manual selection working with a static pose in that case.
    function guarded(action) {
      return function (event) {
        try {
          action(event);
        } catch (_) {
          autoPending = false;
          effectsEnabled = false;
          settle();
        }
      };
    }

    function eligible() {
      return pageActive && !printing && !document.hidden && inViewport;
    }

    function play() {
      if (running || !pageActive || printing || document.hidden) return;
      // Manual interaction consumes the pending entry playback too.
      autoPending = false;
      clearTimer();
      // The first throw keeps the skill already held on screen. Later throws
      // promote the waiting head and send the previous skill to the tail.
      if (hasPlayed) {
        const previous = selected;
        selected = queue.shift();
        queue.push(previous);
      } else {
        hasPlayed = true;
      }
      icon.setAttribute("href", "resource/skill-icons.svg#" + skills[selected][1]);
      name.textContent = skills[selected][0];
      button.classList.remove("is-landed", "is-throwing");
      if (reduced || !effectsEnabled || !inViewport) {
        button.classList.add("is-landed");
        renderCopy();
        return;
      }

      running = true;
      button.setAttribute("aria-disabled", "true");
      renderCopy();
      // Commit the reset before restarting the same CSS animation.
      void button.offsetWidth;
      // One escape hatch covers a missing/cancelled CSS animationend.
      timer = window.setTimeout(guarded(settle), 1400);
      button.classList.add("is-throwing");
    }

    function resumePending() {
      if (!autoPending || timer !== null || running || reduced || !effectsEnabled || !eligible()) return;
      // intro.js has an 1800ms escape hatch; do not overlap its entrance.
      timer = window.setTimeout(guarded(() => {
        timer = null;
        if (autoPending && !reduced && effectsEnabled && eligible()) play();
      }), 1900);
    }

    const copyCallback = guarded(renderCopy);
    window.renderPortfolioThrowCopy = copyCallback;
    button.addEventListener("click", guarded(play));
    button.addEventListener("animationend", guarded((event) => {
      if (running && event.target === block && event.animationName === "tech-throw-block") settle();
    }));
    document.addEventListener("visibilitychange", guarded(() => {
      if (document.hidden) settle();
      else resumePending();
    }));
    window.addEventListener("pagehide", guarded(() => {
      pageActive = false;
      settle();
    }));
    window.addEventListener("pageshow", guarded(() => {
      pageActive = true;
      resumePending();
    }));
    window.addEventListener("beforeprint", guarded(() => {
      printing = true;
      settle();
    }));
    window.addEventListener("afterprint", guarded(() => {
      printing = false;
      resumePending();
    }));

    try {
      if (typeof window.matchMedia === "function" && typeof window.IntersectionObserver === "function") {
        motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        reduced = motion.matches;
        // Starting with reduced motion never schedules a later entry playback.
        if (reduced) autoPending = false;
        const onMotionChange = guarded((event) => {
          reduced = event.matches;
          if (reduced) {
            autoPending = false;
            settle();
          }
        });
        if (typeof motion.addEventListener === "function") motion.addEventListener("change", onMotionChange);
        else if (typeof motion.addListener === "function") motion.addListener(onMotionChange);
        else throw new Error("Motion preference changes unavailable");

        observer = new window.IntersectionObserver(guarded((entries) => {
          entries.forEach((entry) => {
            if (entry.target !== root) return;
            inViewport = entry.isIntersecting && entry.intersectionRatio > 0;
            if (!inViewport) settle();
            else resumePending();
          });
        }), { threshold: 0 });
        effectsEnabled = true;
        observer.observe(root);
      } else {
        autoPending = false;
      }
    } catch (_) {
      autoPending = false;
      effectsEnabled = false;
      if (observer) {
        try { observer.disconnect(); } catch (_) { /* Static manual fallback. */ }
      }
      settle();
    }

    renderCopy();
    button.setAttribute("aria-disabled", "false");
    button.disabled = false;
    hint.hidden = false;
  } catch (_) {
    // An incomplete optional DOM must never affect the portfolio itself.
  }
})();
