import React, { Suspense } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppSkeleton } from './Skeletons';
import { Layout } from './Layout';

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <AppSkeleton />;
  if (!user) return <Navigate to="/login" />;

  return (
    <Layout>
      <Suspense fallback={<AppSkeleton />}>
        {children}
      </Suspense>
    </Layout>
  );
};
