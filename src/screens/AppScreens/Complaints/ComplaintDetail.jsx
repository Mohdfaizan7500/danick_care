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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { launchCamera } from 'react-native-image-picker';
import { sendOTP, verifyOTP, UploadComplaintImage } from '../../../lib/api';
import { check, request, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const ComplaintDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { complaint } = route.params;
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

    // Location permission and getting current location
    const checkLocationPermission = async () => {
        try {
            if (Platform.OS === 'ios') {
                return await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            } else {
                return await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
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
                console.log('Latitude:', latitude);
                console.log('Longitude:', longitude);
                resolve({ latitude: latitude.toString(), longitude: longitude.toString() });
            };

            const errorCallback = (error) => {
                if (timeoutId) clearTimeout(timeoutId);
                console.log('Location error:', error);
                
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

            // Set timeout to reject if location takes too long
            timeoutId = setTimeout(() => {
                errorCallback({ code: 3, message: 'Location request timed out' });
            }, 10000);

            Geolocation.getCurrentPosition(successCallback, errorCallback, {
                enableHighAccuracy: false,
                timeout: 8000,
                maximumAge: 30000,
            });
        });
    };

    const initializeLocation = async () => {
        try {
            let permissionStatus = await checkLocationPermission();
            console.log('Initial permission:', permissionStatus);

            if (permissionStatus === RESULTS.GRANTED) {
                setHasLocationPermission(true);
                setIsGettingLocation(true);
                try {
                    const location = await getCurrentLocation();
                    setCurrentLocation(location);
                    console.log('=== LOCATION OBTAINED ===');
                    console.log('Latitude:', location.latitude);
                    console.log('Longitude:', location.longitude);
                    console.log('========================');
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
            }

            if (permissionStatus === RESULTS.DENIED) {
                const requestStatus = await requestLocationPermission();
                console.log('After request:', requestStatus);

                if (requestStatus === RESULTS.GRANTED) {
                    setHasLocationPermission(true);
                    setIsGettingLocation(true);
                    try {
                        const location = await getCurrentLocation();
                        setCurrentLocation(location);
                        console.log('=== LOCATION OBTAINED ===');
                        console.log('Latitude:', location.latitude);
                        console.log('Longitude:', location.longitude);
                        console.log('========================');
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
        } catch (error) {
            console.log('Location initialization error:', error);
            setIsGettingLocation(false);
            return null;
        }
    };

    // Check if OTP is already verified from the complaint data
    useEffect(() => {
        // If complaint is complete, skip OTP checks
        if (isComplete) {
            return;
        }

        // Check if the complaint already has verify_otp flag set to "1"
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

        // Check if upload_image is "1", navigate directly to next screen
        if (complaint.upload_image === "1") {
            console.log('Upload image already completed, navigating to remarks screen');
            navigation.replace('Remarkscreen', {
                complaintData: complaint,
                isVerified: complaint.verify_otp === "1",
                isImageUploaded: true
            });
        }
    }, [complaint, navigation, isComplete]);

    // Initialize location when component mounts (only if not already verified)
    useEffect(() => {
        if (!isComplete && !isOtpAlreadyVerified && !verified) {
            initializeLocation();
        }
    }, [isComplete, isOtpAlreadyVerified, verified]);

    // Disable swipe back gesture when verified
    useEffect(() => {
        if (!isComplete) {
            navigation.setOptions({
                gestureEnabled: !verified && !isOtpAlreadyVerified,
            });
        }
    }, [verified, navigation, isComplete, isOtpAlreadyVerified]);

    // Cleanup timeout on unmount
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

    const handleReverse = () => {
        if (submittingReverse) return;

        if (!showReasonInput) {
            setShowReasonInput(true);
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

            submitTimeoutRef.current = setTimeout(() => {
                toast.custom(
                    <StatusMessage
                        type="success"
                        title="Reverse submitted"
                        className="mx-4 mb-6"
                    />,
                    { duration: 2000 }
                );
                navigation.goBack();
            }, 2000);
        }
    };

    const handleStartJob = async (complaint) => {
        // If already verified, don't start job again
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

        // Check location permission before sending OTP
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

        // Get current location if not available
        let location = currentLocation;
        if (!location) {
            setIsGettingLocation(true);
            try {
                location = await getCurrentLocation();
                setCurrentLocation(location);

                // LOG THE LATITUDE AND LONGITUDE HERE
                console.log('=== LOCATION DETAILS (Start Job) ===');
                console.log('Latitude:', location.latitude);
                console.log('Longitude:', location.longitude);
                console.log('Full location object:', location);
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
            // Log existing location if already available
            console.log('=== EXISTING LOCATION DETAILS (Start Job) ===');
            console.log('Latitude:', location.latitude);
            console.log('Longitude:', location.longitude);
            console.log('Full location object:', location);
            console.log('============================================');
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

        // Only allow numbers
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

        // Validate OTP length
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

        // Check location permission and get current location
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

        // Get current location if not available
        let location = currentLocation;
        if (!location) {
            setIsGettingLocation(true);
            try {
                location = await getCurrentLocation();
                setCurrentLocation(location);
                
                // LOG THE LATITUDE AND LONGITUDE FOR VERIFICATION
                console.log('=== LOCATION DETAILS (OTP Verification) ===');
                console.log('Latitude:', location.latitude);
                console.log('Longitude:', location.longitude);
                console.log('Full location object:', location);
                console.log('==========================================');
                
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
            // Log existing location
            console.log('=== EXISTING LOCATION DETAILS (OTP Verification) ===');
            console.log('Latitude:', location.latitude);
            console.log('Longitude:', location.longitude);
            console.log('Full location object:', location);
            console.log('===================================================');
        }

        setVerifying(true);

        try {
            // Prepare payload for OTP verification with location
            const payload = {
                mobile: complaintData.customer_mobile,
                complaint_id: complaintData.id.toString(),
                otp: enteredOtp,
                latitude: location.latitude,
                longitude: location.longitude
            };

            console.log('Verifying OTP with payload:', payload);

            // Call verifyOTP API
            const response = await verifyOTP(payload);
            console.log('OTP verification response:', response);

            // Check if verification was successful
            if (response && response.data && response.data.success) {
                // Store the response data
                setOtpResponseData(response.data.result);
                setVerified(true);
                setShowOtp(false);

                // Update complaint data with the new information from response
                if (response.data.result && response.data.result.length > 0) {
                    const updatedComplaint = response.data.result[0];
                    setComplaintData(prev => ({
                        ...prev,
                        ...updatedComplaint,
                        verify_otp: "1" // Mark as verified with string "1"
                    }));
                }

                toast.custom(
                    <StatusMessage
                        type="success"
                        title="OTP verified successfully!"
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            } else {
                // Handle unsuccessful verification
                setVerifying(false);
                setOtp(['', '', '', '', '']); // Clear OTP on failure

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

            // Clear OTP on error
            setOtp(['', '', '', '', '']);

            // Show appropriate error message
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

    // handleSendPhoto function
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

    // Determine if we should show verified content
    const showVerifiedContent = verified || isOtpAlreadyVerified;

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

            <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Title and Priority */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-text-primary text-2xl font-bold mb-2">
                        {complaintData.service_name}
                    </Text>
                </View>

                {/* Status Badge */}
                <View className={`self-start px-4 py-2 rounded-full mb-2 ${getStatusColorClass()}`}>
                    <Text className={`text-sm font-medium ${getStatusTextColorClass()}`}>
                        {getStatusDisplay()}
                    </Text>
                </View>

                {/* Location Status Indicator - Only show if not complete and not verified */}
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

                {/* Only show OTP, verification, camera, reverse, and action buttons if NOT complete */}
                {!isComplete && (
                    <>
                        {/* OTP Input Section - Only show if not already verified and showOtp is true */}
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

                        {/* Display Verified Customer Info when already verified */}
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

                        {/* Camera Section – appears after verification */}
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

                {/* Customer Details Card */}
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

                {/* Service Details Card */}
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

                {/* Only show Reverse and Action Buttons if NOT complete */}
                {!isComplete && (
                    <>
                        {/* Reverse Reason Input */}
                        {showReasonInput && (
                            <View className="mb-4">
                                <TextInput
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

                        {/* Action Buttons */}
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

                            {/* Only show Start Job button if not already verified and job not started */}
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
            </ScrollView>
        </SafeAreaView>
    );
};

export default ComplaintDetail;