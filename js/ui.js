/* ==========================================================================
   Moon Outpost - UI, HUD, Base Shop, Quiz Engine & Space School
   ========================================================================== */

let SS = "sun";
let SCH = { sec: "home" };
let QS = { st: "intro", mode: "big", qs: [], i: 0, s: 0, pick: null, opts: [], nw: 0 };

// HUD Updates
function hud() {
  const set = (a, v, m) => {
    $("#v" + a).textContent = Math.max(0, v | 0);
    const e = $("#b" + a);
    e.style.width = Math.max(0, v) / m * 100 + "%";
    e.style.background = v / m < .25 ? "#ef4444" : v / m < .5 ? "#f59e0b" : "#4ade80";
  };

  if (!G.pw) return;
  set("o", G.o2, maxO2());
  set("f", G.food, 100);
  set("h", G.hp, 100);
  set("s", G.stm, 100);

  const rem = (G.end ? G.t : Math.max(0, G.dur - G.t)) | 0;
  $("#d").textContent = `⏱ ${rem / 60 | 0}:${String(rem % 60).padStart(2, "0")}${G.end ? " ♾️" : G.day ? " · 📅 Day " + G.day : ""} · ${ZN[zone(G.x, G.y)]}`;
  $("#c").textContent = `🎒 ${G.carry.length}/${cap()}${G.bf.speed > 0 ? " 🏃" : ""}${G.bf.shield > 0 ? " 🍅" : ""}`;
  $("#n").textContent = `🥫 ${G.ration} · 🍱 ${invN()} · ⚡ ${used()}/${effGen()} kW`;
  $("#ms").textContent = buildTxt() + (G.ch || []).map(c => `${c.done ? "✅" : "🎯"} ${c.t} ${Math.min(c.n, c.get())}/${c.n}`).join("  ·  ");
  $("#s").textContent = `⭐ ${G.score} · 💰 ${meta.cr}`;

  if (G.tut) $("#d").textContent = "🎓 Tutorial";
  probHud();
  $("#r").textContent = G.fs == 1 ? `⚠️ ${G.cl[0].toUpperCase()} SOLAR FLARE IN ${G.cd}s! Get inside!` :
                       G.fs == 2 ? "☢️ FLARE ACTIVE! Stay inside the base!" :
                       G.wind ? "😮‍💨 Winded! Rest to sprint again." : G.last;
}

function probHud() {
  const e = $("#pr"), P = G.prob;
  if (!P || G.ph != "play") {
    e.hidden = true;
    return;
  }
  const a = [];
  if (P.radio > 0) a.push(`📻 Radio static ${P.radio | 0}s → go to base, hold R`);
  if (P.gps > 0) a.push(`🛰️ GPS wobble ${P.gps | 0}s → go to base, hold R`);
  if (P.surge > 0) a.push(`⚡ Power surge ${P.surge | 0}s → base, hold R, share power (B)`);
  if (P.dust > 0) a.push(`🌫️ Sticky dust ${P.dust | 0}s → hold R`);
  if (G.fixp > 0) a.push("🔧 Fixing… keep holding R!");
  if (G.cme) a.unshift(`🌪️ CME arrives in ${Math.max(0, Math.ceil(G.cme.a - G.t))}s (${G.cme.sp} km/s) → be in the base!`);
  e.hidden = !a.length;
  e.textContent = a.join("  ·  ");
}

function probTip() {
  const P = G.prob;
  if (G.cme) return `🌪️ A CME is coming in ${Math.max(0, Math.ceil(G.cme.a - G.t))}s! A countdown gives you time to get ready: go to the base and put power into the 🛡️ shield (Base, Power, Storm protocol).`;
  if (P.surge > 0) return "⚡ Power surge! Go to the base, hold R to flip the breaker, and press B to share the little power wisely! Put it where you need it most.";
  if (P.radio > 0) return "📻 Radio static! Go inside the base 🏠 and hold R. Sun flares cause radio blackouts!";
  if (P.gps > 0) return "🛰️ Your GPS map is wobbly because a layer of Earth's sky is bumpy. Base + hold R fixes it!";
  if (P.dust > 0) return "🌫️ Moon dust is sticky! Hold R to brush it off. Apollo astronauts had dusty suits too!";
  return "";
}

function buildTxt() {
  if (G.end) return "♾️ Endless · ";
  if (!G.goal) return "";
  const d = DAYS[G.day - 1];
  return `🏗️ ${d.bi} ${d.st} ${G.built ? "✅ BUILT!" : Math.min(G.score, G.goal) + "/" + G.goal + " ⭐"} · `;
}

// Base Power & Upgrades Dialog
function adj(k, d) {
  const v = G.pw[k] + d * 5;
  if (v < 0 || v > 25 || (d > 0 && used() + 5 > gen())) return;
  G.pw[k] = v;
  ui();
}

function buy(id) {
  const l = L(id), c = COST[l];
  if (l >= 3 || meta.cr < c) return;
  meta.cr -= c;
  meta.lv[id] = (meta.lv[id] | 0) + 1;
  save();
  ui();
}

function shop() {
  return `<h2>🔧 Upgrades · 💰 ${meta.cr} credits</h2><div class="two">${U.map(u => {
    const l = L(u[0]), c = COST[l];
    return `<div class="row" style="display:block"><b>${u[1]}</b> Lv ${l}/3<small>${u[2]}</small><button ${l >= 3 || meta.cr < c ? "disabled" : ""} onclick="buy('${u[0]}')">${l >= 3 ? "MAX" : "Buy " + c}</button></div>`;
  }).join("")}</div>`;
}

const stp = (k, n, h) => `<div class="row"><div>${n}<small>${h}</small></div><button class="st" onclick="adj('${k}',-1)" aria-label="less ${n}">−</button><b>${G.pw[k]} kW</b><button class="st" onclick="adj('${k}',1)" aria-label="more ${n}">+</button></div>`;

