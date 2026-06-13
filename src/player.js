"use strict";

// Player colours: P1 pink→lavender, P2 green→cyan
const PLAYER_COLOURS = [
  { inner: "#ffb7d5", outer: "#b89cff", outline: "#3b1d5e" },
  { inner: "#b6d97a", outer: "#4fc3f7", outline: "#1a3322" },
];

function movePlayer(player, controls, dt) {
  // Tick invincibility
  if (player.invincibleMs > 0) player.invincibleMs = Math.max(0, player.invincibleMs - dt);

  // Tick speed boost
  if (player.speedBoostMs > 0) {
    player.speedBoostMs = Math.max(0, player.speedBoostMs - dt);
    player.moveInterval = player.speedBoostMs > 0 ? 80 : 150;
  }

  player.moveCooldown -= dt;
  if (player.moveCooldown > 0) return;

  let dc = 0;
  let dr = 0;

  if      (keys[controls.up])    dr = -1;
  else if (keys[controls.down])  dr =  1;
  else if (keys[controls.left])  dc = -1;
  else if (keys[controls.right]) dc =  1;
  else return;

  const nextCol = player.col + dc;
  const nextRow = player.row + dr;

  // Try to kick a bomb in the way — if kick absorbs the move, reset cooldown and stop
  if (tryKickBomb(players.indexOf(player), nextCol, nextRow, dc, dr)) {
    player.moveCooldown = player.moveInterval;
    return;
  }

  if (
    nextRow >= 0 && nextRow < ROWS &&
    nextCol >= 0 && nextCol < COLS &&
    maze[nextRow][nextCol] === TILE.EMPTY
  ) {
    player.col = nextCol;
    player.row = nextRow;
  }

  player.moveCooldown = player.moveInterval;
}

function drawPlayer(player, colourIndex) {
  if (!player.alive) return;

  // Flicker when invincible — skip every other 100ms window
  if (player.invincibleMs > 0 && Math.floor(player.invincibleMs / 100) % 2 === 0) return;

  const cx = player.col * TILE_SIZE + TILE_SIZE / 2;
  const cy = player.row * TILE_SIZE + TILE_SIZE / 2;
  const r  = TILE_SIZE / 2 - 6;
  const c  = PLAYER_COLOURS[colourIndex];

  // Outer glow
  const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.6);
  glow.addColorStop(0, "rgba(255, 183, 213, 0.25)");
  glow.addColorStop(1, "rgba(255, 183, 213, 0)");
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // Body
  const body = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  body.addColorStop(0, c.inner);
  body.addColorStop(1, c.outer);
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Speed boost indicator — small cyan ring when active
  if (player.speedBoostMs > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(79, 195, 247, 0.7)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
