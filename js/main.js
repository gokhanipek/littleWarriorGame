// Entry point: sets up the canvas, creates game state, and runs the loop.

import { CANVAS, WORLD, CAMERA } from "./config.js";
import { initInput } from "./input.js";
import { createPlayer, updatePlayer } from "./player.js";
import { createWorld, updateCollection } from "./world.js";
import { render } from "./render.js";

const canvas = document.getElementById("game");
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;
const ctx = canvas.getContext("2d");

initInput();

const player = createPlayer();
const world = createWorld();

let cameraX = 0;

function updateCamera(dt) {
  let target;
  if (player.direction === "right") {
    target = player.x - CANVAS.width * CAMERA.leadRight;
  } else {
    target = player.x - CANVAS.width * CAMERA.leadLeft;
  }
  target = Math.max(WORLD.mapStart - WORLD.waterWidth, Math.min(WORLD.mapEnd - CANVAS.width, target));

  // Frame-rate independent smoothing: original used a fixed 0.05 lerp per
  // frame at ~60fps. Convert to an exponential approach based on dt.
  const smoothing = 1 - Math.pow(1 - CAMERA.smoothing, dt * 60);
  cameraX += (target - cameraX) * smoothing;
}

let lastTime = null;
function loop(timestamp) {
  // On the very first frame, establish a baseline so dt starts near zero
  // instead of the full time-since-page-load.
  if (lastTime === null) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000; // seconds
  lastTime = timestamp;

  updatePlayer(player, dt);
  updateCollection(world, player, Date.now());
  updateCamera(dt);
  render(ctx, world, player, cameraX);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
