// Entry point: sets up the canvas, creates game state, and runs the loop.

import { CANVAS, WORLD, CAMERA } from "./config.js";
import { initInput } from "./input.js";
import { createPlayer, updatePlayer } from "./player.js";
import { createWorld, updateCollection, updateTimer } from "./world.js";
import { render } from "./render.js";
import { submitScore, sanitizeName } from "./leaderboard.js";

const canvas = document.getElementById("game");
canvas.width = CANVAS.width;
canvas.height = CANVAS.height;
const ctx = canvas.getContext("2d");

initInput();

// Start overlay elements (name entry lives in the DOM since canvas can't
// take text input).
const startOverlay = document.getElementById("startOverlay");
const nameInput = document.getElementById("nameInput");
const startButton = document.getElementById("startButton");
const startError = document.getElementById("startError");

// Mutable so a restart can swap in fresh state.
let player = createPlayer();
let world = createWorld();
let playerName = "";
let prevPhase = world.phase; // used to detect the playing -> gameover edge

function showStartOverlay() {
  startOverlay.style.display = "flex";
  startError.textContent = "";
  nameInput.focus();
  nameInput.select();
}

function hideStartOverlay() {
  startOverlay.style.display = "none";
}

// Begin a run once a valid name is entered.
function startGame() {
  const name = sanitizeName(nameInput.value);
  if (!name) {
    startError.textContent = "Please enter a name.";
    nameInput.focus();
    return;
  }
  playerName = name;
  hideStartOverlay();
  world.phase = "playing";
  canvas.focus();
}

startButton.addEventListener("click", startGame);
nameInput.addEventListener("keydown", (e) => {
  if (e.code === "Enter") startGame();
});

// After game over, Enter/R sets up a fresh run and shows the name overlay
// again (keeping the previous name pre-filled for convenience).
document.addEventListener("keydown", (e) => {
  if (world.phase === "gameover" && (e.code === "Enter" || e.code === "KeyR")) {
    restart();
  }
});

function restart() {
  player = createPlayer();
  world = createWorld();
  prevPhase = world.phase;
  camera.x = 0;
  camera.y = 0;
  nameInput.value = playerName; // pre-fill last name
  showStartOverlay();
}

// Submit the finished run's score. Fire-and-forget with console reporting so
// a network hiccup never blocks the game loop.
async function handleGameOver() {
  const score = world.collectedFruits + world.collectedPlants;
  const { error } = await submitScore(playerName, score);
  if (error) {
    console.error("Failed to submit score:", error.message);
  } else {
    console.log(`Submitted score ${score} for ${playerName}.`);
  }
}

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

  if (world.phase === "playing") {
    updatePlayer(player, dt);
    updateCollection(world, player, Date.now());
    updateTimer(world, dt);
    updateCamera(dt);
  }

  // Detect the exact playing -> gameover edge so we submit the score once.
  if (prevPhase === "playing" && world.phase === "gameover") {
    handleGameOver();
  }
  prevPhase = world.phase;

  render(ctx, world, player, camera);

  requestAnimationFrame(loop);
}

// Show the name entry immediately on load, then run the loop.
showStartOverlay();
requestAnimationFrame(loop);
