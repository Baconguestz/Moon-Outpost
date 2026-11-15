/* ==========================================================================
   Moon Outpost - Core Game Mechanics & State Management
   ========================================================================== */

const $ = s => document.querySelector(s);
const cv = $("#cv");
const cx = cv.getContext("2d");

// Meta Persistence
const defMeta = () => ({
  cr: 0,
  lv: { tank: 0, bag: 0, drill: 0, lining: 0, gen: 0, rover: 0, chef: 0, garden: 0, pantry: 0 },
  set: { snd: 1, shk: 1, tip: 1 },
  rec: { runs: 0, pts: 0, rocks: 0, opals: 0, b300: 0, b600: 0, gr: "-", blk: 0, fix: 0, mis: 0, tl: [0, 0, 0, 0, 0, 0, 0, 0, 0], eb: 0, et: 0 },
  quiz: { best: 0, got: {} },
  camp: { done: [0, 0, 0], best: [0, 0, 0], fin: 0 }
});

let meta = defMeta();
try {
  const s = JSON.parse(localStorage.getItem("moonOutpostV5"));
  if (s && s.lv) {
    const dd = defMeta();
    meta = Object.assign({}, s);
    meta.set = Object.assign(dd.set, s.set);
    meta.rec = Object.assign(dd.rec, s.rec);
    meta.quiz = Object.assign(dd.quiz, s.quiz);
    meta.camp = Object.assign(dd.camp, s.camp);
  }
} catch (e) {}

const save = () => {
  try {
    localStorage.setItem("moonOutpostV5", JSON.stringify(meta));
  } catch (e) {}
};

// Attribute & Power Scaling
const L = k => meta.lv[k] | 0;
const maxO2 = () => 100 + 30 * L("tank");
const cap = () => 8 + 4 * L("bag");
const gen = () => 30 + 10 * L("gen") + (G.day > 1 ? 5 : 0);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const inB = (x, y) => x > Z.x && x < Z.x + Z.w && y > Z.y && y < Z.y + Z.h;
const zone = (x, y) => y < 520 ? 3 : y > 1500 ? 4 : x < 1050 ? 0 : x > 2150 ? 1 : 2;
const used = () => G.pw ? (G.pw.l + G.pw.g + G.pw.s) : 0;
const pe = () => G.prob && G.prob.surge > 0 ? Math.min(1, gen() * G.sf / Math.max(1, used())) : 1;
const effGen = () => G.prob && G.prob.surge > 0 ? Math.round(gen() * G.sf) : gen();

// Game State
let G = { ph: "menu" };
let K = {};
let MS = "home";
const SEL = { dif: 1, day: 1, dur: 300, end: 0 };
const dayGoal = i => Math.round(DAYS[i].goal * SEL.dur / 300 * DIF[SEL.dif].goal);

function pickCh() {
  return CHS.slice().sort(() => Math.random() - .5).slice(0, 3).map(c => ({
    id: c[0], t: c[1], n: c[2], b: c[3], get: c[4], done: 0
  }));
}

// Rock Distribution & Spawning
function pickRock(x, y) {
  const m = 1 + Math.hypot(x - 1600, y - 1000) / 700;
  const W = [
    [15, 40, 25, 5, 0, 0, 8, 4, 1],
    [40, 5, 10, 30, 0, 0, 8, 6, 2],
    [45, 20, 10, 10, 0, 0, 6, 3, 1],
    [20, 5, 5, 10, 45, 0, 8, 5, 2],
    [10, 5, 10, 10, 0, 40, 15, 8, 2]
  ][zone(x, y)].map((v, i) => i >= 6 ? v * m : v);

  let r = Math.random() * W.reduce((a, b) => a + b);
  let k = 0;
  for (; k < 8; k++) {
    r -= W[k];
    if (r < 0) break;
  }
  return k;
}

