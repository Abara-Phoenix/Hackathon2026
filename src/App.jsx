import { useEffect, useState } from 'react'
import CourseCard from './components/CourseCard.jsx'
import PracticeSession from './components/PracticeSession.jsx'
import SkillLadder from './components/SkillLadder.jsx'
import { getCourseById, mathCourses } from './data/mathCurriculum.js'
import './App.css'

const SELECTED_COURSE_KEY = 'solvepath:selected-course'
const PROGRESS_KEY = 'solvepath:progress:v1'
const EMPTY_PROGRESS = {
  attempts: 0,
  correct: 0,
  completedSkillIds: [],
  nextProblemIndex: 0,
}

function getInitialCourseId() {
  try {
    const savedCourseId = window.localStorage.getItem(SELECTED_COURSE_KEY)
    return getCourseById(savedCourseId).id
  } catch {
    return mathCourses[0].id
  }
}

function getInitialProgress() {
  try {
    const savedProgress = window.localStorage.getItem(PROGRESS_KEY)
    return savedProgress ? JSON.parse(savedProgress) : {}
  } catch {
    return {}
  }
}

function App() {
  const [selectedCourseId, setSelectedCourseId] = useState(getInitialCourseId)
  const [progressByCourse, setProgressByCourse] = useState(getInitialProgress)
  const [isPracticing, setIsPracticing] = useState(false)
  const selectedCourse = getCourseById(selectedCourseId)
  const selectedProgress = {
    ...EMPTY_PROGRESS,
    ...progressByCourse[selectedCourseId],
  }
  const mastery = Math.round(
    (selectedProgress.completedSkillIds.length / selectedCourse.skills.length) * 100,
  )

  useEffect(() => {
    try {
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressByCourse))
    } catch {
      // Progress still works for the current session when storage is unavailable.
    }
  }, [progressByCourse])

  function selectCourse(courseId) {
    setSelectedCourseId(courseId)

    try {
      window.localStorage.setItem(SELECTED_COURSE_KEY, courseId)
    } catch {
      // The app remains usable when browser storage is unavailable.
    }
  }

  function scrollToCourses() {
    document.querySelector('#course-catalog')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  function updateCourseProgress(nextProgress) {
    setProgressByCourse((currentProgress) => ({
      ...currentProgress,
      [selectedCourseId]: nextProgress,
    }))
  }

  function leavePractice() {
    setIsPracticing(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isPracticing) {
    return (
      <PracticeSession
        course={selectedCourse}
        courseProgress={selectedProgress}
        key={selectedCourse.id}
        onExit={leavePractice}
        onProgress={updateCourseProgress}
      />
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="SolvePath home">
          <span className="brand__mark" aria-hidden="true">∿</span>
          <span>SolvePath</span>
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#course-catalog">Courses</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <span className="demo-badge">Hackathon demo</span>
      </header>

      <main id="top">
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-section__copy">
            <p className="eyebrow">Math that meets you where you are</p>
            <h1 id="hero-title">
              Practice smarter.
              <span> Master every step.</span>
            </h1>
            <p className="hero-section__lede">
              Personalized math practice from Algebra 1 through Calculus 2,
              adapting after every answer.
            </p>
            <div className="hero-section__actions">
              <button className="primary-button" type="button" onClick={scrollToCourses}>
                Choose your course
                <span aria-hidden="true">↓</span>
              </button>
              <span className="hero-section__note">No account needed for the demo</span>
            </div>
          </div>

          <div className="hero-card" aria-label="Example adaptive practice session">
            <div className="hero-card__header">
              <span>Today&rsquo;s path</span>
              <span className="live-dot">Adapting live</span>
            </div>
            <div className="equation-preview" aria-hidden="true">
              <span>3(x − 2) = 12</span>
              <span className="equation-preview__answer">x = ?</span>
            </div>
            <div className="feedback-preview">
              <span className="feedback-preview__icon" aria-hidden="true">✓</span>
              <span>
                <strong>Nice work.</strong>
                Your next question will be a little harder.
              </span>
            </div>
            <div className="mastery-preview">
              <span>Linear equations</span>
              <span>72% mastered</span>
              <span className="mastery-preview__track">
                <span className="mastery-preview__fill" />
              </span>
            </div>
          </div>
        </section>

        <section className="quick-stats" aria-label="SolvePath coverage">
          <div><strong>6</strong><span>math courses</span></div>
          <div><strong>30</strong><span>core skills</span></div>
          <div><strong>3</strong><span>adaptive levels</span></div>
        </section>

        <section className="catalog-section" id="course-catalog" aria-labelledby="catalog-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your learning path</p>
              <h2 id="catalog-title">Where do you want to start?</h2>
            </div>
            <p>
              Pick a course to see its core skill ladder. Your choice is saved on
              this device.
            </p>
          </div>

          <div className="catalog-layout">
            <div className="course-grid">
              {mathCourses.map((course) => (
                <CourseCard
                  course={course}
                  isSelected={course.id === selectedCourseId}
                  key={course.id}
                  onSelect={selectCourse}
                />
              ))}
            </div>

            <aside
              className="path-panel"
              style={{ '--course-accent': selectedCourse.accent }}
              aria-live="polite"
            >
              <div className="path-panel__heading">
                <span className="path-panel__kicker">Selected path</span>
                <h3>{selectedCourse.name}</h3>
                <p>{selectedCourse.summary}</p>
                <div className="path-panel__mastery">
                  <span>{mastery}% mastered</span>
                  <span className="path-panel__track">
                    <span style={{ width: `${mastery}%` }} />
                  </span>
                </div>
              </div>

              <SkillLadder
                course={selectedCourse}
                completedSkillIds={selectedProgress.completedSkillIds}
              />

              <button
                className="primary-button primary-button--full"
                type="button"
                onClick={() => {
                  setIsPracticing(true)
                  window.scrollTo({ top: 0 })
                }}
              >
                {selectedProgress.attempts > 0 ? 'Continue practice' : 'Start practice'}
                <span aria-hidden="true">→</span>
              </button>

              <div className="lesson-preview">
                <span className="lesson-preview__label">
                  {selectedProgress.attempts > 0 ? 'Saved progress' : 'First up'}
                </span>
                <strong>
                  {selectedProgress.attempts > 0
                    ? `${selectedProgress.correct} of ${selectedProgress.attempts} attempts correct`
                    : selectedCourse.skills[0].name}
                </strong>
                <p>
                  {selectedProgress.attempts > 0
                    ? 'Continue where you left off on this device.'
                    : selectedCourse.skills[0].goal}
                </p>
                <span className="lesson-preview__meta">
                  3 questions · guided hints · saved locally
                </span>
              </div>
            </aside>
          </div>
        </section>

        <section className="how-section" id="how-it-works" aria-labelledby="how-title">
          <div className="section-heading section-heading--light">
            <div>
              <p className="eyebrow">Simple by design</p>
              <h2 id="how-title">One loop. Better practice.</h2>
            </div>
          </div>
          <div className="how-grid">
            <article>
              <span>01</span>
              <h3>Solve</h3>
              <p>Get a focused question at the right course and skill level.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Understand</h3>
              <p>See useful feedback and request a hint without revealing the answer.</p>
            </article>
            <article>
              <span>03</span>
              <h3>Adapt</h3>
              <p>Move forward, practice again, or revisit a prerequisite.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>SolvePath</span>
        <span>Built for Hackathon 2026</span>
      </footer>
    </div>
  )
}

export default App
