# BeyondEducations — Career Interest Quiz & Lead-Generation Platform

> **Empowering Future Learning** · Bengaluru, Karnataka

A mobile-first, high-conversion lead generation web application and **Career Interest Quiz** built for **BeyondEducations**, an education consulting firm based in Indiranagar, Bengaluru. Designed specifically for students completing or who have completed 12th standard (PUC/CBSE/ICSE) and are choosing an undergraduate degree.

---

## 🌟 Highlights & Features

- **Free 6-Minute Course Fit Assessment**:
  - **Part A (Q1–12)**: 12 RIASEC questions (1–5 rating scale) measuring Realistic, Investigative, Artistic, Social, Enterprising, and Conventional archetypes.
  - **Part B (Q13–16)**: Subject strengths, collaborative style, career value drivers, and heavy mathematics aptitude.
  - **Part C (Q17–23)**: Stream eligibility, Class 12 status, percentage band, entrance exams (KCET, JEE, NEET, CUET, CLAT, NID), total degree budget, location preference, and immediate worries.
- **Teaser Result & Lead Capture**:
  - 2-second dynamic response analysis animation.
  - RIASEC profile archetype code & title (e.g. *The Hands-on Innovator (IR)* or *The Analytical Strategist (IE)*).
  - 6-axis interactive Recharts radar chart.
  - Blurred/locked matched courses to drive high curiosity.
  - Lead form with Indian mobile number validation, demo OTP verification (any 4 digits), email, student/parent selector, and mandatory DPDP consent.
- **Personalised Course Guidance Report**:
  - Instant mock WhatsApp delivery notification & bubble.
  - 3 plain-language student strengths.
  - Top 3–5 matched undergraduate courses with "Why this fits you", duration, indicative total fee, entrance exams, typical fresher salary, and budget status badge (*Within budget*, *Slightly above*, *Above*).
  - Categorized Bengaluru & Karnataka colleges (Government, Private, Deemed) with sample partner tags.
  - One-page **Parent Summary** with approximate cost and a next-steps parent checklist.
  - Instant **PDF Download** and **WhatsApp Share** link.
  - Modal to **Book a Free 1-on-1 Counselling Session** (in Indiranagar, Bengaluru or via Google Meet).
- **Counsellor Admin Dashboard (`/admin`)**:
  - Demo password: `demo123`.
  - KPI metric cards: Quizzes started, completed, leads captured, hot leads, bookings, completion rate.
  - Question milestone drop-off funnel chart.
  - Searchable, filterable leads table with instant CSV export and "Load 25 Demo Leads" button.
  - Side drawer inspecting answers, score breakdown (+3, +2, +1), counsellor internal notes, and direct call/WhatsApp triggers.
- **Multi-Language Architecture**:
  - 4 languages: English (`en`), Kannada (`kn`), Tamil (`ta`), Malayalam (`ml`).
  - Persistent language switcher in sticky header and on the first quiz question.
  - 100% of user-facing copy in `/src/locales/{en,kn,ta,ml}.json`.
  - Noto Sans Kannada, Noto Sans Tamil, and Noto Sans Malayalam loaded via Google Fonts for typography.

---

## 🚀 Quick Start Instructions

### Prerequisites
- Node.js (v18+ or v22+)
- npm (v9+ or v10+)

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start Vite local development server
npm run dev

# 3. Open in browser (defaults to http://localhost:5173/)
```

### Building for Production
```bash
# Runs TypeScript verification and builds optimized bundle
npm run build

