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

// Camera position in world coordinates: the top-left of the visible view.
const camera = { x: 0, y: 0 };

function updateCamera(dt) {
  // With zoom, the visible slice of the world is smaller than the canvas.
  // Camera math works in world units, so use the zoomed view size.
  const viewWidth = CANVAS.width / CAMERA.zoom;
  const viewHeight = CANVAS.height / CAMERA.zoom;

  // Center the camera on the player's center point, then offset back by the
  // configured fraction of the view so the player sits where we want.
  const playerCenterX = player.x + player.w / 2;
  const playerCenterY = player.y + player.h / 2;

  let targetX = playerCenterX - viewWidth * CAMERA.centerX;
  let targetY = playerCenterY - viewHeight * CAMERA.centerY;

  // Clamp horizontally to the world edges so we never scroll past the map.
  targetX = Math.max(
    WORLD.mapStart - WORLD.waterWidth,
    Math.min(WORLD.mapEnd - viewWidth, targetX)
  );

  // Clamp vertically so the bottom of the view never drops below the ground
  // band. The world is short, so this keeps the ground on screen.
  const maxY = WORLD.ground + WORLD.groundThickness - viewHeight;
  targetY = Math.min(maxY, targetY);

  // Frame-rate independent smoothing: exponential approach based on dt.
  const smoothing = 1 - Math.pow(1 - CAMERA.smoothing, dt * 60);
  camera.x += (targetX - camera.x) * smoothing;
  camera.y += (targetY - camera.y) * smoothing;
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
  render(ctx, world, player, camera);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
