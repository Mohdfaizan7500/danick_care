import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const OffLineScreen = () => {
    // Replace with your actual service center number
    const serviceNumber = '1800-123-4567';

    const handleCallPress = () => {
        // Remove any non-digit characters for the tel: URL
        const phoneNumber = serviceNumber.replace(/-/g, '');
        Linking.openURL(`tel:${phoneNumber}`);
    };

    return (
        <View className="flex-1 bg-background-primary items-center justify-center px-6">
            <View className="w-24 h-24 rounded-full bg-status-inactive items-center justify-center mb-6">
                <Icon name="app-blocking" size={50} color="#999999" /> 
            </View>

            <Text className="text-text-primary text-xl font-bold text-center mb-3">
                You are offline by admin
            </Text>
            <Text className="text-text-secondary text-base text-center mb-6">
                Contact your service center for assistance.
            </Text>

            <Text className="text-primary-sage600 text-lg font-semibold mb-8">
                {serviceNumber}
            </Text>

            <TouchableOpacity
                onPress={handleCallPress}
                className="bg-primary-sage500 py-3 px-8 rounded-xl flex-row items-center"
            >
                <Icon name="phone" size={20} color="white" />
                <Text className="text-white font-semibold text-base ml-2">Call Now</Text>
            </TouchableOpacity>
        </View>
    );
};

export default OffLineScreen;