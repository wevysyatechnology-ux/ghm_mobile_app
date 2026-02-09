import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import HousesPage from './pages/HousesPage';
import AttendancePage from './pages/AttendancePage';
import ApprovalsPage from './pages/ApprovalsPage';
import Layout from './components/Layout';
import AccessDenied from './components/AccessDenied';
import LoadingScreen from './components/LoadingScreen';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, hasAdminAccess, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAdminAccess) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="houses" element={<HousesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
        <Route path="approvals" element={<ApprovalsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
