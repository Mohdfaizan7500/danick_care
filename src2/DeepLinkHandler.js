import { useEffect, useRef } from 'react';
import { Linking, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const DeepLinkHandler = ({ children }) => {
    const navigation = useNavigation();
    const navigationRef = useRef(navigation);
    
    useEffect(() => {
        navigationRef.current = navigation;
    }, [navigation]);
    
    useEffect(() => {
        const handleDeepLink = (event) => {
            const { url } = event;
            console.log('Deep link received:', url);
            handleNavigation(url);
            
            // Show alert that deep link was received
            Alert.alert('Deep Link Received', `Opening: ${url}`);
        };
        
        const subscription = Linking.addEventListener('url', handleDeepLink);
        
        const checkInitialDeepLink = async () => {
            try {
                const initialUrl = await Linking.getInitialURL();
                if (initialUrl) {
                    console.log('App opened from deep link:', initialUrl);
                    setTimeout(() => {
                        handleNavigation(initialUrl);
                        Alert.alert('Opened from Link', `Welcome back! Opening: ${initialUrl}`);
                    }, 500);
                }
            } catch (error) {
                console.error('Error checking initial deep link:', error);
            }
        };
        
        checkInitialDeepLink();
        
        return () => {
            subscription.remove();
        };
    }, []);
    
    const handleNavigation = (url) => {
        try {
            let path = url.replace('partner://', '');
            const parts = path.split('/');
            const route = parts[0];
            const param = parts[1];
            
            console.log('Navigating to route:', route, 'with param:', param);
            
            if (route === 'profile') {
                navigationRef.current?.navigate('Profile');
            } else if (route === 'product') {
                navigationRef.current?.navigate('Product', { productId: param });
            } else if (route === 'home') {
                navigationRef.current?.navigate('Home');
            }
        } catch (error) {
            console.error('Error navigating deep link:', error);
        }
    };
    
    return children;
};

export default DeepLinkHandler;