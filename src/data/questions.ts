export type RiasecType = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export interface QuestionOption {
  value: string;
  labelKey: string;
}

export interface Question {
  id: number;
  part: 'A' | 'B' | 'C';
  type: 'rating' | 'single' | 'multi' | 'compound';
  riasecType?: RiasecType;
  titleKey: string;
  subtitleKey?: string;
  options?: QuestionOption[];
  // For compound questions
  subFields?: {
    key: string;
    labelKey: string;
    type: 'single' | 'multi';
    options: QuestionOption[];
  }[];
}

export const QUIZ_QUESTIONS: Question[] = [
  // PART A: Interests (12 questions rated 1-5, "Not me" to "Very me")
  {
    id: 1,
    part: 'A',
    type: 'rating',
    riasecType: 'R',
    titleKey: 'questions.q1.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 2,
    part: 'A',
    type: 'rating',
    riasecType: 'I',
    titleKey: 'questions.q2.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 3,
    part: 'A',
    type: 'rating',
    riasecType: 'A',
    titleKey: 'questions.q3.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 4,
    part: 'A',
    type: 'rating',
    riasecType: 'S',
    titleKey: 'questions.q4.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 5,
    part: 'A',
    type: 'rating',
    riasecType: 'E',
    titleKey: 'questions.q5.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 6,
    part: 'A',
    type: 'rating',
    riasecType: 'C',
    titleKey: 'questions.q6.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 7,
    part: 'A',
    type: 'rating',
    riasecType: 'R',
    titleKey: 'questions.q7.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 8,
    part: 'A',
    type: 'rating',
    riasecType: 'I',
    titleKey: 'questions.q8.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 9,
    part: 'A',
    type: 'rating',
    riasecType: 'A',
    titleKey: 'questions.q9.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 10,
    part: 'A',
    type: 'rating',
    riasecType: 'S',
    titleKey: 'questions.q10.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 11,
    part: 'A',
    type: 'rating',
    riasecType: 'E',
    titleKey: 'questions.q11.title',
    subtitleKey: 'questions.rating_hint',
  },
  {
    id: 12,
    part: 'A',
    type: 'rating',
    riasecType: 'C',
    titleKey: 'questions.q12.title',
    subtitleKey: 'questions.rating_hint',
  },

  // PART B: Strengths and Work Style
  {
    id: 13,
    part: 'B',
    type: 'multi',
    titleKey: 'questions.q13.title',
    subtitleKey: 'questions.q13.subtitle',
    options: [
      { value: 'Maths', labelKey: 'subjects.maths' },
      { value: 'Physics', labelKey: 'subjects.physics' },
      { value: 'Chemistry', labelKey: 'subjects.chemistry' },
      { value: 'Biology', labelKey: 'subjects.biology' },
      { value: 'Accountancy', labelKey: 'subjects.accountancy' },
      { value: 'Economics', labelKey: 'subjects.economics' },
      { value: 'Business Studies', labelKey: 'subjects.business_studies' },
      { value: 'English', labelKey: 'subjects.english' },
      { value: 'History/PolScience', labelKey: 'subjects.history_polscience' },
      { value: 'Computer Science', labelKey: 'subjects.computer_science' },
      { value: 'Art/Design', labelKey: 'subjects.art_design' },
    ],
  },
  {
    id: 14,
    part: 'B',
    type: 'single',
    titleKey: 'questions.q14.title',
    options: [
      { value: 'alone', labelKey: 'work_style.alone' },
      { value: 'team', labelKey: 'work_style.team' },
      { value: 'leading', labelKey: 'work_style.leading' },
    ],
  },
  {
    id: 15,
    part: 'B',
    type: 'single',
    titleKey: 'questions.q15.title',
    options: [
      { value: 'security', labelKey: 'career_value.security' },
      { value: 'income', labelKey: 'career_value.income' },
      { value: 'creativity', labelKey: 'career_value.creativity' },
      { value: 'helping', labelKey: 'career_value.helping' },
    ],
  },
  {
    id: 16,
    part: 'B',
    type: 'single',
    titleKey: 'questions.q16.title',
    subtitleKey: 'questions.q16.subtitle',
    options: [
      { value: 'yes', labelKey: 'options.yes' },
      { value: 'somewhat', labelKey: 'options.somewhat' },
      { value: 'not_really', labelKey: 'options.not_really' },
    ],
  },

  // PART C: Practical Profile
  {
    id: 17,
    part: 'C',
    type: 'single',
    titleKey: 'questions.q17.title',
    subtitleKey: 'questions.part_c_banner',
    options: [
      { value: 'Science (PCM)', labelKey: 'streams.pcm' },
      { value: 'Science (PCB)', labelKey: 'streams.pcb' },
      { value: 'Science (PCMB)', labelKey: 'streams.pcmb' },
      { value: 'Commerce', labelKey: 'streams.commerce' },
      { value: 'Arts-Humanities', labelKey: 'streams.arts' },
    ],
  },
  {
    id: 18,
    part: 'C',
    type: 'single',
    titleKey: 'questions.q18.title',
    options: [
      { value: 'appearing', labelKey: 'status12.appearing' },
      { value: 'passed_out', labelKey: 'status12.passed_out' },
      { value: 'gap_year', labelKey: 'status12.gap_year' },
    ],
  },
  {
    id: 19,
    part: 'C',
    type: 'compound',
    titleKey: 'questions.q19.title',
    subFields: [
      {
        key: 'percentage',
        labelKey: 'questions.q19.percentage_label',
        type: 'single',
        options: [
          { value: 'below_60', labelKey: 'percentage.below_60' },
          { value: '60_75', labelKey: 'percentage.60_75' },
          { value: '75_90', labelKey: 'percentage.75_90' },
          { value: 'above_90', labelKey: 'percentage.above_90' },
        ],
      },
      {
        key: 'entranceExams',
        labelKey: 'questions.q19.exams_label',
        type: 'multi',
        options: [
          { value: 'CUET', labelKey: 'exams.cuet' },
          { value: 'JEE', labelKey: 'exams.jee' },
          { value: 'NEET', labelKey: 'exams.neet' },
          { value: 'KCET/State CET', labelKey: 'exams.kcet' },
          { value: 'CLAT', labelKey: 'exams.clat' },
          { value: 'NID/NIFT', labelKey: 'exams.nid_nift' },
          { value: 'None', labelKey: 'exams.none' },
        ],
      },
    ],
  },
  {
    id: 20,
    part: 'C',
    type: 'single',
    titleKey: 'questions.q20.title',
    subtitleKey: 'questions.q20.subtitle',
    options: [
      { value: 'under_3', labelKey: 'budget.under_3' },
      { value: '3_8', labelKey: 'budget.3_8' },
      { value: '8_15', labelKey: 'budget.8_15' },
      { value: 'above_15', labelKey: 'budget.above_15' },
    ],
  },
  {
    id: 21,
    part: 'C',
    type: 'compound',
    titleKey: 'questions.q21.title',
    subFields: [
      {
        key: 'preferredLocation',
        labelKey: 'questions.q21.location_label',
        type: 'single',
        options: [
          { value: 'bengaluru', labelKey: 'location.bengaluru' },
          { value: 'karnataka', labelKey: 'location.karnataka' },
          { value: 'india', labelKey: 'location.india' },
          { value: 'abroad_later', labelKey: 'location.abroad_later' },
        ],
      },
      {
        key: 'relocate',
        labelKey: 'questions.q21.relocate_label',
        type: 'single',
        options: [
          { value: 'yes', labelKey: 'options.yes' },
          { value: 'no', labelKey: 'options.no' },
        ],
      },
    ],
  },
  {
    id: 22,
    part: 'C',
    type: 'single',
    titleKey: 'questions.q22.title',
    options: [
      { value: 'fees', labelKey: 'worries.fees' },
      { value: 'course_choice', labelKey: 'worries.course_choice' },
      { value: 'admissions', labelKey: 'worries.admissions' },
      { value: 'placements', labelKey: 'worries.placements' },
    ],
  },
  {
    id: 23,
    part: 'C',
    type: 'single',
    titleKey: 'questions.q23.title',
    options: [
      { value: 'this_month', labelKey: 'decide_time.this_month' },
      { value: '3_months', labelKey: 'decide_time.3_months' },
      { value: 'exploring', labelKey: 'decide_time.exploring' },
    ],
  },
];
