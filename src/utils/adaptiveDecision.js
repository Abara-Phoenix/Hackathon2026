function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

function successEvidence(misses, hintsUsed) {
  const attemptSignal = misses > 0
    ? `Correct after ${pluralize(misses, 'retry', 'retries')}`
    : 'Correct on the first attempt'
  const hintSignal = hintsUsed > 0
    ? pluralize(hintsUsed, 'hint revealed')
    : 'No hints used'

  return `${attemptSignal} • ${hintSignal}`
}

export function buildAdaptiveDecision({
  correct,
  isLastProblem,
  currentSkillName,
  nextSkillName,
  currentDifficulty,
  nextDifficulty,
  misses = 0,
  hintsUsed = 0,
}) {
  if (!correct) {
    return {
      tone: 'review',
      title: `Stay on ${currentSkillName}`,
      message: 'This attempt shows the skill needs more practice, so SolvePath keeps the same concept active and offers progressively stronger hints.',
      evidence: `${pluralize(misses, 'missed attempt')} • ${hintsUsed > 0 ? pluralize(hintsUsed, 'hint revealed') : 'Hint support available'}`,
      routeFrom: currentDifficulty,
      routeTo: currentDifficulty,
    }
  }

  if (isLastProblem) {
    return {
      tone: 'complete',
      title: `Save ${currentSkillName} mastery`,
      message: 'The final demo skill is complete, so SolvePath saves this result and prepares an updated session summary.',
      evidence: successEvidence(misses, hintsUsed),
      routeFrom: currentDifficulty,
      routeTo: 'Session summary',
    }
  }

  return {
    tone: 'advance',
    title: `Advance to ${nextSkillName}`,
    message: `${currentSkillName} is now mastered, so the next problem targets ${nextSkillName} at ${nextDifficulty.toLowerCase()} difficulty.`,
    evidence: successEvidence(misses, hintsUsed),
    routeFrom: currentDifficulty,
    routeTo: nextDifficulty,
  }
}
