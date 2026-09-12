// Fetches the top scores and renders them into the leaderboard table.

import { topScores } from "./leaderboard.js";

const statusEl = document.getElementById("status");
const tableEl = document.getElementById("board");
const rowsEl = document.getElementById("rows");

// Escape user-provided names before inserting into the DOM.
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function load() {
  const { data, error } = await topScores(20);

  if (error) {
    statusEl.textContent = "Could not load the leaderboard. Please try again later.";
    console.error("Leaderboard load error:", error.message);
    return;
  }

  if (!data.length) {
    statusEl.textContent = "No scores yet. Be the first!";
    return;
  }

  rowsEl.innerHTML = data
    .map((row, i) => {
      const rank = i + 1;
      const rankClass = rank <= 3 ? `top-${rank}` : "";
      return `
        <tr class="${rankClass}">
          <td class="rank">${rank}</td>
          <td>${escapeHtml(row.name)}</td>
          <td class="score">${row.score}</td>
        </tr>`;
    })
    .join("");

  statusEl.style.display = "none";
  tableEl.style.display = "table";
}

load();
