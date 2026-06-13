"use strict";

let canvas;
let ctx;
let maze;

let player = {
  col: 1,
  row: 1,
  alive: true,
};

const keys = {};

let bombs        = [];
let gameState    = "PLAYING";
let lastTimestamp = 0;
let moveCooldown  = 0;
let deathTimer    = 0;
