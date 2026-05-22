// ComplaintDetail.js - Complete with timer, fine warning, and back-only camera (Vision Camera)
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
    Modal,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { sendOTP, verifyOTP, UploadComplaintImage, ReverseComplaint } from '../../../lib/api';
import { check, request, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { useDashboard } from '../../../context/DashboardContext';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

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

// Custom Camera Modal - Forces back camera only
const CustomCameraModal = ({ visible, onClose, onCapture }) => {
    const device = useCameraDevice('back'); // Only back camera
    const { hasPermission, requestPermission } = useCameraPermission();
    const cameraRef = useRef(null);

    useEffect(() => {
        if (visible && !hasPermission) {
            requestPermission();
        }
    }, [visible, hasPermission, requestPermission]);

    const takePhoto = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'quality',
                flash: 'off',
            });
            const uri = `file://${photo.path}`;
            onCapture(uri);
            onClose();
        } catch (error) {
            console.error('Failed to take photo:', error);
            Alert.alert('Error', 'Could not take photo. Please try again.');
        }
    };

    if (!visible) return null;

    if (!hasPermission) {
        return (
            <Modal transparent animationType="slide" visible={visible}>
                <View style={styles.modalContainer}>
                    <View style={styles.permissionBox}>
                        <Text style={styles.permissionText}>Camera permission required</Text>
                        <TouchableOpacity
                            style={styles.permissionButton}
                            onPress={requestPermission}
                        >
                            <Text style={styles.permissionButtonText}>Grant Permission</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closePermissionText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    if (!device) {
        return (
            <Modal transparent animationType="slide" visible={visible}>
                <View style={styles.modalContainer}>
                    <Text style={styles.errorText}>No back camera available on this device</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal transparent={false} animationType="slide" visible={visible}>
            <View style={StyleSheet.absoluteFill}>
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    photo={true}
                />
                <View style={styles.cameraControls}>
                    <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                        <View style={styles.innerCaptureButton} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeCameraButton} onPress={onClose}>
                        <Icon name="close" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const ComplaintDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { complaint } = route.params;
    const { triggerRefresh } = useDashboard();
    console.log('complaint:', complaint);

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
    const [isInitializingLocation, setIsInitializingLocation] = useState(true);

    // Camera states
    const [photoUri, setPhotoUri] = useState(null);
    const [sendingPhoto, setSendingPhoto] = useState(false);
    const [showCamera, setShowCamera] = useState(false); // For custom camera modal

    // Reverse reason states
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [reasonText, setReasonText] = useState('');
    const [submittingReverse, setSubmittingReverse] = useState(false);
    const submitTimeoutRef = useRef(null);

    // Timer states
    const [timerRemainingSeconds, setTimerRemainingSeconds] = useState(0);
    const [timerExpired, setTimerExpired] = useState(false);
    const timerIntervalRef = useRef(null);

    // Check if complaint status is complete (success)
    const isComplete = complaint.status === 'success';

    // Check if OTP is already verified (verify_otp is "1")
    const isOtpAlreadyVerified = complaint.verify_otp === "1";

    // --- Timer Logic: extract date_time, add 10 minutes, countdown ---
    useEffect(() => {
        if (!isComplete && !isOtpAlreadyVerified && !verified && complaint.date_time) {
            // Parse date_time
            const [datePart, timePart] = complaint.date_time.split(' ');
            const [year, month, day] = datePart.split('-');
            const [hours, minutes, seconds] = timePart.split(':');
            const complaintDate = new Date(year, month - 1, day, hours, minutes, seconds);
            const targetDate = new Date(complaintDate.getTime() + 10 * 60 * 1000);

            const updateTimer = () => {
                const now = new Date();
                const diff = targetDate - now;
                if (diff <= 0) {
                    setTimerRemainingSeconds(0);
                    setTimerExpired(true);
                    if (timerIntervalRef.current) {
                        clearInterval(timerIntervalRef.current);
                        timerIntervalRef.current = null;
                    }
                } else {
                    setTimerRemainingSeconds(Math.floor(diff / 1000));
                    // DO NOT setTimerExpired(false) here – once expired, stays expired
                }
            };

            updateTimer();
            timerIntervalRef.current = setInterval(updateTimer, 1000);

            return () => {
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            };
        } else {
            // Do NOT reset timerExpired here – keep it as is
            // Only clear the interval if it's running
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        }
    }, [complaint.date_time, isComplete, isOtpAlreadyVerified, verified]);

    const formatTimer = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Location permission and getting current location
    const checkLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                return status;
            } else {
                const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
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
                resolve({
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    accuracy: position.coords.accuracy,
                });
            };
            const errorCallback = (error) => {
                if (timeoutId) clearTimeout(timeoutId);
                let errorMessage = 'Failed to get location';
                if (error.code === 1) errorMessage = 'Location permission denied';
                else if (error.code === 2) errorMessage = 'Location unavailable. Please enable GPS.';
                else if (error.code === 3) errorMessage = 'Location request timed out. Please try again.';
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
            let permissionStatus = await checkLocationPermission();
            if (permissionStatus === RESULTS.GRANTED) {
                setHasLocationPermission(true);
                setIsGettingLocation(true);
                try {
                    const location = await getCurrentLocation();
                    setCurrentLocation(location);
                    toast.custom(<StatusMessage type="success" title="Location obtained successfully" />, { duration: 2000 });
                    return location;
                } catch (error) {
                    if (retryCount < maxRetries) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return initializeLocation(retryCount + 1);
                    }
                    toast.custom(<StatusMessage type="error" title={error.message} />, { duration: 3000 });
                    return null;
                } finally {
                    setIsGettingLocation(false);
                }
            } else if (permissionStatus === RESULTS.DENIED) {
                const requestStatus = await requestLocationPermission();
                if (requestStatus === RESULTS.GRANTED) {
                    setHasLocationPermission(true);
                    setIsGettingLocation(true);
                    try {
                        const location = await getCurrentLocation();
                        setCurrentLocation(location);
                        toast.custom(<StatusMessage type="success" title="Location obtained successfully" />, { duration: 2000 });
                        return location;
                    } catch (error) {
                        toast.custom(<StatusMessage type="error" title={error.message} />, { duration: 3000 });
                        return null;
                    } finally {
                        setIsGettingLocation(false);
                    }
                } else {
                    setHasLocationPermission(false);
                    toast.custom(<StatusMessage type="error" title="Location permission is required for OTP verification" />, { duration: 3000 });
                    return null;
                }
            } else if (permissionStatus === RESULTS.BLOCKED) {
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
            setIsGettingLocation(false);
            return null;
        }
    };

    // Check if OTP is already verified
    useEffect(() => {
        if (isComplete) {
            setIsInitializingLocation(false);
            return;
        }
        if (complaint.verify_otp === "1") {
            setVerified(true);
            setJobStarted(true);
            setOtpResponseData({
                customer_name: complaint.customer_name,
                contact_no: complaint.customer_mobile,
                id: complaint.id,
            });
            setIsInitializingLocation(false);
        }
        if (complaint.upload_image === "1" && complaint.verify_otp === "1") {
            navigation.replace('ConetToAMCScreen', {
                complaintData: complaint,
                isVerified: true,
                isImageUploaded: true,
            });
        }
    }, [complaint, navigation, isComplete]);

    useEffect(() => {
        if (!isComplete && !isOtpAlreadyVerified && !verified) {
            const initLocation = async () => {
                await initializeLocation();
                setIsInitializingLocation(false);
            };
            initLocation();
        } else {
            setIsInitializingLocation(false);
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
            if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, []);

    const handlePhoneCall = () => {
        const phoneNumber = complaintData.customer_mobile;
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                toast.custom(<StatusMessage type="error" title="Could not open dialer" className="mx-4 mb-6" />, { duration: 3000 });
            });
        } else {
            toast.custom(<StatusMessage type="error" title="No phone number available" className="mx-4 mb-6" />, { duration: 3000 });
        }
    };

    const handleOpenMaps = () => {
        const address = complaintData.service_address;
        if (address) {
            const encodedAddress = encodeURIComponent(address);
            Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`).catch(() => {
                toast.custom(<StatusMessage type="error" title="Could not open maps" className="mx-4 mb-6" />, { duration: 3000 });
            });
        } else {
            toast.custom(<StatusMessage type="error" title="No address available" className="mx-4 mb-6" />, { duration: 3000 });
        }
    };

    const handleReverse = async () => {
        if (submittingReverse) return;
        if (timerExpired && !showReasonInput) {
            Alert.alert(
                "Fine Warning",
                "10 minute ho gaye. Ab reverse karne par ₹100 ka fine lagega. Kya aap continue karna chahte hain?",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Continue", onPress: () => setShowReasonInput(true) },
                ]
            );
            return;
        }
        if (!showReasonInput) {
            setShowReasonInput(true);
            setTimeout(() => {
                const reasonInput = inputRefs.current['reason'];
                if (reasonInput) reasonInput.focus();
            }, 100);
        } else {
            if (!reasonText.trim()) {
                toast.custom(<StatusMessage type="error" title="Please enter a reason" className="mx-4 mb-6" />, { duration: 3000 });
                return;
            }
            setSubmittingReverse(true);
            try {
                const payload = { id: complaintData.id.toString(), remark: reasonText.trim() };
                const response = await ReverseComplaint(payload);
                if (response?.data?.success) {
                    toast.custom(<StatusMessage type="success" title={response.data.msg || "Complaint reversed successfully"} className="mx-4 mb-6" />, { duration: 2000 });
                    await triggerRefresh();
                    setTimeout(() => navigation.goBack(), 2000);
                } else {
                    toast.custom(<StatusMessage type="error" title={response?.data?.msg || "Failed to reverse complaint"} className="mx-4 mb-6" />, { duration: 3000 });
                    setSubmittingReverse(false);
                    setShowReasonInput(false);
                    setReasonText('');
                }
            } catch (error) {
                console.error('Reverse error:', error);
                toast.custom(<StatusMessage type="error" title="Failed to reverse complaint. Please try again." className="mx-4 mb-6" />, { duration: 3000 });
                setSubmittingReverse(false);
            }
        }
    };

    const handleStartJob = async (complaint) => {
        if (complaint.verify_otp === "1") {
            toast.custom(<StatusMessage type="info" title="Job already started and verified" className="mx-4 mb-6" />, { duration: 3000 });
            return;
        }
        if (!hasLocationPermission) {
            toast.custom(<StatusMessage type="error" title="Location permission is required to start job" className="mx-4 mb-6" />, { duration: 3000 });
            const location = await initializeLocation();
            if (!location) return;
        }
        let location = currentLocation;
        if (!location) {
            setIsGettingLocation(true);
            try {
                location = await getCurrentLocation();
                setCurrentLocation(location);
            } catch (error) {
                toast.custom(<StatusMessage type="error" title={error.message || "Unable to get current location. Please enable GPS."} className="mx-4 mb-6" />, { duration: 3000 });
                setIsGettingLocation(false);
                return;
            }
            setIsGettingLocation(false);
        }
        const payload = { complaint_id: complaint.id, mobile: complaint.customer_mobile };
        setSendingOTP(true);
        try {
            const response = await sendOTP(payload);
            if (response?.data?.success) {
                if (response.data.otp) setGeneratedOTP(response.data.otp);
                setJobStarted(true);
                setShowOtp(true);
                toast.custom(<StatusMessage type="success" title={response.data.msg || "OTP sent to customer"} className="mx-4 mb-6" />, { duration: 3000 });
            } else {
                toast.custom(<StatusMessage type="error" title={response?.data?.msg || "Failed to send OTP"} className="mx-4 mb-6" />, { duration: 3000 });
            }
        } catch (error) {
            toast.custom(<StatusMessage type="error" title={error.response?.data?.msg || error.message || "Failed to send OTP"} className="mx-4 mb-6" />, { duration: 3000 });
        } finally {
            setSendingOTP(false);
        }
    };

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        if (text === '') {
            newOtp[index] = '';
            setOtp(newOtp);
            if (index > 0) inputRefs.current[index - 1]?.focus();
            return;
        }
        if (/^\d+$/.test(text)) {
            newOtp[index] = text;
            setOtp(newOtp);
            if (index < 4) inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 5) {
            toast.custom(<StatusMessage type="error" title="Please enter complete 5-digit OTP" className="mx-4 mb-6" />, { duration: 3000 });
            return;
        }
        if (!hasLocationPermission) {
            toast.custom(<StatusMessage type="error" title="Location permission is required for verification" className="mx-4 mb-6" />, { duration: 3000 });
            const location = await initializeLocation();
            if (!location) return;
        }
        let location = currentLocation;
        if (!location) {
            setIsGettingLocation(true);
            try {
                location = await getCurrentLocation();
                setCurrentLocation(location);
            } catch (error) {
                toast.custom(<StatusMessage type="error" title={error.message || "Unable to get current location"} className="mx-4 mb-6" />, { duration: 3000 });
                setIsGettingLocation(false);
                return;
            }
            setIsGettingLocation(false);
        }
        setVerifying(true);
        try {
            const payload = {
                mobile: complaintData.customer_mobile,
                complaint_id: complaintData.id.toString(),
                otp: enteredOtp,
                latitude: location.latitude,
                longitude: location.longitude,
            };
            const response = await verifyOTP(payload);
            if (response?.data?.success) {
                setOtpResponseData(response.data.result);
                setVerified(true);
                setShowOtp(false);
                if (response.data.result?.length > 0) {
                    const updated = response.data.result[0];
                    setComplaintData(prev => ({ ...prev, ...updated, verify_otp: "1" }));
                }
                await triggerRefresh();
                toast.custom(<StatusMessage type="success" title="OTP verified successfully!" className="mx-4 mb-6" />, { duration: 3000 });
            } else {
                setVerifying(false);
                setOtp(['', '', '', '', '']);
                toast.custom(<StatusMessage type="error" title={response?.data?.msg || "Invalid OTP. Please try again."} className="mx-4 mb-6" />, { duration: 3000 });
            }
        } catch (error) {
            setVerifying(false);
            setOtp(['', '', '', '', '']);
            toast.custom(<StatusMessage type="error" title={error.response?.data?.msg || "Failed to verify OTP"} className="mx-4 mb-6" />, { duration: 3000 });
        }
    };

    // Camera handling with Vision Camera
    const handleTakePhoto = () => {
        setShowCamera(true);
    };

    const handleCameraCapture = (uri) => {
        setPhotoUri(uri);
        setShowCamera(false);
    };

    const handleDeletePhoto = () => {
        setPhotoUri(null);
    };

    const handleSendPhoto = async () => {
        if (!photoUri) {
            toast.custom(<StatusMessage type="error" title="Please take a photo first" className="mx-4 mb-6" />, { duration: 3000 });
            return;
        }
        setSendingPhoto(true);
        try {
            const formData = new FormData();
            const fileName = photoUri.split('/').pop();
            formData.append('image', {
                uri: Platform.OS === 'ios' ? photoUri.replace('file://', '') : photoUri,
                name: fileName || `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            formData.append('complaint_id', complaintData.id.toString());
            formData.append('image_type', 'before working');
            formData.append('status', '1');
            const response = await UploadComplaintImage(formData);
            if (response?.data?.success) {
                toast.custom(<StatusMessage type="success" title={response.data.msg || "Photo uploaded successfully!"} className="mx-4 mb-6" />, { duration: 3000 });
                navigation.replace('ConetToAMCScreen', {
                    customerData: otpResponseData,
                    complaintData: complaintData,
                    isVerified: true,
                    photoUploaded: true,
                    imageType: 'before working',
                });
            } else {
                toast.custom(<StatusMessage type="error" title={response?.data?.msg || "Failed to upload photo"} className="mx-4 mb-6" />, { duration: 3000 });
                setSendingPhoto(false);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.custom(<StatusMessage type="error" title="Failed to upload photo. Please try again." className="mx-4 mb-6" />, { duration: 3000 });
            setSendingPhoto(false);
        }
    };

    const formatDate = (dateString) => dateString || 'N/A';

    const getStatusDisplay = () => {
        const status = complaintData.status;
        switch (status) {
            case 'assign': return 'Assigned';
            case 'in_progress': return 'In Progress';
            case 'onworking': return 'On Working';
            case 'pending': return 'Pending';
            case 'complete': return 'Complete';
            case 'cancel': return 'Cancel';
            default: return status || 'Assigned';
        }
    };

    const getStatusColorClass = () => {
        const status = complaintData.status;
        switch (status) {
            case 'assign': return 'bg-primary-sage100';
            case 'in_progress': return 'bg-ui-warning/20';
            case 'onworking': return 'bg-blue-100';
            case 'pending': return 'bg-ui-secondary/20';
            case 'complete': return 'bg-ui-success/20';
            case 'cancel': return 'bg-ui-error/20';
            default: return 'bg-gray-100';
        }
    };

    const getStatusTextColorClass = () => {
        const status = complaintData.status;
        switch (status) {
            case 'assign': return 'text-primary-sage700';
            case 'in_progress': return 'text-ui-warning';
            case 'onworking': return 'text-blue-600';
            case 'pending': return 'text-text-secondary';
            case 'complete': return 'text-ui-success';
            case 'cancel': return 'text-ui-error';
            default: return 'text-text-tertiary';
        }
    };

    const showVerifiedContent = verified || isOtpAlreadyVerified;

    const renderContent = () => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
                <View className="flex-row items-center justify-between">
                    <Text className="text-text-primary text-2xl font-bold mb-2">{complaintData.service_name}</Text>
                </View>
                <View className={`self-start px-4 py-2 rounded-full mb-2 ${getStatusColorClass()}`}>
                    <Text className={`text-sm font-medium ${getStatusTextColorClass()}`}>{getStatusDisplay()}</Text>
                </View>
                {!isComplete && !showVerifiedContent && (
                    <View className="mb-4">
                        <View className={`flex-row items-center ${hasLocationPermission && currentLocation ? 'bg-green-50' : 'bg-yellow-50'} p-2 rounded-lg`}>
                            <Icon name="location-outline" size={20} color={hasLocationPermission && currentLocation ? "#10b981" : "#eab308"} />
                            <Text className={`ml-2 text-sm ${hasLocationPermission && currentLocation ? 'text-green-700' : 'text-yellow-700'}`}>
                                {isGettingLocation ? 'Fetching location...' : hasLocationPermission && currentLocation ? 'Location ready' : 'Location permission required'}
                            </Text>
                        </View>
                    </View>
                )}
                {!isComplete && (
                    <>
                        {!showVerifiedContent && showOtp && (
                            <View className="mb-6">
                                <Text className="text-text-primary text-base mb-3 text-center">Enter 5-digit OTP sent to customer</Text>
                                <View className="flex-row justify-center gap-2">
                                    {otp.map((digit, index) => (
                                        <TextInput
                                            key={index}
                                            ref={el => (inputRefs.current[index] = el)}
                                            className="w-12 h-14 border border-ui-border rounded-xl text-center text-2xl font-bold text-text-primary bg-background-secondary"
                                            keyboardType="number-pad"
                                            maxLength={1}
                                            value={digit}
                                            onChangeText={text => handleOtpChange(text, index)}
                                            onKeyPress={e => handleKeyPress(e, index)}
                                            selectTextOnFocus
                                            editable={!verifying && !showVerifiedContent}
                                        />
                                    ))}
                                </View>
                                <TouchableOpacity
                                    onPress={handleVerifyOtp}
                                    disabled={verifying || showVerifiedContent || isGettingLocation}
                                    className={`mt-4 py-3 rounded-xl items-center ${verifying || isGettingLocation ? 'bg-ui-secondary' : 'bg-primary-sage600'}`}
                                >
                                    {verifying || isGettingLocation ? <ActivityIndicator color="#fff" /> : <Text className="text-text-inverse font-semibold">Verify OTP</Text>}
                                </TouchableOpacity>
                            </View>
                        )}
                        {showVerifiedContent && (
                            <View className="bg-ui-success/10 border border-ui-success rounded-xl p-3 mb-4">
                                <View className="flex-row items-center">
                                    <Icon name="checkmark-circle" size={20} color="#58A890" />
                                    <Text className="text-ui-success font-bold ml-2">Job Verified</Text>
                                </View>
                                <Text className="text-text-primary text-sm mt-1">{complaintData.customer_name} • {complaintData.customer_mobile}</Text>
                            </View>
                        )}
                        {showVerifiedContent && (
                            <View className="mb-6">
                                <Text className="text-text-primary text-base mb-2 font-semibold">Take Before Working Photo</Text>
                                {!photoUri ? (
                                    <TouchableOpacity onPress={handleTakePhoto} className="border-2 border-dashed border-ui-border rounded-xl p-6 items-center justify-center bg-background-secondary mb-4">
                                        <Icon name="camera-outline" size={40} color="#666" />
                                        <Text className="text-text-primary font-semibold text-base mt-2">Take Photo</Text>
                                        <Text className="text-text-tertiary text-sm text-center mt-1">Tap to open camera (Back camera only)</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="relative mb-4">
                                        <Image source={{ uri: photoUri }} className="w-full h-48 rounded-xl bg-gray-200" resizeMode="cover" />
                                        <TouchableOpacity onPress={handleDeletePhoto} className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                                            <Icon name="close-outline" size={24} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={handleSendPhoto}
                                    className={`py-4 rounded-xl items-center ${sendingPhoto || !photoUri ? 'bg-ui-disabled' : 'bg-ui-success'}`}
                                    disabled={sendingPhoto || !photoUri}
                                >
                                    {sendingPhoto ? <ActivityIndicator color="#fff" /> : <Text className="text-text-inverse font-semibold text-base">Upload Photo</Text>}
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
                <View className="bg-ui-card border border-ui-border rounded-xl p-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-black font-semibold text-lg">Customer Information</Text>
                        <View className="flex-row">
                            <TouchableOpacity onPress={handlePhoneCall} className="mr-4"><Icon name="call-outline" size={22} color="#000" /></TouchableOpacity>
                            <TouchableOpacity onPress={handleOpenMaps}><Icon name="location-outline" size={22} color="#000" /></TouchableOpacity>
                        </View>
                    </View>
                    <View className="flex-row items-center mb-2"><Icon name="person-outline" size={18} color="#666" /><Text className="text-text-primary text-base ml-2">{complaintData.customer_name}</Text></View>
                    <View className="flex-row items-center mb-2"><Icon name="location-outline" size={18} color="#666" /><Text className="text-text-secondary text-base ml-2 flex-1">{complaintData.service_address}</Text></View>
                    <TouchableOpacity onPress={handlePhoneCall} className="flex-row items-center"><Icon name="call-outline" size={18} color="#666" /><Text className="text-[#666] text-base ml-2">{complaintData.customer_mobile}</Text></TouchableOpacity>
                </View>
                <View className="bg-ui-card border border-ui-border rounded-xl p-4 mb-4">
                    <Text className="text-text-primary font-semibold text-lg mb-2">Service Details</Text>
                    <View className="flex-row justify-between mb-2"><Text className="text-text-secondary">Service Name:</Text><Text className="text-text-primary font-medium">{complaintData.service_name}</Text></View>
                    <View className="flex-row justify-between mb-2"><Text className="text-text-secondary">CSN:</Text><Text className="text-text-primary font-medium">{complaintData.csn}</Text></View>
                    <View className="flex-row justify-between mb-2"><Text className="text-text-secondary">Total Amount:</Text><Text className="text-text-primary font-medium">₹{complaintData.tot_amt}</Text></View>
                    {complaintData.slot_date && <View className="flex-row justify-between mb-2"><Text className="text-text-secondary">Slot Date:</Text><Text className="text-text-primary font-medium">{formatDate(complaintData.slot_date)}</Text></View>}
                    {complaintData.slot_time && <View className="flex-row justify-between"><Text className="text-text-secondary">Slot Time:</Text><Text className="text-text-primary font-medium">{complaintData.slot_time}</Text></View>}
                </View>
                {!isComplete && (
                    <>
                        {timerRemainingSeconds > 0 && !showVerifiedContent && (
                            <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center"><Icon name="time-outline" size={20} color="#2563eb" /><Text className="text-blue-700 font-semibold ml-2">Reverse karne ka time bacha:</Text></View>
                                    <Text className="text-blue-800 font-bold text-lg">{formatTimer(timerRemainingSeconds)}</Text>
                                </View>
                                <Text className="text-blue-600 text-xs mt-1">10 minute ke andar reverse karein, nahi toh ₹100 fine lagega.</Text>
                            </View>
                        )}
                        {timerExpired && !showVerifiedContent && (
                            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                <View className="flex-row items-center"><Icon name="alert-circle-outline" size={20} color="#dc2626" /><Text className="text-red-700 font-semibold ml-2">Time Ho Gaya!</Text></View>
                                <Text className="text-red-600 text-sm mt-1">10 minute complete ho gaye. Ab reverse karne par ₹100 ka fine lagega.</Text>
                            </View>
                        )}
                        {showReasonInput && (
                            <View className="mb-4">
                                <TextInput ref={el => (inputRefs.current['reason'] = el)} className="border border-ui-border rounded-xl p-3 bg-background-secondary text-text-primary" placeholder="Enter reason for reversal" placeholderTextColor="#999" value={reasonText} onChangeText={setReasonText} multiline numberOfLines={3} />
                            </View>
                        )}
                        <View className="flex-row justify-between mt-2 mb-6">
                            <TouchableOpacity onPress={handleReverse} disabled={submittingReverse} className={`px-6 py-3 rounded-xl flex-1 mr-2 items-center ${submittingReverse ? 'bg-ui-disabled' : (showReasonInput && reasonText.trim() ? 'bg-ui-success' : 'bg-ui-secondary/20')}`}>
                                {submittingReverse ? <ActivityIndicator color="#fff" /> : <Text className={`font-semibold ${showReasonInput && reasonText.trim() ? 'text-text-inverse' : 'text-text-secondary'}`}>Reverse</Text>}
                            </TouchableOpacity>
                            {!showVerifiedContent && !jobStarted && (
                                <TouchableOpacity onPress={() => handleStartJob(complaintData)} disabled={verifying || sendingOTP || isGettingLocation} className={`px-6 py-3 rounded-xl flex-1 ml-2 items-center ${verifying || sendingOTP || isGettingLocation ? 'bg-ui-disabled' : 'bg-primary-sage600'}`}>
                                    {sendingOTP || isGettingLocation ? <ActivityIndicator color="#fff" /> : <Text className="font-semibold text-text-inverse">Start Job</Text>}
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                )}
            </View>
        </TouchableWithoutFeedback>
    );

    if (isInitializingLocation && !isComplete && !isOtpAlreadyVerified && !verified) {
        return (
            <SafeAreaView className="flex-1 bg-background-primary">
                <Header title={`Complaint #${complaintData.csn}`} titlePosition="left" titleStyle="font-bold text-2xl ml-5 text-text-primary" showBackButton backButtonColor="#333333" containerStyle="bg-background-primary flex-row items-center justify-between px-4 py-4 border-gray-200" />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#58A890" />
                    <Text className="mt-4 text-text-secondary">Fetching location...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background-primary">
            <View className="absolute inset-0 z-50 pointer-events-none"><Toaster /></View>
            <Header title={`Complaint #${complaintData.csn}`} titlePosition="left" titleStyle="font-bold text-2xl ml-5 text-text-primary" showBackButton backButtonColor="#333333" containerStyle="bg-background-primary flex-row items-center justify-between px-4 py-4 border-gray-200" />
            {isAndroid15OrHigher() ? (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                    <ScrollView ref={scrollViewRef} className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: keyboardVisible ? 250 : 30 }} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled">
                        {renderContent()}
                    </ScrollView>
                </KeyboardAvoidingView>
            ) : (
                <ScrollView ref={scrollViewRef} className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator keyboardShouldPersistTaps="handled">
                    {renderContent()}
                </ScrollView>
            )}
            {/* Custom Camera Modal */}
            <CustomCameraModal visible={showCamera} onClose={() => setShowCamera(false)} onCapture={handleCameraCapture} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraControls: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'gray',
    },
    innerCaptureButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    closeCameraButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 12,
        borderRadius: 40,
    },
    permissionBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    permissionText: {
        fontSize: 18,
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#58A890',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    permissionButtonText: { color: 'white', fontWeight: 'bold' },
    closePermissionText: { marginTop: 15, color: 'red' },
    errorText: { color: 'white', fontSize: 18, marginBottom: 20 },
    closeText: { color: 'white', fontSize: 16 },
});

export default ComplaintDetail;