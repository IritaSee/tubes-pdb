import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assignmentAPI, chatAPI, submissionAPI } from '../../services/api';

const StudentDashboard = () => {
    const { user, logout } = useAuth();
    const [assignment, setAssignment] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [submissionType, setSubmissionType] = useState('progress');
    const [submissions, setSubmissions] = useState([]);
    const [activeTab, setActiveTab] = useState('scenario');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadAssignment();
    }, []);

    useEffect(() => {
        if (assignment) {
            loadMessages();
            loadSubmissions();
        }
    }, [assignment]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadAssignment = async () => {
        try {
            const response = await assignmentAPI.getMy();
            setAssignment(response.data.assignment);
        } catch (error) {
            console.error('Error loading assignment:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const response = await chatAPI.getMessages(assignment.id);
            setMessages(response.data.messages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const loadSubmissions = async () => {
        try {
            const response = await submissionAPI.getByAssignment(assignment.id);
            setSubmissions(response.data.submissions);
        } catch (error) {
            console.error('Error loading submissions:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await chatAPI.sendMessage(assignment.id, newMessage);
            await loadMessages();
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!linkUrl.trim() || submitting) return;

        setSubmitting(true);
        try {
            await submissionAPI.create(assignment.id, linkUrl, submissionType);
            await loadSubmissions();
            setLinkUrl('');
            alert('Submission successful!');
        } catch (error) {
            console.error('Error submitting:', error);
            alert('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const { scenario, dataset } = assignment;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            {/* Header */}
            <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 'var(--spacing-lg) 0', boxShadow: 'var(--shadow-lg)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: 'white', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--text-2xl)' }}>
                            🏥 Biomedical Analyst Platform
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0, fontSize: 'var(--text-sm)' }}>
                            Welcome, {user.name} ({user.nim})
                        </p>
                    </div>
                    <button onClick={logout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </header>

            <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
                {/* Scenario Header */}
                <div className="card" style={{ marginBottom: 'var(--spacing-xl)', background: 'linear-gradient(135deg, #667eea15, #764ba215)', border: '2px solid var(--primary-200)' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-lg)' }}>
                        <div style={{ fontSize: 'var(--text-5xl)' }}>📧</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                                <h2 style={{ marginBottom: 0 }}>{scenario.scenario_title}</h2>
                                <span className="badge badge-primary">{scenario.difficulty_level}</span>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)', fontSize: 'var(--text-sm)' }}>
                                From: <strong>{scenario.stakeholder_name}</strong> ({scenario.stakeholder_role})
                            </p>
                            <div style={{ background: 'white', padding: 'var(--spacing-lg)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary-600)' }}>
                                <p style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>{scenario.email_body}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-lg)', borderBottom: '2px solid var(--border-color)' }}>
                    {['scenario', 'chat', 'submit'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: 'var(--spacing-md) var(--spacing-lg)',
                                background: activeTab === tab ? 'white' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab ? '3px solid var(--primary-600)' : '3px solid transparent',
                                cursor: 'pointer',
                                fontWeight: activeTab === tab ? 600 : 400,
                                color: activeTab === tab ? 'var(--primary-600)' : 'var(--text-secondary)',
                                transition: 'all 0.2s',
                                fontSize: 'var(--text-base)',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === 'scenario' && '📋'} {tab === 'chat' && '💬'} {tab === 'submit' && '📤'} {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'scenario' && (
                    <div className="grid grid-2">
                        <div className="card">
                            <h3>📊 Dataset Information</h3>
                            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                <p><strong>Name:</strong> {dataset.name}</p>
                                <p><strong>Description:</strong> {dataset.metadata_summary || 'No description'}</p>
                                <a href={dataset.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                                    📥 Access Dataset
                                </a>
                            </div>
                        </div>

                        <div className="card">
                            <h3>🎯 Key Objectives</h3>
                            <ul style={{ marginTop: 'var(--spacing-lg)', paddingLeft: 'var(--spacing-lg)' }}>
                                {scenario.key_objectives.map((obj, idx) => (
                                    <li key={idx} style={{ marginBottom: 'var(--spacing-md)', color: 'var(--text-secondary)' }}>
                                        {obj}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'chat' && (
                    <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: 'var(--spacing-lg)', paddingBottom: 'var(--spacing-md)', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>💬 Chat with {scenario.stakeholder_name}</h3>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 0 }}>
                                Ask questions about the project and get guidance
                            </p>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            {messages.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)', color: 'var(--text-tertiary)' }}>
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        style={{
                                            marginBottom: 'var(--spacing-md)',
                                            display: 'flex',
                                            justifyContent: msg.sender === 'student' ? 'flex-end' : 'flex-start'
                                        }}
                                    >
                                        <div
                                            style={{
                                                maxWidth: '70%',
                                                padding: 'var(--spacing-md)',
                                                borderRadius: 'var(--radius-lg)',
                                                background: msg.sender === 'student' ? 'var(--primary-600)' : 'white',
                                                color: msg.sender === 'student' ? 'white' : 'var(--text-primary)',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                        >
                                            <div style={{ fontSize: 'var(--text-xs)', marginBottom: 'var(--spacing-xs)', opacity: 0.8 }}>
                                                {msg.sender === 'student' ? 'You' : scenario.stakeholder_name}
                                            </div>
                                            <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={sending}
                                style={{ flex: 1 }}
                            />
                            <button type="submit" className="btn btn-primary" disabled={sending || !newMessage.trim()}>
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'submit' && (
                    <div className="grid grid-2">
                        <div className="card">
                            <h3>📤 Submit Your Work</h3>
                            <form onSubmit={handleSubmit} style={{ marginTop: 'var(--spacing-lg)' }}>
                                <div className="form-group">
                                    <label className="form-label">Google Drive / Colab Link</label>
                                    <input
                                        type="url"
                                        className="form-input"
                                        placeholder="https://drive.google.com/..."
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Submission Type</label>
                                    <select
                                        className="form-select"
                                        value={submissionType}
                                        onChange={(e) => setSubmissionType(e.target.value)}
                                    >
                                        <option value="progress">Progress Report</option>
                                        <option value="final">Final Report</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-success btn-lg" style={{ width: '100%' }} disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </form>
                        </div>

                        <div className="card">
                            <h3>📝 Your Submissions</h3>
                            <div style={{ marginTop: 'var(--spacing-lg)' }}>
                                {submissions.length === 0 ? (
                                    <p style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
                                        No submissions yet
                                    </p>
                                ) : (
                                    submissions.map((sub) => (
                                        <div key={sub.id} style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xs)' }}>
                                                <span className={`badge ${sub.submission_type === 'final' ? 'badge-success' : 'badge-primary'}`}>
                                                    {sub.submission_type}
                                                </span>
                                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                                    {new Date(sub.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <a href={sub.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-sm)', wordBreak: 'break-all' }}>
                                                {sub.link_url}
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
