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
  question: string;
  answer: string;
  questionKey?: string;
  answerKey?: string;
  category: 'General' | 'Admissions & Quota' | 'Fees & Scholarships' | 'UG & PG' | 'Study Abroad';
  order: number;
  isActive: boolean;
  targetAudience?: 'All' | 'Parents' | 'Students';
}

export const INITIAL_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Is the Career Interest Quiz really free?',
    answer: 'Yes, 100% free! You can take the 6-minute assessment, view your archetype analysis, and download the full personalised course report without paying anything.',
    questionKey: 'faq.q1_question',
    answerKey: 'faq.q1_answer',
    category: 'General',
    order: 1,
    isActive: true,
    targetAudience: 'All',
  },
  {
    id: 'faq-2',
    question: 'Is my personal contact data safe and confidential?',
    answer: 'Absolutely. Your data is stored securely and used strictly to deliver your guidance report and provide genuine counselling support. We comply with Indian DPDP Act norms and never sell data to spam lists.',
    questionKey: 'faq.q2_question',
    answerKey: 'faq.q2_answer',
    category: 'General',
    order: 2,
    isActive: true,
    targetAudience: 'All',
  },
  {
    id: 'faq-3',
    question: 'Will you push specific private colleges?',
    answer: 'No. Our assessment matches government, aided, private, and deemed colleges purely based on your stream, scores, and declared budget. We offer objective guidance, not sponsored college quotas.',
    questionKey: 'faq.q3_question',
    answerKey: 'faq.q3_answer',
    category: 'Admissions & Quota',
    order: 3,
    isActive: true,
    targetAudience: 'Parents',
  },
  {
    id: 'faq-4',
    question: 'How accurate is the guidance algorithm?',
    answer: 'The assessment is structured around proven RIASEC career interest models adapted for 12th standard Indian curricula. It provides guidance, not a verdict, helping you shortlist 3-5 high-probability career paths.',
    questionKey: 'faq.q4_question',
    answerKey: 'faq.q4_answer',
    category: 'General',
    order: 4,
    isActive: true,
    targetAudience: 'Students',
  },
  {
    id: 'faq-5',
    question: 'Can BeyondEducations help with direct / management quota seats in Bangalore & Kerala?',
    answer: 'Yes. We have direct institutional linkages across top engineering, medical, and management institutions in Karnataka, Kerala, and Tamil Nadu. We assist with eligibility verification, seat reservations, and official college documentation.',
    category: 'Admissions & Quota',
    order: 5,
    isActive: true,
    targetAudience: 'Parents',
  },
  {
    id: 'faq-6',
    question: 'Do you provide Study Abroad application and visa processing assistance?',
    answer: 'Yes, our global wing provides end-to-end guidance for university selection, SOP review, scholarship applications, and visa documentation for UK, Ireland, Germany, Australia, Canada, and the USA.',
    category: 'Study Abroad',
    order: 6,
    isActive: true,
    targetAudience: 'All',
  },
  {
    id: 'faq-7',
    question: 'Are education loans supported for the colleges you recommend?',
    answer: 'All our partner institutions are UGC/AICTE accredited and recognized by nationalised and private banks (including SBI Scholar Loan, HDFC Credila, and Avanse). We provide official fee sanction letters for quick loan approval.',
    category: 'Fees & Scholarships',
    order: 7,
    isActive: true,
    targetAudience: 'Parents',
  },
  {
    id: 'faq-8',
    question: 'What is the fee for 1-on-1 personalized counselling with BeyondEducations?',
    answer: 'The introductory consultation and profile assessment is completely free of charge. If you choose comprehensive end-to-end admission and seat allotment assistance, nominal institutional service fees apply with 100% transparent fee receipts.',
    category: 'Fees & Scholarships',
    order: 8,
    isActive: true,
    targetAudience: 'All',
  },
];

export const FAQS = INITIAL_FAQS;

