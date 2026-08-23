import test from 'node:test'
import assert from 'node:assert/strict'
import { demoProblems, getProblemsForCourse } from '../src/data/demoProblems.js'
import {
  additionalLanguageCourses,
  advancedCodingCourses,
  advancedEnglishCourses,
  allCourses,
  artsCourses,
  biologyCourses,
  codingCourses,
  expandedCourses,
  expandedScienceCourses,
  getCourseById,
  lifeSkillsCourses,
  socialScienceCourses,
  supplementalMathCourses,
  testPrepCourses,
} from '../src/data/curriculum.js'
import { mathCourses } from '../src/data/mathCurriculum.js'
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

test('the demo includes a complete Biology mastery path', () => {
  assert.equal(biologyCourses.length, 1)
  assert.equal(biologyCourses[0].id, 'biology')
  assert.equal(biologyCourses[0].subject, 'Science')
  assert.equal(biologyCourses[0].answerType, 'multiple-choice')
  assert.equal(biologyCourses[0].skills.length, 5)
})

test('the demo includes a code-based Python mastery path', () => {
  assert.equal(codingCourses.length, 1)
  assert.equal(codingCourses[0].id, 'python-foundations')
  assert.equal(codingCourses[0].subject, 'Computer Science')
  assert.equal(codingCourses[0].promptStyle, 'code')
  assert.equal(codingCourses[0].language, 'Python')
  assert.equal(codingCourses[0].skills.length, 5)
})

test('the catalog covers the core high-school subject families', () => {
  const expectedExpandedCourseIds = [
    'chemistry',
    'physics',
    'us-history',
    'world-history',
    'government-civics',
    'economics',
    'english-language-literature',
    'spanish-foundations',
    'pre-algebra',
    'statistics-probability',
    'discrete-math-logic',
    'earth-environmental-science',
    'anatomy-physiology',
    'astronomy',
    'engineering-foundations',
    'forensic-science',
    'geography',
    'psychology',
    'sociology',
    'philosophy-ethics',
    'writing-composition',
    'ap-english-language',
    'ap-english-literature',
    'french-foundations',
    'mandarin-foundations',
    'asl-foundations',
    'ap-computer-science-a',
    'ap-computer-science-principles',
    'web-development',
    'cybersecurity-foundations',
    'data-science-foundations',
    'art-history',
    'music-theory',
    'visual-arts-design',
    'personal-finance',
    'business-entrepreneurship',
    'health-wellness',
    'career-readiness',
    'sat-prep',
    'act-prep',
  ]
  const courseIds = allCourses.map((course) => course.id)
  const subjects = new Set(allCourses.map((course) => course.subject))
  const skillIds = allCourses.flatMap((course) => course.skills.map((skill) => skill.id))

  assert.equal(allCourses.length, 48)
  assert.equal(subjects.size, 10)
  assert.equal(skillIds.length, 240)
  assert.equal(expandedCourses.length, 32)
  assert.equal(new Set(courseIds).size, allCourses.length)
  assert.equal(new Set(skillIds).size, skillIds.length)

  for (const courseId of expectedExpandedCourseIds) {
    assert.equal(courseIds.includes(courseId), true, `missing course: ${courseId}`)
  }
})

test('each expanded subject group has the intended breadth', () => {
  assert.deepEqual(
    [
      supplementalMathCourses.length,
      expandedScienceCourses.length,
      socialScienceCourses.length,
      advancedEnglishCourses.length,
      additionalLanguageCourses.length,
      advancedCodingCourses.length,
      artsCourses.length,
      lifeSkillsCourses.length,
      testPrepCourses.length,
    ],
    [3, 5, 4, 3, 3, 5, 3, 4, 2],
  )

  const javaCourse = getCourseById('ap-computer-science-a')
  assert.equal(javaCourse.name, 'AP Computer Science A — Java')
  assert.equal(javaCourse.promptStyle, 'code')
  assert.equal(javaCourse.language, 'Java')
  assert.equal(javaCourse.skills.length, 5)
})

test('every course has one reliable fallback question per roadmap skill', () => {
  const problemIds = new Set()

  for (const course of allCourses) {
    const problems = demoProblems[course.id]
    const skillIds = new Set(course.skills.map((skill) => skill.id))
    assert.equal(
      problems.length,
      course.skills.length,
      `${course.name} should have one seeded question per skill`,
    )
    assert.deepEqual(
      problems.map((problem) => problem.skillId),
      course.skills.map((skill) => skill.id),
      `${course.name} should include one seeded question per skill`,
    )
    assert.equal(problems[0].difficulty, 'Warm-up')
    assert.equal(problems.some((problem) => problem.difficulty === 'Steady'), true)
    assert.equal(problems.at(-1).difficulty, 'Stretch')

    for (const problem of problems) {
      assert.equal(problemIds.has(problem.id), false, `duplicate problem id: ${problem.id}`)
      problemIds.add(problem.id)
      assert.equal(skillIds.has(problem.skillId), true, `${problem.id} references an unknown skill`)
      assert.equal(problem.hints.length, 2)
      assert.equal(problem.prompt.length > 0, true)
      assert.equal(problem.explanation.length > 0, true)

      if (course.answerType === 'multiple-choice') {
        assert.equal(problem.choices.length, 4)
        assert.equal(new Set(problem.choices.map((choice) => choice.id)).size, 4)
        assert.equal(problem.choices.some((choice) => choice.id === problem.answer), true)
        if (course.promptStyle === 'code') {
          assert.equal(typeof problem.codeSnippet, 'string')
          assert.equal(problem.codeSnippet.length > 0, true)
        }
      } else {
        assert.equal(Number.isFinite(problem.answer), true)
        assert.equal(isAnswerCorrect(String(problem.answer), problem.answer), true)
      }
    }
  }
})

test('unknown course lookups fall back to Algebra 1', () => {
  assert.equal(getCourseById('missing-course').id, 'algebra-1')
  assert.equal(getProblemsForCourse('missing-course'), demoProblems['algebra-1'])
})
