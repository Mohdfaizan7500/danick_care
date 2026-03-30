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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { launchCamera } from 'react-native-image-picker';
import { sendOTP, verifyOTP, UploadComplaintImage } from '../../../lib/api';
// Import this for file handling
import RNFS from 'react-native-fs';

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

    // Check if OTP is already verified from the complaint data
    useEffect(() => {
        // If complaint is complete, skip OTP checks
        if (isComplete) {
            return;
        }
        
        // Check if the complaint already has verify_otp flag set to true
        if (complaint.verify_otp === true) {
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
            // Navigate directly to remarks screen
            navigation.replace('Remarkscreen', { 
                complaintData: complaint,
                isVerified: complaint.verify_otp === true,
                isImageUploaded: true
            });
        }
    }, [complaint, navigation, isComplete]);

    // Disable swipe back gesture when verified
    useEffect(() => {
        if (!isComplete) {
            navigation.setOptions({
                gestureEnabled: !verified,
            });
        }
    }, [verified, navigation, isComplete]);

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

        setVerifying(true);

        try {
            // Prepare payload for OTP verification
            const payload = {
                complaint_id: complaintData.id,
                mobile: complaintData.customer_mobile,
                otp: enteredOtp
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
                        verify_otp: true // Mark as verified
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

    // handleSendPhoto function - Always uses "before" and status "1"
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
            // Create form data for file upload
            const formData = new FormData();

            // Get file info
            const fileUri = photoUri;
            const fileName = fileUri.split('/').pop();
            const fileType = 'image/jpeg';

            // Append the image file
            formData.append('image', {
                uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
                name: fileName || `photo_${Date.now()}.jpg`,
                type: fileType,
            });

            // Always use "before" and status "1"
            formData.append('complaint_id', complaintData.id.toString());
            formData.append('image_type', 'before working'); // Always "before"
            formData.append('status', '1'); // Always "1"

            // Log the form data for debugging
            console.log('Uploading image with params:', {
                complaint_id: complaintData.id,
                image_type: 'before working',
                status: '1',
                fileName: fileName,
                fileUri: fileUri
            });

            // Call the upload API
            const response = await UploadComplaintImage(formData);
            console.log('Upload response:', response);

            // Check if upload was successful
            if (response && response.data && response.data.success) {
                toast.custom(
                    <StatusMessage
                        type="success"
                        title={response.data.msg || "Photo uploaded successfully!"}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );

                // Navigate to next screen after successful upload
                navigation.replace('Remarkscreen', {
                    customerData: otpResponseData,
                    complaintData: complaintData,
                    isVerified: true,
                    photoUploaded: true,
                    imageType: 'before working'
                });
            } else {
                // Handle unsuccessful upload
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

            // Log more details about the error
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
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

    // Format the date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dateString;
    };

    // Determine priority based on available data or set default
    const getPriority = () => {
        return 'Medium';
    };

    // Determine status display
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

    // Determine status color class
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

    // Determine status text color class
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

    // Determine priority color class
    const getPriorityColorClass = () => {
        const priority = getPriority();
        switch (priority) {
            case 'High':
                return 'bg-ui-error/20';
            case 'Medium':
                return 'bg-ui-warning/20';
            case 'Low':
                return 'bg-ui-success/20';
            default:
                return 'bg-ui-warning/20';
        }
    };

    // Determine priority text color class
    const getPriorityTextColorClass = () => {
        const priority = getPriority();
        switch (priority) {
            case 'High':
                return 'text-ui-error';
            case 'Medium':
                return 'text-ui-warning';
            case 'Low':
                return 'text-ui-success';
            default:
                return 'text-ui-warning';
        }
    };

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
                    {/* <View className="mb-2">
                        <View className={`px-3 py-1 rounded-full ${getPriorityColorClass()}`}>
                            <Text className={`text-xs font-medium ${getPriorityTextColorClass()}`}>
                                {getPriority()} Priority
                            </Text>
                        </View>
                    </View> */}
                </View>

                {/* Status Badge */}
                <View className={`self-start px-4 py-2 rounded-full mb-2 ${getStatusColorClass()}`}>
                    <Text className={`text-sm font-medium ${getStatusTextColorClass()}`}>
                        {getStatusDisplay()}
                    </Text>
                </View>

                {/* Only show OTP, verification, camera, reverse, and action buttons if NOT complete */}
                {!isComplete && (
                    <>
                        {/* OTP Input Section - Only show if not already verified */}
                        {!verified && showOtp && (
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
                                            editable={!verifying && !verified}
                                        />
                                    ))}
                                </View>

                                <TouchableOpacity
                                    onPress={handleVerifyOtp}
                                    disabled={verifying || verified}
                                    className={`mt-4 py-3 rounded-xl items-center ${verifying ? 'bg-ui-secondary' : 'bg-primary-sage600'
                                        }`}
                                >
                                    {verifying ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-text-inverse font-semibold">Verify OTP</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Display Verified Customer Info when already verified */}
                        {verified && (
                            <View className="bg-ui-success/10 border border-ui-success rounded-xl p-3 mb-4">
                                <View className="flex-row items-center">
                                    <Icon name="checkmark-circle" size={20} color="#58A890" />
                                    <Text className="text-ui-success font-bold ml-2">Job Verified</Text>
                                </View>
                                <Text className="text-text-primary text-sm mt-1">
                                    {complaintData.customer_name} • {complaintData.customer_mobile}
                                </Text>
                            </View>
                        )}

                        {/* Camera Section – appears after verification */}
                        {verified && (
                            <View className="mb-6">
                                <Text className="text-text-primary text-base mb-2 font-semibold">
                                    Take Before Working Photo
                                </Text>
                                {/* Photo capture area */}
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

                                {/* Send Button */}
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
                        disabled={verified && !isComplete}
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
                            {!verified && !jobStarted && (
                                <TouchableOpacity
                                    onPress={() => handleStartJob(complaintData)}
                                    disabled={verifying || sendingOTP}
                                    className={`px-6 py-3 rounded-xl flex-1 ml-2 items-center ${verifying || sendingOTP ? 'bg-ui-disabled' : 'bg-primary-sage600'
                                        }`}
                                >
                                    {sendingOTP ? (
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