// Inventory & Food Functions
const invN = () => Object.values(G.inv || {}).reduce((a, b) => a + b, 0);
const pcap = () => 6 + 3 * L("pantry");
const cm = () => 1 + .2 * L("chef");

function fxText(f) {
  const m = cm(), r = v => Math.round(v * m), a = [`+${r(f.fd)} food`];
  if (f.hp) a.push(`+${r(f.hp)} health`);
  if (f.stm) a.push(`+${r(f.stm)} stamina`);
  if (f.bf) a.push(f.bf[0] == "speed" ? `🏃 speedy ${r(f.bf[1])}s` : `🛡️ tough suit ${r(f.bf[1])}s`);
  return a.join(" · ");
}

function buyFood(id) {
  const f = FOODS.find(x => x.id == id);
  if (!f) return;
  if (meta.cr < f.p) {
    G.last = "💰 Not enough credits yet!";
    return ui();
  }
  if (invN() >= pcap()) {
    G.last = "🗄️ Pantry is full! Eat something or buy Pantry shelves.";
    return ui();
  }
  meta.cr -= f.p;
  G.inv[id] = (G.inv[id] | 0) + 1;
  save();
  G.last = `🛒 Bought ${f.e} ${f.n}!`;
  beep(700, .08);
  ui();
}

function eatFood(id) {
  const f = FOODS.find(x => x.id == id);
  if (!f || !(G.inv[id] > 0)) return;
  if (G.food >= 100 && !f.hp && !f.stm && !f.bf) {
    G.last = "Your tummy is already full! 😋";
    return;
  }
  const m = cm();
  G.inv[id]--;
  G.nE++;
  G.food = Math.min(100, G.food + f.fd * m);
  G.hp = Math.min(100, G.hp + (f.hp || 0) * m);
  G.stm = Math.min(100, G.stm + (f.stm || 0) * m);
  if (f.bf) G.bf[f.bf[0]] = f.bf[1] * m;
  G.last = `${f.e} Yum! ${f.n}: ${fxText(f)}`;
  beep(760, .1);
  if (G.pause) ui();
}

function snack() {
  const f = FOODS.find(x => G.inv[x.id] > 0);
  if (f) eatFood(f.id);
  else G.last = "🍱 No snacks! Buy some in the base shop (press B).";
}

function foodPanel() {
  return `<p class="sm">💰 ${meta.cr} credits · 🍱 ${invN()}/${pcap()} in pantry · 👩‍🍳 Chef power ×${cm().toFixed(1)}</p><p>${G.last}</p><div class="two">${FOODS.map((f, i) => `<div class="row" style="display:block"><b>${f.e} ${f.n}</b> <span class="chip">key ${i + 1}</span><small>${fxText(f)}</small><small>💡 ${f.k}</small><button ${meta.cr < f.p || invN() >= pcap() ? "disabled" : ""} onclick="buyFood('${f.id}')">Buy ${f.p}</button> <button ${G.inv[f.id] ? "" : "disabled"} onclick="eatFood('${f.id}')">Eat (${G.inv[f.id] | 0})</button></div>`).join("")}</div><p class="sm">Upgrade 👩‍🍳 Space chef, 🌱 Garden and 🗄️ Pantry shelves in the Upgrades tab to make food stronger!</p>`;
}

function missionsHTML() {
  return `<h2>🎯 Missions</h2>${(G.ch || []).map(c => `<div class="row"><div>${c.done ? "✅" : "⬜"} ${c.t}<small>${Math.min(c.n, c.get())}/${c.n} · prize ${c.b} 💰</small></div></div>`).join("")}`;
}

function openBase() {
  if (G.ph == "play" && inB(G.x, G.y) && !G.pause) {
    G.pause = true;
    ui();
  }
}

function closeBase() {
  G.pause = false;
  ui();
}

function baseHTML() {
  const TB = [["pw", "⚡ Power"], ["food", "🍽 Food shop"], ["up", "🛒 Upgrades"], ["ms", "🎯 Missions"]];
  const tabs = `<div class="tabs">${TB.map(t => `<button class="tab ${G.bt == t[0] ? "on" : ""}" onclick="G.bt='${t[0]}';ui()">${t[1]}</button>`).join("")}</div>`;
  let b;
  if (G.bt == "food") b = foodPanel();
  else if (G.bt == "up") b = shop();
  else if (G.bt == "ms") b = missionsHTML();
  else b = `<p>Generator: <b>${effGen()} kW</b>${G.prob.surge > 0 ? " ⚡ (storm! it is weak)" : ""} · in use: <b>${used()} kW</b> (game paused)</p>${stp("l", "💨 Life support", "Refills your air faster")}${stp("g", "🥬 Greenhouse", "Grows meals over time")}${stp("s", "🛡️ Flare shield", "Less radiation outside")}${G.prob.surge > 0 ? "<p>⚡ Tip: during a storm, give the little power to what you need most!</p>" : ""}<p><button onclick="stormProto()">🛡️ Storm protocol</button></p><p class="sm">Shield first! Life support stays on and the greenhouse sleeps. Real engineers switch off non-essential things in a storm.</p>`;

  return `<h1>🏠 Base</h1>${tabs}${b}${G.end ? '<button class="go" style="background:#fca5a5" onclick="if(confirm(\'End the endless trip?\'))endRun()">🏁 End trip</button>' : ""}<button class="go" onclick="closeBase()">Resume ➜</button>`;
}

// Menus & Screens
const mb = (c, t, f, x = "") => `<button class="mb ${c}" ${x} onclick="${f}">${t}</button>`;
const BACK = `<button class="mb y bk" onclick="nav('home')">⬅ Back</button>`;

function nav(s) {
  MS = s;
  ui();
  beep(520, .07);
}

function tog(k) {
  meta.set[k] = +!meta.set[k];
  save();
  beep(660, .06);
  ui();
}

function tickerText() {
  return `📡 NASA ${NS.busy ? "is being called ☎️" : NS.st == "live" ? "LIVE" : NS.st == "cache" ? "(saved copy)" : "(old examples)"}: ${mood().e} ${mood().t}   ✨   Tip: ${TIPS[(Date.now() / 20000 | 0) % TIPS.length]}`;
}

