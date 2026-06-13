"use strict";

function update(dt) {
  if (gameState === "PLAYING") {
    movePlayer(dt);
    updateBombs(dt);

    if (!player.alive) {
      gameState  = "DYING";
      deathTimer = 1000;
    }
  } else if (gameState === "DYING") {
    updateBombs(dt);
    deathTimer -= dt;
    if (deathTimer <= 0) gameState = "GAME_OVER";
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMaze(ctx, maze);
  drawBombs();
  if (player.alive) drawPlayer();
}

function loop(timestamp) {
  const dt = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  update(dt);
  render();

  if (gameState === "PLAYING" || gameState === "DYING") {
    requestAnimationFrame(loop);
  } else if (gameState === "GAME_OVER") {
    showGameOver();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  canvas = document.getElementById("game-canvas");
  ctx    = canvas.getContext("2d");

  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
      e.preventDefault();
    }
    if (e.key === " " && !e.repeat && gameState === "PLAYING") {
      placeBomb();
    }
  });
  document.addEventListener("keyup", (e) => { keys[e.key] = false; });

  document.getElementById("btn-start").addEventListener("click", startGame);
  document.getElementById("btn-restart").addEventListener("click", resetGame);
});
