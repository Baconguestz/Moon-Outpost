/* ==========================================================================
   Moon Outpost - Canvas 2D Procedural Graphics & Animation Engine
   ========================================================================== */

// Background Procedural Lunar Surface Pre-rendering
const bg = document.createElement("canvas");
bg.width = WW;
bg.height = WH;
const bx = bg.getContext("2d");
const CR = [];

(function () {
  for (let x = 0; x < WW; x += 4) {
    for (let y = 0; y < WH; y += 4) {
      const z = zone(x, y);
      bx.fillStyle = (z == 3 && Math.random() < .012) ? "#dff6ff" : PAL[z][Math.random() * 4 | 0];
      bx.fillRect(x, y, 4, 4);
    }
  }
  for (let i = 0; i < 90; i++) {
    const x = 60 + Math.random() * (WW - 120);
    const y = 60 + Math.random() * (WH - 120);
    const r = 14 + Math.random() * 52;
    if (Math.hypot(x - 1600, y - 1000) < r + 260) {
      i--;
      continue;
    }
    CR.push({ x, y, r });
    for (let tx = x - r; tx < x + r; tx += 4) {
      for (let ty = y - r; ty < y + r; ty += 4) {
        const d = Math.hypot(tx - x, ty - y);
        if (d < r * .82) {
          bx.fillStyle = (tx + ty) % 8 ? "#4d5068" : "#565972";
          bx.fillRect(tx, ty, 4, 4);
        } else if (d < r) {
          bx.fillStyle = ty < y ? "#bcc0d4" : "#41445a";
          bx.fillRect(tx, ty, 4, 4);
        }
      }
    }
  }
})();

// Drawing Primitives
function rr(c, x, y, w, h, r) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

// Procedural Astronaut Rendering
function astro(c, x, y, fx, t, mv, spr, mine, exp, hop) {
  c.save();
  c.translate(x, y);
  c.scale(fx, 1);
  if (spr) c.rotate(.12);
  else if (mv) c.rotate(.05);

  const w = mv ? Math.sin(t) : Math.sin(Date.now() / 500) * .15;
  const bob = mv ? -(hop == null ? Math.abs(Math.sin(t)) * 3 : hop) : Math.sin(Date.now() / 500);

  // Shadow
  c.fillStyle = "rgba(0,0,0,.3)";
  c.beginPath();
  c.ellipse(0, 21, 14 - (hop || 0) * .3, 4 - (hop || 0) * .1, 0, 0, 7);
  c.fill();
  c.strokeStyle = "#12192f";
  c.lineWidth = 2;

  // Legs & Boots
  [-1, 1].forEach(s => {
    const lx = s * 5 + w * s * 6;
    const ly = bob + 8 - (mv ? Math.max(0, Math.cos(t + (s > 0 ? 0 : 3.14))) * 3 : 0);
    c.fillStyle = s > 0 ? "#fff" : "#cfd4e4";
    rr(c, lx - 4, ly, 8, 11, 3);
    c.fill();
    c.stroke();
    c.fillStyle = "#3b4260";
    rr(c, lx - 5, ly + 9, 11, 6, 3);
    c.fill();
    c.stroke();
  });

  // Backpack
  c.fillStyle = "#8d93a8";
  rr(c, -21, -10 + bob, 10, 22, 3);
  c.fill();
  c.stroke();
  c.strokeStyle = "#6b7088";
  c.beginPath();
  c.moveTo(-12, -2 + bob);
  c.lineTo(-6, -2 + bob);
  c.stroke();
  c.strokeStyle = "#12192f";

  // Torso / Life Support Pack
  c.fillStyle = exp > 30 ? "#ffb3a8" : "#fff";
  rr(c, -12, -9 + bob, 24, 21, 7);
  c.fill();
  c.stroke();
  c.fillStyle = "#ff7a1a";
  c.fillRect(-11, 3 + bob, 22, 4);
  c.fillStyle = "#2c3350";
  rr(c, -5, -4 + bob, 10, 6, 2);
  c.fill();
  c.fillStyle = "#4ade80";
  c.fillRect(-3, -3 + bob, 3, 3);
  c.fillStyle = (Date.now() / 300 | 0) % 2 ? "#f5b301" : "#7a5a00";
  c.fillRect(1, -3 + bob, 3, 3);

  // Left Arm
  c.fillStyle = "#cfd4e4";
  c.save();
  c.translate(-8, -3 + bob);
  c.rotate(w * .9);
  rr(c, -3, 0, 7, 13, 3);
  c.fill();
  c.stroke();
  c.restore();

  // Right Arm (mining or walking)
  c.save();
  c.translate(8, -3 + bob);
  if (mine) {
    c.rotate(-1.25 + Math.sin(Date.now() / 60) * .25);
    c.fillStyle = "#fff";
    rr(c, -3, 0, 7, 12, 3);
    c.fill();
    c.stroke();
    c.fillStyle = "#6b7088";
    c.fillRect(-1, 11, 5, 12);
    c.fillStyle = "#ffd24a";
    c.fillRect(0, 22, 3, 4);
  } else {
    c.rotate(-w * .9);
    c.fillStyle = "#fff";
    rr(c, -3, 0, 7, 13, 3);
    c.fill();
    c.stroke();
  }
  c.restore();

  // Helmet & Gold/Blue Visor
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(1, -17 + bob, 14, 0, 7);
  c.fill();
  c.stroke();
  c.fillStyle = "#2a9df4";
  c.beginPath();
  c.ellipse(6, -17 + bob, 10, 8, 0, 0, 7);
  c.fill();
  c.stroke();
  c.fillStyle = "#bfe6ff";
  c.beginPath();
  c.ellipse(3, -20 + bob, 4, 2, -.4, 0, 7);
  c.fill();
  c.restore();
}