function spawnRock() {
  for (let n = 0; n < 60; n++) {
    let x, y;
    if (Math.random() < .4) {
      const c = CR[Math.random() * CR.length | 0];
      const a = Math.random() * 6.28;
      x = c.x + Math.cos(a) * c.r * .9;
      y = c.y + Math.sin(a) * c.r * .9;
    } else {
      x = 20 + Math.random() * (WW - 40);
      y = 20 + Math.random() * (WH - 40);
    }
    if (x < 12 || y < 12 || x > WW - 12 || y > WH - 12 ||
       (x > Z.x - 140 && x < Z.x + Z.w + 140 && y > Z.y - 140 && y < Z.y + Z.h + 170)) continue;
    G.rocks.push({ x, y, k: pickRock(x, y) });
    return;
  }
}

// Session Lifecycle
function begin(dur, tut) {
  const tt = !!tut;
  const en = SEL.end && !tt;
  const dy = tt ? null : DAYS[en ? 2 : SEL.day - 1];
  const dd = DIF[tt ? 0 : SEL.dif];
  const H = en ? 3600 : dur;
  const fq = dy ? dd.haz * dy.f : 1;
  const mq = dy ? dd.haz * dy.m : 1;

  G = {
    ph: "play", cfg: dy, d: dd, day: tt || en ? 0 : SEL.day, end: en ? 1 : 0, H,
    goal: dy && !en ? Math.round(dy.goal * dur / 300 * dd.goal) : 0,
    built: 0, cme: null, roff: 0, vx: 0, vy: 0, hph: 0, lh: 0, pops: [], l2: 0, lf: 0,
    dur: en ? 1e9 : dur, t: 0, score: 0, tally: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    hp: 100, o2: maxO2(), food: 80, ration: 2, rp: 0, exp: 0, maxE: 0, carry: [],
    x: 1610, y: 1070, fx: 1, at: 0, mv: 0, spr: 0, stm: 100, wind: 0, srest: 0, spT: 0,
    nB: 0, seen: {}, pt: [], pa: 0, door: 0, rocks: [], scars: [], fl: [], fb: [], mt: [],
    pw: { l: 10, g: 10, s: 10 }, rv: { x: 1570, y: 1085, fx: 1, a: 0 },
    last: "Explore, mine rocks and bank them in the base!",
    prog: 0, stun: 0, sp: 12, shake: 0, flash: 0, fs: 0, brown: 0, pause: false,
    tg: "👋 Hi! Use WASD or arrows to walk. Walk over rocks to grab them! 🪨",
    ti: 0, tx: 10, rf: null, tc: "",
    prob: { radio: 0, gps: 0, surge: 0, dust: 0 },
    ev: [], fixp: 0, nF: 0, nE: 0, sf: .5, inv: {},
    bf: { speed: 0, shield: 0 }, ch: pickCh(), bt: "pw", j: 0
  };

  for (let i = 0; i < 70; i++) spawnRock();
  for (let s = 60 + Math.random() * 20; s < H - 35; s += (90 + Math.random() * 30) / fq) {
    G.fl.push(flareFor(s));
  }
  for (let s = 40; s < H - 10; s += (75 + Math.random() * 20) / mq) {
    const n = 3 + (Math.random() * 3 | 0);
    for (let i = 0; i < n; i++) G.mt.push({ t: s + i * 2.5, x: 0, y: 0 });
  }

  if (!tt && dy) {
    G.last = en ? "♾️ Endless trip! Open the base (B) and press End trip when you want to stop." :
                 `📅 Day ${SEL.day}: build the ${dy.st}! Bank ${G.goal} ⭐ points in rocks.`;
  }

  if (tut) {
    G.fl = []; G.mt = []; G.ev = []; G.ch = []; G.rocks = []; G.dur = 99999;
    G.tut = { i: 0, sx: G.x, sy: G.y, tg: null };
    tutGo(0);
  } else {
    schedEv();
  }

  beep(600, .15);
  ui();
}

function puff(x, y, c, n, v) {
  for (let i = 0; i < n; i++) {
    G.pt.push({
      x, y,
      vx: (Math.random() - .5) * v,
      vy: -Math.random() * v * .8,
      l: .4 + Math.random() * .3,
      c
    });
  }
}

function grab(i) {
  const k = G.rocks[i].k;
  const t = T[k];
  G.carry.push(k);
  G.rocks.splice(i, 1);
  let m = `Got ${t[0]} (${t[1]}) worth ${t[2]}!`;
  if (k == 4) {
    G.o2 = Math.min(maxO2(), G.o2 + 25);
    m += " +25 air from ice!";
  }
  if (!G.seen[k]) {
    G.seen[k] = 1;
    m += " " + t[5];
  }
  G.last = m;
  beep(800, .08);
}

