/**
 * Mock sensor simulator — streams fake ESP32 readings to the running Next.js
 * dev server via the /api/mock/inject endpoint.
 *
 * Usage:
 *   npx tsx scripts/mock-sensor.ts [options]
 *
 * Options:
 *   --scenario   normal | prevention | caution | repositionnement | urgence  (default: normal)
 *   --patient    Patient ID                                                   (default: 7724)
 *   --position   dorsal | lateral_droit | lateral_gauche | prone             (default: dorsal)
 *   --interval   Milliseconds between readings                               (default: 3000)
 *   --count      Total readings to send (0 = infinite)                       (default: 0)
 *   --url        Base URL of the Next.js server                              (default: http://localhost:3000)
 *   --escalate   Auto-escalate scenario every N readings for demo purposes   (default: 0 = off)
 *
 * Examples:
 *   # Stream normal readings every 3s
 *   npx tsx scripts/mock-sensor.ts
 *
 *   # Send 20 "urgence" readings quickly and exit
 *   npx tsx scripts/mock-sensor.ts --scenario urgence --count 20 --interval 500
 *
 *   # Auto-escalate: normal → prevention → caution → repositionnement → urgence
 *   npx tsx scripts/mock-sensor.ts --escalate 5
 */

const SCENARIOS = ["normal", "prevention", "caution", "repositionnement", "urgence"] as const;
type Scenario = (typeof SCENARIOS)[number];

// ─── Parse CLI args ───────────────────────────────────────────────────────────
function getArg(name: string, fallback: string): string {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

const BASE_URL   = getArg("url",      "http://localhost:3000");
const patient_id = getArg("patient",  "7724");
const position   = getArg("position", "dorsal");
const interval   = parseInt(getArg("interval",  "3000"), 10);
const count      = parseInt(getArg("count",     "0"),    10);
const escalate   = parseInt(getArg("escalate",  "0"),    10);
let   scenario   = getArg("scenario", "normal") as Scenario;

const ENDPOINT = `${BASE_URL}/api/mock/inject`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const RESET  = "\x1b[0m";
const GREEN  = "\x1b[32m";
const YELLOW = "\x1b[33m";
const RED    = "\x1b[31m";
const CYAN   = "\x1b[36m";
const BOLD   = "\x1b[1m";
const DIM    = "\x1b[2m";

function scoreColor(score: number) {
  if (score >= 70) return GREEN;
  if (score >= 40) return YELLOW;
  return RED;
}

function scenarioColor(s: Scenario) {
  switch (s) {
    case "normal":           return GREEN;
    case "prevention":       return CYAN;
    case "caution":          return YELLOW;
    case "repositionnement": return "\x1b[35m"; // magenta
    case "urgence":          return RED;
  }
}

function pad(n: number, width = 5) {
  return String(Math.round(n)).padStart(width);
}

// ─── Main loop ────────────────────────────────────────────────────────────────
let sent = 0;
let scenarioIdx = SCENARIOS.indexOf(scenario);

console.log(`\n${BOLD}DermaSense Mock Sensor Simulator${RESET}`);
console.log(`${DIM}Endpoint : ${ENDPOINT}${RESET}`);
console.log(`${DIM}Patient  : ${patient_id}${RESET}`);
console.log(`${DIM}Position : ${position}${RESET}`);
console.log(`${DIM}Interval : ${interval}ms${RESET}`);
console.log(`${DIM}Count    : ${count === 0 ? "∞" : count}${RESET}`);
console.log(`${DIM}Escalate : ${escalate > 0 ? `every ${escalate} readings` : "off"}${RESET}`);
console.log("─".repeat(60));

async function sendReading() {
  const ts = Date.now();

  // Auto-escalate
  if (escalate > 0 && sent > 0 && sent % escalate === 0) {
    scenarioIdx = Math.min(scenarioIdx + 1, SCENARIOS.length - 1);
    scenario = SCENARIOS[scenarioIdx];
    console.log(`\n${YELLOW}⚡ Escalating scenario → ${scenarioColor(scenario)}${BOLD}${scenario}${RESET}\n`);
  }

  const body = {
    patient_id,
    pos: position,
    scenario, // hint consumed by mock inject route for matrix generation
  };

  try {
    const res = await fetch(ENDPOINT, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`${RED}✗ [${sent + 1}] HTTP ${res.status}: ${err}${RESET}`);
      return;
    }

    const data = await res.json() as {
      ok: boolean;
      safety_score: number;
      zones: Record<string, { avg: number; max: number }>;
      position: string;
    };

    sent++;
    const elapsed = Date.now() - ts;
    const sc = scenarioColor(scenario);
    const color = scoreColor(data.safety_score);

    const zones = data.zones;
    const zoneStr = Object.entries(zones)
      .map(([k, v]) => `${k.slice(0, 4)}:${pad(v.avg)}/${pad(v.max)}`)
      .join("  ");

    console.log(
      `${DIM}[${new Date().toLocaleTimeString()}]${RESET} ` +
      `#${String(sent).padStart(3)}  ` +
      `${sc}${BOLD}${scenario.padEnd(16)}${RESET} ` +
      `score:${color}${BOLD}${String(Math.round(data.safety_score)).padStart(3)}${RESET} ` +
      `${DIM}${zoneStr}${RESET}  ` +
      `${DIM}(${elapsed}ms)${RESET}`
    );
  } catch (err) {
    console.error(`${RED}✗ Network error — is the dev server running at ${BASE_URL}?${RESET}`);
    console.error(`  ${DIM}${(err as Error).message}${RESET}`);
  }
}

async function run() {
  await sendReading();

  if (count !== 0 && sent >= count) {
    console.log(`\n${GREEN}✓ Done — sent ${sent} reading(s).${RESET}\n`);
    process.exit(0);
  }

  const timer = setInterval(async () => {
    await sendReading();

    if (count !== 0 && sent >= count) {
      clearInterval(timer);
      console.log(`\n${GREEN}✓ Done — sent ${sent} reading(s).${RESET}\n`);
      process.exit(0);
    }
  }, interval);

  // Graceful shutdown
  process.on("SIGINT", () => {
    clearInterval(timer);
    console.log(`\n${YELLOW}Stopped after ${sent} reading(s).${RESET}\n`);
    process.exit(0);
  });
}

run();
