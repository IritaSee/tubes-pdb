import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const StudentLogin = () => {
    const [nim, setNim] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.studentLogin(nim);
            const { student, token } = response.data;

            login(student, 'student', token);
            navigate('/student/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check your NIM.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card" style={{ maxWidth: '450px', width: '100%', margin: 'var(--spacing-lg)' }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
                    <div style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--spacing-md)' }}>👨‍🎓</div>
                    <h2>Student Login</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
                        Enter your NIM to access your assignment
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="nim">
                            Student ID (NIM)
                        </label>
                        <input
                            id="nim"
                            type="text"
                            className="form-input"
                            placeholder="e.g., 12345678"
                            value={nim}
                            onChange={(e) => setNim(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div style={{ padding: 'var(--spacing-md)', background: '#fee2e2', color: '#991b1b', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-lg)', fontSize: 'var(--text-sm)' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center' }}>
                    <a href="/" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                        ← Back to home
                    </a>
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
