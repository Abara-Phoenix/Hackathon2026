# SolvePath

SolvePath is a hackathon-ready adaptive practice app with **48 courses across
10 subject families and 240 mastery skills**. The catalog includes foundational
through advanced math; eight lab and applied sciences; history, civics,
economics, geography, psychology, sociology, and philosophy; general and AP
English; Spanish, French, Mandarin, and ASL; visual art and music; personal
finance, business, health, and career readiness; SAT and ACT preparation; and
six computer-science paths including Python, AP Computer Science A in Java, AP
Computer Science Principles, web development, cybersecurity, and data science.

Math uses numeric evaluation, most subjects use subject-aware multiple choice,
and programming courses add formatted code tracing and debugging questions.
Every course has a dependable three-question local session with explanations
and progressive hints. Later questions can be generated for the student's
exact subject, course, skill, language, answer format, and difficulty.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env`.

3. Replace the placeholder `OPENAI_API_KEY` value in `.env` with a real key.
   The key stays in the Node server and is never sent to React.

4. Start the React app and API together:

   ```bash
   npm run dev
   ```

The web app normally runs at `http://localhost:5173` and the API at
`http://localhost:8787`.

The app also works without an API key. It automatically uses its seeded
questions whenever AI is not configured, times out, or returns an invalid
response.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `OPENAI_API_KEY` | Server-side OpenAI API key | none |
| `OPENAI_MODEL` | Model used for question generation | `gpt-5.6-luna` |
| `PORT` | Local API port | `8787` |

## Scripts

- `npm run dev` — run the web app and API together
- `npm run dev:web` — run only the Vite frontend
- `npm run dev:api` — run only the question-generation API
- `npm run build` — create the production frontend build
- `npm run lint` — check the JavaScript and React code
- `npm test` — verify answer parsing and every seeded course session
- `npm start` — run the API and serve a built frontend when
  `NODE_ENV=production`

## Three-minute demo path

1. Click **Reset demo** so the mastery counters start from zero.
2. Select **Algebra 1**, point out its five-skill mastery ladder, and start practice.
3. Enter `5` for the first question to demonstrate feedback that keeps the student
   on the same skill. Point out the **Why this came next** card, reveal a hint,
   then answer `6` and show how the learning signal changes the next decision.
4. Explain that the next question is generated for the next skill when AI is
   available. If the status changes to **Seeded mode**, continue normally—the
   saved fallback is the reliability story, not a demo failure.
5. Finish the three questions and show the session summary, saved mastery, and
   **Choose another course** action. The Algebra 1 seeded answers are `6`, `6`,
   and `4` for rehearsal.

For a quick cross-subject moment, choose **Biology** after the summary and show
that the same mastery engine now renders multiple-choice practice. The seeded
answers are **Mitochondrion**, **50%**, and **Water is split during the
light-dependent reactions**.

Use the **Computer Science** filter to demonstrate **Python Foundations**. Its
seeded answers are **11**, **cool**, and **total += number**. These questions
show output prediction and debugging without executing arbitrary student code.

For a recognizable AP course, choose **AP Computer Science A — Java**. Its
seeded answers are **6**, **6**, and **To encapsulate the field and control
outside access**. The same practice engine renders Java code safely as text and
adapts the next skill without executing student code.
