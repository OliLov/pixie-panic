"use strict";

// P1 = purple pixie, P2 = green pixie
const PIXIE_IMGS = [
  (() => { const img = new Image(); img.src = "assets/purple-pixie.png"; return img; })(),
  (() => { const img = new Image(); img.src = "assets/green-pixie.png";  return img; })(),
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
  const r  = TILE_SIZE / 2 - 4;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(PIXIE_IMGS[colourIndex], cx - TILE_SIZE / 2, cy - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE);

  // Speed boost indicator — butterfly-wing pink glow ring when active
  if (player.speedBoostMs > 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.80)";  // sky-blue wing shimmer
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Second inner ring for extra shimmer
    ctx.beginPath();
    ctx.arc(cx, cy, r + 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(253, 230, 138, 0.50)";  // gold outer halo
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}
