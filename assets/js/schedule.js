/* ==========================================================================
   WE26 concept redesign — Schedule at a Glance
   --------------------------------------------------------------------------
   The live site's "Schedule at a Glance" page is a link to a PDF. A PDF can't
   be filtered, can't be linked to a single session, reflows badly on the phone
   people actually carry around the convention center, and is invisible to
   search. Same information, rendered as data.
   ========================================================================== */

const TRACKS = {
  registration: { label: "Registration", color: "var(--cyan)" },
  keynote:      { label: "Keynote",      color: "var(--magenta)" },
  career:       { label: "Career Fair",  color: "var(--violet)" },
  awards:       { label: "Awards",       color: "var(--status-warn)" },
  swenext:      { label: "SWENext",      color: "var(--lime)" },
  exhibitor:    { label: "Exhibitor",    color: "var(--text-faint)" }
};

const DAYS = [
  { id: "tue", label: "Tue", date: "Nov. 3" },
  { id: "wed", label: "Wed", date: "Nov. 4" },
  { id: "thu", label: "Thu", date: "Nov. 5" },
  { id: "fri", label: "Fri", date: "Nov. 6" },
  { id: "sat", label: "Sat", date: "Nov. 7" }
];

/* start/end are 24h decimal hours, used only for ordering. */
const SESSIONS = [
  { day: "tue", start: 12,   end: 17,   track: "exhibitor",    name: "Exhibit installation",                     where: "Menino Center, exhibit hall" },

  { day: "wed", start: 7,    end: 15,   track: "registration", name: "Off-site attendee registration",           where: "Westin Seaport · Omni Seaport" },
  { day: "wed", start: 8,    end: 17,   track: "exhibitor",    name: "Exhibit installation",                     where: "Menino Center, exhibit hall" },
  { day: "wed", start: 12,   end: 19,   track: "registration", name: "Attendee registration opens",              where: "Menino Center, North Lobby" },

  { day: "thu", start: 6.5,  end: 19,   track: "registration", name: "Attendee registration",                    where: "Menino Center, North Lobby" },
  { day: "thu", start: 6.5,  end: 17,   track: "registration", name: "Off-site attendee registration",           where: "Westin Seaport · Omni Seaport" },
  { day: "thu", start: 8,    end: 10,   track: "exhibitor",    name: "Exhibit installation closes",              where: "Menino Center, exhibit hall" },
  { day: "thu", start: 9,    end: 10,   track: "keynote",      name: "Opening keynote — Elissa Lee, GE Aerospace", where: "Menino Center", link: "#/program/keynotes" },
  { day: "thu", start: 10.5, end: 18,   track: "career",       name: "Interview booths",                         where: "Career fair floor" },
  { day: "thu", start: 14,   end: 18,   track: "career",       name: "Career fair — all registrants",            where: "Career fair floor", link: "#/program/career-fair" },
  { day: "thu", start: 14,   end: 18,   track: "exhibitor",    name: "Exhibit hours",                            where: "Menino Center, exhibit hall" },

  { day: "fri", start: 7,    end: 16,   track: "registration", name: "Attendee registration",                    where: "Menino Center, North Lobby" },
  { day: "fri", start: 9,    end: 10,   track: "keynote",      name: "Keynote — Ali Forsyth, Johnson Controls",  where: "Menino Center", link: "#/program/keynotes" },
  { day: "fri", start: 10.5, end: 11.5, track: "career",       name: "Career fair — professionals only",         where: "Career fair floor", link: "#/program/career-fair" },
  { day: "fri", start: 10.5, end: 15.5, track: "exhibitor",    name: "Exhibit hours",                            where: "Menino Center, exhibit hall" },
  { day: "fri", start: 10.5, end: 15.5, track: "career",       name: "Interview booths",                         where: "Career fair floor" },
  { day: "fri", start: 11.5, end: 15.5, track: "career",       name: "Career fair — all registrants",            where: "Career fair floor", link: "#/program/career-fair" },
  { day: "fri", start: 15.5, end: 22,   track: "exhibitor",    name: "Exhibitor move-out",                       where: "Menino Center, exhibit hall" },
  { day: "fri", start: 16,   end: 17,   track: "swenext",      name: "SWENext Celebration (invitation only)",    where: "Westin Boston Seaport", link: "#/program/swenext" },
  { day: "fri", start: 18,   end: null, track: "awards",       name: "APEX Awards presentation",                 where: "Omni Seaport, Ensemble Ballroom DEGF", link: "#/program/awards" },
  { day: "fri", start: 19,   end: 20.5, track: "awards",       name: "Awards reception (invitation only)",       where: "Omni Seaport, Ensemble Ballroom ABC", link: "#/program/awards" },

  { day: "sat", start: 7.5,  end: 12,   track: "registration", name: "Attendee registration",                    where: "Menino Center, North Lobby" },
  { day: "sat", start: 8,    end: 11,   track: "exhibitor",    name: "Exhibitor move-out",                       where: "Menino Center, exhibit hall" },
  { day: "sat", start: 8.5,  end: 11.5, track: "swenext",      name: "SWENext Expo on-site registration",        where: "Westin Boston Seaport", link: "#/program/swenext" },
  { day: "sat", start: 9,    end: 12,   track: "swenext",      name: "SWENext Innovation Expo",                  where: "Westin Boston Seaport", link: "#/program/swenext" },
  { day: "sat", start: 16,   end: 17,   track: "keynote",      name: "Closing keynote — Evelyn Cortez-Davis, LADWP", where: "Menino Center", link: "#/program/keynotes" }
];

