---
name: Juralio
description: >-
  Juralio is a legal matter & project management workspace for law firms and
  in-house teams. The visual language is calm, warm, and considered — a
  grown-up, paper-like palette of cream and beige neutrals with a muted navy
  accent, typeset in Montserrat. Dense information (task grids, roadmaps,
  matter lists) is made legible through generous whitespace, low-contrast
  dividers, and a strict five-colour status vocabulary.

tokens:
  color:
    # ---- Brand & action ----
    brand:
      primary: '#3F799B' # muted navy-teal; primary buttons, links, focus
      primary-dark: '#00364D' # deep ink navy; help text, headings on pale
      primary-hover: '#326380'
      primary-tint: '#EBF0F2' # pale wash of primary; selected row background
      secondary: '#D96B5B' # terracotta coral; destructive/negative actions
    # ---- Neutral scale (warm, paper-like; all slightly green-grey) ----
    neutral:
      ink-900: '#333232' # default body text, surfaces on dark header
      ink-700: '#504C4B' # secondary text, muted icons, overlay
      ink-400: '#989390' # disabled text, not-required state, subdued labels
      beige-400: '#E1DED8' # divider, chip fill, primary button hover
      beige-200: '#F1F1EE' # notification hover, timeline scale row
      beige-100: '#F8F8F6' # app background (the canvas)
      off-white: '#FAFAFA' # dialog/card surface
      off-white-dim: '#EBEBEB' # selected matter-switcher row
      white: '#FFFFFF' # input fields, popovers, cards
      white-soft: '#F5F5F5'
      pure-black: '#000000' # used only as opacity base for dividers/shadows
    # ---- Task status (core product vocabulary — always used as a set of five) ----
    status:
      not-started:
        dark: '#DBD9B5' # pale olive — label/chip
        light: '#FCFBE8' # soft cream — row fill
      in-progress:
        dark: '#DFA837' # goldenrod — label/chip
        light: '#F4E1BA' # warm wheat — row fill
      done:
        dark: '#63A6A9' # sage teal — label/chip
        light: '#D1E5E6' # pale teal — row fill
      not-required:
        dark: '#989390' # warm grey — label/chip
        light: '#E1DED8' # beige — row fill
      template:
        dark: '#7C6693' # dusted plum — label/chip
        light: '#CEC9ED' # lilac — row fill
    # ---- Roadmap pins (filled dot + darker stroke) ----
    roadmap-pin:
      in-progress: { fill: '#F4E1BA', stroke: '#B2862C' }
      not-started: { fill: '#FCF8E8', stroke: '#C2BE7A' }
      done: { fill: '#63A6A9', stroke: '#457476' }
      error: { fill: '#F58970', stroke: '#C46E5A' }
    # ---- Feedback ----
    feedback:
      error: '#B00020'
      error-alt: '#E31B0C'
      warning: '#CEAB07'
      warning-amber: '#DF9C37'
      info: '#3F799B'
      success: '#0C9609'
      success-chip: '#079455'
      success-tint: '#DCFAE6'
      alert: '#e97b49' # terracotta/orange — soft "attention" accent
    # ---- Accent hues (charts, tips cards, illustrations) ----
    accent:
      navy-deep: '#004D6D'
      coral: '#F58970' # avatars "red"
      japonica: '#d26958'
      pink-clay: '#CA9BA5'
      sage: '#90A480'
      sage-light: '#63a6a9'
      goldenrod: '#F9cb6c' # FTUE "next" cue
      purple: '#5B15DF' # new-task highlight, drop-zone valid
      purple-muted: '#7b6693'
    # ---- Avatars (cycled in order for user initials) ----
    avatar:
      palette:
        - '#9FDBCD' # mint
        - '#A9BFDE' # powder blue
        - '#F58970' # coral
        - '#BFCEA0' # sage
        - '#BC99CC' # lilac
      selected: '#3F799B'
    # ---- Rate/cost cards (chart categories) ----
    rate-card:
      client: '#4E5BA6'
      client-retired: '#3C4580'
      org: '#0E9384'
      org-retired: '#065B51'
      matter: '#3F799B'
      retired-chip: '#696969'
    # ---- Opacity semantics applied over an ink base ----
    alpha-on-ink:
      text-primary: 0.87
      text-secondary: 0.54
      text-disabled: 0.38
      divider: 0.12
      hover: 0.04
      hover-strong: 0.12
      selected: 0.08
      focus: 0.12
      row-tint: 0.05
      filter-in: 0.60
      filter-out: 0.40
      opaque-fill: 0.15
      text-background: 0.70
      surface-soft: 0.92
      shadow-low: 0.19
      shadow-mid: 0.23

  typography:
    font-family:
      sans: "Montserrat, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
      icons: "'Material Icons'"
    font-weight:
      light: 300
      regular: 400
      medium: 500
    font-size:
      caption: '0.75rem' # 12px
      body-sm: '0.8125rem' # 13px — table cells, tooltips
      body: '0.875rem' # 14px — default body1
      body-lg: '1rem' # 16px — body2 / readable paragraphs
      h6: '1.25rem'
      h5: '1.5rem'
      h4: '2.125rem'
      h3: '3rem'
      h2: '3.75rem'
      h1: '6rem'
    line-height:
      caption: '16px'
      overline: '16px'
      body: '20px'
      body-lg: '28px'
      subtitle: '24px'
      h6: '24px'
      h5: '28px'
      h4: '42px'
      h3: '58px'
      h2: '74px'
      h1: '120px'
    letter-spacing:
      overline: '2px'
      default: '0'

  spacing:
    base-unit: '8px' # MUI 8-pt grid; theme.spacing(n) = n * 8
    scale:
      0: '0'
      0.5: '4px'
      1: '8px'
      1.5: '12px'
      2: '16px'
      3: '24px'
      4: '32px'
      5: '40px'
      6: '48px'
      8: '64px'
      10.5: '84px' # global header height
    semantic:
      main-view-padding: '24px'
      main-view-padding-mobile: '16px'
      dialog-padding-x: '54px'
      dialog-title-padding-y: '36px 54px 24px'
      dialog-content-padding-y: '0 54px 24px'
      list-item-padding-y: '11px'
      menu-item-height: '24px'
      time-divider-height: '104px'

  radius:
    none: '0'
    sm: '4px' # inputs, menus, selects (default)
    md: '8px' # FABs, cards, popovers
    pill: '9999px' # chips, avatars, status badges

  elevation:
    # Flat, paper-like product — shadows are subtle and warm-tinted.
    0: 'none'
    1: '0 1px 2px rgba(51, 50, 50, 0.08)'
    2: '0 2px 2px rgba(51, 50, 50, 0.19)' # global header
    3: '0 2px 8px rgba(0, 0, 0, 0.15)' # matter switcher
    4: '0 2px 2px rgba(0, 0, 0, 0.14), 0 1px 5px rgba(0, 0, 0, 0.12)' # workstream chip
    5: '0 4px 5px rgba(0, 0, 0, 0.14), 0 1px 10px rgba(0, 0, 0, 0.12)'
    dragged: '0 10px 20px rgba(51, 50, 50, 0.19), 0 4px 4px rgba(51, 50, 50, 0.23)'
    resting: '0 5px 5px rgba(51, 50, 50, 0.19), 0 4px 4px rgba(51, 50, 50, 0.23)'
    underline: '0 -4px 3px rgba(50, 50, 50, 0.15)' # inverted edge-shadow for floating bottom panels
    focus-ring-strong: '0 0 5px 3px #5B15DF' # unassigned / needs-attention highlight

  breakpoint:
    xs: '0'
    sm: '600px'
    md: '900px'
    ss: '1000px' # "small-screen-plus" — custom tier for dense tables
    lg: '1200px'
    xl: '1536px'

  z-index:
    base: 0
    header: 1000
    drawer: 1100
    modal: 1300
    picker-dialog: 2000
    tooltip: 1500

  motion:
    duration:
      instant: '90ms'
      fast: '150ms'
      base: '200ms'
      slow: '300ms'
    easing:
      standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)'
      accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)'
    keyframes:
      pulse: '0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(0,0,0,.7)} 70%{transform:scale(1);box-shadow:0 0 0 10px rgba(0,0,0,0)} 100%{transform:scale(.95)}'
      wiggle: '50%{transform:rotate(90deg)} 100%{transform:rotate(0deg)}'
      fade-in-out: '0%,100%{opacity:0} 50%{opacity:1}'
      fade-out: '50%{opacity:.5} 100%{opacity:0}'

  border:
    width:
      hairline: '1px'
      emphatic: '2px'
    style:
      default: 'solid'
      divider: '1px solid rgba(0,0,0,0.12)'

  iconography:
    system-font: 'Material Icons'
    default-size: '24px'
    tone: "Single-weight outlined glyphs; inherit currentColor. Custom Juralio illustrative icons ('Jur*') are hand-drawn, line-based, two-tone (navy on cream) and appear in FTUE, empty states, and matter template thumbnails."
