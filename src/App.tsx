/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppraisalProvider } from './context/AppraisalContext';
import { OrgProvider } from './context/OrgContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { PerformanceOverview } from './pages/PerformanceOverview';
import { Leaderboard } from './pages/Leaderboard';
import { AppraisalForm } from './pages/AppraisalForm';
import { PerformanceContract } from './pages/PerformanceContract';
import { AdminSettings } from './pages/AdminSettings';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { TeamReview } from './pages/TeamReview';
import { Login } from './pages/Login';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <Layout>{children}</Layout>;
};

// Placeholder pages
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-slate-200">
    <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
    <p className="text-slate-500">This module is currently being implemented.</p>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppraisalProvider>
          <OrgProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/my-appraisal" element={<PrivateRoute><AppraisalForm /></PrivateRoute>} />
            <Route path="/my-contract" element={<PrivateRoute><PerformanceContract /></PrivateRoute>} />
            <Route path="/team" element={<PrivateRoute><TeamReview /></PrivateRoute>} />
            <Route path="/performance-overview" element={<PrivateRoute><PerformanceOverview /></PrivateRoute>} />
            <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
            <Route path="/admin/settings" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
          </OrgProvider>
        </AppraisalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