const state = { day: "thu", tracks: new Set(Object.keys(TRACKS)) };

function clock(h) {
  if (h === null) return "";
  const hour24 = Math.floor(h);
  const mins = Math.round((h - hour24) * 60);
  const suffix = hour24 >= 12 ? "p.m." : "a.m.";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(mins).padStart(2, "0")} ${suffix}`;
}

function timeRange(s) {
  return s.end === null ? clock(s.start) : `${clock(s.start)} – ${clock(s.end)}`;
}

function renderChips() {
  const host = document.getElementById("track-filters");
  if (!host) return;
  host.innerHTML = "";
  Object.entries(TRACKS).forEach(([id, t]) => {
    const on = state.tracks.has(id);
    const btn = document.createElement("button");
    btn.className = "chip";
    btn.type = "button";
    btn.dataset.track = id;
    btn.setAttribute("aria-pressed", String(on));
    btn.style.setProperty("--chip", t.color);
    btn.textContent = t.label;
    btn.addEventListener("click", () => {
      if (state.tracks.has(id)) state.tracks.delete(id);
      else state.tracks.add(id);
      if (state.tracks.size === 0) state.tracks = new Set(Object.keys(TRACKS));
      renderChips();
      renderList();
    });
    host.appendChild(btn);
  });
}

function renderDays() {
  const host = document.getElementById("day-tabs");
  if (!host) return;
  host.innerHTML = "";
  DAYS.forEach((d) => {
    const count = SESSIONS.filter((s) => s.day === d.id).length;
    const btn = document.createElement("button");
    btn.className = "daytab";
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(state.day === d.id));
    btn.innerHTML = `<b>${d.label}</b><span>${d.date}</span><em>${count}</em>`;
    btn.addEventListener("click", () => {
      state.day = d.id;
      renderDays();
      renderList();
    });
    host.appendChild(btn);
  });
}

function renderList() {
  const host = document.getElementById("schedule-list");
  if (!host) return;

  const rows = SESSIONS
    .filter((s) => s.day === state.day && state.tracks.has(s.track))
    .sort((a, b) => a.start - b.start || a.name.localeCompare(b.name));

  const day = DAYS.find((d) => d.id === state.day);

  if (rows.length === 0) {
    host.innerHTML = `<p class="schedule__empty">Nothing on ${day.label}, ${day.date} matches the tracks you've selected. Turn a track back on above.</p>`;
    return;
  }

  host.innerHTML = rows
    .map((s) => {
      const t = TRACKS[s.track];
      const title = s.link
        ? `<a href="${s.link}">${s.name}</a>`
        : s.name;
      return `
        <li class="slot" style="--chip:${t.color}">
          <div class="slot__time">${timeRange(s)}</div>
          <div class="slot__body">
            <h3>${title}</h3>
            <p>${s.where}</p>
          </div>
          <div class="slot__track">${t.label}</div>
        </li>`;
    })
    .join("");
}

function initSchedule() {
  if (!document.getElementById("schedule-list")) return;
  renderDays();
  renderChips();
  renderList();
}

document.addEventListener("DOMContentLoaded", initSchedule);
