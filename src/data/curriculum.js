import { mathCourses } from './mathCurriculum.js'
import { expandedCourses } from './expandedCurriculum.js'

export {
  additionalLanguageCourses,
  advancedCodingCourses,
  advancedEnglishCourses,
  artsCourses,
  expandedCourses,
  expandedScienceCourses,
  lifeSkillsCourses,
  socialScienceCourses,
  supplementalMathCourses,
  testPrepCourses,
} from './expandedCurriculum.js'

const skill = (id, name, goal) => ({ id, name, goal })

export const biologyCourses = [
  {
    id: 'biology',
    name: 'Biology',
    subject: 'Science',
    answerType: 'multiple-choice',
    level: 'High school',
    summary: 'Explore cells, genetics, energy, evolution, and ecosystems.',
    accent: '#21856b',
    skills: [
      skill('cell-structure', 'Cell structure', 'Connect organelles to the jobs cells perform.'),
      skill('genetics', 'Genetics and inheritance', 'Predict how traits pass from parents to offspring.'),
      skill('cellular-energy', 'Cellular energy', 'Explain photosynthesis and cellular respiration.'),
      skill('evolution', 'Evolution', 'Use evidence to explain changes in populations.'),
      skill('ecology', 'Ecology', 'Trace matter, energy, and interactions in ecosystems.'),
    ],
  },
]

export const codingCourses = [
  {
    id: 'python-foundations',
    name: 'Python Foundations',
    subject: 'Computer Science',
    answerType: 'multiple-choice',
    promptStyle: 'code',
    language: 'Python',
    level: 'Beginner',
    summary: 'Trace programs, find bugs, and build core Python reasoning.',
    accent: '#3978a8',
    skills: [
      skill('python-variables', 'Variables and expressions', 'Track values and evaluate Python expressions.'),
      skill('python-conditionals', 'Conditionals', 'Follow decisions created by if, elif, and else.'),
      skill('python-loops', 'Loops', 'Trace repetition and update values across iterations.'),
      skill('python-functions', 'Functions', 'Connect parameters, return values, and reusable logic.'),
      skill('python-lists-debugging', 'Lists and debugging', 'Inspect collections and repair common mistakes.'),
    ],
  },
]

export const additionalScienceCourses = [
  {
    id: 'chemistry',
    name: 'Chemistry',
    subject: 'Science',
    answerType: 'multiple-choice',
    level: 'High school',
    summary: 'Connect atoms and bonds to reactions, energy, and matter.',
    accent: '#397f8f',
    skills: [
      skill('chem-atomic-structure', 'Atomic structure', 'Use particles and periodic patterns to describe atoms.'),
      skill('chem-bonding', 'Chemical bonding', 'Compare ionic, covalent, and metallic bonding.'),
      skill('chem-reactions', 'Reactions and stoichiometry', 'Balance reactions and reason with mole ratios.'),
      skill('chem-acids-bases', 'Acids and bases', 'Interpret pH and acid-base behavior.'),
      skill('chem-thermochemistry', 'Thermochemistry', 'Track energy absorbed and released by reactions.'),
    ],
  },
  {
    id: 'physics',
    name: 'Physics',
    subject: 'Science',
    answerType: 'multiple-choice',
    level: 'High school',
    summary: 'Reason about motion, forces, energy, waves, and electricity.',
    accent: '#4968b2',
    skills: [
      skill('physics-motion', 'Motion', 'Connect position, velocity, and acceleration.'),
      skill('physics-forces', 'Forces', 'Use Newton’s laws to explain changes in motion.'),
      skill('physics-energy', 'Energy and momentum', 'Track conserved quantities through interactions.'),
      skill('physics-waves', 'Waves', 'Relate frequency, wavelength, speed, and sound.'),
      skill('physics-electricity', 'Electricity', 'Analyze charge, current, voltage, and circuits.'),
    ],
  },
]

