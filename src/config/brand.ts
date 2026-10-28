  // Brand Configuration for BeyondEducations
export const BRAND_CONFIG = {
  BRAND_NAME: 'BeyondEducations',
  TAGLINE: 'Empowering Future Learning',
  CITY: 'Bengaluru',
  STATE: 'Karnataka',
  COUNTRY: 'India',
  PHONE: '+91 98450 12345',
  EMAIL: 'admissions@beyondeducations.com',
  ADDRESS: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
  LOGO_PATH: '/logo.png',

  // Higher Education Student Offerings
  OFFERINGS: [
    {
      id: 'ug',
      label: 'UG Students',
      fullName: 'Undergraduate Programs',
      description: 'BTech, MBBS, BBA, BCA, BCom, BSc, BA, Law & Design admissions across premier colleges.',
      badge: 'Bachelors & Professional Degrees',
    },
    {
      id: 'pg',
      label: 'PG Students',
      fullName: 'Postgraduate Programs',
      description: 'MBA, PGDM, MTech, MCA, MSc, MA, and Executive master degrees with career placement backing.',
      badge: 'Masters & Executive Programs',
    },
    {
      id: 'abroad',
      label: 'Study Abroad Students',
      fullName: 'Global University Admissions',
      description: 'Direct university applications, scholarships, SOP/visa processing for UK, Ireland, Germany, Australia, Canada, USA & Europe.',
      badge: 'International Degrees & Visas',
    },
  ],

  // Geographic Reach & Networks
  NETWORK: {
    PAN_INDIA: 'Connections all over India with 150+ verified partner institutions',
    HUBS: [
      { name: 'Karnataka (Bangalore)', role: 'Primary Innovation & Admissions Hub', count: '60+ Institutions' },
      { name: 'Kerala', role: 'Major State Partner Network (Kochi, Calicut, Trivandrum)', count: '45+ Institutions' },
      { name: 'Tamil Nadu', role: 'Premier Engineering & Arts Network (Chennai, Coimbatore, Vellore)', count: '50+ Institutions' },
      { name: 'Pan-India', role: 'Top Tier Universities (Delhi NCR, Mumbai, Pune, Hyderabad)', count: '75+ Institutions' },
      { name: 'Study Abroad', role: 'Overseas University Tie-ups (UK, Ireland, Germany, Australia, USA)', count: '100+ Global Unis' },
    ],
  },

  // Color palette
  COLORS: {
    navy: '#14305E',
    navyHover: '#0f2447',
    teal: '#1B7A9C',
    tealHover: '#15617c',
    amber: '#F2A12B',
    amberHover: '#d98b1e',
    background: '#F5F8FB',
    card: '#FFFFFF',
    textMain: '#0F172A',
    textMuted: '#64748B',
  },

  // Demo settings
  DEMO_OTP_HINT: 'Demo mode: enter any 4 digits',
  ADMIN_PASSWORD: 'Ashika',
  ADMIN_PASSWORDS: ['Ashika', 'Melvin.325'],

  // Limits and thresholds
  MAX_QUESTIONS: 23,
  TOTAL_MINUTES: 6,
} as const;

