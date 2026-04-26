import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export const navigateToScreen = (screenName) => {
  console.log('🎯 Navigation helper - navigating to:', screenName);
  
  if (navigationRef.isReady()) {
    const validScreens = ['Home', 'Product', 'Profile'];
    const targetScreen = validScreens.includes(screenName) ? screenName : 'Home';
    navigationRef.navigate(targetScreen);
  } else {
    console.log('Navigation not ready, saving screen for later:', screenName);
    // Save to AsyncStorage to handle later
    import('@react-native-async-storage/async-storage').then(({ default: AsyncStorage }) => {
      AsyncStorage.setItem('pendingNotificationScreen', screenName);
    });
  }
};