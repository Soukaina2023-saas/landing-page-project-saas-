# Diagnostic Report: Desktop vs Mobile Preview State Synchronization

**Scope:** State sync between desktop and mobile live preview when editing text/colors.  
**Constraint:** Analysis only — no code changes, no redesign.

---

## PART 1 – DOM STRUCTURE ANALYSIS

### 1. Does mobile use the exact same preview container as desktop?

**No.** There are two distinct containers:

- **Desktop:** `#desktopContent` (inside `.imac-content`, within `#desktopMockup`).
- **Mobile:** `#mobileContent` (inside `.iphone-content`, within `#iphoneMockup`).

Both live under the same parent `#previewWrapper` (inside `#previewSection`), but they are **sibling** divs, not the same element. Only one is visible at a time (desktop or mobile mockup), controlled by `AppState.currentView` and the `.hidden` class on the mockups.

### 2. Is the mobile preview a cloned node?

**No.** There is no use of `cloneNode()` in the codebase. The mobile preview is not a clone of the desktop one.

- Each container (`#desktopContent`, `#mobileContent`) gets its **own** content by assigning `innerHTML` (or `root.innerHTML` on the shadow root) from the same source at generation/refresh time.
- `scopePreviewHtmlForShadow(html, false)` is used for desktop and `scopePreviewHtmlForShadow(html, true)` for mobile (same HTML, different wrapping/scaling).

### 3. Are there two preview roots in the DOM at the same time?

**Yes.** Both preview roots exist in the DOM at the same time:

- `#desktopContent` and `#mobileContent` are both present.
- Each has (or gets) its own **shadow root** via `getPreviewRoot(container)` (`container.shadowRoot` or `attachShadow`).
- Both roots are populated on every generation and on every `refreshBothPreviewsFromGeneratedHtml()`.
- Only one mockup is visible (desktop or mobile) based on `AppState.currentView`; the other is hidden with CSS but still in the DOM and still holds its own copy of the preview HTML.

---

## PART 2 – EVENT LISTENER ANALYSIS

### 4. Where are edit listeners attached?

- **`blur`** on each contenteditable element → `onEditableBlur` (calls `pushUndoState()` then `syncPreviewToGeneratedHtml()`).
- **`input`** on each contenteditable element → `onEditableInput` (debounced 400 ms, then `syncPreviewToGeneratedHtml()`).
- **`focusin`** on the scope (wrapper) → `onPreviewEditableFocusIn` (shows floating toolbar).
- **`focusout`** on the scope → `onPreviewEditableFocusOut` (hides floating toolbar).

There are no `change` listeners on the preview content. Contenteditable is driven by `blur` and `input` only.

### 5. Are listeners attached once on DOMContentLoaded or dynamically after generation?

**Dynamically after (re)generation.** They are attached inside `applyInlineEditingToPreview()`, which is called:

- After initial generation (in `handleGenerate()`),
- After `refreshBothPreviewsFromGeneratedHtml()` (which overwrites both roots and then calls `applyInlineEditingToPreview()`),
- After `refreshOtherPreviewFromGeneratedHtml()` (same),
- And from other refresh paths.

So listeners are **reattached** every time the preview HTML is replaced and inline editing is re-enabled.

### 6. Do mobile elements receive the same listeners as desktop elements?

**Yes.** `applyInlineEditingToPreview()` iterates over `[desktop, mobile].filter(Boolean)` and, for each container, finds the same `editableSelector` nodes and attaches the **same** `onEditableBlur` and `onEditableInput` to every editable in **both** desktop and mobile roots. There is no branch that skips mobile or attaches different handlers.

### 7. If elements are dynamically rendered, are listeners reattached?

**Yes.** Whenever the preview roots are repopulated (generation, refresh, undo/redo, section reorder, etc.), `applyInlineEditingToPreview()` is called again and listeners are reattached to the new set of elements in both containers.

---

## PART 3 – STATE MANAGEMENT

### 8. Where is the source of truth stored?

