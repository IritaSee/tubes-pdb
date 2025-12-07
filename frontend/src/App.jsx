import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import StudentLogin from './pages/student/StudentLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import LecturerLogin from './pages/lecturer/LecturerLogin';
import LecturerDashboard from './pages/lecturer/LecturerDashboard';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredType }) => {
  const { isAuthenticated, userType, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredType && userType !== requiredType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Landing Page
const LandingPage = () => {
  const { isAuthenticated, userType } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={userType === 'student' ? '/student/dashboard' : '/lecturer/dashboard'} replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <h1 style={{ fontSize: 'var(--text-5xl)', background: 'linear-gradient(135deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 'var(--spacing-md)' }}>
              🏥 Biomedical Analyst
            </h1>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
              Immersive Data Analytics Roleplay Platform
            </p>
          </div>

          <div className="grid grid-2" style={{ gap: 'var(--spacing-lg)' }}>
            <a href="/student/login" className="card" style={{ textDecoration: 'none', padding: 'var(--spacing-xl)', transition: 'all 0.3s', cursor: 'pointer' }}>
              <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--spacing-md)' }}>👨‍🎓</div>
              <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Student</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 0 }}>
                Login with your NIM
              </p>
            </a>

            <a href="/lecturer/login" className="card" style={{ textDecoration: 'none', padding: 'var(--spacing-xl)', transition: 'all 0.3s', cursor: 'pointer' }}>
              <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--spacing-md)' }}>👨‍🏫</div>
              <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>Lecturer</h3>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 0 }}>
                Manage assignments
              </p>
            </a>
          </div>

          <div style={{ marginTop: 'var(--spacing-2xl)', padding: 'var(--spacing-lg)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 0 }}>
              💡 Students analyze real biomedical datasets through immersive scenarios
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/lecturer/login" element={<LecturerLogin />} />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredType="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/lecturer/dashboard"
            element={
              <ProtectedRoute requiredType="lecturer">
                <LecturerDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
