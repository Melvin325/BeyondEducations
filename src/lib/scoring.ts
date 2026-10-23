import { RiasecType } from '../data/questions';
import { Course, ALL_COURSES } from '../data/courses';
import { PROFILE_PAIRS, ProfilePair } from '../data/profilePairs';
import { LeadScoreBreakdown, LeadPriority } from '../data/demoLeads';

export interface QuizAnswers {
  // Part A (1-12)
  [key: number]: any;
  // Part B
  bestSubjects?: string[]; // Q13
  workPreference?: string; // Q14: 'alone' | 'team' | 'leading'
  careerValue?: string; // Q15: 'security' | 'income' | 'creativity' | 'helping'
  heavyMathsComfort?: string; // Q16: 'yes' | 'somewhat' | 'not_really'
  // Part C
  stream?: string; // Q17: 'Science (PCM)' | 'Science (PCB)' | 'Science (PCMB)' | 'Commerce' | 'Arts-Humanities'
  status12?: string; // Q18: 'appearing' | 'passed_out' | 'gap_year'
  percentage?: string; // Q19: 'below_60' | '60_75' | '75_90' | 'above_90'
  entranceExams?: string[]; // Q19
  budget?: string; // Q20: 'under_3' | '3_8' | '8_15' | 'above_15'
  preferredLocation?: string; // Q21
  relocate?: string; // Q21: 'yes' | 'no'
  worry?: string; // Q22: 'fees' | 'course_choice' | 'admissions' | 'placements'
  decisionTime?: string; // Q23: 'this_month' | '3_months' | 'exploring'
}

export interface ScoredCourse {
  course: Course;
  score: number;
  budgetStatus: 'within' | 'slightly_above' | 'above';
  budgetStatusLabelKey: string;
}

export interface QuizResult {
  riasecScores: Record<RiasecType, number>;
  topTypes: [RiasecType, RiasecType];
  profileCode: string;
  profile: ProfilePair;
  topCourses: ScoredCourse[];
}

export function calculateRiasecScores(answers: QuizAnswers): {
  rawScores: Record<RiasecType, number>;
  adjustedScores: Record<RiasecType, number>;
} {
  const raw: Record<RiasecType, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };

  // Part A scoring
  raw.R = (Number(answers[1]) || 3) + (Number(answers[7]) || 3);
  raw.I = (Number(answers[2]) || 3) + (Number(answers[8]) || 3);
  raw.A = (Number(answers[3]) || 3) + (Number(answers[9]) || 3);
  raw.S = (Number(answers[4]) || 3) + (Number(answers[10]) || 3);
  raw.E = (Number(answers[5]) || 3) + (Number(answers[11]) || 3);
  raw.C = (Number(answers[6]) || 3) + (Number(answers[12]) || 3);

  const adjusted = { ...raw };

  // Part B tie-breaking and style boosts
  if (answers.careerValue === 'creativity') adjusted.A += 0.5;
  if (answers.careerValue === 'helping') adjusted.S += 0.5;
  if (answers.careerValue === 'income') adjusted.E += 0.5;
  if (answers.careerValue === 'security') adjusted.C += 0.5;

  if (answers.workPreference === 'leading') adjusted.E += 0.5;
  if (answers.workPreference === 'alone') {
    adjusted.I += 0.3;
    adjusted.A += 0.3;
  }

  // Subject boosts
  const subjects = answers.bestSubjects || [];
  if (subjects.includes('Maths') || subjects.includes('Physics') || subjects.includes('Computer Science')) {
    adjusted.I += 0.4;
    adjusted.R += 0.3;
  }
  if (subjects.includes('Biology')) {
    adjusted.I += 0.3;
    adjusted.S += 0.3;
  }
  if (subjects.includes('Art/Design') || subjects.includes('English')) {
    adjusted.A += 0.5;
  }
  if (subjects.includes('Accountancy') || subjects.includes('Business Studies') || subjects.includes('Economics')) {
    adjusted.C += 0.4;
    adjusted.E += 0.4;
  }
  if (subjects.includes('History/PolScience')) {
    adjusted.S += 0.3;
    adjusted.I += 0.2;
  }

  return { rawScores: raw, adjustedScores: adjusted };
}

export function determineProfileCode(adjustedScores: Record<RiasecType, number>): [RiasecType, RiasecType] {
  const sorted = (Object.keys(adjustedScores) as RiasecType[]).sort((a, b) => {
    return adjustedScores[b] - adjustedScores[a];
  });
  return [sorted[0], sorted[1]];
}

