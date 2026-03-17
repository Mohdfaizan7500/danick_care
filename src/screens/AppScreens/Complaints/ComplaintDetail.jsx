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

const ComplaintDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { complaint } = route.params;

    // OTP flow states
    const [jobStarted, setJobStarted] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const inputRefs = useRef([]);

    // Camera states
    const [photoUri, setPhotoUri] = useState(null);
    const [sendingPhoto, setSendingPhoto] = useState(false);

    // Disable swipe back gesture when verified
    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: !verified,
        });
    }, [verified, navigation]);

    const handlePhoneCall = () => {
        const phoneNumber = complaint.phone;
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => {
                toast.error('Could not open dialer');
            });
        } else {
            toast.error('No phone number available');
        }
    };

    const handleOpenMaps = () => {
        const address = complaint.address;
        if (address) {
            const encodedAddress = encodeURIComponent(address);
            Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`).catch(() => {
                toast.error('Could not open maps');
            });
        } else {
            toast.error('No address available');
        }
    };

    const handleReverse = () => {
        setShowOtp(false);
        setOtp(['', '', '', '']);
        setVerifying(false);
        setVerified(false);
        setJobStarted(false);
        setPhotoUri(null);
        toast.info('Action cancelled');
    };

    const handleStartJob = () => {
        setJobStarted(true);
        setShowOtp(true);
        toast.custom(
            <StatusMessage
                type="success"
                title="OTP sent to customer"
                className="mx-4 mb-6"
            />,
            { duration: 3000 }
        );
    };

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 4) {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Please enter 4-digit OTP"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return;
        }

        setVerifying(true);
        setTimeout(() => {
            if (enteredOtp === '1234') {
                setVerified(true);
                setShowOtp(false);
                toast.custom(
                    <StatusMessage
                        type="success"
                        title="OTP verified successfully"
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            } else {
                setVerifying(false);
                toast.error('Invalid OTP');
            }
        }, 1500);
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
            toast.error('Camera permission denied');
            return;
        }

        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.error) {
                console.log('Camera error: ', response.error);
                toast.error('Camera error: ' + response.error);
            } else if (response.assets && response.assets[0]) {
                setPhotoUri(response.assets[0].uri);
            }
        });
    };

    const handleSendPhoto = () => {
        if (!photoUri) {
            toast.error('Please take a photo first');
            return;
        }

        setSendingPhoto(true);

        // Simulate 2-second upload
        setTimeout(() => {
            setSendingPhoto(false);
            toast.success('Photo sent successfully!');
            // Navigate to next screen – replace 'Home' with your actual screen
            navigation.replace('Remarkscreen'); // use replace to prevent going back to this screen
        }, 2000);
    };

    return (
        <SafeAreaView className="flex-1 bg-background-primary ">
            <View className="absolute inset-0 z-50 pointer-events-none">
                <Toaster />
            </View>
            <Header
                title={`Complaint #${complaint.complaintNumber}`}
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5 text-text-primary"
                showBackButton={true}
                backButtonColor="#333333"
                containerStyle="bg-background-primary flex-row items-center justify-between px-4 py-4 border-gray-200"
            />

            <ScrollView className="flex-1 px-4 pt-4 " contentContainerStyle={{paddingBottom:30}}>
                {/* Title and Priority */}
                <View className="flex-row items-center justify-between">
                    <Text className="text-text-primary text-2xl font-bold mb-2">
                        {complaint.title}
                    </Text>
                    <View className="mb-2">
                        <View
                            className={`px-3 py-1 rounded-full ${
                                complaint.priority === 'High'
                                    ? 'bg-ui-error/20'
                                    : complaint.priority === 'Medium'
                                    ? 'bg-ui-warning/20'
                                    : 'bg-ui-success/20'
                            }`}
                        >
                            <Text
                                className={`text-xs font-medium ${
                                    complaint.priority === 'High'
                                        ? 'text-ui-error'
                                        : complaint.priority === 'Medium'
                                        ? 'text-ui-warning'
                                        : 'text-ui-success'
                                }`}
                            >
                                {complaint.priority} Priority
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Status Badge */}
                <View
                    className={`self-start px-4 py-2 rounded-full mb-4 ${
                        complaint.status === 'Assigned'
                            ? 'bg-primary-sage100'
                            : complaint.status === 'In Progress'
                            ? 'bg-ui-warning/20'
                            : complaint.status === 'Pending'
                            ? 'bg-ui-secondary/20'
                            : complaint.status === 'Complete'
                            ? 'bg-ui-success/20'
                            : complaint.status === 'Cancel'
                            ? 'bg-ui-error/20'
                            : 'bg-gray-100'
                    }`}
                >
                    <Text
                        className={`text-sm font-medium ${
                            complaint.status === 'Assigned'
                                ? 'text-primary-sage700'
                                : complaint.status === 'In Progress'
                                ? 'text-ui-warning'
                                : complaint.status === 'Pending'
                                ? 'text-text-secondary'
                                : complaint.status === 'Complete'
                                ? 'text-ui-success'
                                : complaint.status === 'Cancel'
                                ? 'text-ui-error'
                                : 'text-text-tertiary'
                        }`}
                    >
                        {complaint.status}
                    </Text>
                </View>

                {/* OTP Input Section */}
                {showOtp && !verified && (
                    <View className="mb-6">
                        <Text className="text-text-primary text-base mb-3 text-center">
                            Enter 4-digit OTP sent to customer
                        </Text>
                        <View className="flex-row justify-center gap-3">
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    className="w-14 h-14 border border-ui-border rounded-xl text-center text-2xl font-bold text-text-primary bg-background-secondary"
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    editable={!verifying && !verified}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleVerifyOtp}
                            disabled={verifying || verified}
                            className={`mt-4 py-3 rounded-xl items-center ${
                                verifying ? 'bg-ui-secondary' : 'bg-primary-sage600'
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

                 {/* Camera Section – appears after verification */}
                {verified && (
                    <View className="mb-6">
                        {/* Dropbox-style "Take Photo" button */}
                        <TouchableOpacity
                            onPress={handleTakePhoto}
                            className="border-2 border-dashed border-ui-border rounded-xl p-6 items-center justify-center bg-background-secondary mb-4"
                        >
                            <Icon name="camera-outline" size={40} color="#666" />
                            <Text className="text-text-primary font-semibold text-base mt-2">
                                {photoUri ? 'Retake Photo' : 'Take Photo'}
                            </Text>
                            <Text className="text-text-tertiary text-sm text-center mt-1">
                                Tap to open camera
                            </Text>
                        </TouchableOpacity>

                        {/* Photo Preview */}
                        {photoUri && (
                            <View className="mb-4">
                                <Text className="text-text-primary font-semibold text-base mb-2">
                                    Preview
                                </Text>
                                <Image
                                    source={{ uri: photoUri }}
                                    className="w-full h-48 rounded-xl bg-gray-200"
                                    resizeMode="cover"
                                />
                            </View>
                        )}

                        {/* Send Button */}
                        <TouchableOpacity
                            onPress={handleSendPhoto}
                            disabled={sendingPhoto || !photoUri}
                            className={`py-4 rounded-xl items-center ${
                                sendingPhoto || !photoUri ? 'bg-ui-disabled' : 'bg-ui-success'
                            }`}
                        >
                            {sendingPhoto ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-text-inverse font-semibold text-base">
                                    Send Photo
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
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
                            {complaint.customerName}
                        </Text>
                    </View>

                    <View className="flex-row items-center mb-2">
                        <Icon name="location-outline" size={18} color="#666" />
                        <Text className="text-text-secondary text-base ml-2 flex-1">
                            {complaint.address}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handlePhoneCall}
                        className="flex-row items-center"
                        disabled={verified}
                    >
                        <Icon name="call-outline" size={18} color="#666" />
                        <Text className="text-[#666] text-base ml-2">{complaint.phone}</Text>
                    </TouchableOpacity>
                </View>

                {/* Description Card */}
                <View className="bg-ui-card border border-ui-border rounded-xl p-4 mb-4">
                    <Text className="text-text-primary font-semibold text-lg mb-2">
                        Description
                    </Text>
                    <Text className="text-text-secondary text-base">
                        {complaint.description}
                    </Text>
                    <Text className="text-text-tertiary text-sm mt-2">
                        Reported on: {complaint.date}
                    </Text>
                </View>

                {/* Pre-verification Action Buttons */}
                {!verified && (
                    <View className="flex-row justify-between mt-2 mb-6">
                        <TouchableOpacity
                            onPress={handleReverse}
                            disabled={verifying}
                            className={`px-6 py-3 rounded-xl flex-1 mr-2 items-center ${
                                verifying ? 'bg-ui-disabled' : 'bg-ui-secondary/20'
                            }`}
                        >
                            <Text
                                className={`font-semibold ${
                                    verifying ? 'text-text-disabled' : 'text-text-secondary'
                                }`}
                            >
                                Reverse
                            </Text>
                        </TouchableOpacity>

                        {!jobStarted && (
                            <TouchableOpacity
                                onPress={handleStartJob}
                                disabled={verifying}
                                className={`px-6 py-3 rounded-xl flex-1 ml-2 items-center ${
                                    verifying ? 'bg-ui-disabled' : 'bg-primary-sage600'
                                }`}
                            >
                                <Text
                                    className={`font-semibold ${
                                        verifying ? 'text-text-disabled' : 'text-text-inverse'
                                    }`}
                                >
                                    Start Job
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Verified Message */}
                {verified && (
                    <View className="bg-ui-success/20 border flex-row items-start gap-2 border-ui-success rounded-xl p-2 mb-4">
                        <Icon name="checkmark-circle" size={20} color="#58A890" />
                        <View className="flex-1">
                            <Text className="text-ui-success font-bold text-sm">
                                Job Verified
                            </Text>
                            <Text className="text-text-secondary text-xs text-left">
                                Please take a photo to complete the job.
                            </Text>
                        </View>
                    </View>
                )}

               
            </ScrollView>
        </SafeAreaView>
    );
};

export default ComplaintDetail;