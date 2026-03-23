// api.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'https://dummyjson.com/';
const BASE_URL = 'http://192.168.1.3:5001/';




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
    // console.log('technician id:',username,typeof(username));
    // console.log('Password:',password,typeof(password));

    try {
        const response = await apiClient.post("TechnicianAPI/Login", {
            technician_id: username,
            password: password,
            expiresInMins: 30, // optional
        });
        console.log('responce:',response)
        // console.log('data:',response.data)


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


export const getAllSparePartcategories = async (cityId) => {
    try {
        const response = await apiClient.post("TechnicianAPI/Services", {
            city_id: cityId
        });
        console.log('Spare part categories response:', response);
        // Return the full response (or only data) so the caller can handle it
        return response; // or response.data depending on what you need
    } catch (error) {
        console.error('API error in getAllSparePartcategories:', error);
        const errorMessage = getErrorMessage(error);
        // Throw an error so the calling component can catch it
        throw new Error(errorMessage);
    }
};


// You can also export the apiClient for other uses if needed
export { apiClient };