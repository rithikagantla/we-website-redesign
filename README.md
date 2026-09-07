# WE26 — Concept Redesign

A student-built concept redesign of [we26.swe.org](https://we26.swe.org/), the site for the
Society of Women Engineers annual conference (Boston, Nov. 5–7, 2026).

> **Unofficial.** Not affiliated with or endorsed by the Society of Women Engineers. Content is
> sourced from the public WE26 site to demonstrate an alternative information architecture. The
> site takes no registrations and processes no payments.

## Why this exists

The live WE26 site holds a lot of genuinely useful information, but some of it is hard to reach.
The clearest example — and the thing that started this project — is that **"Registration" is a
dropdown label with no page behind it**. Open any registration sub-page and there is no hub to
return to, no breadcrumb, and no reliable way back to the landing page. Several other
high-traffic answers (the schedule, the fee tables) are locked inside PDFs or third-party portals.

Full audit and rationale: see the **Redesign Notes** page in the site itself (`#/notes`).

## What's here

A dependency-free static site. No build step, no framework, no package manager.

```
index.html              17 pages, as hash-addressed sections
assets/css/tokens.css   design tokens (colour, type scale, spacing)
assets/css/base.css     chrome, layout primitives, responsive rules
assets/css/home.css     landing page and hero
assets/css/pages.css    interior components: rails, tables, schedule, forms
assets/js/router.js     hash router, breadcrumbs, nav state, theme toggle
assets/js/site.js       countdown and live pricing-tier logic
assets/js/schedule.js   schedule data and filtering
assets/js/faq.js        FAQ search
assets/js/involve.js    Get Involved email composer
```

### Design notes

The palette is derived from the real WE26 custom properties, which the live site publishes as
`oklch()` values: primary hue 280 (indigo/violet), accent hue 224 (cyan), tertiary hue 354
(magenta), secondary hue 120 (lime). Type pairs Archivo (variable width, for the wide WE26
wordmark) with Source Sans 3 for body copy and IBM Plex Mono for times, rates, and room numbers.

Light and dark themes are both designed, driven entirely by tokens, with a manual toggle that
overrides the OS preference in either direction.

### The routing fix

Every navigation label in this version is a real route with a declared parent, so the breadcrumb
trail is derived rather than hand-authored, and every crumb is clickable. Unknown hashes redirect
to the landing page instead of rendering blank. See the route table at the top of
`assets/js/router.js`.

## Running it

Any static server works. From the repo root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Pages

| Route | What it covers |
| --- | --- |
| `#/` | Landing page, live countdown, current pricing tier |
| `#/registration` | Hub: status, sub-pages, pre-registration gotchas, on-site hours |
| `#/registration/fees` | All rates, with today's tier highlighted |
| `#/registration/how` | Attendee types and member-pricing eligibility |
| `#/registration/discounts` | All six routes to a lower price, with deadlines |
| `#/program` | Hub for the three days |
| `#/program/schedule` | Filterable schedule by day and track |
| `#/program/keynotes` | The three keynote speakers |
| `#/program/career-fair` | Floor hours, interview booths, résumé prep |
| `#/program/networking` | Affinity group lounges, Rainbow Lounge, quiet space |
| `#/program/awards` | APEX presentation and awards reception |
| `#/program/swenext` | The free public STEM expo |
| `#/travel` | Housing, accessibility, families, security, visas |
| `#/faqs` | Searchable FAQ |
| `#/exhibitors` | Exhibiting, booth logistics, partners |
| `#/get-involved` | Routes into SWE, plus an email composer |
| `#/notes` | The audit: 11 findings and the long-term case |

## Status

Complete. Built incrementally — see the commit history, one commit per section.
