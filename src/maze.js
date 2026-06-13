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
  // Base fill — soft lavender gap between tiles
  ctx.fillStyle = "#d8b4fe";
  ctx.fillRect(0, 0, COLS * TILE_SIZE, ROWS * TILE_SIZE);

  for (const [rowIndex, rowTiles] of maze.entries()) {
    for (const [colIndex, tile] of rowTiles.entries()) {
      const x = colIndex * TILE_SIZE;
      const y = rowIndex * TILE_SIZE;
      const s = TILE_SIZE;

      switch (tile) {
        case TILE.WALL: {
          // Glittering crystal wall — deep violet body
          ctx.fillStyle = "#7c3aed";
          ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
          // Bright lilac top-left facet (light source)
          ctx.fillStyle = "#a78bfa";
          ctx.fillRect(x + 1, y + 1, s - 2, 4);
          ctx.fillRect(x + 1, y + 1, 4, s - 2);
          // Deep shadow bottom-right
          ctx.fillStyle = "#4c1d95";
          ctx.fillRect(x + s - 4, y + 1, 3, s - 2);
          ctx.fillRect(x + 1, y + s - 4, s - 2, 3);
          // Tiny sparkle dot at the top-left corner
          ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
          ctx.fillRect(x + 3, y + 3, 3, 3);
          break;
        }
        case TILE.CRATE: {
          // Enchanted flower-box — warm pink body
          ctx.fillStyle = "#f9a8d4";
          ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
          // Hot-pink top-left highlight
          ctx.fillStyle = "#f472b6";
          ctx.fillRect(x + 1, y + 1, s - 2, 4);
          ctx.fillRect(x + 1, y + 1, 4, s - 2);
          // Rose bottom-right shadow
          ctx.fillStyle = "#be185d";
          ctx.fillRect(x + s - 4, y + 1, 3, s - 2);
          ctx.fillRect(x + 1, y + s - 4, s - 2, 3);
          // Small flower emblem in centre
          ctx.fillStyle = "#ffffff";
          const mx = x + s / 2;
          const my = y + s / 2;
          ctx.fillRect(mx - 1, my - 5, 2, 10); // vertical petal
          ctx.fillRect(mx - 5, my - 1, 10, 2); // horizontal petal
          ctx.beginPath();
          ctx.arc(mx, my, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#fde68a";
          ctx.fill();
          break;
        }
        default: {
          // Meadow floor — soft mint/sky gradient effect via two rects
          ctx.fillStyle = "#bfdbfe";
          ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
          // Subtle lighter top shimmer
          ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
          ctx.fillRect(x + 1, y + 1, s - 2, 6);
          break;
        }
      }
    }
  }
}
