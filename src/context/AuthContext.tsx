import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// MOCK USERS for prototype
const USERS: Record<string, User> = {
  'admin@servicom.gov.ng': {
    id: 'admin_1',
    ippisNo: '00001',
    surname: 'ADMIN',
    firstname: 'SUPER',
    email: 'admin@servicom.gov.ng',
    phone: '08000000000',
    designation: 'System Administrator',
    departmentId: 'dept_it',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
  },
  'nc@servicom.gov.ng': {
    id: 'nc_1',
    ippisNo: '00002',
    surname: 'FUNMILAYO',
    firstname: 'OLADIMEJI',
    email: 'nc@servicom.gov.ng',
    phone: '08000000000',
    designation: 'National Coordinator',
    departmentId: 'dept_nc',
    role: UserRole.NC,
    isActive: true,
  },
  'dd@servicom.gov.ng': {
    id: 'dd_1',
    ippisNo: '10001',
    surname: 'LAWAL',
    firstname: 'OBEHI',
    email: 'dd@servicom.gov.ng',
    phone: '08000000000',
    designation: 'Deputy Director',
    departmentId: 'dept_operations',
    role: UserRole.DEPUTY_DIRECTOR,
    supervisorId: 'nc_1',
    isActive: true,
  },
  'head@servicom.gov.ng': {
    id: 'head_1',
    ippisNo: '20001',
    surname: 'CHINYERE',
    firstname: 'NAWABUA',
    email: 'head@servicom.gov.ng',
    phone: '08000000000',
    designation: 'Head of Department',
    departmentId: 'dept_operations',
    role: UserRole.DEPT_HEAD,
    supervisorId: 'dd_1',
    isActive: true,
  },
  'lead@servicom.gov.ng': {
    id: 'lead_1',
    ippisNo: '30001',
    surname: 'NNEKA',
    firstname: 'OLEH',
    email: 'lead@servicom.gov.ng',
    phone: '08000000000',
    designation: 'Team Lead',
    departmentId: 'dept_operations',
    role: UserRole.TEAM_LEAD,
    supervisorId: 'head_1',
    isActive: true,
  },
  'staff@servicom.gov.ng': {
    id: 'staff_1',
    ippisNo: '40001',
    surname: 'ISAH',
    firstname: 'ABDULLAHI',
    email: 'staff@servicom.gov.ng',
    phone: '08000000000',
    designation: 'Officer I',
    departmentId: 'dept_operations',
    role: UserRole.STAFF,
    supervisorId: 'lead_1',
    counterSignerId: 'head_1',
    isActive: true,
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string) => {
    setLoading(true);
    // Simulate lookup
    setTimeout(() => {
      const foundUser = USERS[email.toLowerCase()] || USERS['helen.lawal@servicom.gov.ng'];
      setUser(foundUser);
      setLoading(false);
    }, 500);
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
