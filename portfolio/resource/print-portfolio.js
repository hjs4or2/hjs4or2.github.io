/* Print the selected cases and contribution boundaries from the website. */
(() => {
  const root = document.createElement("div");
  root.id = "print-portfolio";
  root.className = "print-portfolio";
  document.body.append(root);
  const e = escapeXml;
  const pairs = (rows) => `<dl class="print-pairs">${rows.map(([title, body]) => `<div><dt>${e(title)}</dt><dd>${e(body)}</dd></div>`).join("")}</dl>`;
  const figure = (src, caption, type = "") => `<figure class="print-figure ${type}"><img loading="lazy" decoding="async" src="${e(src)}" alt="${e(caption)}"><figcaption>${e(caption)}</figcaption></figure>`;

  window.renderPortfolioPrint = () => {
    const ko = activeLanguage === "ko";
    const t = pageTranslations[activeLanguage];
    const text = (a, b) => ko ? a : b;
    const sections = [{
      id: "overview",
      content: `<h1>${text("한재성", "JaeSung Han")}</h1>
        <p class="print-meta">C++ / Qt Application Engineer</p>
        <p>${e(t.summaryText)}</p>
        <h3>${e(t.profileLabel)}</h3>
        ${pairs(t.profileRows)}
        <h3>${e(t.work.title)}</h3>
        <div class="print-index">${t.work.projects.map((item) => `<div><b>${e(item.title)}</b><p>${e(item.role)}</p></div>`).join("")}</div>
        <h3>${e(t.experience.title)}</h3>
        ${pairs(t.experience.cards.map(([period, title]) => [period, title]))}
        <p class="print-source">${e(t.work.notice)}</p>`
    }];

    t.work.projects.forEach((item) => {
      const project = projectPreviews[item.id];
      const images = figure(project.previewImage, item.cardBody, item.id === "validation" ? "is-document" : "");
      sections.push({
        id: item.id,
        content: `<h2>${e(item.title)}</h2><p class="print-meta">${e([item.company, project.meta].filter(Boolean).join(" · "))}</p>
          ${images}${pairs(project.details)}`
      });
    });

    root.innerHTML = sections.map(({id, content}, i) =>
      `<article class="print-page${i ? " is-visual" : ""}" data-print-project="${id}">${content}<footer class="print-footer"><span>${e(t.brand)}</span><span>${i + 1} / ${sections.length}</span></footer></article>`
    ).join("");
  };

  window.preparePortfolioPrint = async () => {
    if (lightbox.getAttribute("aria-hidden") === "false") closeLightbox();
    window.renderPortfolioPrint();
    await Promise.all([...root.querySelectorAll("img")].map((img) => {
      img.loading = "eager";
      return img.decode().catch(() => {});
    }));
    await document.fonts.ready;
  };
  window.addEventListener("beforeprint", () => {
    if (lightbox.getAttribute("aria-hidden") === "false") closeLightbox();
    root.querySelectorAll("img").forEach((img) => { img.loading = "eager"; });
  });
  window.renderPortfolioPrint();
})();
