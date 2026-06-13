"use strict";

(function () {
  const cloudCanvas = document.getElementById("cloud-canvas");
  if (!cloudCanvas) return;

  const cCtx = cloudCanvas.getContext("2d");
  let W, H;

  function resize() {
    W = cloudCanvas.width = window.innerWidth;
    H = cloudCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const cloudImgs = ["assets/cloud.png", "assets/cloud2.png"].map((src) => {
    const img = new Image();
    img.src = src;
    return img;
  });

  // Three size buckets — width in px, height scales to match natural aspect ratio
  const SIZE_TIERS = [80, 140, 210];

  function randomWidth() {
    const base = SIZE_TIERS[Math.floor(Math.random() * SIZE_TIERS.length)];
    return base + (Math.random() - 0.5) * 30; // small jitter within each tier
  }

  function makeCloud(x, y) {
    const width = randomWidth();
    return {
      x,
      y,
      width,
      speed: 0.05 + Math.random() * 0.14,
      img: cloudImgs[Math.floor(Math.random() * cloudImgs.length)],
    };
  }

  const clouds = Array.from({ length: 12 }, (_, i) =>
    makeCloud(
      (i / 12) * (window.innerWidth + 600) - 200,
      15 + Math.random() * window.innerHeight * 0.55,
    ),
  );

  function drawCloud(c) {
    if (!c.img.complete || c.img.naturalWidth === 0) return;
    const aspect = c.img.naturalHeight / c.img.naturalWidth;
    const h = c.width * aspect;
    cCtx.imageSmoothingEnabled = false;
    cCtx.drawImage(
      c.img,
      Math.round(c.x),
      Math.round(c.y),
      Math.round(c.width),
      Math.round(h),
    );
  }

  let last = 0;
  function cloudLoop(ts) {
    const dt = Math.min(ts - last, 50);
    last = ts;

    // Sky gradient
    const sky = cCtx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#38bdf8");
    sky.addColorStop(0.5, "#7dd3fc");
    sky.addColorStop(1, "#bae6fd");
    cCtx.fillStyle = sky;
    cCtx.fillRect(0, 0, W, H);

    // Sun glow
    const sun = cCtx.createRadialGradient(
      W * 0.84,
      H * 0.1,
      0,
      W * 0.84,
      H * 0.1,
      H * 0.4,
    );
    sun.addColorStop(0, "rgba(254, 240, 138, 0.38)");
    sun.addColorStop(0.4, "rgba(253, 224,  71, 0.10)");
    sun.addColorStop(1, "rgba(253, 224,  71, 0)");
    cCtx.fillStyle = sun;
    cCtx.fillRect(0, 0, W, H);

    for (const c of clouds) {
      c.x -= c.speed * dt;
      if (c.x + c.width < 0) {
        c.x = W + 40 + Math.random() * 300;
        c.y = 15 + Math.random() * H * 0.55;
        c.speed = 0.05 + Math.random() * 0.14;
        c.width = randomWidth();
        c.img = cloudImgs[Math.floor(Math.random() * cloudImgs.length)];
      }
      drawCloud(c);
    }

    requestAnimationFrame(cloudLoop);
  }

  requestAnimationFrame((ts) => {
    last = ts;
    cloudLoop(ts);
  });
})();