function blackout(w) {
  G.carry = [];
  G.stun = 6;
  G.nB++;
  G.x = 1610;
  G.y = 1070;
  G.o2 = maxO2() * .6;
  G.hp = 50;
  G.food = Math.max(G.food, 30);
  G.exp = 0;
  G.last = `💫 Oopsie! You fainted from ${w}! Your rover buddy dragged you home. You lost your bag and 6 seconds.`;
}

// Physics & Vital Signs Update
function update(dt) {
  if (G.ph != "play" || G.pause) return;
  G.t += dt;
  G.at += dt;
  G.shake = Math.max(0, G.shake - dt * 20);
  G.flash = Math.max(0, G.flash - dt);
  G.brown = Math.max(0, G.brown - dt);

  if (G.t >= G.dur) {
    endRun();
    return;
  }

  G.pt = G.pt.filter(p => (p.l -= dt) > 0);
  G.pt.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; });

  if (G.stun > 0) {
    G.stun -= dt;
    hud();
    return;
  }

  const ins = inB(G.x, G.y);
  G.door += ((ins || Math.hypot(G.x - 1610, G.y - 1060) < 60 ? 1 : 0) - G.door) * Math.min(1, 6 * dt);
  let fs = 0, cls = null;

  G.fl.forEach((f, i) => {
    if (G.t >= f.s && !G.fb[i]) {
      G.fb[i] = 1;
      beep(440, .8);
    }
    if (G.t >= f.s && G.t < f.s + 15) {
      fs = 1;
      G.cd = Math.ceil(f.s + 15 - G.t);
      cls = CL[f.c];
      G.rf = f.real;
    } else if (G.t >= f.s + 15 && G.t < f.s + 35) {
      fs = 2;
      cls = CL[f.c];
      G.rf = f.real;
    }
  });
  G.fs = fs;
  G.cl = cls;

  const dx = (K.right | 0) - (K.left | 0);
  const dy = (K.down | 0) - (K.up | 0);
  const l = Math.hypot(dx, dy) || 1;
  const mv = dx || dy;
  G.mv = mv;
  if (dx) G.fx = dx > 0 ? 1 : -1;

  if (G.wind && G.stm >= 25) G.wind = 0;
  let spr = 0;
  if (K.sprint && mv && !G.wind && G.stm > 0) {
    spr = 1;
    G.stm -= 25 * dt;
    G.srest = 1;
    G.spT += dt;
    if (G.stm <= 0) {
      G.stm = 0;
      G.wind = 1;
    }
  } else {
    G.srest -= dt;
    if (G.srest <= 0) {
      G.stm = Math.max(0, Math.min(100, G.stm + (fs == 2 && !ins && cls && cls[1] >= 1 ? -5 * cls[1] * G.d.dmg : 15) * dt));
    }
  }
  G.spr = spr;

  const sp = (spr ? 170 : 105) *
             (G.prob.dust > 0 ? .85 : 1) *
             (G.bf.speed > 0 ? 1.25 : 1) *
             (G.food < 20 ? .8 : 1) *
             (1 - .6 * G.exp / 100) *
             (1 - .025 * G.carry.length);

  const ac = Math.min(1, (mv ? 3.5 : 2) * dt);
  G.vx += ((mv ? dx / l * sp : 0) - G.vx) * ac;
  G.vy += ((mv ? dy / l * sp : 0) - G.vy) * ac;
  G.x = clamp(G.x + G.vx * dt, 10, WW - 10);
  G.y = clamp(G.y + G.vy * dt, 14, WH - 10);
  G.food -= .35 * G.d.fd * (ins ? 1 : spr ? 2 : 1.5) * dt;

  if (mv) {
    G.hph += dt * (spr ? 6 : 3.6);
  } else {
    G.hph += (Math.round(G.hph / Math.PI) * Math.PI - G.hph) * Math.min(1, 8 * dt);
  }

  const nh = Math.floor(G.hph / Math.PI);
  if (nh > G.lh) {
    G.lh = nh;
    puff(G.x - G.fx * 6, G.y + 19, "#d5d8e6", 5, spr ? 70 : 45);
  } else if (nh < G.lh) {
    G.lh = nh;
  }

  if (ins) {
    G.o2 = Math.min(maxO2(), G.o2 + .8 * G.pw.l * pe() * (G.brown > 0 ? .5 : 1) * dt);
    G.exp = Math.max(0, G.exp - 12 * dt);
    if (G.exp < 10) G.hp = Math.min(100, G.hp + .8 * dt);
    G.rp += G.pw.g * pe() * (1 + .3 * L("garden") + (G.day > 2 ? .3 : 0)) * .002 * dt;
    if (G.rp >= 1) {
      G.rp--;
      G.ration = Math.min(9, G.ration + 1);
    }
    if (G.carry.length) {
      let p = 0;
      G.carry.forEach(k => {
        p += T[k][2];
        G.tally[k]++;
      });
      G.score += p;
      meta.cr += p;
      save();
      G.last = `Banked ${G.carry.length} rocks: +${p} points and credits!`;
      G.carry = [];
    }
    if (K.eat && G.food <= 85 && G.ration > 0) {
      G.prog += dt;
      if (G.prog >= 3) {
        G.prog = 0;
        G.ration--;
        G.food = Math.min(100, G.food + 25);
        G.last = "Yum! +25 food";
      }
    } else {
      G.prog = 0;
    }
    G.mr = null;
  } else {
    G.o2 -= (spr ? 3 : 2) * G.d.o2 * dt;
    if (fs == 2) {
      G.exp = Math.min(100, G.exp + 14 * cls[1] * G.d.dmg * (G.bf.shield > 0 ? .5 : 1) * (1 - Math.min(.8, .04 * G.pw.s * pe())) * (1 - .2 * L("lining")) * dt);
    } else {
      G.exp = Math.max(0, G.exp - 2 * dt);
    }
    G.maxE = Math.max(G.maxE, G.exp);

    let mt = null;
    for (let i = G.rocks.length - 1; i >= 0; i--) {
      if (G.carry.length >= cap()) break;
      const r = G.rocks[i];
      const m = T[r.k][4];
      const d = Math.hypot(r.x - G.x, r.y - G.y);
      if (!m && d < 18) grab(i);
      else if (m && d < 34) mt = r;
    }

    const nd = mt ? T[mt.k][4] * (1 - .25 * L("drill")) * (G.prob.dust > 0 ? 2 : 1) : 0;
    if (mt && K.mine) {
      if (G.mr !== mt) {
        G.mr = mt;
        G.prog = 0;
      }
      G.prog += dt;
      G.pa -= dt;
      if (G.pa <= 0) {
        G.pa = .05;
        puff(mt.x, mt.y, "#ffd24a", 2, 90);
      }
      if (G.prog >= nd) {
        grab(G.rocks.indexOf(mt));
        puff(G.x, G.y, "#fff", 8, 100);
        G.mr = null;
        G.prog = 0;
      }
    } else {
      G.mr = null;
      G.prog = 0;
      if (mt) G.last = `Hold E to mine ${T[mt.k][0]} (${nd.toFixed(1)}s)`;
    }
  }

  G.nd = G.mr ? T[G.mr.k][4] * (1 - .25 * L("drill")) * (G.prob.dust > 0 ? 2 : 1) : 3;

  // Rover Movement & Scanning
  const q = G.rv;
  const tx = G.x - G.fx * 38;
  const ty = G.y + 12;
  q.a += (Math.abs(tx - q.x) + Math.abs(ty - q.y)) * dt * .4;
  q.fx = tx > q.x + 2 ? 1 : tx < q.x - 2 ? -1 : q.fx;
  q.x += (tx - q.x) * Math.min(1, 3 * dt);
  q.y += (ty - q.y) * Math.min(1, 3 * dt);
  G.roff = (G.prob.radio > 0 || (fs == 2 && cls && cls[1] >= 1 && G.pw.s < 10)) ? 1 : 0;
  q.off = G.roff;

  if (L("rover") && !ins && !G.roff) {
    for (let i = G.rocks.length - 1; i >= 0; i--) {
      const r = G.rocks[i];
      if (G.carry.length < cap() && !T[r.k][4] && Math.hypot(r.x - q.x, r.y - q.y) < 30 + 30 * L("rover")) {
        grab(i);
      }
    }
  }

  if (G.exp > 15) G.hp -= (G.exp - 15) / 100 * 7 * dt;

  G.rocks = G.rocks.filter(r => !r.life || (r.life -= dt) > 0);
  G.sp -= dt;
  if (G.sp < 0) {
    G.sp = 12;
    if (!G.tut) {
      for (let i = 0; i < 6; i++) {
        if (G.rocks.length < 110) spawnRock();
      }
    }
  }

  // Asteroid System
  G.mt.forEach(m => {
    if (G.t >= m.t && !m.x) {
      const n = Math.random() < .5;
      m.x = n ? clamp(G.x + (Math.random() - .5) * 200, 20, WW - 20) : 30 + Math.random() * (WW - 60);
      m.y = n ? clamp(G.y + (Math.random() - .5) * 200, 20, WH - 20) : 30 + Math.random() * (WH - 60);
    }
    if (m.x && !m.d && G.t >= m.t + 2.2) {
      m.d = 1;
      G.shake = meta.set.shk ? 8 : 0;
      beep(90, .25);
      puff(m.x, m.y, "#b5b8c9", 14, 160);
      if (Math.hypot(m.x - G.x, m.y - G.y) < 44 && !ins) {
        G.dmx = Math.round(22 * G.d.dmg);
        G.hp -= G.dmx;
        G.flash = .4;
        G.last = "☄️ Hit by an asteroid! −" + G.dmx + " health";
      } else if (inB(m.x, m.y)) {
        G.brown = 8;
        G.last = "☄️ Base hit! Life support is at half power for 8s";
      }
      G.scars.push({ x: m.x, y: m.y });
      const big = Math.random() < .25;
      G.rocks.push({ x: m.x + 14, y: m.y + 8, k: big ? [3, 3, 6, 6, 7, 8][Math.random() * 6 | 0] : 5, life: 20 });
      if (big) G.last = "☄️ Big asteroid! A rare rock fell. Grab it fast!";
    }
  });

  probTick(dt, ins);
  if (G.tut) tutTick();
  popTick(dt, ins);
  tipTick(dt, ins);

  if (G.o2 <= 0) blackout("no air");
  else if (G.food <= 0) blackout("hunger");
  else if (G.hp <= 0) blackout("radiation and damage");

  hud();
}

