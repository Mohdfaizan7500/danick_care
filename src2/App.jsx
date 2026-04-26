import { Alert, StyleSheet, Text, View, Linking } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './screens/Home';
import Profile from './screens/Profile';
import Product from './screens/Product';
import DeepLinkHandler from './DeepLinkHandler';
import NotificationService from './services/NotificationService';
import "../global.css"
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

const App = () => {
    const navigationRef = useRef();

    const linking ={
        prefixes:["partner://"],
        config:{

        }
    }



    useEffect(() => {
        const checkPendingDeepLink = async () => {
            try {
                const pendingDeepLink = await AsyncStorage.getItem('pendingDeepLink');
                if (pendingDeepLink) {
                    console.log('Found pending deep link:', pendingDeepLink);
                    await AsyncStorage.removeItem('pendingDeepLink');

                    setTimeout(() => {
                        Linking.openURL(pendingDeepLink).catch(err => {
                            console.error('Error opening pending deep link:', err);
                        });
                    }, 1000);
                }
            } catch (error) {
                console.error('Error checking pending deep link:', error);
            }
        };

        checkPendingDeepLink();
    }, []);


    return (
        <NavigationContainer
            
            ref={navigationRef}
            linking={{
                prefixes: ['partner://', 'https://partner.com', 'http://partner.com'],
                config: {
                    screens: {
                        Home: 'home',
                        Profile: 'profile',
                        Product: 'product/:productId',
                    },
                },
                async getInitialURL() {
                    const url = await Linking.getInitialURL();
                    if (url) {
                        console.log('Initial URL:', url);
                        return url;
                    }
                    return null;
                },
                subscribe(listener) {
                    const onReceiveURL = ({ url }) => {
                        console.log('Received URL:', url);
                        listener(url);
                    };

                    const subscription = Linking.addEventListener('url', onReceiveURL);

                    return () => {
                        subscription.remove();
                    };
                },
            }}
        >
            <DeepLinkHandler>
                <Stack.Navigator>
                    <Stack.Screen name="Home" component={Home} />
                    <Stack.Screen name="Product" component={Product} />
                    <Stack.Screen name="Profile" component={Profile} />
                </Stack.Navigator>
            </DeepLinkHandler>
        </NavigationContainer>
    );
};

export default App;

const styles = StyleSheet.create({});