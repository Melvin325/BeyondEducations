import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { QuizPage } from './pages/QuizPage';
import { TeaserPage } from './pages/TeaserPage';
import { ReportPage } from './pages/ReportPage';
import { DashboardPage } from './pages/DashboardPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isQuiz = location.pathname.startsWith('/quiz');
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FB] text-slate-800">
      <Header />
      <main className="flex-1 flex flex-col">{children}</main>
      {!isQuiz && !isAdmin && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/teaser" element={<TeaserPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/admin" element={<DashboardPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          {/* Catch-all redirect to home */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
