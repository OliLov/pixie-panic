"use strict";

function movePlayer(dt) {
  moveCooldown -= dt;
  if (moveCooldown > 0) return;

  let dc = 0;
  let dr = 0;

  if      (keys["ArrowUp"]    || keys["w"]) dr = -1;
  else if (keys["ArrowDown"]  || keys["s"]) dr =  1;
  else if (keys["ArrowLeft"]  || keys["a"]) dc = -1;
  else if (keys["ArrowRight"] || keys["d"]) dc =  1;
  else return;

  const nextCol = player.col + dc;
  const nextRow = player.row + dr;

  if (
    nextRow >= 0 && nextRow < ROWS &&
    nextCol >= 0 && nextCol < COLS &&
    maze[nextRow][nextCol] === TILE.EMPTY
  ) {
    player.col = nextCol;
    player.row = nextRow;
  }

  moveCooldown = 150;
}

function drawPlayer() {
  const cx = player.col * TILE_SIZE + TILE_SIZE / 2;
  const cy = player.row * TILE_SIZE + TILE_SIZE / 2;
  const r  = TILE_SIZE / 2 - 6;

  // Soft outer glow
  const glow = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.6);
  glow.addColorStop(0, "rgba(255, 183, 213, 0.35)");
  glow.addColorStop(1, "rgba(255, 183, 213, 0)");
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // Body — pink to lavender radial gradient
  const body = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
  body.addColorStop(0, "#ffb7d5");
  body.addColorStop(1, "#b89cff");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = body;
  ctx.fill();

  // Crisp outline
  ctx.strokeStyle = "#3b1d5e";
  ctx.lineWidth = 2;
  ctx.stroke();
}
