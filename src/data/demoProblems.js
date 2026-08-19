export const demoProblems = {
  'algebra-1': [
    {
      id: 'a1-linear-warmup',
      skillId: 'linear-equations',
      difficulty: 'Warm-up',
      prompt: 'Solve for x: 3(x − 2) = 12',
      answer: 6,
      hints: [
        'Start by undoing the multiplication by 3.',
        'Divide both sides by 3, then add 2 to both sides.',
      ],
      explanation: 'Dividing by 3 gives x − 2 = 4. Adding 2 gives x = 6.',
    },
    {
      id: 'a1-system-steady',
      skillId: 'systems-of-equations',
      difficulty: 'Steady',
      prompt: 'If x + y = 10 and x − y = 2, what is x?',
      answer: 6,
      hints: [
        'Add the two equations so the y terms cancel.',
        'Adding gives 2x = 12. Divide both sides by 2.',
      ],
      explanation: 'Adding the equations gives 2x = 12, so x = 6.',
    },
    {
      id: 'a1-exponents-stretch',
      skillId: 'exponents',
      difficulty: 'Stretch',
      prompt: 'Solve for x: 2³ · 2ˣ = 2⁷',
      answer: 4,
      hints: [
        'When multiplying powers with the same base, add the exponents.',
        'Rewrite the left side as 2³⁺ˣ, then set the exponents equal.',
      ],
      explanation: 'The exponent rule gives 2³⁺ˣ = 2⁷, so 3 + x = 7 and x = 4.',
    },
  ],
  geometry: [
    {
      id: 'geo-angles-warmup',
      skillId: 'angles-and-triangles',
      difficulty: 'Warm-up',
      prompt: 'A triangle has angles of 50° and 60°. What is the third angle?',
      answer: 70,
      hints: [
        'The interior angles of a triangle add to 180°.',
        'Subtract 50° and 60° from 180°.',
      ],
      explanation: 'The third angle is 180° − 50° − 60° = 70°.',
    },
    {
      id: 'geo-similarity-steady',
      skillId: 'congruence-and-similarity',
      difficulty: 'Steady',
      prompt: 'Similar triangles have corresponding sides 4 and 6. If the matching larger side is 9, what is the smaller side?',
      answer: 6,
      hints: [
        'Set up the proportion 4/6 = x/9.',
        'Cross multiply: 6x = 36.',
      ],
      explanation: 'From 4/6 = x/9, cross multiplication gives 6x = 36, so x = 6.',
    },
    {
      id: 'geo-coordinate-stretch',
      skillId: 'coordinate-geometry',
      difficulty: 'Stretch',
      prompt: 'What is the distance between (1, 2) and (4, 6)?',
      answer: 5,
      hints: [
        'Use the distance formula with changes of 3 and 4.',
        'Compute √(3² + 4²).',
      ],
      explanation: 'The distance is √((4−1)² + (6−2)²) = √25 = 5.',
    },
  ],
  'algebra-2': [
    {
      id: 'a2-polynomial-warmup',
      skillId: 'polynomial-functions',
      difficulty: 'Warm-up',
      prompt: 'If f(x) = x² − 3x + 2, what is f(4)?',
      answer: 6,
      hints: [
        'Substitute 4 everywhere you see x.',
        'Calculate 4² − 3(4) + 2.',
      ],
      explanation: 'f(4) = 16 − 12 + 2 = 6.',
    },
    {
      id: 'a2-radical-steady',
      skillId: 'radicals-and-rationals',
      difficulty: 'Steady',
      prompt: 'Simplify: √144 ÷ √4',
      answer: 6,
      hints: [
        'Evaluate each square root separately.',
        '√144 = 12 and √4 = 2.',
      ],
      explanation: '√144 ÷ √4 = 12 ÷ 2 = 6.',
    },
    {
      id: 'a2-exponential-stretch',
      skillId: 'exponential-functions',
      difficulty: 'Stretch',
      prompt: 'Solve for x: 2ˣ⁺¹ = 16',
      answer: 3,
      hints: [
        'Rewrite 16 as a power of 2.',
        'Since 16 = 2⁴, set x + 1 equal to 4.',
      ],
      explanation: 'Because 16 = 2⁴, x + 1 = 4 and x = 3.',
    },
  ],
  precalculus: [
    {
      id: 'precalc-transform-warmup',
      skillId: 'function-transformations',
      difficulty: 'Warm-up',
      prompt: 'The graph of y = (x − 3)² shifts y = x² how many units to the right?',
      answer: 3,
      hints: [
        'Look at the number subtracted from x inside the parentheses.',
        'The form (x − h)² shifts the graph h units right.',
      ],
      explanation: 'The value h is 3, so the graph shifts 3 units to the right.',
    },
    {
      id: 'precalc-trig-steady',
      skillId: 'trigonometric-functions',
      difficulty: 'Steady',
      prompt: 'Evaluate sin(π/2).',
      answer: 1,
      hints: [
        'Locate π/2 on the unit circle.',
        'Sine is the y-coordinate of the point on the unit circle.',
      ],
      explanation: 'At π/2, the unit-circle point is (0, 1), so sin(π/2) = 1.',
    },
    {
      id: 'precalc-identity-stretch',
      skillId: 'trigonometric-identities',
      difficulty: 'Stretch',
      prompt: 'If sin(θ) = 3/5 and θ is in Quadrant I, what is cos(θ)?',
      answer: 0.8,
      tolerance: 0.001,
      hints: [
        'Use sin²(θ) + cos²(θ) = 1.',
        'cos²(θ) = 1 − 9/25 = 16/25. Choose the positive root.',
      ],
      explanation: 'cos(θ) = √(16/25) = 4/5 = 0.8 in Quadrant I.',
    },
  ],
  'calculus-1': [
    {
      id: 'calc1-limit-warmup',
      skillId: 'limits',
      difficulty: 'Warm-up',
      prompt: 'Evaluate: lim x→2 of (x² − 4)/(x − 2)',
      answer: 4,
      hints: [
        'Factor x² − 4 as a difference of squares.',
        'Cancel x − 2, then substitute x = 2 into x + 2.',
      ],
      explanation: 'Factoring and canceling leaves x + 2, whose limit at 2 is 4.',
    },
    {
      id: 'calc1-derivative-steady',
      skillId: 'derivative-rules',
      difficulty: 'Steady',
      prompt: 'If f(x) = x³, what is f′(2)?',
      answer: 12,
      hints: [
        'Use the power rule before substituting x = 2.',
        'f′(x) = 3x².',
      ],
      explanation: 'The power rule gives f′(x) = 3x², so f′(2) = 12.',
    },
    {
      id: 'calc1-integral-stretch',
      skillId: 'definite-integrals',
      difficulty: 'Stretch',
      prompt: 'Evaluate the definite integral ∫₀² 3x² dx.',
      answer: 8,
      hints: [
        'An antiderivative of 3x² is x³.',
        'Evaluate x³ from 0 to 2.',
      ],
      explanation: 'Using the antiderivative x³ gives 2³ − 0³ = 8.',
    },
  ],
  'calculus-2': [
    {
      id: 'calc2-integration-warmup',
      skillId: 'integration-techniques',
      difficulty: 'Warm-up',
      prompt: 'Evaluate the definite integral ∫₀¹ 2x dx.',
      answer: 1,
      hints: [
        'An antiderivative of 2x is x².',
        'Evaluate x² from 0 to 1.',
      ],
      explanation: 'Using x² as the antiderivative gives 1² − 0² = 1.',
    },
    {
      id: 'calc2-improper-steady',
      skillId: 'improper-integrals',
      difficulty: 'Steady',
      prompt: 'Evaluate the improper integral ∫₁∞ 1/x² dx.',
      answer: 1,
      hints: [
        'Replace infinity with b and take the limit as b→∞.',
        'An antiderivative of x⁻² is −x⁻¹.',
      ],
      explanation: 'The limit of [−1/x] from 1 to b is 0 − (−1) = 1.',
    },
    {
      id: 'calc2-sequence-stretch',
      skillId: 'sequences',
      difficulty: 'Stretch',
      prompt: 'Find lim n→∞ of n/(n + 1).',
      answer: 1,
      hints: [
        'Divide the numerator and denominator by n.',
        'Rewrite the expression as 1/(1 + 1/n).',
      ],
      explanation: 'As n grows, 1/n approaches 0, so the limit is 1/(1 + 0) = 1.',
    },
  ],
}

export function getProblemsForCourse(courseId) {
  return demoProblems[courseId] ?? demoProblems['algebra-1']
}
