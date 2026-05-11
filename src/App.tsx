/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppraisalProvider } from './context/AppraisalContext';
import { OrgProvider } from './context/OrgContext';
import { Layout } from './components/Layout';

// Route-level code splitting — each page loads only when navigated to
const Dashboard          = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const PerformanceOverview = lazy(() => import('./pages/PerformanceOverview').then(m => ({ default: m.PerformanceOverview })));
const Leaderboard        = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const AppraisalForm      = lazy(() => import('./pages/AppraisalForm').then(m => ({ default: m.AppraisalForm })));
const PerformanceContract = lazy(() => import('./pages/PerformanceContract').then(m => ({ default: m.PerformanceContract })));
const AdminSettings      = lazy(() => import('./pages/AdminSettings').then(m => ({ default: m.AdminSettings })));
const Analytics          = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Reports            = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const TeamReview         = lazy(() => import('./pages/TeamReview').then(m => ({ default: m.TeamReview })));
const Login              = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));

// Minimal fallback shown while a page chunk is fetching
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
  </div>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" />;

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
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
            </Router>
          </OrgProvider>
        </AppraisalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

