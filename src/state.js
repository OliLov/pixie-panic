"use strict";

let canvas;
let ctx;
let maze;

function makePlayer(col, row) {
  return {
    col, row,
    alive: true,
    hearts: MAX_HEARTS,
    invincibleMs: 0,        // ms of invincibility left after a hit
    moveCooldown: 0,
    moveInterval: 150,      // base ms between moves — speed power-up lowers this
    speedBoostMs: 0,        // ms of speed boost remaining
    bombCooldown: 0,
    maxBombs: 1,            // how many bombs the player can have active at once
    blastRadius: BLAST_RADIUS,
  };
}

// Two players — P1 spawns top-left, P2 spawns bottom-right
let players = [
  makePlayer(1, 1),
  makePlayer(COLS - 2, ROWS - 2),
];

const keys = {};

let bombs         = [];
let powerups      = [];
let gameState     = "PLAYING";
let lastTimestamp = 0;
let deathTimer    = 0;
let elapsedMs     = 0;
let winner        = null;  // null | 0 | 1 (player index) | "draw"
