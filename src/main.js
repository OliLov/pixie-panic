"use strict";

function update(dt) {
  if (gameState === "PLAYING") {
    for (let i = 0; i < players.length; i++) {
      if (players[i].alive) movePlayer(players[i], CONTROLS[i], dt);
    }
    updateBombs(dt);
    collectPowerups();

    // Tick the elapsed timer and update the HUD
    elapsedMs += dt;
    updateHud();

    // Check for end condition after bombs may have just killed a player
    const deadCount = players.filter(p => !p.alive).length;
    if (deadCount > 0) {
      const survivors = players.map((p, i) => ({ p, i })).filter(({ p }) => p.alive);
      if (survivors.length === 1) {
        winner = survivors[0].i;          // one survivor — they win
      } else {
        winner = "draw";                  // both died in the same explosion
      }
      gameState  = "DYING";
      deathTimer = 1200;
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
  drawPowerups();
  drawBombs();
  for (let i = 0; i < players.length; i++) {
    drawPlayer(players[i], i);
  }
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

  const preventKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];

  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (preventKeys.includes(e.key)) e.preventDefault();

    if (gameState !== "PLAYING") return;

    // Check each player's bomb key
    for (let i = 0; i < CONTROLS.length; i++) {
      if (e.key === CONTROLS[i].bomb && !e.repeat) placeBomb(i);
    }
  });

  document.addEventListener("keyup", (e) => { keys[e.key] = false; });

  document.getElementById("btn-start").addEventListener("click", startGame);
  document.getElementById("btn-restart").addEventListener("click", resetGame);
});
