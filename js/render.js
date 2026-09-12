// All canvas drawing. Rendering is pure output: it reads game state and the
// camera but never mutates them.

import { CANVAS, WORLD, FLORA, SPRITE, CYCLE, CAMERA, STAMINA, PLAYER } from "./config.js";
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

function drawBackground(ctx, cameraX) {
  const phase = cycleProgress();
  const t = phase < 0.5 ? phase * 2 : (1 - phase) * 2; // 0 -> 1 -> 0 (night at 1)

  const topColor = lerpColor(CYCLE.dayTop, CYCLE.nightTop, t);
  const bottomColor = lerpColor(CYCLE.dayBottom, CYCLE.nightBottom, t);

  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS.height);
  gradient.addColorStop(0, topColor);
  gradient.addColorStop(1, bottomColor);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS.width, CANVAS.height);

  const sky = cameraX * CAMERA.parallaxSky;

  // Sun / moon
  ctx.fillStyle = t < 0.5 ? "yellow" : "white";
  ctx.beginPath();
  ctx.arc(700 - sky, 80, 40, 0, Math.PI * 2);
  ctx.fill();

  // Clouds
  ctx.fillStyle = t < 0.5 ? "white" : "gray";
  ctx.beginPath();
  ctx.arc(200 - sky, 100, 30, 0, Math.PI * 2);
  ctx.arc(230 - sky, 100, 25, 0, Math.PI * 2);
  ctx.arc(170 - sky, 100, 25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(600 - sky, 80, 30, 0, Math.PI * 2);
  ctx.arc(630 - sky, 80, 25, 0, Math.PI * 2);
  ctx.arc(570 - sky, 80, 25, 0, Math.PI * 2);
  ctx.fill();

  // Mountains
  const mtn = cameraX * CAMERA.parallaxMountain;
  ctx.fillStyle = "#556B2F";
  ctx.beginPath();
  ctx.moveTo(-200 - mtn, WORLD.ground);
  ctx.lineTo(100 - mtn, 150);
  ctx.lineTo(400 - mtn, WORLD.ground);
  ctx.fill();

  ctx.fillStyle = "#6B8E23";
  ctx.beginPath();
  ctx.moveTo(200 - mtn, WORLD.ground);
  ctx.lineTo(500 - mtn, 120);
  ctx.lineTo(800 - mtn, WORLD.ground);
  ctx.fill();
}

function drawTerrain(ctx, cameraX) {
  const { ground, waterWidth, mapStart, mapEnd, groundThickness, waterThickness, waterYOffset } = WORLD;

  // Left water
  ctx.fillStyle = "#1E90FF";
  ctx.fillRect(0 - cameraX, ground + waterYOffset, waterWidth, waterThickness);
  // Ground band
  ctx.fillStyle = "#228822";
  ctx.fillRect(waterWidth - cameraX, ground, mapEnd - mapStart - waterWidth, groundThickness);
  // Right water
  ctx.fillStyle = "#1E90FF";
  ctx.fillRect(mapEnd - waterWidth - cameraX, ground + waterYOffset, waterWidth, waterThickness);
}

function drawTrees(ctx, world, cameraX) {
  const { tree, fruit } = FLORA;
  world.trees.forEach((t) => {
    const screenX = t.x - cameraX;

    ctx.drawImage(images.treeTrunk, screenX, t.y + tree.trunkOffsetY, tree.trunkWidth, tree.trunkHeight);

    const leavesX = screenX - (tree.leavesWidth / 2 - tree.trunkWidth / 2);
    const baseLeavesY = leavesY(t);
    ctx.drawImage(images.treeLeaves, leavesX, baseLeavesY, tree.leavesWidth, tree.leavesHeight);

    t.fruits.forEach((f) => {
      if (!f.collected) {
        ctx.drawImage(images.fruit, f.x - cameraX, baseLeavesY + f.offsetY, fruit.width, fruit.height);
      }
    });
  });
}

function drawPlants(ctx, world, cameraX) {
  const { plant } = FLORA;
  const w = plant.sheetWidth * plant.scale;
  const h = plant.sheetHeight * plant.scale;
  world.plants.forEach((p) => {
    const screenX = p.x - cameraX;
    if (!p.collected) {
      ctx.drawImage(images.plant, screenX, p.y, w, h);
    } else {
      // collected: draw a squashed stub
      ctx.drawImage(images.plant, screenX, p.y + h * 0.5, w, h * 0.25);
    }
  });
}

function drawPlayer(ctx, player, cameraX) {
  const { states } = SPRITE;
  let column;
  if (player.animationState === "right") column = states.right + player.frameIndex;
  else if (player.animationState === "left") column = states.left + player.frameIndex;
  else column = states.idle + player.frameIndex;

  ctx.drawImage(
    images.character,
    column * FRAME_WIDTH, 0, FRAME_WIDTH, SPRITE.frameHeight,
    player.x - cameraX, player.y + PLAYER.drawOffsetY,
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
}

export function render(ctx, world, player, cameraX) {
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
  drawBackground(ctx, cameraX);
  drawTerrain(ctx, cameraX);
  drawTrees(ctx, world, cameraX);
  drawPlants(ctx, world, cameraX);
  drawPlayer(ctx, player, cameraX);
  drawUI(ctx, world, player);
}
