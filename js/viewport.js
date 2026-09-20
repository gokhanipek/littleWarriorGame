// Responsive scaling for the game stage.
//
// The canvas always renders at its native 800x400 (see config.js / index.html),
// which keeps every game coordinate, physics value and sprite crisp and
// unchanged. To make it fit any screen we scale the #stage element with a CSS
// transform so it fills as much of the viewport as possible while preserving
// the aspect ratio. This is purely visual — no game logic is affected.

import { CANVAS } from "./config.js";

export function initViewport() {
  const stage = document.getElementById("stage");
  if (!stage) return;

  const apply = () => {
    // Leave a little breathing room so borders / touch controls aren't flush
    // against the screen edges.
    const margin = 8;
    const availW = window.innerWidth - margin * 2;
    const availH = window.innerHeight - margin * 2;

    const scale = Math.min(availW / CANVAS.width, availH / CANVAS.height);

    // Never scale so small it disappears; allow scaling up on large screens.
    const clamped = Math.max(0.2, scale);
    stage.style.setProperty("--scale", String(clamped));
  };

  apply();
  window.addEventListener("resize", apply);
  window.addEventListener("orientationchange", apply);
  // Some mobile browsers change innerHeight as UI chrome shows/hides.
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", apply);
  }
}
