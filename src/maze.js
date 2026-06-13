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
      return Math.random() < 0.6 ? TILE.CRATE : TILE.EMPTY;
    })
  );
}

function drawMaze(ctx, maze) {
  for (const [rowIndex, rowTiles] of maze.entries()) {
    for (const [colIndex, tile] of rowTiles.entries()) {
      const x = colIndex * TILE_SIZE;
      const y = rowIndex * TILE_SIZE;

      switch (tile) {
        case TILE.WALL:  ctx.fillStyle = "#3E6B48"; break;
        case TILE.CRATE: ctx.fillStyle = "#B89CFF"; break;
        default:         ctx.fillStyle = "#6DAA5B";
      }

      ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
    }
  }
}
