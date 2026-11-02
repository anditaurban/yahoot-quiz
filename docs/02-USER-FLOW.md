# Yahoot! — User Flow

## 1. Global Entry

```text
Landing
├── Teacher
│   └── Teacher Dashboard
└── Student
    └── Join Game
```

---

## 2. Teacher Flow

```text
Teacher Dashboard
│
├── View Quiz List
│   ├── Create Quiz
│   │   └── Quiz Editor
│   │       ├── Add Question
│   │       ├── Edit Question
│   │       ├── Delete Question
│   │       └── Preview
│   │
│   └── Select Quiz
│       └── Quiz Detail
│           └── Start Game
│               └── Game Lobby
│                   ├── Show Game Code
│                   ├── Show Players
│                   └── Start Question
│                       └── Live Question
│                           ├── Show Answers
│                           ├── Show Timer
│                           └── Show Results
│                               ├── Next Question
│                               └── Final Result
```

### Teacher States
- loading
- empty quiz
- editing
- saving
- game lobby
- question active
- question closed
- result
- API error

---

## 3. Student Flow

```text
Join Game
│
├── Enter Game Code
│
└── Enter Nickname
    │
    ▼
Waiting Lobby
│
└── Host Starts
    │
    ▼
Question
│
├── Select Answer
│
└── Submit/Auto Submit
    │
    ▼
Answer Feedback
│
└── Waiting For Next Question
    │
    ├── Next Question
    └── Final Result
```

### Student States
- initial
- joining
- join error
- waiting
- question active
- answered
- time expired
- result
- disconnected/reconnecting

---

## 4. Question Flow

### Multiple Choice

```text
Question
  ↓
4 Answer Options
  ↓
Student selects one
  ↓
Selected state
  ↓
Submit / timer expires
  ↓
Locked state
  ↓
Feedback
```

### True / False

```text
Question
  ↓
TRUE / FALSE
  ↓
Student selects one
  ↓
Locked state
  ↓
Feedback
```

---

## 5. Navigation Rules

### Teacher
Use route-level navigation for:
- `/teacher`
- `/teacher/quizzes`
- `/teacher/quizzes/new`
- `/teacher/quizzes/:id/edit`
- `/teacher/games/:id/lobby`
- `/teacher/games/:id/play`

### Student
Use:
- `/join`
- `/game/:code`
- `/game/:code/play`
- `/game/:code/result`

Do not create routes for every tiny UI state. Prefer local component state.

---

## 6. Error Handling

```text
API Request
├── Success → render data
├── 4xx → show actionable message
├── 5xx → show retry state
└── Network Error → show reconnect/retry state
```

Error messages should be human-readable.

Example:
> Kode game tidak ditemukan. Coba periksa kembali.

Not:
> HTTP 404 / GAME_NOT_FOUND.

---

## 7. Responsive Interaction

### Student
- answer cards should be thumb-friendly;
- avoid tiny controls;
- no horizontal scrolling;
- timer remains visible;
- question remains readable without zoom.

### Teacher
- editor can use multi-column layout on desktop;
- collapse into single column on smaller screens.
