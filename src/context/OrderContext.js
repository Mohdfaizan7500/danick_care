import React, { createContext, useContext, useState, useEffect } from 'react';
import { PendingComplaintCount } from '../lib/api';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const { IsOnline, user } = useAuth();
  const [orderCount, setOrderCount] = useState(0);

  const fetchOrderCount = async () => {
    if (!IsOnline) return;
    try {
      const payload = {
        city_id: user?.city_id?.toString() || "1",
        technician_id: user?.id?.toString() || "1"
      };
      const response = await PendingComplaintCount(payload);
      const count = response?.data?.success ? response.data.Pendingcomplaints :
                    response?.success ? response.Pendingcomplaints : 0;
      setOrderCount(count);
    } catch (error) {
      console.error('Error fetching order count:', error);
    }
  };

  const refreshOrderCount = (newCount) => {
    if (newCount !== undefined) {
      setOrderCount(newCount);
    } else {
      fetchOrderCount();
    }
  };

  useEffect(() => {
    if (IsOnline) {
      fetchOrderCount();
      const interval = setInterval(fetchOrderCount, 30000);
      return () => clearInterval(interval);
    }
  }, [IsOnline, user]);

  return (
    <OrderContext.Provider value={{ orderCount, refreshOrderCount, fetchOrderCount }}>
      {children}
    </OrderContext.Provider>
  );
};