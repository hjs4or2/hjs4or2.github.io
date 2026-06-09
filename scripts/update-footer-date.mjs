import { readFileSync, writeFileSync } from "node:fs";

const indexPath = new URL("../index.html", import.meta.url);

function getSeoulDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}.${values.month}.${values.day}`;
}

const html = readFileSync(indexPath, "utf8");
const today = getSeoulDate();
const nextHtml = html.replace(
  /(의료영상 소프트웨어 개발 포트폴리오\s*·\s*)\d{4}\.\d{2}\.\d{2}(\s*기준)/u,
  `$1${today}$2`,
);

if (nextHtml === html) {
  if (!html.includes(today)) {
    console.error("footer date pattern was not found in index.html");
    process.exit(1);
  }
  process.exit(0);
}

writeFileSync(indexPath, nextHtml, "utf8");
