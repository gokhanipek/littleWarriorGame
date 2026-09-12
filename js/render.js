// All canvas drawing. Rendering is pure output: it reads game state and the
// camera but never mutates them.

import { CANVAS, WORLD, FLORA, SPRITE, CYCLE, CAMERA, STAMINA, PLAYER, GAME } from "./config.js";
import { images } from "./assets.js";
import { leavesY } from "./world.js";

const FRAME_WIDTH = SPRITE.sheetWidth / SPRITE.frameCount; // 18

// Linear interpolation between two hex colors, returning an rgb() string.
function lerpColor(a, b, t) {
  const ah = parseInt(a.replace(/#/g, ""), 16);
  const ar = ah >> 16;
  const ag = (ah >> 8) & 0xff;
  const ab = ah & 0xff;
  const bh = parseInt(b.replace(/#/g, ""), 16);
  const br = bh >> 16;
  const bg = (bh >> 8) & 0xff;
  const bb = bh & 0xff;
  const rr = ar + t * (br - ar);
  const rg = ag + t * (bg - ag);
  const rb = ab + t * (bb - ab);
  return `rgb(${rr | 0},${rg | 0},${rb | 0})`;
}

// 0 -> 1 progress through the day/night cycle.
function cycleProgress() {
  return (Date.now() % CYCLE.durationMs) / CYCLE.durationMs;
}

function drawBackground(ctx, camera) {
  const phase = cycleProgress();
  const t = phase < 0.5 ? phase * 2 : (1 - phase) * 2; // 0 -> 1 -> 0 (night at 1)

  const topColor = lerpColor(CYCLE.dayTop, CYCLE.nightTop, t);
  const bottomColor = lerpColor(CYCLE.dayBottom, CYCLE.nightBottom, t);

  // The visible area in world units shrinks under zoom, so the sky fill and
  // gradient must span the view size, not the full physical canvas. The fill
  // is anchored to the camera so it always covers the visible view.
  const viewWidth = CANVAS.width / CAMERA.zoom;
  const viewHeight = CANVAS.height / CAMERA.zoom;

  const gradient = ctx.createLinearGradient(0, camera.y, 0, camera.y + viewHeight);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(camera.x, camera.y, viewWidth, viewHeight);

  // Parallax layers scroll slower than the world. Vertical parallax is
  // lighter so the sky doesn't slide off during jumps.
  const skyX = camera.x * CAMERA.parallaxSky;
  const skyY = camera.y * CAMERA.parallaxSky;

  // Sun / moon
  ctx.fillStyle = t < 0.5 ? "yellow" : "white";
  ctx.beginPath();
  ctx.arc(700 - skyX, 80 - skyY, 40, 0, Math.PI * 2);
  ctx.fill();

  // Clouds
  ctx.fillStyle = t < 0.5 ? "white" : "gray";
  ctx.beginPath();
  ctx.arc(200 - skyX, 100 - skyY, 30, 0, Math.PI * 2);
  ctx.arc(230 - skyX, 100 - skyY, 25, 0, Math.PI * 2);
  ctx.arc(170 - skyX, 100 - skyY, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(600 - skyX, 80 - skyY, 30, 0, Math.PI * 2);
  ctx.arc(630 - skyX, 80 - skyY, 25, 0, Math.PI * 2);
  ctx.arc(570 - skyX, 80 - skyY, 25, 0, Math.PI * 2);
  ctx.fill();

  // Mountains
  const mtnX = camera.x * CAMERA.parallaxMountain;
  const mtnY = camera.y * CAMERA.parallaxMountain;
  ctx.fillStyle = "#556B2F";
  ctx.beginPath();
  ctx.moveTo(-200 - mtnX, WORLD.ground - mtnY);
  ctx.lineTo(100 - mtnX, 150 - mtnY);
  ctx.lineTo(400 - mtnX, WORLD.ground - mtnY);
  ctx.fill();

  ctx.fillStyle = "#6B8E23";
  ctx.beginPath();
  ctx.moveTo(200 - mtnX, WORLD.ground - mtnY);
  ctx.lineTo(500 - mtnX, 120 - mtnY);
  ctx.lineTo(800 - mtnX, WORLD.ground - mtnY);
  ctx.fill();
}

function drawTerrain(ctx, camera) {
  const { ground, waterWidth, mapStart, mapEnd, groundThickness, waterThickness, waterYOffset } = WORLD;

  // Left water
  ctx.fillStyle = "#1E90FF";
  ctx.fillRect(0 - camera.x, ground + waterYOffset - camera.y, waterWidth, waterThickness);
  // Ground band
  ctx.fillStyle = "#228822";
  ctx.fillRect(waterWidth - camera.x, ground - camera.y, mapEnd - mapStart - waterWidth, groundThickness);
  // Right water
  ctx.fillStyle = "#1E90FF";
  ctx.fillRect(mapEnd - waterWidth - camera.x, ground + waterYOffset - camera.y, waterWidth, waterThickness);
}

function drawTrees(ctx, world, camera) {
  const { tree, fruit } = FLORA;
  world.trees.forEach((t) => {
    const screenX = t.x - camera.x;

    ctx.drawImage(images.treeTrunk, screenX, t.y + tree.trunkOffsetY - camera.y, tree.trunkWidth, tree.trunkHeight);

    const leavesX = screenX - (tree.leavesWidth / 2 - tree.trunkWidth / 2);
    const baseLeavesY = leavesY(t);
    ctx.drawImage(images.treeLeaves, leavesX, baseLeavesY - camera.y, tree.leavesWidth, tree.leavesHeight);

    t.fruits.forEach((f) => {
      if (!f.collected) {
        ctx.drawImage(images.fruit, f.x - camera.x, baseLeavesY + f.offsetY - camera.y, fruit.width, fruit.height);
      }
    });
  });
}

function drawPlants(ctx, world, camera) {
  const { plant } = FLORA;
  const w = plant.sheetWidth * plant.scale;
  const h = plant.sheetHeight * plant.scale;
  world.plants.forEach((p) => {
    const screenX = p.x - camera.x;
    if (!p.collected) {
      ctx.drawImage(images.plant, screenX, p.y - camera.y, w, h);
    } else {
      // collected: draw a squashed stub
      ctx.drawImage(images.plant, screenX, p.y + h * 0.5 - camera.y, w, h * 0.25);
    }
  });
}

function drawPlayer(ctx, player, camera) {
  const { states } = SPRITE;
  let column;
  if (player.animationState === "right") column = states.right + player.frameIndex;
  else if (player.animationState === "left") column = states.left + player.frameIndex;
  else column = states.idle + player.frameIndex;

  ctx.drawImage(
    images.character,
    column * FRAME_WIDTH, 0, FRAME_WIDTH, SPRITE.frameHeight,
    player.x - camera.x, player.y + PLAYER.drawOffsetY - camera.y,
    player.w, player.h
  );
}

function drawUI(ctx, world, player) {
  ctx.fillStyle = "black";
  ctx.font = "16px Arial";
  ctx.fillText("Fruits: " + world.collectedFruits, 10, 20);
  ctx.fillText("Plants: " + world.collectedPlants, 10, 40);
  ctx.fillText("Stamina:", 10, 60);

  const barX = 80;
  const barY = 50;
  const barWidth = 300;
  const barHeight = 10;
  ctx.fillStyle = "red";
  ctx.fillRect(barX, barY, barWidth, barHeight);
  ctx.fillStyle = "limegreen";
  ctx.fillRect(barX, barY, (player.stamina / STAMINA.max) * barWidth, barHeight);

  // Countdown timer, centered near the top. Turns red in the final seconds.
  const seconds = Math.ceil(world.timeLeft);
  ctx.textAlign = "center";
  ctx.font = "bold 28px Arial";
  ctx.fillStyle = world.timeLeft <= 3 ? "#D22" : "black";
  ctx.fillText(seconds + "s", CANVAS.width / 2, 34);
  ctx.textAlign = "left";
}

// Full-screen score screen shown when the timer runs out.
function drawGameOver(ctx, world) {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  const cx = CANVAS.width / 2;
  ctx.textAlign = "center";

  ctx.fillStyle = "white";
  ctx.font = "bold 40px Arial";
  ctx.fillText("Time's Up!", cx, 120);

  const score = world.collectedFruits + world.collectedPlants;
  ctx.font = "bold 30px Arial";
  ctx.fillText("Score: " + score, cx, 180);

  ctx.font = "20px Arial";
  ctx.fillText("Fruits: " + world.collectedFruits + "    Plants: " + world.collectedPlants, cx, 220);

  ctx.font = "18px Arial";
  ctx.fillStyle = "#DDD";
  ctx.fillText("Score submitted to the leaderboard", cx, 265);
  ctx.fillText("Press Enter or R to play again", cx, 295);

  ctx.textAlign = "left";
}

export function render(ctx, world, player, camera) {
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);

  // World layers are drawn under a zoom transform so the camera sits closer
  // to the player. Each draw call subtracts the camera position (in world
  // units), and the zoom scales everything about the top-left origin.
  ctx.save();
  ctx.scale(CAMERA.zoom, CAMERA.zoom);
  drawBackground(ctx, camera);
  drawTerrain(ctx, camera);
  drawTrees(ctx, world, camera);
  drawPlants(ctx, world, camera);
  drawPlayer(ctx, player, camera);
  ctx.restore();

  // UI is drawn in screen space (unscaled) so text stays crisp and fixed.
  drawUI(ctx, world, player);

  // The "ready" screen is an HTML overlay (see index.html) so it can host a
  // text input. Only the game-over screen is drawn on the canvas.
  if (world.phase === "gameover") {
    drawGameOver(ctx, world);
  }
}
