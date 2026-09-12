// Image asset loading. Each Image begins loading immediately; the canvas
// draw calls safely no-op until an image has finished decoding.

function load(src) {
  const img = new Image();
  img.src = src;
  return img;
}

export const images = {
  character: load("./images/littleWarrior.png"),
  treeTrunk: load("./images/tree-trunk.png"),
  treeLeaves: load("./images/tree-leaves.png"),
  fruit: load("./images/fruit.png"),
  plant: load("./images/plant.png"),
};