// Procedural Base Drawing
function base(c) {
  const t = Date.now() / 1000;
  const pw = G.pw || { l: 10, g: 10, s: 10 };
  const fl = G.fs == 1 && (t * 3 | 0) % 2;
  const O = "#12192f";
  c.lineWidth = 2;

  // Foundation
  c.fillStyle = "#555a70";
  c.strokeStyle = O;
  c.beginPath();
  c.arc(1500, 1135, 46, 0, 7);
  c.fill();
  c.stroke();
  c.strokeStyle = "#ffd24a";
  c.beginPath();
  c.arc(1500, 1135, 36, 0, 7);
  c.stroke();
  c.fillStyle = "#ffd24a";
  c.fillRect(1494, 1125, 3, 20);
  c.fillRect(1503, 1125, 3, 20);
  c.fillRect(1494, 1133, 12, 3);

  // Solar Panels
  const n = 2 + L("gen");
  for (let i = 0; i < n; i++) {
    const px = 1436 - 36 * (i + 1);
    c.fillStyle = "#244a9a";
    c.strokeStyle = O;
    c.fillRect(px, 1010, 32, 24);
    c.strokeRect(px, 1010, 32, 24);
    c.strokeStyle = "#6fa0ff";
    c.beginPath();
    c.moveTo(px + 16, 1010);
    c.lineTo(px + 16, 1034);
    c.moveTo(px, 1022);
    c.lineTo(px + 32, 1022);
    c.stroke();
    c.fillStyle = `rgba(255,255,255,${.2 + .2 * Math.sin(t * 2 + i)})`;
    c.fillRect(px + 2, 1012, 10, 6);
  }

  // Connecting Tunnels
  c.strokeStyle = "#6b7088";
  c.lineWidth = 5;
  c.beginPath();
  c.moveTo(1520, 1035);
  c.lineTo(1530, 1035);
  c.moveTo(1690, 1035);
  c.lineTo(1706, 1035);
  c.stroke();
  c.lineWidth = 2;
  c.strokeStyle = O;

  // Generator & Power Core
  c.fillStyle = "#7d84a0";
  rr(c, 1440, 985, 80, 75, 8);
  c.fill();
  c.stroke();
  c.fillStyle = `rgba(255,200,60,${.4 + .5 * (.5 + .5 * Math.sin(t * 4))})`;
  c.beginPath();
  c.arc(1480, 1030, 14, 0, 7);
  c.fill();
  c.stroke();
  c.fillStyle = "#3b4260";
  c.fillRect(1448, 995, 24, 8);
  c.fillRect(1448, 1006, 24, 8);

  // Shield Tower & Pulsing Rings
  const sg = pw.s / 25;
  c.fillStyle = "#9aa1ba";
  c.fillRect(1476, 935, 8, 52);
  c.strokeRect(1476, 935, 8, 52);
  for (let i = 0; i < 3; i++) {
    c.strokeStyle = `rgba(80,220,255,${.25 + .7 * sg})`;
    c.lineWidth = 2 + sg * 2;
    c.beginPath();
    c.ellipse(1480, 930, 10 + i * 7 + (G.fs == 2 ? Math.sin(t * 6 + i) * 3 : 0), 5 + i * 3, 0, 0, 7);
    c.stroke();
  }
  c.lineWidth = 2;
  c.strokeStyle = O;

  // Main Living Habitat Dome
  let g = c.createLinearGradient(0, 960, 0, 1060);
  g.addColorStop(0, "#f2f4fa");
  g.addColorStop(1, "#a9b0c6");
  c.fillStyle = g;
  rr(c, 1530, 960, 160, 100, 14);
  c.fill();
  c.stroke();
  c.strokeStyle = "#c3c9dc";
  c.beginPath();
  c.moveTo(1530, 975);
  c.lineTo(1690, 975);
  c.stroke();
  c.strokeStyle = O;

  // Hab Windows
  for (let i = 0; i < 3; i++) {
    c.fillStyle = fl ? "#ff9a3c" : "#ffd86b";
    rr(c, 1544 + i * 38, 990, 28, 16, 4);
    c.fill();
    c.stroke();
  }

  // Airlock Door
  c.fillStyle = "#1d2238";
  rr(c, 1595, 1015, 30, 45, 3);
  c.fill();
  c.stroke();
  c.fillStyle = "#8d96b4";
  const dw = 15 * (1 - (G.door || 0));
  c.fillRect(1595, 1015, dw, 45);
  c.fillRect(1625 - dw, 1015, dw, 45);

  // Communications Dish
  c.save();
  c.translate(1660, 956);
  c.strokeStyle = O;
  c.beginPath();
  c.moveTo(0, 0);
  c.lineTo(0, -12);
  c.stroke();
  c.rotate(Math.sin(t) * .5);
  c.fillStyle = "#e8ebf5";
  c.beginPath();
  c.ellipse(0, -14, 16, 6, 0, 0, 7);
  c.fill();
  c.stroke();
  c.restore();

  // Status Beacon
  c.fillStyle = (t * 2 | 0) % 2 ? "#ff4d4d" : "#7a2020";
  c.beginPath();
  c.arc(1540, 960, 3, 0, 7);
  c.fill();

  // Greenhouse Dome & Hydroponic Plants
  const gg = pw.g / 25;
  c.fillStyle = `rgba(150,235,160,${.3 + .3 * gg})`;
  c.beginPath();
  c.ellipse(1736, 1030, 36, 40, 0, Math.PI, 0);
  c.lineTo(1772, 1070);
  c.lineTo(1700, 1070);
  c.fill();
  c.strokeStyle = "#cdeccf";
  c.stroke();

  for (let i = 0; i < 5; i++) {
    const px = 1710 + i * 12;
    const h = 8 + gg * 14 + (i % 2) * 4;
    c.save();
    c.translate(px, 1068);
    c.rotate(Math.sin(t * 1.5 + i) * .15 * gg);
    c.fillStyle = "#3d9a4e";
    c.fillRect(-2, -h, 4, h);
    c.fillStyle = "#7fe08c";
    c.fillRect(-6, -h, 12, 4);
    c.restore();
  }
}

