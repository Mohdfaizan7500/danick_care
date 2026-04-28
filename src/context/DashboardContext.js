// contexts/DashboardContext.js
import React, { createContext, useContext, useRef, useCallback } from 'react';

const DashboardContext = createContext();

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const refreshCountsRef = useRef(null);

  const registerRefreshFunction = useCallback((refreshFn) => {
    refreshCountsRef.current = refreshFn;
  }, []);

  const triggerRefresh = useCallback(async () => {
    if (refreshCountsRef.current) {
      await refreshCountsRef.current();
    }
  }, []);

  return (
    <DashboardContext.Provider value={{ registerRefreshFunction, triggerRefresh, refreshCountsRef }}>
      {children}
    </DashboardContext.Provider>
  );
};