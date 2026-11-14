# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A broad network audience, confirmed by Mathis: LinkedIn contacts, friends, colleagues, the running and cycling community, plus the occasional recruiter or data peer. Most arrive from a shared link, without a hiring task in hand, and many are not data specialists. They want to understand who Mathis is and what he does, in plain words, and stay for what is interesting.

## Product Purpose

The personal site of Mathis Pernias, data analyst / data engineer at iA Financial Group in Montréal. It explains his work (reliable, secure, tested data pipelines) to people who do not build pipelines, shows real cases with their outcome, and shows the person behind the work (endurance sport). Success: a visitor leaves able to say what Mathis does and remembers one concrete thing, and can reach him by email.

## Positioning

Every claim is backed by a concrete case with a measured or verifiable outcome (30% VM cost reduction, zero plain-text credentials, a public dashboard on 780,000 Berlin Marathon results), each stated first in plain language and then in technical terms. The same habit of measuring runs through the sport section: personal records and GPS traces, not adjectives.

## Operating Context

- Static site served by GitHub Pages at https://mathpernias.github.io/, repository `mathpernias.github.io`.
- Plain HTML, CSS and JavaScript, no build step, no dependencies. Files: `index.html`, `styles.css`, `script.js` (i18n, navigation), `terminal.js`, `eggs.js`, `burn.js`.
- Shared mostly as a link (LinkedIn, messages), so the Open Graph card and the mobile view matter.

## Capabilities and Constraints

Confirmed as required in every future version:

- **Bilingual EN / FR** with the language switch; all existing translations stay.
- **Interactive terminal** (`terminal.js`) and its easter eggs (`eggs.js`, `burn.js`: burn, DROP TABLE, winter, gravity, run) stay functional.
- **All current content stays, wording unchanged**: hero, four metrics, the data journey (collect, protect, verify, deliver), five iA cases A to E with their diagrams, the Berlin Marathon dashboard feature, three other projects, stack, experience and education, sport (four personal records, three photos, Tour EUCOR with its GPS map), contact.
- Must keep working as a static GitHub Pages site with no build step.
- Redesign work happens on the `refonte-impeccable` branch; `main` stays untouched until Mathis merges.

## Brand Commitments

- Name shown as "mathis pernias"; contact email mathis.pernias@gmail.com; links to GitHub, LinkedIn, Strava.
- Voice: first person, plain, factual, a problem / approach / outcome structure for cases.
- Diagrams use fictional entities and are labelled as illustrative; that labelling stays.

## Evidence on Hand

- Case diagrams as inline SVG / HTML in `index.html` (Data Vault model, Key Vault flow, PII masking example, VM right-sizing figures, docs-as-code flow, RAG and GAN diagrams).
- `berlin-dashboard.webm` and `berlin-dashboard.webp` (dashboard tour), `mermaid_demo.mp4` (datacontract-cli contribution).
- Sport photos: `sport-trail-arrivee.webp`, `sport-trail-lac.webp`, `sport-eucor-jura.webp` with thumbnails; EUCOR route SVG drawn from Strava GPS traces.
- `og-image.png`, favicons.
- No testimonials, client logos or portrait photo exist; none may be invented.

## Product Principles

1. Plain words first, technical terms second: a non-specialist must follow every case.
2. Show the outcome, with a number or a working artifact, before the method.
3. The person is part of the work: sport and data share the same measuring habit.
4. Nothing invented: fictional data is labelled, claims are the ones Mathis can back.
5. Playfulness lives in the terminal and the easter eggs, never in the way of reading.