// Rover Drawing
function rover(c, q) {
  c.save();
  c.translate(q.x, q.y + Math.sin(q.a * .5) * .8);
  if (q.off) {
    c.fillStyle = "#ef4444";
    c.font = "bold 11px sans-serif";
    c.textAlign = "center";
    c.fillText("OFFLINE", 0, -26);
  }
  c.scale(q.fx, 1);
  c.strokeStyle = "#12192f";
  c.lineWidth = 2;
  c.fillStyle = "#f5b301";
  rr(c, -14, -9, 28, 12, 3);
  c.fill();
  c.stroke();
  c.fillStyle = "#38bdf8";
  rr(c, 1, -16, 12, 8, 2);
  c.fill();
  c.stroke();

  // Wheels
  [-9, 9].forEach(x => {
    c.fillStyle = "#2a2e44";
    c.beginPath();
    c.arc(x, 5, 5, 0, 7);
    c.fill();
    c.stroke();
    c.strokeStyle = "#aab";
    c.beginPath();
    c.moveTo(x, 5);
    c.lineTo(x + Math.cos(q.a) * 4, 5 + Math.sin(q.a) * 4);
    c.stroke();
    c.strokeStyle = "#12192f";
  });

  // Antenna
  c.beginPath();
  c.moveTo(-10, -9);
  c.lineTo(-10, -17);
  c.stroke();
  c.fillStyle = (Date.now() / 300 | 0) % 2 ? "#4ade80" : "#14532d";
  c.fillRect(-12, -20, 4, 4);
  c.restore();
}

// Campaign Construction Site
function site(c) {
  if (!G.day) return;
  const t = Date.now() / 1000;
  const x = 1800, y = 1062, w = 86;
  c.save();
  c.lineWidth = 2;
  c.strokeStyle = "#12192f";
  c.textAlign = "center";

  for (let i = 0; i < G.day - 1; i++) {
    c.font = "26px sans-serif";
    c.fillText(DAYS[i].bi, x + 16 + i * 34, y + 34);
  }

  const p = Math.min(1, G.score / G.goal);
  const st = p >= 1 ? 3 : p >= .66 ? 2 : p >= .33 ? 1 : 0;

  c.fillStyle = "#6b7088";
  c.fillRect(x - 6, y, w + 12, 9);
  c.strokeRect(x - 6, y, w + 12, 9);
  c.strokeStyle = "#facc15";
  c.setLineDash([6, 5]);
  c.strokeRect(x, y - 80, w, 80);
  c.setLineDash([]);
  c.strokeStyle = "#12192f";

  if (st >= 1) {
    c.fillStyle = "#9aa1ba";
    c.fillRect(x + 4, y - 22, w - 8, 22);
    c.strokeRect(x + 4, y - 22, w - 8, 22);
  }
  if (st >= 2) {
    c.fillStyle = "#cfd4e4";
    c.fillRect(x + 10, y - 52, w - 20, 30);
    c.strokeRect(x + 10, y - 52, w - 20, 30);
  }
  if (st >= 3) {
    c.fillStyle = "#4ade80";
    c.fillRect(x + 16, y - 76, w - 32, 24);
    c.strokeRect(x + 16, y - 76, w - 32, 24);
    c.font = "30px sans-serif";
    c.fillText(DAYS[G.day - 1].bi, x + w / 2, y - 86 + Math.sin(t * 3) * 3);
  }

  const tx = st >= 3 ? "✅ BUILT!" : "🏗️ " + Math.round(p * 100) + "%";
  c.font = "bold 12px sans-serif";
  c.lineWidth = 3;
  c.strokeStyle = "#14123a";
  c.strokeText(tx, x + w / 2, y - 120);
  c.fillStyle = "#fff";
  c.fillText(tx, x + w / 2, y - 120);
  c.restore();
}

