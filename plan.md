# Pixie Panic – Bomberman Clone: Development Plan

## Overview

A browser-based Bomberman-style game built with plain **HTML**, **CSS**, and **JavaScript** (no frameworks, no build tools). The initial version features a single player who can navigate a maze and place bombs. There is no win condition or enemies yet — only a lose condition triggered by the player's own bomb.

---

## Scope (Phase 1)

| Feature | Status |
|---|---|
| Loading / Start screen | Planned |
| Game loop (player + maze + bombs) | Planned |
| Lose screen | Planned |
| Enemies / AI | ❌ Out of scope |
| Win condition | ❌ Out of scope |
| Multiplayer | ❌ Out of scope |

---

## File Structure

```
pixie-panic/
├── index.html        # Single HTML entry point, hosts all screens
├── style.css         # Global styles, screen layouts, animations
├── game.js           # All game logic (state machine, loop, input, rendering)
└── plan.md           # This document
```

---

## Screen Architecture

The game is managed as a simple **state machine** with three states:

```
START  ──(press Start)──▶  PLAYING  ──(player dies)──▶  GAME_OVER
  ▲                                                          │
  └────────────────────(press Restart)──────────────────────┘
```

Each state corresponds to a screen `<div>` in `index.html`. Only the active screen is visible at any time.

---

## Tasks

---

### Task 1 – Project Scaffold

**Goal:** Create the three files and wire them together.

**Steps:**
1. Create `index.html` with a `<link>` to `style.css` and a `<script>` tag pointing to `game.js` (placed at the bottom of `<body>`).
2. Create `style.css` with a CSS reset, a `body` set to `margin: 0`, a fixed background colour, and a base font.
3. Create `game.js` with a single `DOMContentLoaded` listener that logs `"ready"` to confirm the wiring works.

**Guidelines:**
- Use a dark background (e.g. `#1a1a2e`) to give it an arcade feel from the start.
- Keep all JS in one file for now; structure it with clearly commented sections.

---

### Task 2 – Start Screen

**Goal:** Display a title screen and a "Start Game" button.

**HTML structure:**
```html
<div id="screen-start" class="screen active">
  <h1>Pixie Panic</h1>
  <p>Navigate the maze and place bombs!</p>
  <button id="btn-start">Start Game</button>
</div>
```

**Steps:**
1. Add the `#screen-start` div inside `<body>` in `index.html`.
2. In `style.css`, style `.screen` to be `position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;` and add `.screen:not(.active) { display: none; }`.
3. Style the title with a large, bold, arcade-style font (Google Fonts `Press Start 2P` works well, loaded via a `<link>` in the `<head>`).
4. In `game.js`, add a `startGame()` function that removes `.active` from `#screen-start` and adds `.active` to `#screen-game`.
5. Attach `startGame` to the `#btn-start` `click` event.

**Guidelines:**
- Only the div with class `active` is shown; switching screens is just swapping the `active` class.
- Add a simple CSS fade-in animation on `.screen.active` so transitions feel smooth.

---

### Task 3 – The Maze (Grid)

**Goal:** Render a tile-based maze on a `<canvas>` element.

