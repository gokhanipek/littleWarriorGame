// Player state, movement, physics and stamina. All motion is delta-time
// based (seconds) so behavior is identical regardless of frame rate.

import { PLAYER, PHYSICS, STAMINA, WORLD, SPRITE } from "./config.js";
import { isDown } from "./input.js";

export function createPlayer() {
  return {
    x: PLAYER.startX,
    y: PLAYER.startY,
    w: PLAYER.width,
    h: PLAYER.height,
    dy: 0,
    onGround: false,
    direction: "right",
    stamina: STAMINA.max,
    // animation
    animationState: "idle",
    frameIndex: 0,
    frameTimer: 0,
  };
}

// dt is elapsed time in seconds.
export function updatePlayer(player, dt) {
  const running = isDown("ShiftLeft");
  const low = player.stamina <= STAMINA.lowThreshold;

  // Determine horizontal speed (px/sec) and drain stamina while running.
  let speed;
  if (low) {
    speed = PHYSICS.slowSpeed;
  } else if (running) {
    speed = PHYSICS.runSpeed;
  } else {
    speed = PHYSICS.walkSpeed;
  }

  // Regenerate stamina when not running and grounded; drain while running.
  if (running && !low && player.onGround) {
    player.stamina = Math.max(0, player.stamina - STAMINA.runDrainPerSec * dt);
  } else if (!running && player.onGround) {
    player.stamina = Math.min(STAMINA.max, player.stamina + STAMINA.regenPerSec * dt);
  }

  // Horizontal movement
  if (isDown("ArrowRight")) {
    player.x += speed * dt;
    player.direction = "right";
  }
  if (isDown("ArrowLeft")) {
    player.x -= speed * dt;
    player.direction = "left";
  }

  // Jump
  if (isDown("Space") && player.onGround && player.stamina > STAMINA.lowThreshold) {
    player.dy = PHYSICS.jumpVelocity;
    player.onGround = false;
    player.stamina = Math.max(0, player.stamina - STAMINA.jumpDrain);
  }

  // Vertical integration
  player.dy += PHYSICS.gravity * dt;
  player.y += player.dy * dt;

  if (player.y + player.h >= WORLD.ground) {
    player.y = WORLD.ground - player.h;
    player.dy = 0;
    player.onGround = true;
  }

  // Clamp to playable bounds
  if (player.x < WORLD.mapStart) player.x = WORLD.mapStart;
  const maxX = WORLD.mapEnd - WORLD.waterWidth - player.w;
  if (player.x > maxX) player.x = maxX;

  updateAnimation(player, dt);
}

function updateAnimation(player, dt) {
  if (isDown("ArrowRight")) player.animationState = "right";
  else if (isDown("ArrowLeft")) player.animationState = "left";
  else player.animationState = "idle";

  // frameTimer is in ms to match SPRITE.frameInterval.
  player.frameTimer += dt * 1000;
  if (player.frameTimer > SPRITE.frameInterval) {
    player.frameTimer = 0;
    player.frameIndex = (player.frameIndex + 1) % SPRITE.framesPerState;
  }
}
