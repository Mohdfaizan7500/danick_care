// hooks/useInternetStatus.js
import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useInternetStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionType, setConnectionType] = useState(null);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let unsubscribe;
    
    const initNetInfo = async () => {
      unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected ?? false);
        setConnectionType(state.type);
        setIsInternetReachable(state.isInternetReachable ?? false);
      });
    };
    
    initNetInfo();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? false);
      setIsInternetReachable(state.isInternetReachable ?? false);
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const waitForConnection = useCallback(async (maxAttempts = 10, delay = 1000) => {
    for (let i = 0; i < maxAttempts; i++) {
      const connected = await checkConnection();
      if (connected) return true;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return false;
  }, [checkConnection]);

  return {
    isConnected,
    connectionType,
    isInternetReachable,
    isChecking,
    checkConnection,
    waitForConnection
  };
};