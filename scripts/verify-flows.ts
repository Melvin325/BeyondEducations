import { evaluateQuiz, calculateLeadScore, QuizAnswers } from '../src/lib/scoring';
import { ALL_COURSES } from '../src/data/courses';
import { PROFILE_PAIRS } from '../src/data/profilePairs';
import en from '../src/locales/en.json';
import kn from '../src/locales/kn.json';
import ta from '../src/locales/ta.json';
import ml from '../src/locales/ml.json';

console.log('====================================================');
console.log('RUNNING BEYONDUCATONS AUTOMATED VERIFICATION SUITE');
console.log('====================================================\n');

let failedTests = 0;

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    failedTests++;
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

// -------------------------------------------------------------
// TEST 1: Science (PCM) Profile Flow
// -------------------------------------------------------------
console.log('--- TEST 1: Science (PCM) Answers ---');
const pcmAnswers: QuizAnswers = {
  1: 5, 2: 5, 3: 2, 4: 3, 5: 3, 6: 4, 7: 5, 8: 5, 9: 3, 10: 3, 11: 4, 12: 4,
  bestSubjects: ['Maths', 'Physics', 'Computer Science'],
  workPreference: 'team',
  careerValue: 'income',
  heavyMathsComfort: 'yes',
  stream: 'Science (PCM)',
  status12: 'passed_out',
  percentage: '75_90',
  entranceExams: ['KCET', 'JEE'],
  budget: '8_15',
  preferredLocation: 'bengaluru',
  relocate: 'no',
  worry: 'course_choice',
  decisionTime: 'this_month',
};

const pcmResult = evaluateQuiz(pcmAnswers);
assert(pcmResult.profileCode.includes('I') || pcmResult.profileCode.includes('R'), `PCM profile contains I or R (got ${pcmResult.profileCode})`);

const pcmCourseIds = pcmResult.topCourses.map((c) => c.course.id);
assert(pcmCourseIds.includes('btech-cse') || pcmCourseIds.includes('bsc-data-science'), `PCM top courses include tech/engineering (${pcmCourseIds.join(', ')})`);
assert(!pcmCourseIds.includes('mbbs'), `PCM student is NEVER recommended MBBS`);

const pcmLead = calculateLeadScore(pcmAnswers, '9845012399');
assert(pcmLead.totalScore >= 8, `PCM lead score is Hot >= 8 (got ${pcmLead.totalScore})`);
assert(pcmLead.priority === 'Hot', `PCM lead priority is Hot`);

// -------------------------------------------------------------
// TEST 2: Commerce Profile Flow
// -------------------------------------------------------------
console.log('\n--- TEST 2: Commerce Answers ---');
const commerceAnswers: QuizAnswers = {
  1: 2, 2: 3, 3: 2, 4: 3, 5: 5, 6: 5, 7: 2, 8: 3, 9: 3, 10: 4, 11: 5, 12: 5,
  bestSubjects: ['Accountancy', 'Economics', 'Business Studies'],
  workPreference: 'leading',
  careerValue: 'security',
  heavyMathsComfort: 'somewhat',
  stream: 'Commerce',
  status12: 'passed_out',
  percentage: '75_90',
  entranceExams: ['CUET'],
  budget: '3_8',
  preferredLocation: 'bengaluru',
  relocate: 'no',
  worry: 'course_choice',
  decisionTime: 'this_month',
};

const commerceResult = evaluateQuiz(commerceAnswers);
assert(commerceResult.profileCode.includes('C') || commerceResult.profileCode.includes('E'), `Commerce profile contains C or E (got ${commerceResult.profileCode})`);

const commerceCourseIds = commerceResult.topCourses.map((c) => c.course.id);
assert(commerceCourseIds.some((id) => id.startsWith('bcom') || id.startsWith('bba')), `Commerce top courses include BCom or BBA (${commerceCourseIds.join(', ')})`);
assert(!commerceCourseIds.includes('mbbs'), `Commerce student is NEVER recommended MBBS`);
assert(!commerceCourseIds.includes('btech-cse'), `Commerce student is NEVER recommended BTech CSE`);

// -------------------------------------------------------------
// TEST 3: Arts / Humanities Profile Flow
// -------------------------------------------------------------
console.log('\n--- TEST 3: Arts / Humanities Answers ---');
const artsAnswers: QuizAnswers = {
  1: 2, 2: 3, 3: 5, 4: 5, 5: 3, 6: 2, 7: 2, 8: 2, 9: 5, 10: 5, 11: 3, 12: 2,
  bestSubjects: ['English', 'Art/Design', 'History/PolScience'],
  workPreference: 'team',
  careerValue: 'creativity',
  heavyMathsComfort: 'not_really',
  stream: 'Arts-Humanities',
  status12: 'appearing',
  percentage: '60_75',
  entranceExams: ['CUET'],
  budget: '3_8',
  preferredLocation: 'bengaluru',
  relocate: 'yes',
  worry: 'course_choice',
  decisionTime: '3_months',
};

const artsResult = evaluateQuiz(artsAnswers);
assert(artsResult.profileCode.includes('A') || artsResult.profileCode.includes('S'), `Arts profile contains A or S (got ${artsResult.profileCode})`);

const artsCourseIds = artsResult.topCourses.map((c) => c.course.id);
assert(artsCourseIds.some((id) => ['ba-psychology', 'ba-journalism', 'bdes', 'bfa'].includes(id)), `Arts top courses include Psychology/Design/Media (${artsCourseIds.join(', ')})`);
assert(!artsCourseIds.includes('mbbs') && !artsCourseIds.includes('btech-cse'), `Arts student NEVER recommended MBBS or BTech`);

// -------------------------------------------------------------
// TEST 4: Multi-Language Locale Key Consistency Check
// -------------------------------------------------------------
console.log('\n--- TEST 4: Multi-Language Key Completeness (EN, KN, TA, ML) ---');
const locales = { en, kn, ta, ml };

// Check all courses have translated names and why templates
for (const course of ALL_COURSES) {
  for (const [lang, loc] of Object.entries(locales)) {
    const courseKey = course.id.replace(/-/g, '_');
    const locAny = loc as any;
    const hasName = Boolean(locAny.courses?.[courseKey]?.name);
    const hasWhy = Boolean(locAny.courses?.[courseKey]?.why);
    assert(hasName && hasWhy, `Locale [${lang}] has translated name & why for course ${course.id}`);
  }
}

// Check all 30 pair configurations in PROFILE_PAIRS have valid targets in all 4 locales
for (const [code, pair] of Object.entries(PROFILE_PAIRS)) {
  for (const [lang, loc] of Object.entries(locales)) {
    const locAny = loc as any;
    // pair.nameKey is e.g. "profiles.RA.name"
    const parts = pair.nameKey.split('.');
    const hasProfile = Boolean(locAny[parts[0]]?.[parts[1]]?.[parts[2]]);
    assert(hasProfile, `Locale [${lang}] has translated archetype profile for ${pair.nameKey} (from code ${code})`);
  }
}

console.log('\n====================================================');
if (failedTests === 0) {
  console.log('🎉 ALL AUTOMATED TESTS PASSED WITH 100% SUCCESS!');
} else {
  console.error(`💥 ${failedTests} TESTS FAILED.`);
  process.exit(1);
}
console.log('====================================================\n');
