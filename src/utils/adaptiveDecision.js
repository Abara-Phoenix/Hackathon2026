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
  mastered = correct,
  skipped = false,
  isLastProblem,
  currentSkillName,
  nextSkillName,
  currentDifficulty,
  nextDifficulty,
  adaptationReason,
  misses = 0,
  hintsUsed = 0,
}) {
  if (skipped) {
    return {
      tone: 'review',
      title: isLastProblem ? `Save ${currentSkillName} for review` : `Try a new ${currentSkillName} example`,
      message: isLastProblem
        ? 'SolvePath recorded the skip without counting it as a wrong answer and added this skill to the next review path.'
        : adaptationReason ?? 'SolvePath recorded the skip without counting it as a wrong answer, then selected a fresh example at a more supportive level.',
      evidence: 'Question skipped • Review signal recorded',
      routeFrom: currentDifficulty,
      routeTo: isLastProblem ? 'Session summary' : nextDifficulty,
    }
  }

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
      title: mastered ? `Save ${currentSkillName} mastery` : `Save ${currentSkillName} progress`,
      message: mastered
        ? 'The final skill is complete, so SolvePath saves this result and prepares an updated session summary.'
        : 'The answer was correct with support, so SolvePath saves the progress and keeps this skill active for a future review.',
      evidence: successEvidence(misses, hintsUsed),
      routeFrom: currentDifficulty,
      routeTo: 'Session summary',
    }
  }

  return {
    tone: 'advance',
    title: nextSkillName === currentSkillName
      ? `Reinforce ${currentSkillName}`
      : `Advance to ${nextSkillName}`,
    message: adaptationReason
      ?? `${currentSkillName} is now mastered, so the next problem targets ${nextSkillName} at ${nextDifficulty.toLowerCase()} difficulty.`,
    evidence: successEvidence(misses, hintsUsed),
    routeFrom: currentDifficulty,
    routeTo: nextDifficulty,
  }
}
