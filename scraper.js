import puppeteer from "puppeteer";
import fs from "fs";
import Fuse from "fuse.js";

async function getPartners(page) {
  await page.goto("https://www.opentext.com/partners/partner-directory", { waitUntil: "networkidle2" });
  const partners = await page.evaluate(() =>
    Array.from(document.querySelectorAll("a"))
      .map(a => a.innerText.trim())
      .filter(name => name.length > 2)
  );
  return [...new Set(partners)];
}

async function getSolutions(page) {
  await page.goto("https://www.opentext.com/products-and-solutions/partners-and-alliances/partner-solutions-catalog", { waitUntil: "networkidle2" });
  const solutions = await page.evaluate(() =>
    Array.from(document.querySelectorAll(".card, .solution-card")).map(el => {
      const text = el.innerText.trim();
      const [partner, ...rest] = text.split("–");
      return { partner: partner.trim(), solution: rest.join("–").trim() || text };
    })
  );
  return solutions;
}

function joinData(partners, solutions) {
  const fuse = new Fuse(partners, { includeScore: true, threshold: 0.5 });
  return solutions.map(sol => {
    const result = fuse.search(sol.partner)[0];
    if (result && result.score <= 0.5) {
      return { partner: result.item, solution: sol.solution };
    }
    return null;
  }).filter(Boolean);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const partners = await getPartners(page);
  const solutions = await getSolutions(page);
  const joined = joinData(partners, solutions);
  await browser.close();
  fs.writeFileSync("output.json", JSON.stringify(joined, null, 2));
  console.log("✅ Done. See output.json");
})();
