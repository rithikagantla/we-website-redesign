/* ==========================================================================
   WE26 concept redesign — live conference state
   --------------------------------------------------------------------------
   The live site prints its three pricing tiers as a static table and leaves
   the reader to work out which one they are actually in today. The dates are
   known, so the page can just say so — and keep saying so correctly next week.
   ========================================================================== */

/* Conference opens Thu Nov 5, 2026, 9:00 a.m. ET. DST ends Nov 1, so EST = UTC-5. */
const OPENS = new Date("2026-11-05T09:00:00-05:00");

const TIERS = [
  { id: "early",    label: "Early Bird", until: new Date("2026-09-01T04:00:00Z"), note: "on or before Aug. 31" },
  { id: "standard", label: "Standard",   until: new Date("2026-10-19T04:00:00Z"), note: "on or after Sept. 1" },
  { id: "late",     label: "Late / On-Site", until: null,                          note: "on or after Oct. 19" }
];

function activeTier(now = new Date()) {
  return TIERS.find((t) => t.until === null || now < t.until);
}

function pad(n) { return String(n).padStart(2, "0"); }

function renderCountdown() {
  const host = document.getElementById("countdown");
  if (!host) return;

  const diff = OPENS - new Date();
  if (diff <= 0) {
    host.innerHTML = '<div><b>Live</b>WE26 is happening now</div>';
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);

  host.innerHTML =
    `<div><b>${days}</b>Days</div>` +
    `<div><b>${pad(hours)}</b>Hours</div>` +
    `<div><b>${pad(mins)}</b>Minutes</div>`;
}

function renderTierBanners() {
  const tier = activeTier();
  document.querySelectorAll("[data-tier-label]").forEach((el) => {
    el.textContent = tier.label;
  });
  document.querySelectorAll("[data-tier-note]").forEach((el) => {
    el.textContent = tier.note;
  });

  /* Highlight the live column in every fee table and dim the expired ones. */
  document.querySelectorAll("table[data-fees]").forEach((table) => {
    const idx = TIERS.findIndex((t) => t.id === tier.id) + 1; // +1 past the label column
    table.querySelectorAll("tr").forEach((row) => {
      Array.from(row.children).forEach((cell, i) => {
        cell.classList.toggle("is-live-tier", i === idx);
        cell.classList.toggle("is-past-tier", i > 0 && i < idx);
      });
    });
  });
}

function boot() {
  renderCountdown();
  renderTierBanners();
  setInterval(renderCountdown, 30000);
}

document.addEventListener("DOMContentLoaded", boot);
document.addEventListener("we26:route", renderTierBanners);