const fr = f => "CMX".indexOf(f.cls[0]) * 100 + (parseFloat(f.cls.slice(1)) || 0);

function bookRow(t, i) {
  const n = meta.rec.tl[i] || 0;
  return n ? `<div class="row"><div><b><span style="color:${t[3]};-webkit-text-stroke:1px #14123a">■</span> ${t[0]}</b> <span class="chip">${t[1]} · ${t[2]} pts</span><small>${t[5]}</small></div><b>×${n}</b></div>` :
             `<div class="row"><div><b>❓ ???</b><small>Find this rock to learn its secret!</small></div></div>`;
}

function lessons() {
  const a = [], t = G.tally, b = t.reduce((m, v, i) => v && (m < 0 || T[i][2] > T[m][2]) ? i : m, -1), rf = G.fl.filter(f => f.real && G.t >= f.s);
  if (rf.length) a.push(`📡 Real NASA flares were in your game! You hid from ${rf.slice(0, 3).map(f => f.real.cls + " (" + fmtD(f.real.t) + ")").join(", ")}. NASA watches the Sun every day to keep astronauts safe! ☀️`);
  if (b >= 0) a.push(`⭐ Best find: ${T[b][0]}! ${T[b][5]}`);
  if (G.spT > 15) a.push(`💨 You zoomed for ${G.spT | 0} seconds! Zooming uses up air fast, so astronauts walk most of the time. 🚶`);
  if (G.nB) a.push(`💫 You fainted ${G.nB} time${G.nB > 1 ? "s" : ""}. Real astronauts always keep extra air so they can get home! 🏠`);
  if (G.pw.s >= 15 && G.pw.g <= 5) a.push("🛡️ You gave lots of power to the shield, so the garden got sleepy 🥬. Engineers always have to share power!");
  else if (G.pw.s <= 5 && G.maxE > 50) a.push("☢️ The shield was too sleepy, so sun-rays sneaked in! Shields need power to work. 🔋");
  if (G.nF) a.push(`🔧 You fixed ${G.nF} problem${G.nF > 1 ? "s" : ""}! Real engineers get alerts from space-weather forecasters and then fix or wait out problems, just like you!`);
  a.push("🤝 Real space teams share power, air, food and safety just like you did!");
  return a.slice(0, 5);
}

function dayBanner() {
  if (G.end) {
    const m = G.t | 0;
    return `<h2 style="text-align:center">♾️ Endless trip: ${m / 60 | 0}:${String(m % 60).padStart(2, "0")}</h2>`;
  }
  if (!G.goal) return "";
  const d = DAYS[G.day - 1];
  return G.win ?
    `<div class="panel" style="background:#dcfce7"><h2>✅ Day ${d.n} complete!</h2><p>${d.bi} <b>${d.st}</b> is built! 🎁 ${d.perk}</p><p>⭐ ${G.score} / 🎯 ${G.goal}</p></div>` :
    `<div class="panel" style="background:#fee2e2"><h2>🏗️ Not finished yet!</h2><p>You needed <b>${G.goal}</b> points to build the ${d.st}. You got <b>${G.score}</b>. Try again, you can do it!</p></div>`;
}

function endBtns() {
  const b = [`<button class="go" onclick="begin(SEL.dur)">🔁 ${G.end ? "Run again" : "Replay Day " + G.day}</button>`];
  if (G.goal && G.win && G.day < 3) b.push(`<button class="go" onclick="SEL.day=${G.day + 1};begin(SEL.dur)">▶ Next: Day ${G.day + 1}</button>`);
  if (G.goal) b.push(`<button class="go" onclick="G={ph:'menu'};MS='day';ui()">📅 Pick a day</button>`);
  b.push(`<button class="go" onclick="G={ph:'menu'};MS='home';ui()">🏠 Menu</button>`);
  return `<div class="two">${b.join("")}</div>`;
}

function endBody() {
  const c = meta.camp, sum = c.best.reduce((a, b) => a + b, 0);
  return `<div style="text-align:center"><span class="fw">🎆</span><span class="fw" style="animation-delay:.2s">🌙</span><span class="fw" style="animation-delay:.4s">🏠</span><span class="fw" style="animation-delay:.6s">🎇</span><h2 class="mh">🎉 OUTPOST COMPLETE! 🎉</h2></div><div class="panel"><p>You did it, Space Explorer! 👩‍🚀 In 3 days you built a whole Moon outpost:</p>${DAYS.map(d => `<div class="row"><div>${d.bi} <b>${d.st}</b><small>Day ${d.n} · best score ${c.best[d.n - 1] || 0} ⭐ · ${d.perk}</small></div><b>✅</b></div>`).join("")}<p>⭐ Total best score: <b>${sum}</b></p></div><div class="panel"><h2>🎓 What you learned</h2><ul><li>☀️ Flares come in C (small), M (medium) and X (BIG). M and X can knock out radio and robots!</li><li>🌪️ A CME takes hours to days to arrive, so a countdown gives you time to get ready.</li><li>🌩️ The Kp number (0 to 9) shows how strong a magnet storm is. 9 is extreme!</li><li>☢️ Super-fast Sun particles are dangerous outside, so hide in the shielded base.</li><li>🥬 A greenhouse needs power and water, but it makes fresh food and air!</li></ul></div><p class="mut">⭐ Want a better score? Pick any day and play it again!</p>`;
}

const endingHTML = rep => rep ? `<div class="mwrap">${endBody()}${BACK}</div>` : `<div style="max-width:560px;margin:0 auto">${endBody()}<button class="go" onclick="G.endScr=0;ui()">Continue ➜</button></div>`;

const diffHTML = () => `<div class="mwrap"><h2 class="mh">🎚️ Pick your level!</h2><div class="panel"><p>How brave are you today, Space Explorer? 🧑‍🚀</p></div>${DIF.map((d, i) => mb(d.c, `${d.e} ${d.n}<small>${d.h}</small>`, `SEL.dif=${i};nav('len')`)).join("")}${BACK}</div>`;

