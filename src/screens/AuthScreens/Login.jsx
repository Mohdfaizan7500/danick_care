import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

const Login = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const { login } = useAuth();

    // Demo account credentials
    const demoAccount = {
        username: 'emilys',
        password: 'emilyspass'
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        
        try {
            // Make API call to dummyjson
            const response = await fetch('https://dummyjson.com/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: email, // Using username field as per API
                    password: password,
                    expiresInMins: 30,
                }),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Extract user data from response
            const userData = {
                id: data.id,
                username: data.username,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                gender: data.gender,
                image: data.image
            };

            // Store tokens and user data using auth context
            await login(userData, data.accessToken, data.refreshToken);
            
            Alert.alert('Success', 'Logged in successfully!');
            
        } catch (error) {
            Alert.alert('Error', error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fillDemoAccount = () => {
        setEmail(demoAccount.username);
        setPassword(demoAccount.password);
    };

    return (
        <View className='flex-1 bg-teal-100 justify-center items-center px-10'>
            <View className='bg-white w-[100%] p-8 h-auto rounded-3xl shadow-lg border border-gray-100'>
                <Text className='font-bold text-3xl text-black mb-2'>Welcome Back</Text>
                <Text className='text-gray-500 text-base mb-8'>Sign in to your account</Text>

                {/* Email/Username Input */}
                <View className='mb-5'>
                    <Text className='text-sm font-semibold text-gray-700 mb-2'>Username</Text>
                    <View className='flex-row items-center border gap-3 border-gray-300 rounded-xl bg-gray-50 px-4'>
                        <Mail width={16} height={16} stroke={'gray'} />
                        <TextInput
                            className='flex-1 py-4 text-base text-black'
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

                {/* Password Input */}
                <View className='mb-5'>
                    <Text className='text-sm font-semibold text-gray-700 mb-2'>Password</Text>
                    <View className='flex-row items-center border gap-3 border-gray-300 rounded-xl bg-gray-50 px-4'>
                        <Lock width={16} height={16} stroke={'gray'} />
                        <TextInput
                            className='flex-1 py-4 text-base text-black'
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                        >
                            {showPassword ? 
                                <Eye width={16} height={16} stroke={'gray'} /> : 
                                <EyeOff width={16} height={16} stroke={'gray'} />
                            }
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Login Button */}
                <TouchableOpacity
                    className={`py-4 rounded-xl items-center ${isLoading ? 'bg-teal-400' : 'bg-teal-500'}`}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text className='text-white text-lg font-semibold'>
                        {isLoading ? 'Please wait...' : 'Sign In'}
                    </Text>
                </TouchableOpacity>

                {/* Demo Account Info - Clickable */}
                <TouchableOpacity 
                    className='bg-[#FFEDD4] mt-5 px-4 py-2 rounded-xl border border-[#FFB86A]'
                    onPress={fillDemoAccount}
                    disabled={isLoading}
                >
                    <Text className='font-bold text-sm text-gray-800 mb-2'>Demo Account (Click to fill)</Text>
                    <Text className='font-normal text-xs text-gray-500'>Username: emilys</Text>
                    <Text className='font-normal text-xs text-gray-500'>Password: emilyspass</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default Login

const styles = StyleSheet.create({})