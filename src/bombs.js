"use strict";

function placeBomb() {
  if (bombs.some(b => b.col === player.col && b.row === player.row)) return;

  bombs.push({
    col: player.col,
    row: player.row,
    fuseMs: FUSE_MS,
    exploding: false,
    blastMs: 0,
    blastTiles: [],
  });
}

function explodeBomb(bomb) {
  const tiles = [{ col: bomb.col, row: bomb.row }];

  for (const [dc, dr] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
    for (let step = 1; step <= BLAST_RADIUS; step++) {
      const c = bomb.col + dc * step;
      const r = bomb.row + dr * step;

      if (maze[r][c] === TILE.WALL) break;

      tiles.push({ col: c, row: r });

      if (maze[r][c] === TILE.CRATE) {
        maze[r][c] = TILE.EMPTY;
        break;
      }
    }
  }

  bomb.blastTiles = tiles;
  bomb.exploding  = true;
  bomb.blastMs    = BLAST_DELAY;

  if (tiles.some(t => t.col === player.col && t.row === player.row)) {
    player.alive = false;
  }
}

function updateBombs(dt) {
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

      ctx.beginPath();
      ctx.arc(cx, cy, TILE_SIZE / 2 - 8, 0, Math.PI * 2);
      ctx.fillStyle = "#222222";
      ctx.fill();

      const spark = Math.floor(bomb.fuseMs / 200) % 2 === 0 ? "#ffffff" : "#ffeb3b";
      ctx.beginPath();
      ctx.arc(cx + 7, cy - 9, 3, 0, Math.PI * 2);
      ctx.fillStyle = spark;
      ctx.fill();
    } else {
      const progress = bomb.blastMs / BLAST_DELAY;
      for (const t of bomb.blastTiles) {
        ctx.fillStyle = progress > 0.5 ? "#ffeb3b" : "#ff6f00";
        ctx.fillRect(t.col * TILE_SIZE + 1, t.row * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      }
    }
  }
}
