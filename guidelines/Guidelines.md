# UX Guidelines — EHP VetCare

A working reference distilled from **[Laws of UX](https://lawsofux.com/)** by Jon Yablonski, adapted for the EHP VetCare clinic management system (veterinarian + nurse + receptionist + manager workflows on web).

> When in doubt about a screen, scan for the law that applies, then pick the simplest solution that satisfies it. Cite a law in code review when explaining a choice — e.g. "Moved to bottom-right by Fitts's Law — thumb reach."

---

## 0. Project context

This is a **veterinary clinic system** for medical professionals. Users are:

- **Reception** — register pets/owners, schedule appointments
- **Veterinarian** — diagnose, order Lab/X-Ray/drugs, write SOAP notes
- **Nurse** — record vitals/I-O/feeding, administer meds (MAR)
- **Cashier** — billing, payments, discharge
- **Manager** — view reports, oversight

Users are **busy professionals** working under time pressure. Errors carry medical and financial consequences. **Speed, accuracy, and clear feedback** beat aesthetics.

---

## 1. Cognitive Load & Memory

### Cognitive Load — keep screens scannable
- Strip extraneous detail. Each screen should have **one primary task**.
- Defer secondary options behind disclosure (modal, expandable section, dropdown).
- **Example**: IPD Patient Detail has 9 tabs because the medical spec demands it — but each tab focuses on ONE workflow (vitals only, lab only, meds only).

### Miller's Law — 7 ± 2 items in working memory
- Sidebar nav groups ≤ 5 items each.
- IPD Patient Detail has 9 tabs (medical necessity). Mitigate by grouping conceptually: **ภาพรวม → บันทึก → การรักษา → การเงิน/Discharge**.
- Long forms → split into 3-step max (Admit form: เลือกสัตว์ → เลือกกรง → ข้อมูลแพทย์).

### Working Memory — never make user re-remember
- Repeat patient name + HN + severity in every tab header (via appbar breadcrumb).
- Persist draft fields when navigating back. `localStorage` everything.
- Cage info repeats in Hero on every Patient Detail tab.

### Chunking — group meaningful sets
- **Vital Signs**: T/P/R group on one row · BP separate · Pain Score separate.
- **Phone number**: `081-234-5678` not `0812345678`.
- **HN**: `HN-2026-001` not `HN2026001`.
- **Billing**: 9 categories grouped logically.

### Cognitive Bias — avoid dark patterns
- No fake urgency, no fake discount strikethroughs.
- Default to honest defaults: today's date, current vet, "Observation" severity.
- **Drug Allergy / Duplicate / Dose Range Check** — pop confirmation modals when risk detected, don't silently let the user proceed.

### Mental Model — match user expectations
- 🩺 Stethoscope = doctor/exam
- 💊 Pill = medication
- 🧪 Flask = lab
- 🩻 Image = X-Ray
- 🛏 Bed = ward/cage
- ⚠️ Triangle = critical / warning
- **Severity colors**: Critical red · Observation orange · Recovering green · Isolation purple
- **Cage status**: green available · blue occupied · amber cleaning · red maintenance

---

## 2. Decision-Making

### Hick's Law — fewer choices, faster decisions
- Cage type chips: 6 visible at a time (Small/Medium/Large/ICU/Isolation/Oxygen).
- Drug Route: 8 options as dropdown (not radio buttons).
- Cage list filtered by selected type → reduces visible cages.

### Choice Overload — limit primary options
- Show top 6 ICD-10 in autocomplete · type to filter, don't list all.
- Doctor selector: 5 most common · "อื่นๆ" for manual entry.
- Sidebar nav grouped by collapsible section.

### Occam's Razor — simplest works
- "Take Home meds" → text list with `+ เพิ่ม`. No structured Drug Order entity.
- Discharge follow-up → just date + note. No appointment system integration.
- Cage assign → button list of available cages. No drag-drop.

### Pareto Principle (80/20) — polish core flows first
- 80% of clinic time spent on: **Visits register → diagnosis → prescription → billing**
- For IPD: **Admit → daily vitals → MAR → Discharge**
- Polish these flows before edge cases.

### Selective Attention — one focus per screen
- **Primary action color**: teal `#19a589` for save/confirm
- **Danger color**: red `#ef4444` for delete/critical/discharge
- **CTA color**: orange gradient for "Admit ใหม่" / "เพิ่มเคส"
- Visual hierarchy — header > primary CTA > secondary > tertiary.

---

## 3. Visual Perception (Gestalt)

### Law of Proximity — tighten within, widen between
- **Within a card**: `gap-1` to `gap-2` (4–8px).
- **Between sections**: `gap-4` (16px) — sometimes `gap-6` (24px) for major separations.
- Form: label → input gap 6px · field group gap 12px · section gap 16px.

### Law of Similarity — consistent visual language
- All "section card" headers: gray-100 circle (40px) + lucide icon (gray-600) + title 14px/700 + subtitle 11px/500.
- All vital cards: same structure (icon-circle, label, big-number, unit, range).
- All severity pills: same gradient pattern across IPD.

### Law of Common Region — bordered group = one unit
- Use `rounded-2xl border` to enclose related fields.
- Vital Signs 5 values inside ONE bordered grid (not 5 separate boxes).
- Each "section card" is its own region.

### Law of Uniform Connectedness — connection > proximity
- A divider line groups items more strongly than spacing alone.
- Sidebar nav groups use a faint divider between groups.
- Tabs use a connected pill-bar (not separate buttons).

### Law of Prägnanz — simple shapes
- Cards: `rounded-2xl` (16px) or `rounded-3xl` (24px) — never ad-hoc radii.
- Icons primitives only — no decorative SVG.
- Avatar: circle + rainbow conic ring (semantic: "patient").

### Von Restorff Effect — make important things stand out
- **One primary CTA per screen** (teal solid or orange gradient).
- **Today's date** in calendar: gradient teal circle (vs gray for other dates).
- **Critical patients**: red severity pill + red border on Recent Admits.
- **STAT lab orders**: orange Zap icon + bold pill.

---

## 4. Interaction & Performance

### Fitts's Law — bigger targets, easier reach
- Buttons: ≥ 40px height (`.vet-btn` is 40px).
- Tap targets minimum 44×44 px — icons inside buttons need padding.
- Primary CTAs near thumb on mobile · top-right on desktop.
- Small icon buttons (close, delete) — increase clickable area with `padding`, not just icon size.

### Doherty Threshold — < 400ms response
- Use `localStorage` immediately → no network wait, response is instant.
- **Optimistic UI**: heart fills, check checks, value commits BEFORE persistence.
- Skeleton loaders if anything > 400ms (charts on Reports page).
- **MAR check**: tick immediately, snackbar confirms.

### Postel's Law — accept liberally, send conservatively
- Phone input: accept `0812345678` / `081-234-5678` / `081 234 5678` → normalize to dashed format.
- HN search: case-insensitive, trim whitespace, partial match.
- Temperature: accept `38` or `38.0` or `38.5`.
- Pain Score: accept slider OR typed number 0-10.

### Tesler's Law — irreducible complexity must live somewhere
- **Don't push edge cases onto user**:
  - Cage status (cleaning after discharge) handled automatically.
  - MAR schedule auto-generated when prescribing q12h × 3 days.
  - Critical alert auto-triggered when temp >39.5 OR pulse >180 OR pain ≥7.
- Make smart defaults: today/now for timestamps, current user as recorder.

---

## 5. Behavior & Motivation

### Aesthetic-Usability Effect — beautiful feels usable
- Typography: 22px (h1) · 18-20px (titles) · 14-15px (body) · 11-12px (caption) · 10px (hint).
- Letter-spacing tightening on headings (`-0.3px` to `-0.5px`).
- Smooth animations: 180ms ease for transitions · `[0.22, 1, 0.36, 1]` ease curve for entrances.
- Subtle hover lift: `-translate-y-0.5` · soft shadow change.

### Flow — don't interrupt the task
- Modal during Admit only at FINAL step (confirm), not mid-form.
- Auto-save drafts (Visits register has autosave).
- Back button always returns to previous logical state.
- Snackbar for non-blocking feedback (success/error).

### Goal-Gradient Effect — show progress
- Admit form: section badges show 1/2/3 status (✓ when filled).
- Discharge: 5-item checklist (สรุป / ยา / นัด / ชำระ / Consent) before final button.
- IPD Dashboard: KPI cards show running totals (Admit 11 · ว่าง 9 · วิกฤต 3).

### Zeigarnik Effect — unfinished tasks pull attention
- Surface pending Lab + pending MAR on Dashboard Alerts panel.
- "ยอดค้างชำระ" highlighted on Patient Detail right column.
- Critical patients always on Recent Admits row regardless of paging.

### Paradox of the Active User — users don't read docs
- First screen self-explanatory · no tooltips required.
- Empty states teach: "ยังไม่มีบันทึก Vital Signs · กดเพิ่มเพื่อเริ่มบันทึก".
- Critical fields marked `*` with red asterisk.
- Section subtitles describe what goes there.

---

## 6. Memory & Experience

### Peak-End Rule — peak + ending matter most
- **Discharge confirmation**: animated success → snackbar → redirect to Ward.
- **Save vital signs**: snackbar "บันทึก Vital Signs สำเร็จ" with animation.
- **Payment received**: green check animation + receipt option.
- Make the END of every workflow feel rewarding, not abrupt.

### Serial Position Effect — first + last remembered
- Sidebar nav: dashboard FIRST · settings LAST.
- IPD Patient Detail tabs: ภาพรวม FIRST (most-used) · Discharge LAST (final step).
- Recent Admits row: most recent first.
- ICD-10 autocomplete: most common first.

### Parkinson's Law — time-box features
- Modal forms have a clear scope (single concern).
- Resist scope creep per component.
- Ship the smallest useful version, iterate from feedback.

### Jakob's Law — match familiar conventions
- Bed icon for ward (universal medical).
- Clock for time/schedule.
- ↑↓ trend arrows.
- Calendar for dates.
- ⚠ Triangle for warnings.
- 🔍 Magnifier for search.
- "+" for add — always.
- Match existing app patterns (OPD tabs match IPD tabs visually).

---

## 7. Design System Tokens (live in `theme.css`)

| Token | Value | Use |
|---|---|---|
| `--vet-teal` | `#19a589` | Primary brand · save · confirm |
| `--vet-teal-dark` | `#0d7c66` | Primary text on light · chip border |
| `--vet-orange-from` | `#e8802a` | Add / CTA gradient start |
| `--vet-orange-to` | `#d06a1a` | CTA gradient end |
| `--vet-bg` | `#FEFBF8` | Page background (warm cream) |
| `--input-h` | `40px` | All form controls |
| `--input-radius` | `9999px` | Pill inputs (search/select/text) |
| `--btn-h` | `40px` | All buttons |
| `--card-radius` | `16px` | Standard cards |
| `--modal-radius` | `24px` | Modals |

**Spacing scale** (px): 2 · 4 · 6 · 8 · 10 · 12 · 14 · 16 · 20 · 24 · 28 · 32 · 40 · 48

**Component classes**: `.vet-input` · `.vet-textarea` · `.vet-select` · `.vet-chip` · `.vet-chip-active` · `.vet-btn` (with `-primary`, `-orange`, `-secondary`, `-ghost`, `-danger`, `-brand-soft`) · `.vet-list-item` · `.vet-selectable` · `.vet-panel`

---

## 8. Color Semantics

| Purpose | Color | Class/Hex |
|---|---|---|
| Primary action | Teal | `.vet-btn-primary` |
| Add / CTA | Orange | `.vet-btn-orange` |
| Destructive | Red | `.vet-btn-danger` · `#ef4444` |
| Information | Sky | `#0ea5e9` |
| Warning | Amber | `#f59e0b` |
| Success | Emerald | `#10b981` |
| Critical patient | Red | `#ef4444` + alert icon |
| Observation patient | Amber | `#f59e0b` |
| Recovering patient | Emerald | `#10b981` |
| Isolation patient | Purple | `#8b5cf6` |

**Never** use red for non-destructive primary actions. Red = stop / critical / danger.

---

## 9. Tap Target Audit Checklist

When adding a new interactive element:

- [ ] Button height ≥ 40px (`.vet-btn`)
- [ ] Icon-only buttons have padding making clickable area ≥ 44×44px
- [ ] Small chips (28px) only used for non-critical filters · grouped together
- [ ] Form labels above input (not beside) for desktop AND mobile
- [ ] Tap targets separated by ≥ 8px to avoid mis-tap
- [ ] Status pills not clickable (passive info) — if clickable, make them a button

---

## 10. Feedback patterns (Doherty + Peak-End)

| Action | Feedback |
|---|---|
| Save form | Snackbar success "บันทึก {entity} สำเร็จ" + close modal |
| Delete item | Confirm dialog → optimistic remove → snackbar "ลบแล้ว" |
| Submit Admit | Animation → redirect to Patient Detail · snackbar greet |
| Discharge | 5-check confirm → success page → redirect to Ward |
| Order STAT lab | Pulse red badge appears immediately |
| Critical vital detected | Red banner persists until ack'd by nurse |
| Drug allergy detected | Modal warning (require explicit confirm) |
| Duplicate drug order | Modal warning (require explicit confirm) |

---

## How to use this file

1. **Before building a new screen** — scan section 0–2 for the user flow.
2. **During build** — apply section 3–5 patterns.
3. **During code review** — cite a Law as justification ("Section 4 / Fitts's Law: increase tap target").
4. **For new components** — reuse design tokens (section 7), color semantics (section 8).

> Source: [Laws of UX](https://lawsofux.com/) by [Jon Yablonski](https://jon-yablonski.com/). Adapted under fair use as a project reference.