---

# Juralio — Design Language

## 1. Personality & intent

Juralio is software for lawyers. It carries serious, sometimes stressful
work — deadlines, deliverables, client matters, billable costs — so the
interface is deliberately the opposite of "busy legal-tech". It looks
like a well-kept notebook: warm paper neutrals, soft shadows, typographic
restraint, and a single muted navy for action. Colour is reserved almost
entirely for _state_ (task status, risk, avatars) so a user scanning a
grid of hundreds of tasks can read progress at a glance without the
screen feeling loud.

Guiding adjectives: **calm, warm, analogue, authoritative, airy.**
Anti-goals: neon, glassy, maximalist, startup-y, dark-mode-first.

## 2. Palette logic

The neutral foundation is a tight warm-grey scale that drifts green:

- The canvas is `#F8F8F6` (beige-100), never pure white.
- Surfaces (cards, dialogs) sit on `#FAFAFA` to `#FFFFFF`.
- Dividers and chip fills step up through `#F1F1EE` → `#E1DED8`.
- Body text is `#333232` (ink-900), not `#000000`. Text opacity is
  used heavily (0.87 / 0.54 / 0.38) to establish hierarchy inside
  the same hue rather than reaching for additional colours.

**Primary action** is a single muted navy-teal (`#3F799B`). It is
used sparingly: selected states, submit buttons, links, the focused
avatar ring. Deeper navy (`#00364D`) appears in help text and some
header illustrations.

