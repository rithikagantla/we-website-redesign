/* ==========================================================================
   WE26 concept redesign — "Ask WE26"
   --------------------------------------------------------------------------
   A grounded retrieval assistant, not a generative one. Every answer is
   looked up from this site's own structured content and cites the page it
   came from, so a visitor can verify it in one click.

   That is a deliberate choice, not a limitation of the static host. Conference
   answers are the kind where being confidently wrong does real damage — a
   hallucinated cutoff date makes someone miss the accessibility deadline, a
   hallucinated rate makes them budget wrong. Retrieval cannot invent a price
   that was never in the data.

   Date-sensitive answers read the same tier logic the fee tables use
   (activeTier in site.js), so "what does it cost" stays correct as the
   pricing tiers roll over.
   ========================================================================== */

/* -- knowledge base --------------------------------------------------------
   `keys` are matched against the query. Multi-word entries score higher than
   single tokens. `answer` may be a string or a function returning one.
   -------------------------------------------------------------------------- */

const KB = [
  {
    id: "dates",
    title: "When is WE26?",
    keys: ["when", "date", "dates", "what day", "november", "how long", "countdown", "days until"],
    strong: ["when", "date", "november", "countdown"],
    route: "/",
    answer() {
      const diff = new Date("2026-11-05T09:00:00-05:00") - new Date();
      const days = Math.max(0, Math.floor(diff / 86400000));
      return `<strong>Nov. 5–7, 2026</strong> in Boston — that's <span class="mono">${days} days</span> away. The career fair runs Nov. 5–6, and the SWENext Innovation Expo is Saturday morning, Nov. 7.`;
    }
  },
  {
    id: "venue",
    title: "Where is it held?",
    keys: ["where", "venue", "location", "address", "convention center", "menino", "boston", "how do i get there"],
    strong: ["where", "venue", "location", "address", "menino"],
    route: "/travel",
    answer: `<strong>Thomas M. Menino Convention &amp; Exhibition Center</strong><br><span class="mono">415 Summer St, Boston, MA 02210</span><br>Registration is in the North Lobby. The Westin Seaport (425 Summer St) and Omni Seaport (450 Summer St) are on the same block.`
  },
  {
    id: "cost-pro",
    title: "What does it cost for professionals?",
    keys: ["cost", "price", "fee", "rate", "how much", "professional price", "professional rate", "expensive", "pay"],
    strong: ["professional", "professionals"],
    exclude: ["student", "collegiate", "college", "undergrad"],
    route: "/registration/fees",
    answer() {
      const t = typeof activeTier === "function" ? activeTier() : { label: "Standard", id: "standard" };
      const rates = {
        early:    { m: "$625", n: "$875" },
        standard: { m: "$700", n: "$950" },
        late:     { m: "$800", n: "$1,050" }
      }[t.id];
      return `At <strong>${t.label}</strong> pricing (in effect today), full-conference professional registration is <span class="mono">${rates.m}</span> for SWE members and <span class="mono">${rates.n}</span> for nonmembers.<ul><li>STEM reentry, unemployed, or retired members pay less — see the full table.</li><li>Daily rates are available if you can't attend all three days.</li><li>Student? Ask me about collegiate rates — they're roughly half.</li></ul>`;
    }
  },
  {
    id: "cost-collegiate",
    title: "What does it cost for students?",
    keys: ["student", "collegiate", "college", "undergrad", "grad student", "student price", "student rate", "cheap"],
    strong: ["student", "collegiate", "college", "undergrad", "grad"],
    exclude: ["professional"],
    route: "/registration/fees",
    answer() {
      const t = typeof activeTier === "function" ? activeTier() : { label: "Standard", id: "standard" };
      const rates = {
        early:    { m: "$275", n: "$400" },
        standard: { m: "$350", n: "$475" },
        late:     { m: "$450", n: "$475" }
      }[t.id];
      return `At <strong>${t.label}</strong> pricing, collegiate registration is <span class="mono">${rates.m}</span> for SWE members and <span class="mono">${rates.n}</span> for nonmembers. Full-time graduate students register as collegiates.<ul><li>The member/nonmember gap is usually wider than the cost of membership itself.</li><li>Groups of 10+ students get 30% off — ask me about discounts.</li></ul>`;
    }
  },
  {
    id: "deadlines",
    title: "What deadlines should I know?",
    keys: ["deadline", "deadlines", "due", "cutoff", "last day", "when do i need to", "expire"],
    strong: ["deadline", "cutoff"],
    route: "/faqs",
    answer: `Four dates matter:<ul><li><strong>Sept. 15</strong> — accessibility accommodation requests, to guarantee facilitation (CART, scooters).</li><li><strong>Oct. 1</strong> — bulk/group registration orders close entirely.</li><li><strong>Oct. 16</strong> — notify SWE of a visa denial to get refunded.</li><li><strong>Oct. 19</strong> — late/on-site pricing begins.</li></ul>On the official site, the first three appear only inside FAQ answers.`
  },
  {
    id: "career-fair",
    title: "When is the career fair open?",
    keys: ["career fair", "job fair", "recruiting", "recruiters", "floor", "hiring", "employers", "exhibit hours"],
    strong: ["career", "fair", "recruiter", "hiring"],
    route: "/program/career-fair",
    answer: `<strong>Thursday, Nov. 5</strong> <span class="mono">2:00–6:00 p.m.</span> — all registrants.<br><strong>Friday, Nov. 6</strong> <span class="mono">10:30–11:30 a.m.</span> — professionals only, then <span class="mono">11:30 a.m.–3:30 p.m.</span> for everyone.<ul><li>Interview booths open earlier: <span class="mono">10:30 a.m.</span> Thursday.</li><li>More than 300 organizations exhibit.</li></ul>`
  },
  {
    id: "resume",
    title: "How do I get in front of recruiters?",
    keys: ["resume", "résumé", "cv", "career center", "interview", "get hired", "apply", "prepare"],
    route: "/program/career-fair",
    answer: `Upload your résumé to the <strong>SWE Career Center</strong> and flag your account as "attending WE26." Every exhibitor has access to that pool and reaches out directly to set up interviews — it's the highest-leverage thing you can do before arriving.`
  },
  {
    id: "keynotes",
    title: "Who is speaking?",
    keys: ["keynote", "speaker", "speakers", "who is speaking", "talks", "presenter"],
    route: "/program/keynotes",
    answer: `Three keynotes, all at the Menino Center:<ul><li><strong>Thu, 9:00 a.m.</strong> — Elissa Lee, GE Aerospace (turboshaft engine programs)</li><li><strong>Fri, 9:00 a.m.</strong> — Ali Forsyth, Ph.D., Alloy Enterprises / Johnson Controls</li><li><strong>Sat, 4:00 p.m.</strong> — Evelyn Cortez-Davis, LA Dept. of Water &amp; Power</li></ul>`
  },
  {
    id: "schedule",
    title: "What's the schedule?",
    keys: ["schedule", "agenda", "program", "what's on", "timetable", "plan my day", "sessions"],
    route: "/program/schedule",
    answer: `The full schedule is filterable by day and track — registration, keynotes, career fair, awards, SWENext, and exhibitor logistics. Session-level programming (200+ talks) lives in the official EventScribe planner.`
  },
  {
    id: "housing",
    title: "How do I book a hotel?",
    keys: ["hotel", "housing", "stay", "room", "book a room", "accommodation", "where to stay", "passkey"],
    strong: ["hotel", "housing", "accommodation", "passkey"],
    route: "/travel",
    answer: `Book through <strong>Cvent/Passkey</strong>, the official housing partner. The <strong>Omni Boston Seaport</strong> is the headquarters hotel, and shuttles run from designated block hotels.<ul><li>Book inside the block — reserving outside can cost SWE penalties.</li><li>A credit card is required but isn't charged until names are finalized.</li><li>Sold out? Email <span class="mono">housing@swe.org</span> — availability changes often.</li></ul>If someone <em>calls</em> offering to book your WE26 room, it isn\u2019t SWE — they don\u2019t cold-call and don\u2019t sell attendee contact details.`
  },
  {
    id: "accessibility",
    title: "What accessibility support is there?",
    keys: ["accessibility", "accessible", "ada", "disability", "wheelchair", "scooter", "cart", "captioning", "deaf", "mobility"],
    strong: ["accessibility", "accessible", "disability", "wheelchair", "ada"],
    route: "/travel",
    answer: `SWE provides on-site mobility scooters, an accessible facility, and CART real-time captioning on request.<ul><li><strong>Requests must be in by Sept. 15</strong> to be guaranteed.</li></ul>`
  },
  {
    id: "family",
    title: "Can I bring my family?",
    keys: ["child", "children", "kid", "kids", "childcare", "child care", "baby", "nursing", "lactation", "breastfeeding", "parent", "family"],
    route: "/travel",
    answer: `Yes. Lactation rooms provide chairs, bottled water, snacks, outlets, and mini-fridges, and the convention center has a Mamava nursing pod you can unlock from its app — bring your own pump. On-site child care is arranged through KiddieCorp, registered separately.<ul><li>Under-18s can't be on the career fair floor without advance arrangement with SWE HQ.</li><li>The SWENext Innovation Expo on Saturday is free and built for ages 5–18.</li></ul>`
  },
  {
    id: "membership",
    title: "Do I need to be a SWE member?",
    keys: ["member", "membership", "join swe", "member price", "do i need to be a member", "nonmember"],
    route: "/registration/how",
    answer: `No — nonmembers can attend, they just pay more. Two things to know:<ul><li>Membership is <strong>not</strong> included with registration.</li><li>Member pricing requires a current FY27 membership <em>and</em> registering with the email tied to your SWE account. A different email silently charges nonmember rates.</li></ul>`
  },
  {
    id: "discounts",
    title: "How can I pay less?",
    keys: ["discount", "discounts", "promo", "code", "cheaper", "save", "grant", "scholarship", "group rate", "bulk"],
    route: "/registration/discounts",
    answer: `Six routes to a lower price:<ul><li><strong>Students, groups of 10+</strong> — 30% off, orders close Oct. 1.</li><li><strong>Employers, 25+ professionals</strong> — 30% off nonmember rate.</li><li><strong>Faculty</strong> — 1 free registration per 4 students from your school.</li><li><strong>Middle/low-income countries</strong> — flat $100 professional, $25 collegiate, applied automatically.</li><li><strong>Member-sponsored grants</strong> — a pool funded by other members.</li></ul>Only one promo code per attendee, so codes and group rates don't stack.`
  },
  {
    id: "swenext",
    title: "What is the SWENext Innovation Expo?",
    keys: ["swenext", "expo", "high school", "middle school", "k-12", "precollege", "free event", "public"],
    route: "/program/swenext",
    answer: `A <strong>free half-day STEM event</strong> open to students of all genders, parents, and STEM advocates — Saturday, Nov. 7, <span class="mono">9:00 a.m.–12:00 p.m.</span> at the Westin Boston Seaport.<ul><li>Public registration is free and covers the expo only.</li><li>Every WE26 registration type already includes access.</li></ul>`
  },
  {
    id: "awards",
    title: "Tell me about the awards",
    keys: ["award", "awards", "apex", "ascent", "recognition", "ceremony", "reception"],
    route: "/program/awards",
    answer: `The <strong>APEX Awards presentation</strong> is Friday, Nov. 6 at <span class="mono">6:00 p.m.</span> (Omni Seaport, Ensemble Ballroom DEGF) — open to all attendees, no ticket needed. A separate invitation-only reception follows at <span class="mono">7:00 p.m.</span> for recipients.`
  },
  {
    id: "networking",
    title: "How do I meet people?",
    keys: ["network", "networking", "meet people", "affinity", "lounge", "rainbow", "lgbtq", "prayer", "meditation", "community", "belonging"],
    route: "/program/networking",
    answer: `Affinity group lounges are the main route — grouped by identity, career stage, and professional interest, each running sessions and dedicated networking time. There's also a <strong>Rainbow Lounge</strong> for the LGBTQ+ community and allies, and a prayer/meditation room open to all.`
  },
  {
    id: "involved",
    title: "How do I get involved with SWE?",
    keys: ["get involved", "volunteer", "join the team", "help out", "directorate", "working group", "leadership", "contribute", "email swe", "contact"],
    strong: ["volunteer", "involved", "directorate", "contribute"],
    route: "/get-involved",
    answer: `Four routes in: <strong>volunteering at WE26</strong>, joining a <strong>directorate or working group</strong>, <strong>section leadership</strong>, or <strong>SWENext outreach</strong>. The Get Involved page drafts an introduction email for you and names where each request actually goes.<ul><li>Directorate membership goes through each group's lead, not a central inbox.</li><li>If you're attending anyway, ask before you go so you can meet people in person.</li></ul>`
  },
  {
    id: "registration-hours",
    title: "When can I pick up my badge?",
    keys: ["badge", "check in", "check-in", "registration hours", "pick up", "desk", "when does registration open"],
    route: "/registration",
    answer: `Menino Center, North Lobby:<ul><li><strong>Wed, Nov. 4</strong> — <span class="mono">12:00–7:00 p.m.</span></li><li><strong>Thu, Nov. 5</strong> — <span class="mono">6:30 a.m.–7:00 p.m.</span></li><li><strong>Fri, Nov. 6</strong> — <span class="mono">7:00 a.m.–4:00 p.m.</span></li><li><strong>Sat, Nov. 7</strong> — <span class="mono">7:30 a.m.–12:00 p.m.</span></li></ul>Off-site desks at the Westin and Omni run Wednesday and Thursday.`
  },
  {
    id: "visa",
    title: "I need a visa invitation letter",
    keys: ["visa", "invitation letter", "international", "travel document", "embassy", "consulate"],
    route: "/travel",
    answer: `Say you need one during registration and it's generated automatically, then emailed to you once registration is confirmed. <strong>If your visa is denied, notify SWE by Oct. 16 for a refund.</strong> Other visa questions go to consular or immigration services.`
  },
  {
    id: "security",
    title: "What's security like?",
    keys: ["security", "safety", "weapon", "firearm", "bag check", "safe", "emergency"],
    route: "/travel",
    answer: `Firearms and weapons of any kind are banned from the convention center. Entry is through designated entrances only, with security and bag checks and security canines present. SWE staffs a mix of armed and unarmed security professionals.`
  },
  {
    id: "scams",
    title: "Someone called about booking my hotel",
    keys: ["scam", "scams", "fraud", "fake", "phishing", "someone called", "spam", "legit"],
    route: "/registration",
    answer: `That isn't SWE. <strong>Cvent</strong> is the only authorized registration site and <strong>Cvent/Passkey</strong> the only official housing partner. SWE does not sell or share attendee contact information and will never call to book your room.`
  },
  {
    id: "exhibit",
    title: "How does my company exhibit?",
    keys: ["exhibit", "exhibitor", "booth", "sponsor", "partner", "prospectus", "recruit at we26"],
    route: "/exhibitors",
    answer: `Booth packages and sponsorship tiers are in the WE26 prospectus. Booth personnel register separately — full exhibitor registration includes all of WE26, and a floor-only badge is <span class="mono">$150</span>. Install runs Nov. 3–5, move-out Nov. 6–7.`
  }
];