// Directional Compass Arrow
function ptr(c, sx, sy, lb, col, d) {
  const b = Math.sin(Date.now() / 180) * 6;
  c.save();
  c.lineWidth = 4;
  c.strokeStyle = "#14123a";
  c.fillStyle = col;
  c.textAlign = "center";

  if (sx > 30 && sx < VW - 30 && sy > 70 && sy < VH - 30) {
    c.beginPath();
    c.moveTo(sx, sy + b);
    c.lineTo(sx - 16, sy - 26 + b);
    c.lineTo(sx + 16, sy - 26 + b);
    c.closePath();
    c.stroke();
    c.fill();
    c.font = "bold 15px sans-serif";
    c.strokeText(lb, sx, sy - 34 + b);
    c.fillStyle = "#fff";
    c.fillText(lb, sx, sy - 34 + b);
  } else {
    const a = Math.atan2(sy - VH / 2, sx - VW / 2);
    const k = Math.min((VW / 2 - 46) / Math.abs(Math.cos(a)), (VH / 2 - 46) / Math.abs(Math.sin(a)));
    const px = VW / 2 + Math.cos(a) * k;
    const py = VH / 2 + Math.sin(a) * k;
    c.translate(px, py);
    c.beginPath();
    c.arc(0, 0, 26, 0, 7);
    c.fillStyle = "#14123add";
    c.fill();
    c.strokeStyle = col;
    c.stroke();
    c.save();
    c.rotate(a);
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(21 + b / 2, 0);
    c.lineTo(2, -13);
    c.lineTo(2, 13);
    c.closePath();
    c.fill();
    c.restore();

    const t = `${lb} ${Math.round(d / 10)} m`;
    c.font = "bold 13px sans-serif";
    c.strokeStyle = "#14123a";
    c.lineWidth = 4;
    c.strokeText(t, -Math.cos(a) * 50, -Math.sin(a) * 40 + 4);
    c.fillStyle = "#fff";
    c.fillText(t, -Math.cos(a) * 50, -Math.sin(a) * 40 + 4);
  }
  c.restore();
}

function pointers(c, ox, oy) {
  if (G.tut) {
    const t = G.tut.tg;
    if (t) ptr(c, t.x - ox, t.y - oy, "👆 Here!", "#facc15", Math.hypot(t.x - G.x, t.y - G.y));
    return;
  }
  if (!inB(G.x, G.y)) {
    const bx = Z.x + Z.w / 2;
    const by = Z.y + Z.h / 2;
    ptr(c, bx - ox, Z.y - 20 - oy, "🏠 BASE", "#4ade80", Math.hypot(bx - G.x, by - G.y));
  }
}

// Banner Notification Cards
function drawPops(c) {
  (G.pops || []).forEach((p, i) => {
    const y = 96 + i * 106;
    const a = Math.min(1, p.l * 2);
    const b = Math.sin(Date.now() / 150) * 2;
    c.save();
    c.globalAlpha = a;
    c.fillStyle = "#fff9e6";
    c.strokeStyle = (Date.now() / 250 | 0) % 2 ? "#ef4444" : "#14123a";
    c.lineWidth = 5;
    c.beginPath();
    c.roundRect(130, y + b, 540, 92, 18);
    c.fill();
    c.stroke();
    c.fillStyle = "#14123a";
    c.textAlign = "left";
    c.font = "42px sans-serif";
    c.fillText(p.e, 146, y + b + 60);
    c.font = "bold 22px sans-serif";
    c.fillText(p.h, 206, y + b + 36);
    c.font = "600 15px sans-serif";
    c.fillText(p.m, 206, y + b + 66);
    c.restore();
  });
}

