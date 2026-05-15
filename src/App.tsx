/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppraisalProvider } from './context/AppraisalContext';
import { OrgProvider } from './context/OrgContext';
import { ContractProvider } from './context/ContractContext';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { AppSkeleton } from './components/Skeletons';

// Route-level code splitting
const Dashboard          = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const PerformanceOverview = lazy(() => import('./pages/PerformanceOverview').then(m => ({ default: m.PerformanceOverview })));
const Leaderboard        = lazy(() => import('./pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const AppraisalForm      = lazy(() => import('./pages/AppraisalForm').then(m => ({ default: m.AppraisalForm })));
const PerformanceContract = lazy(() => import('./pages/PerformanceContract').then(m => ({ default: m.PerformanceContract })));
const AdminSettings      = lazy(() => import('./pages/AdminSettings').then(m => ({ default: m.AdminSettings })));
const Analytics          = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Reports            = lazy(() => import('./pages/Reports').then(m => ({ default: m.Reports })));
const TeamReview         = lazy(() => import('./pages/TeamReview').then(m => ({ default: m.TeamReview })));
const MPMSDashboard       = lazy(() => import('./pages/MPMSDashboard').then(m => ({ default: m.MPMSDashboard })));
const MPMSAchievementEntry = lazy(() => import('./pages/MPMSAchievementEntry').then(m => ({ default: m.MPMSAchievementEntry })));
const Profile            = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const MonthlyEvaluation  = lazy(() => import('./pages/MonthlyEvaluation').then(m => ({ default: m.MonthlyEvaluation })));


export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppraisalProvider>
          <ContractProvider>
            <OrgProvider>
              <Router>
                <Suspense fallback={<AppSkeleton />}>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/my-appraisal" element={<PrivateRoute><AppraisalForm /></PrivateRoute>} />
                    <Route path="/my-contract" element={<PrivateRoute><PerformanceContract /></PrivateRoute>} />
                    <Route path="/monthly-review" element={<PrivateRoute><MonthlyEvaluation /></PrivateRoute>} />
                    <Route path="/team" element={<PrivateRoute><TeamReview /></PrivateRoute>} />
                    <Route path="/performance-overview" element={<PrivateRoute><PerformanceOverview /></PrivateRoute>} />
                    <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
                    <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                    <Route path="/mpms" element={<PrivateRoute><MPMSDashboard /></PrivateRoute>} />
                    <Route path="/mpms/entry" element={<PrivateRoute><MPMSAchievementEntry /></PrivateRoute>} />
                    <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
                    <Route path="/admin/settings" element={<PrivateRoute><AdminSettings /></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
              </Router>
            </OrgProvider>
          </ContractProvider>
        </AppraisalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
