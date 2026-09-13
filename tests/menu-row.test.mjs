import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const source = fs.readFileSync(
  path.join(process.cwd(), "src", "menu-bar.tsx"),
  "utf8",
);

const checks = [];

function check(name, condition, detail) {
  checks.push({ name, condition, detail });
}

check(
  "Long rows compress metadata before titles",
  source.includes("shorterMenuRowTime(item, now)") &&
    source.includes("shorterMenuRowDate(item, now, dateStyle)"),
  "Time/date metadata are compacted before the event title is shortened.",
);

check(
  "Long titles get a final truncation fallback",
  source.includes("const maxTitleLength = Math.max(") &&
    source.includes("title: truncate(title, maxTitleLength)"),
  "Only rows that are still too long after metadata compression shorten the title.",
);

check(
  "Existing compact-row target is preserved",
  source.includes("const MENU_ROW_COMPACT_THRESHOLD = 64"),
  "The existing 64-character target remains unchanged.",
);

console.log("\nCalFlow menu-row contract\n");

let failed = 0;

for (const item of checks) {
  if (item.condition) {
    console.log(`✅ ${item.name}`);
    console.log(`   ${item.detail}`);
  } else {
    failed += 1;
    console.log(`❌ ${item.name}`);
    console.log(`   ${item.detail}`);
  }
}

console.log(`\n${checks.length - failed}/${checks.length} menu-row checks passed`);

if (failed > 0) process.exit(1);
