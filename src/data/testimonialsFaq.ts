export interface CounsellorCard {
  name: string;
  role: string;
  experience: string;
  specialty: string;
  avatarText: string;
}

export const COUNSELLORS: CounsellorCard[] = [
  {
    name: 'Dr. Ramesh Narayan',
    role: 'Senior Academic Advisor',
    experience: '18+ years counselling 12th graders',
    specialty: 'STEM, Engineering & Medical pathways',
    avatarText: 'RN',
  },
  {
    name: 'Priya K. Venkatesh',
    role: 'Career & Admissions Strategist',
    experience: '12+ years in Karnataka & Pan-India Admissions',
    specialty: 'Commerce, CA, Law & Business Studies',
    avatarText: 'PV',
  },
  {
    name: 'Ananya Deshmukh',
    role: 'Creative & New-Age Careers Guide',
    experience: '9+ years mentoring design & media aspirants',
    specialty: 'Design (UCEED/NID), Media, Psychology & Liberal Arts',
    avatarText: 'AD',
  },
];

export interface Testimonial {
  id: string;
  studentName: string;
  city: string;
  school: string;
  quoteKey: string;
  courseSelected: string;
  rating: number;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    studentName: 'Suhas Kulkarni',
    city: 'Bengaluru (Malleswaram)',
    school: 'Sample State PU College',
    quoteKey: 'testimonials.t1',
    courseSelected: 'BSc Data Science & AI',
    rating: 5,
  },
  {
    id: 't-2',
    studentName: 'Meghana R. Rao',
    city: 'Bengaluru (Jayanagar)',
    school: 'Sample CBSE Senior Secondary',
    quoteKey: 'testimonials.t2',
    courseSelected: 'B.Des (Interaction Design)',
    rating: 5,
  },
  {
    id: 't-3',
    studentName: 'Karthik Subramanian',
    city: 'Bengaluru (Indiranagar)',
    school: 'Sample ICSE Academy',
    quoteKey: 'testimonials.t3',
    courseSelected: 'BCom + ACCA International',
    rating: 5,
  },
];

export interface FaqItem {
  id: string;
  questionKey: string;
  answerKey: string;
}

export const FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    questionKey: 'faq.q1_question',
    answerKey: 'faq.q1_answer',
  },
  {
    id: 'faq-2',
    questionKey: 'faq.q2_question',
    answerKey: 'faq.q2_answer',
  },
  {
    id: 'faq-3',
    questionKey: 'faq.q3_question',
    answerKey: 'faq.q3_answer',
  },
  {
    id: 'faq-4',
    questionKey: 'faq.q4_question',
    answerKey: 'faq.q4_answer',
  },
];
