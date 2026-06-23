import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CompareProvider } from './context/CompareContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import CompareStickyBar from './components/CompareStickyBar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VehicleDetail from './pages/VehicleDetail';
import Comparison from './pages/Comparison';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <CompareProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/cars" element={<Home type="Car" />} />
              <Route path="/bikes" element={<Home type="Bike" />} />
              <Route path="/heavy-duties" element={<Home type="HeavyDuty" />} />
              <Route path="/vehicle/:id" element={<VehicleDetail />} />
              <Route path="/compare" element={<Comparison />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User/Admin Routes */}
              <Route element={<ProtectedRoute roles={['ADMIN', 'USER']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-bookings" element={<Dashboard />} />
              </Route>
              
              {/* Admin Routes */}
              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>
            </Routes>
          </main>
          <footer style={{
            background: 'var(--bg-surface)',
            borderTop: '1px solid var(--border)',
            padding: '2rem 0',
            marginTop: 'auto',
            transition: 'background 0.3s, border-color 0.3s',
          }}>
            <div className="container" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  AutoSCM
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                &copy; {new Date().getFullYear()} Auto-SCM. All rights reserved.
              </p>
            </div>
          </footer>
          <CompareStickyBar />
        </div>
      </Router>
      </CompareProvider>
    </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