// Hazards & Events
function schedEv() {
  const dy = G.cfg;
  const hz = G.d.haz;
  const H = G.H;
  G.fl.forEach(f => {
    if (f.c >= 1) {
      G.ev.push({ t: f.s + 15, k: "radio", d: 0 });
      if (dy.ev > 0 && Math.random() < (f.c >= 2 ? .85 : .4) * dy.ev) {
        G.ev.push({ t: f.s + 2, k: "cme", d: 0 });
      }
    }
  });

  if (dy.ev > 0) {
    for (let s = 75 + Math.random() * 30; s < H - 40; s += (105 + Math.random() * 40) / (hz * dy.ev)) {
      G.ev.push({ t: s, k: Math.random() < .5 ? "cme" : "gps", d: 0 });
    }
  }

  for (let s = 45 + Math.random() * 20; s < H - 30; s += (65 + Math.random() * 25) / (hz * dy.s)) {
    G.ev.push({ t: s, k: "dust", d: 0 });
  }
}

function launchCME() {
  if (G.cme) return;
  const sp = NS.fast > 0 && NS.st != "sample" ?
             clamp(Math.round(NS.fast * (.4 + Math.random() * .6)), 400, 2800) :
             Math.round(500 + Math.random() * 1300);
  const kp = clamp(Math.round(3 + sp / 350), 5, 9);
  const dl = clamp(Math.round(36000 / sp) + 8, 18, 50);
  G.cme = { a: G.t + dl, sp, kp };
  G.last = `🌪️ CME DETECTED! A giant Sun-bubble is flying at ${sp} km/s and reaches us in ${dl}s. Get in the base and power the 🛡️ shield!`;
  addPop("🌪️", "CME incoming!", `Arrives in ${dl}s. Be in the base with the shield on!`);
  beep(300, .3);
}