export const historyCourses = [
  {
    id: 'us-history',
    name: 'U.S. History',
    subject: 'History',
    answerType: 'multiple-choice',
    level: 'High school',
    summary: 'Trace American institutions, conflicts, reforms, and social change.',
    accent: '#a55448',
    skills: [
      skill('ush-founding', 'Founding and Constitution', 'Connect founding debates to the new government.'),
      skill('ush-civil-war', 'Expansion and Civil War', 'Explain sectional conflict and emancipation.'),
      skill('ush-industrialization', 'Industrialization and reform', 'Analyze growth, inequality, and Progressive responses.'),
      skill('ush-global-role', 'World wars and Cold War', 'Trace the expanding global role of the United States.'),
      skill('ush-civil-rights', 'Civil rights and modern America', 'Evaluate movements that expanded rights and citizenship.'),
    ],
  },
  {
    id: 'world-history',
    name: 'World History',
    subject: 'History',
    answerType: 'multiple-choice',
    level: 'High school',
    summary: 'Follow civilizations, exchange, revolutions, and global connections.',
    accent: '#9b6635',
    skills: [
      skill('world-civilizations', 'Early civilizations', 'Compare how geography shaped early societies.'),
      skill('world-networks', 'Empires and exchange', 'Trace ideas and goods across regional networks.'),
      skill('world-renaissance', 'Renaissance and exploration', 'Connect new ideas to expanding global contact.'),
      skill('world-revolutions', 'Revolutions and industry', 'Explain political and economic transformation.'),
      skill('world-modern', 'Global conflict and the modern world', 'Analyze war, decolonization, and globalization.'),
    ],
  },
  {
    id: 'government-civics',
    name: 'Government & Civics',
    subject: 'History',
    answerType: 'multiple-choice',
    level: 'Civics',
    summary: 'Understand constitutional power, rights, elections, and participation.',
    accent: '#6f5a9b',
    skills: [
      skill('gov-principles', 'Constitutional principles', 'Apply federalism, separation of powers, and rule of law.'),
      skill('gov-branches-rights', 'Branches and civil liberties', 'Connect institutions to checks, balances, and rights.'),
      skill('gov-elections', 'Elections and participation', 'Explain representation, voting, and civic action.'),
      skill('gov-policy', 'Public policy', 'Trace how institutions turn public priorities into policy.'),
      skill('gov-comparison', 'Comparative government', 'Compare democratic and authoritarian systems.'),
    ],
  },
  {
    id: 'economics',
    name: 'Economics',
    subject: 'History',
    answerType: 'multiple-choice',
    level: 'Social science',
    summary: 'Use incentives and data to understand markets and national economies.',
    accent: '#4d8156',
    skills: [
      skill('econ-scarcity', 'Scarcity and opportunity cost', 'Explain choices made with limited resources.'),
      skill('econ-supply-demand', 'Supply and demand', 'Predict how prices and quantities respond to change.'),
      skill('econ-markets', 'Market structures', 'Compare competition, monopoly, and firm behavior.'),
      skill('econ-macro', 'Macroeconomic indicators', 'Interpret inflation, unemployment, and economic growth.'),
      skill('econ-policy', 'Fiscal and monetary policy', 'Connect policy choices to economic outcomes.'),
    ],
  },
]

export const englishCourses = [
  {
    id: 'english-language-literature',
    name: 'English Language & Literature',
    subject: 'English',
    answerType: 'multiple-choice',
    level: 'High school',
    summary: 'Strengthen grammar, close reading, analysis, evidence, and rhetoric.',
    accent: '#a34e7d',
    skills: [
      skill('english-grammar', 'Grammar and style', 'Choose clear, correct, and purposeful language.'),
      skill('english-reading', 'Reading comprehension', 'Infer meaning from details and context.'),
      skill('english-analysis', 'Literary analysis', 'Interpret imagery, structure, character, and theme.'),
      skill('english-evidence', 'Evidence-based writing', 'Support claims with relevant textual evidence.'),
      skill('english-rhetoric', 'Rhetoric and argument', 'Evaluate claims, reasoning, and persuasive choices.'),
    ],
  },
]

export const worldLanguageCourses = [
  {
    id: 'spanish-foundations',
    name: 'Spanish Foundations',
    subject: 'World Languages',
    answerType: 'multiple-choice',
    level: 'Beginner',
    summary: 'Build practical vocabulary, grammar, reading, and communication.',
    accent: '#c37432',
    skills: [
      skill('spanish-vocabulary', 'Everyday vocabulary', 'Recognize common words for people, places, and routines.'),
      skill('spanish-verbs', 'Present-tense verbs', 'Conjugate frequent regular and irregular verbs.'),
      skill('spanish-sentences', 'Sentence structure', 'Build clear statements, questions, and descriptions.'),
      skill('spanish-reading', 'Reading comprehension', 'Use context to understand short passages.'),
      skill('spanish-communication', 'Everyday communication', 'Choose language appropriate to common situations.'),
    ],
  },
]

export const allCourses = [
  ...mathCourses,
  ...biologyCourses,
  ...additionalScienceCourses,
  ...historyCourses,
  ...englishCourses,
  ...worldLanguageCourses,
  ...codingCourses,
  ...expandedCourses,
]

export function getCourseById(courseId) {
  return allCourses.find((course) => course.id === courseId) ?? allCourses[0]
}
