"use strict";

// Drop chances — must sum to ≤ 1. Rarer items appear later in the list.
const POWERUP_DROPS = [
  { type: POWERUP_TYPE.BLAST_UP, weight: 30 }, // bigger blast
  { type: POWERUP_TYPE.BOMB_UP,  weight: 25 }, // extra bomb supply
  { type: POWERUP_TYPE.SPEED_UP, weight: 20 }, // temporary speed boost
  { type: POWERUP_TYPE.HEART,    weight: 10 }, // recover a heart (rarest)
];
const TOTAL_WEIGHT = POWERUP_DROPS.reduce((s, d) => s + d.weight, 0);
const DROP_CHANCE  = 0.45; // 45 % of crates drop something

function maybeDrop(col, row) {
  if (Math.random() > DROP_CHANCE) return;

  // Weighted random pick
  let roll = Math.random() * TOTAL_WEIGHT;
  let picked = POWERUP_DROPS[0].type;
  for (const drop of POWERUP_DROPS) {
    roll -= drop.weight;
    if (roll <= 0) { picked = drop.type; break; }
  }

  powerups.push({ col, row, type: picked });
}

function collectPowerups() {
  powerups = powerups.filter(pu => {
    for (const p of players) {
      if (!p.alive) continue;
      if (p.col !== pu.col || p.row !== pu.row) continue;

      // Apply the power-up to this player
      switch (pu.type) {
        case POWERUP_TYPE.BLAST_UP:
          p.blastRadius = Math.min(p.blastRadius + 1, 6);
          break;
        case POWERUP_TYPE.BOMB_UP:
          p.maxBombs = Math.min(p.maxBombs + 1, MAX_BOMBS);
          break;
        case POWERUP_TYPE.SPEED_UP:
          p.speedBoostMs = SPEED_BOOST_MS; // resets/extends duration
          break;
        case POWERUP_TYPE.HEART:
          p.hearts = Math.min(p.hearts + 1, MAX_HEARTS);
          break;
      }
      return false; // remove from array — it was collected
    }
    return true; // keep
  });
}

// Colours for each power-up type
const POWERUP_COLOURS = {
  [POWERUP_TYPE.BLAST_UP]: "#ff6f00",
  [POWERUP_TYPE.BOMB_UP]:  "#b89cff",
  [POWERUP_TYPE.SPEED_UP]: "#4fc3f7",
  [POWERUP_TYPE.HEART]:    "#ff4d6d",
};
const POWERUP_ICONS = {
  [POWERUP_TYPE.BLAST_UP]: "✦",
  [POWERUP_TYPE.BOMB_UP]:  "💣",
  [POWERUP_TYPE.SPEED_UP]: "⚡",
  [POWERUP_TYPE.HEART]:    "♥",
};

function drawPowerups() {
  for (const pu of powerups) {
    const x  = pu.col * TILE_SIZE;
    const y  = pu.row * TILE_SIZE;
    const cx = x + TILE_SIZE / 2;
    const cy = y + TILE_SIZE / 2;
    const colour = POWERUP_COLOURS[pu.type];

    // Glowing circle base
    ctx.beginPath();
    ctx.arc(cx, cy, TILE_SIZE / 2 - 10, 0, Math.PI * 2);
    ctx.fillStyle = "#111f17";
    ctx.fill();
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.fillStyle = colour;
    ctx.font      = "bold 18px sans-serif";
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(POWERUP_ICONS[pu.type], cx, cy);
  }
}