function startProb(k, kp0) {
  const P = G.prob;
  let m = "";
  if (k == "cme") return launchCME();
  if (k == "radio") {
    P.radio = 40;
    m = "📻 RADIO BLACKOUT! The flare made radio static. Go to the base and hold R to fix it!";
  } else if (k == "gps") {
    P.gps = 35;
    m = "🛰️ GPS wobble! Bumpy sky-layer bits are confusing your map. Go to the base and hold R!";
  } else if (k == "dust") {
    P.dust = 25;
    m = "🌫️ Sticky Moon dust all over your suit! Hold R to brush it off!";
  } else {
    const g = !kp0 && NS.gst.length ? NS.gst[(G.j++) % NS.gst.length] : null;
    const kp = kp0 || (g ? g.kp : 6);
    P.surge = 20 + Math.round(kp * 3);
    P.gps = 35;
    G.sf = kp >= 9 ? .25 : kp >= 7 ? .35 : .5;
    m = `⚡ MAGNET STORM! A Sun-burp shook Earth's magnet bubble (Kp ${kp}: ${kp >= 9 ? "EXTREME" : kp >= 7 ? "strong" : "minor"})${g ? ` (NASA saw a real Kp ${kp} storm, level G${Math.max(1, Math.min(5, Math.round(kp) - 4))}, on ${fmtD(g.t)})` : ""}. Power is weak and GPS is wobbly! Base + hold R, and share power with B!`;
  }
  G.last = m;
  beep(300, .4);
}

