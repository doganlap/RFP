import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ROUTES } from './config/routes';
import RFPList from './components/rfp/RFPList';
import { RealRFPProcess } from './RealRFPProcess.jsx';
import WinLossAnalysis from './components/WinLossAnalysis';
import Integrations from './components/settings/Integrations';
import Settings from './pages/Settings';
import Team from './pages/Team';
import LegalReview from './pages/LegalReview';
import FinanceReview from './pages/FinanceReview';
import TechReview from './pages/TechReview';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Dashboard from './pages/Dashboard';
import { useRFP } from './hooks/useRFP';

const App: React.FC = () => {
  const { fetchRFPs } = useRFP();

  useEffect(() => {
    fetchRFPs().catch((error) => {
      console.error('Failed to bootstrap RFP data:', error);
    });
  }, [fetchRFPs]);

  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path={ROUTES.HOME} element={<Dashboard />} />
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.RFP.LIST} element={<RFPList />} />
          <Route path={ROUTES.RFP.DETAIL} element={<RealRFPProcess />} />
          <Route path={ROUTES.ANALYSIS.WIN_LOSS} element={<WinLossAnalysis />} />
          <Route path={ROUTES.ANALYSIS.DASHBOARD} element={<AnalyticsDashboard />} />
          <Route path={ROUTES.SME_GENERAL.LEGAL} element={<LegalReview />} />
          <Route path={ROUTES.SME_GENERAL.FINANCE} element={<FinanceReview />} />
          <Route path={ROUTES.SME_GENERAL.TECH} element={<TechReview />} />
          <Route path={ROUTES.TEAM} element={<Team />} />
          <Route path={ROUTES.SETTINGS.ROOT} element={<Settings />} />
          <Route path={ROUTES.SETTINGS.INTEGRATIONS} element={<Integrations />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
