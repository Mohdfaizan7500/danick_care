// api.js
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

// const BASE_URL = 'https://dummyjson.com/';
const BASE_URL = 'http://192.168.1.7:5001/';
// const BASE_URL = 'http://api.dainikcare.com/';




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
        console.log('responce:', response)
        // console.log('data:',response.data)
        if(response.data.success){
            return {
            success: response.data.success,
            data: response.data,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
        };
       

        }
         else{
            return {
                success: response.data.success,
                data: response.data
            };
        }


        
    } catch (error) {
        console.error('API error in loginApi:', error);
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

export const getAllSparePart = async (product_id) => {
    console.log('payload:', product_id)
    try {
        const response = await apiClient.post("TechnicianAPI/PartPriceList", {
            id: product_id
        });
        console.log('Spare part  response:', response);
        // Return the full response (or only data) so the caller can handle it
        return response; // or response.data depending on what you need
    } catch (error) {
        console.error('API error in getAllSparePart:', error);
        const errorMessage = getErrorMessage(error);
        // Throw an error so the calling component can catch it
        throw new Error(errorMessage);
    }
};


export const getAttendanceApi = async (id, month) => {
    console.log('getAttendanceApi called with id:', id, 'month:', month);
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianAttendenceList', {
            technician_id: id,
            month: month
        });
        // console.log('get all attendance response:', response);
        return response;
    } catch (error) {
        console.error('API error in getAttendanceApi:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const MarkAttandance = async (city_id, id, slot_date, month) => {
    console.log('MarkAttandance called with city id :', city_id, 'tech id:', id, "slot_date:", slot_date, "month:", month);
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianAttendence', {
            city_id: city_id,
            tech_id: id,
            slot_date: slot_date,
            month: month
        });
        console.log('MarkAttandance response:', response);
        return response;
    } catch (error) {
        console.error('API error in MarkAttandance:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getComplaints = async (id, status, page = 1) => {
    console.log("getComplaints called with:", { technician_id: id, status: status, page: page });
    try {
        // Send parameters as query parameters in URL
        const response = await apiClient.post('TechnicianAPI/TechnicianComplaints', null, {
            params: {
                technician_id: id,
                status: status,
                page: page
            }
        });
        console.log('Get complaints response:', response);
        return response;
    } catch (error) {
        console.error('API error in getComplaints:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};
export const getProfile = async (id) => {
    const payload = {
        id: id,
    }
    console.log("payload:", payload)
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianProfile', {
            technician_id: id,
        });
        console.log('Get profile response:', response);
        return response;
    } catch (error) {
        console.error('API error in getProfile:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

// api.js - Add this function
export const changePassword = async (payload) => {
    try {
        const response = await apiClient.post('TechnicianAPI/ChangePassword', payload);
        console.log('Change password response:', response);
        return response;
    } catch (error) {
        console.error('API error in changePassword:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getAMCList = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/AMCList', payload);
        console.log('Get AMC List response:', response);
        return response;
    } catch (error) {
        console.error('API error in getAMCList:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const technicianAssignPart = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianAssignPart', payload);
        console.log('technicianAssignPart response:', response);
        return response;
    } catch (error) {
        console.error('API error in technicianAssignPart:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};



export const getAllTechnician = async () => {
    // console.log('payload',payload)
    try {
        const response = await apiClient.post('TechnicianAPI/AllTechnician');
        console.log('getAllTechnician response:', response);
        return response;
    } catch (error) {
        console.error('API error in getAllTechnician:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getPartCount = async (payload) => {
    // console.log('payload',payload)
    try {
        const response = await apiClient.post('TechnicianAPI/TechnicianPartCount', payload);
        console.log('getPartCount response:', response);
        return response;
    } catch (error) {
        console.error('API error in getPartCount:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const partTransferToTechnician = async (payload) => {
    // console.log('payload',payload)
    try {
        const response = await apiClient.post('TechnicianAPI/PartTransferTechnician', payload);
        console.log('partTransferToTechnician response:', response);
        return response;
    } catch (error) {
        console.error('API error in partTransferToTechnician:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};
export const partTransferCancel = async (payload) => {
    // console.log('payload',payload)
    try {
        const response = await apiClient.post('TechnicianAPI/PartTransferCancel', payload);
        console.log('partTransferCancel response:', response);
        return response;
    } catch (error) {
        console.error('API error in partTransferCancel:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const partTransferReceive = async (payload) => {
    // console.log('payload',payload)
    try {
        const response = await apiClient.post('TechnicianAPI/PartTransferReceive', payload);
        console.log('partTransferReceive response:', response);
        return response;
    } catch (error) {
        console.error('API error in partTransferReceive:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const sendOTP = async (payload) => {
    // console.log('payload',payload)
    try {
        const response = await apiClient.post('TechnicianAPI/OTPSent', payload);
        console.log('sendOTP api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in sendOTP:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};
export const verifyOTP = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/OTPVerification', payload);
        console.log('OTPVerify api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in OTPVerify:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

// api.js - Update the UploadComplaintImage function
export const UploadComplaintImage = async (formData) => {
    console.log('Uploading image with formData');

    try {
        const response = await apiClient.post('/TechnicianAPI/UploadComplaintImage', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
        });
        console.log('UploadComplaintImage api response:', response);
        return response;
    } catch (error) {
        console.error('API error in UploadComplaintImage:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const GetComplaintImage = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/GetComplaintImage', payload);
        console.log('GetComplaintImage api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in GetComplaintImage:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const deletComplaintImage = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/DeleteComplaintImage', payload);
        console.log('deletComplaintImage api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in deletComplaintImage:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getComplaintImage = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/GetComplaintImage', payload);
        console.log('getComplaintImage api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in getComplaintImage:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const getDeshBoardCount = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/DashboardCount', payload);
        console.log('getDeshBoardCount api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in getDeshBoardCount:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const fetchPartsForComplaint = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/FetchPartForComplaints', payload);
        console.log('fetchPartsForComplaint api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in fetchPartsForComplaint:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AttechPartWithComplaints = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/AttachedPartWithComplaints', payload);
        console.log('AttechPartWithComplaints api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in AttechPartWithComplaints:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const FetchPartForComplaints = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/FetchComplaintsParts', payload);
        console.log('FetchPartForComplaints api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in FetchPartForComplaints:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const RecomplaitAttechPart = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/FetchRecomplaintAttachedPart', payload);
        console.log('RecomplaitAttechPart api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in RecomplaitAttechPart:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const FetchPartsForReplaced = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/FetchPartsForReplaced', payload);
        console.log('FetchPartsForReplaced api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in FetchPartsForReplaced:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const ReplacedPartManagement = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/ReplacedPartManagement', payload);
        console.log('ReplacedPartManagement api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in ReplacedPartManagement:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const UpdateRemark = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/UpdateRemark', payload);
        console.log('UpdateRemark api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in UpdateRemark:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const GetPartDetailQRCode = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/GetPartDetailQRCode', payload);
        console.log('GetPartDetailQRCode api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in GetPartDetailQRCode:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const PurchaseMarketPart = async (formData) => {
    console.log('formData', formData)
    try {
        const response = await apiClient.post('TechnicianAPI/PurchaseMarketPart', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
        });
        console.log('PurchaseMarketPart api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in PurchaseMarketPart:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const GetComplaintsDetails = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/GetComplaintsDetails', payload);
        console.log('GetComplaintsDetails api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in GetComplaintsDetails:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AssignQRCodeList = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/AssignQRCodeList', payload);
        console.log('AssignQRCodeList api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in AssignQRCodeList:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};

export const AssignQRCodeCount = async (payload) => {
    console.log('payload', payload)
    try {
        const response = await apiClient.post('TechnicianAPI/AssignQRCodeCount', payload);
        console.log('AssignQRCodeCount api  response:', response);
        return response;
    } catch (error) {
        console.error('API error in AssignQRCodeCount:', error);
        const errorMessage = getErrorMessage(error);
        throw new Error(errorMessage);
    }
};






// You can also export the apiClient for other uses if needed
export { apiClient };