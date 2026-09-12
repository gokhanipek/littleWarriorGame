// World state: trees (with fruits) and plants, plus the collection logic
// that runs each frame. Generation is randomized within config ranges.

import { WORLD, FLORA, PICKUP } from "./config.js";

function randInt(min, range) {
  return Math.floor(Math.random() * range) + min;
}

// The playable band where flora can spawn (excludes the water margins).
function randSpawnX() {
  const span = WORLD.mapEnd - WORLD.mapStart - WORLD.waterWidth;
  return Math.round(Math.random() * span) + WORLD.mapStart;
}

export function createWorld() {
  const trees = [];
  const plants = [];

  const numberOfTrees = randInt(FLORA.treeMin, FLORA.treeRange);
  for (let i = 0; i < numberOfTrees; i++) {
    const treeX = randSpawnX();
    const fruits = [];
    const fruitCount = randInt(FLORA.fruitMin, FLORA.fruitRange);
    for (let j = 0; j < fruitCount; j++) {
      fruits.push({
        x: treeX + (Math.random() * FLORA.fruit.spreadX - FLORA.fruit.spreadX / 2),
        offsetY: FLORA.fruit.minOffsetY + Math.random() * FLORA.fruit.maxOffsetY,
        collected: false,
        respawnTime: 0,
      });
    }
    trees.push({ x: treeX, y: FLORA.tree.baseY, fruits });
  }

  const numberOfPlants = randInt(FLORA.plantMin, FLORA.plantRange);
  for (let i = 0; i < numberOfPlants; i++) {
    plants.push({
      x: randSpawnX(),
      y: FLORA.plant.baseY,
      collected: false,
      respawnTime: 0,
    });
  }

  return {
    trees,
    plants,
    collectedFruits: 0,
    collectedPlants: 0,
  };
}

// y position of the leaves band for a given tree (fruit offsets are relative
// to this). Kept here so collection and rendering agree on fruit positions.
export function leavesY(tree) {
  return tree.y - FLORA.tree.leavesHeight / 4;
}

// Advance collection/respawn state. `player` is the player object; `now` is
// a Date.now() timestamp.
export function updateCollection(world, player, now) {
  world.trees.forEach((tree) => {
    const baseLeavesY = leavesY(tree);
    tree.fruits.forEach((fruit) => {
      const fruitY = baseLeavesY + fruit.offsetY;
      if (
        !fruit.collected &&
        Math.abs(player.x - fruit.x) < PICKUP.fruitDistX &&
        Math.abs(player.y - fruitY) < PICKUP.fruitDistY
      ) {
        fruit.collected = true;
        fruit.respawnTime = now + FLORA.respawnMs;
        world.collectedFruits++;
      } else if (fruit.collected && now > fruit.respawnTime) {
        fruit.collected = false;
      }
    });
  });

  world.plants.forEach((plant) => {
    if (
      !plant.collected &&
      Math.abs(player.x - plant.x) < PICKUP.plantDistX &&
      player.onGround
    ) {
      plant.collected = true;
      plant.respawnTime = now + FLORA.respawnMs;
      world.collectedPlants++;
    } else if (plant.collected && now > plant.respawnTime) {
      plant.collected = false;
    }
  });
}
