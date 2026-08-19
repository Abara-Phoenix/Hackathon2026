import { useState } from 'react'
import { getProblemsForCourse } from '../data/demoProblems.js'
import { isAnswerCorrect } from '../utils/answerChecking.js'

function masteryFor(course, completedSkillIds = []) {
  return Math.round((completedSkillIds.length / course.skills.length) * 100)
}

function PracticeSession({ course, courseProgress, onExit, onProgress }) {
  const problems = getProblemsForCourse(course.id)
  const savedIndex = Math.min(courseProgress.nextProblemIndex ?? 0, problems.length - 1)
  const [currentIndex, setCurrentIndex] = useState(savedIndex)
  const [answer, setAnswer] = useState('')
  const [hintIndex, setHintIndex] = useState(-1)
  const [result, setResult] = useState(null)

  const problem = problems[currentIndex]
  const skill = course.skills.find((item) => item.id === problem.skillId)
  const mastery = masteryFor(course, courseProgress.completedSkillIds)
  const isLastProblem = currentIndex === problems.length - 1

  function submitAnswer(event) {
    event.preventDefault()

    if (!answer.trim() || result?.correct) {
      return
    }

    const correct = isAnswerCorrect(answer, problem.answer, problem.tolerance)
    const completedSkillIds = correct
      ? [...new Set([...courseProgress.completedSkillIds, problem.skillId])]
      : courseProgress.completedSkillIds

    onProgress({
      attempts: courseProgress.attempts + 1,
      correct: courseProgress.correct + (correct ? 1 : 0),
      completedSkillIds,
      nextProblemIndex: correct && !isLastProblem ? currentIndex + 1 : 0,
    })

    if (correct) {
      setResult({
        correct: true,
        title: 'That’s right',
        message: problem.explanation,
        adaptation: isLastProblem
          ? 'Demo set complete. Your progress is saved for the next visit.'
          : `Mastery updated. The next question moves to ${problems[currentIndex + 1].difficulty.toLowerCase()} difficulty.`,
      })
      return
    }

    setResult({
      correct: false,
      title: 'Not quite yet',
      message: 'That answer does not match. Check your work or reveal a hint before trying again.',
      adaptation: 'You’ll stay on this skill until the idea feels solid.',
    })
  }

  function showNextHint() {
    setHintIndex((current) => Math.min(current + 1, problem.hints.length - 1))
  }

  function moveForward() {
    if (isLastProblem) {
      onExit()
      return
    }

    setCurrentIndex((index) => index + 1)
    setAnswer('')
    setHintIndex(-1)
    setResult(null)
  }

  function updateAnswer(event) {
    setAnswer(event.target.value)
    if (result && !result.correct) {
      setResult(null)
    }
  }

  return (
    <div className="practice-page" style={{ '--course-accent': course.accent }}>
      <header className="practice-header">
        <button className="brand brand--button" type="button" onClick={onExit}>
          <span className="brand__mark" aria-hidden="true">∿</span>
          <span>SolvePath</span>
        </button>
        <span className="practice-header__course">{course.name}</span>
        <button className="back-button" type="button" onClick={onExit}>
          <span aria-hidden="true">←</span>
          Back to courses
        </button>
      </header>

      <main className="practice-layout">
        <section className="practice-workspace" aria-labelledby="practice-question">
          <div className="practice-context">
            <div>
              <span className={`difficulty-tag difficulty-tag--${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
              <span className="practice-context__skill">{skill?.name}</span>
            </div>
            <span>Question {currentIndex + 1} of {problems.length}</span>
          </div>

          <form className="question-card" onSubmit={submitAnswer}>
            <p className="question-card__eyebrow">Solve the problem</p>
            <h1 id="practice-question">{problem.prompt}</h1>

            <label className="answer-label" htmlFor="practice-answer">
              Your answer
            </label>
            <div className="answer-row">
              <input
                id="practice-answer"
                inputMode="decimal"
                autoComplete="off"
                disabled={result?.correct}
                placeholder="Type a number"
                value={answer}
                onChange={updateAnswer}
              />
              {!result?.correct && (
                <button className="primary-button answer-submit" disabled={!answer.trim()} type="submit">
                  Check answer
                </button>
              )}
            </div>
            <p className="answer-help">You can enter a number, fraction, or an answer like x = 6.</p>

            {hintIndex >= 0 && (
              <div className="hint-card" role="status">
                <span className="hint-card__icon" aria-hidden="true">?</span>
                <div>
                  <strong>Hint {hintIndex + 1}</strong>
                  <p>{problem.hints[hintIndex]}</p>
                </div>
              </div>
            )}

            {result && (
              <div className={`result-card result-card--${result.correct ? 'correct' : 'incorrect'}`} role="status">
                <span className="result-card__icon" aria-hidden="true">
                  {result.correct ? '✓' : '↻'}
                </span>
                <div>
                  <strong>{result.title}</strong>
                  <p>{result.message}</p>
                  <span>{result.adaptation}</span>
                </div>
              </div>
            )}

            <div className="question-actions">
              <button
                className="secondary-button"
                type="button"
                disabled={hintIndex === problem.hints.length - 1 || result?.correct}
                onClick={showNextHint}
              >
                <span aria-hidden="true">✦</span>
                {hintIndex < 0 ? 'Give me a hint' : 'Another hint'}
              </button>

              {result?.correct && (
                <button className="primary-button" type="button" onClick={moveForward}>
                  {isLastProblem ? 'Finish session' : 'Next question'}
                  <span aria-hidden="true">→</span>
                </button>
              )}
            </div>
          </form>
        </section>

        <aside className="session-panel" aria-label="Current session progress">
          <span className="session-panel__eyebrow">Session progress</span>
          <div className="session-mastery">
            <strong>{mastery}%</strong>
            <span>course mastery</span>
          </div>
          <div className="session-progress" aria-label={`${mastery}% mastered`}>
            <span style={{ width: `${mastery}%` }} />
          </div>

          <div className="session-stats">
            <div>
              <strong>{courseProgress.attempts}</strong>
              <span>Attempts</span>
            </div>
            <div>
              <strong>{courseProgress.correct}</strong>
              <span>Correct</span>
            </div>
          </div>

          <div className="adaptive-note">
            <span className="adaptive-note__mark" aria-hidden="true">↗</span>
            <div>
              <strong>How this demo adapts</strong>
              <p>
                Correct answers move you forward. Missed answers keep you on the
                same skill with progressively stronger hints.
              </p>
            </div>
          </div>

          <ol className="mini-path">
            {problems.map((item, index) => (
              <li
                className={index === currentIndex ? 'mini-path__current' : ''}
                key={item.id}
              >
                <span>{index < currentIndex ? '✓' : index + 1}</span>
                <div>
                  <strong>{course.skills.find((courseSkill) => courseSkill.id === item.skillId)?.name}</strong>
                  <small>{item.difficulty}</small>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </main>
    </div>
  )
}

export default PracticeSession