// Main In-Game Frame Rendering
function draw() {
  const c = cx;
  if (!G.rocks) return;
  const ox = clamp(G.x - VW / 2, 0, WW - VW) + (Math.random() - .5) * G.shake;
  const oy = clamp(G.y - VH / 2, 0, WH - VH) + (Math.random() - .5) * G.shake;

  c.setTransform(1, 0, 0, 1, 0, 0);
  c.drawImage(bg, -ox, -oy);
  c.translate(-ox, -oy);
  c.lineWidth = 2;

  // Impact Scars
  G.scars.forEach(s => {
    c.fillStyle = "rgba(20,20,35,.45)";
    c.beginPath();
    c.ellipse(s.x, s.y, 22, 15, 0, 0, 7);
    c.fill();
  });

  // Base Drop Shadow & Building
  c.fillStyle = "rgba(0,0,0,.28)";
  c.fillRect(1430, 1050, 350, 20);
  base(c);
  site(c);

  // Rocks & Minerals
  G.rocks.forEach(r => {
    if (Math.abs(r.x - G.x) > 480 || Math.abs(r.y - G.y) > 300) return;
    const t = T[r.k];
    const s = 5 + r.k * 1.1;
    c.save();
    c.shadowColor = t[3];
    c.shadowBlur = r.k > 2 ? 14 : 0;
    c.fillStyle = t[3];
    c.strokeStyle = "#161a2c";
    c.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = i * 1.047 + r.x;
      c.lineTo(r.x + Math.cos(a) * s * (i % 2 ? 1 : .85), r.y + Math.sin(a) * s * .8);
    }
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
    c.fillStyle = "#fff8";
    c.fillRect(r.x - 3, r.y - 3, 3, 2);

    if (r.life) {
      c.strokeStyle = "#ffd24a";
      c.beginPath();
      c.arc(r.x, r.y, s + 6, -1.57, -1.57 + 6.28 * r.life / 20);
      c.stroke();
    }
  });

  // Asteroid Telegraphing Circles
  G.mt.forEach(m => {
    if (m.x && !m.d) {
      const k = (G.t - m.t) / 2.2;
      c.strokeStyle = "rgba(255,60,60,.9)";
      c.beginPath();
      c.arc(m.x, m.y, 44 * k, 0, 7);
      c.stroke();
      c.fillStyle = "rgba(255,60,60,.2)";
      c.beginPath();
      c.arc(m.x, m.y, 44, 0, 7);
      c.fill();
    }
  });

  rover(c, G.rv);

  // Particle Effects
  G.pt.forEach(p => {
    c.fillStyle = p.c;
    c.globalAlpha = Math.min(1, p.l * 2.5);
    c.fillRect(p.x, p.y, 4, 4);
  });
  c.globalAlpha = 1;

  astro(c, G.x, G.y, G.fx, G.hph, G.mv || Math.abs(G.vx) > 12 || Math.abs(G.vy) > 12, G.spr, G.mr && K.mine, G.exp, Math.abs(Math.sin(G.hph)) * (G.spr ? 20 : 13));

  // Progress Bars (Mining & Repair)
  if (G.prog > 0) {
    const nd = G.mr ? G.nd : 3;
    c.fillStyle = "#000a";
    c.fillRect(G.x - 20, G.y - 48, 40, 7);
    c.fillStyle = "#f5b301";
    c.fillRect(G.x - 20, G.y - 48, 40 * Math.min(1, G.prog / nd), 7);
  }
  if (G.fixp > 0) {
    c.fillStyle = "#000a";
    c.fillRect(G.x - 20, G.y - 60, 40, 7);
    c.fillStyle = "#4ade80";
    c.fillRect(G.x - 20, G.y - 60, 40 * Math.min(1, G.fixp / 3), 7);
  }

  c.setTransform(1, 0, 0, 1, 0, 0);
  pointers(c, ox, oy);
  drawPops(c);

  // Fullscreen Atmosphere & Damage Shaders
  if (G.fs == 2) {
    c.fillStyle = `rgba(255,110,0,${.14 + .06 * Math.sin(Date.now() / 150)})`;
    c.fillRect(0, 0, VW, VH);
  }
  if (G.flash > 0) {
    c.fillStyle = `rgba(255,0,0,${G.flash})`;
    c.fillRect(0, 0, VW, VH);
  }
  if (G.prob.dust > 0) {
    c.fillStyle = "rgba(170,125,70,.24)";
    c.fillRect(0, 0, VW, VH);
  }
  if (G.prob.surge > 0) {
    const au = c.createLinearGradient(0, 0, 0, 150);
    au.addColorStop(0, `rgba(80,255,170,${.22 + .1 * Math.sin(Date.now() / 400)})`);
    au.addColorStop(.6, "rgba(170,90,255,.1)");
    au.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = au;
    c.fillRect(0, 0, VW, 150);
  }
  if (G.prob.surge > 0 && (Date.now() / 180 | 0) % 6 == 0) {
    c.fillStyle = "rgba(0,0,0,.4)";
    c.fillRect(0, 0, VW, VH);
  }
  if (G.stun > 0) {
    c.fillStyle = "rgba(0,0,0,.7)";
    c.fillRect(0, 0, VW, VH);
  }

  // Top Warning Banners
  const bl = (Date.now() / 250 | 0) % 2;
  const soon = G.mt.some(m => m.x && !m.d);
  c.font = "bold 17px sans-serif";
  c.textAlign = "center";

  if (G.fs == 1) {
    c.fillStyle = bl ? "#f5b301" : "#ffd966";
    c.fillRect(100, 10, 600, 48);
    c.fillStyle = "#161a3a";
    c.font = "bold 17px sans-serif";
    c.fillText(`⚠ ${G.cl[0].toUpperCase()} SOLAR FLARE IN ${G.cd}s – RUN TO THE BASE!`, 400, 30);
    c.font = "bold 12px sans-serif";
    c.fillText(G.rf ? `📡 Real NASA DONKI flare: ${flInfo(G.rf)}` : "📡 Practice flare (NASA data not loaded)", 400, 50);
    c.font = "bold 17px sans-serif";
  } else if (G.fs == 2) {
    c.fillStyle = "#b42318";
    c.fillRect(100, 10, 600, 30);
    c.fillStyle = "#fff";
    c.fillText("☢ FLARE ACTIVE – STAY INSIDE!", 400, 31);
  }

  if (soon && G.fs != 1) {
    c.fillStyle = "#ef4444";
    c.fillRect(100, 44, 600, 28);
    c.fillStyle = "#fff";
    c.fillText("☄ ASTEROID INCOMING – LEAVE THE RED CIRCLE!", 400, 64);
  }

  // Minimap
  c.textAlign = "left";
  const mx = VW - 136, my = VH - 88, k = .04;
  c.fillStyle = "rgba(10,12,30,.65)";
  c.fillRect(mx, my, 128, 80);

  if (G.prob.radio > 0) {
    c.fillStyle = "#fff";
    for (let i = 0; i < 50; i++) c.fillRect(mx + Math.random() * 124, my + Math.random() * 76, 3, 2);
    c.fillStyle = "#000b";
    c.fillRect(mx + 14, my + 32, 100, 18);
    c.fillStyle = "#fff";
    c.font = "bold 12px sans-serif";
    c.textAlign = "center";
    c.fillText("📻 STATIC!", mx + 64, my + 45);
    c.textAlign = "left";
  } else {
    const gp = G.prob.gps > 0;
    const jx = gp ? Math.sin(Date.now() / 230) * 380 : 0;
    const jy = gp ? Math.cos(Date.now() / 310) * 260 : 0;
    if (!gp) {
      c.fillStyle = "#fff";
      c.fillRect(mx + Z.x * k, my + Z.y * k, Z.w * k, Z.h * k);
    }
    G.rocks.forEach(r => {
      c.fillStyle = T[r.k][3];
      c.fillRect(mx + r.x * k, my + r.y * k, 2, 2);
    });
    c.fillStyle = "#38bdf8";
    c.fillRect(mx + (G.x + jx) * k - 2, my + (G.y + jy) * k - 2, 5, 5);
    if (gp) {
      c.fillStyle = "#fff";
      c.font = "bold 11px sans-serif";
      c.fillText("🛰️ ???", mx + 4, my + 12);
    }
  }
}

