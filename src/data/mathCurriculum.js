const skill = (id, name, goal) => ({ id, name, goal })

export const mathCourses = [
  {
    id: 'algebra-1',
    name: 'Algebra 1',
    level: 'Foundation',
    summary: 'Build confidence with equations, functions, and quadratics.',
    accent: '#5b5ce2',
    skills: [
      skill('linear-equations', 'Linear equations', 'Solve one-step and multi-step equations.'),
      skill('systems-of-equations', 'Systems of equations', 'Use graphing, substitution, and elimination.'),
      skill('exponents', 'Exponents', 'Apply exponent rules and scientific notation.'),
      skill('factoring', 'Factoring', 'Factor expressions and recognize common patterns.'),
      skill('quadratic-equations', 'Quadratic equations', 'Solve quadratics using multiple methods.'),
    ],
  },
  {
    id: 'geometry',
    name: 'Geometry',
    level: 'Shapes & proof',
    summary: 'Connect visual reasoning to measurement and proof.',
    accent: '#0f8b8d',
    skills: [
      skill('angles-and-triangles', 'Angles and triangles', 'Use angle relationships and triangle properties.'),
      skill('congruence-and-similarity', 'Congruence and similarity', 'Compare figures and justify relationships.'),
      skill('coordinate-geometry', 'Coordinate geometry', 'Analyze figures on the coordinate plane.'),
      skill('circles', 'Circles', 'Work with arcs, chords, angles, and equations.'),
      skill('area-and-volume', 'Area and volume', 'Measure two- and three-dimensional figures.'),
    ],
  },
  {
    id: 'algebra-2',
    name: 'Algebra 2',
    level: 'Intermediate',
    summary: 'Explore advanced functions, logarithms, and sequences.',
    accent: '#d15c2f',
    skills: [
      skill('polynomial-functions', 'Polynomial functions', 'Analyze, graph, and solve polynomial functions.'),
      skill('radicals-and-rationals', 'Radicals and rational expressions', 'Simplify and solve with restrictions.'),
      skill('exponential-functions', 'Exponential functions', 'Model growth, decay, and compound change.'),
      skill('logarithms', 'Logarithms', 'Rewrite and solve logarithmic equations.'),
      skill('sequences-and-series', 'Sequences and series', 'Recognize and calculate common patterns.'),
    ],
  },
  {
    id: 'precalculus',
    name: 'Precalculus',
    level: 'Advanced',
    summary: 'Prepare for calculus through functions and trigonometry.',
    accent: '#b33c86',
    skills: [
      skill('function-transformations', 'Function transformations', 'Translate, reflect, stretch, and combine functions.'),
      skill('trigonometric-functions', 'Trigonometric functions', 'Use the unit circle and graph periodic behavior.'),
      skill('trigonometric-identities', 'Trigonometric identities', 'Verify identities and solve equations.'),
      skill('vectors', 'Vectors', 'Represent magnitude, direction, and motion.'),
      skill('intro-to-limits', 'Introduction to limits', 'Describe how functions behave near a point.'),
    ],
  },
  {
    id: 'calculus-1',
    name: 'Calculus 1',
    level: 'College/AP',
    summary: 'Understand change through limits, derivatives, and integrals.',
    accent: '#1670b8',
    skills: [
      skill('limits', 'Limits and continuity', 'Evaluate limits and determine continuity.'),
      skill('derivative-rules', 'Derivative rules', 'Differentiate common and composite functions.'),
      skill('derivative-applications', 'Applications of derivatives', 'Analyze motion, rates, and optimization.'),
      skill('antiderivatives', 'Antiderivatives', 'Reverse differentiation and use initial values.'),
      skill('definite-integrals', 'Definite integrals', 'Connect accumulation, area, and the FTC.'),
    ],
  },
  {
    id: 'calculus-2',
    name: 'Calculus 2',
    level: 'College',
    summary: 'Go deeper with integration, series, and polar curves.',
    accent: '#7b4bb7',
    skills: [
      skill('integration-techniques', 'Integration techniques', 'Choose substitution, parts, and other strategies.'),
      skill('improper-integrals', 'Improper integrals', 'Evaluate integrals with infinite behavior.'),
      skill('sequences', 'Sequences', 'Determine convergence and long-term behavior.'),
      skill('infinite-series', 'Infinite series', 'Select convergence tests and estimate sums.'),
      skill('parametric-and-polar', 'Parametric and polar functions', 'Analyze curves using alternative coordinates.'),
    ],
  },
].map((course) => ({
  ...course,
  subject: 'Math',
  answerType: 'numeric',
}))

export function getCourseById(courseId) {
  return mathCourses.find((course) => course.id === courseId) ?? mathCourses[0]
}
