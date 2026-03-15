import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';

const NoInternet = ({ onRetry }) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-24 h-24 rounded-full bg-red-100 items-center justify-center mb-6">
          <Icon name="wifi-off" size={48} color="#EF4444" />
        </View>
        
        <Text className="text-2xl font-bold text-gray-800 text-center mb-2">
          No Internet Connection
        </Text>
        
        <Text className="text-base text-gray-500 text-center mb-8">
          Please check your network settings and try again.
        </Text>
        
        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="bg-teal-500 px-8 py-3 rounded-full"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default NoInternet;

const styles = StyleSheet.create({});