# Yahoot! — Agentic Coding Execution Prompt

Copy this prompt into your coding agent from the project root.

---

You are the frontend coding agent for **Yahoot!**, a game-like multiplayer quiz web application.

## STEP 1 — READ SOT

Read completely:

```text
AGENTS.md
docs/01-PRD.md
docs/02-USER-FLOW.md
docs/03-UI-GUIDELINE.md
docs/04-API-SPEC.md
```

Treat these documents as the current Source of Truth.

Do not start coding before understanding them.

## STEP 2 — INSPECT REPOSITORY

Inspect:
- package.json
- existing src/
- Vite configuration
- Tailwind configuration
- routing
- existing components
- existing CSS

Reuse existing infrastructure when reasonable.

Do not rewrite working infrastructure without a concrete reason.

## STEP 3 — DEFINE MINIMAL IMPLEMENTATION

Build the frontend MVP with these areas:

### Public
- Landing
- Student Join

### Teacher
- Dashboard
- Quiz list
- Quiz editor
- Quiz preview
- Game lobby
- Live game
- Result

### Student
- Join
- Waiting lobby
- Question
- Answer feedback
- Result

Use local/mock data initially if backend is unavailable, but structure API access according to `docs/04-API-SPEC.md`.

## STEP 4 — IMPLEMENT DESIGN

Follow `docs/03-UI-GUIDELINE.md`.

The visual target:

> modern game quiz + blocky sandbox energy + clean educational UX.

Important:
- do not copy Minecraft or Roblox assets/UI;
- avoid generic AI dashboard aesthetics;
- avoid excessive gradients;
- avoid excessive rounded cards;
- avoid unnecessary animations;
- prioritize usability.

## STEP 5 — BUILD COMPONENTS

Use a small reusable component set:

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Card
│   ├── Badge
│   └── Modal
├── quiz/
│   ├── QuestionCard
│   ├── QuestionOption
│   └── QuizEditor
└── game/
    ├── GameCode
    ├── PlayerList
    ├── Timer
    └── ScoreCard
```

Adjust this structure if the existing repository already has a better structure.

Do not create components only to wrap one trivial element.

## STEP 6 — ROUTING

Implement the minimum route structure:

```text
/
 /join
 /game/:code
 /game/:code/play
 /game/:code/result

 /teacher
 /teacher/quizzes
 /teacher/quizzes/new
 /teacher/quizzes/:id/edit
 /teacher/games/:id/lobby
 /teacher/games/:id/play
```

If routing dependency already exists, use it.

If not, install only the minimum required dependency.

## STEP 7 — MOCK/API BOUNDARY

Create a clean API boundary:

```text
src/services/api/
```

Example:

```js
getQuizzes()
getQuiz(id)
createQuiz(data)
createGame(quizId)
getGame(code)
joinGame(code, data)
startGame(gameId)
getCurrentQuestion(gameId)
submitAnswer(gameId, data)
getResults(gameId)
```

The UI must not know endpoint implementation details.

## STEP 8 — STATES

Every important screen must support:

```text
loading
success
empty
error
```

Student game must additionally support:

```text
waiting
answering
answered
time-expired
result
```

## STEP 9 — RESPONSIVE QA

Check at minimum:

```text
Mobile: 375px
Mobile: 430px
Tablet: 768px
Desktop: 1280px
```

Student answer controls must remain comfortable for touch.

No horizontal overflow.

## STEP 10 — ANTI-SLOP REVIEW

Before finishing, inspect the UI and ask:

- Does this look like a generic AI SaaS template?
- Is every decorative element necessary?
- Are there too many cards?
- Are gradients being used without purpose?
- Are corners/shadows excessive?
- Does the interface feel like a quiz game?
- Can a student understand what to do immediately?
- Is the question clearly the visual focus?

If yes, simplify.

## STEP 11 — VALIDATE

Run:

```bash
npm install
npm run build
```

Also run the development server and manually inspect the primary flows.

Fix all build/runtime errors.

## STEP 12 — FINAL REPORT

At the end report only:

1. What was implemented.
2. Important files created/changed.
3. Build result.
4. Any unresolved issue.

Do not provide a long explanation.

## HARD CONSTRAINT

Do not expand the product scope.

If you discover a potentially useful feature, do not implement it automatically.

Keep Yahoot! small, coherent, maintainable, and fun.
