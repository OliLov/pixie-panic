"use strict";

(function () {
  const cloudCanvas = document.getElementById("cloud-canvas");
  if (!cloudCanvas) return;

  const cCtx = cloudCanvas.getContext("2d");
  let W, H;

  function resize() {
    W = cloudCanvas.width  = window.innerWidth;
    H = cloudCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  // ── Pixel-art cloud shape ────────────────────────────────────
  // Each entry = [col, row] in "cell" units. CELL px per unit.
  const CELL = 6; // px per pixel-art pixel

  // Main fluffy body
  const CLOUD_BODY = [
    /* top bump   */                   [3,0],[4,0],
    /* 2nd bump   */            [2,1],[3,1],[4,1],[5,1],
    /* 3rd bump   */     [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],
    /* main row 1 */ [0,3],[1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],
    /* main row 2 */ [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],
  ];
  // Soft bottom-edge shadow (light blue)
  const CLOUD_SHADOW = [
    [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],
  ];

  const CLOUD_CELL_W = 8; // widest point in cells

  // ── Cloud objects ────────────────────────────────────────────
  function makeCloud(x, y) {
    const scale = 0.7 + Math.random() * 1.0;
    return {
      x,
      y,
      speed: 0.08 + Math.random() * 0.18, // px/ms — very gentle drift
      scale,
      pixW: CLOUD_CELL_W * CELL * scale,
    };
  }

  // Seed initial clouds spread across the full viewport width
  const clouds = Array.from({ length: 10 }, (_, i) =>
    makeCloud(
      (i / 10) * (window.innerWidth + 500) - 60,
      20 + Math.random() * window.innerHeight * 0.55
    )
  );

  // ── Draw one cloud ───────────────────────────────────────────
  function drawCloud(x, y, scale) {
    const cell = Math.round(CELL * scale);
    // White body
    cCtx.fillStyle = "rgba(255, 255, 255, 0.94)";
    for (const [cx, cy] of CLOUD_BODY) {
      cCtx.fillRect(
        Math.round(x + cx * cell),
        Math.round(y + cy * cell),
        cell, cell
      );
    }
    // Blue-grey shadow
    cCtx.fillStyle = "rgba(147, 197, 253, 0.68)";
    for (const [cx, cy] of CLOUD_SHADOW) {
      cCtx.fillRect(
        Math.round(x + cx * cell),
        Math.round(y + cy * cell),
        cell, cell
      );
    }
  }

  // ── Animation loop ───────────────────────────────────────────
  let last = 0;
  function cloudLoop(ts) {
    const dt = Math.min(ts - last, 50);
    last = ts;

    // Sky gradient — repainted every frame
    const sky = cCtx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   "#38bdf8"); // rich sky blue at top
    sky.addColorStop(0.5, "#7dd3fc"); // lighter mid-sky
    sky.addColorStop(1,   "#bae6fd"); // pale horizon haze
    cCtx.fillStyle = sky;
    cCtx.fillRect(0, 0, W, H);

    // Distant soft sun glow in upper-right
    const sun = cCtx.createRadialGradient(
      W * 0.84, H * 0.10, 0,
      W * 0.84, H * 0.10, H * 0.40
    );
    sun.addColorStop(0,   "rgba(254, 240, 138, 0.38)");
    sun.addColorStop(0.4, "rgba(253, 224,  71, 0.10)");
    sun.addColorStop(1,   "rgba(253, 224,  71, 0)");
    cCtx.fillStyle = sun;
    cCtx.fillRect(0, 0, W, H);

    // Scroll and draw each cloud
    for (const c of clouds) {
      c.x -= c.speed * dt;
      if (c.x + c.pixW < 0) {
        // Recycle: re-enter from the right
        c.x     = W + 40 + Math.random() * 300;
        c.y     = 20 + Math.random() * H * 0.55;
        c.speed = 0.08 + Math.random() * 0.18;
        c.scale = 0.7 + Math.random() * 1.0;
        c.pixW  = CLOUD_CELL_W * CELL * c.scale;
      }
      drawCloud(c.x, c.y, c.scale);
    }

    requestAnimationFrame(cloudLoop);
  }

  requestAnimationFrame(ts => { last = ts; cloudLoop(ts); });
})();
