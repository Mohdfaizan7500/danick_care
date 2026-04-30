// context/BucketContext.js
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { getPartCount } from '../lib/api';
import { useAuth } from './AuthContext';

const BucketContext = createContext();

export const useBucket = () => {
  const context = useContext(BucketContext);
  if (!context) {
    throw new Error('useBucket must be used within BucketProvider');
  }
  return context;
};

export const BucketProvider = ({ children }) => {
  const { user } = useAuth();
  const [bucketCounts, setBucketCounts] = useState({
    all: 0,
    admin: 0,
    technician: 0,
    market: 0,
    transfered: 0,
    received: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFetchingRef = useRef(false);

  const fetchBucketCounts = useCallback(async (silent = false) => {
    if (!user?.id) return;
    
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current) {
      console.log('Bucket counts fetch already in progress, skipping...');
      return;
    }

    try {
      isFetchingRef.current = true;
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      const payload = {
        technician_id: user?.id?.toString()
      };
      
      console.log('Fetching bucket counts with payload:', payload);
      const response = await getPartCount(payload);
      console.log('Bucket counts response:', response);

      if (response?.data?.success) {
        setBucketCounts({
          all: response.data.all || 0,
          admin: response.data.admin || 0,
          technician: response.data.technician || 0,
          market: response.data.market || 0,
          transfered: response.data.transfered || 0,
          received: response.data.received || 0,
        });
      } else {
        if (!silent) {
          setError(response?.data?.message || 'Failed to fetch bucket counts');
        }
      }
    } catch (err) {
      console.error('Error fetching bucket counts:', err);
      if (!silent) {
        setError(err.message || 'Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [user?.id]);

  const refreshCounts = useCallback(async () => {
    await fetchBucketCounts(false);
  }, [fetchBucketCounts]);

  const value = {
    bucketCounts,
    loading,
    error,
    refreshCounts,
    fetchBucketCounts,
  };

  return (
    <BucketContext.Provider value={value}>
      {children}
    </BucketContext.Provider>
  );
};