const lenHTML = () => {
  const d = DIF[SEL.dif];
  return `<div class="mwrap"><h2 class="mh">⏱️ How long?</h2><div class="panel"><p>Level: <b>${d.e} ${d.n}</b></p><p>Dig up shiny rocks 🪨, hide from the Sun's sneezes ☀️🤧 and dodge space rocks ☄️!</p><p>📡 Real flares from NASA show up in your game!</p><p>♾️ Best endless score: <b>${meta.rec.eb || 0}</b></p></div>${mb("g", "🐣 Quick Trip<small>5 minutes · pick a day next</small>", "SEL.dur=300;SEL.end=0;nav('day')")}${mb("o", "🦖 Long Trip<small>10 minutes · pick a day next</small>", "SEL.dur=600;SEL.end=0;nav('day')")}${mb("p", "♾️ Endless<small>No timer! Press End trip in the base when done</small>", "SEL.end=1;begin(300)")}<button class="mb y bk" onclick="nav('play')">⬅ Back</button></div>`;
};

const dayHTML = () => {
  const d = DIF[SEL.dif], c = meta.camp;
  return `<div class="mwrap"><h2 class="mh">📅 Pick a day!</h2><div class="panel"><p>${d.e} ${d.n} · ${SEL.dur / 60} minutes. Build the outpost one stage each day!</p><p style="font-size:1.8rem;text-align:center;margin:2px">${DAYS.map((x, i) => c.done[i] ? x.bi : "🔲").join(" ")}</p></div>${DAYS.map((x, i) => {
    const open = i == 0 || c.done[i - 1], done = c.done[i];
    return `<div class="panel"><h2>${x.em} Day ${x.n}: ${x.t}</h2><p>${x.d}</p><p>🏗️ Build: <b>${x.bi} ${x.st}</b><br>🎁 ${x.perk}<br>🎯 Goal: <b>${dayGoal(i)} ⭐</b></p><p>${done ? "✅ Built! Best score: " + c.best[i] : open ? "🏗️ Ready to build" : "🔒 Finish Day " + i + " first"}</p><button class="go" ${open ? "" : "disabled"} onclick="SEL.day=${i + 1};begin(SEL.dur)">${!open ? "🔒 Locked" : done ? "🔁 Play Day " + x.n + " again" : "▶ Play Day " + x.n}</button></div>`;
  }).join("")}<button class="mb y bk" onclick="nav('len')">⬅ Back</button></div>`;
};

