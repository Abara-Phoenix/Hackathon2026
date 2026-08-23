import { useState } from 'react'
import AiStatusBadge from './AiStatusBadge.jsx'
import MathText from './MathText.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { getProblemsForCourse } from '../data/demoProblems.js'
import { generateQuestion } from '../services/tutorApi.js'
import { buildAdaptiveDecision } from '../utils/adaptiveDecision.js'
import {
  chooseInitialProblem,
  createFallbackProblem,
  randomProblemIndex,
  selectAdaptiveTarget,
  SESSION_LENGTH,
} from '../utils/adaptiveSession.js'
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
  const skipped = Math.max(0, (courseProgress.skipped ?? 0) - sessionStart.skipped)
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0
  const startingSkills = new Set(sessionStart.completedSkillIds)
  const sessionProblems = problems
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
          <div>
            <strong>{skipped}</strong>
            <span>skipped</span>
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
              const isCompleted = courseProgress.completedSkillIds.includes(skillId)
              const isNew = isCompleted && !startingSkills.has(skillId)

              return (
                <li key={skillId}>
                  <span aria-hidden="true">✓</span>
                  <div>
                    <strong>{skill?.name}</strong>
                    <small>
                      {isNew ? 'Newly mastered' : isCompleted ? 'Mastery reinforced' : 'Scheduled for review'}
                    </small>
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
  const [seedCursor, setSeedCursor] = useState(() => {
    const hasHistory = courseProgress.attempts > 0 || (courseProgress.skipped ?? 0) > 0
    return hasHistory
      ? (courseProgress.nextProblemIndex ?? 0) % seededProblems.length
      : randomProblemIndex(seededProblems.length)
  })
  const [problems, setProblems] = useState(() => [
    chooseInitialProblem(seededProblems, seedCursor),
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [hintIndex, setHintIndex] = useState(-1)
  const [result, setResult] = useState(null)
  const [recentMistakes, setRecentMistakes] = useState([])
  const [missesOnProblem, setMissesOnProblem] = useState(0)
  const [skippedQuestionIndexes, setSkippedQuestionIndexes] = useState([])
  const [generationState, setGenerationState] = useState({ status: 'idle', message: '' })
  const [sessionComplete, setSessionComplete] = useState(false)
  const [sessionStart, setSessionStart] = useState(() => ({
    attempts: courseProgress.attempts,
    correct: courseProgress.correct,
    skipped: courseProgress.skipped ?? 0,
    completedSkillIds: [...courseProgress.completedSkillIds],
  }))

  const problem = problems[currentIndex]
  const skill = course.skills.find((item) => item.id === problem.skillId)
  const answerType = problem.answerType ?? course.answerType ?? 'numeric'
  const mastery = masteryFor(course, courseProgress.completedSkillIds)
  const isLastProblem = currentIndex === SESSION_LENGTH - 1

  function submitAnswer(event) {
    event.preventDefault()

    if (!answer.trim() || result?.correct || result?.skipped) {
      return
    }

    const correct = isPracticeAnswerCorrect(answer, problem, course.answerType)
    const masteredThisAttempt = correct && missesOnProblem === 0 && hintIndex < 0
    const nextStreak = correct ? (courseProgress.currentStreak ?? 0) + 1 : 0
    const completedSkillIds = masteredThisAttempt
      ? [...new Set([...courseProgress.completedSkillIds, problem.skillId])]
      : courseProgress.completedSkillIds
    const nextTarget = correct && !isLastProblem
      ? selectAdaptiveTarget({
        course,
        currentProblem: problem,
        outcome: 'correct',
        misses: missesOnProblem,
        hintsUsed: hintIndex + 1,
        streak: nextStreak,
        completedSkillIds,
        questionNumber: currentIndex + 2,
      })
      : null
    const decision = buildAdaptiveDecision({
      correct,
      mastered: masteredThisAttempt,
      isLastProblem,
      currentSkillName: skill?.name ?? 'this skill',
      nextSkillName: nextTarget?.skill.name ?? 'the next skill',
      currentDifficulty: problem.difficulty,
      nextDifficulty: nextTarget?.difficulty,
      adaptationReason: nextTarget?.reason,
      misses: correct ? missesOnProblem : missesOnProblem + 1,
      hintsUsed: hintIndex + 1,
    })

    onProgress({
      ...courseProgress,
      attempts: courseProgress.attempts + 1,
      correct: courseProgress.correct + (correct ? 1 : 0),
      completedSkillIds,
      currentStreak: nextStreak,
      bestStreak: Math.max(courseProgress.bestStreak ?? 0, nextStreak),
      nextProblemIndex: (seedCursor + 1) % seededProblems.length,
    })

    if (correct) {
      setResult({
        correct: true,
        title: 'That’s right',
        message: problem.explanation,
        decision,
      })

      if (nextTarget) {
        void prepareNextProblem(currentIndex + 1, nextTarget, {
          misses: Math.min(missesOnProblem, 20),
          hintsUsed: hintIndex + 1,
          streak: Math.min(nextStreak, 100),
        })
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

  async function prepareNextProblem(nextIndex, target, performance) {
    const fallbackProblem = createFallbackProblem({
      seededProblems,
      target,
      usedProblems: problems,
      questionNumber: nextIndex + 1,
    })

    setGenerationState({
      status: 'loading',
      message: `Adapting question ${nextIndex + 1} to ${target.skill.name}…`,
    })

    try {
      const generatedProblem = await generateQuestion({
        course: { id: course.id, name: course.name, subject: course.subject },
        skill: {
          id: target.skill.id,
          name: target.skill.name,
          goal: target.skill.goal,
        },
        answerType: course.answerType,
        promptStyle: course.promptStyle ?? 'standard',
        language: course.language ?? null,
        difficulty: target.difficulty,
        recentMistakes,
        avoidPrompts: problems.map((item) => item.prompt).slice(-12),
        questionApproach: target.approach,
        variationSeed: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${nextIndex}`,
        performance,
      })

      setProblems((currentProblems) => {
        const nextProblems = [...currentProblems]
        nextProblems[nextIndex] = generatedProblem
        return nextProblems
      })
      setGenerationState({
        status: 'success',
        message: `Next: ${target.skill.name} at ${target.difficulty.toLowerCase()} level, using a new question style.`,
      })
      onAiStatusChange({
        state: 'connected',
        model: aiStatus?.model,
        message: 'Fresh AI questions are available.',
      })
    } catch {
      setProblems((currentProblems) => {
        const nextProblems = [...currentProblems]
        nextProblems[nextIndex] = fallbackProblem
        return nextProblems
      })
      setGenerationState({
        status: 'fallback',
        message: 'Using a different saved question so your practice keeps moving.',
      })
      if (fallbackProblem.skillId !== target.skill.id) {
        const fallbackSkill = course.skills.find((item) => item.id === fallbackProblem.skillId)
        setResult((currentResult) => currentResult?.decision ? {
          ...currentResult,
          decision: {
            ...currentResult.decision,
            title: `Continue with ${fallbackSkill?.name ?? 'course review'}`,
            message: 'A fresh same-skill question was unavailable, so SolvePath chose the least-repeated saved question from this course to keep the session varied.',
            routeTo: fallbackProblem.difficulty,
          },
        } : currentResult)
      }
      onAiStatusChange({
        state: 'fallback',
        message: 'Saved questions are active.',
      })
    }
  }

  function skipQuestion() {
    if (result?.correct || result?.skipped || generationState.status === 'loading') {
      return
    }

    const nextTarget = !isLastProblem
      ? selectAdaptiveTarget({
        course,
        currentProblem: problem,
        outcome: 'skipped',
        misses: missesOnProblem,
        hintsUsed: hintIndex + 1,
        streak: 0,
        completedSkillIds: courseProgress.completedSkillIds,
        questionNumber: currentIndex + 2,
      })
      : null
    const decision = buildAdaptiveDecision({
      correct: false,
      skipped: true,
      isLastProblem,
      currentSkillName: skill?.name ?? 'this skill',
      nextSkillName: nextTarget?.skill.name,
      currentDifficulty: problem.difficulty,
      nextDifficulty: nextTarget?.difficulty,
      adaptationReason: nextTarget?.reason,
    })

    onProgress({
      ...courseProgress,
      skipped: (courseProgress.skipped ?? 0) + 1,
      currentStreak: 0,
      nextProblemIndex: (seedCursor + 1) % seededProblems.length,
    })
    setSkippedQuestionIndexes((indexes) => [...indexes, currentIndex])
    setRecentMistakes((mistakes) => [
      `Skipped ${skill?.name ?? problem.skillId}; use a more supportive example.`,
      ...mistakes,
    ].slice(0, 3))
    setResult({
      correct: false,
      skipped: true,
      title: 'Question skipped',
      message: `No penalty. Here is the key idea before you move on: ${problem.explanation}`,
      decision,
    })

    if (nextTarget) {
      void prepareNextProblem(currentIndex + 1, nextTarget, {
        misses: Math.min(missesOnProblem, 20),
        hintsUsed: hintIndex + 1,
        streak: 0,
        skipped: true,
      })
    }
  }

  function showNextHint() {
    setHintIndex((current) => Math.min(current + 1, problem.hints.length - 1))
  }

  function moveForward() {
    if (isLastProblem) {
      const nextSeedCursor = (seedCursor + 1) % seededProblems.length
      onProgress({
        ...courseProgress,
        sessionCount: (courseProgress.sessionCount ?? 0) + 1,
        nextProblemIndex: nextSeedCursor,
      })
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
    const nextSeedCursor = (seedCursor + 1) % seededProblems.length
    setSeedCursor(nextSeedCursor)
    setSessionStart({
      attempts: courseProgress.attempts,
      correct: courseProgress.correct,
      skipped: courseProgress.skipped ?? 0,
      completedSkillIds: [...courseProgress.completedSkillIds],
    })
    setProblems([chooseInitialProblem(seededProblems, nextSeedCursor)])
    setCurrentIndex(0)
    setAnswer('')
    setHintIndex(-1)
    setMissesOnProblem(0)
    setResult(null)
    setRecentMistakes([])
    setSkippedQuestionIndexes([])
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
                {problem.source === 'ai' ? 'AI generated' : 'Saved question'}
              </span>
            </div>
            <span>Question {currentIndex + 1} of {SESSION_LENGTH}</span>
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
                <fieldset className="choice-list" disabled={result?.correct || result?.skipped}>
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
                {!result?.correct && !result?.skipped && (
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
                    disabled={result?.correct || result?.skipped}
                    placeholder="Type a number"
                    value={answer}
                    onChange={updateAnswer}
                  />
                  {!result?.correct && !result?.skipped && (
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
              <div className={`result-card result-card--${result.skipped ? 'skipped' : result.correct ? 'correct' : 'incorrect'}`} role="status">
                <span className="result-card__icon" aria-hidden="true">
                  {result.skipped ? '↷' : result.correct ? '✓' : '↻'}
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
              <div className="question-support-actions">
                <button
                  className="secondary-button"
                  type="button"
                  disabled={hintIndex === problem.hints.length - 1 || result?.correct || result?.skipped}
                  onClick={showNextHint}
                >
                  <span aria-hidden="true">✦</span>
                  {hintIndex < 0 ? 'Give me a hint' : 'Another hint'}
                </button>
                <button
                  className="skip-button"
                  type="button"
                  disabled={result?.correct || result?.skipped || generationState.status === 'loading'}
                  onClick={skipQuestion}
                >
                  Skip question
                  <span aria-hidden="true">↷</span>
                </button>
              </div>

              {(result?.correct || result?.skipped) && (
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
              <strong>{courseProgress.currentStreak ?? 0}</strong>
              <span>Streak</span>
            </div>
            <div>
              <strong>{courseProgress.skipped ?? 0}</strong>
              <span>Skipped</span>
            </div>
          </div>

          <div className="adaptive-note">
            <span className="adaptive-note__mark" aria-hidden="true">↗</span>
            <div>
              <strong>How this path adapts</strong>
              <p>
                First-try streaks raise the challenge. Hints, retries, and skips
                trigger a new approach at a more supportive level.
              </p>
            </div>
          </div>

          <ol className="mini-path">
            {Array.from({ length: SESSION_LENGTH }, (_, index) => {
              const item = problems[index]
              const wasSkipped = skippedQuestionIndexes.includes(index)

              return (
                <li
                  className={`${index === currentIndex ? 'mini-path__current' : ''}${!item ? ' mini-path__future' : ''}`}
                  key={`session-step-${index}`}
                >
                  <span>{index < currentIndex ? (wasSkipped ? '↷' : '✓') : index + 1}</span>
                  <div>
                    <strong>
                      {item
                        ? course.skills.find((courseSkill) => courseSkill.id === item.skillId)?.name
                        : 'Adaptive question'}
                    </strong>
                    <small>{item?.difficulty ?? 'Chosen from your results'}</small>
                  </div>
                </li>
              )
            })}
          </ol>
        </aside>
        </main>
      )}
    </div>
  )
}

export default PracticeSession
