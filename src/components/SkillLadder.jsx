function SkillLadder({ course, completedSkillIds = [] }) {
  const completedSkills = new Set(completedSkillIds)
  const readyIndex = course.skills.findIndex((skill) => !completedSkills.has(skill.id))

  return (
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
            </span>
            <span className="skill-step__status">
              {isComplete ? 'Mastered' : isReady ? 'Ready' : 'Upcoming'}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default SkillLadder
