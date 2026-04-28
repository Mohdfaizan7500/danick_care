import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Platform,
} from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DialogBox from '../../components/DilaogBox';
import { loginApi } from '../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../components/StatusMessage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import messaging from '@react-native-firebase/messaging'
import { getFCMToken } from '../../service/getToken';
import { requestUserPermissions } from '../../permissions/ReqNotification';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

const Login = ({ navigation }) => {



    useEffect(() => {
        requestUserPermissions();
    }, [])

    const testNotification = async () => {
    await notifee.displayNotification({
        title: 'Test Notification',
        body: 'Testing custom sound',
        android: {
            channelId: 'default',
            sound: 'notification',
            importance: AndroidImportance.HIGH,
        },
    });
};

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fcmToken, setFcmToken] = useState(null);

    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({
        type: 'error',
        title: '',
        message: '',
        onConfirm: null,
    });

    const { setAuthData, setIsOnline } = useAuth();

   

    // Get FCM token when component mounts
    useEffect(() => {
        const getToken = async () => {
            try {
                console.log('🔄 Getting FCM token on Login screen...');
                const token = await getFCMToken();;
                setFcmToken(token);
                console.log("✅ FCM token on Login screen:", token);
            } catch (error) {
                console.error('❌ Failed to get FCM token:', error);
                setFcmToken(null);
            }
        };
        getToken();
    }, []);

    const showDialog = (type, title, message, onConfirm = null) => {
        setDialogConfig({ type, title, message, onConfirm });
        setDialogVisible(true);
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            showDialog('error', 'Validation Error', 'Please enter both username and password');
            return;
        }

        setIsLoading(true);
        try {
            // Get fresh FCM token before login
            const fcmToken = await getFCMToken();
            console.log('📤 Sending FCM Token with login:', fcmToken);

            // Call login API with fcm token
            const result = await loginApi(email, password, fcmToken);
            console.log('📥 Login API response:', result);

            if (!result || result.success === false) {
                const errorMsg = result?.data?.msg || result?.error || 'Login failed. Please try again.';
                throw new Error(errorMsg);
            }

            let accessToken = result?.accessToken || result?.data?.accessToken || result?.data?.data?.accessToken;
            let refreshToken = result?.refreshToken || result?.data?.refreshToken || result?.data?.data?.refreshToken;
            let userData = result?.data?.user || result?.data?.data || result?.data;

            if (!accessToken) {
                throw new Error('No access token received from server');
            }

            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid user data received');
            }

            const user = {
                id: userData.id || userData.technician_id,
                city_id: userData.city_id,
                technician_id: userData.technician_id,
                ...userData,
            };

            console.log('👤 User:', user);

            await setAuthData(user, accessToken, refreshToken);
            const isOnline = userData?.login_status === 'Online';
            await setIsOnline(isOnline);

            showDialog('success', 'Success!', 'Logged in successfully!', () => {
                navigation.replace('Home');
            });

        } catch (error) {
            console.error('❌ Login error:', error);
            showDialog('error', 'Login Failed', error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoAccount = () => {
        setEmail('46757');
        setPassword('123');
        toast.custom(
            <StatusMessage
                type='info'
                title='Demo Account Filled'
                message='Demo credentials have been filled. Click Sign In to continue.'
            />,
            { duration: 300 }
        );
    };

    const successFooter = (
        <TouchableOpacity
            className="bg-teal-500 py-3 rounded-lg"
            onPress={() => {
                setDialogVisible(false);
                if (dialogConfig.onConfirm) dialogConfig.onConfirm();
            }}
        >
            <Text className="text-white text-center font-semibold">Continue</Text>
        </TouchableOpacity>
    );

    const defaultFooter = (
        <TouchableOpacity
            className="bg-teal-500 py-3 rounded-lg"
            onPress={() => setDialogVisible(false)}
        >
            <Text className="text-white text-center font-semibold">OK</Text>
        </TouchableOpacity>
    );

    const errorFooter = (
        <TouchableOpacity
            className="bg-red-500 py-3 rounded-lg"
            onPress={() => setDialogVisible(false)}
        >
            <Text className="text-white text-center font-semibold">Got It</Text>
        </TouchableOpacity>
    );

    const getFooter = () => {
        switch (dialogConfig.type) {
            case 'success':
                return successFooter;
            case 'error':
                return errorFooter;
            default:
                return defaultFooter;
        }
    };

    const getIconColor = () => {
        switch (dialogConfig.type) {
            case 'success':
                return '#4CAF50';
            case 'error':
                return '#F44336';
            case 'info':
                return '#2196F3';
            default:
                return '#9E9E9E';
        }
    };

    const getIconName = () => {
        switch (dialogConfig.type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'error';
            case 'info':
                return 'info';
            default:
                return 'help';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-teal-100 justify-center items-center px-5">
            <View className="absolute inset-0 z-50 w-90% pointer-events-none">
                <Toaster />
            </View>
            <StatusBar backgroundColor={'#CCFBF1'} barStyle={'dark-content'} />

            <KeyboardAwareScrollView
                style={{ flex: 1, width: '100%' }}
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    paddingHorizontal: 20,
                }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                enableOnAndroid={true}
                enableResetScrollToCoords={false}
                extraHeight={Platform.OS === 'android' ? 100 : 0}
                extraScrollHeight={Platform.OS === 'android' ? 50 : 0}
            >
                <View className="bg-white w-[100%] py-8 px-5 h-auto rounded-3xl shadow-lg border border-gray-100">
                    <Text className="font-bold text-3xl text-black mb-2">Welcome Back</Text>
                    <Text className="text-gray-500 text-base mb-8">Sign in to your account</Text>

                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Username</Text>
                        <View className="flex-row items-center border gap-3 border-gray-300 rounded-xl bg-gray-50 px-4">
                            <Mail width={16} height={16} stroke="gray" />
                            <TextInput
                                keyboardType='number-pad'
                                className="flex-1 py-4 text-base text-black"
                                placeholder="Enter your username"
                                placeholderTextColor="#999"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                        </View>
                    </View>

                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
                        <View className="flex-row items-center border gap-3 border-gray-300 rounded-xl bg-gray-50 px-4">
                            <Lock width={16} height={16} stroke="gray" />
                            <TextInput
                                keyboardType='number-pad'
                                className="flex-1 py-4 text-base text-black"
                                placeholder="Enter your password"
                                placeholderTextColor="#999"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                editable={!isLoading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                                {showPassword ? (
                                    <Eye width={16} height={16} stroke="gray" />
                                ) : (
                                    <EyeOff width={16} height={16} stroke="gray" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        className={`py-4 rounded-xl items-center ${isLoading ? 'bg-teal-400' : 'bg-teal-500'}`}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-lg font-semibold">Sign In</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-[#FFEDD4] mt-5 px-4 py-2 rounded-xl border border-[#FFB86A]"
                        onPress={fillDemoAccount}
                        disabled={isLoading}
                    >
                        <Text className="font-bold text-sm text-gray-800 mb-2">Demo Account (Click to fill)</Text>
                        <Text className="font-normal text-xs text-gray-500">Username: 46757</Text>
                        <Text className="font-normal text-xs text-gray-500">Password: 123</Text>
                    </TouchableOpacity>
                </View>

                <DialogBox
                    visible={dialogVisible}
                    onClose={() => setDialogVisible(false)}
                    title={dialogConfig.title}
                    size="sm"
                    titleStyle={
                        dialogConfig.type === 'error'
                            ? 'text-red-600 text-lg font-bold'
                            : dialogConfig.type === 'success'
                                ? 'text-green-600 text-lg font-bold'
                                : dialogConfig.type === 'info'
                                    ? 'text-blue-600 text-lg font-bold'
                                    : 'text-gray-800 text-lg font-bold'
                    }
                    showCloseButton={dialogConfig.type !== 'success'}
                    closeIconColor={getIconColor()}
                    closeOnBackdropPress={dialogConfig.type !== 'success'}
                    footer={getFooter()}
                    footerStyle={dialogConfig.type === 'error' ? 'border-t border-red-100' : 'border-t border-gray-100'}
                    headerStyle={dialogConfig.type === 'error' ? 'border-b border-red-100' : 'border-b border-gray-100'}
                >
                    <View className="py-4 items-center">
                        <Icon name={getIconName()} size={50} color={getIconColor()} />
                        <Text className="text-gray-600 text-center mt-4 text-base">{dialogConfig.message}</Text>
                    </View>
                </DialogBox>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
};

export default Login;