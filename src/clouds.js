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

  const CELL = 6; // base px per pixel-art pixel

  // Helper — fills a contiguous run of cols on a single row
  function run(row, c0, c1) {
    return Array.from({ length: c1 - c0 + 1 }, (_, i) => [c0 + i, row]);
  }

  // ── Cloud A — small puff (10 × 5 px) ────────────────────────
  // . . . X X X . . . .
  // . X X X X X X X . .
  // X X X X X X X X X .
  // X X X X X X X X X X
  // . X X X X X X X X .  ← shadow row
  const CLOUD_A = {
    body: [
      ...run(0, 3, 5),
      ...run(1, 1, 7),
      ...run(2, 0, 8),
      ...run(3, 0, 9),
    ],
    shadow: [...run(4, 1, 8)],
    cellW: 10,
    // Small = distant = slow drift, modest scale
    scaleMin: 0.55, scaleMax: 1.0,
    speedMin: 0.06, speedMax: 0.12,
  };

  // ── Cloud B — medium fluff (16 × 7 px) ──────────────────────
  // . . . X X X X . . . . . . . . .
  // . . X X X X X X X X . . . . . .
  // . X X X X X X X X X X X . . . .
  // X X X X X X X X X X X X X X . .
  // X X X X X X X X X X X X X X X X
  // X X X X X X X X X X X X X X X X
  // . X X X X X X X X X X X X X X .  ← shadow row
  const CLOUD_B = {
    body: [
      ...run(0, 3, 6),
      ...run(1, 2, 9),
      ...run(2, 1, 11),
      ...run(3, 0, 13),
      ...run(4, 0, 15),
      ...run(5, 0, 15),
    ],
    shadow: [...run(6, 1, 14)],
    cellW: 16,
    scaleMin: 0.75, scaleMax: 1.35,
    speedMin: 0.10, speedMax: 0.18,
  };

  // ── Cloud C — big billow (22 × 10 px) ───────────────────────
  // . . . . X X X X . . . . . . . . . . . . . .
  // . . . X X X X X X X X . . . . . . . . . . .
  // . . X X X X X X X X X X X . . X X X . . . .   ← secondary bump
  // . X X X X X X X X X X X X X X X X X X . . .
  // X X X X X X X X X X X X X X X X X X X X X .
  // X X X X X X X X X X X X X X X X X X X X X X
  // X X X X X X X X X X X X X X X X X X X X X X
  // X X X X X X X X X X X X X X X X X X X X X X
  // . X X X X X X X X X X X X X X X X X X X X .  ← shadow row 1
  // . . X X X X X X X X X X X X X X X X X X . .  ← shadow row 2
  const CLOUD_C = {
    body: [
      ...run(0, 4, 7),
      ...run(1, 3, 10),
      ...run(2, 2, 12), [15, 2], [16, 2], [17, 2],  // gap + secondary bump
      ...run(3, 1, 18),
      ...run(4, 0, 20),
      ...run(5, 0, 21),
      ...run(6, 0, 21),
      ...run(7, 0, 21),
    ],
    shadow: [...run(8, 1, 20), ...run(9, 2, 19)],
    cellW: 22,
    // Large = close = faster, bigger on screen
    scaleMin: 1.0, scaleMax: 1.8,
    speedMin: 0.15, speedMax: 0.26,
  };

  const CLOUD_TYPES = [CLOUD_A, CLOUD_B, CLOUD_C];

  // ── Cloud instances ──────────────────────────────────────────
  function makeCloud(x, y) {
    const type  = CLOUD_TYPES[Math.floor(Math.random() * CLOUD_TYPES.length)];
    const scale = type.scaleMin + Math.random() * (type.scaleMax - type.scaleMin);
    const speed = type.speedMin + Math.random() * (type.speedMax - type.speedMin);
    return { x, y, type, scale, speed, pixW: type.cellW * CELL * scale };
  }

  // Seed clouds spread across the full viewport
  const clouds = Array.from({ length: 12 }, (_, i) =>
    makeCloud(
      (i / 12) * (window.innerWidth + 600) - 80,
      20 + Math.random() * window.innerHeight * 0.55
    )
  );

  // ── Draw one cloud ───────────────────────────────────────────
  function drawCloud(c) {
    const cell = Math.round(CELL * c.scale);
    cCtx.fillStyle = "rgba(255, 255, 255, 0.94)";
    for (const [cx, cy] of c.type.body) {
      cCtx.fillRect(Math.round(c.x + cx * cell), Math.round(c.y + cy * cell), cell, cell);
    }
    cCtx.fillStyle = "rgba(147, 197, 253, 0.68)";
    for (const [cx, cy] of c.type.shadow) {
      cCtx.fillRect(Math.round(c.x + cx * cell), Math.round(c.y + cy * cell), cell, cell);
    }
  }

  // ── Animation loop ───────────────────────────────────────────
  let last = 0;
  function cloudLoop(ts) {
    const dt = Math.min(ts - last, 50);
    last = ts;

    // Sky gradient
    const sky = cCtx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0,   "#38bdf8");
    sky.addColorStop(0.5, "#7dd3fc");
    sky.addColorStop(1,   "#bae6fd");
    cCtx.fillStyle = sky;
    cCtx.fillRect(0, 0, W, H);

    // Soft sun glow
    const sun = cCtx.createRadialGradient(W * 0.84, H * 0.10, 0, W * 0.84, H * 0.10, H * 0.40);
    sun.addColorStop(0,   "rgba(254, 240, 138, 0.38)");
    sun.addColorStop(0.4, "rgba(253, 224,  71, 0.10)");
    sun.addColorStop(1,   "rgba(253, 224,  71, 0)");
    cCtx.fillStyle = sun;
    cCtx.fillRect(0, 0, W, H);

    // Scroll, recycle, draw
    for (const c of clouds) {
      c.x -= c.speed * dt;
      if (c.x + c.pixW < 0) {
        const type  = CLOUD_TYPES[Math.floor(Math.random() * CLOUD_TYPES.length)];
        const scale = type.scaleMin + Math.random() * (type.scaleMax - type.scaleMin);
        const speed = type.speedMin + Math.random() * (type.speedMax - type.speedMin);
        c.x     = W + 40 + Math.random() * 300;
        c.y     = 20 + Math.random() * H * 0.55;
        c.type  = type;
        c.scale = scale;
        c.speed = speed;
        c.pixW  = type.cellW * CELL * scale;
      }
      drawCloud(c);
    }

    requestAnimationFrame(cloudLoop);
  }

  requestAnimationFrame(ts => { last = ts; cloudLoop(ts); });
})();
