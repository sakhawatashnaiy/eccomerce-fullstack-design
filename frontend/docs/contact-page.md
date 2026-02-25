# Contact Page — Copy + Implementation Guide

## High-level copy (Concierge Protocol)

### Hero
- **Label:** Direct access
- **Headline:** Initiate a request
- **Subhead:** Your time is valuable. This is a direct line to our engineering and support teams.

### System commitments
- **Routing:** Contextual routing → edge-dispatched to the right department.
- **Submission:** Instant, stateless submission path (no traditional API overhead).
- **Guarantee:** Human-in-the-loop response within **180 minutes**.

### Form prompts (conversation flow)
- Step 1: “Route this request. Pick a topic and we’ll hand it to the right team.”
- Step 2: “Name + email. No fluff. Just a reliable return channel.”
- Step 3: “Describe the issue or intent. We optimize for clarity over volume.”

### Visual markers to surface the stack
- `[Glassmorphism 2.0: backdrop-blur]`
- `[@theme variables]`
- `[transition-behavior: allow-discrete]`
- `[Dynamic hover states • OKLCH color-accurate error states]`
- `[Loading indicators]`

---

## Implementation guide

### 1) Action-based submission (instant + stateless)
**Goal:** submit without a bespoke REST endpoint + client-side fetch plumbing.

**Recommended shape (conceptual):**
- Put your server action in the server environment (framework/runtime dependent).
- Use React’s action helpers so the form submit is treated like UI state, not an imperative API call.

**Client component state:**
- Track `pending`, `error`, and `success` states.
- Disable primary CTA during submit and render an explicit pending label.

**UI contract:**
- Pending → disable primary CTA, show “Submitting…”
- Error → show an OKLCH-accurate error surface (see below)
- Success → show “Request initiated. Human-in-the-loop response within 180 minutes.”

**Notes for this repo:**
- This project currently implements a UI-only demo flow.
- The UI is structured so you can swap the submit handler to a real backend action with minimal surface change.

### 2) Contextual routing via edge functions
**Goal:** avoid “inbox into a void.”

**Routing inputs:**
- Topic
- Optional order number
- Optional auth context (if logged in)
- Page/path context (where the request was initiated)

**Routing outputs:**
- Department queue (orders/shipping/returns/partnership)
- Priority (SLA-driven)
- Acknowledgement payload

**Implementation options:**
- Edge function decides route → forwards to queue/DB + triggers notification.
- Server Action calls edge router internally (keeps client stateless).

### 3) Glassmorphism 2.0 (backdrop blur)
**What to use in components:**
- A translucent surface + backdrop blur.
- Crisp 1px boundaries instead of heavy shadows.
- Prefer transitions on color/opacity/transform only.

**Dynamic hover states (marker):**
- Use subtle background shifts and color transitions.

### 4) OKLCH color-accurate error states
Use OKLCH-aware colors so error styling stays accurate across themes.

**Practical pattern:**
- Input error ring: `ring-rose-200 focus:ring-rose-300`
- Error text: `text-rose-600`
- Success banner: `bg-emerald-50 text-emerald-700 ring-emerald-200`

### 5) Discrete entry animations (`transition-behavior: allow-discrete`)
This is a CSS-level capability (not a Tailwind utility by default).

**Pattern:**
- Use it for UI that appears/disappears (step transitions, banners) to avoid half-state glitches.
- Pair with reduced-motion handling:
  - If reduced motion is enabled, skip typewriter and motion transitions.

### 6) Conversational, multi-step UX
**Why:** a single dense form reads like a database.

**Implementation pattern:**
- Keep a `step` state (0..2)
- Gate progression with step-scoped validation
- Preserve form values across steps
- Provide clear “Back” and “Next” controls

---

## File references
- UI implementation: `src/pages/contact.jsx`
