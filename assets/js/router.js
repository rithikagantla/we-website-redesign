/* ==========================================================================
   WE26 concept redesign — hash router
   --------------------------------------------------------------------------
   The problem this solves: on the live we26.swe.org, "Registration" is a
   dropdown label with no page behind it, so every registration sub-page is a
   dead end — there is no hub to go back to, no breadcrumb, and no reliable
   route home. Here every nav label is a real route with a real parent, so
   the trail is always derivable and every crumb is clickable.
   ========================================================================== */

const ROUTES = {
  "/":                       { title: "WE26 — Radiate Change",       label: "Home",                     parent: null },

  "/registration":           { title: "Registration",                 label: "Registration",             parent: "/" },
  "/registration/fees":      { title: "Registration Fees",            label: "Fees",                     parent: "/registration" },
  "/registration/how":       { title: "How to Register",              label: "How to Register",          parent: "/registration" },
  "/registration/discounts": { title: "Discounts & Grants",           label: "Discounts & Grants",       parent: "/registration" },

  "/program":                { title: "Program",                      label: "Program",                  parent: "/" },
  "/program/schedule":       { title: "Schedule at a Glance",          label: "Schedule at a Glance",     parent: "/program" },
  "/program/keynotes":       { title: "Keynote Speakers",             label: "Keynote Speakers",         parent: "/program" },
  "/program/career-fair":    { title: "Career Fair",                  label: "Career Fair",              parent: "/program" },
  "/program/networking":     { title: "Networking & Special Events",  label: "Networking & Events",      parent: "/program" },
  "/program/awards":         { title: "Awards",                       label: "Awards",                   parent: "/program" },
  "/program/swenext":        { title: "SWENext Innovation Expo",      label: "SWENext Expo",             parent: "/program" },

  "/travel":                 { title: "Travel & Housing",             label: "Travel & Housing",         parent: "/" },
  "/faqs":                   { title: "FAQs",                         label: "FAQs",                     parent: "/" },
  "/exhibitors":             { title: "Exhibitors & Partners",        label: "Exhibitors & Partners",    parent: "/" },
  "/get-involved":           { title: "Get Involved",                 label: "Get Involved",             parent: "/" },
  "/notes":                  { title: "Redesign Notes",               label: "Redesign Notes",           parent: "/" }
};

const SITE_NAME = "WE26 Boston";
const FALLBACK = "/";

/* -- helpers -------------------------------------------------------------- */

function currentPath() {
  const raw = (location.hash || "#/").replace(/^#/, "");
  const path = raw.split("?")[0].replace(/\/+$/, "") || "/";
  return ROUTES[path] ? path : null;
}

function pageEl(path) {
  return document.querySelector(`[data-route="${path}"]`);
}

function trailFor(path) {
  const trail = [];
  let cursor = path;
  let guard = 0;
  while (cursor && guard++ < 10) {
    trail.unshift(cursor);
    cursor = ROUTES[cursor].parent;
  }
  return trail;
}

/* -- render --------------------------------------------------------------- */

function renderCrumbs(path) {
  const list = document.getElementById("crumbs");
  const bar = document.getElementById("crumbbar");
  if (!list || !bar) return;

  const trail = trailFor(path);
  bar.hidden = path === "/";
  list.innerHTML = "";

  trail.forEach((step, i) => {
    const li = document.createElement("li");
    const last = i === trail.length - 1;
    if (last) {
      const span = document.createElement("span");
      span.setAttribute("aria-current", "page");
      span.textContent = ROUTES[step].label;
      li.appendChild(span);
    } else {
      const a = document.createElement("a");
      a.href = "#" + step;
      a.textContent = ROUTES[step].label;
      li.appendChild(a);
    }
    list.appendChild(li);
  });
}

function markActiveNav(path) {
  const trail = trailFor(path);
  document.querySelectorAll(".nav__item").forEach((item) => {
    const owns = item.dataset.section;
    item.classList.toggle("is-active", Boolean(owns) && trail.includes(owns));
  });
  document.querySelectorAll(".nav a[href^='#/'], .rail a[href^='#/']").forEach((a) => {
    const href = a.getAttribute("href").slice(1);
    if (href === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}

function closeAllPanels() {
  document.querySelectorAll('.nav__item[data-open="true"]').forEach((item) => {
    item.dataset.open = "false";
    const btn = item.querySelector(".nav__top");
    if (btn) btn.setAttribute("aria-expanded", "false");
    const panel = item.querySelector(".nav__panel");
    if (panel) panel.hidden = true;
  });
}

function route() {
  const path = currentPath();

  if (path === null) {
    // Unknown hash: send it somewhere real instead of rendering a blank page.
    location.replace("#" + FALLBACK);
    return;
  }

  const target = pageEl(path);
  if (!target) {
    location.replace("#" + FALLBACK);
    return;
  }

  document.querySelectorAll("[data-route]").forEach((el) => {
    el.hidden = el !== target;
  });

  const meta = ROUTES[path];
  document.title = path === "/" ? "WE26 — Radiate Change" : `${meta.title} · ${SITE_NAME}`;

  renderCrumbs(path);
  markActiveNav(path);
  closeAllPanels();

  const heading = target.querySelector("h1");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: "instant" });

  document.dispatchEvent(new CustomEvent("we26:route", { detail: { path } }));
}

/* -- nav interaction ------------------------------------------------------ */

function wireNav() {
  document.querySelectorAll(".nav__item[data-section]").forEach((item) => {
    const btn = item.querySelector(".nav__top");
    const panel = item.querySelector(".nav__panel");
    if (!btn || !panel) return;

    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const open = item.dataset.open === "true";
      closeAllPanels();
      if (!open) {
        item.dataset.open = "true";
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav__item")) closeAllPanels();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAllPanels();
  });

  const burger = document.querySelector(".nav__burger");
  const nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a[href^='#/']")) {
        nav.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }
}

/* -- theme ---------------------------------------------------------------- */

function wireTheme() {
  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;
  let stored = null;
  try { stored = localStorage.getItem("we26-theme"); } catch (_) { /* private mode */ }
  if (stored === "light" || stored === "dark") {
    document.documentElement.setAttribute("data-theme", stored);
  }
  toggle.addEventListener("click", () => {
    const root = document.documentElement;
    const isLight =
      root.getAttribute("data-theme") === "light" ||
      (!root.getAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: light)").matches);
    const next = isLight ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("we26-theme", next); } catch (_) { /* ignore */ }
  });
}

/* -- boot ----------------------------------------------------------------- */

window.addEventListener("hashchange", route);
document.addEventListener("DOMContentLoaded", () => {
  wireNav();
  wireTheme();
  if (!location.hash) location.replace("#/");
  route();
});
