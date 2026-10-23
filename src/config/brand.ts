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

  // Limits and thresholds
  MAX_QUESTIONS: 23,
  TOTAL_MINUTES: 6,
} as const;
