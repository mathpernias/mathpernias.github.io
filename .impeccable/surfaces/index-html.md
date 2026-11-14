---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface brief: home page (index.html)

Scope: the single-page site at `/`. Visitor mode: Experience.

Audience and job: a broad network (LinkedIn contacts, friends, colleagues, runners, the occasional recruiter) arriving from a shared link, mostly on a phone, wanting to understand what Mathis does and remember one concrete thing. Action: read, explore the terminal, email him. Proof: the five iA cases with their figures, the Berlin Marathon dashboard, measured sport records.

Constraints: static GitHub Pages site, no build step; bilingual EN/FR switch; interactive terminal and easter eggs keep working; all existing content kept with wording unchanged; existing class names and DOM hooks used by `script.js`, `terminal.js`, `eggs.js`, `burn.js` stay.

Chosen direction: "Graphe de lignage" (data lineage graph), picked by Mathis on the fifth round after asking twice for something more tied to data. Memorable moment: the page is one graph you follow from the sources to the decision.

Unresolved: none.

## Direction contract

THESIS: The whole page is one data lineage graph. Every section is a node, every relation an edge, and the visitor follows the edges from the sources to the decision. It refuses the dark developer portfolio with a split hero and a row of metric tiles.

OWN-WORLD: Deep teal board (#0e3b43). Nodes are flat cream panels (#f4f1ea) with square corners and teal ink, each with a small uppercase type label and a port where its edge attaches. Edges are thick mint lines (#19d3a2) with square elbows. Exactly one orange node (#ff8a3c) marks the active or downstream result. Display in Unbounded, text in Golos Text, mono reserved for code and measurements.

STORY: The visitor understands that data travels through four stages, believes Mathis makes each one reliable because each stage links to a real case, and writes to him.

FIRST VIEWPORT: Three source nodes stacked at the left edge (apps, APIs, files) feed mint edges into one large cream node holding the title and lead; an orange downstream node at the right carries −30 %. Below, the four stage nodes sit on one horizontal edge. Primary action sits inside the title node.

FORM: lineage graph (DAG), position 1 on the round's ordered list, shown as the pick card and chosen by the user. seed:5b9c6fea9965e1ba. Signature interaction: a pulse travels the edge through the four stages and lights each node as it passes; a spine edge down the page fills as the visitor scrolls, and the node in view takes the orange mark.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
