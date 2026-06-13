"use strict";

function showGameOver() {
  document.getElementById("screen-game").classList.remove("active");
  document.getElementById("screen-gameover").classList.add("active");
}

function resetGame() {
  player       = { col: 1, row: 1, alive: true };
  bombs        = [];
  moveCooldown = 0;
  deathTimer   = 0;
  gameState    = "PLAYING";
  maze         = buildMaze(COLS, ROWS);

  document.getElementById("screen-gameover").classList.remove("active");
  document.getElementById("screen-game").classList.add("active");

  requestAnimationFrame((ts) => { lastTimestamp = ts; requestAnimationFrame(loop); });
}
