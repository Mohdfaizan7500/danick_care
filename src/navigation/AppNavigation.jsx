import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import AppStack from './AppStack/AppStack';
import AuthStack from './AuthStack/AuthStack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

const AppNavigation = () => {
    const { accessToken, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                {/* <View style={styles.iconContainer}> */}
                    <Image
                        source={require('../assets/images/AppIcon.png')}
                        style={{ width: 100, height: 100 }}
                        resizeMode='contain'
                    />
                {/* </View> */}
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
    iconContainer: {
        borderWidth: 0,
        width: 150,
        height: 150,
        borderRadius: 80,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        // Android shadow
        elevation: 5,
        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});