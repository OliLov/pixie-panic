"use strict";

function buildMaze(cols, rows) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => {
      if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) {
        return TILE.WALL;
      }
      if (row % 2 === 0 && col % 2 === 0) {
        return TILE.WALL;
      }
      if (row <= 2 && col <= 2) {
        return TILE.EMPTY;
      }
      // Keep P2 spawn clear (bottom-right corner)
      if (row >= rows - 3 && col >= cols - 3) {
        return TILE.EMPTY;
      }
      return Math.random() < 0.6 ? TILE.CRATE : TILE.EMPTY;
    })
  );
}

function drawMaze(ctx, maze) {
  // Base fill — shows through the 1px gaps between tiles
  ctx.fillStyle = "#0a120d";
  ctx.fillRect(0, 0, COLS * TILE_SIZE, ROWS * TILE_SIZE);

  for (const [rowIndex, rowTiles] of maze.entries()) {
    for (const [colIndex, tile] of rowTiles.entries()) {
      const x = colIndex * TILE_SIZE;
      const y = rowIndex * TILE_SIZE;
      const s = TILE_SIZE;

      switch (tile) {
        case TILE.WALL: {
          // Dense dark thicket
          ctx.fillStyle = "#111f17";
          ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
          // Mossy top-left sheen
          ctx.fillStyle = "#1c3322";
          ctx.fillRect(x + 1, y + 1, s - 2, 3);
          ctx.fillRect(x + 1, y + 1, 3, s - 2);
          break;
        }
        case TILE.CRATE: {
          // Fairy mushroom — deep purple body
          ctx.fillStyle = "#3b1d5e";
          ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
          // Lavender top-left highlight
          ctx.fillStyle = "#5c3490";
          ctx.fillRect(x + 1, y + 1, s - 2, 4);
          ctx.fillRect(x + 1, y + 1, 4, s - 2);
          // Dark bottom-right shadow
          ctx.fillStyle = "#220f40";
          ctx.fillRect(x + s - 4, y + 1, 3, s - 2);
          ctx.fillRect(x + 1, y + s - 4, s - 2, 3);
          break;
        }
        default: {
          // Forest floor
          ctx.fillStyle = "#243d2e";
          ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
          break;
        }
      }
    }
  }
}