**Maze rules (for Phase 1):**
- The grid is **13 × 11** tiles (standard Bomberman proportions).
- **Solid walls** – indestructible, placed in a fixed checkerboard pattern at every even-row/even-column intersection.
- **Soft blocks** – destructible crates, randomly placed on the remaining open tiles (skip the player's starting corner: top-left 2×2 area must stay clear).
- **Empty tiles** – walkable floor.

**Tile type constants:**
```js
const TILE = { EMPTY: 0, WALL: 1, CRATE: 2 };
```

**Steps:**
1. Add `<canvas id="game-canvas">` inside a `#screen-game` div.
2. In `game.js`, write `buildMaze(cols, rows)` that returns a 2D array following the rules above.
3. Write `drawMaze(ctx, maze)` that iterates the array and fills each tile with a colour:
   - `WALL` → dark grey `#444`
   - `CRATE` → brown `#a0522d`
   - `EMPTY` → light `#e8c97a`
4. Call `drawMaze` once at start, and again each frame inside the game loop.

**Guidelines:**
- Store tile size in a constant (e.g. `TILE_SIZE = 48`) so the canvas size can be computed as `cols * TILE_SIZE`.
- Draw walls with a 2px inset so the grid lines are visible.

---

### Task 4 – The Player

**Goal:** Render the player and move them around the maze with keyboard input.

**Player state object:**
```js
const player = {
  col: 1, row: 1,       // tile position
  x: 0, y: 0,           // pixel position (derived from col/row)
  alive: true
};
```

**Steps:**
1. Track which keys are held using a `keys` object updated by `keydown` / `keyup` listeners.
2. Write `movePlayer(maze, player, keys, dt)`:
   - Read the arrow keys (or WASD).
   - Compute the desired next tile; only move if it is `TILE.EMPTY`.
   - Move one tile at a time (no sub-tile movement in Phase 1 — simplest approach is to move on `keydown`, not continuously).
3. Represent the player as a coloured circle on the canvas (no sprites yet).
4. Draw the player at `(player.col * TILE_SIZE + offset, player.row * TILE_SIZE + offset)`.

**Guidelines:**
- To prevent diagonal movement, only process one direction per frame (prioritise the last pressed key).
- Grid-locked movement (snap to tiles) is far simpler than pixel movement for collision detection at this stage. Use a small cooldown (~150 ms) between moves to avoid instant teleportation at held keys.

---

### Task 5 – The Game Loop

**Goal:** Wire up `requestAnimationFrame` so the game updates and redraws every frame.

**Loop structure:**
```js
function loop(timestamp) {
  const dt = timestamp - lastTimestamp;
  lastTimestamp = timestamp;

  update(dt);   // move player, tick bombs
  render();     // clear canvas, draw maze, draw bombs, draw player

  if (gameState === 'PLAYING') requestAnimationFrame(loop);
}
```

**Steps:**
1. Create a `gameState` variable (`'START'`, `'PLAYING'`, `'GAME_OVER'`).
2. `startGame()` sets `gameState = 'PLAYING'` and calls `requestAnimationFrame(loop)`.
3. `update(dt)` calls `movePlayer` and `updateBombs`.
4. `render()` clears the canvas with `ctx.clearRect`, then calls `drawMaze`, `drawBombs`, `drawPlayer`.
5. When `player.alive` becomes `false`, set `gameState = 'GAME_OVER'` and stop the loop.

**Guidelines:**
- Always pass `dt` (delta time in ms) into update functions, even if movement is tile-locked, so it's easy to add timed behaviour (bomb fuses) later.
- `requestAnimationFrame` is only re-queued while `gameState === 'PLAYING'`, stopping automatically on game over.

---

### Task 6 – Bombs

**Goal:** Let the player place a bomb that explodes after a fuse and destroys crates in a plus-shaped blast.

**Bomb state object:**
```js
{ col, row, fuseMs: 3000, exploding: false, blastRadius: 2 }
```

**Steps:**
1. Maintain a `bombs` array in game state.
2. On `Space` keydown, if no bomb already exists at the player's tile, push a new bomb object.
3. In `updateBombs(dt)`:
   - Decrement `fuseMs` by `dt`.
   - When `fuseMs <= 0`, call `explodeBomb(bomb, maze)`.
4. `explodeBomb`:
   - Mark the bomb's tile and up to `blastRadius` tiles in each cardinal direction as **blast tiles** (stop at walls, destroy crates).
   - Set `bomb.exploding = true` and start a short display timer (~500 ms), then remove it from the array.
   - If any blast tile overlaps the player's position, set `player.alive = false`.
5. Draw bombs as a dark circle with a small fuse spark; draw blast tiles as a bright orange/yellow overlay.

**Guidelines:**
- Blast propagation must stop at `TILE.WALL` (solid) and also stop (after destroying) at `TILE.CRATE`.
- The explosion should still kill the player even if the crate is destroyed in the same frame, so check player overlap after updating the maze tiles.
- Limit the player to **one bomb at a time** for Phase 1.

---

### Task 7 – Lose Screen

**Goal:** Show a "Game Over" screen when the player dies, with a restart button.

**HTML structure:**
```html
<div id="screen-gameover" class="screen">
  <h1>Game Over</h1>
  <p>You were caught in your own blast!</p>
  <button id="btn-restart">Play Again</button>
</div>
```

**Steps:**
1. Add `#screen-gameover` to `index.html`.
2. In `game.js`, write `showGameOver()`:
   - Remove `.active` from `#screen-game`.
   - Add `.active` to `#screen-gameover`.
3. Call `showGameOver()` inside the game loop when `gameState` transitions to `'GAME_OVER'`.
4. Wire `#btn-restart` to a `resetGame()` function that:
   - Re-initialises all game state (new maze, player back to start, empty bombs array).
   - Switches back to the start screen **or** jumps straight back into the game loop (choose one — straight restart is more arcade-like).

**Guidelines:**
- Add a brief delay (e.g. 1 second) before showing the Game Over screen so the player can see the explosion animation first.
- Reuse the same `startGame()` path for restart to avoid duplicating initialisation logic.

---

## Implementation Order

```
Task 1  →  Task 2  →  Task 3  →  Task 4  →  Task 5  →  Task 6  →  Task 7
Scaffold   Start Scr  Maze       Player     Game Loop  Bombs       Lose Scr
```

Each task produces something visible/testable before the next one begins.

---

## Visual Style Reference

| Element | Colour |
|---|---|
| Background | `#1a1a2e` |
| Empty tile | `#e8c97a` |
| Wall tile | `#444457` |
| Crate tile | `#a0522d` |
| Player | `#4fc3f7` (light blue) |
| Bomb | `#222222` with white fuse |
| Explosion | `#ff6f00` / `#ffeb3b` |
| UI text | `#ffffff` |
| Button | `#e91e63` with white text |

---

## Out of Scope (Future Phases)

- Enemy AI
- Win condition / level completion
- Power-ups (extra bombs, larger blast radius, speed)
- Multiple levels
- Sprite/pixel art graphics
- Sound effects
- High score tracking
