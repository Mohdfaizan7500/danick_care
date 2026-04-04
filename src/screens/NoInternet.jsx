import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';

const NoInternet = ({ onRetry, onConnectionRestored }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [checkingMessage, setCheckingMessage] = useState('');

  const handleRetry = async () => {
    setIsChecking(true);
    setCheckingMessage('Checking connection...');
    
    // Wait for 2 seconds while checking connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check actual connection
    const state = await NetInfo.fetch();
    const isConnected = state.isConnected ?? false;
    
    if (isConnected) {
      setCheckingMessage('Connection restored!');
      
      // Call the callback if provided
      if (onConnectionRestored) {
        await onConnectionRestored();
      }
      
      // Call the retry callback if provided
      if (onRetry) {
        await onRetry();
      }
      
      // Reset checking state after a short delay
      setTimeout(() => {
        setIsChecking(false);
        setCheckingMessage('');
      }, 1000);
    } else {
      setCheckingMessage('Still offline. Please check your connection.');
      
      // Reset checking state after showing error
      setTimeout(() => {
        setIsChecking(false);
        setCheckingMessage('');
      }, 2000);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        {/* Icon or Loader */}
        <View className="w-24 h-24 rounded-full bg-red-100 items-center justify-center mb-6">
          {isChecking ? (
            <ActivityIndicator size="large" color="#EF4444" />
          ) : (
            <Icon name="wifi-off" size={48} color="#EF4444" />
          )}
        </View>
        
        <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
          {isChecking ? 'Connecting...' : 'No Internet Connection'}
        </Text>
        
        <Text className="text-base text-gray-500 text-center mb-8">
          {checkingMessage || (isChecking ? 'Please wait while we check your connection...' : 'Please check your network settings and try again.')}
        </Text>
        
        <TouchableOpacity
          onPress={handleRetry}
          disabled={isChecking}
          className={`px-8 py-3 rounded-full bg-teal-500`}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Text className="text-white font-semibold text-base">
              {isChecking ? 'Checking...' : 'Retry'}
            </Text>
            
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NoInternet;

const styles = StyleSheet.create({});