/* -- retrieval -------------------------------------------------------------- */

const STOP = new Set([
  "a","an","the","is","are","was","do","does","did","i","you","my","me","to","for","of","in","on",
  "at","and","or","it","this","that","can","what","how","if","be","with","get",
  "there","any","please","tell","about","much","need","should","would","will","am","we","us"
]);

const SYNONYMS = {
  cost: ["price","fee","rate","expensive","pay","much"],
  hotel: ["housing","stay","room","accommodation","lodging"],
  student: ["collegiate","college","undergrad","undergraduate"],
  deadline: ["due","cutoff","expire","last"],
  accessibility: ["accessible","ada","disability","wheelchair","mobility"],
  volunteer: ["involved","contribute","help","join"],
  career: ["job","hiring","recruit","recruiter","employer","work"],
  schedule: ["agenda","program","timetable","itinerary"],
  child: ["kid","kids","baby","children","family"]
};

function stem(t) {
  // Crude but predictable: "students" -> "student", "rates" -> "rate".
  return t.length >= 4 && t.endsWith("s") && !t.endsWith("ss") ? t.slice(0, -1) : t;
}

function tokenize(text) {
  const out = new Set();
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .forEach((t) => { out.add(t); out.add(stem(t)); });
  return out;
}

function expand(tokens) {
  const out = new Set(tokens);
  tokens.forEach((t) => {
    Object.entries(SYNONYMS).forEach(([root, list]) => {
      if (t === root || list.includes(t)) {
        out.add(root);
        list.forEach((s) => out.add(s));
      }
    });
  });
  return out;
}

