/* Silent throws every 15 visible seconds or on native button activation. */
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
    let nextDue = null;
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
      const pending = timer;
      timer = null;
      if (pending !== null) window.clearTimeout(pending);
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

    function suspend() {
      nextDue = null;
      settle();
    }

    function failOpen() {
      effectsEnabled = false;
      nextDue = null;
      try {
        settle();
        button.classList.remove("is-throwing");
        button.classList.add("is-landed");
      } catch (_) { /* Cleanup errors must not escape into the portfolio. */ }
    }

    // Optional browser features may fail in restricted or older environments.
    // Keep native manual selection working with a static pose in that case.
    function guarded(action) {
      return function (event) {
        try {
          action(event);
        } catch (_) {
          failOpen();
        }
      };
    }

    function eligible() {
      return pageActive && !printing && !document.hidden && inViewport;
    }

    function readNow() {
      const time = window.performance && typeof window.performance.now === "function"
        ? window.performance.now() : Date.now();
      if (!Number.isFinite(time)) throw new Error("Clock unavailable");
      return time;
    }

    function finish() {
      settle();
      resumeAuto();
    }

    function play() {
      if (running || !pageActive || printing || document.hidden) return;
      clearTimer();
      nextDue = null;
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

      nextDue = readNow() + 15000;
      running = true;
      button.setAttribute("aria-disabled", "true");
      renderCopy();
      // Commit the reset before restarting the same CSS animation.
      void button.offsetWidth;
      // One escape hatch covers a missing/cancelled CSS animationend.
      timer = window.setTimeout(guarded(finish), 1400);
      button.classList.add("is-throwing");
    }

    function resumeAuto() {
      if (reduced || !effectsEnabled || !eligible()) {
        nextDue = null;
        return;
      }
      if (timer !== null || running) return;
      const time = readNow();
      if (nextDue === null) nextDue = time + 15000;
      // The finish fallback and the next automatic throw share one timer.
      timer = window.setTimeout(guarded(() => {
        timer = null;
        if (!reduced && effectsEnabled && eligible()) play();
        else suspend();
      }), Math.max(0, nextDue - time));
    }

    const copyCallback = guarded(renderCopy);
    window.renderPortfolioThrowCopy = copyCallback;
    button.addEventListener("click", guarded(play));
    button.addEventListener("animationend", guarded((event) => {
      if (running && event.target === block && event.animationName === "tech-throw-block") finish();
    }));
    document.addEventListener("visibilitychange", guarded(() => {
      if (document.hidden) suspend();
      else resumeAuto();
    }));
    window.addEventListener("pagehide", guarded(() => {
      pageActive = false;
      suspend();
    }));
    window.addEventListener("pageshow", guarded(() => {
      pageActive = true;
      resumeAuto();
    }));
    window.addEventListener("beforeprint", guarded(() => {
      printing = true;
      suspend();
    }));
    window.addEventListener("afterprint", guarded(() => {
      printing = false;
      resumeAuto();
    }));

    try {
      if (typeof window.matchMedia === "function" && typeof window.IntersectionObserver === "function"
        && typeof window.setTimeout === "function" && typeof window.clearTimeout === "function") {
        motion = window.matchMedia("(prefers-reduced-motion: reduce)");
        reduced = motion.matches;
        const onMotionChange = guarded((event) => {
          reduced = event.matches;
          if (reduced) suspend();
          else resumeAuto();
        });
        if (typeof motion.addEventListener === "function") motion.addEventListener("change", onMotionChange);
        else if (typeof motion.addListener === "function") motion.addListener(onMotionChange);
        else throw new Error("Motion preference changes unavailable");

        observer = new window.IntersectionObserver(guarded((entries) => {
          entries.forEach((entry) => {
            if (entry.target !== root) return;
            inViewport = entry.isIntersecting && entry.intersectionRatio > 0;
            if (!inViewport) suspend();
            else resumeAuto();
          });
        }), { threshold: 0 });
        effectsEnabled = true;
        observer.observe(root);
      }
    } catch (_) {
      failOpen();
      if (observer) {
        try { observer.disconnect(); } catch (_) { /* Static manual fallback. */ }
      }
    }

    renderCopy();
    button.setAttribute("aria-disabled", "false");
    button.disabled = false;
    hint.hidden = false;
  } catch (_) {
    // An incomplete optional DOM must never affect the portfolio itself.
  }
})();