function menuHTML() {
  const s = MS, r = meta.rec;
  if (s == "play") return diffHTML();
  if (s == "school") return schoolHTML();
  if (s == "len") return lenHTML();
  if (s == "day") return dayHTML();
  if (s == "ending") return endingHTML(1);
  if (s == "play0") return `<div class="mwrap"><h2 class="mh">🚀 Pick your trip!</h2><div class="panel"><p>Dig up shiny rocks 🪨, hide from the Sun's sneezes ☀️🤧 and dodge space rocks ☄️!</p><p>📡 Real flares from NASA will show up in your game!</p></div>${mb("g", "🐣 Quick Trip<small>5 minutes</small>", "begin(300)")}${mb("o", "🦖 Long Trip<small>10 minutes</small>", "begin(600)")}${BACK}</div>`;
  if (s == "set") {
    const row = (k, e, n, h) => `<div class="row"><div>${e} ${n}<small>${h}</small></div><button class="tg ${meta.set[k] ? "on" : ""}" onclick="tog('${k}')" aria-pressed="${!!meta.set[k]}">${meta.set[k] ? "ON" : "OFF"}</button></div>`;
    return `<div class="mwrap"><h2 class="mh">⚙️ Settings</h2><div class="panel">${row("snd", "🔊", "Sounds", "Beeps and boops")}${row("shk", "📳", "Shaky screen", "When space rocks go BOOM")}${row("tip", "💡", "Helper tips", "A friend gives tips while you play")}<div class="row"><div>📡 NASA news<small>${esc(NS.busy ? "Calling NASA…" : NS.st == "live" ? "Live right now!" : NS.st == "cache" ? "Using a saved copy" : "Using old examples")}</small></div><button class="tg on" ${NS.busy ? "disabled" : ""} onclick="loadNasa()">🔄</button></div><div class="row"><div>🗑️ Start over<small>Erase upgrades and records</small></div><button class="tg" onclick="if(confirm('Erase everything?')){meta=defMeta();save();ui()}">Erase</button></div></div>${BACK}</div>`;
  }
  if (s == "rec") {
    const c = (e, n, v) => `<div class="rc"><span>${e}</span><b>${v}</b><small>${n}</small></div>`;
    return `<div class="mwrap"><h2 class="mh">🏆 My Records</h2><div class="rg">${c("🐣", "Best 5 minute score", r.b300)}${c("🦖", "Best 10 minute score", r.b600)}${c("🎖️", "Best grade", r.gr)}${c("🚀", "Trips finished", r.runs)}${c("🪨", "Rocks banked", r.rocks)}${c("⭐", "Total points", r.pts)}${c("🌈", "Moon Opals found", r.opals)}${c("💫", "Faint spells", r.blk)}${c("🔧", "Problems fixed", r.fix)}${c("🎯", "Missions done", r.mis)}${c("♾️", "Best endless score", r.eb || 0)}${c("🏗️", "Outpost stages built", meta.camp.done.reduce((a, b) => a + b, 0) + "/3")}</div>${BACK}</div>`;
  }
  if (s == "shop") return `<div class="mwrap"><h2 class="mh">🛒 Space Shop</h2><div class="panel">${shop()}</div>${BACK}</div>`;
  if (s == "book") return `<div class="mwrap"><h2 class="mh">📖 Rock Book</h2><div class="panel">${T.map(bookRow).join("")}</div>${BACK}</div>`;
  if (s == "nasa") {
    const m = mood(), top = NS.flares.slice().sort((a, b) => fr(b) - fr(a)).slice(0, 6), I = { C: "🐣", M: "🐯", X: "🦖" }, W = { C: "little", M: "medium", X: "GIANT" };
    const st = NS.busy ? "☎️ Calling NASA…" : NS.st == "live" ? "🟢 LIVE from NASA" : NS.st == "cache" ? "💾 Saved copy from last time" : "📼 Old examples (couldn't reach NASA)";
    return `<div class="mwrap"><h2 class="mh">📡 NASA News</h2><div class="panel"><span class="chip">${st}</span><p class="mood">${m.e}</p><p style="text-align:center"><b>${esc(m.t)}</b></p><p>☀️ A <b>solar flare</b> is a flash of light when the Sun sneezes! NASA watches them so astronauts stay safe.</p><p>🐣 C = little · 🐯 M = medium · 🦖 X = GIANT</p></div><div class="panel"><h2>${NS.st == "sample" ? "📼 Old NASA flares" : "🔥 Biggest flares this month"}</h2>${top.length ? top.map(f => `<div class="row"><div>${I[f.cls[0]]} <b>${esc(f.cls)}</b> · ${fmtD(f.t)}<small>${W[f.cls[0]]} flare · spot on the Sun: ${esc(f.loc)}${f.ar ? ` · region ${esc(f.ar)}` : ""}${f.id ? ` · ${esc(f.id)}` : ""}${rScale(f.cls) ? ` · radio blackout level R${rScale(f.cls)}` : ""}</small></div></div>`).join("") : "<p>😴 No flares at all! The Sun is napping.</p>"}${NS.st != "sample" && NS.cmes ? `<div class="row"><div>🌪️ <b>${NS.cmes}</b> Sun-burps (CMEs) this month<small>A CME is a giant bubble of Sun stuff zooming into space. Fastest: about ${NS.fast} km/s 🏎️</small></div></div>` : ""}${NS.st != "sample" && (NS.gst.length || NS.sep) ? `<div class="row"><div>🌩️ <b>${NS.gst.length}</b> magnet storms · ☢️ <b>${NS.sep}</b> particle storms<small>Real counts from NASA this month. Strongest magnet storm: Kp ${NS.gst.reduce((m, g) => Math.max(m, g.kp), 0)}</small></div></div>` : ""}<p class="sm">Data: NASA DONKI (ccmc.gsfc.nasa.gov). These flares and storms appear in your game!</p></div><button class="mb c bk" ${NS.busy ? "disabled" : ""} onclick="loadNasa()">🔄 Ask NASA again</button>${BACK}</div>`;
  }
  return `<div class="mwrap"><div class="logo"><span class="mo">🌙</span><h1>MOON<br>OUTPOST</h1><p>🚀 Hi, Space Explorer! 🌟</p></div><div class="mbs">${mb("g", "▶ PLAY", "nav('play')")}${mb("c", "🎓 TUTORIAL<small>Learn how to play!</small>", "askTut()")}${mb("b", "⚙️ SETTINGS", "nav('set')")}${mb("o", "📚 SPACE SCHOOL<small>Learn, super easy facts and quizzes</small>", "SCH.sec='home';nav('school')")}${meta.camp.fin ? mb("p", "🎬 Watch the Ending", "nav('ending')") : ""}</div><div class="mini">${mb("p", "🛒 Shop", "nav('shop')")}${mb("c", "📡 NASA News", "nav('nasa')")}${mb("y", "📖 Rock Book", "nav('book')")}${mb("y", "🏆 Records", "nav('rec')")}</div><div class="tick"><span>${esc(tickerText())}</span></div></div>`;
}

function ui() {
  const o = $("#ov"), pl = G.ph == "play" && !G.pause;
  $("#ctl").style.display = G.ph == "play" ? "flex" : "none";
  cv.style.display = pl ? "block" : "none";
  hud();
  $("#tip").hidden = !(pl && (meta.set.tip || G.tut));
  $("#mc").style.display = G.ph == "menu" ? "block" : "none";
  o.className = G.ph == "menu" ? "menu" : "";
  document.querySelectorAll(".hud,.info").forEach(e => e.style.display = G.ph == "play" ? "" : "none");
  if (pl) {
    o.hidden = true;
    return;
  }
  o.hidden = false;

  if (G.ph == "menu") o.innerHTML = menuHTML();
  else if (G.pause) o.innerHTML = baseHTML();
  else if (G.endScr) o.innerHTML = endingHTML(0);
  else {
    const g = grade(G.score);
    o.innerHTML = dayBanner() + `<p class="big">${g}</p>${G.nb ? '<h2 style="text-align:center;color:#ffd24a">🎉 NEW RECORD! 🏆</h2>' : ""}<h2 style="text-align:center">🚀 The rescue shuttle came!</h2><p style="text-align:center">⭐ ${G.score} points banked<br>${T.map((t, i) => G.tally[i] ? `<span style="color:${t[3]}">■</span> ${t[0]} ×${G.tally[i]}` : "").filter(Boolean).join(" · ") || "No rocks banked"}</p>${missionsHTML()}<h2>🎓 Space school!</h2><ul>${lessons().map(x => `<li>${x}</li>`).join("")}</ul>${shop()}${endBtns()}<button onclick="if(confirm('Erase all upgrades?')){meta=defMeta();save();ui()}">Reset progress</button>`;
  }
}

// Space School Encyclopedia & Quizzes
const phRow = (e, n, t, g, u) => `<details class="ph"><summary>${e} ${n}</summary><p>${t}</p>${g ? `<p class="gm">🎮 In the game: ${g}</p>` : ""}<a href="${SW}${u}" target="_blank" rel="noopener noreferrer">🔗 Grown-up page (spaceweather.gov)</a></details>`;
const lk = (u, t) => `<li><a href="${u}" target="_blank" rel="noopener noreferrer">${t}</a></li>`;