function probTick(dt, ins) {
  const P = G.prob, B = G.bf;
  for (const k in P) if (P[k] > 0) P[k] = Math.max(0, P[k] - dt);
  for (const k in B) if (B[k] > 0) B[k] = Math.max(0, B[k] - dt);

  G.ev.forEach(e => {
    if (!e.d && G.t >= e.t) {
      e.d = 1;
      startProb(e.k);
    }
  });

  if (G.cme && G.t >= G.cme.a) {
    const cm0 = G.cme;
    G.cme = null;
    startProb("storm", cm0.kp);
  }

  if (G.goal && !G.built && G.score >= G.goal) {
    G.built = 1;
    G.last = `🏗️ ${DAYS[G.day - 1].st} is BUILT! Keep going for a better grade!`;
    beep(1100, .3);
    addPop("🏗️", "Stage built!", "Your " + DAYS[G.day - 1].st + " is ready. Keep playing for a higher score!");
  }

  if (K.snack) {
    K.snack = 0;
    snack();
  }

  let fk = null;
  if (P.radio > 0 && ins) fk = "radio";
  else if (P.gps > 0 && ins) fk = "gps";
  else if (P.surge > 0 && ins) fk = "surge";
  else if (P.dust > 0) fk = "dust";

  if (K.fix && fk) {
    G.fixp += dt;
    if (G.fixp >= (fk == "dust" ? 2 : 3)) {
      G.fixp = 0;
      P[fk] = 0;
      G.nF++;
      G.score += 8;
      meta.cr += 8;
      save();
      G.last = FIXMSG[fk] + " +8 ⭐";
      beep(900, .15);
      puff(G.x, G.y, "#4ade80", 10, 120);
    }
  } else {
    G.fixp = 0;
  }

  G.ch.forEach(c => {
    if (!c.done && c.get() >= c.n) {
      c.done = 1;
      meta.cr += c.b;
      save();
      G.last = `🎯 Mission done: ${c.t}! +${c.b} 💰`;
      beep(1000, .2);
    }
  });
}

function stormProto() {
  const g = gen();
  G.pw.l = 10;
  G.pw.g = 0;
  G.pw.s = Math.max(0, Math.min(25, Math.floor((g - 10) / 5) * 5));
  G.last = "🛡️ Storm protocol on! Shield first, greenhouse sleeping.";
  ui();
}

function endRun() {
  if (G.ph != "play") return;
  G.ph = "end";
  G.pause = false;
  finish();
  ui();
}

const grade = s => {
  s /= (G.end ? Math.max(60, G.t) : G.dur) / 300;
  return s >= 450 ? "S" : s >= 320 ? "A" : s >= 200 ? "B" : s >= 110 ? "C" : "D";
};

