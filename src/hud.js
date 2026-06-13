"use strict";

function formatTime(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60).toString();
  const s = (totalSecs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Hearts as H (full) and - (empty), space-separated
function heartsHTML(player) {
  const parts = [];
  for (let i = 0; i < MAX_HEARTS; i++) {
    if (i < player.hearts) {
      parts.push('<span class="heart-full">H</span>');
    } else {
      parts.push('<span class="heart-empty">-</span>');
    }
  }
  return parts.join(" ");
}

// Bombs as * (ready) and . (used/active)
function bombsString(playerIndex) {
  const p      = players[playerIndex];
  const active = bombs.filter(b => b.ownerIndex === playerIndex && !b.exploding).length;
  const ready  = p.maxBombs - active;
  const parts  = [];
  for (let i = 0; i < p.maxBombs; i++) {
    parts.push(i < ready ? "*" : ".");
  }
  return parts.join(" ");
}

function updateHud() {
  document.getElementById("hud-timer").textContent = formatTime(elapsedMs);

  for (let i = 0; i < players.length; i++) {
    const p  = players[i];
    const n  = i + 1;
    const cd = document.getElementById(`hud-p${n}-cd`);

    document.getElementById(`hud-p${n}-hearts`).innerHTML  = heartsHTML(p);
    document.getElementById(`hud-p${n}-bombs`).textContent  = bombsString(i);

    if (p.bombCooldown <= 0) {
      cd.textContent = "READY";
      cd.classList.add("ready");
    } else {
      cd.textContent = `${(p.bombCooldown / 1000).toFixed(1)}s`;
      cd.classList.remove("ready");
    }

    // Grey out portrait when the fairy falls
    const portrait = document.getElementById(`portrait-p${n}`)?.closest(".player-portrait");
    if (portrait) portrait.classList.toggle("dead", !p.alive);
  }
}

function resetHud() {
  document.getElementById("hud-timer").textContent = "0:00";
  for (let i = 1; i <= 2; i++) {
    document.getElementById(`hud-p${i}-hearts`).innerHTML  = heartsHTML({ hearts: MAX_HEARTS });
    document.getElementById(`hud-p${i}-bombs`).textContent = "* . .";
    const cd = document.getElementById(`hud-p${i}-cd`);
    cd.textContent = "READY";
    cd.classList.add("ready");
  }
}
