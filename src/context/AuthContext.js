import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

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
      
      if (storedAccessToken && storedAccessToken !== 'undefined') {
        // Decode token to get user data
        try {
          const decodedToken = jwtDecode(storedAccessToken);
          
          // Extract user data from token (adjust based on your token structure)
          const userData = {
            id: decodedToken.id || decodedToken.sub,
            username: decodedToken.username || decodedToken.preferred_username,
            email: decodedToken.email,
            // Add other fields as they appear in your token
          };
          
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(userData);
        } catch (decodeError) {
          console.error('Error decoding token:', decodeError);
          // If token decoding fails, try to get stored user data
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
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (userData, userAccessToken, userRefreshToken = null) => {
    // Validate inputs
    if (!userAccessToken || userAccessToken === undefined) {
      console.error('Invalid accessToken: accessToken is undefined');
      return;
    }

    try {
      // Store tokens
      setAccessToken(userAccessToken);
      if (userRefreshToken) setRefreshToken(userRefreshToken);
      
      // If userData is not provided, try to decode from token
      if (!userData && userAccessToken) {
        try {
          const decodedToken = jwtDecode(userAccessToken);
          userData = {
            id: decodedToken.id || decodedToken.sub,
            username: decodedToken.username || decodedToken.preferred_username,
            email: decodedToken.email,
          };
        } catch (decodeError) {
          console.error('Error decoding token during login:', decodeError);
        }
      }
      
      setUser(userData);
      
      // Store in AsyncStorage
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

  // Function to get fresh user data from token
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

  const value = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    login,
    logout,
    updateUser,
    refreshUserFromToken,
    isAuthenticated: !!accessToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;