/* ==========================================================================
   WE26 concept redesign — "Get Involved" email composer
   --------------------------------------------------------------------------
   Getting involved with SWE currently means finding the right "Email SWE"
   link among several, then writing a cold introduction from scratch. This
   composes the message for you from a few fields, shows it before it is sent,
   and hands it to your own mail client — nothing is transmitted from here.

   The recipient field is deliberately empty. This is an unofficial concept
   site and inventing a plausible-looking SWE address would be worse than
   asking you to paste the real one from the official contact page.
   ========================================================================== */

const INTERESTS = {
  volunteer:  "Volunteering at WE26",
  directorate:"Joining a SWE directorate or working group",
  section:    "Section or collegiate leadership",
  outreach:   "SWENext and K-12 outreach",
  speaking:   "Speaking or presenting at a future conference"
};

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

function checkedInterests() {
  return Array.from(document.querySelectorAll("[data-interest]:checked"))
    .map((el) => INTERESTS[el.dataset.interest])
    .filter(Boolean);
}

function buildSubject() {
  const picks = checkedInterests();
  if (picks.length === 0) return "Getting involved with SWE";
  if (picks.length === 1) return `Getting involved with SWE — ${picks[0].toLowerCase()}`;
  return "Getting involved with SWE — a few areas of interest";
}

function buildBody() {
  const name = val("f-name") || "[your name]";
  const affiliation = val("f-affiliation");
  const role = val("f-role");
  const attending = val("f-attending");
  const picks = checkedInterests();
  const why = val("f-why");

  const lines = [];
  lines.push("Hello,");
  lines.push("");

  const intro = affiliation
    ? `My name is ${name}, and I'm a ${role.toLowerCase()} at ${affiliation}.`
    : `My name is ${name}, and I'm a ${role.toLowerCase()}.`;
  lines.push(`${intro} I'm writing because I'd like to get more involved with SWE and wasn't sure who to ask.`);
  lines.push("");

  if (picks.length > 0) {
    lines.push("The areas I'm most interested in:");
    picks.forEach((p) => lines.push(`  - ${p}`));
    lines.push("");
  }

  if (attending === "yes") {
    lines.push(
      "I'm planning to attend WE26 in Boston this November, and I'd welcome the chance to " +
      "learn more about the team's goals for the year and where new volunteers are most useful. " +
      "If anyone on the team has time to meet while we're all in the same building, I'd be glad to."
    );
    lines.push("");
  } else if (attending === "hoping") {
    lines.push(
      "I'm hoping to attend WE26 in Boston this November. I'd also welcome the chance to hear " +
      "more about the team's goals for the year and where new volunteers are most useful."
    );
    lines.push("");
  } else if (attending === "no") {
    lines.push(
      "I'm not able to make WE26 this year, but I'd still welcome the chance to hear about the " +
      "team's goals and where new volunteers are most useful."
    );
    lines.push("");
  }

  if (why) {
    lines.push(why);
    lines.push("");
  }

  lines.push("Happy to start anywhere that's genuinely helpful, including small tasks.");
  lines.push("Thank you for your time.");
  lines.push("");
  lines.push(name);
  if (affiliation) lines.push(affiliation);

  return lines.join("\n");
}

function render() {
  const out = document.getElementById("email-preview");
  if (!out) return;

  const to = val("f-to");
  const subject = buildSubject();
  const body = buildBody();

  out.textContent =
    `To:      ${to || "(paste the SWE contact address here)"}\n` +
    `Subject: ${subject}\n` +
    `${"—".repeat(46)}\n` +
    body;

  const open = document.getElementById("open-mail");
  if (open) {
    const href =
      `mailto:${encodeURIComponent(to)}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    open.href = href;
    open.setAttribute("aria-disabled", to ? "false" : "true");
  }
}

function initInvolve() {
  const form = document.getElementById("involve-form");
  if (!form) return;

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  form.addEventListener("submit", (e) => e.preventDefault());

  const copy = document.getElementById("copy-email");
  if (copy) {
    copy.addEventListener("click", async () => {
      const text = document.getElementById("email-preview").textContent;
      try {
        await navigator.clipboard.writeText(text);
        copy.textContent = "Copied";
      } catch (_) {
        copy.textContent = "Select the text to copy";
      }
      setTimeout(() => { copy.textContent = "Copy draft"; }, 2200);
    });
  }

  render();
}

document.addEventListener("DOMContentLoaded", initInvolve);
