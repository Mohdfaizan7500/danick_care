// src/navigation/AppNavigation.js
import React, { forwardRef } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AppStack from './AppStack/AppStack';
import AuthStack from './AuthStack/AuthStack';

// Use forwardRef to accept the ref prop
const AppNavigation = forwardRef((props, ref) => {
    const { accessToken, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <Image
                    source={require('../assets/images/AppIcon.png')}
                    style={{ width: 100, height: 100 }}
                    resizeMode='contain'
                />
            </View>
        );
    }

    return (
        <NavigationContainer ref={ref}>
            {!accessToken ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
});

AppNavigation.displayName = 'AppNavigation';

export default AppNavigation;

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    iconContainer: {
        borderWidth: 0,
        width: 150,
        height: 150,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});