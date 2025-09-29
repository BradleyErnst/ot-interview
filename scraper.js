const puppeteer = require("puppeteer");
const fs = require("fs");

// ---------------------------------------------
// 1. SCRAPE PARTNERS
// ---------------------------------------------
async function getPartners(page) {
  await page.goto("https://www.opentext.com/partners/partner-directory", {
    waitUntil: "networkidle2",
  });

  // wait for JS-rendered content to load
  await page.waitForSelector("ul.filtered-search-results li div.card.card-body h3 a.more", { timeout: 5000 });

  return await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        "ul.filtered-search-results li div.card.card-body h3 a.more"
      )
    ).map(a => ({
      partner: a.innerText.trim()
    }));
  });
}

// ---------------------------------------------
// 2. SCRAPE SOLUTIONS
// ---------------------------------------------
async function getSolutions(page) {
  await page.goto(
    "https://www.opentext.com/products-and-solutions/partners-and-alliances/partner-solutions-catalog",
    { waitUntil: "networkidle2" }
  );

  // wait for JS-rendered content
  await page.waitForSelector("#resultsList li", { timeout: 5000 });

  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll("#resultsList li")).map(li => {
      const partnerAlt = li.querySelector("img.resultLogo")?.alt || "";
      const partner = partnerAlt.replace(/logo$/i, "").trim();

      const solution = li.querySelector("h3.text-lg.mb-1 a.more")?.innerText.trim();

      return {
        partner,
        solution
      };
    });
  });
}

// ---------------------------------------------
// 3. JOIN DATA
// ---------------------------------------------
function joinPartnersAndSolutions(partners, solutions) {
  const normalize = str => str.replace(/logo$/i, "").trim().toLowerCase();

  const partnerMap = new Map(
    partners.map(p => [normalize(p.partner), { partner: p.partner, solutions: [] }])
  );

  solutions.forEach(sol => {
    const key = normalize(sol.partner);
    if (partnerMap.has(key) && sol.solution) {
      partnerMap.get(key).solutions.push(sol.solution);
    }
  });

  return Array.from(partnerMap.values());
}

// ---------------------------------------------
// 4. MAIN
// ---------------------------------------------
(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const partners = await getPartners(page);
  const solutions = await getSolutions(page);

  const joined = joinPartnersAndSolutions(partners, solutions);

  fs.writeFileSync("output.json", JSON.stringify(joined, null, 2));

  console.log("Scrape complete! See output.json");
  await browser.close();
})();
