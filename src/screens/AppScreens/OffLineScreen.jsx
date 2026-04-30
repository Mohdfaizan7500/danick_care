import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getProfile, TermsSupport } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import DialogBox from '../../components/DilaogBox';

const OffLineScreen = ({ navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogType, setDialogType] = useState('info');
    const [serviceNumber, setServiceNumber] = useState('1800-123-4567'); // Default fallback number
    const [loadingNumber, setLoadingNumber] = useState(true);

    const { user, setIsOnline, setAuthData, updateProfileData } = useAuth();

    // Fetch support details when component mounts
    useEffect(() => {
        fetchSupportDetails();
    }, []);

    const fetchSupportDetails = async () => {
        try {
            setLoadingNumber(true);
            console.log('Fetching support details in OfflineScreen...');
            const response = await TermsSupport();
            console.log('TermsSupport response:', response);
            
            if (response?.data?.success && response?.data?.data?.[0]) {
                const supportData = response.data.data[0];
                // Format the mobile number if needed
                const mobile = supportData.mobile || supportData.mobile2 || '1800-123-4567';
                setServiceNumber(mobile);
                console.log('Service number set to:', mobile);
            } else {
                console.log('No support data found, using default number');
                setServiceNumber('1800-123-4567');
            }
        } catch (error) {
            console.log('Error fetching support details:', error);
            setServiceNumber('1800-123-4567');
        } finally {
            setLoadingNumber(false);
        }
    };

    const showDialog = (type, message) => {
        setDialogType(type);
        setDialogMessage(message);
        setDialogVisible(true);
    };

    const handleCallPress = () => {
        const phoneNumber = serviceNumber.replace(/[-\s]/g, '');
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            // Use technician_id from the user object (from decoded token)
            const technicianId = user?.id;

            console.log('User object:', user);
            console.log('Using technician ID:', technicianId);

            if (!technicianId) {
                showDialog('error', 'User information not found. Please login again.');
                return;
            }

            const response = await getProfile(technicianId);
            console.log('Profile refresh response:', response);

            // Extract data from the response structure
            const responseData = response?.data?.data?.[0] || response?.data?.data || response?.data;
            console.log('Extracted response data:', responseData);

            // Check if response indicates failure
            if (response?.data?.success === false) {
                showDialog('error', responseData?.msg || 'Failed to refresh status');
                return;
            }

            // Check if we got valid technician data
            if (responseData && responseData.login_status) {
                const isOnline = responseData.login_status === 'Online';

                if (isOnline) {
                    await setIsOnline(true);

                    // Update profile data with complete technician info
                    await updateProfileData(responseData);

                    // Update user data if needed (keep the existing user structure)
                    const updatedUser = {
                        ...user,
                        technician_name: responseData.technician_name,
                        technician_mobile: responseData.technician_mobile,
                        technician_address: responseData.technician_address,
                        technician_type: responseData.technician_type,
                        profile_photo: responseData.profile_photo,
                    };

                    await setAuthData(
                        updatedUser,
                        responseData.accessToken || user?.accessToken,
                        user?.refreshToken
                    );

                    showDialog('success', 'You are now online! Redirecting...');
                    
                    // Navigate back to Home after successful refresh
                    setTimeout(() => {
                        setDialogVisible(false);
                        navigation?.replace('Home');
                    }, 2000);

                } else {
                    showDialog('info', 'You are still offline. Please contact service center.');
                    // Refresh the support number in case it was updated
                    await fetchSupportDetails();
                }
            } else {
                showDialog('error', 'Invalid response from server');
            }

        } catch (error) {
            console.error('Refresh error:', error);
            showDialog('error', error.message || 'Failed to refresh status. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    const dialogFooter = (
        <TouchableOpacity
            className={`py-3 rounded-lg ${dialogType === 'error' ? 'bg-red-500' : dialogType === 'success' ? 'bg-green-500' : 'bg-teal-500'}`}
            onPress={() => {
                setDialogVisible(false);
                // If success, navigate to Home after dialog closes
                if (dialogType === 'success') {
                    navigation?.replace('Home');
                }
            }}
        >
            <Text className="text-white text-center font-semibold">OK</Text>
        </TouchableOpacity>
    );

    // Format phone number for display (add hyphens)
    const formatPhoneNumber = (number) => {
        if (!number) return '1800-123-4567';
        // Remove all non-digits
        const cleaned = number.replace(/\D/g, '');
        // Format based on length
        if (cleaned.length === 10) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 11) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 12) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
        }
        return number;
    };

    const displayNumber = formatPhoneNumber(serviceNumber);

    return (
        <>
            <View className="flex-1 bg-background-primary items-center justify-center px-6">
                <View className="w-24 h-24 rounded-full bg-status-inactive items-center justify-center mb-6">
                    <Icon name="app-blocking" size={50} color="#999999" />
                </View>

                <Text className="text-text-primary text-xl font-bold text-center mb-3">
                    You are offline by admin
                </Text>
                <Text className="text-text-secondary text-base text-center mb-6">
                    Contact your service center for assistance.
                </Text>

                {loadingNumber ? (
                    <View className="flex-row items-center justify-center mb-8">
                        <ActivityIndicator size="small" color="#10b981" />
                        <Text className="text-gray-500 ml-2">Loading support number...</Text>
                    </View>
                ) : (
                    <Text className="text-primary-sage600 text-lg font-semibold mb-8">
                        {displayNumber}
                    </Text>
                )}

                <View className='flex-row gap-4'>
                    <TouchableOpacity
                        onPress={handleCallPress}
                        className="bg-primary-sage500 py-3 px-8 rounded-xl flex-row items-center"
                        disabled={isRefreshing || loadingNumber}
                    >
                        <Icon name="phone" size={20} color="white" />
                        <Text className="text-white font-semibold text-base ml-2">Call Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleRefresh}
                        className="bg-primary-sage500 py-3 px-8 rounded-xl flex-row items-center"
                        disabled={isRefreshing || loadingNumber}
                    >
                        {isRefreshing ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <>
                                <Icon name="refresh" size={20} color="white" />
                                <Text className="text-white font-semibold text-base ml-2">Refresh</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <DialogBox
                visible={dialogVisible}
                onClose={() => setDialogVisible(false)}
                title={dialogType === 'error' ? 'Error' : dialogType === 'success' ? 'Success' : 'Info'}
                size="sm"
                showCloseButton={false}
                closeOnBackdropPress={false}
                footer={dialogFooter}
            >
                <View className="py-4 items-center">
                    <Icon
                        name={dialogType === 'error' ? 'error' : dialogType === 'success' ? 'check-circle' : 'info'}
                        size={50}
                        color={dialogType === 'error' ? '#F44336' : dialogType === 'success' ? '#4CAF50' : '#2196F3'}
                    />
                    <Text className="text-gray-600 text-center mt-4 text-base">{dialogMessage}</Text>
                </View>
            </DialogBox>
        </>
    );
};

export default OffLineScreen;