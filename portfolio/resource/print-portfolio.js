/* Print the selected cases and contribution boundaries from the website. */
(() => {
  const root = document.createElement("div");
  root.id = "print-portfolio";
  root.className = "print-portfolio";
  document.body.append(root);
  const e = escapeXml;
  const pairs = (rows) => `<dl class="print-pairs">${rows.map(([title, body]) => `<div><dt>${e(title)}</dt><dd>${e(body)}</dd></div>`).join("")}</dl>`;
  const figure = (src, caption, type = "") => `<figure class="print-figure ${type}"><img loading="lazy" decoding="async" src="${e(src)}" alt="${e(caption)}"><figcaption>${e(caption)}</figcaption></figure>`;

  // Print has its own concise copy; the complete web and gallery evidence is unchanged.
  const overviewSummaries = {
    ko: "C++/Qt 기반 Windows 의료영상 클라이언트·자동화와 장비 연동 개발. 총경력 6년 9개월(2026.10 기준).",
    en: "C++/Qt Windows medical-imaging clients, automation and device integration. 6 years 9 months of experience as of Oct 2026."
  };
  const summaryLabels = { ko: ["역할", "주요 구현", "결과"], en: ["Role", "Implementation", "Result"] };
  const printSummaries = {
    ko: {
      deepcatch: [
        "기존 MVVM 기본 구조를 바탕으로 DeepCatch X 주요 클라이언트 기능 개발.",
        "영상 합성·리포트 PDF 출력, Action/Command·Queue 기반 분석 자동화.",
        "기관별 설정·배포 결과물 검증 및 최초 배포 담당."
      ],
      autotest: [
        "Qt Widgets UI 기록·재생과 로그 분석을 신규 설계·구현.",
        "QThread 반복 실행·오류 위치 기록. 기존 설치 파일 생성·자동 설치는 이슈 수정·마이그레이션 참여.",
        "반복 시험으로 수십 건의 크래시·기능 오류 발견, TeamCity·결과 메일로 일일 공유."
      ],
      medipmacro: [
        "다중 파일 순차 분석·Export Macro 개발.",
        "Action/Command로 파일별 실패 격리, NII·STL·OBJ·CSV 출력.",
        "실패한 파일만 Failed로 기록 후 다음 파일 계속 처리, 상태·메시지는 JSONL 기록."
      ],
      pacs: [
        "기존 Query/Retrieve·검색/다운로드·DICOM 송수신 이슈 보완.",
        "DCMTK 기반 비동기 C-ECHO 추가. 서버 연결 확인용이며 검색·전송은 기존 기능 보완 범위.",
        "기관별 설정·통신 오류 개선, UI에서 서버 연결 상태 확인."
      ],
      validation: [
        "DeepCatch X 인허가용 소프트웨어 Validation 문서 작성.",
        "검증 대상·시험 항목과 기능 확인 내용 정리.",
        "시험 결과·검증 기록을 Software Validation Report(SVR)로 문서화."
      ],
      impeach: [
        "IMPEACH에서 비의료 장비 AMX 통합 제어·WATCHOUT 연동 개발.",
        "Python/Qt 장비 테스트 앱과 TCP/IP·Serial 명령/응답 처리.",
        "연결 상태·통신 예외 처리와 현장 검증."
      ]
    },
    en: {
      deepcatch: [
        "Developed key DeepCatch X client features on an existing MVVM foundation.",
        "Image compositing, report PDF output, and Action/Command queue-based analysis automation.",
        "Validated institution-specific settings and deployment artifacts, and handled the initial release."
      ],
      autotest: [
        "Designed and built Qt Widgets UI recording/replay and log analysis from scratch.",
        "QThread repeat execution and failure-location logging. Existing installer generation/auto-install work was limited to issue fixes and migration participation.",
        "Found dozens of crashes and functional errors; shared daily results via TeamCity and email."
      ],
      medipmacro: [
        "Built a Macro for sequential multi-file analysis and export.",
        "Per-file failure isolation with Action/Command; NII, STL, OBJ and CSV output.",
        "Marked only the failed file as Failed and continued with the next; recorded status and messages in JSONL."
      ],
      pacs: [
        "Maintained existing Query/Retrieve, search/download and DICOM send/receive code.",
        "Added asynchronous DCMTK C-ECHO for server connectivity checks; search/transfer remained existing-function maintenance.",
        "Improved institution-specific settings and communication errors; exposed connection status in the UI."
      ],
      validation: [
        "Authored DeepCatch X software Validation documentation for regulatory submission.",
        "Organized validation scope, test items and functional checks.",
        "Documented test results and verification records in the Software Validation Report (SVR)."
      ],
      impeach: [
        "Developed non-medical AMX device control and WATCHOUT integration at IMPEACH.",
        "Python/Qt device test apps and TCP/IP/Serial command/response handling.",
        "Connection-state and communication-exception handling, plus field testing."
      ]
    }
  };

  window.renderPortfolioPrint = () => {
    const ko = activeLanguage === "ko";
    const t = pageTranslations[activeLanguage];
    const text = (a, b) => ko ? a : b;
    const sections = [{
      id: "overview",
      content: `<h1>${text("한재성", "JaeSung Han")}</h1>
        <p class="print-meta">C++ / Qt Application Engineer</p>
        <p>${e(overviewSummaries[activeLanguage])}</p>
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
          ${images}${pairs(printSummaries[activeLanguage][item.id].map((body, index) => [summaryLabels[activeLanguage][index], body]))}`
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
