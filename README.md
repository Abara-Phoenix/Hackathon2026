# SolvePath

SolvePath is a hackathon-ready adaptive math practice app covering Algebra 1
through Calculus 2. The first question loads instantly from a local problem
bank, while later questions can be generated for the student's exact course,
skill, and difficulty.

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
- `npm start` — run the API and serve a built frontend when
  `NODE_ENV=production`
