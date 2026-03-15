import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    BackHandler,
    ActivityIndicator,
    Linking,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../components/Header';
import { toast, Toaster } from 'sonner-native';
import { Colors } from '../../constants/Color';
import StatusMessage from '../../components/StatusMessage';
const ComplaintDetail = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { complaint } = route.params;

    // State for OTP flow
    const [jobStarted, setJobStarted] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const inputRefs = useRef([]);

    // Disable back navigation when verified
    

    // Disable swipe back gesture
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
        // Reset OTP related states
        setShowOtp(false);
        setOtp(['', '', '', '']);
        setVerifying(false);
        setVerified(false);
        setJobStarted(false);
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
            {
                duration: 3000
            }
        )

    };

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        // Handle backspace to go to previous input
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 4) {
            // toast.error('Please enter 4-digit OTP');
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Please enter 4-digit OTP"
                    className="mx-4 mb-6"
                />,
                {
                    duration: 3000
                }
            )
            return;
        }

        setVerifying(true);

        // Simulate API call
        setTimeout(() => {
            // Mock verification – correct OTP is '1234'
            if (enteredOtp === '1234') {
                setVerified(true);
                setShowOtp(false);
                // toast.success('OTP verified successfully');
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

    return (
        <SafeAreaView className="flex-1 bg-background-primary">
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

            <ScrollView className="flex-1 px-4 pt-4">
                {/* Priority Badge */}
                <View className="flex-row justify-end mb-2">
                    <View
                        className={`px-3 py-1 rounded-full ${complaint.priority === 'High'
                            ? 'bg-ui-error/20'
                            : complaint.priority === 'Medium'
                                ? 'bg-ui-warning/20'
                                : 'bg-ui-success/20'
                            }`}
                    >
                        <Text
                            className={`text-xs font-medium ${complaint.priority === 'High'
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

                {/* Title */}
                <Text className="text-text-primary text-2xl font-bold mb-2">
                    {complaint.title}
                </Text>

                {/* Status Badge */}
                <View
                    className={`self-start px-4 py-2 rounded-full mb-4 ${complaint.status === 'Assigned'
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
                        className={`text-sm font-medium ${complaint.status === 'Assigned'
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

                {/* Customer Details Card */}
                <View className="bg-ui-card border border-ui-border rounded-xl p-4 mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-text-primary font-semibold text-lg">
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
                        <Text className="text-[#666] text-base ml-2 ">
                            {complaint.phone}
                        </Text>
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

                {/* Action Buttons */}
                {!verified && (
                    <View className="flex-row justify-between mt-2 mb-6">
                        {/* Reverse Button */}
                        <TouchableOpacity
                            onPress={handleReverse}
                            disabled={verifying}
                            className={`px-6 py-3 rounded-xl flex-1 mr-2 items-center ${verifying ? 'bg-ui-disabled' : 'bg-ui-secondary/20'
                                }`}
                        >
                            <Text
                                className={`font-semibold ${verifying ? 'text-text-disabled' : 'text-text-secondary'
                                    }`}
                            >
                                Reverse
                            </Text>
                        </TouchableOpacity>

                        {/* Start Job Button */}
                        {!jobStarted && (
                            <TouchableOpacity
                                onPress={handleStartJob}
                                disabled={verifying}
                                className={`px-6 py-3 rounded-xl flex-1 ml-2 items-center ${verifying ? 'bg-ui-disabled' : 'bg-primary-sage600'
                                    }`}
                            >
                                <Text
                                    className={`font-semibold ${verifying ? 'text-text-disabled' : 'text-text-inverse'
                                        }`}
                                >
                                    Start Job
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

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

                        {/* Verify Button */}
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

                {/* Verified Message - Updated with user's snippet */}
                {verified && (
                    <View className="bg-ui-success/20 border flex-row items-start gap-2 border-ui-success rounded-xl p-2 mb-6">
                        <Icon name="checkmark-circle" size={20} color="#58A890" />
                        <View className='flex-1'>
                            <Text className="text-ui-success font-bold text-sm">
                                Job Verified
                            </Text>
                            <Text className="text-text-secondary text-xs text-left">
                                This complaint has been successfully verified. You can now proceed.
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default ComplaintDetail;