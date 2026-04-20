// src/hooks/useLocation.js
import { useState, useCallback } from 'react';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import { check, request, openSettings, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { toast } from 'sonner-native';
import StatusMessage from '../components/StatusMessage';

// Import PERMISSIONS correctly based on platform
import { PERMISSIONS } from 'react-native-permissions';

const useLocation = () => {
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);

    const checkLocationPermission = useCallback(async () => {
        try {
            if (Platform.OS === 'ios') {
                const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
                console.log('iOS location permission status:', status);
                return status;
            } else {
                const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
                console.log('Android location permission status:', status);
                return status;
            }
        } catch (error) {
            console.log('Permission check error:', error);
            return RESULTS.UNAVAILABLE;
        }
    }, []);

    const requestLocationPermission = useCallback(async () => {
        try {
            if (Platform.OS === 'ios') {
                return await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
            } else {
                return await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            }
        } catch (error) {
            console.log('Permission request error:', error);
            return RESULTS.UNAVAILABLE;
        }
    }, []);

    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            // Check if Geolocation is available
            if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
                reject(new Error('Geolocation service is not available'));
                return;
            }

            let timeoutId;

            const successCallback = (position) => {
                if (timeoutId) clearTimeout(timeoutId);
                const { latitude, longitude } = position.coords;
                console.log('=== LOCATION OBTAINED ===');
                console.log('Latitude:', latitude);
                console.log('Longitude:', longitude);
                console.log('Accuracy:', position.coords.accuracy);
                console.log('=============================================');
                resolve({
                    latitude: latitude.toString(),
                    longitude: longitude.toString(),
                    accuracy: position.coords.accuracy
                });
            };

            const errorCallback = (error) => {
                if (timeoutId) clearTimeout(timeoutId);
                console.log('Location error code:', error.code);
                console.log('Location error message:', error.message);

                let errorMessage = 'Failed to get location';
                if (error.code === 1) {
                    errorMessage = 'Location permission denied';
                } else if (error.code === 2) {
                    errorMessage = 'Location unavailable. Please enable GPS.';
                } else if (error.code === 3) {
                    errorMessage = 'Location request timed out. Please try again.';
                }

                reject(new Error(errorMessage));
            };

            // Set timeout to reject if location takes too long
            timeoutId = setTimeout(() => {
                errorCallback({ code: 3, message: 'Location request timed out after 15 seconds' });
            }, 15000);

            try {
                Geolocation.getCurrentPosition(successCallback, errorCallback, {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                });
            } catch (error) {
                console.error('Geolocation.getCurrentPosition error:', error);
                reject(new Error('Failed to get location: ' + error.message));
            }
        });
    }, []);

    const initializeLocation = useCallback(async (retryCount = 0) => {
        const maxRetries = 2;

        try {
            console.log('Initializing location, attempt:', retryCount + 1);

            let permissionStatus = await checkLocationPermission();
            console.log('Current permission status:', permissionStatus);

            if (permissionStatus === RESULTS.GRANTED) {
                setHasLocationPermission(true);
                setIsGettingLocation(true);

                try {
                    const location = await getCurrentLocation();
                    setCurrentLocation(location);
                    console.log('✅ LOCATION SUCCESSFULLY OBTAINED');
                    console.log('Latitude:', location.latitude);
                    console.log('Longitude:', location.longitude);
                    toast.custom(
                        <StatusMessage type="success" title="Location obtained successfully" />,
                        { duration: 2000 }
                    );
                    return location;
                } catch (error) {
                    console.log('Error getting location:', error.message);

                    // Retry logic
                    if (retryCount < maxRetries) {
                        console.log(`Retrying location fetch (${retryCount + 1}/${maxRetries})...`);
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        return initializeLocation(retryCount + 1);
                    }

                    toast.custom(
                        <StatusMessage type="error" title={error.message} />,
                        { duration: 3000 }
                    );
                    return null;
                } finally {
                    setIsGettingLocation(false);
                }
            }

            if (permissionStatus === RESULTS.DENIED) {
                console.log('Permission denied, requesting...');
                const requestStatus = await requestLocationPermission();
                console.log('Request result:', requestStatus);

                if (requestStatus === RESULTS.GRANTED) {
                    setHasLocationPermission(true);
                    setIsGettingLocation(true);
                    try {
                        const location = await getCurrentLocation();
                        setCurrentLocation(location);
                        console.log('✅ LOCATION SUCCESSFULLY OBTAINED AFTER PERMISSION');
                        toast.custom(
                            <StatusMessage type="success" title="Location obtained successfully" />,
                            { duration: 2000 }
                        );
                        return location;
                    } catch (error) {
                        console.log('Error getting location:', error.message);
                        toast.custom(
                            <StatusMessage type="error" title={error.message} />,
                            { duration: 3000 }
                        );
                        return null;
                    } finally {
                        setIsGettingLocation(false);
                    }
                } else {
                    setHasLocationPermission(false);
                    toast.custom(
                        <StatusMessage type="error" title="Location permission is required for OTP verification" />,
                        { duration: 3000 }
                    );
                    return null;
                }
            }

            if (permissionStatus === RESULTS.BLOCKED) {
                setHasLocationPermission(false);
                Alert.alert(
                    'Location Permission Required',
                    'This app requires location permission for OTP verification. Please enable location access in settings.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => openSettings() },
                    ]
                );
                return null;
            }

            return null;
        } catch (error) {
            console.log('Location initialization error:', error);
            setIsGettingLocation(false);
            return null;
        }
    }, [checkLocationPermission, requestLocationPermission, getCurrentLocation]);

    const resetLocation = useCallback(() => {
        setCurrentLocation(null);
        setHasLocationPermission(false);
        setIsGettingLocation(false);
    }, []);

    const refreshLocation = useCallback(async () => {
        setIsGettingLocation(true);
        try {
            const location = await getCurrentLocation();
            setCurrentLocation(location);
            console.log('✅ LOCATION REFRESHED');
            return location;
        } catch (error) {
            console.log('Error refreshing location:', error.message);
            toast.custom(
                <StatusMessage type="error" title={error.message} />,
                { duration: 3000 }
            );
            return null;
        } finally {
            setIsGettingLocation(false);
        }
    }, [getCurrentLocation]);

    return {
        // State
        hasLocationPermission,
        isGettingLocation,
        currentLocation,
        
        // Methods
        initializeLocation,
        resetLocation,
        refreshLocation,
        checkLocationPermission,
        requestLocationPermission,
        getCurrentLocation,
    };
};

export default useLocation;