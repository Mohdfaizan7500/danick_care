// ComplaintDetail.js - Add the dashboard refresh calls
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Linking,
    ScrollView,
    Image,
    Platform,
    PermissionsAndroid,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { launchCamera } from 'react-native-image-picker';
import { sendOTP, verifyOTP, UploadComplaintImage, ReverseComplaint } from '../../../lib/api';
import { check, request, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { useDashboard } from '../../../context/DashboardContext'; // Import the dashboard context

// Check if Android version is 15 (API 35) or higher
const isAndroid15OrHigher = () => {
    if (Platform.OS === 'android') {
        const androidVersion = Platform.Version;
        const apiLevel = typeof androidVersion === 'string'
            ? parseInt(androidVersion, 10)
            : androidVersion;
        return apiLevel >= 35;
    }
    return false;
};

const ComplaintDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { complaint } = route.params;
    const { triggerRefresh } = useDashboard(); // Get the refresh trigger function
    console.log('complaint:', complaint)

    // OTP flow states
    const [jobStarted, setJobStarted] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '']);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [sendingOTP, setSendingOTP] = useState(false);
    const [generatedOTP, setGeneratedOTP] = useState('');
    const [otpResponseData, setOtpResponseData] = useState(null);
    const [complaintData, setComplaintData] = useState(complaint);
    const inputRefs = useRef([]);

    // Keyboard state
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const scrollViewRef = useRef(null);

    // Location states
    const [currentLocation, setCurrentLocation] = useState(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);

    // Camera states
    const [photoUri, setPhotoUri] = useState(null);
    const [sendingPhoto, setSendingPhoto] = useState(false);

    // Reverse reason states
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [reasonText, setReasonText] = useState('');
    const [submittingReverse, setSubmittingReverse] = useState(false);
    const submitTimeoutRef = useRef(null);

    // Check if complaint status is complete (success)
    const isComplete = complaint.status === 'success';

    // Check if OTP is already verified (verify_otp is "1")
    const isOtpAlreadyVerified = complaint.verify_otp === "1";

    // Keyboard listeners for Android 15+
    useEffect(() => {
        if (isAndroid15OrHigher()) {
            const keyboardDidShowListener = Keyboard.addListener(
                'keyboardDidShow',
                (event) => {
                    setKeyboardVisible(true);
                    setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                }
            );
            const keyboardDidHideListener = Keyboard.addListener(
                'keyboardDidHide',
                () => {
                    setKeyboardVisible(false);
                }
            );

            return () => {
                keyboardDidShowListener.remove();
                keyboardDidHideListener.remove();
            };
        }
    }, []);

    // Location permission and getting current location
    const checkLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                console.log('iOS location permission status:', status);
                return status;
            } else {
                const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
                console.log('Android location permission status:', status);
                return status;
            }
        } catch (error) {
            console.log('Permission check error:', error);
            return RESULTS.UNAVAILABLE;
        }
    };

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                return await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            } else {
                return await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            }
        } catch (error) {
            console.log('Permission request error:', error);
            return RESULTS.UNAVAILABLE;
        }
    };

    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            let timeoutId;

            const successCallback = (position) => {
                if (timeoutId) clearTimeout(timeoutId);
                const { latitude, longitude } = position.coords;
                console.log('=== LOCATION OBTAINED IN COMPLAINT DETAIL ===');
                console.log('Latitude:', latitude);
                console.log('Longitude:', longitude);
                console.log('Accuracy:', position.coords.accuracy);
                console.log('=============================================');
                resolve({
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    accuracy: position.coords.accuracy
                });
            };

            const errorCallback = (error) => {
                if (timeoutId) clearTimeout(timeoutId);
                console.log('Location error code:', error.code);
                console.log('Location error message:', error.message);

                let errorMessage = 'Failed to get location';
                if (error.code === 1) {
                    errorMessage = 'Location permission denied';
                } else if (error.code === 2) {
                    errorMessage = 'Location unavailable. Please enable GPS.';
                } else if (error.code === 3) {
                    errorMessage = 'Location request timed out. Please try again.';
                }

                reject(new Error(errorMessage));
            };

            timeoutId = setTimeout(() => {
                errorCallback({ code: 3, message: 'Location request timed out after 15 seconds' });
            }, 15000);

            Geolocation.getCurrentPosition(successCallback, errorCallback, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
            });
        });
    };

    const initializeLocation = async (retryCount = 0) => {
        const maxRetries = 2;

        try {
            console.log('Initializing location, attempt:', retryCount + 1);

            let permissionStatus = await checkLocationPermission();
            console.log('Current permission status:', permissionStatus);

            if (permissionStatus === RESULTS.GRANTED) {
                setHasLocationPermission(true);
                setIsGettingLocation(true);

                try {
                    const location = await getCurrentLocation();
                    setCurrentLocation(location);
                    console.log('✅ LOCATION SUCCESSFULLY OBTAINED');
                    console.log('Latitude:', location.latitude);
                    console.log('Longitude:', location.longitude);
                    toast.custom(
                        <StatusMessage type="success" title="Location obtained successfully" />,
                        { duration: 2000 }
                    );
                    return location;
                } catch (error) {
                    console.log('Error getting location:', error.message);

                    if (retryCount < maxRetries) {
                        console.log(`Retrying location fetch (${retryCount + 1}/${maxRetries})...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return initializeLocation(retryCount + 1);
                    }

                    toast.custom(
                        <StatusMessage type="error" title={error.message} />,
                        { duration: 3000 }
                    );
                    return null;
                } finally {
                    setIsGettingLocation(false);
                }
            }

            if (permissionStatus === RESULTS.DENIED) {
                console.log('Permission denied, requesting...');
                const requestStatus = await requestLocationPermission();
                console.log('Request result:', requestStatus);

                if (requestStatus === RESULTS.GRANTED) {
                    setHasLocationPermission(true);
                    setIsGettingLocation(true);
                    try {
                        const location = await getCurrentLocation();
                        setCurrentLocation(location);
                        console.log('✅ LOCATION SUCCESSFULLY OBTAINED AFTER PERMISSION');
                        toast.custom(
                            <StatusMessage type="success" title="Location obtained successfully" />,
                            { duration: 2000 }
                        );
                        return location;
                    } catch (error) {
                        console.log('Error getting location:', error.message);
                        toast.custom(
                            <StatusMessage type="error" title={error.message} />,
                            { duration: 3000 }
                        );
                        return null;
                    } finally {
                        setIsGettingLocation(false);
                    }
                } else {
                    setHasLocationPermission(false);
                    toast.custom(
                        <StatusMessage type="error" title="Location permission is required for OTP verification" />,
                        { duration: 3000 }
                    );
                    return null;
                }
            }

            if (permissionStatus === RESULTS.BLOCKED) {
                setHasLocationPermission(false);
                Alert.alert(
                    'Location Permission Required',
                    'This app requires location permission for OTP verification. Please enable location access in settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => openSettings() },
                    ]
                );
                return null;
            }

            return null;
        } catch (error) {
            console.log('Location initialization error:', error);
            setIsGettingLocation(false);
            return null;
        }
    };

    // Check if OTP is already verified from the complaint data
    useEffect(() => {
        if (isComplete) {
            return;
        }

        if (complaint.verify_otp === "1") {
            console.log('OTP already verified for this complaint');
            setVerified(true);
            setJobStarted(true);
            setOtpResponseData({
                customer_name: complaint.customer_name,
                contact_no: complaint.customer_mobile,
                id: complaint.id
            });
        }

        if (complaint.upload_image === "1" && complaint.verify_otp === "1") {
            console.log('Upload image already completed, navigating to remarks screen');
            navigation.replace('Remarkscreen', {
                complaintData: complaint,
                isVerified: complaint.verify_otp === "1",
                isImageUploaded: true
            });
        }
    }, [complaint, navigation, isComplete]);

    useEffect(() => {
        if (!isComplete && !isOtpAlreadyVerified && !verified) {
            initializeLocation();
        }
    }, [isComplete, isOtpAlreadyVerified, verified]);

    useEffect(() => {
        if (!isComplete) {
            navigation.setOptions({
                gestureEnabled: !verified && !isOtpAlreadyVerified,
            });
        }
    }, [verified, navigation, isComplete, isOtpAlreadyVerified]);

    useEffect(() => {
        return () => {
            if (submitTimeoutRef.current) {
                clearTimeout(submitTimeoutRef.current);
            }
        };
    }, []);

    const handlePhoneCall = () => {
        const phoneNumber = complaintData.customer_mobile;
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                toast.custom(
                    <StatusMessage
                        type="error"
                        title="Could not open dialer"
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            });
        } else {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="No phone number available"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
        }
    };

    const handleOpenMaps = () => {
        const address = complaintData.service_address;
        if (address) {
            const encodedAddress = encodeURIComponent(address);
            Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`).catch(() => {
                toast.custom(
                    <StatusMessage
                        type="error"
                        title="Could not open maps"
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            });
        } else {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="No address available"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
        }
    };

    const handleReverse = async () => {
        if (submittingReverse) return;

        if (!showReasonInput) {
            setShowReasonInput(true);
            setTimeout(() => {
                const reasonInput = inputRefs.current['reason'];
                if (reasonInput) {
                    reasonInput.focus();
                }
            }, 100);
        } else {
            if (!reasonText.trim()) {
                toast.custom(
                    <StatusMessage
                        type="error"
                        title="Please enter a reason"
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                return;
            }

            setSubmittingReverse(true);

            try {
                const payload = {
                    id: complaintData.id.toString(),
                    remark: reasonText.trim()
                };

                console.log('Reverse Complaint Payload:', payload);

                const response = await ReverseComplaint(payload);
                console.log('Reverse Complaint Response:', response);

                if (response && response.data && response.data.success) {
                    toast.custom(
                        <StatusMessage
                            type="success"
                            title={response.data.msg || "Complaint reversed successfully"}
                            className="mx-4 mb-6"
                        />,
                        { duration: 2000 }
                    );

                    // 🔄 Refresh dashboard counts after successful reverse
                    await triggerRefresh();

                    setTimeout(() => {
                        navigation.goBack();
                    }, 2000);
                } else {
                    toast.custom(
                        <StatusMessage
                            type="error"
                            title={response?.data?.msg || response?.data?.message || "Failed to reverse complaint"}
                            className="mx-4 mb-6"
                        />,
                        { duration: 3000 }
                    );
                    setSubmittingReverse(false);
                    setShowReasonInput(false);
                    setReasonText('');
                }
            } catch (error) {
                console.error('Error reversing complaint:', error);

                let errorMessage = "Failed to reverse complaint. Please try again.";

                if (error.response) {
                    errorMessage = error.response.data?.msg ||
                        error.response.data?.message ||
                        error.response.statusText ||
                        errorMessage;
                    console.log('Error response data:', error.response.data);
                } else if (error.request) {
                    errorMessage = "Network error. Please check your connection.";
                } else {
                    errorMessage = error.message || errorMessage;
                }

                toast.custom(
                    <StatusMessage
                        type="error"
                        title={errorMessage}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                setSubmittingReverse(false);
            }
        }
    };

    const handleStartJob = async (complaint) => {
        if (complaint.verify_otp === "1") {
            toast.custom(
                <StatusMessage
                    type="info"
                    title="Job already started and verified"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return;
        }

        if (!hasLocationPermission) {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Location permission is required to start job"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            const location = await initializeLocation();
            if (!location) {
                return;
            }
        }

        let location = currentLocation;
        if (!location) {
            setIsGettingLocation(true);
            try {
                location = await getCurrentLocation();
                setCurrentLocation(location);

                console.log('=== LOCATION DETAILS (Start Job) ===');
                console.log('Latitude:', location.latitude);
                console.log('Longitude:', location.longitude);
                console.log('=====================================');

            } catch (error) {
                console.log('Error getting location:', error);
                toast.custom(
                    <StatusMessage
                        type="error"
                        title={error.message || "Unable to get current location. Please enable GPS."}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                setIsGettingLocation(false);
                return;
            }
            setIsGettingLocation(false);
        } else {
            console.log('=== EXISTING LOCATION DETAILS (Start Job) ===');
            console.log('Latitude:', location.latitude);
            console.log('Longitude:', location.longitude);
        }

        const payload = {
            complaint_id: complaint.id,
            mobile: complaint.customer_mobile
        };
        console.log('Send OTP payload:', payload);

        setSendingOTP(true);

        try {
            const response = await sendOTP(payload);
            console.log('sendOTP response:', response);

            if (response && response.data && response.data.success) {
                if (response.data.otp) {
                    setGeneratedOTP(response.data.otp);
                    console.log('Generated OTP:', response.data.otp);
                }

                setJobStarted(true);
                setShowOtp(true);

                toast.custom(
                    <StatusMessage
                        type="success"
                        title={response.data.msg || "OTP sent to customer"}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            } else {
                toast.custom(
                    <StatusMessage
                        type="error"
                        title={response?.data?.msg || "Failed to send OTP"}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            toast.custom(
                <StatusMessage
                    type="error"
                    title={error.response?.data?.msg || error.message || "Failed to send OTP. Please try again."}
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
        } finally {
            setSendingOTP(false);
        }
    };

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];

        if (text === '') {
            newOtp[index] = '';
            setOtp(newOtp);
            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
            return;
        }

        if (/^\d+$/.test(text)) {
            newOtp[index] = text;
            setOtp(newOtp);
            if (index < 4) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (otp[index] === '' && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');

        if (enteredOtp.length !== 5) {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Please enter complete 5-digit OTP"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return;
        }

        if (!hasLocationPermission) {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Location permission is required for verification"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            const location = await initializeLocation();
            if (!location) {
                return;
            }
        }

        let location = currentLocation;
        if (!location) {
            setIsGettingLocation(true);
            try {
                location = await getCurrentLocation();
                setCurrentLocation(location);

                console.log('=== LOCATION DETAILS (OTP Verification) ===');
                console.log('Latitude:', location.latitude);
                console.log('Longitude:', location.longitude);

            } catch (error) {
                console.log('Error getting location:', error);
                toast.custom(
                    <StatusMessage
                        type="error"
                        title={error.message || "Unable to get current location. Please enable GPS."}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                setIsGettingLocation(false);
                return;
            }
            setIsGettingLocation(false);
        } else {
            console.log('=== EXISTING LOCATION DETAILS (OTP Verification) ===');
            console.log('Latitude:', location.latitude);
            console.log('Longitude:', location.longitude);
        }

        setVerifying(true);

        try {
            const payload = {
                mobile: complaintData.customer_mobile,
                complaint_id: complaintData.id.toString(),
                otp: enteredOtp,
                latitude: location.latitude,
                longitude: location.longitude
            };

            console.log('Verifying OTP with payload:', payload);

            const response = await verifyOTP(payload);
            console.log('OTP verification response:', response);

            if (response && response.data && response.data.success) {
                setOtpResponseData(response.data.result);
                setVerified(true);
                setShowOtp(false);

                if (response.data.result && response.data.result.length > 0) {
                    const updatedComplaint = response.data.result[0];
                    setComplaintData(prev => ({
                        ...prev,
                        ...updatedComplaint,
                        verify_otp: "1"
                    }));
                }

                // 🔄 Refresh dashboard counts after successful OTP verification
                await triggerRefresh();

                toast.custom(
                    <StatusMessage
                        type="success"
                        title="OTP verified successfully!"
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            } else {
                setVerifying(false);
                setOtp(['', '', '', '', '']);

                toast.custom(
                    <StatusMessage
                        type="error"
                        title={response?.data?.msg || "Invalid OTP. Please try again."}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            }

        } catch (error) {
            console.error('Error verifying OTP:', error);
            setVerifying(false);
            setOtp(['', '', '', '', '']);

            const errorMessage = error.response?.data?.msg ||
                error.response?.data?.message ||
                "Failed to verify OTP. Please try again.";

            toast.custom(
                <StatusMessage
                    type="error"
                    title={errorMessage}
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
        }
    };

    // Camera functions
    const checkCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'App needs camera access to take photo for job completion.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const handleTakePhoto = async () => {
        const hasPermission = await checkCameraPermission();
        if (!hasPermission) {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Camera permission denied"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
            saveToPhotos: false,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera error: ', response.error);
                toast.custom(
                    <StatusMessage
                        type="error"
                        title={`Camera error: ${response.error}`}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            } else if (response.assets && response.assets[0]) {
                setPhotoUri(response.assets[0].uri);
                console.log('Photo URI:', response.assets[0].uri);
            }
        });
    };

    const handleDeletePhoto = () => {
        setPhotoUri(null);
    };

    const handleSendPhoto = async () => {
        if (!photoUri) {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Please take a photo first"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return;
        }

        setSendingPhoto(true);

        try {
            const formData = new FormData();
            const fileUri = photoUri;
            const fileName = fileUri.split('/').pop();
            const fileType = 'image/jpeg';

            formData.append('image', {
                uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
                name: fileName || `photo_${Date.now()}.jpg`,
                type: fileType,
            });

            formData.append('complaint_id', complaintData.id.toString());
            formData.append('image_type', 'before working');
            formData.append('status', '1');

            console.log('Uploading image with params:', {
                complaint_id: complaintData.id,
                image_type: 'before working',
                status: '1',
                fileName: fileName,
                fileUri: fileUri
            });

            const response = await UploadComplaintImage(formData);
            console.log('Upload response:', response);

            if (response && response.data && response.data.success) {
                toast.custom(
                    <StatusMessage
                        type="success"
                        title={response.data.msg || "Photo uploaded successfully!"}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );

                navigation.replace('Remarkscreen', {
                    customerData: otpResponseData,
                    complaintData: complaintData,
                    isVerified: true,
                    photoUploaded: true,
                    imageType: 'before working'
                });
            } else {
                toast.custom(
                    <StatusMessage
                        type="error"
                        title={response?.data?.msg || response?.data?.message || "Failed to upload photo"}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                setSendingPhoto(false);
            }

        } catch (error) {
            console.error('Error uploading photo:', error);
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }
            toast.custom(
                <StatusMessage
                    type="error"
                    title={error.response?.data?.msg || error.response?.data?.message || error.message || "Failed to upload photo. Please try again."}
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            setSendingPhoto(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dateString;
    };

    const getStatusDisplay = () => {
        const status = complaintData.status;
        switch (status) {
            case 'assign':
                return 'Assigned';
            case 'in_progress':
                return 'In Progress';
            case 'onworking':
                return 'On Working';
            case 'pending':
                return 'Pending';
            case 'complete':
                return 'Complete';
            case 'cancel':
                return 'Cancel';
            default:
                return status || 'Assigned';
        }
    };

    const getStatusColorClass = () => {
        const status = complaintData.status;
        switch (status) {
            case 'assign':
                return 'bg-primary-sage100';
            case 'in_progress':
                return 'bg-ui-warning/20';
            case 'onworking':
                return 'bg-blue-100';
            case 'pending':
                return 'bg-ui-secondary/20';
            case 'complete':
                return 'bg-ui-success/20';
            case 'cancel':
                return 'bg-ui-error/20';
            default:
                return 'bg-gray-100';
        }
    };

    const getStatusTextColorClass = () => {
        const status = complaintData.status;
        switch (status) {
            case 'assign':
                return 'text-primary-sage700';
            case 'in_progress':
                return 'text-ui-warning';
            case 'onworking':
                return 'text-blue-600';
            case 'pending':
                return 'text-text-secondary';
            case 'complete':
                return 'text-ui-success';
            case 'cancel':
                return 'text-ui-error';
            default:
                return 'text-text-tertiary';
        }
    };

    const showVerifiedContent = verified || isOtpAlreadyVerified;

    const renderContent = () => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
                <View className="flex-row items-center justify-between">
                    <Text className="text-text-primary text-2xl font-bold mb-2">
                        {complaintData.service_name}
                    </Text>
                </View>

                <View className={`self-start px-4 py-2 rounded-full mb-2 ${getStatusColorClass()}`}>
                    <Text className={`text-sm font-medium ${getStatusTextColorClass()}`}>
                        {getStatusDisplay()}
                    </Text>
                </View>

                {!isComplete && !showVerifiedContent && (
                    <View className="mb-4">
                        <View className={`flex-row items-center ${hasLocationPermission && currentLocation ? 'bg-green-50' : 'bg-yellow-50'} p-2 rounded-lg`}>
                            <Icon
                                name="location-outline"
                                size={20}
                                color={hasLocationPermission && currentLocation ? "#10b981" : "#eab308"}
                            />
                            <Text className={`ml-2 text-sm ${hasLocationPermission && currentLocation ? 'text-green-700' : 'text-yellow-700'}`}>
                                {isGettingLocation ? 'Getting location...' :
                                    hasLocationPermission && currentLocation ? 'Location ready for verification' :
                                        'Location permission required for OTP verification'}
                            </Text>
                        </View>
                    </View>
                )}

                {!isComplete && (
                    <>
                        {!showVerifiedContent && showOtp && (
                            <View className="mb-6">
                                <Text className="text-text-primary text-base mb-3 text-center">
                                    Enter 5-digit OTP sent to customer
                                </Text>
                                <View className="flex-row justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            className="w-12 h-14 border border-ui-border rounded-xl text-center text-2xl font-bold text-text-primary bg-background-secondary"
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={(text) => handleOtpChange(text, index)}
                                            onKeyPress={(e) => handleKeyPress(e, index)}
                                            selectTextOnFocus
                                            editable={!verifying && !showVerifiedContent}
                                        />
                                    ))}
                                </View>

                                <TouchableOpacity
                                    onPress={handleVerifyOtp}
                                    disabled={verifying || showVerifiedContent || isGettingLocation}
                                    className={`mt-4 py-3 rounded-xl items-center ${verifying || isGettingLocation ? 'bg-ui-secondary' : 'bg-primary-sage600'
                                        }`}
                                >
                                    {verifying || isGettingLocation ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-text-inverse font-semibold">Verify OTP</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {showVerifiedContent && (
                            <View className="bg-ui-success/10 border border-ui-success rounded-xl p-3 mb-4">
                                <View className="flex-row items-center">
                                    <Icon name="checkmark-circle" size={20} color="#58A890" />
                                    <Text className="text-ui-success font-bold ml-2">Job Verified</Text>
                                </View>
                                <Text className="text-text-primary text-sm mt-1">
                                    {complaintData.customer_name} • {complaintData.customer_mobile}
                                </Text>
                                {currentLocation && (
                                    <Text className="text-text-tertiary text-xs mt-1">
                                        Location: {currentLocation.latitude}, {currentLocation.longitude}
                                    </Text>
                                )}
                            </View>
                        )}

                        {showVerifiedContent && (
                            <View className="mb-6">
                                <Text className="text-text-primary text-base mb-2 font-semibold">
                                    Take Before Working Photo
                                </Text>
                                {!photoUri ? (
                                    <TouchableOpacity
                                        onPress={handleTakePhoto}
                                        className="border-2 border-dashed border-ui-border rounded-xl p-6 items-center justify-center bg-background-secondary mb-4"
                                    >
                                        <Icon name="camera-outline" size={40} color="#666" />
                                        <Text className="text-text-primary font-semibold text-base mt-2">
                                            Take Photo
                                        </Text>
                                        <Text className="text-text-tertiary text-sm text-center mt-1">
                                            Tap to open camera
                                        </Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="relative mb-4">
                                        <Image
                                            source={{ uri: photoUri }}
                                            className="w-full h-48 rounded-xl bg-gray-200"
                                            resizeMode="cover"
                                        />
                                        <TouchableOpacity
                                            onPress={handleDeletePhoto}
                                            className="absolute top-2 right-2 bg-black/50 rounded-full p-1"
                                        >
                                            <Icon name="close-outline" size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <TouchableOpacity
                                    onPress={handleSendPhoto}
                                    className={`py-4 rounded-xl items-center ${sendingPhoto || !photoUri ? 'bg-ui-disabled' : 'bg-ui-success'
                                        }`}
                                    disabled={sendingPhoto || !photoUri}
                                >
                                    {sendingPhoto ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-text-inverse font-semibold text-base">
                                            Upload Photo
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                <View className="bg-ui-card border border-ui-border rounded-xl p-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-black font-semibold text-lg">
                            Customer Information
                        </Text>
                        <View className="flex-row">
                            <TouchableOpacity onPress={handlePhoneCall} className="mr-4">
                                <Icon name="call-outline" size={22} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleOpenMaps}>
                                <Icon name="location-outline" size={22} color="#000" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-2">
                        <Icon name="person-outline" size={18} color="#666" />
                        <Text className="text-text-primary text-base ml-2">
                            {complaintData.customer_name}
                        </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                        <Icon name="location-outline" size={18} color="#666" />
                        <Text className="text-text-secondary text-base ml-2 flex-1">
                            {complaintData.service_address}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handlePhoneCall}
                        className="flex-row items-center"
                    >
                        <Icon name="call-outline" size={18} color="#666" />
                        <Text className="text-[#666] text-base ml-2">{complaintData.customer_mobile}</Text>
                    </TouchableOpacity>
                </View>

                <View className="bg-ui-card border border-ui-border rounded-xl p-4 mb-4">
                    <Text className="text-text-primary font-semibold text-lg mb-2">
                        Service Details
                    </Text>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-text-secondary">Service Name:</Text>
                        <Text className="text-text-primary font-medium">{complaintData.service_name}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-text-secondary">CSN:</Text>
                        <Text className="text-text-primary font-medium">{complaintData.csn}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-text-secondary">Total Amount:</Text>
                        <Text className="text-text-primary font-medium">₹{complaintData.tot_amt}</Text>
                    </View>
                    {complaintData.slot_date && (
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-text-secondary">Slot Date:</Text>
                            <Text className="text-text-primary font-medium">{formatDate(complaintData.slot_date)}</Text>
                        </View>
                    )}
                    {complaintData.slot_time && (
                        <View className="flex-row justify-between">
                            <Text className="text-text-secondary">Slot Time:</Text>
                            <Text className="text-text-primary font-medium">{complaintData.slot_time}</Text>
                        </View>
                    )}
                </View>

                {!isComplete && (
                    <>
                        {showReasonInput && (
                            <View className="mb-4">
                                <TextInput
                                    ref={(el) => (inputRefs.current['reason'] = el)}
                                    className="border border-ui-border rounded-xl p-3 bg-background-secondary text-text-primary"
                                    placeholder="Enter reason for reversal"
                                    placeholderTextColor="#999"
                                    value={reasonText}
                                    onChangeText={setReasonText}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>
                        )}

                        <View className="flex-row justify-between mt-2 mb-6">
                            <TouchableOpacity
                                onPress={handleReverse}
                                disabled={submittingReverse}
                                className={`px-6 py-3 rounded-xl flex-1 mr-2 items-center ${submittingReverse
                                    ? 'bg-ui-disabled'
                                    : showReasonInput && reasonText.trim()
                                        ? 'bg-ui-success'
                                        : 'bg-ui-secondary/20'
                                    }`}
                            >
                                {submittingReverse ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text
                                        className={`font-semibold ${showReasonInput && reasonText.trim()
                                            ? 'text-text-inverse'
                                            : 'text-text-secondary'
                                            }`}
                                    >
                                        Reverse
                                    </Text>
                                )}
                            </TouchableOpacity>

                            {!showVerifiedContent && !jobStarted && (
                                <TouchableOpacity
                                    onPress={() => handleStartJob(complaintData)}
                                    disabled={verifying || sendingOTP || isGettingLocation}
                                    className={`px-6 py-3 rounded-xl flex-1 ml-2 items-center ${verifying || sendingOTP || isGettingLocation ? 'bg-ui-disabled' : 'bg-primary-sage600'
                                        }`}
                                >
                                    {sendingOTP || isGettingLocation ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text
                                            className={`font-semibold ${verifying || sendingOTP ? 'text-text-disabled' : 'text-text-inverse'
                                                }`}
                                        >
                                            Start Job
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
            </View>
        </TouchableWithoutFeedback>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-primary">
            <View className="absolute inset-0 z-50 pointer-events-none">
                <Toaster />
            </View>
            <Header
                title={`Complaint #${complaintData.id || complaintData.complaintNumber || complaintData.csn}`}
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5 text-text-primary"
                showBackButton={true}
                backButtonColor="#333333"
                containerStyle="bg-background-primary flex-row items-center justify-between px-4 py-4 border-gray-200"
            />

            {isAndroid15OrHigher() ? (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    <ScrollView
                        ref={scrollViewRef}
                        className="flex-1 px-4 pt-4"
                        contentContainerStyle={{ paddingBottom: keyboardVisible ? 250 : 30 }}
                        showsVerticalScrollIndicator={true}
                        keyboardShouldPersistTaps="handled"
                    >
                        {renderContent()}
                    </ScrollView>
                </KeyboardAvoidingView>
            ) : (
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-4 pt-4"
                    contentContainerStyle={{ paddingBottom: 30 }}
                    showsVerticalScrollIndicator={true}
                    keyboardShouldPersistTaps="handled"
                >
                    {renderContent()}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

export default ComplaintDetail;