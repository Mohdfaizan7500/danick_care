import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import { getProfile, TermsSupport, logoutApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import DialogBox from '../../components/DilaogBox';
import { LogOut } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../components/StatusMessage';
import dummyData from '../../lib/dummyData';

const OffLineScreen = ({ navigation }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogMessage, setDialogMessage] = useState('');
    const [dialogType, setDialogType] = useState('info');
    const [serviceNumber, setServiceNumber] = useState('1800-123-4567'); // Default fallback number
    const [loadingNumber, setLoadingNumber] = useState(true);
    
    // Logout states
    const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isConnected, setIsConnected] = useState(true);

    const { user, logout, setIsOnline, setAuthData, updateProfileData } = useAuth();

    // Monitor internet connection
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch support details when component mounts
    useEffect(() => {
        fetchSupportDetails();
    }, []);

    const fetchSupportDetails = async () => {
        try {
            setLoadingNumber(true);
            // const response = await TermsSupport();
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.termsData;
            
            if (response?.data?.success && response?.data?.data?.[0]) {
                const supportData = response.data.data[0];
                const mobile = supportData.mobile || supportData.mobile2 || '1800-123-4567';
                setServiceNumber(mobile);
            } else {
                setServiceNumber('1800-123-4567');
            }
        } catch (error) {
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
            const technicianId = user?.id;


            if (!technicianId) {
                showDialog('error', 'User information not found. Please login again.');
                return;
            }

            // const response = await getProfile(technicianId);
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.profileData;

            const responseData = response?.data?.data?.[0] || response?.data?.data || response?.data;

            if (response?.data?.success === false) {
                showDialog('error', responseData?.msg || 'Failed to refresh status');
                return;
            }

            if (responseData && responseData.login_status) {
                const isOnline = responseData.login_status === 'Online';

                if (isOnline) {
                    await setIsOnline(true);
                    await updateProfileData(responseData);

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
                    
                    setTimeout(() => {
                        setDialogVisible(false);
                        navigation?.replace('Home');
                    }, 2000);

                } else {
                    showDialog('info', 'You are still offline. Please contact service center.');
                    await fetchSupportDetails();
                }
            } else {
                showDialog('error', 'Invalid response from server');
            }

        } catch (error) {
            showDialog('error', error.message || 'Failed to refresh status. Please try again.');
        } finally {
            setIsRefreshing(false);
        }
    };

    // Logout handlers
    const handleLogoutPress = () => {
        if (!isConnected) {
            toast.custom(
                <StatusMessage type="error" title="You are offline. Cannot logout." />,
                { duration: 3000 }
            );
            return;
        }
        setLogoutDialogVisible(true);
    };

    const handleLogout = async () => {
        if (!isConnected) {
            toast.custom(
                <StatusMessage type="error" title="No internet connection. Please try again." />,
                { duration: 3000 }
            );
            setLogoutDialogVisible(false);
            return;
        }

        setIsLoggingOut(true);
        try {
            const technicianId = user?.id;
            if (!technicianId) {
                throw new Error('User ID not found');
            }

            // const response = await logoutApi({ technician_id: technicianId });
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.logoutResponse;

            if (response?.data?.success) {
                await logout();
                if (setIsOnline) await setIsOnline(false);
                
                toast.custom(
                    <StatusMessage type="success" title="Logged out successfully" />,
                    { duration: 2000 }
                );
                
                setLogoutDialogVisible(false);
                // Navigate to Login screen (adjust route name as needed)
                navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            } else {
                throw new Error(response?.data?.msg || 'Logout failed');
            }
        } catch (error) {
            toast.custom(
                <StatusMessage type="error" title={error.message || 'Logout failed. Please try again.'} />,
                { duration: 3000 }
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const dialogFooter = (
        <TouchableOpacity
            className={`py-3 rounded-lg ${dialogType === 'error' ? 'bg-red-500' : dialogType === 'success' ? 'bg-green-500' : 'bg-teal-500'}`}
            onPress={() => {
                setDialogVisible(false);
                if (dialogType === 'success') {
                    navigation?.replace('Home');
                }
            }}
        >
            <Text className="text-white text-center font-semibold">OK</Text>
        </TouchableOpacity>
    );

    const logoutDialogFooter = (
        <View className="flex-row gap-3">
            <TouchableOpacity
                className={`flex-1 py-3 rounded-lg ${isLoggingOut ? 'bg-gray-200' : 'bg-gray-100'}`}
                onPress={() => setLogoutDialogVisible(false)}
                disabled={isLoggingOut}
            >
                <Text className={`text-center font-medium ${isLoggingOut ? 'text-gray-400' : 'text-gray-700'}`}>
                    Cancel
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className={`flex-1 py-3 rounded-lg flex-row items-center justify-center ${isLoggingOut ? 'bg-red-400' : 'bg-red-500'}`}
                onPress={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <Text className="text-white text-center font-medium">Logout</Text>
                )}
            </TouchableOpacity>
        </View>
    );

    // Format phone number for display
    const formatPhoneNumber = (number) => {
        if (!number) return '1800-123-4567';
        const cleaned = number.replace(/\D/g, '');
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
        <View className="flex-1 bg-teal-50">
            <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
                <View className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-teal-200/40" />
                <View className="absolute top-40 -left-16 w-52 h-52 rounded-full bg-emerald-200/30" />
                <View className="absolute top-80 right-8 w-40 h-40 rounded-full bg-cyan-200/35" />
                <View className="absolute -bottom-10 left-1/3 w-72 h-72 rounded-full bg-teal-100/40" />
                <View className="absolute top-20 left-1/4 w-20 h-20 rounded-full bg-green-200/25" />
                <View className="absolute bottom-40 -right-8 w-36 h-36 rounded-full bg-emerald-100/30" />
            </View>
            <View className="absolute inset-0 z-50 pointer-events-none">
                <Toaster />
            </View>
            <View className="flex-1 bg-transparent items-center justify-center px-6" style={{zIndex: 1}}>
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

                <View className='flex-row gap-4 mb-6'>
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

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={handleLogoutPress}
                    disabled={isLoggingOut}
                    className="bg-red-50 py-3 px-8 rounded-xl flex-row items-center border border-red-200"
                >
                    <LogOut size={20} color="#ef4444" />
                    <Text className="text-red-600 font-semibold ml-2">Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Info/Error Dialog */}
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

            {/* Logout Confirmation Dialog */}
            <DialogBox
                visible={logoutDialogVisible}
                onClose={() => {
                    if (!isLoggingOut) setLogoutDialogVisible(false);
                }}
                title={isLoggingOut ? "Logging out..." : "Confirm Logout"}
                size="sm"
                titleStyle="text-black text-lg font-bold"
                showCloseButton={!isLoggingOut}
                closeIconColor="#000"
                closeOnBackdropPress={!isLoggingOut}
                footer={logoutDialogFooter}
                footerStyle="border-t border-red-100"
                headerStyle="border-0"
            >
                <View className="py-6 items-center">
                    {isLoggingOut ? (
                        <>
                            <Icon name="logout" size={60} color="#EF4444" />
                            <Text className="text-gray-600 text-center mt-4 text-base">
                                Please wait while we log you out...
                            </Text>
                        </>
                    ) : (
                        <>
                            <Icon name="logout" size={60} color="#EF4444" />
                            <Text className="text-gray-600 text-center mt-4 text-base">
                                Are you sure you want to logout?
                            </Text>
                            <Text className="text-gray-500 text-center mt-1 text-sm">
                                You'll need to login again to access your account.
                            </Text>
                        </>
                    )}
                </View>
            </DialogBox>
        </View>
    );
};

export default OffLineScreen;
