import test from 'node:test'
import assert from 'node:assert/strict'
import {
  advanceSkillCheckpoint,
  checkpointCountsFor,
  completedSkillsFor,
  masteryFor,
} from '../src/utils/courseProgress.js'

const course = {
  skills: [
    { id: 'one' },
    { id: 'two' },
    { id: 'three' },
    { id: 'four' },
    { id: 'five' },
  ],
}

test('one completed checkpoint represents one fifteenth of a five-unit course', () => {
  const progress = { skillCheckpointCounts: { one: 1 } }

  assert.equal(masteryFor(course, progress), 7)
  assert.deepEqual(completedSkillsFor(course, progress), [])
})

test('a skill is mastered after its third checkpoint', () => {
  const progress = { skillCheckpointCounts: { one: 2 } }
  const updated = advanceSkillCheckpoint(course, progress, 'one')

  assert.equal(updated.skillCheckpointCounts.one, 3)
  assert.equal(updated.skillMastered, true)
  assert.deepEqual(updated.completedSkillIds, ['one'])
  assert.equal(masteryFor(course, updated), 20)
})

test('legacy completed skills migrate to three checkpoints without losing progress', () => {
  const progress = { completedSkillIds: ['two'] }

  assert.equal(checkpointCountsFor(course, progress).two, 3)
  assert.equal(masteryFor(course, progress), 20)
})

test('checkpoint progress is capped at three per skill', () => {
  const progress = { skillCheckpointCounts: { one: 3 }, completedSkillIds: ['one'] }
  const updated = advanceSkillCheckpoint(course, progress, 'one')

  assert.equal(updated.skillCheckpointCounts.one, 3)
  assert.equal(updated.checkpointAdvanced, false)
  assert.equal(updated.skillMastered, false)
})
