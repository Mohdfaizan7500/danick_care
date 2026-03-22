// api.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://dummyjson.com/';

const apiClient = axios.create({
    baseURL: BASE_URL,
});

// Request interceptor – add token if exists
apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem("accessToken");
        if (token) {
            config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor – handle 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            console.error("Authentication error: Token may be expired or invalid");
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            // For React Native, we don't have window.location; use navigation or redirect logic elsewhere
        }
        return Promise.reject(error);
    }
);

// Helper to extract error message
const getErrorMessage = (error) => {
    return error.response?.data?.message ||
           error.response?.data?.error ||
           error.message ||
           'An unexpected error occurred';
};

// Login function for React Native
export const loginApi = async (username, password) => {
    try {
        const response = await apiClient.post("/auth/login", {
            username: username,
            password: password,
            expiresInMins: 30, // optional
        });

        return {
            success: true,
            data: response.data,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
        };
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return {
            success: false,
            error: errorMessage,
            status: error.response?.status,
        };
    }
};

// You can also export the apiClient for other uses if needed
export { apiClient };