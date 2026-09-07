/* ==========================================================================
   WE26 concept redesign — FAQ filter
   --------------------------------------------------------------------------
   The live FAQ page is a long alphabetical accordion with no search. Several
   of its answers are the only place a fact appears anywhere on the site —
   the bulk registration deadline, the CART request cutoff, the visa refund
   date — so being unable to search it is a real cost, not a nicety.
   ========================================================================== */

function initFaq() {
  const input = document.getElementById("faq-search");
  const list = document.getElementById("faq-list");
  const count = document.getElementById("faq-count");
  if (!input || !list || !count) return;

  const items = Array.from(list.querySelectorAll("details"));

  function apply() {
    const q = input.value.trim().toLowerCase();
    let shown = 0;

    items.forEach((item) => {
      const hit = q === "" || item.textContent.toLowerCase().includes(q);
      item.hidden = !hit;
      if (hit) shown += 1;
      // Opening every match on a broad query is noise; open only a narrow one.
      if (q.length >= 3 && hit && shown <= 3) item.open = true;
      if (q === "") item.open = false;
    });

    count.textContent =
      q === ""
        ? `${items.length} questions`
        : shown === 0
          ? "No matches — try a different word"
          : `${shown} of ${items.length} questions`;
  }

  input.addEventListener("input", apply);
  apply();
}

document.addEventListener("DOMContentLoaded", initFaq);