**Secondary / destructive** is terracotta (`#D96B5B`), chosen to harmonise
with the beige canvas rather than shout — a soft warning rather than a
red alarm. Hard error (`#B00020` / `#E31B0C`) is held back for genuine
validation failures.

**Status colours** are the one place the product commits to a vivid
identifiable set. Each status has a _dark_ variant (for chips, labels,
pins) and a _light_ variant (for row fills and hover wash):

- Not started — pale olive / cream
- In progress — goldenrod / wheat
- Done — sage teal / pale teal
- Not required — warm grey / beige
- Template — dusted plum / lilac

These five must always appear as a coordinated set; never swap in a
different hue for one of them. "Filtered-in" tints render at 60% alpha,
"filtered-out" at 40%, "opaque fill" at 15% — this is how lists fade
non-matching rows while keeping them readable.

**Accent hues** (coral, japonica, sage, pink-clay, goldenrod) belong to
illustrations, FTUE prompts, and avatar colour cycling — never to
interactive controls. Avatar colours cycle through a fixed five-stop
pastel palette (mint, powder, coral, sage, lilac) assigned by user
initial, with selection/focus using primary navy.

## 3. Typography

One family: **Montserrat**, weights 300 / 400 / 500. No italics, no
display font, no serifs. Headings are set with unusually generous
line-heights (h1 at 120px, h2 at 74px) which gives marketing / empty
states a spacious, editorial feel. Inside the product, body copy is
14px / 20px; table cells drop to 13px; tooltips match at 13px.

- Overline text uses 2px letter-spacing — the only tracked style.
- Never bold below 500. 400 is the workhorse; 500 is used for
  emphasis (button labels, selected tabs, section titles).
- Monospace and italic are avoided — use weight and colour, not
  font shifts, to distinguish roles.

Icons: Material Icons for system UI at 24px, single-weight outline.
Custom **Jur\*** illustrative icons are hand-drawn line art in navy on
cream; they carry personality in empty states and onboarding without
spilling into dense views.

## 4. Surfaces, elevation, and edges

Juralio is a **flat, paper product**. Shadows are low, warm (tinted
with `rgba(51,50,50,…)` rather than pure black), and mostly signal
_draggability_ or _floating above the grid_ — not depth drama.

- Global header: a 2px soft drop-shadow and a 1px border beneath.
- Cards, popovers, matter-switcher: elevation level 3 (`0 2px 8px /15`).
- A dragged task card lifts to the `dragged` shadow; its resting
  hover state uses a slightly compressed version.
