import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { Eye, EyeClosed, EyeOff, Lock, Mail } from 'lucide-react-native';
import { Colors } from '../../constants/Color';
import { green } from 'react-native-reanimated/lib/typescript/Colors';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Logged in successfully!');
        }, 1500);
    };

    return (
        <View className='flex-1 bg-teal-100 justify-center items-center px-10'>
            <View className='bg-white w-[100%] p-8 h-auto rounded-3xl shadow-lg border border-gray-100'>
                <Text className='font-bold text-3xl text-black mb-2'>Welcome Back</Text>
                <Text className='text-gray-500 text-base mb-8'>Sign in to your account</Text>

                {/* Email Input */}
                <View className='mb-5'>
                    <Text className='text-sm font-semibold text-gray-700 mb-2'>Email</Text>
                    <View className='flex-row items-center border gap-3 border-gray-300 rounded-xl bg-gray-50 px-4'>
                        <Mail width={16} height={16} stroke={'gray'} />

                        <TextInput
                            className='flex-1 py-4 text-base text-black'
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
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
                            <Text className='text-xl'>
                                {showPassword ? <Eye width={16} height={16} stroke={'gray'} /> : <EyeOff width={16} height={16} stroke={'gray'} />}
                            </Text>
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
                <View className='bg-[#FFEDD4] mt-5 px-4 py-2 rounded-xl border border-[#FFB86A]' >
                    <Text className='font-bold text-sm  text-gray-800 mb-2'>Demo Account</Text>
                    <Text className='font-normal text-xs text-gray-500'>Email:xyz@gamil.com</Text>
                    <Text className='font-normal text-xs text-gray-500'>Password:1234567890</Text>
                </View>


            </View>
        </View>
    )
}

export default Login

const styles = StyleSheet.create({})