// Animated Title Screen Scene
const mc = $("#mc");
const mx = mc.getContext("2d");
const DK = "#14123a";
const PC = ["#ffe14d", "#ff9ce6", "#9ff3ff", "#b9ff7a"];

const MST = Array.from({ length: 150 }, () => ({
  x: Math.random(), y: Math.random(),
  r: .6 + Math.random() * 1.8,
  p: Math.random() * 6,
  s: .004 + Math.random() * .012,
  c: ["#fff", "#ffe14d", "#9ff3ff", "#ff9ce6"][Math.random() * 4 | 0]
}));

const FST = Array.from({ length: 16 }, () => ({
  x: Math.random(), y: Math.random() * .7,
  s: 7 + Math.random() * 13,
  v: (.02 + Math.random() * .05) * (Math.random() < .5 ? -1 : 1),
  r: Math.random() * 6,
  c: PC[Math.random() * 4 | 0]
}));

const mkAst = init => ({
  x: init ? Math.random() : 1.12 + Math.random() * .1,
  y: .04 + Math.random() * .62,
  s: 18 + Math.random() * 34,
  v: .012 + Math.random() * .03,
  vy: (Math.random() - .3) * .01,
  r: Math.random() * 6,
  w: (Math.random() - .5) * 1.6,
  pts: Array.from({ length: 9 }, () => .75 + Math.random() * .5),
  c: ["#a78bfa", "#fb923c", "#94a3b8", "#f472b6", "#34d399"][Math.random() * 5 | 0],
  face: Math.random() < .6
});

