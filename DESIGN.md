# Design

The site is one data lineage graph. A deep teal board carries cream nodes joined by mint edges; a single orange mark shows the active node or the downstream result. Chosen by Mathis on 2026-11-13 after asking for a direction tied directly to data.

## Colour

Tokens live in `:root` of `styles.css`. The same token names are redefined inside nodes, so components re-skin themselves.

| Role | Board | Inside a node |
|---|---|---|
| Surface (`--bg`) | `#0e3b43` | `#f4f1ea` |
| Inset surface (`--bg-3`) | `#164a53` | `#e7e2d5` |
| Text (`--text`) | `#f4f1ea` | `#0e3b43` |
| Secondary text (`--text-2`) | `#b5d3d3` | `#35585e` |
| Tertiary text (`--text-3`) | `#8bb5b7` | `#3f5d63` |
| Accent (`--accent`) | `#ff8a3c` | `#a84300` |
| Success (`--ok`) | `#19d3a2` | `#086545` |
| Error (`--bad`) | `#ff9a8f` | `#b3261e` |

Graph constants: `--edge` `#19d3a2` (mint), `--mark` `#ff8a3c` (orange), `--node` `#f4f1ea`, `--ink` `#0e3b43`.

Rules:
- One orange element per screen: the first metric, the trail record, the contact email, the port of the section in view.
- Mint is for edges, ports and links on the board. It is never a fill behind running text.
- No gradients, no glow, no shadows. Depth comes from node on board.

## Type

- Display: Unbounded 700 / 900, tracking -0.02 to -0.035em. Headings, node titles, big figures.
- Text: Golos Text 400 / 500 / 600, 17px base, measure capped near 68ch.
- Mono: Geist Mono, only for code, commands, technical lists, dates and measurements. Minimum 12px.
- Emphasis in headings is a thick mint underline, never italics.

## Shape and graph grammar

- Square corners everywhere. Edge and node-outline weight is `--edge-w` 4px; inner rules are 2px.
- Port: a 20px square, board fill, mint outline, sitting where an edge meets a node.
- Three node kinds: cream (content), outlined mint (figures on the board), orange (the mark).
- Sections hang off one vertical spine edge at the left (desktop). Each section title attaches through a port and a stub. Below 1080px the spine is replaced by a short edge and port above each title.
- Hero: three source nodes feed the title node, which feeds the terminal. Metrics and journey stages hang from a horizontal edge.
- Cases are chained by a short vertical edge.
- Lists that are not entities (stack, experience) are drawn straight on the board with 2px rules.

## Components

- Buttons: square, 2px outline, 46px min height. Solid uses text colour as fill; hover turns orange.
- Chips: 1.5px outline, mono.
- Figures inside nodes: inset surface with a 2px ink outline; diagram boxes follow the same outline.
- Terminal: darker teal with a 4px mint outline, mint prompt, orange cursor.
- Navigation: active link carries a 4px orange underline; hover a mint one.

## Motion

- A pulse travels the journey edge and lights each stage in turn (`script.js`).
- The spine fills and the port of the section in view turns orange, using CSS scroll-driven animation where supported; static otherwise.
- Nodes enter with a top-down clip reveal on an exponential ease-out.
- All of it is disabled under `prefers-reduced-motion`.

## Browser surfaces

Selection is orange on ink, focus ring 3px orange, scrollbar mint on dark teal, caret orange, numerals tabular in figures.

## Preserved from the previous version

DOM structure and class names used by `script.js`, `terminal.js`, `eggs.js` and `burn.js`; the easter-egg styles at the end of `styles.css`; all copy in both languages.
