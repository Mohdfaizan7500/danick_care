import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DialogBox from '../../components/DilaogBox';
import { loginApi } from '../../lib/api'; // adjust path as needed

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [dialogVisible, setDialogVisible] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({
        type: 'error',
        title: '',
        message: '',
        onConfirm: null,
    });

    const { setAuthData, setIsOnline } = useAuth();

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
            const result = await loginApi(email, password);
            // console.log('API response:', result);

            // -------- TOKEN EXTRACTION LOGIC --------
            // The API response structure may vary. Adjust the extraction below
            // based on your actual backend.

            // Try to find accessToken at different levels
            let accessToken = result?.accessToken || result?.data.data?.accessToken || result?.token;
            let refreshToken = result?.refreshToken || result?.data?.refreshToken;
            let userData = result?.data?.data

            // If still no token, maybe the response is directly the user object (like your log shows)
            // In that case, there is no token – you'll need to handle accordingly.
            if (!accessToken && (result?.id || result?.technician_id)) {
                // The response is the user object without token – this is unusual.
                // You may need to request a token separately or accept that this is a demo.
                console.warn('No token received from API; proceeding without token (demo mode)');
                // For demo purposes, we create a dummy token.
                accessToken = 'demo-token-' + Date.now();
                userData = result;
            }

            // Validate token presence
            if (!accessToken) {
                throw new Error('No access token received from server');
            }

            // Ensure userData is an object
            if (!userData || typeof userData !== 'object') {
                throw new Error('Invalid user data received');
            }

            // Normalize user object fields (map backend fields to app fields)
            const user = {
                id: userData.id,
                city_id: userData.city_id,

                technician_id: userData.technician_id,

                ...userData, // keep any extra fields
            };
            console.log('user:',user)

            // Save to AuthContext (which will store in AsyncStorage)
            await setAuthData(user, accessToken, refreshToken);
            console.log('login status :', userData?.data?.login_status)
            if (userData?.data?.data?.login_status === 'Online') {
                await setIsOnline(true);
            }
            else {
                await setIsOnline(true);
            }

            showDialog('success', 'Success!', 'Logged in successfully!', () => {
                // Navigate to main screen
                navigation.replace('Home'); // or navigation.navigate('Home')
            });
        } catch (error) {
            console.error('Login error:', error);
            showDialog('error', 'Login Failed', error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoAccount = () => {
        // Use the demo credentials from your backend
        setEmail('46757');      // technician_id
        setPassword('111');     // password
        showDialog('info', 'Demo Account Filled', 'Demo credentials have been filled. Click Sign In to continue.');
    };

    // ---------- Dialog Footers ----------
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
        <View className="flex-1 bg-teal-100 justify-center items-center px-10">
            <View className="bg-white w-[100%] p-8 h-auto rounded-3xl shadow-lg border border-gray-100">
                <Text className="font-bold text-3xl text-black mb-2">Welcome Back</Text>
                <Text className="text-gray-500 text-base mb-8">Sign in to your account</Text>

                <View className="mb-5">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Username</Text>
                    <View className="flex-row items-center border gap-3 border-gray-300 rounded-xl bg-gray-50 px-4">
                        <Mail width={16} height={16} stroke="gray" />
                        <TextInput
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
                    <Text className="font-normal text-xs text-gray-500">Password: 111</Text>
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
        </View>
    );
};

export default Login;