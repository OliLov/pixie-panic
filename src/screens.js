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
  winner      = null;
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
  const title   = document.getElementById("gameover-title");
  const message = document.getElementById("gameover-message");

  if (winner === "draw") {
    title.textContent   = "Draw!";
    message.textContent = "Both players fell in the blast!";
  } else if (winner === 0) {
    title.textContent   = "P1 Wins!";
    message.textContent = "P2 was caught in the blast!";
  } else if (winner === 1) {
    title.textContent   = "P2 Wins!";
    message.textContent = "P1 was caught in the blast!";
  } else {
    title.textContent   = "Game Over";
    message.textContent = "Better luck next time!";
  }

  document.getElementById("screen-game").classList.remove("active");
  document.getElementById("screen-gameover").classList.add("active");
}

function resetGame() {
  winner = null;
  document.getElementById("screen-gameover").classList.remove("active");
  document.getElementById("screen-start").classList.add("active");
}
