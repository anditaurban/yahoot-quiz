# Yahoot! — UI Guideline

## 1. Design Goal
Yahoot! harus terasa seperti **game quiz**, bukan dashboard SaaS generik.

Keywords:
**playful · blocky · energetic · clear · responsive · game-first**

## 2. Visual Inspiration
Gunakan bahasa visual umum dari game sandbox:
- chunky shapes;
- pixel/block accents;
- playful avatars;
- strong cards;
- layered surfaces;
- game-like feedback.

Jangan copy Minecraft/Roblox:
- no copyrighted characters;
- no copied logos;
- no exact UI recreation;
- no proprietary assets.

## 3. Anti AI-Slop Rules
Hindari:
- gradient ungu/biru default;
- glassmorphism berlebihan;
- giant hero dengan 3 gradient blobs;
- terlalu banyak rounded cards;
- excessive shadows;
- generic SaaS dashboard;
- random emoji sebagai icon system;
- setiap section menggunakan card;
- terlalu banyak decorative elements.

Setiap visual element harus punya fungsi.

## 4. Layout

### Student
Mobile-first.

```text
┌─────────────────────┐
│ Yahoot!   Timer     │
│                     │
│ Question            │
│                     │
│ ┌─────────────────┐ │
│ │ Answer A        │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Answer B        │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Answer C        │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Answer D        │ │
│ └─────────────────┘ │
└─────────────────────┘
```

### Teacher
Desktop:
- compact top navigation;
- content max-width;
- editor uses clear sections;
- preview should resemble actual student screen.

## 5. Color System
Pertahankan warna brand Yahoot! dari satu source of truth.

Create CSS variables:

```css
:root {
  --color-primary: ...;
  --color-secondary: ...;
  --color-background: ...;
  --color-surface: ...;
  --color-text: ...;
  --color-success: ...;
  --color-danger: ...;
  --color-warning: ...;
}
```

Do not invent many colors.

Recommended semantic usage:
- primary → main action;
- success → correct;
- danger → incorrect/error;
- warning → time/attention;
- neutral → background/content.

## 6. Typography
Gunakan maksimal 2 font families.

Hierarchy:
- Display: game title / score
- Heading: question/title
- Body: supporting text
- Label: controls

Prioritize readability over novelty.

## 7. Shape Language
Gunakan kombinasi:
- medium rounded corners;
- occasional blocky/notched accents;
- strong borders for game controls.

Jangan membuat semua element terlalu bulat.

## 8. Buttons
Primary action:
- visually dominant;
- minimum touch target sekitar 44px;
- clear hover/pressed/disabled states.

Student answer:
- large;
- easy to tap;
- visually distinct when selected;
- locked after submission.

## 9. Question Cards
Question should be the visual focus.

Rules:
- generous spacing;
- readable line length;
- optional image area;
- timer visible but secondary to question.

## 10. Game Feedback
Use clear states:
- selected;
- correct;
- incorrect;
- locked;
- waiting.

Animations should be short and purposeful.

Use CSS transitions first. Avoid animation libraries unless genuinely needed.

## 11. Game Code
Game code is a key visual element.

Example:

```text
JOIN CODE

8 4 2 7 1
```

Make it easy to read from teacher's screen.

## 12. Score
Score feedback can include:
- points;
- rank;
- streak;
- progress.

Do not overload the screen with statistics.

## 13. Empty / Loading / Error
Every data-driven screen must define:
- loading;
- empty;
- error;
- success.

Prefer skeleton or simple placeholder over decorative loading animation.

## 14. Accessibility
Minimum:
- keyboard navigation for teacher;
- visible focus state;
- sufficient contrast;
- semantic buttons;
- labels for inputs;
- don't rely only on color to communicate correctness.

## 15. Responsive Breakpoints
Use Tailwind defaults unless evidence requires custom breakpoints.

Do not create many custom breakpoints.

## 16. Component Rule
Create a component when:
1. reused;
2. has meaningful independent state;
3. improves readability.

Do not split every `<div>` into a component.

## 17. Icons
Use one icon approach consistently.

Avoid mixing:
- emoji;
- random SVG styles;
- multiple icon libraries.

## 18. Motion
Recommended:
- button press;
- answer selection;
- score reveal;
- page transition;
- timer urgency.

Avoid:
- constant floating objects;
- excessive bouncing;
- long entrance animations.
