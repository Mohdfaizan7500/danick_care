import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    RefreshControl,
    Animated,
    ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
// import { CheckProceedAMC } from '../../../lib/api';
import ToggleSwitch from 'toggle-switch-react-native';
import dummyData from '../../../lib/dummyData';

const ConetToAMCScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { complaintData } = route.params || {};

    // Check if this is already an AMC complaint
    const isAMCComplaint = complaintData?.complaint_type === 'AMC';

    // State for Convert to AMC toggle
    const [convertToAMC, setConvertToAMC] = useState(false);
    const [isAMCLocked, setIsAMCLocked] = useState(false);
    const [checkingAMC, setCheckingAMC] = useState(true);
    const [amcComplaintId, setAmcComplaintId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Animation for Next button (shake + color change)
    const buttonShake = useRef(new Animated.Value(0)).current;
    const [buttonColorOverride, setButtonColorOverride] = useState(null);

    // Check for invalid CSN (exactly "00000")
    const isInvalidCSN = complaintData?.csn === '00000';

    const animateButton = () => {
        setButtonColorOverride('bg-green-600');
        Animated.sequence([
            Animated.timing(buttonShake, { toValue: 1, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonShake, { toValue: -1, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonShake, { toValue: 0.5, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonShake, { toValue: -0.5, duration: 80, useNativeDriver: true }),
            Animated.timing(buttonShake, { toValue: 0, duration: 80, useNativeDriver: true }),
        ]).start(() => {
            setTimeout(() => setButtonColorOverride(null), 200);
        });
    };

    const shakeTransform = buttonShake.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: [-10, 0, 10],
    });

    const isReadyForNext = () => {
        if (refreshing || checkingAMC || submitting) return false;
        if (isInvalidCSN) return false;
        return true;
    };

    const checkAMCStatus = async () => {
        // Skip API call if CSN is invalid or complaint is already AMC
        if (isInvalidCSN || isAMCComplaint) {
            setCheckingAMC(false);
            return;
        }
        setCheckingAMC(true);
        try {
            const payload = {
                complaint_id: complaintData?.id?.toString() || '',
                technician_id: complaintData?.technician_id?.toString() || '62'
            };
            // const response = await CheckProceedAMC(payload);
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.proceedAMC;
            if (response?.data?.success) {
                const status = response.data.status;
                if (status === '1') {
                    setConvertToAMC(true);
                    setIsAMCLocked(true);
                    setAmcComplaintId(response.data.amc_complaint_id);
                } else {
                    setConvertToAMC(false);
                    setIsAMCLocked(false);
                    setAmcComplaintId(null);
                }
            } else {
                setConvertToAMC(false);
                setIsAMCLocked(false);
                setAmcComplaintId(null);
            }
        } catch (error) {
            setConvertToAMC(false);
            setIsAMCLocked(false);
            setAmcComplaintId(null);
            toast.custom(
                <StatusMessage type="error" title="Failed to check AMC status" className="mx-4 mb-6" />,
                { duration: 3000 }
            );
        } finally {
            setCheckingAMC(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            setConvertToAMC(false);
            setIsAMCLocked(false);
            setAmcComplaintId(null);
            await checkAMCStatus();
            ToastAndroid.show("Refreshed", ToastAndroid.SHORT);
        } catch (error) {
            toast.custom(
                <StatusMessage type="error" title="Refresh Failed" description={error.message} className="mx-4 mb-6" />,
                { duration: 3000 }
            );
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            // Force convertToAMC false if already an AMC complaint
            if (isAMCComplaint) {
                setConvertToAMC(false);
                setCheckingAMC(false);
                return;
            }
            checkAMCStatus();
            return () => { };
        }, [complaintData?.id, isInvalidCSN, isAMCComplaint])
    );

    const handleToggleAttempt = (message) => {
        toast.custom(
            <StatusMessage
                type="error"
                title="Cannot change AMC status"
                message={message}
                className="mx-4 mb-6"
            />,
            { duration: 3000 }
        );
        animateButton(); // Shake the Next button
    };

    const handleTryTotoggle = () => {
        handleToggleAttempt("Please delete the existing AMC complaint first before changing this option");
    };

    const handleAMCComplaintToggle = () => {
        handleToggleAttempt("This is already an AMC complaint. Cannot convert to AMC.");
    };

    const handleNext = () => {
        // If it's already an AMC complaint, go to Billing as regular service
        if (isAMCComplaint) {
            navigation.navigate('Billing', {
                complaintData,
                selectedCustomerType: '',
                remark: '',
                image1Id: null,
                image2Id: null,
                image1Uri: null,
                image2Uri: null,
                convertToAMC: false,
            });
            return;
        }

        if (convertToAMC) {
            // Convert to AMC flow
            if (isAMCLocked) {
                // AMC already proceeded – go to ComplaintAMCDetails
                const amcData = {
                    amc_complaint_id: amcComplaintId,
                    complaint_id: complaintData?.id,
                    status: '1',
                    msg: 'AMC Already Proceed'
                };
                navigation.navigate('ComplaintAMCDetails', {
                    complaintData,
                    amcData,
                    amcComplaintId,
                });
            } else {
                // AMC not proceeded – go to AMCList
                navigation.navigate('AMCList', {
                    complaintData,
                });
            }
        } else {
            // Regular service – navigate to Billing screen (without AMC)
            navigation.navigate('Billing', {
                complaintData,
                selectedCustomerType: '',
                remark: '',
                image1Id: null,
                image2Id: null,
                image1Uri: null,
                image2Uri: null,
                convertToAMC: false,
            });
        }
    };

    const getButtonText = () => {
        if (refreshing) return 'Refreshing...';
        if (checkingAMC) return 'Checking AMC Status...';
        if (submitting) return 'Submitting...';
        if (isAMCComplaint) return 'Next';
        if (convertToAMC) {
            if (isAMCLocked) return 'View AMC Details';
            return 'Proceed to AMC';
        }
        return 'Next';
    };

    const getButtonBgColor = () => {
        if (buttonColorOverride) return buttonColorOverride;
        return isReadyForNext() ? 'bg-green-600' : 'bg-gray-400';
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="absolute inset-0 z-50 pointer-events-none">
                <Toaster />
            </View>
            <Header
                title="Convert to AMC"
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5"
                showBackButton={true}
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 pr-7 pt-5"
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    className="flex-1 px-4 pt-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#000000']}
                            tintColor="#000000"
                            title="Pull to refresh"
                            titleColor="#000000"
                        />
                    }
                >
                    {checkingAMC && !refreshing && !isInvalidCSN && !isAMCComplaint && (
                        <View className="mb-4 p-4 bg-gray-100 rounded-xl items-center">
                            <ActivityIndicator size="large" color="#000" />
                            <Text className="text-text-primary mt-2">Checking AMC status...</Text>
                        </View>
                    )}

                    <Text className='text-black font-semibold text-sm'>Complaint: {complaintData?.service_name}</Text>
                    <View className='bg-yellow-100 self-start px-4 py-2 mt-1 border border-yellow-500 rounded-xl'>
                        <Text className='text-yellow-800 font-semibold text-sm'>CSN ID: {complaintData?.csn}</Text>
                    </View>

                    {/* Convert to AMC Toggle */}
                    <View className="flex-row justify-between items-center mb-4 mt-3 p-3 bg-gray-50 rounded-xl">
                        <View>
                            <Text className="text-text-primary font-semibold text-base">
                                Convert to AMC
                            </Text>
                            <Text className="text-text-tertiary text-xs mt-1">
                                {isAMCComplaint
                                    ? 'Already an AMC complaint'
                                    : convertToAMC
                                        ? 'Yes, convert to AMC'
                                        : 'No, regular service'}
                                {isAMCLocked && !isAMCComplaint && ' (AMC already processed)'}
                            </Text>
                        </View>
                        <ToggleSwitch
                            isOn={convertToAMC}
                            onToggle={
                                isAMCComplaint
                                    ? handleAMCComplaintToggle
                                    : isAMCLocked
                                        ? handleTryTotoggle
                                        : setConvertToAMC
                            }
                            onColor="#14B8A6"
                            offColor="#D1D5DB"
                            size="medium"
                            animationSpeed={200}
                            // Disable visual interaction when already AMC complaint
                            disabled={isAMCComplaint}
                        />
                    </View>

                    {/* Next Button with shake animation */}
                    <Animated.View style={{ transform: [{ translateX: shakeTransform }] }}>
                        <TouchableOpacity
                            onPress={handleNext}
                            disabled={!isReadyForNext()}
                            className={`py-4 rounded-xl items-center mb-2 ${getButtonBgColor()}`}
                        >
                            <Text className="text-white font-semibold text-base">
                                {getButtonText()}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Error message when CSN is invalid */}
                    {isInvalidCSN && (
                        <View className="bg-red-100 border border-red-400 rounded-xl p-3 mt-2">
                            <Text className="text-red-700 text-center font-semibold">
                                CSN is not correct. Contact to admin.
                            </Text>
                        </View>
                    )}

                    {/* Message when complaint is already AMC */}
                    {isAMCComplaint && (
                        <View className="bg-orange-100 border border-orange-400 rounded-xl p-3 mt-2">
                            <Text className="text-orange-700 text-center font-semibold">
                                This is already an AMC complaint. Cannot convert to AMC.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ConetToAMCScreen;
