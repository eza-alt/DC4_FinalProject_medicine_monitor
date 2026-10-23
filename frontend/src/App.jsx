
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Requests from './pages/Requests';
import Batches from './pages/Batches';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public page: no navbar */}
          <Route path="/login" element={<Login />} />

          {/* Logged-in pages */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/medicines" element={<Medicines />} />
            <Route path="/batches" element={<Batches />} />
            <Route path="/requests" element={<Requests />} />
          </Route>

          {/* Unknown addresses go back to the dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