- **Single source of truth:** `AppState.generatedHTML` (global JS object in `main.js`).
- No localStorage or other persistence is used for the current page HTML.
- The DOM inside each preview root is a **derived** view: it is written from `AppState.generatedHTML` (via `scopePreviewHtmlForShadow()`). The only way the central state is updated from the user’s edits is by reading **one** preview container back into `AppState.generatedHTML` inside `syncPreviewToGeneratedHtml()`.

### 9. When editing text on mobile: is the central state updated, or only DOM text?

**Only the DOM in the mobile container is updated** until a sync runs. The central state is updated **only if** `syncPreviewToGeneratedHtml()` runs **and** it reads from the **mobile** container.

- `syncPreviewToGeneratedHtml()` chooses the container like this:  
  `var container = AppState.currentView === 'mobile' ? mobileEl : desktopEl;`
- It then reads `innerHTML` from that container’s root and sets  
  `AppState.generatedHTML = full.slice(0, start) + inner + full.slice(end);`
- So when the user is in mobile view (`AppState.currentView === 'mobile'`), the **only** way mobile edits get into `AppState.generatedHTML` is for this function to run and read from `mobileEl`. It is **not** updated by any other path when the user edits in the mobile preview.

### 10. When regenerating: does generation read from (a) central state, (b) original generation data, or (c) desktop-only container?

**Generation reads from original form/data, not from the current preview or from central state for content.**

- **Regenerate:** `regenerate()` calls `handleGenerate()`. `handleGenerate()` builds `inputs` from the **form fields** (e.g. `inputName`, `inputCategory`, `inputProblem`, …) and calls `LandingPageGenerator.generate(inputs, {})`. So regeneration **replaces** `AppState.generatedHTML` with **new** HTML from the form. It does **not** read from `AppState.generatedHTML` or from either preview container for body content.
- So after “Regenerate,” any inline edits (on desktop or mobile) are lost, because the new HTML is purely form-driven.
- Other flows that **do** read from central state: `refreshBothPreviewsFromGeneratedHtml()` and `refreshOtherPreviewFromGeneratedHtml()` both write **from** `AppState.generatedHTML` **to** the preview roots. So if the user never synced (e.g. on mobile), `AppState.generatedHTML` is stale and any later refresh from it will overwrite the user’s visible edits.

---

## PART 4 – MOBILE-SPECIFIC LOGIC

### 11. Is there any conditional logic like `if (isMobile) { ... }` affecting preview sync?

- **`syncPreviewToGeneratedHtml()`:** The only “mobile” logic is the choice of which container to read from: `AppState.currentView === 'mobile' ? mobileEl : desktopEl`. There is no `if (isMobile)` that disables or skips saving.
- **`applyInlineEditingToPreview()`:** No `isMobile` or `mobile-mode` check; same listeners are attached to both desktop and mobile.
- **`updateMobileMode()` / `body.mobile-mode`:** Used for UI (drawer, layout, breakpoint). No code path uses `mobile-mode` to prevent attaching edit listeners or to prevent calling `syncPreviewToGeneratedHtml()`.

So there is **no** explicit condition that prevents “save” on mobile in code; the issue is **when** (and whether) sync runs, not an `if (isMobile)` that blocks it.

### 12. Is there any condition preventing save() on mobile?

**No.** There is no function named `save()` in this flow. Persistence of edits is done only by `syncPreviewToGeneratedHtml()`, which is invoked from:

- `onEditableBlur`
- debounced `onEditableInput` (400 ms)
- `applyFormatAndSync` (toolbar bold/align/color)

None of these are gated by `isMobile` or `mobile-mode`. So nothing explicitly prevents “save” on mobile.

### 13. Does body.mobile-mode affect event binding?

**No.** Event binding for contenteditable is done in `applyInlineEditingToPreview()` with no reference to `body.mobile-mode` or viewport. `mobile-mode` only affects layout and which UI is shown (e.g. drawer, bottom bar), not which elements get `blur`/`input` or whether sync runs.

---

## PART 5 – ROOT CAUSE

### Why desktop appears to work but mobile does not

