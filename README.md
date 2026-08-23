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
Every course has a dependable local session with explanations and progressive
hints. All nine math courses include five seeded questions—one per mastery
skill—while the remaining courses keep three dependable saved starting points.
Every practice run now continues for 10 questions: the opening saved question
rotates, then each next question is selected from the student's streak, retries,
hints, and skips. AI questions also rotate through different reasoning styles
and avoid the previous 12 prompts. If AI is unavailable, varied saved questions
keep the session moving instead of ending early.

Each course roadmap presents five units as 15 checkpoints—foundation,
application, and mastery—followed by ongoing mixed review. A learner can skip a
question without it counting as an incorrect attempt; SolvePath records the
confidence signal and follows with a more supportive question.

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

## Deploy to Vercel

The repository includes Vercel Functions for `/api/health` and
`/api/questions/generate`. They reuse the same request validation, OpenAI call,
and seeded-fallback responses as the local Express server.

In the Vercel project, open **Settings → Environment Variables** and add:

| Variable | Value | Environments |
| --- | --- | --- |
| `OPENAI_API_KEY` | A funded project API key; mark it sensitive | Production and Preview |
| `OPENAI_MODEL` | `gpt-5.6-luna` | Production and Preview |

Do not prefix the key with `VITE_`, do not add `PORT`, and do not put the key in
the repository. Environment-variable changes require a new deployment. After
redeploying, open `https://YOUR-DOMAIN.vercel.app/api/health` and confirm that
`aiConfigured` is `true`. A quota or generation failure still returns the
seeded-fallback contract, so the demo remains usable.

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
2. Select **Algebra 1** and point out its 15-checkpoint roadmap plus ongoing
   mixed review, then start practice.
3. Point out that the opening saved question rotates instead of always starting
   with the same prompt. The Algebra 1 saved answers are `6`, `6`, `4`, `2`,
   and `6` in roadmap order for rehearsal.
4. Answer correctly without a hint and show the **Why this came next** card,
   live streak, and the 10-question adaptive path. The next question changes
   skill or difficulty based on that result and uses a different question style.
5. Use **Skip question** on the next item. Show that it does not reduce accuracy,
   records a review signal, and prepares a new, more supportive example.
6. If the status changes to **Seeded mode**, continue normally—the saved
   fallback is the reliability story, not a demo failure. For the full judge
   test, question 10 ends with a saved session summary and another rotated run.

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
