// src/navigation/components/LoadingScreen.js
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <Image
        source={require('../../assets/images/AppIcon.png')}
        style={{ width: 100, height: 100 }}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default LoadingScreen;