- **Desktop (pointer device):** When the user clicks into a contenteditable and then clicks outside, the browser reliably fires **`blur`** on the edited element. That calls `onEditableBlur` → `syncPreviewToGeneratedHtml()`. With `AppState.currentView === 'desktop'`, the function reads from `desktopEl`, updates `AppState.generatedHTML`, and then `refreshOtherPreviewFromGeneratedHtml(desktopEl)` updates the mobile root from that state. So edits are written to the single source of truth and both views stay in sync.
- **Mobile (touch device):** On many mobile browsers, when the user taps into a contenteditable and then taps away (e.g. to scroll or tap elsewhere), **`blur` may not fire in a timely way** (or at all in some cases). The **`input`** handler only runs on typing and is debounced by 400 ms; it does not run when the user simply leaves the field. So:
  - The user’s changes exist only in the **mobile preview DOM**.
  - `syncPreviewToGeneratedHtml()` is **never** (or rarely) run for that edit.
  - `AppState.generatedHTML` is **never** updated with the mobile-edited content.
  - Any later action that re-renders from state (e.g. switching view, undo/redo, section reorder, or any call to `refreshBothPreviewsFromGeneratedHtml()` or `refreshOtherPreviewFromGeneratedHtml()`) overwrites the mobile root from the **stale** `AppState.generatedHTML`, so the user sees the **original** content again and their edits appear lost.

So the **exact root cause** is: **on mobile/touch, the sync from the mobile preview into `AppState.generatedHTML` does not run reliably, because it is driven only by `blur` and debounced `input`, and `blur` is unreliable on touch.**

### Minimal architectural fix (no desktop regression)

- **Keep** the current architecture: one source of truth (`AppState.generatedHTML`), one sync function (`syncPreviewToGeneratedHtml()`), and the same listeners on both containers.
- **Add** a **mobile-only** trigger that does not depend on `blur`: when the user finishes editing in the **mobile** preview, force a sync from the **mobile** container into `AppState.generatedHTML`. Concretely:
  - For elements that are **inside** the mobile preview root only, attach a **`touchend`** listener (in addition to `blur` and `input`). In that handler, after a short delay (e.g. `requestAnimationFrame` or small `setTimeout`) so the contenteditable has committed, call the same logic as `onEditableBlur`: `pushUndoState()` and `syncPreviewToGeneratedHtml()`. Ensure at that moment the sync reads from the mobile container (which it will if `AppState.currentView === 'mobile'`).
  - Optionally, for editables in the mobile container only, use a **shorter debounce** for `input` (e.g. 200 ms) so that typing is synced sooner even if `touchend`/`blur` never fire.
- **Do not** change desktop behavior: do not add `touchend` for the desktop container, and do not change the 400 ms debounce for desktop. No changes to how `syncPreviewToGeneratedHtml()` chooses the container or to `refreshOtherPreviewFromGeneratedHtml()`.

This keeps a single source of truth and a single sync path, and only adds a **reliable trigger** for that sync when the user edits in the mobile preview on touch devices, with zero desktop regression.

---

## Summary Table

| Topic | Finding |
|-------|--------|
| Same container for desktop/mobile? | No; two containers: `#desktopContent`, `#mobileContent`. |
| Mobile preview cloned? | No; no `cloneNode()`; each root gets its own innerHTML. |
| Two roots in DOM at once? | Yes; both roots exist; only one mockup visible by CSS. |
| Edit listeners | `blur`, `input` on contenteditable; `focusin`/`focusout` on scope. |
| When listeners attached? | Dynamically after each generation/refresh in `applyInlineEditingToPreview()`. |
| Mobile same listeners as desktop? | Yes. |
| Listeners reattached after re-render? | Yes. |
| Source of truth | `AppState.generatedHTML` (in-memory). |
| Mobile edits update central state? | Only if `syncPreviewToGeneratedHtml()` runs and reads from mobile. |
| Regeneration reads from | Form inputs / generator; not from `AppState.generatedHTML` or preview DOM. |
| `if (isMobile)` blocking sync? | No. |
| Condition preventing save on mobile? | No. |
| `body.mobile-mode` affects binding? | No. |
| **Root cause** | On touch, `blur` is unreliable; sync from mobile container often never runs, so state stays stale and later refresh restores original content. |
| **Minimal fix** | Add a mobile-only, touch-driven trigger (e.g. `touchend` on mobile editables) that runs the same sync logic, without changing desktop behavior. |

---

*End of report. No code was modified.*