/* A query has to clear this to get an answer. Below it, one incidental token
   matched (\"boston\" in \"what's the weather in boston\") and saying so is
   better than confidently answering a question nobody asked. */
const MIN_SCORE = 4;

function score(query, entry) {
  const raw = query.toLowerCase();
  const literal = tokenize(query);          // no synonyms — for decisive terms
  const tokens = expand(literal);
  let s = 0;

  // Decisive terms disambiguate entries that otherwise share vocabulary,
  // e.g. the student and professional rate cards both match "cost".
  (entry.strong || []).forEach((term) => {
    if (literal.has(term)) s += 6;
  });

  // "for students" should actively rule out the professional rate card, not
  // merely score lower than it.
  (entry.exclude || []).forEach((term) => {
    if (literal.has(term)) s -= 12;
  });

  entry.keys.forEach((key) => {
    if (key.includes(" ")) {
      if (raw.includes(key)) s += 5;        // exact phrase is a strong signal
    } else if (tokens.has(stem(key))) {
      s += 2;
    }
  });

  tokenize(entry.title).forEach((t) => {
    if (tokens.has(t)) s += 1.5;
  });

  return s;
}

function search(query) {
  return KB
    .map((entry) => ({ entry, s: score(query, entry) }))
    .filter((r) => r.s >= MIN_SCORE)
    .sort((a, b) => b.s - a.s);
}