function sideBody() {
  if (SS == "quiz") return quizBody();
  if (SS == "sun") return `<p>🌞 The Sun changes all the time, from hours to years! Tap a card to learn.</p>${SUN.map(x => phRow(...x)).join("")}`;
  if (SS == "earth") return `<p>🌍 What happens when sun-stuff reaches Earth?</p>${EARTH.map(x => phRow(...x)).join("")}<p><b>Real-life helpers:</b></p>${IMP.map(x => phRow(...x)).join("")}`;
  if (SS == "fix") return `<p>🔧 Problems can pop up. Here is how to fix them!</p>
<div class="fixrow"><b>📻 Radio blackout</b>Cause: a medium or giant flare. Fix: go into the base and hold R for 3 seconds. Real life: operators switch to other frequencies or wait.</div>
<div class="fixrow"><b>🛰️ GPS wobble</b>Cause: a bumpy ionosphere. Fix: base + hold R. Real life: GPS users wait, or use extra tools that correct errors.</div>
<div class="fixrow"><b>⚡ Power surge</b>Cause: a magnet storm from a CME. Fix: base + hold R, then press B and give the small power to what matters most. Real life: power companies adjust the grid.</div>
<div class="fixrow"><b>🌫️ Sticky Moon dust</b>Cause: the Moon's scratchy, clingy dust. Fix: hold R for 2 seconds anywhere. Real life: Apollo astronauts brushed dust off, but it still clung to everything!</div>
<div class="fixrow"><b>☀️ Flare or radiation</b>Fix: run into the base and keep the shield powered. M and X flares also knock out robots with no shield (your rover goes OFFLINE if the shield has under 10 kW) and Sun particles (SEP) drain your stamina outside.</div><div class="fixrow"><b>🌪️ CME countdown</b>A CME takes hours to days in real life, so you get a countdown. Be in the base and put power in the 🛡️ shield first (try the Storm protocol button in Base, Power). 🍅 Tomato power-up helps too.</div>
<div class="fixrow"><b>💨 Low air</b>Fix: go home or grab 🧊 Water Ice.</div>
<div class="fixrow"><b>🍎 Hungry tummy</b>Fix: eat a meal (F) or buy snacks in the base shop (B, then Food shop). Keys 1-9 or Q eat snacks.</div>
<div class="fixrow"><b>🎯 Missions</b>Finish 3 missions each trip for bonus credits!</div>`;
  if (SS == "api") return `${donkiInfo()}<p>📡 <b>How the game talks to NASA</b></p><ol><li>📞 <b>Ask:</b> the game calls NASA's DONKI. That stands for Database Of Notifications, Knowledge, Information!</li><li>📬 <b>Answer:</b> NASA's computer sends a list of what the Sun did in the last 30 days.</li><li>🔍 <b>Read:</b> we pick out flares (FLR), Sun-burps (CME), magnet storms (GST) and particle storms (SEP).</li><li>🎮 <b>Play:</b> real flares become your flare warnings. Real storms become your magnet storms!</li></ol><p>🔌 If we can't reach NASA, we use a saved copy or a few old real flares.</p><div class="fixrow"><b>Where it asks</b><code>ccmc.gsfc.nasa.gov/DONKI-API/get/FLR</code><br><code>…/get/CME</code> · <code>…/get/GST</code> · <code>…/get/SEP</code></div><div class="fixrow"><b>Right now</b>${NS.busy ? "☎️ Calling NASA…" : NS.st == "live" ? "🟢 Live! " : NS.st == "cache" ? "💾 Using a saved copy. " : "📼 Using old examples. "}Flares: <b>${NS.flares.length}</b> · CMEs: <b>${NS.cmes}</b> · Magnet storms: <b>${NS.gst.length}</b> · Particle storms: <b>${NS.sep}</b></div><p><button onclick="loadNasa()" ${NS.busy ? "disabled" : ""}>🔄 Ask NASA again</button></p><p>⚠️ This is a game, so numbers are simplified. For real forecasts, grown-ups can visit NOAA's Space Weather Prediction Center at <a href="${SW}" target="_blank" rel="noopener noreferrer">spaceweather.gov</a>. Data from NASA's Space Weather Database (<a href="https://ccmc.gsfc.nasa.gov" target="_blank" rel="noopener noreferrer">ccmc.gsfc.nasa.gov</a>).</p>`;
  return `<p>🍽 <b>Space food facts</b> (from NASA and the Canadian Space Agency)</p><ul><li>🌯 Tortillas replace bread because crumbs float.</li><li>🧂 Salt and pepper are liquids so grains don't float into eyes or machines.</li><li>👅 Food tastes blander in space, so spicy sauce is popular.</li><li>🥬 Astronauts grew lettuce, radishes and chili peppers on the space station.</li><li>🍅 Tomatosphere lets classrooms grow tomato seeds that took a space-like trip.</li><li>🧑‍🍳 NASA and the Canadian Space Agency run the Deep Space Food Challenge for long trips.</li><li>🪶 Light, long-lasting food (freeze-dried) is great because every kilo is costly to launch!</li><li>🔥 Astronauts need about 1,900 to 3,200 food-calories (kcal) a day, and spacewalks burn about 200 extra every hour. In the game, being outside uses food faster!</li><li>⚖️ A 4-person crew needs about 10,500 kg of packed food for a 3 year trip, and packed meals are almost half water (about 46%).</li><li>🌱 Greenhouses cost power and water, but give fresh food, oxygen and vitamins.</li><li><a href="https://www.asc-csa.gc.ca/eng/youtheducators/toolkits/food-production/" target="_blank" rel="noopener noreferrer">Canadian Space Agency: Food Production toolkit</a></li></ul><p><b>🎮 Food in the game</b></p><p>Open the base (B) → Food shop. Foods give food, health, stamina or a short power-up. Upgrade 👩‍🍳 Space chef (foods stronger), 🌱 Garden (more meals) and 🗄️ Pantry (more snack slots) to make them better!</p><p><b>📖 Reading list</b></p><ul>${lk(CSA + "astronauts/living-in-space/eating-in-space.asp", "Eating in space")}${lk("https://letstalkscience.ca/news-media/growing-food-in-space-how-canada-tackling-food-security-on-earth-and-beyond", "Growing food in space (Let's Talk Science)")}${lk(CSA + "sciences/food-production/", "Food in space: the challenges")}${lk(CSA + "sciences/food-production/growing-healthy-food-in-space-and-remote-areas.asp", "Growing healthy food in space and remote areas")}${lk(CSA + "sciences/food-production/deep-space-food-challenge.asp", "Deep Space Food Challenge")}${lk(CSA + "satellites/everyday-lives/agriculture-in-the-satellite-age.asp", "Agriculture in the satellite age")}</ul><p><b>🧪 Things to do</b></p><ul>${lk(CSA + "youth-educators/activities/fitness-and-nutrition/", "Food and nutrition activities (Grades 6-9)")}${lk(CSA + "youth-educators/activities/fitness-and-nutrition/interplanetary-farming.asp", "Interplanetary Farming")}${lk(CSA + "youth-educators/activities/fitness-and-nutrition/space-jam-an-astronaut-lunch.asp", "Space Jam! An Astronaut Lunch")}${lk(CSA + "youth-educators/tomatosphere.asp", "Tomatosphere")}${lk(CSA + "youth-educators/activities/tomatosphere-adventure-minecraft-education-game-featuring-extraterrestrial-agriculture.asp", "Tomatosphere Adventure (Minecraft)")}${lk(CSA + "multimedia/search/image/15774", "Infographic: What do explorers eat?")}</ul>`;
}