function finish() {
  const r = meta.rec;
  const g = grade(G.score);
  const R = "DCBAS";
  const k = "b" + G.dur;
  r.runs++;
  r.pts += G.score;
  r.rocks += G.tally.reduce((a, b) => a + b, 0);
  r.opals += G.tally[8];
  r.blk += G.nB;
  r.fix += G.nF;
  r.mis += G.ch.filter(c => c.done).length;
  G.tally.forEach((v, i) => r.tl[i] = (r.tl[i] || 0) + v);

  G.nb = 0;
  if (G.end) {
    if (G.score > (r.eb || 0)) {
      G.nb = 1;
      r.eb = G.score;
    }
    r.et = Math.max(r.et || 0, G.t | 0);
  } else {
    if (G.score > (r[k] || 0)) {
      G.nb = 1;
      r[k] = G.score;
    }
  }

  if (r.gr == "-" || R.indexOf(g) > R.indexOf(r.gr)) r.gr = g;

  G.win = 0;
  if (G.goal) {
    G.win = G.score >= G.goal ? 1 : 0;
    if (G.win) {
      const c = meta.camp;
      const i = G.day - 1;
      c.done[i] = 1;
      c.best[i] = Math.max(c.best[i] || 0, G.score);
      if (G.day == 3) {
        c.fin = 1;
        G.endScr = 1;
      }
    }
  }
  save();
}

// Popups & Tips
function addPop(e, h, m) {
  G.pops.push({ e, h, m, l: 6 });
  if (G.pops.length > 2) G.pops.shift();
  beep(250, .35);
}

function popTick(dt, ins) {
  G.pops = G.pops.filter(p => (p.l -= dt) > 0);
  const o = G.o2 < 12 ? 2 : G.o2 < 30 ? 1 : 0;
  const f = G.food < 10 ? 2 : G.food < 25 ? 1 : 0;

  if (o > G.l2) {
    G.l2 = o;
    if (!ins) addPop("💨", o > 1 ? "VERY LOW AIR!" : "Low air!", "Run home to the base 🏠 or grab 🧊 Water Ice!");
  }
  if (G.o2 >= 50) G.l2 = 0;

  if (f > G.lf) {
    G.lf = f;
    addPop("🍎", f > 1 ? "SO HUNGRY!" : "Tummy rumble!", "Hold F in the base to eat, or press Q for a snack!");
  }
  if (G.food >= 40) G.lf = 0;
}

function tipTick(dt, ins) {
  G.tx -= dt;
  let c = null;
  if (G.tut) {
    const s = TUT[G.tut.i];
    const el = $("#tt");
    const t = `🎓 ${G.tut.i + 1}/${TUT.length}: ${s.t}`;
    if (el.textContent !== t) el.textContent = t;
    $("#tip").classList.add("tut");
    $("#tn").hidden = !s.man;
    $("#tn").textContent = s.last ? "Finish 🎉" : "Next ➜";
    $("#tk").hidden = false;
    return;
  }
  $("#tip").classList.remove("tut");
  $("#tn").hidden = true;
  $("#tk").hidden = true;

  if (G.fs == 1) c = G.rf ? `📡 REAL NASA DONKI flare: ${flInfo(G.rf)}. The Sun is sneezing ☀️🤧 RUN INSIDE! ${FLFX[G.cl ? "CMX".indexOf(G.cl[0][0]) : 0]}` : "☀️🤧 The Sun is about to sneeze! Run into the base!";
  else if (G.fs == 2 && !ins) c = "☢️ Sun-rays! Get in the base NOW! Sun particles (SEP) drain your stamina outside! 🏠";
  else if (probTip()) c = probTip();
  else if (G.mt.some(m => m.x && !m.d)) c = "☄️ Space rock coming! Step out of the red circle!";
  else if (G.o2 < 30 && !ins) c = "💨 Your air is getting low! Go home 🏠 or grab 🧊 Water Ice!";
  else if (G.food < 25) c = "🍎 Tummy rumble! Stand in the base and hold F to eat!";
  else if (G.wind) c = "😮‍💨 Puff puff! Rest a moment, then you can zoom again!";
  else if (G.carry.length >= cap()) c = "🎒 Your bag is full! Walk to the base to bank your rocks!";

  if (!c && G.tx <= 0) {
    G.ti = (G.ti + 1) % TIPS.length;
    G.tg = TIPS[G.ti];
    G.tx = 11;
  }
  const t = c || G.tg;
  const el = $("#tt");
  if (el.textContent !== t) el.textContent = t;
}

