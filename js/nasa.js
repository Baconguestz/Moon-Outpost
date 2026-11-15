/* ==========================================================================
   Moon Outpost - NASA DONKI Space Weather API Integration
   ========================================================================== */

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtD = s => {
  const d = new Date(s);
  if (isNaN(d)) return "?";
  const o = { month: "short", day: "numeric" };
  if (d.getFullYear() != new Date().getFullYear()) o.year = "numeric";
  return d.toLocaleDateString(undefined, o);
};
const ymd = d => d.toISOString().slice(0, 10);

const NS = { st: "sample", flares: SAMPLE, cmes: 0, fast: 0, gst: [], sep: 0, at: 0, busy: false, i: Math.random() * 50 | 0 };

try {
  const s = JSON.parse(localStorage.getItem("moonOutpostNasa"));
  if (s && Array.isArray(s.fl)) {
    NS.flares = s.fl;
    NS.cmes = s.cm || 0;
    NS.fast = s.fast || 0;
    NS.gst = s.gst || [];
    NS.sep = s.sep || 0;
    NS.at = s.at || 0;
    NS.st = "cache";
  }
} catch (e) {}

const gj = async u => {
  const r = await fetch(u, { signal: AbortSignal.timeout ? AbortSignal.timeout(9000) : undefined });
  if (!r.ok) throw 0;
  return r.json();
};

async function loadNasa() {
  if (NS.busy) return;
  NS.busy = true;
  nasaRefresh();
  const e = new Date(), q = `startDate=${ymd(new Date(e - 29 * 864e5))}&endDate=${ymd(e)}`;
  for (const [b, k] of [["https://ccmc.gsfc.nasa.gov/DONKI-API/get/", ""], ["https://api.nasa.gov/DONKI/", "&api_key=DEMO_KEY"]]) {
    try {
      const [f, c, gs, sp] = await Promise.all([
        gj(`${b}FLR?${q}${k}`),
        gj(`${b}CME?${q}${k}`).catch(() => []),
        gj(`${b}GST?${q}${k}`).catch(() => []),
        gj(`${b}SEP?${q}${k}`).catch(() => [])
      ]);
      if (!Array.isArray(f)) throw 0;
      const fl = f.map(x => ({
        cls: String(x.classType || ""),
        t: x.peakTime || x.beginTime || "",
        loc: x.sourceLocation || "?",
        id: x.flrID || "",
        ar: x.activeRegionNum || 0
      })).filter(x => /^[CMX]\d/.test(x.cls)).sort((a, b) => new Date(b.t) - new Date(a.t));
      let fast = 0;
      const cm = Array.isArray(c) ? c : [];
      cm.forEach(m => (m.cmeAnalyses || []).forEach(a => { if (a.speed > fast) fast = a.speed; }));
      const gst = (Array.isArray(gs) ? gs : []).map(x => ({
        t: x.startTime || "",
        kp: Math.max(0, ...(x.allKpIndex || []).map(z => +z.kpIndex || 0))
      })).filter(x => x.kp >= 4).sort((a, b) => new Date(b.t) - new Date(a.t));
      NS.flares = fl;
      NS.cmes = cm.length;
      NS.fast = Math.round(fast);
      NS.gst = gst;
      NS.sep = Array.isArray(sp) ? sp.length : 0;
      NS.at = Date.now();
      NS.st = "live";
      try {
        localStorage.setItem("moonOutpostNasa", JSON.stringify({ fl, cm: NS.cmes, fast: NS.fast, gst, sep: NS.sep, at: NS.at }));
      } catch (_) {}
      break;
    } catch (_) {}
  }
  NS.busy = false;
  nasaRefresh();
}

function nasaRefresh() {
  if (typeof sideLive === "function") sideLive();
  if (typeof G !== "undefined" && G.ph == "menu" && typeof ui === "function") ui();
}

const pool = () => {
  const p = NS.flares.filter(f => /^[MX]/.test(f.cls));
  return p.length >= 3 ? p : NS.flares;
};

function flareFor(s) {
  const mx = (typeof G !== "undefined" && G.cfg) ? G.cfg.mx : 2;
  const ok = f => "CMX".indexOf(f.cls[0]) <= mx;
  let p = pool().filter(ok);
  if (!p.length) p = NS.flares.filter(ok);
  if (p.length) {
    const f = p[(NS.i++) % p.length];
    return { s, c: "CMX".indexOf(f.cls[0]), real: f };
  }
  const r = Math.random();
  return { s, c: Math.min(mx, r < .45 ? 0 : r < .85 ? 1 : 2) };
}

function mood() {
  if (NS.busy) return { e: "☎️", t: "Calling NASA…" };
  if (NS.st == "sample") return { e: "🤔", t: "I can't reach NASA right now, so here are old examples!" };
  const w = Date.now() - 7 * 864e5;
  const r = NS.flares.filter(f => new Date(f.t) > w);
  const x = r.filter(f => f.cls[0] == "X").length;
  const m = r.filter(f => f.cls[0] == "M").length;
  return x ? { e: "🤩", t: `The Sun is SUPER excited! ${x} giant flare${x > 1 ? "s" : ""} this week!` } :
    m > 1 ? { e: "😃", t: `The Sun is playful! ${m} medium flares this week.` } :
    { e: "😴", t: "The Sun is sleepy this week. Only tiny flares!" };
}

const flInfo = f => `${f.cls} flare · ${fmtD(f.t)} · Sun spot ${f.loc}${f.ar ? ` · region ${f.ar}` : ""}`;

const rScale = c => {
  const n = parseFloat(c.slice(1)) || 0;
  return c[0] == "X" ? (n >= 20 ? 5 : n >= 10 ? 4 : 3) : c[0] == "M" ? (n >= 5 ? 2 : 1) : 0;
};

const donkiInfo = () => `<p>🔭 <b>What is DONKI?</b> It is NASA's Space Weather Database (Database Of Notifications, Knowledge, Information). Scientists write down every Sun event there, like a diary of the Sun! <a href="https://ccmc.gsfc.nasa.gov/tools/DONKI/" target="_blank" rel="noopener noreferrer">🔗 Open DONKI</a></p>
<details class="ph" open><summary>⚡ FLR · Solar Flares</summary><p>Sorted by X-ray brightness: C is minor, M is moderate and X is major. M and X flares can cause radio blackouts and switch off electronics that have no shield.</p><p class="gm">🎮 In the game: flare warnings use real NASA flares. M and X make radio static, and your rover goes offline if the shield is weak.</p></details>
<details class="ph"><summary>🌪️ CME · Coronal Mass Ejections</summary><p>Giant clouds of Sun-stuff. NASA writes down their speed in km/s, how wide they are and where they are heading. They take hours to days to arrive, so there is time to get ready.</p><p class="gm">🎮 In the game: a CME countdown shows up. Be in the base with the shield on before it hits!</p></details>
<details class="ph"><summary>☢️ SEP · Solar Energetic Particles</summary><p>Super-fast tiny bits sent out by big solar events. They can hurt astronauts who are outside without a shield.</p><p class="gm">🎮 In the game: M and X flares drain your stamina and health when you are outside.</p></details>
<details class="ph"><summary>🌩️ GST · Geomagnetic Storms</summary><p>Measured with the Kp number from 0 to 9. Kp 5 is minor (G1), Kp 7 is strong (G3) and Kp 9 is extreme (G5). Big storms stress power grids, satellites and navigation.</p><p class="gm">🎮 In the game: a storm weakens your power, wobbles your GPS and paints the sky with aurora light.</p></details>`;