// Quiz Functions
const qBank = m => m == "easy" ? QZ_EASY : QZ_ALL;
const qKey = (m, n) => m == "easy" ? "e" + n : n;
const qOpts = (m, n) => {
  const q = qBank(m)[n], c = q.length - 2;
  return [...Array(c).keys()].sort(() => Math.random() - .5).map(k => ({ t: q[1 + k], ok: k == 0 }));
};

function qzStart(m) {
  m = m || QS.mode || "big";
  const ix = qBank(m).map((_, i) => i).sort(() => Math.random() - .5).slice(0, 5);
  QS = { st: "q", mode: m, qs: ix, i: 0, s: 0, pick: null, opts: qOpts(m, ix[0]), nw: 0 };
  ui();
}

function qzPick(k) {
  if (QS.st != "q" || QS.pick != null) return;
  QS.pick = k;
  const n = QS.qs[QS.i], key = qKey(QS.mode, n), pr = QS.mode == "easy" ? 3 : 5;
  if (QS.opts[k].ok) {
    QS.s++;
    beep(900, .12);
    if (!meta.quiz.got[key]) {
      meta.quiz.got[key] = 1;
      meta.cr += pr;
      QS.nw += pr;
      save();
    }
  } else {
    beep(200, .2);
  }
  ui();
}

function qzNext() {
  QS.i++;
  QS.pick = null;
  if (QS.i >= QS.qs.length) {
    QS.st = "end";
    const bk = QS.mode == "easy" ? "be" : "best";
    if (QS.s > (meta.quiz[bk] | 0)) {
      meta.quiz[bk] = QS.s;
      save();
    }
  } else {
    QS.opts = qOpts(QS.mode, QS.qs[QS.i]);
  }
  ui();
}

function quizBody() {
  const q = QS, easy = q.mode == "easy";
  if (q.st == "intro") {
    const ge = Object.keys(meta.quiz.got).filter(k => String(k)[0] == "e").length;
    const gb = Object.keys(meta.quiz.got).length - ge;
    return `<p>❓ Pick a quiz! Each one has 5 questions. Get ⭐ stars and win 💰 credits!</p><p>🧸 Tiny quiz: best <b>${meta.quiz.be | 0}/5</b> · learned ${ge}/${QZ_EASY.length}<br>🎓 Big kid quiz: best <b>${meta.quiz.best | 0}/5</b> · learned ${gb}/${QZ_ALL.length}</p><p class="sm">Every new right answer gives credits, one time only (tiny quiz +3, big kid quiz +5).</p><button class="go" onclick="qzStart('easy')">🧸 Tiny quiz (super easy)</button><button class="go" style="background:#7dd3fc" onclick="qzStart('big')">🎓 Big kid quiz</button>`;
  }
  if (q.st == "end") {
    const s = q.s;
    return `<p class="big">${s >= 5 ? "🏆" : s >= 3 ? "🎉" : "💪"}</p><p style="text-align:center"><b>${s} out of 5!</b><br>${"⭐".repeat(s)}${"▫️".repeat(5 - s)}</p><p style="text-align:center">${s >= 5 ? "Perfect! You are a space expert!" : s >= 3 ? "Great job, astronaut!" : "Nice try! Peek at the Learn class and try again!"}</p>${q.nw ? `<p style="text-align:center">🎁 New answers learned: +${q.nw} 💰 credits!</p>` : ""}<button class="go" onclick="qzStart()">🔁 Play again</button><button class="go" style="background:#7dd3fc" onclick="QS.st='intro';ui()">📋 Quiz menu</button>`;
  }
  const Q = qBank(q.mode)[q.qs[q.i]], a = q.pick != null;
  return `<p class="sm">${easy ? "🧸 Tiny quiz" : "🎓 Big kid quiz"} · Question ${q.i + 1} of ${q.qs.length} · ⭐ ${q.s}</p><div class="qq" ${easy ? 'style="font-size:1.25rem"' : ""}>${esc(Q[0])}</div>${q.opts.map((o, k) => `<button class="qo ${a ? (o.ok ? "ok" : q.pick == k ? "no" : "") : ""}" ${a ? "disabled" : ""} ${easy ? 'style="font-size:1.1rem"' : ""} onclick="qzPick(${k})">${"ABC"[k]}. ${esc(o.t)}</button>`).join("")}${a ? `<div class="fixrow"><b>${q.opts[q.pick].ok ? "✅ Yes! You got it!" : "❌ Not quite!"}</b>${esc(Q[Q.length - 1])}</div><button class="go" onclick="qzNext()">${q.i + 1 >= q.qs.length ? "See my stars ➜" : "Next ➜"}</button>` : ""}`;
}

