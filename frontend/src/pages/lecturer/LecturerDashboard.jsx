import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { datasetAPI, authAPI, gradingAPI, searchAPI } from '../../services/api';

const LecturerDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('datasets');
    const [datasets, setDatasets] = useState([]);
    const [students, setStudents] = useState([]);
    const [totalStudents, setTotalStudents] = useState(0);
    const [loading, setLoading] = useState(true);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Dataset form state
    const [showDatasetForm, setShowDatasetForm] = useState(false);
    const [datasetForm, setDatasetForm] = useState({
        name: '',
        url: '',
        metadata_summary: '',
        columns_list: '',
        sample_data: '',
        data_quality_notes: ''
    });

    // Roster upload state
    const [rosterText, setRosterText] = useState('');
    const [uploading, setUploading] = useState(false);

    // Grading state
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
    const [gradingPage, setGradingPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (!isSearching) {
            loadData();
        }
    }, [activeTab, gradingPage, isSearching, itemsPerPage]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'datasets') {
                const response = await datasetAPI.getAll();
                setDatasets(response.data.datasets);
            } else if (activeTab === 'grading') {
                const response = await gradingAPI.getAllStudents(gradingPage, itemsPerPage);
                setStudents(response.data.students);
                setTotalStudents(response.data.total || 0);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            setIsSearching(false);
            return;
        }

        setLoading(true);
        setIsSearching(true);
        try {
            const response = await searchAPI.searchStudents(searchQuery);
            setStudents(response.data.students);
            // Search returns all results, so hide pagination by setting total to current length (or handle separate isSearching UI)
            setTotalStudents(response.data.students.length);
        } catch (error) {
            console.error('Error searching students:', error);
            alert('Failed to search students');
            setIsSearching(false);
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setIsSearching(false);
        setGradingPage(1);
        // loadData will be triggered by effect
    };

    const handleCreateDataset = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...datasetForm,
                columns_list: datasetForm.columns_list.split(',').map(c => c.trim()).filter(Boolean)
            };
            await datasetAPI.create(payload);
            setShowDatasetForm(false);
            setDatasetForm({ name: '', url: '', metadata_summary: '', columns_list: '', sample_data: '', data_quality_notes: '' });
            loadData();
            alert('Dataset created successfully!');
        } catch (error) {
            console.error('Error creating dataset:', error);
            alert('Failed to create dataset');
        }
    };

    const handleDeleteDataset = async (id) => {
        if (!confirm('Are you sure you want to delete this dataset?')) return;
        try {
            await datasetAPI.delete(id);
            loadData();
        } catch (error) {
            console.error('Error deleting dataset:', error);
            alert('Failed to delete dataset');
        }
    };

    const handleUploadRoster = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            const lines = rosterText.split('\n').filter(line => line.trim());
            const students = lines.map(line => {
                const [nim, name] = line.split(',').map(s => s.trim());
                return { nim, name };
            }).filter(s => s.nim && s.name);

            await authAPI.uploadRoster(students);
            setRosterText('');
            alert(`Successfully uploaded ${students.length} students!`);
        } catch (error) {
            console.error('Error uploading roster:', error);
            alert('Failed to upload roster');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmitGrade = async (e) => {
        e.preventDefault();
        try {
            await gradingAPI.submitGrade(
                selectedStudent.assignment.id,
                parseInt(gradeForm.score),
                gradeForm.feedback
            );
            setSelectedStudent(null);
            setGradeForm({ score: '', feedback: '' });
            loadData();
            alert('Grade submitted successfully!');
        } catch (error) {
            console.error('Error submitting grade:', error);
            alert('Failed to submit grade');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            {/* Header */}
            <header style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: 'var(--spacing-lg) 0', boxShadow: 'var(--shadow-lg)' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ color: 'white', marginBottom: 'var(--spacing-xs)', fontSize: 'var(--text-2xl)' }}>
                            🏥 Lecturer Dashboard
                        </h1>
                        <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: 0, fontSize: 'var(--text-sm)' }}>
                            {user.email}
                        </p>
                    </div>
                    <button onClick={logout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>
            </header>

            <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)', borderBottom: '2px solid var(--border-color)' }}>
                    {['datasets', 'students', 'grading'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                if (tab === 'grading') setGradingPage(1);
                            }}
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
                            {tab === 'datasets' && '📊'} {tab === 'students' && '👥'} {tab === 'grading' && '📝'} {tab}
                        </button>
                    ))}
                </div>

                {/* Datasets Tab */}
                {activeTab === 'datasets' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-xl)' }}>
                            <h2>📊 Manage Datasets</h2>
                            <button onClick={() => setShowDatasetForm(!showDatasetForm)} className="btn btn-primary">
                                {showDatasetForm ? 'Cancel' : '+ Add Dataset'}
                            </button>
                        </div>

                        {showDatasetForm && (
                            <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                                <h3>Create New Dataset</h3>
                                <form onSubmit={handleCreateDataset} style={{ marginTop: 'var(--spacing-lg)' }}>
                                    <div className="grid grid-2">
                                        <div className="form-group">
                                            <label className="form-label">Dataset Name *</label>
                                            <input
                                                type="text"
                                                className="form-input"
                                                value={datasetForm.name}
                                                onChange={(e) => setDatasetForm({ ...datasetForm, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Dataset URL *</label>
                                            <input
                                                type="url"
                                                className="form-input"
                                                value={datasetForm.url}
                                                onChange={(e) => setDatasetForm({ ...datasetForm, url: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-textarea"
                                            value={datasetForm.metadata_summary}
                                            onChange={(e) => setDatasetForm({ ...datasetForm, metadata_summary: e.target.value })}
                                            placeholder="Brief description of the dataset"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Column Names (comma-separated)</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={datasetForm.columns_list}
                                            onChange={(e) => setDatasetForm({ ...datasetForm, columns_list: e.target.value })}
                                            placeholder="patient_id, age, diagnosis, treatment"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Sample Data (CSV format, first 5 rows)</label>
                                        <textarea
                                            className="form-textarea"
                                            value={datasetForm.sample_data}
                                            onChange={(e) => setDatasetForm({ ...datasetForm, sample_data: e.target.value })}
                                            placeholder="patient_id,age,diagnosis&#10;001,65,Hypertension&#10;002,45,Diabetes"
                                            style={{ minHeight: '120px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Data Quality Notes</label>
                                        <textarea
                                            className="form-textarea"
                                            value={datasetForm.data_quality_notes}
                                            onChange={(e) => setDatasetForm({ ...datasetForm, data_quality_notes: e.target.value })}
                                            placeholder="Known data issues (e.g., 'Some discharge times are missing due to logging errors')"
                                        />
                                    </div>

                                    <button type="submit" className="btn btn-success btn-lg">
                                        Create Dataset
                                    </button>
                                </form>
                            </div>
                        )}

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : datasets.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                                <p style={{ color: 'var(--text-tertiary)' }}>No datasets yet. Create your first dataset!</p>
                            </div>
                        ) : (
                            <div className="grid">
                                {datasets.map((dataset) => (
                                    <div key={dataset.id} className="card">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div style={{ flex: 1 }}>
                                                <h3>{dataset.name}</h3>
                                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                                    {dataset.metadata_summary || 'No description'}
                                                </p>
                                                {dataset.columns_list && (
                                                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                                                            Columns:
                                                        </div>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                                                            {dataset.columns_list.map((col, idx) => (
                                                                <code key={idx} style={{ fontSize: 'var(--text-xs)' }}>{col}</code>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                <div style={{ marginTop: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)' }}>
                                                    <a href={dataset.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-secondary">
                                                        View Dataset
                                                    </a>
                                                    <button onClick={() => handleDeleteDataset(dataset.id)} className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Students Tab */}
                {activeTab === 'students' && (
                    <div>
                        <h2>👥 Upload Student Roster</h2>
                        <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
                            <form onSubmit={handleUploadRoster}>
                                <div className="form-group">
                                    <label className="form-label">Student List (NIM, Name - one per line)</label>
                                    <textarea
                                        className="form-textarea"
                                        value={rosterText}
                                        onChange={(e) => setRosterText(e.target.value)}
                                        placeholder="12345678, John Doe&#10;87654321, Jane Smith"
                                        style={{ minHeight: '200px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}
                                        required
                                    />
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--spacing-sm)' }}>
                                        Format: NIM, Full Name (one student per line)
                                    </p>
                                </div>
                                <button type="submit" className="btn btn-success btn-lg" disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Upload Roster'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Grading Tab */}
                {activeTab === 'grading' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            <h2>📝 Student Grading</h2>
                            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setGradingPage(1);
                                    }}
                                    className="form-input"
                                    style={{ width: 'auto', cursor: 'pointer' }}
                                >
                                    <option value={10}>10 / page</option>
                                    <option value={20}>20 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Search by Name or NIM..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '250px' }}
                                />
                                <button type="submit" className="btn btn-primary">
                                    Search
                                </button>
                                {isSearching && (
                                    <button type="button" onClick={handleClearSearch} className="btn btn-secondary">
                                        Clear
                                    </button>
                                )}
                            </form>
                        </div>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 'var(--spacing-3xl)' }}>
                                <div className="spinner" style={{ margin: '0 auto' }}></div>
                            </div>
                        ) : students.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-3xl)', marginTop: 'var(--spacing-xl)' }}>
                                <p style={{ color: 'var(--text-tertiary)' }}>No students found. Upload a roster first.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid" style={{ marginTop: 'var(--spacing-xl)' }}>
                                    {students.map((studentData) => (
                                        <div key={studentData.student.nim} className="card">
                                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                                <h3 style={{ marginBottom: 'var(--spacing-xs)' }}>{studentData.student.name}</h3>
                                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 0 }}>
                                                    NIM: {studentData.student.nim}
                                                </p>
                                            </div>

                                            {!studentData.assignment ? (
                                                <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>No assignment yet</p>
                                            ) : (
                                                <>
                                                    <div style={{ padding: 'var(--spacing-md)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
                                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-xs)' }}>
                                                            Scenario:
                                                        </div>
                                                        <div style={{ fontSize: 'var(--text-sm)' }}>
                                                            {studentData.assignment.scenario.scenario_title}
                                                        </div>
                                                    </div>

                                                    {studentData.submissions.length > 0 && (
                                                        <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-sm)' }}>
                                                                Submissions:
                                                            </div>
                                                            {studentData.submissions.map((sub) => (
                                                                <div key={sub.id} style={{ marginBottom: 'var(--spacing-sm)' }}>
                                                                    <span className={`badge ${sub.submission_type === 'final' ? 'badge-success' : 'badge-primary'}`} style={{ marginRight: 'var(--spacing-sm)' }}>
                                                                        {sub.submission_type}
                                                                    </span>
                                                                    <a href={sub.link_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 'var(--text-sm)' }}>
                                                                        View
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {studentData.grade ? (
                                                        <div style={{ padding: 'var(--spacing-md)', background: '#dcfce7', borderRadius: 'var(--radius-md)' }}>
                                                            <div style={{ fontWeight: 600, color: '#166534', marginBottom: 'var(--spacing-xs)' }}>
                                                                Score: {studentData.grade.score}/100
                                                            </div>
                                                            {studentData.grade.feedback && (
                                                                <div style={{ fontSize: 'var(--text-sm)', color: '#166534' }}>
                                                                    {studentData.grade.feedback}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setSelectedStudent(studentData)}
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            Grade Student
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination Controls (Hide when searching) */}
                                {!isSearching && totalStudents > itemsPerPage && (
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xl)' }}>
                                        <button
                                            onClick={() => setGradingPage(p => Math.max(1, p - 1))}
                                            disabled={gradingPage === 1}
                                            className="btn btn-secondary"
                                            style={{ opacity: gradingPage === 1 ? 0.5 : 1 }}
                                        >
                                            Previous
                                        </button>
                                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 var(--spacing-md)' }}>
                                            Page {gradingPage} of {Math.ceil(totalStudents / itemsPerPage)}
                                        </span>
                                        <button
                                            onClick={() => setGradingPage(p => Math.min(Math.ceil(totalStudents / itemsPerPage), p + 1))}
                                            disabled={gradingPage >= Math.ceil(totalStudents / itemsPerPage)}
                                            className="btn btn-secondary"
                                            style={{ opacity: gradingPage >= Math.ceil(totalStudents / itemsPerPage) ? 0.5 : 1 }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Grading Modal */}
                        {selectedStudent && (
                            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                                <div className="card" style={{ maxWidth: '500px', width: '100%', margin: 'var(--spacing-lg)' }}>
                                    <h3>Grade {selectedStudent.student.name}</h3>
                                    <form onSubmit={handleSubmitGrade} style={{ marginTop: 'var(--spacing-lg)' }}>
                                        <div className="form-group">
                                            <label className="form-label">Score (0-100)</label>
                                            <input
                                                type="number"
                                                className="form-input"
                                                min="0"
                                                max="100"
                                                value={gradeForm.score}
                                                onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Feedback</label>
                                            <textarea
                                                className="form-textarea"
                                                value={gradeForm.feedback}
                                                onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                                placeholder="Optional feedback for the student"
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                            <button type="submit" className="btn btn-success" style={{ flex: 1 }}>
                                                Submit Grade
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedStudent(null);
                                                    setGradeForm({ score: '', feedback: '' });
                                                }}
                                                className="btn btn-secondary"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LecturerDashboard;
