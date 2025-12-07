import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userType, setUserType] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored auth on mount
        const storedUser = localStorage.getItem('user');
        const storedUserType = localStorage.getItem('userType');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedUserType && storedToken) {
            setUser(JSON.parse(storedUser));
            setUserType(storedUserType);
        }
        setLoading(false);
    }, []);

    const login = (userData, type, token) => {
        setUser(userData);
        setUserType(type);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('userType', type);
        localStorage.setItem('token', token);
    };

    const logout = () => {
        setUser(null);
        setUserType(null);
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('token');
    };

    const value = {
        user,
        userType,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isStudent: userType === 'student',
        isLecturer: userType === 'lecturer',
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
