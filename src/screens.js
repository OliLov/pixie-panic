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
    title.textContent   = "A Tie!";
    message.textContent = "Both fairies lost their wings!";
  } else if (winner === 0) {
    title.textContent   = "Flora Wins!";
    message.textContent = "Stella's magic was no match!";
  } else if (winner === 1) {
    title.textContent   = "Stella Wins!";
    message.textContent = "Flora's spell backfired!";
  } else {
    title.textContent   = "The Maze Wins";
    message.textContent = "Even fairies have bad days.";
  }

  document.getElementById("screen-game").classList.remove("active");
  document.getElementById("screen-gameover").classList.add("active");
}

function resetGame() {
  winner = null;
  document.getElementById("screen-gameover").classList.remove("active");
  document.getElementById("screen-start").classList.add("active");
}
