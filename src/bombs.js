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
      const ringColour = bomb.ownerIndex === 0 ? "#b89cff" : "#4fc3f7";

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = "#1a0a2e";
      ctx.fill();
      ctx.strokeStyle = ringColour;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const fuseProgress = bomb.fuseMs / FUSE_MS;
      const spark = Math.floor(bomb.fuseMs / 200) % 2 === 0 ? "#ffb7d5" : "#b89cff";
      ctx.beginPath();
      ctx.arc(cx + 7 * fuseProgress, cy - 9 * fuseProgress, 3, 0, Math.PI * 2);
      ctx.fillStyle = spark;
      ctx.fill();

    } else {
      const progress = bomb.blastMs / BLAST_DELAY;
      for (const t of bomb.blastTiles) {
        const x = t.col * TILE_SIZE + 1;
        const y = t.row * TILE_SIZE + 1;
        const w = TILE_SIZE - 2;

        ctx.fillStyle = progress > 0.5 ? "#ffb7d5" : "#b89cff";
        ctx.fillRect(x, y, w, w);

        const inner = Math.floor(w * 0.3);
        const off   = Math.floor(w * 0.35);
        ctx.fillStyle = `rgba(255, 255, 255, ${progress * 0.8})`;
        ctx.fillRect(x + off, y + off, inner, inner);
      }
    }
  }
}
