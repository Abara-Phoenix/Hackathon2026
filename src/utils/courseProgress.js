export const CHECKPOINTS_PER_SKILL = 3

function clampCheckpointCount(value) {
  const numericValue = Number.isFinite(value) ? Math.floor(value) : 0
  return Math.min(CHECKPOINTS_PER_SKILL, Math.max(0, numericValue))
}

export function checkpointCountsFor(course, progress = {}) {
  const completedSkills = new Set(progress.completedSkillIds ?? [])

  return Object.fromEntries(course.skills.map((skill) => {
    const savedCount = progress.skillCheckpointCounts?.[skill.id]
    const checkpointCount = savedCount == null && completedSkills.has(skill.id)
      ? CHECKPOINTS_PER_SKILL
      : clampCheckpointCount(savedCount)

    return [skill.id, checkpointCount]
  }))
}

export function completedSkillsFor(course, progress = {}) {
  const checkpointCounts = checkpointCountsFor(course, progress)

  return course.skills
    .filter((skill) => checkpointCounts[skill.id] >= CHECKPOINTS_PER_SKILL)
    .map((skill) => skill.id)
}

export function masteryFor(course, progress = {}) {
  const checkpointCounts = checkpointCountsFor(course, progress)
  const completedCheckpoints = Object.values(checkpointCounts)
    .reduce((total, count) => total + count, 0)
  const totalCheckpoints = course.skills.length * CHECKPOINTS_PER_SKILL

  return totalCheckpoints > 0
    ? Math.round((completedCheckpoints / totalCheckpoints) * 100)
    : 0
}

export function advanceSkillCheckpoint(course, progress, skillId) {
  const skillCheckpointCounts = checkpointCountsFor(course, progress)
  const previousCount = skillCheckpointCounts[skillId] ?? 0
  const nextCount = Math.min(CHECKPOINTS_PER_SKILL, previousCount + 1)

  skillCheckpointCounts[skillId] = nextCount

  return {
    skillCheckpointCounts,
    completedSkillIds: course.skills
      .filter((skill) => skillCheckpointCounts[skill.id] >= CHECKPOINTS_PER_SKILL)
      .map((skill) => skill.id),
    checkpointAdvanced: nextCount > previousCount,
    skillMastered: previousCount < CHECKPOINTS_PER_SKILL && nextCount === CHECKPOINTS_PER_SKILL,
  }
}

