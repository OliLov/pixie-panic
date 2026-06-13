"use strict";

const TILE = { EMPTY: 0, WALL: 1, CRATE: 2 };

const COLS         = 13;
const ROWS         = 11;
const TILE_SIZE    = 48;

const FUSE_MS          = 3000;
const BLAST_DELAY      = 500;
const BLAST_RADIUS     = 1;
const BOMB_COOLDOWN_MS = 1500; // ms before a player can place another bomb
const MAX_BOMBS        = 3;

const MAX_HEARTS       = 3;
const INVINCIBILITY_MS = 1500; // ms of flicker after taking a hit
const KICK_TILE_MS     = 90;   // ms per tile for a sliding (kicked) bomb
const SPEED_BOOST_MS   = 8000; // ms the speed power-up lasts

const POWERUP_TYPE = { BLAST_UP: 0, BOMB_UP: 1, SPEED_UP: 2, HEART: 3 };

// Controls per player index — P1: WASD + Q, P2: Arrows + Space
const CONTROLS = [
  { up: "w", down: "s", left: "a", right: "d", bomb: "q" },
  { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight", bomb: " " },
];