# Preview production build locally
npm run preview
```

### Running the Automated Test Suite
Verify RIASEC calculations, course filtering, lead scoring, and multi-language key consistency:
```bash
npx tsx scripts/verify-flows.ts
```

---

## 📁 Project Structure

```
/
├── public/
│   └── logo.png                # Brand logo placeholder (falls back to text + arrow)
├── scripts/
│   └── verify-flows.ts         # Automated test suite for PCM, Commerce, Arts & i18n
├── src/
│   ├── config/
│   │   └── brand.ts            # Brand colors, typography, Bengaluru address, credentials
│   ├── data/
│   │   ├── courses.ts          # 28+ undergraduate degrees with RIASEC & fee metadata
│   │   ├── demoLeads.ts        # 25 realistic Indian demo leads with full scoring
│   │   ├── profilePairs.ts     # 15 RIASEC pair archetypes (IR, CE, AS, etc.)
│   │   ├── questions.ts        # 23 quiz questions (Parts A, B, C)
│   │   ├── sampleColleges.ts   # Government, Private, and Deemed colleges in Karnataka
│   │   └── testimonialsFaq.ts  # Counsellors, student testimonials, and FAQ items
│   ├── lib/
│   │   ├── i18n.ts             # i18next configuration (EN, KN, TA, ML)
│   │   ├── pdf.ts              # PDF export via html2canvas & jsPDF with print fallback
│   │   ├── scoring.ts          # RIASEC algorithm, course ranker & lead score engine
│   │   └── storage.ts          # Type-safe localStorage manager
│   ├── locales/
│   │   ├── en.json             # Complete English copy
│   │   ├── kn.json             # Kannada translations
│   │   ├── ta.json             # Tamil translations
│   │   └── ml.json             # Malayalam translations
│   ├── components/
│   │   ├── BookingModal.tsx    # 1-on-1 Free Counselling slot scheduler
│   │   ├── Footer.tsx          # Regulatory disclaimers & Bengaluru office info
│   │   ├── Header.tsx          # Sticky header with logo & 4-language switcher
│   │   ├── LeadDrawer.tsx      # Counsellor inspection drawer with notes & call actions
│   │   ├── Logo.tsx            # Logo component with graceful text + arrow fallback
│   │   └── RadarChart.tsx      # 6-axis RIASEC interest balance visualization
│   └── pages/
│       ├── LandingPage.tsx     # Hero, SVG illustration, trust, FAQ & mobile sticky bar
│       ├── QuizPage.tsx        # One-question-per-screen flow with progress bar
│       ├── TeaserPage.tsx      # 2s analysis animation, radar, locked teasers, OTP form
│       ├── ReportPage.tsx      # Mock WhatsApp delivery, course matches, parent summary
│       ├── DashboardPage.tsx   # Counsellor KPI stats, funnel chart, leads table, CSV export
│       └── PrivacyPolicyPage.tsx # India DPDP Act compliance & "Delete my data" utility
```

---

## 📋 Replace for Production Checklist

Before deploying this prototype to production for real student traffic:

1. **Real SMS / WhatsApp OTP Provider**:
   - Replace the demo OTP verification (`any 4 digits`) with an official Indian SMS gateway like **MSG91**, **Twilio**, or **Fast2SMS** using DLT-registered SMS templates.
2. **WhatsApp Business API Integration**:
   - Connect the lead webhook to **Gupshup**, **Wati**, or the **Meta Cloud API** to trigger the actual WhatsApp message with the student's personalized report link and parent summary PDF.
3. **CRM Synchronization**:
   - Integrate with **Zoho CRM**, **HubSpot**, or **LeadSquared** via webhook to route Hot leads (Score 8+) directly into counsellor call queues with priority notifications.
4. **Verified College Cutoff & Fee Schedules**:
   - Update `src/data/sampleColleges.ts` and `src/data/courses.ts` with current Karnataka Examination Authority (KEA) KCET rank cutoffs, COMEDK fee structures, and verified management quota tuition fee bands.
5. **Native-Speaker Translation Review**:
   - *Note in code*: Kannada (`kn.json`), Tamil (`ta.json`), and Malayalam (`ml.json`) translations have been provided in natural phrasing, but must be reviewed and polished by native linguistic specialists before commercial ad campaigns launch.
6. **Counsellor Review of Questions**:
   - Have BeyondEducations senior counselling staff review the question phrasing and weightings to match current Bangalore student counseling patterns.
7. **Legal Review (DPDP Act 2023)**:
   - Ensure the parental consent mechanism and privacy notice fulfill all provisions under India's **Digital Personal Data Protection Act, 2023** for collecting contact information from students who may be under 18.

---

## 📄 License & Attribution
Developed for **BeyondEducations** · Bengaluru, Karnataka.
