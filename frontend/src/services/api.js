import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    studentLogin: (nim) => api.post('/auth/student/login', { nim }),
    lecturerLogin: (email, password) => api.post('/auth/lecturer/login', { email, password }),
    lecturerRegister: (email, password) => api.post('/auth/lecturer/register', { email, password }),
    uploadRoster: (students) => api.post('/auth/students/upload-roster', { students }),
};

// Dataset API
export const datasetAPI = {
    getAll: () => api.get('/datasets'),
    create: (dataset) => api.post('/datasets', dataset),
    delete: (id) => api.delete(`/datasets/${id}`),
};

// Assignment API
export const assignmentAPI = {
    getMy: () => api.get('/assignments/me'),
    regenerate: (student_nim) => api.post('/assignments/regenerate', { student_nim }),
};

// Chat API
export const chatAPI = {
    getMessages: (assignmentId) => api.get(`/chat/${assignmentId}/messages`),
    sendMessage: (assignmentId, content) => api.post(`/chat/${assignmentId}/message`, { content }),
};

// Submission API
export const submissionAPI = {
    getByAssignment: (assignmentId) => api.get(`/submissions/${assignmentId}`),
    create: (assignmentId, linkUrl, submissionType) =>
        api.post('/submissions', { assignment_id: assignmentId, link_url: linkUrl, submission_type: submissionType }),
};

// Grading API
export const gradingAPI = {
    getAllStudents: (page, limit) => api.get('/grading/students', { params: { page, limit } }),
    submitGrade: (assignmentId, score, feedback) =>
        api.post('/grading/grade', { assignment_id: assignmentId, score, feedback }),
};

export const searchAPI = {
    searchStudents: (query) => api.get(`/grading/search/${query}`),
};

export default api;