const mkCom = () => ({
  x: .5 + Math.random() * .6,
  y: -.1 + Math.random() * .4,
  vx: -(.25 + Math.random() * .25),
  vy: .12 + Math.random() * .16,
  c: PC[Math.random() * 4 | 0],
  s: 4 + Math.random() * 5
});

let MA = Array.from({ length: 10 }, () => mkAst(1));
let MC = [mkCom(), mkCom()];
let mcT = 0, mlt = 0;
const CRT = [[.16, .9, .05], [.42, .87, .035], [.7, .93, .06], [.9, .9, .04], [.3, .96, .04], [.56, .95, .05]];

function pstar(c, x, y, r, rot) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = rot + i * Math.PI / 5 - Math.PI / 2;
    const d = i % 2 ? r * .45 : r;
    c.lineTo(x + Math.cos(a) * d, y + Math.sin(a) * d);
  }
  c.closePath();
}

function drawMenu(n) {
  const w = mc.clientWidth, h = mc.clientHeight;
  if (!w || !h) return;
  const d = Math.min(2, devicePixelRatio || 1);
  if (mc.width != (w * d | 0) || mc.height != (h * d | 0)) {
    mc.width = w * d;
    mc.height = h * d;
  }
  const c = mx;
  const dt = Math.min(.05, Math.max(0, (n - mlt) / 1e3) || .016);
  const t = n / 1e3;
  mlt = n;
  c.setTransform(d, 0, 0, d, 0, 0);

  // Gradient Sky
  let g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#1b0f5e");
  g.addColorStop(.55, "#5b2bd6");
  g.addColorStop(1, "#ff6bd6");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);

  [[.2, .3, .35, "rgba(56,189,248,.25)"], [.8, .5, .4, "rgba(244,114,182,.28)"]].forEach(q => {
    const r = q[2] * w;
    const rg = c.createRadialGradient(q[0] * w, q[1] * h, 0, q[0] * w, q[1] * h, r);
    rg.addColorStop(0, q[3]);
    rg.addColorStop(1, "transparent");
    c.fillStyle = rg;
    c.fillRect(0, 0, w, h);
  });

  // Twinkling Stars
  MST.forEach(s => {
    const x = ((s.x - t * s.s) % 1 + 1) % 1 * w;
    c.globalAlpha = .45 + .55 * Math.abs(Math.sin(t * 2 + s.p));
    c.fillStyle = s.c;
    c.fillRect(x, s.y * h * .85, s.r * 1.6, s.r * 1.6);
  });
  c.globalAlpha = 1;

  // Earth Globe
  const er = Math.min(w, h) * .075, ex = w * .86, ey = h * .17;
  c.fillStyle = "#3b82f6";
  c.strokeStyle = DK;
  c.lineWidth = 3;
  c.beginPath();
  c.arc(ex, ey, er, 0, 7);
  c.fill();
  c.stroke();

  c.save();
  c.beginPath();
  c.arc(ex, ey, er - 1, 0, 7);
  c.clip();
  c.fillStyle = "#4ade80";
  [[-.3, -.2, .45], [.35, .25, .4], [-.1, .5, .3]].forEach(q => {
    c.beginPath();
    c.arc(ex + ((q[0] * er + t * 6) % (er * 3) + er * 3) % (er * 3) - er * 1.5, ey + q[1] * er, q[2] * er, 0, 7);
    c.fill();
  });
  c.restore();

  // Floating Star Shapes
  FST.forEach(s => {
    s.x += s.v * dt;
    s.r += dt * 1.2;
    if (s.x > 1.05) s.x = -.05;
    if (s.x < -.05) s.x = 1.05;
    const x = s.x * w, y = s.y * h + Math.sin(t * 1.5 + s.r) * 6;
    c.fillStyle = s.c;
    c.strokeStyle = DK;
    c.lineWidth = 2;
    pstar(c, x, y, s.s, s.r);
    c.fill();
    c.stroke();
    c.fillStyle = "#fff9";
    c.fillRect(x - 1, y - s.s * .3, 3, 3);
  });

  // Floating Asteroids with cartoon faces
  MA.forEach((a, i) => {
    a.x -= a.v * dt;
    a.y += a.vy * dt;
    a.r += a.w * dt;
    if (a.x < -.12 || a.y < -.1 || a.y > .85) MA[i] = mkAst(0);
    const x = a.x * w, y = a.y * h;
    c.save();
    c.translate(x, y);
    c.rotate(a.r);
    c.fillStyle = a.c;
    c.strokeStyle = DK;
    c.lineWidth = 3;
    c.beginPath();
    a.pts.forEach((p, k) => {
      const an = k / 9 * 6.283;
      c.lineTo(Math.cos(an) * a.s * p, Math.sin(an) * a.s * p);
    });
    c.closePath();
    c.fill();
    c.stroke();
    c.fillStyle = "#0003";
    c.beginPath();
    c.arc(a.s * .3, -a.s * .25, a.s * .18, 0, 7);
    c.fill();
    c.beginPath();
    c.arc(-a.s * .35, a.s * .3, a.s * .12, 0, 7);
    c.fill();
    c.restore();

    if (a.face) {
      c.save();
      c.translate(x, y);
      c.fillStyle = "#fff";
      c.strokeStyle = DK;
      c.lineWidth = 2;
      [-1, 1].forEach(q => {
        c.beginPath();
        c.arc(q * a.s * .3, -a.s * .1, a.s * .2, 0, 7);
        c.fill();
        c.stroke();
      });
      c.fillStyle = DK;
      [-1, 1].forEach(q => {
        c.beginPath();
        c.arc(q * a.s * .3 + 2, -a.s * .08, a.s * .09, 0, 7);
        c.fill();
      });
      c.beginPath();
      c.arc(0, a.s * .12, a.s * .22, .15 * Math.PI, .85 * Math.PI);
      c.lineWidth = 3;
      c.stroke();
      c.restore();
    }
  });

  // Comets
  mcT -= dt;
  if (mcT <= 0 && MC.length < 8) {
    MC.push(mkCom());
    mcT = .4 + Math.random() * 1;
  }
  MC = MC.filter(m => m.x > -.4 && m.y < 1.1);
  MC.forEach(m => {
    m.x += m.vx * dt;
    m.y += m.vy * dt;
    const px = m.x * w, py = m.y * h, vx = m.vx * w, vy = m.vy * h, l = Math.hypot(vx, vy), ux = vx / l, uy = vy / l, L = w * .24, tx = px - ux * L, ty = py - uy * L;
    const gr = c.createLinearGradient(px, py, tx, ty);
    gr.addColorStop(0, m.c);
    gr.addColorStop(1, "rgba(255,255,255,0)");
    c.strokeStyle = gr;
    c.lineCap = "round";
    c.lineWidth = m.s * 2.2;
    c.beginPath();
    c.moveTo(px, py);
    c.lineTo(tx, ty);
    c.stroke();
    c.lineWidth = m.s * .8;
    c.strokeStyle = "rgba(255,255,255,.8)";
    c.beginPath();
    c.moveTo(px, py);
    c.lineTo(px - ux * L * .6, py - uy * L * .6);
    c.stroke();

    for (let k = 0; k < 6; k++) {
      const f = (k + 1) / 7, sx = px - ux * L * f + Math.sin(t * 6 + k * 2) * 8, sy = py - uy * L * f + Math.cos(t * 5 + k * 3) * 8;
      c.fillStyle = PC[k % 4];
      pstar(c, sx, sy, 3 + (1 - f) * 3, t * 3 + k);
      c.fill();
    }

    const hg = c.createRadialGradient(px, py, 0, px, py, m.s * 3);
    hg.addColorStop(0, "#fff");
    hg.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = hg;
    c.beginPath();
    c.arc(px, py, m.s * 3, 0, 7);
    c.fill();
    c.fillStyle = "#fff";
    c.strokeStyle = m.c;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(px, py, m.s, 0, 7);
    c.fill();
    c.stroke();
  });
  c.lineCap = "butt";

  // Lunar Horizon Curve
  const R = w * 2.2, top = h * .8, sf = x => top + R - Math.sqrt(R * R - (x - w / 2) ** 2);
  g = c.createLinearGradient(0, top, 0, h);
  g.addColorStop(0, "#fdfbff");
  g.addColorStop(1, "#b9bfe8");
  c.fillStyle = g;
  c.strokeStyle = DK;
  c.lineWidth = 4;
  c.beginPath();
  c.arc(w / 2, top + R, R, 0, 7);
  c.fill();
  c.stroke();

  // Horizon Craters
  CRT.forEach(q => {
    c.fillStyle = "#aab0dd";
    c.strokeStyle = "#8a90c8";
    c.lineWidth = 3;
    c.beginPath();
    c.ellipse(q[0] * w, q[1] * h, q[2] * w, q[2] * w * .32, 0, 0, 7);
    c.fill();
    c.stroke();
  });

  // Hopping Astronaut and Following Rover on Horizon
  const sc = Math.min(1.7, w / 480);
  const ax = w * (.5 + .34 * Math.sin(t * .35));
  const fx = Math.cos(t * .35) > 0 ? 1 : -1;
  const hop = Math.abs(Math.sin(t * 4)) * 14 * sc;
  const rx = ax - fx * 52 * sc;

  c.save();
  c.translate(rx, sf(rx) - 15 * sc);
  c.scale(sc, sc);
  rover(c, { x: 0, y: 0, a: t * 4, fx });
  c.restore();

  c.save();
  c.translate(ax, sf(ax) - 24 * sc - hop);
  c.scale(sc, sc);
  astro(c, 0, 0, fx, t * 9, 1, 0, 0, 0);
  c.restore();
}
