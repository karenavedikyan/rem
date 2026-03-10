import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();

const checks = [];
const errors = [];

const addCheck = (label, pass, weight = 10) => {
  checks.push({ label, pass, weight });
  if (!pass) errors.push(label);
};

const main = async () => {
  const indexPath = path.join(root, "index.html");
  const contactsPath = path.join(root, "contacts", "index.html");

  const [indexHtml, contactsHtml] = await Promise.all([
    fs.readFile(indexPath, "utf8"),
    fs.readFile(contactsPath, "utf8"),
  ]);

  addCheck("Hero KPI opens request form", /id=["']hero-kpi-open-request["']/.test(indexHtml), 20);
  addCheck("Request CTA exists", /id=["']request-open-btn["']/.test(indexHtml), 20);
  addCheck("Request form exists", /id=["']request-form["']/.test(indexHtml), 20);
  addCheck("Hero KPI links to navigator", /href=["']\.\/navigator\/["']/.test(indexHtml), 15);
  addCheck("Hero KPI links to catalog", /href=["']\.\/catalog\/["']/.test(indexHtml), 15);
  addCheck("Sticky mobile CTA exists", /id=["']home-sticky-cta["']/.test(indexHtml), 10);
  addCheck("Contacts page has feedback form", /id=["']feedback-form["']/.test(contactsHtml), 20);

  const maxScore = checks.reduce((sum, item) => sum + item.weight, 0);
  const score = checks.reduce((sum, item) => sum + (item.pass ? item.weight : 0), 0);

  console.log("RemCard conversion funnel audit");
  for (const item of checks) {
    const status = item.pass ? "PASS" : "FAIL";
    console.log(`- [${status}] ${item.label}`);
  }
  console.log(`\nScore: ${score}/${maxScore}`);

  if (errors.length > 0) {
    console.error("\nMissing critical funnel points:");
    for (const err of errors) console.error(`  - ${err}`);
    process.exitCode = 1;
    return;
  }

  console.log("\nConversion funnel is healthy.");
};

main().catch((err) => {
  console.error("Conversion funnel audit failed:", err);
  process.exitCode = 1;
});
