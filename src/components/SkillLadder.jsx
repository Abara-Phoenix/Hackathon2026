import { CHECKPOINTS_PER_SKILL, checkpointCountsFor } from '../utils/courseProgress.js'

function SkillLadder({ course, courseProgress = {} }) {
  const checkpointCounts = checkpointCountsFor(course, courseProgress)
  const readyIndex = course.skills.findIndex(
    (skill) => checkpointCounts[skill.id] < CHECKPOINTS_PER_SKILL,
  )

  return (
    <div className="skill-roadmap">
      <div className="skill-roadmap__intro">
        <span>Full course roadmap</span>
        <strong>{course.skills.length} units · {course.skills.length * 3} adaptive checkpoints</strong>
        <p>Each unit moves from foundation to application to a mastery challenge.</p>
      </div>
      <ol className="skill-ladder">
        {course.skills.map((skill, index) => {
          const completedCheckpoints = checkpointCounts[skill.id]
          const isComplete = completedCheckpoints === CHECKPOINTS_PER_SKILL
          const isReady = !isComplete && index === readyIndex

          return (
            <li
              className={`skill-step${isReady ? ' skill-step--ready' : ''}${isComplete ? ' skill-step--complete' : ''}`}
              key={skill.id}
            >
              <span className="skill-step__number" aria-hidden="true">
                {isComplete ? '✓' : String(index + 1).padStart(2, '0')}
              </span>
              <span className="skill-step__copy">
                <strong>{skill.name}</strong>
                <span>{skill.goal}</span>
                <span
                  className="skill-checkpoints"
                  aria-label={`${completedCheckpoints} of ${CHECKPOINTS_PER_SKILL} checkpoints completed`}
                >
                  {['Foundation', 'Apply', 'Master'].map((checkpoint, checkpointIndex) => (
                    <span
                      className={checkpointIndex < completedCheckpoints
                        ? 'skill-checkpoint skill-checkpoint--active'
                        : 'skill-checkpoint'}
                      key={checkpoint}
                    >
                      {checkpoint}
                    </span>
                  ))}
                </span>
              </span>
              <span className="skill-step__status">
                {isComplete
                  ? 'Mastered'
                  : completedCheckpoints > 0
                    ? `${completedCheckpoints} of ${CHECKPOINTS_PER_SKILL}`
                    : isReady ? 'Ready now' : 'Upcoming'}
              </span>
            </li>
          )
        })}
        <li className="skill-step skill-step--ongoing">
          <span className="skill-step__number" aria-hidden="true">∞</span>
          <span className="skill-step__copy">
            <strong>Mixed mastery & review</strong>
            <span>The path keeps combining skills and revisiting weak spots after every session.</span>
            <span className="skill-checkpoints">
              <span className="skill-checkpoint">Spiral review</span>
              <span className="skill-checkpoint">Challenge sets</span>
            </span>
          </span>
          <span className="skill-step__status">Ongoing</span>
        </li>
      </ol>
    </div>
  )
}

export default SkillLadder
