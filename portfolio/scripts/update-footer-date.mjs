import { readFileSync, writeFileSync } from "node:fs";

const indexPath = new URL("../index.html", import.meta.url);
const footerDatePattern = /(<div class="footer-note">[^<]*?)(\d{4}\.\d{2}\.\d{2})([^<]*<\/div>)/u;

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

if (!footerDatePattern.test(html)) {
  console.error("footer date pattern was not found in index.html");
  process.exit(1);
}

const nextHtml = html.replace(footerDatePattern, `$1${today}$3`);

if (nextHtml !== html) {
  writeFileSync(indexPath, nextHtml, "utf8");
}
