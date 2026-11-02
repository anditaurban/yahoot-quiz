# Yahoot! — API Specification (Frontend Contract)

> Backend belum menjadi scope implementasi fase ini. Dokumen ini hanya menjadi kontrak data agar frontend tidak membuat struktur API sendiri-sendiri.

## 1. Base

```text
/api/v1
```

JSON request/response.

Frontend API layer harus terisolasi, misalnya:

```text
src/
└── services/
    └── api/
        ├── client.js
        ├── quizzes.js
        └── games.js
```

Jangan melakukan `fetch()` langsung di banyak component.

## 2. Quiz

### GET `/quizzes`

Response:

```json
{
  "data": [
    {
      "id": 1,
      "title": "JavaScript Fundamental",
      "description": "Quiz dasar JavaScript",
      "questionCount": 10,
      "createdAt": "2026-09-27T10:00:00Z"
    }
  ]
}
```

### POST `/quizzes`

```json
{
  "title": "JavaScript Fundamental",
  "description": "Quiz dasar JavaScript"
}
```

### GET `/quizzes/:id`

```json
{
  "data": {
    "id": 1,
    "title": "JavaScript Fundamental",
    "description": "Quiz dasar JavaScript",
    "questions": []
  }
}
```

## 3. Questions

### POST `/quizzes/:quizId/questions`

Multiple Choice:

```json
{
  "type": "multiple_choice",
  "question": "Apa hasil 2 + 2?",
  "options": [
    { "id": "a", "text": "3" },
    { "id": "b", "text": "4" },
    { "id": "c", "text": "5" },
    { "id": "d", "text": "6" }
  ],
  "correctOptionId": "b",
  "timeLimit": 20,
  "points": 100
}
```

True / False:

```json
{
  "type": "true_false",
  "question": "JavaScript berjalan di browser.",
  "options": [
    { "id": "true", "text": "True" },
    { "id": "false", "text": "False" }
  ],
  "correctOptionId": "true",
  "timeLimit": 20,
  "points": 100
}
```

## 4. Game

### POST `/games`

```json
{
  "quizId": 1
}
```

Response:

```json
{
  "data": {
    "id": "game_123",
    "code": "84271",
    "status": "lobby"
  }
}
```

### GET `/games/:code`

```json
{
  "data": {
    "id": "game_123",
    "code": "84271",
    "status": "lobby",
    "quizTitle": "JavaScript Fundamental",
    "players": [
      {
        "id": "player_1",
        "nickname": "Andi"
      }
    ]
  }
}
```

## 5. Join Game

### POST `/games/:code/join`

```json
{
  "nickname": "Andi"
}
```

Response:

```json
{
  "data": {
    "playerId": "player_1",
    "nickname": "Andi",
    "gameCode": "84271"
  }
}
```

## 6. Start Game

### POST `/games/:gameId/start`

Response:

```json
{
  "data": {
    "status": "question",
    "questionIndex": 0
  }
}
```

## 7. Active Question

### GET `/games/:gameId/current-question`

Response:

```json
{
  "data": {
    "id": "question_1",
    "index": 0,
    "type": "multiple_choice",
    "question": "Apa hasil 2 + 2?",
    "options": [
      { "id": "a", "text": "3" },
      { "id": "b", "text": "4" },
      { "id": "c", "text": "5" },
      { "id": "d", "text": "6" }
    ],
    "timeLimit": 20
  }
}
```

> `correctOptionId` jangan dikirim ke student endpoint.

## 8. Submit Answer

### POST `/games/:gameId/answers`

```json
{
  "playerId": "player_1",
  "questionId": "question_1",
  "optionId": "b"
}
```

Response:

```json
{
  "data": {
    "accepted": true,
    "correct": true,
    "points": 100
  }
}
```

## 9. Game Result

### GET `/games/:gameId/results`

```json
{
  "data": {
    "players": [
      {
        "playerId": "player_1",
        "nickname": "Andi",
        "score": 850,
        "rank": 1
      }
    ]
  }
}
```

## 10. Standard Error

```json
{
  "error": {
    "code": "GAME_NOT_FOUND",
    "message": "Game tidak ditemukan."
  }
}
```

Frontend maps error codes to user-friendly UI where useful.

## 11. API Rules
- Never expose answer key to student before submission.
- Keep API calls inside service layer.
- Components consume functions/hooks, not raw endpoint strings.
- Handle loading/error states.
- Do not invent undocumented fields.
- If backend contract changes, update this SOT first.
