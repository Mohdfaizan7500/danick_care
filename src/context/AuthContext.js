import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [IsOnline] = useState(true);
  const [importedPart, setImportedPart] = useState(null);

  // Initialize from stored tokens
  useEffect(() => {
    checkStoredTokens();
  }, [IsOnline]);

  const checkStoredTokens = async () => {
    try {
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      
      if (storedAccessToken && storedAccessToken !== 'undefined') {
        try {
          const decodedToken = jwtDecode(storedAccessToken);
          const userData = {
            id: decodedToken.id || decodedToken.sub,
            username: decodedToken.username || decodedToken.preferred_username,
            email: decodedToken.email,
          };
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(userData);
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          const storedUser = await AsyncStorage.getItem('userData');
          if (storedUser && storedUser !== 'undefined') {
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
            setUser(JSON.parse(storedUser));
          }
        }
      }
    } catch (error) {
      console.error('Error checking stored tokens:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  // NEW: Set auth data after successful login (used by login screen)
  const setAuthData = async (userData, userAccessToken, userRefreshToken = null) => {
    if (!userAccessToken) {
      console.error('Invalid accessToken');
      return;
    }

    try {
      setAccessToken(userAccessToken);
      if (userRefreshToken) setRefreshToken(userRefreshToken);
      setUser(userData);

      await AsyncStorage.setItem('accessToken', String(userAccessToken));
      if (userRefreshToken) {
        await AsyncStorage.setItem('refreshToken', String(userRefreshToken));
      }
      if (userData) {
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }

      console.log('Auth data stored successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setImportedPart(null);

      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');

      console.log('Logout successful');
    } catch (error) {
      console.error('Error removing auth data:', error);
    }
  };

  const updateUser = async (updatedUserData) => {
    if (!updatedUserData) return;
    try {
      setUser(updatedUserData);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const refreshUserFromToken = () => {
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const userData = {
          id: decodedToken.id || decodedToken.sub,
          username: decodedToken.username || decodedToken.preferred_username,
          email: decodedToken.email,
        };
        setUser(userData);
        return userData;
      } catch (error) {
        console.error('Error refreshing user from token:', error);
      }
    }
    return null;
  };

  const updateImportedPart = (newPart) => {
    setImportedPart(newPart);
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    importedPart,
    updateImportedPart,
    setAuthData,          // <-- new method to set auth data
    logout,
    updateUser,
    refreshUserFromToken,
    IsOnline,
    isAuthenticated: !!accessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;