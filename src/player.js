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

  ctx.beginPath();
  ctx.arc(cx, cy, TILE_SIZE / 2 - 6, 0, Math.PI * 2);
  ctx.fillStyle = "#4fc3f7";
  ctx.fill();

  ctx.strokeStyle = "#1a1a2e";
  ctx.lineWidth = 2;
  ctx.stroke();
}