/* -- rendering -------------------------------------------------------------- */

const ROUTE_NAMES = {
  "/": "Home",
  "/registration": "Registration",
  "/registration/fees": "Registration Fees",
  "/registration/how": "How to Register",
  "/registration/discounts": "Discounts & Grants",
  "/program/schedule": "Schedule at a Glance",
  "/program/keynotes": "Keynote Speakers",
  "/program/career-fair": "Career Fair",
  "/program/networking": "Networking & Events",
  "/program/awards": "Awards",
  "/program/swenext": "SWENext Expo",
  "/travel": "Travel & Housing",
  "/faqs": "FAQs",
  "/exhibitors": "Exhibitors & Partners",
  "/get-involved": "Get Involved"
};

const SUGGESTIONS = [
  "How much does it cost for students?",
  "What deadlines should I know?",
  "When is the career fair open?",
  "How do I get involved with SWE?",
  "How do I book a hotel?"
];

let log, form, input, panel, launcher, lastFocus;

function bubble(html, who) {
  const wrap = document.createElement("div");
  wrap.className = `ask-msg ask-msg--${who}`;
  const b = document.createElement("div");
  b.className = "ask-bubble";
  b.innerHTML = html;
  wrap.appendChild(b);
  return wrap;
}

function citation(route) {
  const a = document.createElement("a");
  a.className = "ask-cite";
  a.href = "#" + route;
  a.innerHTML = `↳ Source: ${ROUTE_NAMES[route] || "this site"}`;
  return a;
}

