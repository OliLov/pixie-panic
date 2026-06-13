"use strict";

function startGame() {
  player       = { col: 1, row: 1, alive: true };
  bombs        = [];
  moveCooldown = 0;
  deathTimer   = 0;
  gameState    = "PLAYING";
  maze         = buildMaze(COLS, ROWS);

  canvas.width  = COLS * TILE_SIZE;
  canvas.height = ROWS * TILE_SIZE;

  document.getElementById("screen-start").classList.remove("active");
  document.getElementById("screen-game").classList.add("active");

  requestAnimationFrame((ts) => { lastTimestamp = ts; requestAnimationFrame(loop); });
}

function showGameOver() {
  document.getElementById("screen-game").classList.remove("active");
  document.getElementById("screen-gameover").classList.add("active");
}

function resetGame() {
  document.getElementById("screen-gameover").classList.remove("active");
  document.getElementById("screen-start").classList.add("active");
}
