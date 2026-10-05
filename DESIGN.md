---
name: Werkbord
description: A quiet technical interface for local agent work and team coordination.
colors:
  cobalt: "#2447FF"
  cobalt-dark: "#7C93FF"
  amber: "#F2A93B"
  paper: "#F5F5F2"
  surface: "#FFFFFF"
  tray: "#EDEDE8"
  ink: "#0A0A0A"
  muted: "#55554F"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(42px, 6vw, 80px)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "11px"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  sm: "5px"
  md: "8px"
  lg: "12px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    height: "38px"
    padding: "0 16px"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "12px"
---

# Design System: Werkbord

## Overview

Werkbord is a quiet technical surface for work that is happening locally. The visual system is compact, tactile, and information-led. The pixel mark, neutral grounds, and mono labels give the product a clear tool-like voice while cobalt and amber mark action and attention.

The landing pages use generous space around a direct headline, then let the interactive board carry the product detail. Documentation uses the same palette with a denser reading layout. Motion is finite and purposeful: the entry lockup, small accent reveals, and control state changes. Reduced-motion preferences remove those effects.

**Key Characteristics:**

- Neutral paper and charcoal grounds with tonal trays
- Geist for reading, Geist Mono for commands, labels, and metrics
- Cobalt for action and links; amber for attention and ownership
- Raised controls and inset trays with soft, neutral depth
- Pixel geometry as the recurring brand shape

## Colors

The palette is intentionally restrained. Cobalt carries action, amber carries attention, and most of the screen remains neutral so the product state is easy to read.

### Primary

- **Cobalt** (#2447FF): Primary actions, active navigation, links, and focused product state.
- **Dark cobalt** (#7C93FF): The corresponding action color on dark grounds.

### Secondary

- **Amber** (#F2A93B): Attention, ownership, and warm emphasis. The dark theme uses #E0A84A.

### Neutral

- **Paper** (#F5F5F2): Light page ground.
- **Surface** (#FFFFFF): Cards and document code panels.
- **Tray** (#EDEDE8): Inset controls and secondary surfaces.
- **Ink** (#0A0A0A): Primary light-theme text.
- **Muted** (#55554F): Supporting text and labels.

**The Rare Accent Rule.** Cobalt and amber should mark an action or state. Leave surrounding content neutral so the signal stays useful.

## Typography

**Display Font:** Geist (with system-ui fallback)  
**Body Font:** Geist (with system-ui fallback)  
**Label/Mono Font:** Geist Mono (with ui-monospace fallback)

The pairing is plain, compact, and legible. Display type carries the page thesis. Mono type belongs to commands, metrics, timestamps, and compact product labels.

### Hierarchy

- **Display** (600, clamp 42px–80px, line-height 1): Landing headlines.
- **Headline** (600, clamp 30px–52px, line-height 1.04): Section statements.
- **Title** (600, 20px, line-height 1.2): Product and document subheads.
- **Body** (400, 16px, line-height 1.55): Explanatory copy at a readable measure.
- **Label** (500, 11px, mono, 0.14em tracking): Metadata and navigation labels.

**The Direct Type Rule.** Keep headlines short and let scale do the emphasis. Do not add an eyebrow to compensate for a weak heading.

## Layout

Landing pages use a centered container capped at 1180px. The hero pairs a large statement with one concise explanation. Product demos are wide and self-contained. On small screens, the columns become one flow and the product board keeps its horizontal columns inside its own scroll surface.

Docs use a three-column desktop layout: grouped navigation, a 700px reading column, and a small on-page outline. At 760px and below, navigation becomes a disclosure above the article. Footer navigation stays limited to Team, Install, and Docs.

## Elevation & Depth

Depth comes from tonal layering, a 1px border, inset trays, and soft neutral shadows. Controls lift slightly on hover. Product cards use a quiet card shadow; trays use an inset shadow. Colored glow is reserved for a small active-state ring in the live product surface.

## Shapes

Controls use compact 5px corners. Cards and document blocks use 8px corners. Larger featured surfaces use 12px corners. Pills are reserved for small status chips. The pixel mark and grid use crisp square cells.

## Components

### Buttons

- **Shape:** Compact 5px corners with a 38px default height.
- **Primary:** Cobalt fill, white text, raised inset highlight, and a small upward hover movement.
- **Secondary:** Paper-to-tray gradient, 1px border, and neutral button shadow.
- **Focus:** A 2px cobalt outline with a small offset.

### Cards and trays

- **Cards:** White or dark surface, 1px border, 8px corners, and a soft card shadow.
- **Trays:** Tonal secondary surface, inset shadow, and compact internal padding.
- **Code blocks:** Tray background, mono text, a thin divider, and a copy action in the header.

### Navigation

Global navigation uses a compact active tab with a tonal background. Docs navigation groups topics by purpose and uses cobalt only for the active page. Mobile docs navigation is collapsed into a native disclosure.

## Do's and Don'ts

### Do:

- Do use cobalt and amber to explain state or action.
- Do keep product copy concise and concrete.
- Do preserve the pixel geometry and neutral surface rhythm.
- Do remove motion when the user prefers reduced motion.

### Don't:

- Don't add hype, em dashes, or a second explanation where a direct sentence works.
- Don't turn every section into a card grid.
- Don't use animation to hide content or make a status feel urgent.
- Don't replace a real product state with decorative chrome.
