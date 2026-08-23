function SkillLadder({ course, completedSkillIds = [] }) {
  const completedSkills = new Set(completedSkillIds)
  const readyIndex = course.skills.findIndex((skill) => !completedSkills.has(skill.id))

  return (
    <div className="skill-roadmap">
      <div className="skill-roadmap__intro">
        <span>Full course roadmap</span>
        <strong>{course.skills.length} units · {course.skills.length * 3} adaptive checkpoints</strong>
        <p>Each unit moves from foundation to application to a mastery challenge.</p>
      </div>
      <ol className="skill-ladder">
        {course.skills.map((skill, index) => {
          const isComplete = completedSkills.has(skill.id)
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
                <span className="skill-checkpoints" aria-label="Warm-up, application, and mastery checkpoints">
                  <span className={isComplete || isReady ? 'skill-checkpoint skill-checkpoint--active' : 'skill-checkpoint'}>Foundation</span>
                  <span className={isComplete ? 'skill-checkpoint skill-checkpoint--active' : 'skill-checkpoint'}>Apply</span>
                  <span className={isComplete ? 'skill-checkpoint skill-checkpoint--active' : 'skill-checkpoint'}>Master</span>
                </span>
              </span>
              <span className="skill-step__status">
                {isComplete ? 'Mastered' : isReady ? 'Ready now' : 'Upcoming'}
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
