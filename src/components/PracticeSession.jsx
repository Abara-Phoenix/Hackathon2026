import { useState } from 'react'
import AiStatusBadge from './AiStatusBadge.jsx'
import MathText from './MathText.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { getProblemsForCourse } from '../data/demoProblems.js'
import { generateQuestion } from '../services/tutorApi.js'
import { buildAdaptiveDecision } from '../utils/adaptiveDecision.js'
import { isPracticeAnswerCorrect } from '../utils/answerChecking.js'

function masteryFor(course, completedSkillIds = []) {
  return Math.round((completedSkillIds.length / course.skills.length) * 100)
}

function SessionComplete({
  course,
  courseProgress,
  problems,
  sessionStart,
  onChooseCourse,
  onPracticeAgain,
}) {
  const attempts = Math.max(0, courseProgress.attempts - sessionStart.attempts)
  const correct = Math.max(0, courseProgress.correct - sessionStart.correct)
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0
  const startingSkills = new Set(sessionStart.completedSkillIds)
  const sessionProblems = problems.slice(sessionStart.startIndex)
  const practicedSkillIds = [...new Set(sessionProblems.map((problem) => problem.skillId))]
  const newSkillCount = courseProgress.completedSkillIds.filter((id) => !startingSkills.has(id)).length
  const mastery = masteryFor(course, courseProgress.completedSkillIds)
  const usedAi = sessionProblems.some((problem) => problem.source === 'ai')

  return (
    <main className="completion-layout">
      <section className="completion-card" aria-labelledby="completion-title">
        <div className="completion-burst" aria-hidden="true">
          <span>+</span><span>×</span><span>∿</span><span>+</span>
          <strong>✓</strong>
        </div>
        <p className="completion-card__eyebrow">Session complete</p>
        <h1 id="completion-title">You moved your {course.name} path forward.</h1>
        <p className="completion-card__lede">
          Your progress is saved on this device and ready for the next practice session.
        </p>

        <div className="completion-stats" aria-label="Session results">
          <div>
            <strong>{accuracy}%</strong>
            <span>accuracy</span>
          </div>
          <div>
            <strong>{newSkillCount}</strong>
            <span>new skills</span>
          </div>
          <div>
            <strong>{mastery}%</strong>
            <span>course mastery</span>
          </div>
        </div>

        <div className="completion-skills">
          <div className="completion-skills__heading">
            <strong>Skills practiced</strong>
            <span>{usedAi ? 'Seeded + AI questions' : 'Reliable seeded questions'}</span>
          </div>
          <ul>
            {practicedSkillIds.map((skillId) => {
              const skill = course.skills.find((item) => item.id === skillId)
              const isNew = !startingSkills.has(skillId)

              return (
                <li key={skillId}>
                  <span aria-hidden="true">✓</span>
                  <div>
                    <strong>{skill?.name}</strong>
                    <small>{isNew ? 'Newly mastered' : 'Mastery reinforced'}</small>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="completion-actions">
          <button className="primary-button" type="button" onClick={onPracticeAgain}>
            Practice again
            <span aria-hidden="true">↻</span>
          </button>
          <button className="secondary-button" type="button" onClick={onChooseCourse}>
            Choose another course
          </button>
        </div>
      </section>
    </main>
  )
}

function PracticeSession({
  course,
  courseProgress,
  aiStatus,
  onAiStatusChange,
  onChooseCourse,
  onExit,
  onProgress,
  theme,
  onToggleTheme,
}) {
  const seededProblems = getProblemsForCourse(course.id)
  const savedIndex = Math.min(courseProgress.nextProblemIndex ?? 0, seededProblems.length - 1)
  const [problems, setProblems] = useState(seededProblems)
  const [currentIndex, setCurrentIndex] = useState(savedIndex)
  const [answer, setAnswer] = useState('')
  const [hintIndex, setHintIndex] = useState(-1)
  const [result, setResult] = useState(null)
  const [recentMistakes, setRecentMistakes] = useState([])
  const [missesOnProblem, setMissesOnProblem] = useState(0)
  const [generationState, setGenerationState] = useState({ status: 'idle', message: '' })
  const [sessionComplete, setSessionComplete] = useState(false)
  const [sessionStart, setSessionStart] = useState(() => ({
    attempts: courseProgress.attempts,
    correct: courseProgress.correct,
    completedSkillIds: [...courseProgress.completedSkillIds],
    startIndex: savedIndex,
  }))

  const problem = problems[currentIndex]
  const skill = course.skills.find((item) => item.id === problem.skillId)
  const answerType = problem.answerType ?? course.answerType ?? 'numeric'
  const mastery = masteryFor(course, courseProgress.completedSkillIds)
  const isLastProblem = currentIndex === problems.length - 1

  function submitAnswer(event) {
    event.preventDefault()

    if (!answer.trim() || result?.correct) {
      return
    }

    const correct = isPracticeAnswerCorrect(answer, problem, course.answerType)
    const nextProblem = isLastProblem ? null : problems[currentIndex + 1]
    const nextSkill = nextProblem
      ? course.skills.find((item) => item.id === nextProblem.skillId)
      : null
    const decision = buildAdaptiveDecision({
      correct,
      isLastProblem,
      currentSkillName: skill?.name ?? 'this skill',
      nextSkillName: nextSkill?.name ?? 'the next skill',
      currentDifficulty: problem.difficulty,
      nextDifficulty: nextProblem?.difficulty,
      misses: correct ? missesOnProblem : missesOnProblem + 1,
      hintsUsed: hintIndex + 1,
    })
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
        decision,
      })

      if (!isLastProblem) {
        void prepareNextProblem(currentIndex + 1)
      }
      return
    }

    setRecentMistakes((mistakes) => [
      `Needed another attempt on ${skill?.name ?? problem.skillId}.`,
      ...mistakes,
    ].slice(0, 3))
    setMissesOnProblem((misses) => misses + 1)

    setResult({
      correct: false,
      title: 'Not quite yet',
      message: 'That answer does not match. Check your work or reveal a hint before trying again.',
      decision,
    })
  }

  async function prepareNextProblem(nextIndex) {
    const fallbackProblem = seededProblems[nextIndex]
    const nextSkill = course.skills.find((item) => item.id === fallbackProblem.skillId)

    setGenerationState({
      status: 'loading',
      message: 'Creating a fresh question for your next skill…',
    })

    try {
      const generatedProblem = await generateQuestion({
        course: { id: course.id, name: course.name, subject: course.subject },
        skill: {
          id: nextSkill.id,
          name: nextSkill.name,
          goal: nextSkill.goal,
        },
        answerType: course.answerType,
        promptStyle: course.promptStyle ?? 'standard',
        language: course.language ?? null,
        difficulty: fallbackProblem.difficulty,
        recentMistakes,
        avoidPrompts: problems.map((item) => item.prompt),
      })

      setProblems((currentProblems) => currentProblems.map((item, index) => (
        index === nextIndex ? generatedProblem : item
      )))
      setGenerationState({
        status: 'success',
        message: 'Your next question was generated for this exact skill and level.',
      })
      onAiStatusChange({
        state: 'connected',
        model: aiStatus?.model,
        message: 'Fresh AI questions are available.',
      })
    } catch {
      setGenerationState({
        status: 'fallback',
        message: 'Using a saved question so your practice keeps moving.',
      })
      onAiStatusChange({
        state: 'fallback',
        message: 'Saved questions are active.',
      })
    }
  }

  function showNextHint() {
    setHintIndex((current) => Math.min(current + 1, problem.hints.length - 1))
  }

  function moveForward() {
    if (isLastProblem) {
      setSessionComplete(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setCurrentIndex((index) => index + 1)
    setAnswer('')
    setHintIndex(-1)
    setMissesOnProblem(0)
    setResult(null)
    setGenerationState({ status: 'idle', message: '' })
  }

  function practiceAgain() {
    setSessionStart({
      attempts: courseProgress.attempts,
      correct: courseProgress.correct,
      completedSkillIds: [...courseProgress.completedSkillIds],
      startIndex: 0,
    })
    setProblems(seededProblems)
    setCurrentIndex(0)
    setAnswer('')
    setHintIndex(-1)
    setMissesOnProblem(0)
    setResult(null)
    setRecentMistakes([])
    setGenerationState({ status: 'idle', message: '' })
    setSessionComplete(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <AiStatusBadge status={aiStatus} />
        <button className="back-button" type="button" onClick={onExit}>
          <span aria-hidden="true">←</span>
          Back to courses
        </button>
      </header>

      {sessionComplete ? (
        <SessionComplete
          course={course}
          courseProgress={courseProgress}
          problems={problems}
          sessionStart={sessionStart}
          onChooseCourse={onChooseCourse}
          onPracticeAgain={practiceAgain}
        />
      ) : (
        <main className="practice-layout">
        <section className="practice-workspace" aria-labelledby="practice-question">
          <div className="practice-context">
            <div>
              <span className={`difficulty-tag difficulty-tag--${problem.difficulty.toLowerCase()}`}>
                {problem.difficulty}
              </span>
              <span className="practice-context__skill">{skill?.name}</span>
              <span className={`question-source${problem.source === 'ai' ? ' question-source--ai' : ''}`}>
                {problem.source === 'ai' ? 'AI generated' : 'Seeded demo'}
              </span>
            </div>
            <span>Question {currentIndex + 1} of {problems.length}</span>
          </div>

          <form
            className={`question-card${answerType === 'multiple-choice' ? ' question-card--choice' : ''}${problem.codeSnippet ? ' question-card--code' : ''}`}
            onSubmit={submitAnswer}
          >
            <p className="question-card__eyebrow">
              {answerType === 'multiple-choice' ? 'Choose the best answer' : 'Solve the problem'}
            </p>
            <h1 id="practice-question">
              <MathText>{problem.prompt}</MathText>
            </h1>

            {problem.codeSnippet && (
              <pre className="code-question" aria-label={`${course.language ?? 'Code'} for this question`}>
                <code>{problem.codeSnippet}</code>
              </pre>
            )}

            {answerType === 'multiple-choice' ? (
              <>
                <fieldset className="choice-list" disabled={result?.correct}>
                  <legend className="answer-label">Select one answer</legend>
                  {problem.choices.map((choice, index) => (
                    <label className="choice-option" key={choice.id}>
                      <input
                        checked={answer === choice.id}
                        name="practice-answer"
                        type="radio"
                        value={choice.id}
                        onChange={updateAnswer}
                      />
                      <span className="choice-option__letter" aria-hidden="true">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <MathText>{choice.label}</MathText>
                    </label>
                  ))}
                </fieldset>
                {!result?.correct && (
                  <button className="primary-button choice-submit" disabled={!answer} type="submit">
                    Check answer
                  </button>
                )}
                <p className="answer-help">Choose the response that best matches the concept.</p>
              </>
            ) : (
              <>
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
              </>
            )}

            {hintIndex >= 0 && (
              <div className="hint-card" role="status">
                <span className="hint-card__icon" aria-hidden="true">?</span>
                <div>
                  <strong>Hint {hintIndex + 1}</strong>
                  <p><MathText>{problem.hints[hintIndex]}</MathText></p>
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
                  <p><MathText>{result.message}</MathText></p>
                </div>
              </div>
            )}

            {result?.decision && (
              <section
                className={`adaptive-decision adaptive-decision--${result.decision.tone}`}
                aria-labelledby="adaptive-decision-title"
              >
                <header className="adaptive-decision__header">
                  <span className="adaptive-decision__icon" aria-hidden="true">↗</span>
                  <div>
                    <span>Why this came next</span>
                    <h2 id="adaptive-decision-title">{result.decision.title}</h2>
                  </div>
                </header>
                <div className="adaptive-decision__signal">
                  <span>Learning signal</span>
                  <strong>{result.decision.evidence}</strong>
                </div>
                <p>{result.decision.message}</p>
                <div className="adaptive-decision__route" aria-label={`Path from ${result.decision.routeFrom} to ${result.decision.routeTo}`}>
                  <span>{result.decision.routeFrom}</span>
                  <strong aria-hidden="true">→</strong>
                  <span>{result.decision.routeTo}</span>
                </div>
              </section>
            )}

            {generationState.status !== 'idle' && (
              <div className={`generation-note generation-note--${generationState.status}`} role="status">
                <span className="generation-note__spinner" aria-hidden="true">
                  {generationState.status === 'loading' ? '' : generationState.status === 'success' ? '✓' : '↻'}
                </span>
                <span>{generationState.message}</span>
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
                <button
                  className="primary-button"
                  type="button"
                  disabled={generationState.status === 'loading'}
                  onClick={moveForward}
                >
                  {generationState.status === 'loading'
                    ? 'Creating next question…'
                    : isLastProblem ? 'Finish session' : 'Next question'}
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
      )}
    </div>
  )
}

export default PracticeSession