- Floating bottom panels (e.g. matter details) use an **inverted**
  top-edge shadow — the illusion is of a sheet of paper sliding up
  from beneath the canvas.

Radii are tight: 4px on inputs and menus, 8px on buttons / FABs and
surfaces, pill (`9999px`) on chips and status badges. Nothing is
fully-rounded-rectangle in the way consumer apps are; the feel is
closer to a legal pad than a phone app.

Borders are almost always `1px solid rgba(0,0,0,0.12)` — a hair of
division rather than a line. Bold borders appear only around
drop-zones, selected matter tabs, and the focus ring.

## 5. Density, spacing, and layout

The grid is 8px. Main view padding is 24px desktop, 16px mobile.
Dialogs use a distinctive **54px horizontal padding** with 36/24px
vertical rhythm — this generous gutter is the single strongest spatial
signature of the product and should be preserved.

List rows and menu items are 11px top/bottom padded (≈ 46px row
height) — roomy enough to touch on tablet without the product feeling
cavernous. Tables drop to 13px type to fit more columns when a matter
has many workstreams.

The custom `ss: 1000px` breakpoint exists because matter tables need a
tier between `md` and `lg` — use it to flip table density, not general
layout.

## 6. Motion

Motion is short and utilitarian. Durations cluster at 150–200ms with
the standard material easing curve. Four named keyframes carry the
product's moments of personality:

- `pulse` — onboarding "next step" cue; expanding ring of shadow.
- `wiggle` — 90° then back; used on the FAB to invite attention.
- `fade-in-out` — ambient loading dots / skeletons.
- `fade-out` — dismissing ephemeral notices.

Avoid parallax, springs, or staggered entrances. Transitions on
colour and opacity are preferred over transforms for state changes
(hover, selected, filtered).

## 7. Component vocabulary

- **Task cell** — the atom of the product. A pill-shaped card coloured
  by its status _light_ variant, with a small dark-variant chip for the
  status label, an avatar stack, a reference number on a 5%-tinted
  background, and an 8px radius. Drag lifts it to the `dragged`
  elevation. Not-required cells additionally show a coral icon.
- **Status chip** — pill, status-dark fill, white or 0.87-ink text.
- **Roadmap pin** — filled circle (status-light) with a 2px
  status-dark stroke; error pins use the coral pair.
- **Global header** — beige-400 bar, 84px tall, soft bottom shadow,
  holds the matter switcher, search, and avatar menu.
- **Dialogs** — off-white surface, 54px side padding, no coloured
  header bar; the title carries weight through typography alone.
- **Buttons** — primary uses navy fill + white text; default/ghost
  buttons are transparent with ink-900 text and hover to beige-400.
  Destructive actions use terracotta, never pure red.
- **Inputs** — white-on-canvas, 4px radius, 54% opacity in resting
  state, using `standard` (underlined) MUI variant by default.
- **Avatars** — circular, pastel backgrounds cycled from the five-stop
  avatar palette, navy ring when selected.
- **Tooltips** — soft dark surface (tinted ink-400 @ 60% alpha), 13px
  Montserrat, short dwell.
- **FAB** — 8px radius (not circular); flat, no shadow; wiggles on
  FTUE cues.

## 8. Background pattern & brand marks

The login and marketing canvas carries a **hand-drawn line pattern**
(rolling hills, trees, small figures) rendered in `#D8D8D3` at 80%
opacity on the beige canvas — the product's most distinctive brand
texture. It's never used behind data-dense views. The Juralio wordmark
is a horizontal black lockup at ~220×64; the standalone mark appears
as a watermark at 70% opacity.

## 9. Dos and don'ts

**Do**

- Start every screen on `#F8F8F6`, not white.
- Use the five-status palette as a coordinated set.
- Convey hierarchy with ink opacity before reaching for new colours.
- Keep shadows low and warm; prefer borders and background shifts.
- Respect the 54px dialog gutter.

**Don't**

- Introduce pure black text or pure black shadows.
- Use the accent hues (coral, japonica, pink-clay, goldenrod) for
  interactive controls.
- Ship a bold/heavy Montserrat weight above 500 or use an italic.
- Fully round buttons or cards into "pill" shapes — pills are for
  chips and badges only.
- Apply gradients, glass/blur surfaces, or neon — they break the
  paper metaphor.
