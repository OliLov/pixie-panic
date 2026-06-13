"use strict";

function placeBomb(playerIndex) {
  const p = players[playerIndex];
  if (p.bombCooldown > 0) return;

  const activeBombs = bombs.filter(b => b.ownerIndex === playerIndex && !b.exploding).length;
  if (activeBombs >= p.maxBombs) return;

  // Can't place on a tile that already has a bomb
  if (bombs.some(b => b.col === p.col && b.row === p.row)) return;

  bombs.push({
    col: p.col,
    row: p.row,
    ownerIndex: playerIndex,
    blastRadius: p.blastRadius,
    fuseMs: FUSE_MS,
    exploding: false,
    blastMs: 0,
    blastTiles: [],
    // Kick state — null means stationary
    kick: null,  // { dc, dr, travelMs } when sliding
  });

  p.bombCooldown = BOMB_COOLDOWN_MS;
}

// tryKickBomb: called when a player tries to walk into a tile containing a bomb.
// Returns true if the bomb was kicked (so the player should NOT move there).
function tryKickBomb(playerIndex, targetCol, targetRow, dc, dr) {
  const bomb = bombs.find(
    b => b.col === targetCol && b.row === targetRow && !b.exploding && !b.kick
  );
  if (!bomb) return false;

  // Check the tile beyond the bomb is clear
  const landCol = targetCol + dc;
  const landRow = targetRow + dr;
  if (
    landRow < 0 || landRow >= ROWS ||
    landCol < 0 || landCol >= COLS ||
    maze[landRow][landCol] !== TILE.EMPTY ||
    bombs.some(b => b.col === landCol && b.row === landRow)
  ) {
    return true; // bomb is blocked but still stops the player
  }

  bomb.kick = { dc, dr, travelMs: 0 };
  return true; // player doesn't enter this tile
}

function updateKickedBombs(dt) {
  for (const bomb of bombs) {
    if (!bomb.kick || bomb.exploding) continue;

    bomb.kick.travelMs += dt;
    if (bomb.kick.travelMs < KICK_TILE_MS) continue;

    bomb.kick.travelMs -= KICK_TILE_MS;

    const nextCol = bomb.col + bomb.kick.dc;
    const nextRow = bomb.col + bomb.kick.dr; // intentional: recalc below
    const nc = bomb.col + bomb.kick.dc;
    const nr = bomb.row + bomb.kick.dr;

    // Stop if the next tile is blocked
    if (
      nr < 0 || nr >= ROWS ||
      nc < 0 || nc >= COLS ||
      maze[nr][nc] !== TILE.EMPTY ||
      bombs.some(b => b !== bomb && b.col === nc && b.row === nr)
    ) {
      bomb.kick = null;
    } else {
      bomb.col = nc;
      bomb.row = nr;
    }
  }
}

function explodeBomb(bomb) {
  const tiles = [{ col: bomb.col, row: bomb.row }];

  for (const [dc, dr] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    for (let step = 1; step <= bomb.blastRadius; step++) {
      const c = bomb.col + dc * step;
      const r = bomb.row + dr * step;

      if (maze[r][c] === TILE.WALL) break;
      tiles.push({ col: c, row: r });
      if (maze[r][c] === TILE.CRATE) {
        maze[r][c] = TILE.EMPTY;
        maybeDrop(c, r);  // power-up drop
        break;
      }
    }
  }

  bomb.blastTiles = tiles;
  bomb.exploding  = true;
  bomb.blastMs    = BLAST_DELAY;
  bomb.kick       = null;

  // Damage any player in the blast (respects invincibility)
  for (const p of players) {
    if (!p.alive || p.invincibleMs > 0) continue;
    if (tiles.some(t => t.col === p.col && t.row === p.row)) {
      p.hearts -= 1;
      if (p.hearts <= 0) {
        p.alive = false;
      } else {
        p.invincibleMs = INVINCIBILITY_MS;
      }
    }
  }
}

function updateBombs(dt) {
  for (const p of players) {
    if (p.bombCooldown > 0) p.bombCooldown = Math.max(0, p.bombCooldown - dt);
  }

  updateKickedBombs(dt);

  for (const bomb of bombs) {
    if (!bomb.exploding) {
      bomb.fuseMs -= dt;
      if (bomb.fuseMs <= 0) explodeBomb(bomb);
    } else {
      bomb.blastMs -= dt;
    }
  }
  bombs = bombs.filter(b => !(b.exploding && b.blastMs <= 0));
}

function drawBombs() {
  for (const bomb of bombs) {
    if (!bomb.exploding) {
      const cx = bomb.col * TILE_SIZE + TILE_SIZE / 2;
      const cy = bomb.row * TILE_SIZE + TILE_SIZE / 2;
      const r  = TILE_SIZE / 2 - 8;
      // P1 = hot-pink spell orb, P2 = sky-blue spell orb
      const orbColour  = bomb.ownerIndex === 0 ? "#ec4899" : "#38bdf8";
      const glowColour = bomb.ownerIndex === 0 ? "#fce7f3" : "#e0f2fe";

      // Soft outer glow ring
      ctx.beginPath();
      ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
      ctx.fillStyle = bomb.ownerIndex === 0
        ? "rgba(236, 72, 153, 0.20)"
        : "rgba(56, 189, 248, 0.20)";
      ctx.fill();

      // Orb body
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = orbColour;
      ctx.fill();

      // Inner shine highlight
      ctx.beginPath();
      ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fill();

      // Animated sparkle trailing off the orb (fuse effect)
      const fuseProgress = bomb.fuseMs / FUSE_MS;
      const sparkTick = Math.floor(bomb.fuseMs / 180) % 2 === 0;
      ctx.beginPath();
      ctx.arc(
        cx + (r + 4) * Math.cos(-0.8) * fuseProgress,
        cy + (r + 4) * Math.sin(-0.8) * fuseProgress,
        sparkTick ? 3.5 : 2.5,
        0, Math.PI * 2
      );
      ctx.fillStyle = sparkTick ? "#fde68a" : glowColour;
      ctx.fill();

    } else {
      // ✨ Magical sparkle blast ✨
      const progress = bomb.blastMs / BLAST_DELAY; // 1 → 0
      for (const t of bomb.blastTiles) {
        const x = t.col * TILE_SIZE + 1;
        const y = t.row * TILE_SIZE + 1;
        const w = TILE_SIZE - 2;
        const cx = t.col * TILE_SIZE + TILE_SIZE / 2;
        const cy = t.row * TILE_SIZE + TILE_SIZE / 2;

        // Flash colour fades hot-pink → gold → transparent
        const alpha = progress;
        ctx.fillStyle = progress > 0.5
          ? `rgba(249, 168, 212, ${alpha})`   // pink
          : `rgba(253, 230, 138, ${alpha})`;  // gold
        ctx.fillRect(x, y, w, w);

        // Star-shaped centre sparkle
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((1 - progress) * Math.PI * 0.5);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(-1, -(w * 0.38), 2, w * 0.38);
          ctx.rotate(Math.PI / 4);
        }
        ctx.restore();
      }
    }
  }
}
