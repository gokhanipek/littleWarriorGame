// Central configuration for all tunable game values.
// Physics values are expressed in units-per-second so gameplay is
// frame-rate independent (see player.js for how deltaTime is applied).

export const CANVAS = {
  width: 800,
  height: 400,
};

// World / map layout
export const WORLD = {
  ground: 350,        // y of the ground surface
  mapStart: 200,
  mapEnd: 5000,
  waterWidth: 200,
  groundThickness: 50,
  waterThickness: 40,
  waterYOffset: 10,   // water sits slightly below ground top
};

// Physics (per second). Previously these were per-frame values tuned
// for ~60fps: speed 2px/f -> 120px/s, gravity 0.4px/f/f, jump -5px/f.
export const PHYSICS = {
  gravity: 1440,      // 0.4 px/frame^2 * 60^2
  walkSpeed: 120,     // 2 px/frame * 60
  runSpeed: 300,      // 5 px/frame * 60
  slowSpeed: 72,      // 1.2 px/frame * 60
  jumpVelocity: -400, // -5 px/frame * 60 smaller the higher
};

export const PLAYER = {
  startX: 250,
  startY: 300,
  width: 32,
  height: 32,
  drawOffsetY: 5,     // vertical nudge so sprite lines up with feet
};

// Stamina (values per second where noted)
export const STAMINA = {
  max: 300,
  regenPerSec: 6,     // 0.1/frame * 60
  runDrainPerSec: 30, // now actually costs stamina to run
  jumpDrain: 10,      // one-shot cost per jump
  lowThreshold: 20,   // below this the player is forced to slow speed
};

// Sprite sheet layout for littleWarrior.png
export const SPRITE = {
  sheetWidth: 144,
  frameCount: 8,
  frameHeight: 18,
  frameInterval: 200, // ms per animation frame
  framesPerState: 2,
  // starting frame column for each animation state
  states: {
    idle: 0,
    right: 2,
    left: 6,
  },
};

// Timed game mode: a countdown that collecting flora extends. When it hits
// zero the run ends and a score screen is shown.
export const GAME = {
  startSeconds: 10,
  fruitBonusSeconds: 2,  // time gained per fruit collected
  plantBonusSeconds: 1,  // time gained per plant (mushroom) collected
};

// Trees, plants and their fruits
export const FLORA = {
  treeMin: 6,
  treeRange: 6,        // count = treeMin + rand(0..treeRange)
  plantMin: 6,
  plantRange: 8,
  fruitMin: 1,
  fruitRange: 3,
  respawnMs: 30000,
  tree: {
    baseY: 260,
    trunkWidth: 25,
    trunkHeight: 60,
    trunkOffsetY: 40,
    leavesWidth: 58,
    leavesHeight: 76,
  },
  fruit: {
    width: 16,
    height: 16,
    minOffsetY: 10,
    maxOffsetY: 76 - 16 - 10, // keep fruit inside the leaves band
    spreadX: 40,              // horizontal spread around trunk
  },
  plant: {
    baseY: 325,
    scale: 0.4,
    sheetWidth: 79,
    sheetHeight: 83,
  },
};

// Pickup collision thresholds
export const PICKUP = {
  fruitDistX: 20,
  fruitDistY: 40,
  plantDistX: 20,
};

// Day/night cycle
export const CYCLE = {
  durationMs: 60000,
  dayTop: "#87CEEB",
  dayBottom: "#E0F6FF",
  nightTop: "#0B0033",
  nightBottom: "#1A1A40",
};

// Camera follow. The camera centers on the player (offset by half the view),
// so the player stays in the middle of the viewport horizontally and
// vertically. Values are in the range 0..1 as a fraction of the view.
export const CAMERA = {
  zoom: 2,          // scene magnification; >1 brings the camera closer
  centerX: 0.5,     // where the player sits across the view (0.5 = middle)
  centerY: 0.5,     // where the player sits down the view (0.5 = middle)
  smoothing: 0.1,   // lerp factor toward target (higher = snappier)
  parallaxSky: 0.1,
  parallaxMountain: 0.3,
};
