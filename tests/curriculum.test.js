import test from 'node:test'
import assert from 'node:assert/strict'
import { demoProblems, getProblemsForCourse } from '../src/data/demoProblems.js'
import { getCourseById, mathCourses } from '../src/data/mathCurriculum.js'
import { isAnswerCorrect } from '../src/utils/answerChecking.js'

const expectedCourseIds = [
  'algebra-1',
  'geometry',
  'algebra-2',
  'precalculus',
  'calculus-1',
  'calculus-2',
]

test('the demo includes the complete Algebra 1 through Calculus 2 path', () => {
  assert.deepEqual(mathCourses.map((course) => course.id), expectedCourseIds)

  for (const course of mathCourses) {
    assert.equal(course.skills.length, 5, `${course.name} should have five mastery skills`)
    assert.equal(new Set(course.skills.map((skill) => skill.id)).size, course.skills.length)
  }
})

test('every course has a valid three-question fallback session', () => {
  const problemIds = new Set()

  for (const course of mathCourses) {
    const problems = demoProblems[course.id]
    const skillIds = new Set(course.skills.map((skill) => skill.id))

    assert.equal(problems.length, 3, `${course.name} should have three seeded questions`)
    assert.deepEqual(problems.map((problem) => problem.difficulty), ['Warm-up', 'Steady', 'Stretch'])

    for (const problem of problems) {
      assert.equal(problemIds.has(problem.id), false, `duplicate problem id: ${problem.id}`)
      problemIds.add(problem.id)
      assert.equal(skillIds.has(problem.skillId), true, `${problem.id} references an unknown skill`)
      assert.equal(Number.isFinite(problem.answer), true)
      assert.equal(problem.hints.length, 2)
      assert.equal(problem.prompt.length > 0, true)
      assert.equal(problem.explanation.length > 0, true)
      assert.equal(isAnswerCorrect(String(problem.answer), problem.answer), true)
    }
  }
})

test('unknown course lookups fall back to Algebra 1', () => {
  assert.equal(getCourseById('missing-course').id, 'algebra-1')
  assert.equal(getProblemsForCourse('missing-course'), demoProblems['algebra-1'])
})
