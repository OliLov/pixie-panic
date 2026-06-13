"use strict";

function startGame() {
  players = [
    makePlayer(1, 1),
    makePlayer(COLS - 2, ROWS - 2),
  ];
  bombs       = [];
  powerups    = [];
  deathTimer  = 0;
  elapsedMs   = 0;
  gameState   = "PLAYING";
  maze        = buildMaze(COLS, ROWS);

  canvas.width  = COLS * TILE_SIZE;
  canvas.height = ROWS * TILE_SIZE;

  resetHud();

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