function chipRow(labels, onPick) {
  const row = document.createElement("div");
  row.className = "ask-related";
  labels.forEach((label) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "ask-chip";
    b.textContent = label;
    b.addEventListener("click", () => onPick(label));
    row.appendChild(b);
  });
  return row;
}

function say(node) {
  log.appendChild(node);
  log.scrollTop = log.scrollHeight;
}

function answer(query) {
  say(bubble(query.replace(/</g, "&lt;"), "you"));

  const hits = search(query);

  if (hits.length === 0) {
    const miss = bubble(
      `I don't have that in this site's content, and I'd rather say so than guess — ` +
      `a wrong date or price here would cost you something real. Try one of these, ` +
      `or check the <a href="#/faqs">FAQs</a>:`,
      "bot"
    );
    say(miss);
    say(chipRow(SUGGESTIONS.slice(0, 3), ask));
    return;
  }

  const top = hits[0].entry;
  const body = typeof top.answer === "function" ? top.answer() : top.answer;

  const msg = bubble(body, "bot");
  msg.appendChild(citation(top.route));
  say(msg);

  const related = hits.slice(1, 3).map((h) => h.entry.title);
  if (related.length) say(chipRow(related, ask));
}

function ask(query) {
  const q = (query || "").trim();
  if (!q) return;
  input.value = "";
  answer(q);
}

/* -- panel wiring ----------------------------------------------------------- */

function openPanel() {
  lastFocus = document.activeElement;
  panel.hidden = false;
  launcher.hidden = true;
  input.focus();
}

function closePanel() {
  panel.hidden = true;
  launcher.hidden = false;
  if (lastFocus) lastFocus.focus();
}

function greet() {
  say(bubble(
    `Hi — I answer from this site's own content, and every reply links to the page it came from. ` +
    `I look things up rather than generate them, so I won't invent a deadline that doesn't exist. ` +
    `What do you need?`,
    "bot"
  ));
  say(chipRow(SUGGESTIONS, ask));
}

function initAssistant() {
  panel = document.getElementById("ask-panel");
  launcher = document.getElementById("ask-launch");
  log = document.getElementById("ask-log");
  form = document.getElementById("ask-form");
  input = document.getElementById("ask-input");
  if (!panel || !launcher || !log || !form || !input) return;

  launcher.addEventListener("click", openPanel);
  document.getElementById("ask-close").addEventListener("click", closePanel);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    ask(input.value);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });

  // Following a citation should show the page, not leave the panel covering it.
  log.addEventListener("click", (e) => {
    if (e.target.closest("a[href^='#/']")) closePanel();
  });

  greet();
}

document.addEventListener("DOMContentLoaded", initAssistant);
