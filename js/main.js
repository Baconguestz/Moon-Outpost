/* ==========================================================================
   Moon Outpost - Application Bootstrap & Main Game Loop
   ========================================================================== */

// Initialize Side School Panel
buildSide();

// Fetch / Refresh NASA Space Weather Data
loadNasa();

// Render Initial UI State
ui();

// Start Animation Frame Game Loop
let lt = performance.now();
(function loop(n) {
  const dt = Math.min(0.05, (n - lt) / 1000);
  lt = n;
  update(dt);
  draw();
  if (G.ph === "menu") drawMenu(n);
  requestAnimationFrame(loop);
})(lt);
