import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState(''); // Will be used as username
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const validateInputs = () => {
        if (!identifier.trim()) {
            Alert.alert('Error', 'Please enter username');
            return false;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Please enter password');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateInputs()) return;

        setIsLoading(true);
        try {
            // Using DummyJSON Auth API
            const response = await fetch('https://dummyjson.com/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: identifier, // This expects username
                    password: password,
                    expiresInMins: 30, // optional, defaults to 60
                }),
            });

            const data = await response.json();
            console.log('API Response:', data); // Debug log

            if (response.ok) {
                // Check if accessToken exists in response (DummyJSON returns "accessToken", not "accessaccessToken")
                if (!data.accessToken) {
                    Alert.alert('Error', 'No accessToken received from server');
                    console.log('Response data:', data);
                    setIsLoading(false);
                    return;
                }

                // Successful login - extract user data
                const userData = {
                    id: data.id,
                    name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.username,
                    email: data.email || '',
                    username: data.username,
                    image: data.image || null,
                    firstName: data.firstName || '',
                    lastName: data.lastName || '',
                    gender: data.gender || '',
                };

                const userAccessToken = data.accessToken; // FIXED: Changed from accessaccessToken to accessToken
                const refreshToken = data.refreshToken; // You can also store refreshToken if needed

                // Validate data before passing to login
                if (!userAccessToken || !userData) {
                    Alert.alert('Error', 'Invalid response data');
                    setIsLoading(false);
                    return;
                }

                // Call login function from context
                await login(userData, userAccessToken);

                // Optional: Store refreshToken separately if needed
                // await AsyncStorage.setItem('refreshToken', refreshToken);

                Alert.alert('Success', `Welcome ${userData.firstName || userData.name}!`);
            } else {
                // Handle API error messages
                const errorMessage = data.message || 'Invalid username or password';
                Alert.alert('Login Failed', errorMessage);
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please check your connection.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleForgotPassword = () => {
        Alert.alert('Forgot Password', 'Please contact support or use demo credentials below.');
    };

    // Function to auto-fill demo credentials
    const fillDemoCredentials = (username, userPassword) => {
        setIdentifier(username);
        setPassword(userPassword);
    };

    // DummyJSON demo users
    const dummyUsers = [
        {
            id: 1,
            username: 'emilys',
            password: 'emilyspass',
            name: 'Emily Johnson',
            email: 'emily.johnson@x.dummyjson.com',
            icon: '👩',
            color: '#FF69B4'
        },
        {
            id: 2,
            username: 'hannah',
            password: 'hannahpass',
            name: 'Hannah',
            email: 'hannah@x.dummyjson.com',
            icon: '👧',
            color: '#9370DB'
        },
        {
            id: 3,
            username: 'charlie',
            password: 'charliepass',
            name: 'Charlie',
            email: 'charlie@x.dummyjson.com',
            icon: '👨',
            color: '#4169E1'
        },
        {
            id: 4,
            username: 'michael',
            password: 'michaelpass',
            name: 'Michael',
            email: 'michael@x.dummyjson.com',
            icon: '👱',
            color: '#2E8B57'
        }
    ];

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Sign in with DummyJSON</Text>
            </View>

            <View style={styles.formContainer}>
                {/* Username Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your username"
                        placeholderTextColor="#999"
                        value={identifier}
                        onChangeText={setIdentifier}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!isLoading}
                    />
                </View>

                {/* Password Input */}
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, styles.passwordInput]}
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
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                        >
                            <Text style={styles.eyeIconText}>
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Forgot Password */}
                <TouchableOpacity
                    style={styles.forgotPassword}
                    onPress={handleForgotPassword}
                    disabled={isLoading}
                >
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                </TouchableOpacity>

                {/* DummyJSON Demo Users Section */}
                <View style={styles.demoContainer}>
                    <Text style={styles.demoTitle}>🎭 DummyJSON Test Accounts (Tap to fill):</Text>

                    {dummyUsers.map((user) => (
                        <TouchableOpacity
                            key={user.id}
                            style={[styles.demoCredentialItem, { borderLeftColor: user.color, borderLeftWidth: 5 }]}
                            onPress={() => fillDemoCredentials(user.username, user.password)}
                            disabled={isLoading}
                        >
                            <Text style={styles.demoIcon}>{user.icon}</Text>
                            <View style={styles.demoTextContainer}>
                                <Text style={styles.demoLabel}>{user.name}</Text>
                                <Text style={styles.demoText}>Username: <Text style={styles.demoValue}>{user.username}</Text></Text>
                                <Text style={styles.demoText}>Password: <Text style={styles.demoValue}>{user.password}</Text></Text>
                                <Text style={styles.demoText}>Email: <Text style={styles.demoValue}>{user.email}</Text></Text>
                            </View>
                            <View style={styles.tapContainer}>
                                <Text style={styles.tapIcon}>👆</Text>
                                <Text style={styles.tapText}>Tap</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Quick Fill Buttons Row */}
                    <View style={styles.quickFillRow}>
                        {dummyUsers.slice(0, 2).map((user) => (
                            <TouchableOpacity
                                key={`quick-${user.id}`}
                                style={[styles.quickFillButton, { backgroundColor: user.color }]}
                                onPress={() => fillDemoCredentials(user.username, user.password)}
                                disabled={isLoading}
                            >
                                <Text style={styles.quickFillText}>{user.icon} {user.username}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.quickFillRow}>
                        {dummyUsers.slice(2, 4).map((user) => (
                            <TouchableOpacity
                                key={`quick-${user.id}`}
                                style={[styles.quickFillButton, { backgroundColor: user.color }]}
                                onPress={() => fillDemoCredentials(user.username, user.password)}
                                disabled={isLoading}
                            >
                                <Text style={styles.quickFillText}>{user.icon} {user.username}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.apiNote}>Using DummyJSON Auth API</Text>
                </View>
            </View>
        </View>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    headerContainer: {
        marginTop: 40,
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: '#333',
        backgroundColor: '#f9f9f9',
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 50,
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: 15,
        padding: 5,
    },
    eyeIconText: {
        fontSize: 20,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: '#007AFF',
        fontSize: 14,
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#007AFF',
        padding: 18,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    loginButtonDisabled: {
        backgroundColor: '#99c2ff',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    demoContainer: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#f8f9fa',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    demoTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#495057',
        marginBottom: 15,
    },
    demoCredentialItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#dee2e6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    demoIcon: {
        fontSize: 28,
        marginRight: 12,
    },
    demoTextContainer: {
        flex: 1,
    },
    demoLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#212529',
        marginBottom: 4,
    },
    demoText: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 2,
    },
    demoValue: {
        color: '#007AFF',
        fontWeight: '500',
    },
    tapContainer: {
        alignItems: 'center',
        marginLeft: 8,
        paddingHorizontal: 8,
    },
    tapIcon: {
        fontSize: 18,
        color: '#007AFF',
    },
    tapText: {
        fontSize: 10,
        color: '#007AFF',
        fontWeight: '500',
    },
    quickFillRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        gap: 10,
    },
    quickFillButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        opacity: 0.9,
    },
    quickFillText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    apiNote: {
        textAlign: 'center',
        marginTop: 15,
        fontSize: 11,
        color: '#adb5bd',
        fontStyle: 'italic',
    },
});