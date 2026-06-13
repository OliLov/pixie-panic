# HUD Planning

## What we want

A small UI bar that sits above the game canvas and shows the player's current
status at a glance — styled to match the existing pixie/fairy theme (dark
forest background, `#b89cff` lavender text, `Press Start 2P` font).

---

## Proposed layout

```
┌─────────────────────────────────────────────┐
│  💣 ×1          PixiePanic          ⏱ 0:00  │  ← HUD bar
├─────────────────────────────────────────────┤
│                                             │
│               <game canvas>                 │
│                                             │
└─────────────────────────────────────────────┘
```

The bar is the same width as the canvas (`COLS × TILE_SIZE = 624 px`).

---

## HUD items (Phase 1)

| Slot | ID | Value source | Notes |
|------|----|--------------|-------|
| Left | `#hud-bombs` | `1 - bombs.length` (0 or 1) | Shows available bombs |
| Centre | — | static text "PixiePanic" | Decorative title |
| Right | `#hud-timer` | seconds elapsed in current game | Counts up from 0 |

A score counter can be added later when crate-destroying awards points.

---

## Tasks

### Task 1 — HTML structure

Add a `.game-wrapper` div inside `#screen-game` that stacks the HUD bar above
the canvas:

```html
<section id="screen-game" class="screen">
  <div class="game-wrapper">
    <div class="hud">
      <span class="hud-item">💣 ×<span id="hud-bombs">1</span></span>
      <span class="hud-title">PixiePanic</span>
      <span class="hud-item">⏱ <span id="hud-timer">0:00</span></span>
    </div>
    <canvas id="game-canvas"></canvas>
  </div>
</section>
```

### Task 2 — CSS styling

Add to `style.css`:

- `.game-wrapper` — `display: flex; flex-direction: column; align-items: center; gap: 0.5rem;`
- `.hud` — same pixel width as canvas, `display: flex; justify-content: space-between`, dark background matching wall tiles (`#111f17`), lavender border bottom, `Press Start 2P` font, `font-size: 0.6rem`, `color: #b89cff`.
- `.hud-title` — pink `#ffb7d5`, inherits the `soft-flicker` animation already defined.
- Canvas — add a `border` using the panel's purple `#3b1d5e` to frame the game world.

### Task 3 — JS: bomb counter

In `src/bombs.js`, after any change to the `bombs` array (place or remove),
call a small helper:

```js
function updateHudBombs() {
  const available = 1 - bombs.filter(b => !b.exploding).length;
  document.getElementById("hud-bombs").textContent = available;
}
```

Call `updateHudBombs()` at the end of `placeBomb()` and `updateBombs()`.

### Task 4 — JS: elapsed timer

Add `elapsedMs = 0` to `state.js`.

In `src/main.js`, inside `update(dt)` while `gameState === "PLAYING"`:

```js
elapsedMs += dt;
const totalSecs = Math.floor(elapsedMs / 1000);
const m = Math.floor(totalSecs / 60).toString().padStart(1, "0");
const s = (totalSecs % 60).toString().padStart(2, "0");
document.getElementById("hud-timer").textContent = `${m}:${s}`;
```

Reset `elapsedMs = 0` inside `startGame()` in `screens.js`.

### Task 5 — JS: reset HUD on new game

In `screens.js › startGame()`, reset the HUD displays to their initial values:

```js
document.getElementById("hud-bombs").textContent = "1";
document.getElementById("hud-timer").textContent = "0:00";
```

---

## File changes summary

| File | Change |
|------|--------|
| `index.html` | Wrap canvas in `.game-wrapper`, add `.hud` bar |
| `style.css` | Add `.game-wrapper`, `.hud`, `.hud-title`, canvas border |
| `src/state.js` | Add `let elapsedMs = 0` |
| `src/bombs.js` | Add `updateHudBombs()`, call after mutations |
| `src/main.js` | Tick and format `elapsedMs`, write to `#hud-timer` |
| `src/screens.js` | Reset HUD values in `startGame()` |

---

## Out of scope for now

- Score from crate destruction
- Lives / respawn counter
- High score persistence
