# Little Warrior Game

A small 2D browser game: an animated warrior explores a side-scrolling world,
collecting fruit from trees and gathering plants, under a rolling day/night sky.

## Controls

| Action        | Key              |
| ------------- | ---------------- |
| Move left     | Left Arrow       |
| Move right    | Right Arrow      |
| Run           | Hold Left Shift  |
| Jump          | Space            |

Running is faster but drains stamina. When stamina runs low the warrior is
forced to a slow walk until it regenerates. Jumping also costs stamina.

Walk up to a tree's fruit or a plant to collect it. Collected items respawn
after a short delay.

## Running the game

The game uses ES modules, so it must be served over HTTP. Opening
`index.html` directly from the filesystem (`file://`) will not work, browsers
block module loading over `file://`.

```
npm install   # one time, fetches the local dev server
npm start     # serves at http://localhost:8123 and opens your browser
```

Any static file server works too, for example:

```
npx http-server -p 8123 -c-1
```

Or, in VS Code, right-click `index.html` and choose "Open with Live Server".

## Project structure

```
index.html        Canvas element + loads js/main.js as a module
js/
  config.js        All tunable values (physics, stamina, sprites, world, colors)
  input.js         Keyboard state
  assets.js        Image loading
  world.js         Tree/plant/fruit generation and collection logic
  player.js        Player state, movement, physics, stamina, animation
  render.js        All canvas drawing (no state mutation)
  main.js          Entry point: game state, main loop, camera
images/            Sprite and object art
```

## Notes for development

- Physics values in `config.js` are expressed in units per second; movement
  and gravity are multiplied by delta time each frame, so gameplay is
  frame-rate independent.
- `config.js` is the first place to look when tuning feel (speeds, jump
  height, stamina costs, spawn counts, day/night length).
