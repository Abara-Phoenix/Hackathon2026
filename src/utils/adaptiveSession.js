export const SESSION_LENGTH = 10

const DIFFICULTIES = ['Warm-up', 'Steady', 'Stretch']

export const QUESTION_APPROACHES = [
  'a direct application with fresh values or details',
  'a realistic scenario that requires modeling or interpretation',
  'reverse reasoning from an outcome to a missing value or cause',
  'a comparison between two representations, cases, or claims',
  'a short multi-step problem that connects ideas',
  'a misconception check built around a plausible student error',
]

function shiftDifficulty(difficulty, amount) {
  const currentIndex = Math.max(0, DIFFICULTIES.indexOf(difficulty))
  return DIFFICULTIES[Math.min(DIFFICULTIES.length - 1, Math.max(0, currentIndex + amount))]
}

function nextSkillAfter(course, currentSkillId, completedSkillIds = []) {
  const currentIndex = Math.max(0, course.skills.findIndex((skill) => skill.id === currentSkillId))
  const completed = new Set(completedSkillIds)

  for (let offset = 1; offset <= course.skills.length; offset += 1) {
    const candidate = course.skills[(currentIndex + offset) % course.skills.length]
    if (!completed.has(candidate.id)) {
      return candidate
    }
  }

  return course.skills[(currentIndex + 1) % course.skills.length]
}

export function selectAdaptiveTarget({
  course,
  currentProblem,
  outcome,
  misses = 0,
  hintsUsed = 0,
  streak = 0,
  completedSkillIds = [],
  questionNumber = 1,
}) {
  const currentSkill = course.skills.find((skill) => skill.id === currentProblem.skillId)
    ?? course.skills[0]
  const needsReinforcement = outcome === 'skipped' || misses > 0 || hintsUsed > 0

  if (needsReinforcement) {
    const supportLevel = outcome === 'skipped' || misses >= 2 || hintsUsed >= 2 ? -1 : 0
    return {
      skill: currentSkill,
      difficulty: shiftDifficulty(currentProblem.difficulty, supportLevel),
      approach: QUESTION_APPROACHES[(questionNumber + 1) % QUESTION_APPROACHES.length],
      reason: outcome === 'skipped'
        ? 'The skip signaled low confidence, so the next question keeps the skill but changes the example and lowers the support level when possible.'
        : 'Retries or hints signaled that this concept needs reinforcement, so the next question keeps the skill with a different approach.',
    }
  }

  const nextSkill = nextSkillAfter(course, currentSkill.id, completedSkillIds)
  return {
    skill: nextSkill,
    difficulty: shiftDifficulty(currentProblem.difficulty, streak >= 2 ? 1 : 0),
    approach: QUESTION_APPROACHES[questionNumber % QUESTION_APPROACHES.length],
    reason: streak >= 2
      ? 'A first-try streak shows strong confidence, so the path advances and raises the challenge.'
      : 'A correct answer without support moves the path to the next unfinished skill.',
  }
}

function rotateChoices(choices, rotation) {
  if (!choices?.length) {
    return choices
  }

  const offset = rotation % choices.length
  return [...choices.slice(offset), ...choices.slice(0, offset)]
}

function usageCount(problem, usedProblems) {
  return usedProblems.filter((usedProblem) => usedProblem.prompt === problem.prompt).length
}

export function createFallbackProblem({
  seededProblems,
  target,
  usedProblems = [],
  questionNumber = 1,
}) {
  const matchingSkill = seededProblems.filter((problem) => problem.skillId === target.skill.id)
  const lastPrompt = usedProblems.at(-1)?.prompt
  const preferredPool = matchingSkill.length > 0 ? matchingSkill : seededProblems
  const nonRepeatingPreferred = preferredPool.filter((problem) => problem.prompt !== lastPrompt)
  const nonRepeatingCourse = seededProblems.filter((problem) => problem.prompt !== lastPrompt)
  const candidates = nonRepeatingPreferred.length > 0
    ? nonRepeatingPreferred
    : nonRepeatingCourse.length > 0 ? nonRepeatingCourse : preferredPool
  const lowestUsage = Math.min(...candidates.map((problem) => usageCount(problem, usedProblems)))
  const leastUsed = candidates.filter((problem) => usageCount(problem, usedProblems) === lowestUsage)
  const source = leastUsed[questionNumber % leastUsed.length]

  return {
    ...source,
    id: `fallback-${questionNumber}-${source.id}`,
    choices: rotateChoices(source.choices, questionNumber),
    source: 'seeded',
  }
}

export function chooseInitialProblem(seededProblems, preferredIndex) {
  const safeIndex = Math.abs(preferredIndex) % seededProblems.length
  const source = seededProblems[safeIndex]

  return {
    ...source,
    id: `session-1-${source.id}`,
    choices: rotateChoices(source.choices, safeIndex),
    source: 'seeded',
  }
}
