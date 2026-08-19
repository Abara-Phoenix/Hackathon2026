function SkillLadder({ course }) {
  return (
    <ol className="skill-ladder">
      {course.skills.map((skill, index) => {
        const isReady = index === 0

        return (
          <li className={`skill-step${isReady ? ' skill-step--ready' : ''}`} key={skill.id}>
            <span className="skill-step__number" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="skill-step__copy">
              <strong>{skill.name}</strong>
              <span>{skill.goal}</span>
            </span>
            <span className="skill-step__status">{isReady ? 'Ready' : 'Upcoming'}</span>
          </li>
        )
      })}
    </ol>
  )
}

export default SkillLadder