// Tutorial System
const baseT = () => ({ x: Z.x + Z.w / 2, y: Z.y - 20 });

function tutRock(k) {
  const r = { x: clamp(G.x + G.fx * 110, 40, WW - 40), y: clamp(G.y + 40, 40, WH - 40), k };
  while (inB(r.x, r.y)) r.y += 40;
  G.rocks.push(r);
  G.tut.rk = r;
}

const TUT = [
  { t: "👋 Hi, I'm Astro! Let's learn to move. Press the arrow keys (or W A S D) to WALK. On a phone, tap the little arrows. Walk a bit! 🚶", ok: () => Math.hypot(G.x - G.tut.sx, G.y - G.tut.sy) > 260 },
  { t: "🪨 Great walking! Now walk onto the grey rock with the yellow arrow to pick it up!", setup: () => tutRock(0), tg: () => ({ x: G.tut.rk.x, y: G.tut.rk.y - 16 }), ok: () => G.carry.length >= 1 || G.tally.some(v => v > 0) },
  { t: "✨ Yay! Some rocks are shiny and hard. Stand close to the BLUE rock and HOLD the E key (or the ⛏ Mine button) until it pops!", setup: () => tutRock(3), tg: () => ({ x: G.tut.rk.x, y: G.tut.rk.y - 16 }), ok: () => G.carry.includes(3) || G.tally[3] > 0 },
  { t: "🏠 Your bag has rocks! Follow the arrow back to the BASE and walk inside. Rocks turn into ⭐ points there!", tg: baseT, ok: () => inB(G.x, G.y) && G.tally.some(v => v > 0) },
  { t: "💨 The Moon has NO air! The 💨 bar at the top is your air. Inside the base it fills up again. If it gets low, a big warning will pop up!", man: 1 },
  { t: "🍎 This bar is your food. When your tummy is empty, stand in the base and HOLD the F key to eat a meal. Try it now!", setup: () => { G.food = 50; G.ration = Math.max(G.ration, 2); }, tg: () => inB(G.x, G.y) ? null : baseT(), ok: () => inB(G.x, G.y) && G.food >= 70, man: 1 },
  { t: "☀️ Uh-oh, the Sun is sneezing! That is a SOLAR FLARE, and it is a REAL one from NASA! Run into the base and wait there until it is gone.", setup: () => { G.fl.push(flareFor(G.t + 2)); G.tut.fe = G.t + 37; }, tg: () => inB(G.x, G.y) ? null : baseT(), ok: () => G.t >= G.tut.fe, man: 1 },
  { t: "🔧 Other tricks: hold R in the base to fix broken things. Shift = zoom (but zoom uses lots of air!). ☄️ If a red circle shows up, step out of it!", man: 1 },
  { t: "🎉 YAY! You are a real space explorer now! Press Finish, then pick PLAY for a real trip!", man: 1, last: 1 }
];

function tutGo(i) {
  const t = G.tut;
  if (i >= TUT.length) return tutSkip();
  t.i = i;
  const s = TUT[i];
  if (s.setup) s.setup();
  t.tg = s.tg ? s.tg() : null;
}

function tutTick() {
  G.o2 = Math.max(G.o2, 45);
  G.hp = 100;
  G.food = Math.max(G.food, 40);
  const s = TUT[G.tut.i];
  if (s && s.ok && s.ok()) {
    beep(1000, .15);
    tutGo(G.tut.i + 1);
  }
}

function tutNext() {
  if (!G.tut) return;
  const s = TUT[G.tut.i];
  if (s.last) tutSkip();
  else tutGo(G.tut.i + 1);
}

function tutSkip() {
  G = { ph: "menu" };
  MS = "home";
  ui();
}

function askTut() {
  if (confirm("🎓 Do you want a tutorial? It is easy and short, and I will show you how to play!")) {
    begin(300, true);
  }
}
