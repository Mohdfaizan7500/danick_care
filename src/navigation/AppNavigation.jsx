import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import AppStack from './AppStack/AppStack';
import AuthStack from './AuthStack/AuthStack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const AppNavigation = () => {
    // Destructure the values from useAuth() hook
    const { accessToken, isLoading } = useAuth(); 

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading...ewuirwui</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            {accessToken ? <AppStack /> : <AuthStack />} 
        </NavigationContainer>
    );
};

export default AppNavigation;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        fontSize: 18,
        color: '#333',
    },
});