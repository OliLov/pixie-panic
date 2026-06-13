"use strict";

function formatTime(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60).toString();
  const s = (totalSecs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function heartsHTML(player) {
  const parts = [];
  for (let i = 0; i < MAX_HEARTS; i++) {
    const cls = i < player.hearts ? "heart-full" : "heart-empty";
    parts.push(`<img src="assets/heart.png" class="${cls}" alt="heart" />`);
  }
  return parts.join("");
}

function spellsHTML(playerIndex) {
  const p      = players[playerIndex];
  const active = bombs.filter(b => b.ownerIndex === playerIndex && !b.exploding).length;
  const ready  = p.maxBombs - active;
  const parts  = [];
  for (let i = 0; i < p.maxBombs; i++) {
    const cls = i < ready ? "spell-ready" : "spell-spent";
    parts.push(`<img src="assets/spell.png" class="${cls}" alt="spell" />`);
  }
  return parts.join("");
}

function updateHud() {
  document.getElementById("hud-timer-value").textContent = formatTime(elapsedMs);

  for (let i = 0; i < players.length; i++) {
    const p  = players[i];
    const n  = i + 1;
    const cd = document.getElementById(`hud-p${n}-cd`);

    document.getElementById(`hud-p${n}-hearts`).innerHTML  = heartsHTML(p);
    document.getElementById(`hud-p${n}-bombs`).innerHTML = spellsHTML(i);

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
  document.getElementById("hud-timer-value").textContent = "0:00";
  for (let i = 1; i <= 2; i++) {
    document.getElementById(`hud-p${i}-hearts`).innerHTML  = heartsHTML({ hearts: MAX_HEARTS });
    document.getElementById(`hud-p${i}-bombs`).innerHTML = spellsHTML(i - 1);
    const cd = document.getElementById(`hud-p${i}-cd`);
    cd.textContent = "READY";
    cd.classList.add("ready");
  }
}
