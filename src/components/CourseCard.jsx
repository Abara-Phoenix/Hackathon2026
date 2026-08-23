function CourseCard({ course, isSelected, onSelect }) {
  return (
    <button
      className={`course-card${isSelected ? ' course-card--selected' : ''}`}
      style={{ '--course-accent': course.accent }}
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(course.id)}
    >
      <span className="course-card__topline">
        <span className="course-card__labels">
          <span className="course-card__subject">{course.subject}</span>
          <span className="course-card__level">{course.level}</span>
        </span>
        <span className="course-card__arrow" aria-hidden="true">→</span>
      </span>
      <span className="course-card__name">{course.name}</span>
      <span className="course-card__summary">{course.summary}</span>
      <span className="course-card__footer">
        <span>{course.skills.length} core skills</span>
        <span>{isSelected ? 'Selected' : 'View path'}</span>
      </span>
    </button>
  )
}

export default CourseCard
