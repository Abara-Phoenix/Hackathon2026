const DIFFICULTIES = ['Warm-up', 'Steady', 'Steady', 'Stretch', 'Stretch']

function codeCommentFor(course, skill) {
  if (course.promptStyle !== 'code') {
    return null
  }

  if (course.language === 'Python') {
    return `# ${skill.name}\n# Choose the learning goal that best matches this checkpoint.`
  }

  if (course.language === 'HTML/CSS/JavaScript') {
    return `<!-- ${skill.name} -->\n<!-- Choose the learning goal that best matches this checkpoint. -->`
  }

  return `// ${skill.name}\n// Choose the learning goal that best matches this checkpoint.`
}

function createCoverageProblem(course, skill, skillIndex) {
  const id = `coverage-${course.id}-${skill.id}`
  const distractors = course.skills
    .filter((courseSkill) => courseSkill.id !== skill.id)
    .slice(0, 3)
    .map((courseSkill) => courseSkill.goal)
  const correctIndex = skillIndex % 4
  const labels = [...distractors]
  labels.splice(correctIndex, 0, skill.goal)
  const choices = labels.map((label, choiceIndex) => ({
    id: `${id}-choice-${choiceIndex + 1}`,
    label,
  }))
  const codeSnippet = codeCommentFor(course, skill)

  return {
    id,
    skillId: skill.id,
    difficulty: DIFFICULTIES[skillIndex] ?? 'Steady',
    prompt: `Which practice goal best matches the ${skill.name} checkpoint?`,
    ...(codeSnippet ? { codeSnippet } : {}),
    choices,
    answer: choices[correctIndex].id,
    hints: [
      `Focus on what a student should be able to do in ${skill.name}.`,
      `Look for the choice that matches this target: ${skill.goal}`,
    ],
    explanation: `${skill.name} focuses on this goal: ${skill.goal}`,
  }
}

export function ensureFallbackCoverage(problemSets, courses) {
  return Object.fromEntries(courses.map((course) => {
    const existingProblems = problemSets[course.id] ?? []
    const problemsBySkill = new Map(
      existingProblems.map((problem) => [problem.skillId, problem]),
    )
    const completeCoverage = course.skills.map((skill, skillIndex) => (
      problemsBySkill.get(skill.id) ?? createCoverageProblem(course, skill, skillIndex)
    ))

    return [course.id, completeCoverage]
  }))
}

