# EvenUp — Design Language

## Philosophy
Linear meets Notion on mobile. Spacious, editorial, confident.
Not a fintech dashboard. Not dense. Everything breathes.
Premium productivity aesthetic applied to expense tracking.

---

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#FFFFFF` | App background |
| `surface` | `#F9F9F9` | Card fill |
| `border` | `#EBEBEB` | Card borders, dividers, inputs |
| `text-primary` | `#111111` | Headings, body, primary content |
| `text-muted` | `#888888` | Labels, captions, section headers |
| `text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `accent-hero` | `#111111` | Hero balance card background |
| `error` | `#C0392B` | Amounts you owe (muted red) |
| `accent-slate` | `#6B7280` | Single muted accent, used sparingly |

**Rules:**
- No gradients
- No colored card backgrounds
- No bright colors
- Positive/owed amounts stay in `text-primary` — keep it monochrome
- Only the hero balance card breaks the white palette

---

## Typography

| Role | Font | Size | Style | Weight |
|------|------|------|-------|--------|
| Page headings | Xanh Mono | 40px+ | Italic | 400 |
| Display amounts | JetBrains Mono | 64px+ | Normal | 700 |
| Body text | Satoshi | 16px | Normal | 400 |
| Semibold UI | Satoshi | 16px | Normal | 600 |
| Section labels | Satoshi | 11px | Uppercase, tracked | 600 |
| Monetary values | JetBrains Mono | 14–28px | Normal | 700 |
| Captions | Satoshi | 12px | Normal | 400 |

**Rules:**
- Xanh Mono italic for page titles only — never body text
- JetBrains Mono Bold for every number, amount, and stat
- Satoshi for everything else
- Section labels: all caps, `#888888`, letter-spacing 0.08em

---

## Spacing

| Token | Value |
|-------|-------|
| Screen horizontal padding | 24px |
| Card internal padding | 24px |
| Section gap | 40px |
| Item gap | 16px |
| Safe area bottom | Respect iOS inset |

**Rules:**
- Cards never feel cramped — content floats inside
- Large whitespace between sections
- Don't fill empty space — let it breathe

---

## Components

### Cards
- Fill: `#F9F9F9`
- Border: `1px solid #EBEBEB`
- Border radius: `16px`
- Padding: `24px`
- No shadows

### Hero Balance Card
- Fill: `#111111`
- Text: `#FFFFFF`
- Border radius: `20px`
- Amount: JetBrains Mono Bold, very large
- The only dark element on screen

### Stat Cards
- Label: Satoshi, 11px, uppercase, `#888888`
- Value: JetBrains Mono Bold, 28px, `#111111`
- Fill: `#F9F9F9`
- Border: `1px solid #EBEBEB`
- Padding: `20px`

### List Rows (Expense / Balance)
- No card boxing
- Bottom divider only: `1px solid #EBEBEB`
- Left: icon + description in Satoshi
- Right: amount in JetBrains Mono Bold
- Padding: `16px 0`

### Inputs
- No border, no background
- Single bottom line: `1px solid #EBEBEB`
- Focus: bottom line goes `#111111`
- Font: Satoshi 16px
- Placeholder: `#888888`

### Primary CTA Button
- Fill: `#111111`
- Text: `#FFFFFF` Satoshi semibold
- Border radius: `9999px` (full pill)
- Height: `56px`
- Width: full

### Secondary Button
- Fill: `#FFFFFF`
- Border: `1px solid #EBEBEB`
- Text: `#111111` Satoshi semibold
- Border radius: `9999px`
- Height: `56px`

### Floating Bottom Nav
- Fill: `rgba(255,255,255,0.85)`
- Backdrop blur: `12px`
- Border: `1px solid #EBEBEB`
- Border radius: `9999px`
- 4 tabs: Dashboard, Groups, Balances, Profile
- Active tab: black pill `#111111`, white icon + label
- Inactive: `#888888` icon + label

### Section Dividers
- Satoshi, 11px, uppercase, `#888888`
- Letter spacing: `0.08em`
- No lines — text only

### Avatars
- DiceBear Notionists style
- Minimal illustrated line-art, unique per user
- Displayed in white circles with `1px #EBEBEB` border
- Stack with `-8px` overlap in group views
- Never use real photos

### Split Toggle
- Three options: Equal / Exact / Percentage
- Pill container: `#F9F9F9` fill, `1px #EBEBEB` border
- Active option: `#111111` fill, white text
- Inactive: transparent, `#888888` text

### Settle Up Bottom Sheet
- White background `#FFFFFF`
- Drag handle: `#EBEBEB`, `40px wide`, `4px tall`, centered
- Border radius top: `24px`
- Two Notionists avatars with `→` between
- Amount: JetBrains Mono Bold, 40px
- Black confirm CTA pill

---

## Screens

### Login / Register
- Full white screen
- Xanh Mono italic heading, 48px, lots of top space
- One input at a time, bottom-line only
- Black pill CTA
- Leave empty space — do not fill it

### Dashboard
- Xanh Mono italic greeting, 40px
- Black hero balance card
- Recent groups: horizontal scroll, group cards
- Activity feed: divider-only list rows, no card boxing
- Floating pill nav

### Groups List
- Xanh Mono italic title "Groups", 40px
- Bottom-line search bar
- Group cards: stacked Notionists avatars, name, balance
- White fill, `1px #EBEBEB` border, 24px padding

### Group Detail
- Notionists member avatar row
- Total spend: JetBrains Mono Bold, 40px
- Two pills side by side: Add Expense (black) + Settle Up (white border)
- Expense list: Satoshi all-caps date dividers, divider-only rows

### Add Expense
- Full white screen
- Amount: JetBrains Mono Bold, 64px, centered
- Description: bottom-line input below
- Group picker, paid by, split toggle
- Black CTA pill at bottom

### Balances
- Xanh Mono italic title "Balances"
- Per-person rows: Notionists avatar, Satoshi name, JetBrains Mono amount
- Divider-only rows
- Settled rows: 40% opacity

### Profile
- Notionists avatar, large, centered
- Name: Xanh Mono italic, 32px
- 2-column stat grid
- Settings rows: white cards, `1px #EBEBEB` border
- Logout: red-tinted pill, muted

---

## Avatars (Implementation)

```tsx
<img
  src={`https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(username)}`}
  style={{ width: 40, height: 40, borderRadius: 9999 }}
/>
```

Seed with username, email, or user ID — keeps avatar consistent per user.

---

## Do Not
- Use off-white backgrounds — always pure `#FFFFFF`
- Add shadows to cards
- Use colored backgrounds on any card except hero
- Use Newsreader or Hanken Grotesk — Xanh Mono + Satoshi only
- Use real photos for avatars
- Make lists feel boxed — use dividers only
- Fill empty space — whitespace is intentional