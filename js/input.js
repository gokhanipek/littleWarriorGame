// Keyboard input handling. Tracks which keys are currently held.

const keys = {};

export function initInput() {
  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
  });
  document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
}

export function isDown(code) {
  return !!keys[code];
}
