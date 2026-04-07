// AuthContext.js - Updated
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [IsOnline, setIsOnline] = useState(true);
  const [importedPart, setImportedPart] = useState(null);
  const [imagUrl, setImageUrl] = useState('https://dainikcare.com/dainik_care_admin/');

  // Initialize from stored tokens
  useEffect(() => {
    checkStoredTokens();
  }, []);

  const checkStoredTokens = async () => {
    try {
      const storedAccessToken = await AsyncStorage.getItem('accessToken');
      const storedRefreshToken = await AsyncStorage.getItem('refreshToken');
      const storedProfileData = await AsyncStorage.getItem('profileData');

      if (storedAccessToken && storedAccessToken !== 'undefined') {
        try {
          const decodedToken = jwtDecode(storedAccessToken);
          console.log('decode data:', decodedToken);
          const userData = {
            id: decodedToken.id || decodedToken.sub,
            technician_id: decodedToken.technician_id,
            city_id: decodedToken?.city_id
          };
          console.log('userdata from local storage :', userData);
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(userData);
          
          // Load stored profile data if exists
          if (storedProfileData && storedProfileData !== 'undefined') {
            setProfileData(JSON.parse(storedProfileData));
          }
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

  // Set auth data after successful login
  const setAuthData = async (userData, userAccessToken, userRefreshToken = null) => {
    if (!userAccessToken) {
      console.error('Invalid accessToken');
      return false;
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
      return true;
    } catch (error) {
      console.error('Error storing auth data:', error);
      return false;
    }
  };

  // Update profile data
  const updateProfileData = async (data) => {
    try {
      setProfileData(data);
      await AsyncStorage.setItem('profileData', JSON.stringify(data));
      console.log('Profile data stored successfully');
      return true;
    } catch (error) {
      console.error('Error storing profile data:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setProfileData(null);
      setImportedPart(null);

      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('profileData');

      console.log('Logout successful');
      return true;
    } catch (error) {
      console.error('Error removing auth data:', error);
      return false;
    }
  };

  const updateUser = async (updatedUserData) => {
    if (!updatedUserData) return false;
    try {
      setUser(updatedUserData);
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
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
    profileData,
    accessToken,
    refreshToken,
    isLoading,
    importedPart,
    updateImportedPart,
    setAuthData,
    updateProfileData,
    logout,
    updateUser,
    refreshUserFromToken,
    IsOnline,
    setIsOnline,
    isAuthenticated: !!accessToken,
    imagUrl,
    setImageUrl
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;