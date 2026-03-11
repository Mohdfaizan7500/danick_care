import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";

// Create the context
const AuthContext = createContext({});

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored tokens on app start
  useEffect(() => {
    checkStoredTokens();
  }, []);

  const checkStoredTokens = async () => {
    try {
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedAccessToken && storedUser && storedAccessToken !== 'undefined' && storedUser !== 'undefined') {
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking stored tokens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Login function with validation
  const login = async (userData, userAccessToken, userRefreshToken = null) => {
    // Validate inputs before storing
    if (!userAccessToken || userAccessToken === undefined) {
      console.error('Invalid accessToken: accessToken is undefined');
      return;
    }

    if (!userData || userData === undefined) {
      console.error('Invalid user data: userData is undefined');
      return;
    }

    try {
      setUser(userData);
      setAccessToken(userAccessToken);
      if (userRefreshToken) setRefreshToken(userRefreshToken);
      
      // Store in AsyncStorage with validation
      await AsyncStorage.setItem('accessToken', String(userAccessToken));
      if (userRefreshToken) {
        await AsyncStorage.setItem('refreshToken', String(userRefreshToken));
      }
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      
      // Remove from AsyncStorage
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Error removing auth data:', error);
    }
  };

  // Update user data
  const updateUser = async (updatedUserData) => {
    if (!updatedUserData) {
      console.error('Invalid user data for update');
      return;
    }

    try {
      setUser(updatedUserData);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!accessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;