import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { ROUTES } from './config/routes';
import RFPList from './components/rfp/RFPList';
import { RealRFPProcess } from './RealRFPProcess.jsx';
import WinLossAnalysis from './components/WinLossAnalysis';
import Integrations from './components/settings/Integrations';
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
          <Route path={ROUTES.HOME} element={<RFPList />} />
          <Route path={ROUTES.DASHBOARD} element={<RFPList />} />
          <Route path={ROUTES.RFP.LIST} element={<RFPList />} />
          <Route path={ROUTES.RFP.DETAIL} element={<RealRFPProcess />} />
          <Route path={ROUTES.ANALYSIS.WIN_LOSS} element={<WinLossAnalysis />} />
          <Route path={ROUTES.SETTINGS.INTEGRATIONS} element={<Integrations />} />
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </AppLayout>
    </Router>
  );
};

export default App;
