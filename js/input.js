// Input handling. Tracks which "keys" are currently held. Physical keyboard
// events and on-screen touch controls both feed the same `keys` map, so the
// rest of the game (player.js via isDown) needs no knowledge of the source.

const keys = {};

// Set/clear a virtual key. Used by both the keyboard listeners and the
// on-screen touch buttons so behavior is identical.
export function setKey(code, down) {
  keys[code] = down;
}

export function initInput() {
  document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
  });
  document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  initTouchControls();
}

export function isDown(code) {
  return !!keys[code];
}

// ---------------------------------------------------------------------------
// Touch controls
//
// Detect touch capability and, if present, reveal the on-screen D-pad defined
// in index.html and wire each button to setKey(). Pointer events cover touch,
// pen and mouse, and we capture the pointer so a press keeps registering even
// if the finger slides slightly off the button.
// ---------------------------------------------------------------------------
function initTouchControls() {
  const isTouch =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

  if (!isTouch) return;

  document.body.classList.add("touch");

  const buttons = document.querySelectorAll("#touchControls .touch-btn");
  buttons.forEach((btn) => {
    const code = btn.dataset.key;
    if (!code) return;

    const press = (e) => {
      e.preventDefault();
      setKey(code, true);
      btn.classList.add("active");
      if (btn.setPointerCapture && e.pointerId != null) {
        try {
          btn.setPointerCapture(e.pointerId);
        } catch {
          /* capture is best-effort */
        }
      }
    };

    const release = (e) => {
      e.preventDefault();
      setKey(code, false);
      btn.classList.remove("active");
    };

    // Prefer Pointer Events (unifies touch/mouse); fall back to touch events
    // on older mobile browsers that lack pointer support.
    if (window.PointerEvent) {
      btn.addEventListener("pointerdown", press);
      btn.addEventListener("pointerup", release);
      btn.addEventListener("pointercancel", release);
      btn.addEventListener("pointerleave", release);
    } else {
      btn.addEventListener("touchstart", press, { passive: false });
      btn.addEventListener("touchend", release, { passive: false });
      btn.addEventListener("touchcancel", release, { passive: false });
    }

    // Stop the browser's synthetic click / context menu on long press.
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
  });
}
