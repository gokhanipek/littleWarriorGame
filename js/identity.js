// Player identity: a display name plus a random 4-digit tag (e.g. "Alex#1042"),
// persisted in localStorage so a returning player keeps the same tag and the
// name field stays pre-filled between runs.

const STORAGE_KEY = "littleWarrior.identity";

// The DB caps names at 24 chars. The "#1234" suffix is 5 chars, so the base
// name is clamped to 19 to guarantee the tagged name fits.
const MAX_BASE_NAME = 19;

function randomTag() {
  return Math.floor(Math.random() * 10000); // 0..9999
}

// Format a tag as a zero-padded 4-digit string (e.g. 42 -> "0042").
function formatTag(tag) {
  return String(tag).padStart(4, "0");
}

// Build the stored identity from a raw name entered by the player.
// Reuses the existing tag when the base name is unchanged, so replaying keeps
// the same identity; a new name gets a fresh tag.
export function resolveIdentity(rawName) {
  const base = (rawName || "").trim().slice(0, MAX_BASE_NAME);
  if (!base) return null;

  const saved = loadIdentity();
  const tag = saved && saved.base === base ? saved.tag : randomTag();

  const identity = { base, tag, tagged: `${base}#${formatTag(tag)}` };
  saveIdentity(identity);
  return identity;
}

export function loadIdentity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.base === "string" && Number.isInteger(parsed.tag)) {
      return parsed;
    }
  } catch (e) {
    // Corrupt or unavailable storage: fall back to a fresh identity.
  }
  return null;
}

function saveIdentity(identity) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  } catch (e) {
    // Storage may be full or blocked (private mode); the game still works,
    // the tag just won't persist across sessions.
  }
}
