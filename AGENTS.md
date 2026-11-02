# Yahoot! — Agent Instructions

## Mission
Build the Yahoot! frontend from the SOT documents in `docs/`.

The goal is a polished, responsive quiz game — not a generic AI-generated SaaS dashboard.

Use the Anti-Slop skill when available.

## Source of Truth
Read in this order:

1. `docs/01-PRD.md`
2. `docs/02-USER-FLOW.md`
3. `docs/03-UI-GUIDELINE.md`
4. `docs/04-API-SPEC.md`

If implementation conflicts with SOT, SOT wins.

## Stack
- React
- Vite
- Tailwind CSS
- HTML
- JavaScript unless TypeScript is explicitly requested later

Do not introduce another frontend framework.

## Execution Rules

### 1. Inspect Before Coding
First inspect the repository:
- existing package.json;
- source structure;
- Tailwind setup;
- existing routes;
- reusable components.

Do not recreate existing infrastructure unnecessarily.

### 2. SOT-Driven
Before implementing a feature:
- identify the relevant SOT;
- implement only the required behavior;
- avoid speculative features.

### 3. No Over-Engineering
Do NOT add:
- Redux/Zustand unless state complexity actually requires it;
- unnecessary custom hooks;
- large design systems;
- animation libraries for simple CSS animation;
- complex abstraction layers;
- premature performance optimization;
- unnecessary dependencies.

Prefer the simplest implementation that remains maintainable.

### 4. UI Quality
The UI must:
- feel like a game;
- be responsive;
- have strong visual hierarchy;
- avoid generic AI-slop patterns;
- use consistent spacing;
- use a coherent color system;
- provide interaction feedback.

Do not create:
- purple/blue SaaS gradients by default;
- excessive glassmorphism;
- huge rounded cards everywhere;
- decorative blobs;
- random emoji icons;
- excessive shadows.

### 5. Component Strategy
Start simple.

Create reusable components only when:
- reused;
- independently meaningful;
- or needed to keep a page readable.

### 6. API
All API communication belongs in `src/services/api/`.

Do not scatter raw `fetch()` calls across components.

Never invent fields that aren't defined in `docs/04-API-SPEC.md`.

### 7. Mock Data
Mock data is allowed during frontend development.

Keep it isolated:

```text
src/
└── mocks/
```

Never mix mock data directly into production API services.

### 8. Responsive
Student experience is mobile-first.

Teacher experience is desktop-first but must remain usable on tablet/mobile.

### 9. Accessibility
Use:
- semantic HTML;
- keyboard support;
- focus states;
- labels;
- sufficient contrast;
- buttons for actions.

### 10. Validation
After implementation:
- run build;
- fix errors;
- check responsive layouts;
- verify main flows;
- verify loading/error/empty states.

Do not claim completion if the build fails.

## Priority
When trade-offs occur:

```text
SOT correctness
>
Working UX
>
Responsive behavior
>
Visual polish
>
Abstraction
```

## Change Control
If a requested feature is not represented in the SOT and materially changes scope:
1. flag it;
2. propose the smallest SOT update;
3. do not silently expand architecture.

## Definition of Done
A feature is done when:
- it follows the relevant SOT;
- UI works on target viewport;
- states are handled;
- API integration is isolated;
- no unnecessary dependencies were introduced;
- build passes.
