// api.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'https://dummyjson.com/';
// const BASE_URL = 'http://192.168.1.48:5001/';
// const BASE_URL = 'http://10.33.83.35:5001/';

const BASE_URL = 'https://api.dainikcare.com/';




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
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            // For React Native, we don't have window.location; use navigation or redirect logic elsewhere
        }
        return Promise.reject(error);
    }
);

// Helper to extract error message
const getErrorMessage = (error) => {
    return error.response?.data?.msg ||
        error.response?.data?.error ||
        error.message ||
        'An unexpected error occurred';
};

// Login function for React Native
export const loginApi = async (username, password, fcmToken) => {

    try {
        const response = await apiClient.post("TechnicianAPI/Login", {
            technician_id: username,
            password: password,
            fcmToken: fcmToken,
            expiresInMins: 30, // optional
        });
        if (response.data.success) {
            return {
                success: response.data.success,
                data: response.data,
                accessToken: response.data.accessToken,
                refreshToken: response.data.refreshToken,
            };


        }
        else {
            return {
                success: response.data.success,
                data: response.data
            };
        }



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
        // Return the full response (or only data) so the caller can handle it
        return response; // or response.data depending on what you need
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        // Throw an error so the calling component can catch it
        throw new Error(errorMessage);
    }
};

export const getAllSparePart = async (product_id) => {
    try {
        const response = await apiClient.post("TechnicianAPI/PartPriceList", {
            id: product_id
        });
        // Return the full response (or only data) so the caller can handle it
        return response; // or response.data depending on what you need
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        // Throw an error so the calling component can catch it
        throw new Error(errorMessage);
    }
};


export const getAttendanceApi = async (id, month) => {
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianAttendenceList', {
            technician_id: id,
            month: month
        });
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const MarkAttandance = async (city_id, id, slot_date, month) => {
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianAttendence', {
            city_id: city_id,
            tech_id: id,
            slot_date: slot_date,
            month: month
        });
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getComplaints = async (id, status, page = 1) => {
    try {
        // Send parameters as query parameters in URL
        const response = await apiClient.post('TechnicianAPI/TechnicianComplaints', null, {
            params: {
                technician_id: id,
                status: status,
                page: page
            }
        });
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};
export const getProfile = async (id) => {
    const payload = {
        id: id,
    }
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianProfile', {
            technician_id: id,
        });
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

// api.js - Add this function
export const changePassword = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ChangePassword', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getAMCList = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AMCList', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AMCConvertList = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AMCConvertList', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AMCQRCodeInsertPart = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AMCQRCodeInsertPart', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AMCQRCodeRemove = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/RemoveAMCQRCode', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};


export const technicianAssignPart = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianAssignPart', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};



export const getAllTechnician = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AllTechnician', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getPartCount = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianPartCount', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const partTransferToTechnician = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/PartTransferTechnician', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};
export const partTransferCancel = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/PartTransferCancel', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const partTransferReceive = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/PartTransferReceive', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const sendOTP = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/OTPSent', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};
export const verifyOTP = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/OTPVerification', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

// api.js - Update the UploadComplaintImage function
export const UploadComplaintImage = async (formData) => {

    try {
        const response = await apiClient.post('/TechnicianAPI/UploadComplaintImage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
        });
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const GetComplaintImage = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/GetComplaintImage', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const deletComplaintImage = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/DeleteComplaintImage', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getComplaintImage = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/GetComplaintImage', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getDeshBoardCount = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/DashboardCount', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const fetchPartsForComplaint = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/FetchPartForComplaints', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AttechPartWithComplaints = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AttachedPartWithComplaints', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const FetchPartForComplaints = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/FetchComplaintsParts', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const RecomplaitAttechPart = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/FetchRecomplaintAttachedPart', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const FetchPartsForReplaced = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/FetchPartsForReplaced', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const ReplacedPartManagement = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ReplacedPartManagement', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const UpdateRemark = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/UpdateRemark', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const GetPartDetailQRCode = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/GetPartDetailQRCode', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const PurchaseMarketPart = async (formData) => {
    try {
        const response = await apiClient.post('TechnicianAPI/PurchaseMarketPart', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
        });
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const GetComplaintsDetails = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/GetComplaintsDetails', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AssignQRCodeList = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AssignQRCodeList', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AssignQRCodeCount = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AssignQRCodeCount', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};


export const ComplaintBilling = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ComplaintBilling', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const logoutApi = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/Logout', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const CommissionPayout = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/CommissionPayout', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const ReplacePartsCount = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ReplacePartsCount', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const TechnicianReplacePart = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianReplacePart', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AMCPartQRCodeUpdatePart = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AMCPartQRCodeUpdatePart', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const RemoveAMCPart = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/RemoveAMCPart', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const PendingComplaints = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/PendingComplaints', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AcceptComplaint = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AcceptComplaint', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const PendingComplaintCount = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/PendingComplaintCount', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const TechnicianServices = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianServices', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const ProceedAMC = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ProceedAMC', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const CheckProceedAMC = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/CheckProceedAMC', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AMCComplaintDetails = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AMCComplaintDetails', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};
export const DeletAMCRecordWithParts = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/DeleteAMCRecordWithParts', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AMCBilling = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/AMCBilling', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

// Update your api.js file
// api.js - This is already correct
export const TechnicianAMC = async (payload, params = {}) => {
    try {
        // If params are provided, append them to the URL
        let url = 'TechnicianAPI/TechnicianAMC';
        if (params && Object.keys(params).length > 0) {
            const queryParams = new URLSearchParams(params).toString();
            url = `${url}?${queryParams}`;
        }

        const response = await apiClient.post(url, payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};
export const GetAMCDetails = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/GetAMCDetails', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};


export const FetchNotification = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/FetchNotification', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};


export const ReadNotification = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ReadNotification', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const TermsSupport = async () => {
    try {
        const response = await apiClient.post('TechnicianAPI/TermsSupport');
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const ReverseComplaint = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ReverseComplaint', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const ContactImport = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ContactImport', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const RescheduleComplaint = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/RescheduleComplaint', payload);
        return response;
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};



// Get CSN Complaints
// Get CSN Complaints - FIXED with query parameter
export const CSNComplaints = async (payload) => {
    try {
        // Send csn as query parameter, not in body
        const response = await apiClient.post('/TechnicianAPI/CSNComplaints', null, {
            params: {
                csn: payload.csn
            }
        });
        return response;
    } catch (error) {
        if (error.message === 'Network Error') {
            throw new Error('Network error: Please check your internet connection and try again.');
        }
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};


// You can also export the apiClient for other uses if needed
export { apiClient };
