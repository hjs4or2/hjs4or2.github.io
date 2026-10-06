/* Submission pages share the website's current language and project content. */
(() => {
  const root = document.createElement("div");
  root.id = "print-portfolio";
  root.className = "print-portfolio";
  document.body.append(root);
  const e = escapeXml;
  const pairs = (rows) => `<dl class="print-pairs">${rows.map(([title, body]) => `<div><dt>${e(title)}</dt><dd>${e(body)}</dd></div>`).join("")}</dl>`;
  const figure = (src, caption, type = "") => `<figure class="print-figure ${type}"><img src="${e(src)}" alt="${e(caption)}"><figcaption>${e(caption)}</figcaption></figure>`;

  window.renderPortfolioPrint = () => {
    const ko = activeLanguage === "ko";
    const t = pageTranslations[activeLanguage];
    const p = projectPreviews;
    const text = (a, b) => ko ? a : b;
    const work = (id) => t.work.projects.find((item) => item.id === id);
    const head = (label, title, meta = "") => `<span class="print-kicker">${e(label)}</span><h2>${e(title)}</h2><p class="print-meta">${e(meta)}</p>`;
    const outcome = (id) => `<p class="print-outcome"><strong>${e(t.outcomeLabel)}</strong> ${e(work(id).outcome)}</p>`;
    const sections = [];

    sections.push(`<span class="print-kicker">C++ / Qt APPLICATION ENGINEER</span>
      <h1>${text("한재성", "JaeSung Han")}</h1><p>${e(t.summaryText)}</p>
      <p class="print-meta">${text("2026.09 기준 경력 6년 8개월 · Windows 애플리케이션 · 의료영상 / 장비 연동", "6 years 8 months as of Sep 2026 · Windows applications · Medical imaging / device integration")}</p>
      <h3>${text("주요 작업", "Selected projects")}</h3>
      <div class="print-index">${t.work.projects.map((item, i) => `<div><strong>0${i + 1}</strong><div><b>${e(item.title)}</b><p>${e(item.outcome)}</p></div></div>`).join("")}</div>
      <h3>${e(t.experience.title)}</h3>${pairs(t.experience.cards.map(([period, title, body]) => [title + " · " + period, body]))}
      <h3>${e(t.stack.title)}</h3><p>${e(t.stack.groups.map(([title, values]) => values.slice(0, 4).join(" / ")).join(" · "))}</p>
      <p class="print-meta">${text("연락처: 이력서에 기재된 연락처로 연락 부탁드립니다.", "Contact: Please use the contact details provided in my resume.")}</p>`);

    const dcDetails = p.deepcatch.details;
    sections.push(head("01 / CLIENT DEVELOPMENT", p.deepcatch.title, p.deepcatch.meta)
      + `<p>${e(p.deepcatch.description)}</p>` + outcome("deepcatch")
      + pairs([dcDetails[1], dcDetails[3], dcDetails[4], dcDetails[5], dcDetails[8]])
      + figure("resource/04/02_릴리즈_전_동작_확인.gif", text("DeepCatch X 클라이언트 화면 · 원본은 동작 영상", "DeepCatch X client view · still from the original animation"))
      + `<p class="print-meta">${e(p.deepcatch.labels.join(" / "))}</p>`);

    sections.push(head("01 / PRODUCT OPERATIONS", text("제품 적용 현황(회사 집계)", "Product adoption (company-reported)"), "2025.08 - 2026.07")
      + `<p>${e(work("deepcatch").context)}</p>`
      + figure("resource/products/deepcatch-usage.png", text("DCX 월별 사용량 (2025.08~2026.07)", "Monthly DCX usage (Aug 2025-Jul 2026)"), "is-wide")
      + `<p class="print-outcome">${text("제품 전체 DCX 사용량(회사 집계): 2025년 8월 1,037 → 2026년 7월 9,490. 시작 월 대비 약 9.2배입니다.", "Company-reported product-wide DCX usage: 1,037 in August 2025 → 9,490 in July 2026, approximately 9.2 times the starting value.")}</p>`
      + figure("resource/products/deepcatch-screening-site.png", text("한국건강관리협회 검진 현장", "Korea Association of Health Promotion screening site")));

    sections.push(head("01 / REPORT OUTPUT", text("검진 결과와 추적관리 보고서", "Screening and follow-up reports"))
      + `<p>${text("기관별 결과 리포트의 활용 예시입니다. 기존 흉부 X-ray의 분석 결과를 심장·대동맥 보고서와 심폐 건강나이 평가로 전달하는 흐름을 보여줍니다.", "Examples of institution-specific reports showing how chest X-ray results are presented as heart/aorta findings and cardiopulmonary health age assessments.")}</p>`
      + `<div class="print-columns">${figure("resource/products/deepcatch-cardiovascular-report.png", text("심장·대동맥 보고서 예시", "Heart and aorta report example"), "is-report")}${figure("resource/products/deepcatch-health-age-report.png", text("심폐 건강나이 보고서 예시", "Cardiopulmonary health age report example"), "is-report")}</div>`
      + `<p class="print-source">${text("관련 제품군의 CT 보고서는 체성분의 변화 추적과 건강관리 활용 예시입니다.", "CT reports from the related product family illustrate body composition follow-up and health management applications.")}</p>`);

    sections.push(head("02 / UI AUTOMATION", p.autotest.title, p.autotest.meta)
      + `<p>${e(p.autotest.description)}</p>` + outcome("autotest")
      + pairs(p.autotest.details.slice(1))
      + figure("resource/05/01_AutoTest_결과_메일전송.png", text("Windows Qt UI 자동 테스트 결과 메일과 실패 위치 공유", "Windows Qt UI test result email and failure reporting"), "is-wide")
      + `<p class="print-meta">C++ / Qt / UI Automation / TeamCity</p>`);

    sections.push(head("03 / BATCH PROCESSING", p.medipmacro.title, p.medipmacro.meta)
      + `<p>${e(p.medipmacro.description)}</p>` + outcome("medipmacro")
      + pairs([p.medipmacro.details[1], p.medipmacro.details[3], p.medipmacro.details[5]])
      + figure("resource/07/02_MEDIP_Macro_옵션_구성.png", text("분석·Export 실행 옵션", "Analysis and export options"), "is-compact")
      + figure("resource/07/03_MEDIP_Macro_실행_상태.png", text("파일별 실행 상태와 실패 메시지", "Per-file execution status and failure messages"), "is-compact"));

    sections.push(head("04 / DICOM INTEGRATION", p.pacs.title, p.pacs.meta)
      + `<p>${e(p.pacs.description)}</p>` + outcome("pacs")
      + pairs(p.pacs.details.slice(1))
      + figure(ko ? "resource/03/00_PACS_Stabilization.png" : "resource/03/00_PACS_Stabilization_en.png", text("기존 연동 안정화와 C-ECHO 구현 범위", "Existing integration stabilization and C-ECHO scope"), "is-wide")
      + `<p class="print-meta">C++ / Qt / DCMTK / DICOM C-ECHO / PACS</p>`);

    const previous = t.experience.cards[1];
    sections.push(head("05 / DEVICE INTEGRATION", previous[1], previous[0])
      + `<p>${e(previous[2])}</p>`
      + figure("resource/impeach/jw-marriott-main.png", text("JW Marriott 통합 제어 화면", "JW Marriott integrated control interface"), "is-wide")
      + figure("resource/impeach/the-arc-main.jpg", text("THE ARC 장비 제어 화면", "THE ARC device control interface"), "is-wide")
      + `<p class="print-meta">Python / Qt / AMX / TCP/IP / Serial / WATCHOUT</p>`);

    sections.push(head("06 / COLLABORATION", t.collaboration.title)
      + `<p>${e(t.collaboration.body)}</p>`
      + pairs(t.collaboration.cards));

    root.innerHTML = sections.map((content, i) => `<article class="print-page">${content}<footer class="print-footer"><span>${e(t.brand)}</span><span>${i + 1} / ${sections.length}</span></footer></article>`).join("");
  };

  window.preparePortfolioPrint = async () => {
    if (lightbox.getAttribute("aria-hidden") === "false") closeLightbox();
    window.renderPortfolioPrint();
    await Promise.all([...root.querySelectorAll("img")].map((img) => img.decode().catch(() => {})));
    await document.fonts.ready;
  };
  window.addEventListener("beforeprint", () => {
    if (lightbox.getAttribute("aria-hidden") === "false") closeLightbox();
  });
  window.renderPortfolioPrint();
})();