export function getBudgetLimitLakhs(budgetBand: string = 'under_3'): number {
  switch (budgetBand) {
    case 'under_3':
      return 3.0;
    case '3_8':
      return 8.0;
    case '8_15':
      return 15.0;
    case 'above_15':
      return 99.0;
    default:
      return 8.0;
  }
}

export function matchCourses(
  answers: QuizAnswers,
  topTypes: [RiasecType, RiasecType]
): ScoredCourse[] {
  const stream = answers.stream || 'Commerce';
  const budgetLimit = getBudgetLimitLakhs(answers.budget);
  const comfortableWithMaths = answers.heavyMathsComfort !== 'not_really';

  // 1. Strict stream eligibility filter
  const eligibleCourses = ALL_COURSES.filter((course) => {
    return course.eligibleStreams.includes(stream);
  });

  // 2. Score and rank courses
  const scored = eligibleCourses.map((course) => {
    let score = 0;

    // Match top 1 RIASEC type (+5 if primary, +3 if secondary)
    if (course.primaryRiasec[0] === topTypes[0]) score += 5;
    else if (course.primaryRiasec.includes(topTypes[0])) score += 3.5;

    // Match top 2 RIASEC type (+3 if primary, +2 if secondary)
    if (course.primaryRiasec[0] === topTypes[1]) score += 3;
    else if (course.primaryRiasec.includes(topTypes[1])) score += 2;

    // Heavy Maths penalty if student answered "not really"
    if (course.heavyMaths && !comfortableWithMaths) {
      score -= 8; // Heavy demotion
    }

    // Budget status
    const minFee = course.feeRangeLakh[0];
    let budgetStatus: 'within' | 'slightly_above' | 'above' = 'within';
    let budgetStatusLabelKey = 'report.budget_within';

    if (minFee <= budgetLimit) {
      budgetStatus = 'within';
      budgetStatusLabelKey = 'report.budget_within';
      score += 2; // slight boost for affordability
    } else if (minFee <= budgetLimit * 1.25) {
      budgetStatus = 'slightly_above';
      budgetStatusLabelKey = 'report.budget_slightly_above';
      score -= 1;
    } else {
      budgetStatus = 'above';
      budgetStatusLabelKey = 'report.budget_above';
      score -= 3;
    }

    return {
      course,
      score,
      budgetStatus,
      budgetStatusLabelKey,
    };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top 4 (or 3-5)
  return scored.slice(0, 4);
}

export function evaluateQuiz(answers: QuizAnswers): QuizResult {
  const { rawScores, adjustedScores } = calculateRiasecScores(answers);
  const topTypes = determineProfileCode(adjustedScores);
  const code = `${topTypes[0]}${topTypes[1]}`;
  const profile = PROFILE_PAIRS[code] || PROFILE_PAIRS['IE'];
  const topCourses = matchCourses(answers, topTypes);

  return {
    riasecScores: rawScores,
    topTypes,
    profileCode: code,
    profile,
    topCourses,
  };
}

// Calculate Lead Score & Priority
export function calculateLeadScore(
  answers: QuizAnswers,
  parentPhone?: string
): { breakdown: LeadScoreBreakdown; totalScore: number; priority: LeadPriority } {
  let status12Score = 0;
  if (answers.status12 === 'passed_out') {
    status12Score = 3;
  }

  let decisionTimeScore = 0;
  if (answers.decisionTime === 'this_month') {
    decisionTimeScore = 3;
  } else if (answers.decisionTime === '3_months') {
    decisionTimeScore = 1;
  }

  const parentPhoneScore = parentPhone && parentPhone.trim().length >= 10 ? 2 : 0;

  let budgetScore = 0;
  if (answers.budget === '8_15' || answers.budget === 'above_15') {
    budgetScore = 2;
  } else if (answers.budget === '3_8') {
    budgetScore = 1;
  }

  const worryScore = answers.worry === 'course_choice' ? 2 : 0;
  const completionScore = 2; // completed all required questions to get teaser/report

  const total =
    status12Score +
    decisionTimeScore +
    parentPhoneScore +
    budgetScore +
    worryScore +
    completionScore;

  let priority: LeadPriority = 'Cold';
  if (total >= 8) {
    priority = 'Hot';
  } else if (total >= 5) {
    priority = 'Warm';
  }

  return {
    breakdown: {
      status12Score,
      decisionTimeScore,
      parentPhoneScore,
      budgetScore,
      worryScore,
      completionScore,
      total,
    },
    totalScore: total,
    priority,
  };
}
