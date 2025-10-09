import axios from 'axios';

const API_URL = '/api/auth/';

// Register user
const register = async (userData) => {
    const response = await axios.post(API_URL + 'register', userData);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Login user
const login = async (userData) => {
    const response = await axios.post(API_URL + 'login', userData);
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

// Logout user
const logout = () => {
    localStorage.removeItem('user');
};

// Get current user
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

// Refresh token
const refreshToken = async () => {
    const user = getCurrentUser();
    if (!user || !user.refreshToken) return null;
    const response = await axios.post(API_URL + 'refresh-token', {
        refreshToken: user.refreshToken,
    });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getCurrentUser,
    refreshToken,
};

export default authService;