function sch(x) {
  SCH.sec = x;
  ui();
  try { scrollTo(0, 0); } catch (e) {}
}

const bkS = () => `<button class="mb y bk" onclick="sch('home')">⬅ Space School</button>`;

const liveHTML = () => {
  const m = mood(), st = NS.busy ? "☎️ Calling NASA…" : NS.st == "live" ? "🟢 LIVE" : NS.st == "cache" ? "💾 Saved copy" : "📼 Old examples";
  const top = NS.flares.slice(0, 3).map(f => `${f.cls[0] == "X" ? "🦖" : f.cls[0] == "M" ? "🐯" : "🐣"} ${esc(f.cls)} · ${fmtD(f.t)}`).join("<br>");
  return `<div class="lv"><b>📡 Live Sun report</b> <span class="chip">${st}</span><div style="font-size:1.8rem;line-height:1.1">${m.e}</div><div>${esc(m.t)}</div>${top ? `<div style="margin-top:4px;font-size:.82rem">Latest flares:<br>${top}</div>` : ""}</div>`;
};

function schoolHTML() {
  const s = SCH.sec, W = 'style="max-width:640px"';
  if (s == "learn") {
    const TB = [["sun", "🌞 Sun"], ["earth", "🌍 Earth"], ["api", "📡 NASA DONKI"], ["fix", "🔧 Fix-it"], ["food", "🍽 Food"]];
    if (!TB.some(t => t[0] == SS)) SS = "sun";
    return `<div class="mwrap" ${W}><h2 class="mh">📖 Learn</h2><div class="panel">${liveHTML()}<div class="sbtabs">${TB.map(t => `<button class="${SS == t[0] ? "on" : ""}" onclick="SS='${t[0]}';ui()">${t[1]}</button>`).join("")}</div>${sideBody()}</div>${bkS()}</div>`;
  }
  if (s == "easy") {
    return `<div class="mwrap" ${W}><h2 class="mh">🧸 Super Easy</h2><div class="panel"><p>Tiny words for tiny astronauts! 👶🚀</p></div>${EZ.map(x => `<div class="panel ez"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}${mb("g", "🧸 Try the tiny quiz!", "qzStart('easy');sch('quiz')")}${bkS()}</div>`;
  }
  if (s == "quiz") {
    return `<div class="mwrap" ${W}><h2 class="mh">❓ Quizzes</h2><div class="panel">${quizBody()}</div>${bkS()}</div>`;
  }
  return `<div class="mwrap"><h2 class="mh">📚 Space School</h2><div class="panel"><p>Welcome, young astronaut! 🧑‍🚀 Pick a class.</p></div><div class="mbs">${mb("b", "📖 Learn<small>Sun, Earth, NASA DONKI, fixes and food</small>", "sch('learn')")}${mb("g", "🧸 Super Easy<small>Tiny words for age 5</small>", "sch('easy')")}${mb("o", "❓ Quizzes<small>Test yourself and win credits</small>", "sch('quiz')")}</div>${BACK}</div>`;
}

function stab(t) {
  SS = t;
  buildSide();
}

function buildSide() {
  const e = $("#side");
  if (!e) return;
  const TB = [["quiz", "❓ Quiz"], ["fix", "🔧 Fix-it"], ["api", "📡 NASA"], ["food", "🍽 Food"]];
  e.innerHTML = `<h2>📚 Space School</h2><div id="live" class="lv"></div><div class="sbtabs">${TB.map(t => `<button class="${SS == t[0] ? "on" : ""}" onclick="stab('${t[0]}')">${t[1]}</button>`).join("")}</div>${sideBody()}`;
  sideLive();
}

function sideLive() {
  const e = $("#live");
  if (!e) return;
  const m = mood(), st = NS.busy ? "☎️ Calling NASA…" : NS.st == "live" ? "🟢 LIVE" : NS.st == "cache" ? "💾 Saved copy" : "📼 Old examples";
  const top = NS.flares.slice(0, 3).map(f => `${f.cls[0] == "X" ? "🦖" : f.cls[0] == "M" ? "🐯" : "🐣"} ${esc(f.cls)} · ${fmtD(f.t)}`).join("<br>");
  e.innerHTML = `<b>📡 Live Sun report</b> <span class="chip">${st}</span><div style="font-size:1.8rem;line-height:1.1">${m.e}</div><div>${esc(m.t)}</div>${top ? `<div style="margin-top:4px;font-size:.82rem">Latest flares:<br>${top}</div>` : ""}${NS.at ? `<div style="font-size:.75rem;opacity:.8">Asked NASA at ${new Date(NS.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>` : ""}`;
}

// Global Event Listeners
addEventListener("keydown", e => {
  if (/^Digit[1-9]$/.test(e.code) && G.ph == "play" && !G.pause && FOODS[+e.code.slice(5) - 1]) {
    eatFood(FOODS[+e.code.slice(5) - 1].id);
  }
  if (e.code == "KeyB") {
    G.pause ? closeBase() : openBase();
    return;
  }
  if (e.code == "Escape" && G.pause) closeBase();
  const m = KM[e.code];
  if (m && G.ph == "play") {
    K[m] = 1;
    e.preventDefault();
  }
});

addEventListener("keyup", e => {
  const m = KM[e.code];
  if (m) K[m] = 0;
});

addEventListener("blur", () => K = {});

document.querySelectorAll("#ctl button[data-k]").forEach(b => {
  const k = b.dataset.k;
  b.addEventListener("pointerdown", e => {
    e.preventDefault();
    K[k] = 1;
  });
  ["pointerup", "pointerleave", "pointercancel"].forEach(v => {
    b.addEventListener(v, () => K[k] = 0);
  });
});

$("#bb").addEventListener("click", () => {
  G.pause ? closeBase() : openBase();
});
