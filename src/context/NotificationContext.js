// context/NotificationContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { FetchNotification } from '../lib/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [allNotifications, setAllNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notificationCounts, setNotificationCounts] = useState({
    all: 0,
    unread: 0,
    read: 0,
  });

  // Helper function to format date/time
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Unknown';
    
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  // Map status to display type
  const mapStatusToType = (status) => {
    const statusMap = {
      '0': 'pending',
      '1': 'completed',
      '2': 'cancelled',
      'pending': 'pending',
      'completed': 'completed',
      'cancelled': 'cancelled',
    };
    return statusMap[status] || 'pending';
  };

  // Get title from message
  const getTitleFromMessage = (message) => {
    if (!message) return 'Notification';
    
    if (message.includes('assigned')) return 'New Complaint Assigned';
    if (message.includes('completed')) return 'Complaint Completed';
    if (message.includes('payment')) return 'Payment Update';
    if (message.includes('cancelled')) return 'Complaint Cancelled';
    if (message.includes('approved')) return 'Part Request Approved';
    if (message.includes('rejected')) return 'Part Request Rejected';
    if (message.includes('reopened')) return 'Complaint Reopened';
    if (message.includes('AMC')) return 'AMC Complaint';
    
    return 'Notification';
  };

  // Get icon name based on notification type
  const getIconName = (message, status) => {
    if (status === 'completed') return 'check-circle';
    if (status === 'cancelled') return 'cancel';
    if (message.includes('payment')) return 'payment';
    if (message.includes('assigned')) return 'assignment';
    if (message.includes('approved')) return 'shopping-cart';
    if (message.includes('rejected')) return 'error';
    if (message.includes('reopened')) return 'refresh';
    if (message.includes('AMC')) return 'verified-user';
    return 'notifications';
  };

  // Get icon color based on notification type
  const getIconColor = (message, status) => {
    if (status === 'completed') return '#10B981';
    if (status === 'cancelled') return '#EF4444';
    if (message.includes('payment')) return '#8B5CF6';
    if (message.includes('assigned')) return '#3B82F6';
    if (message.includes('approved')) return '#F59E0B';
    if (message.includes('rejected')) return '#EF4444';
    if (message.includes('reopened')) return '#F59E0B';
    if (message.includes('AMC')) return '#8B5CF6';
    return '#6B7280';
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const payload = {
        technician_id: user?.id || "1"
      };
      const response = await FetchNotification(payload);
      console.log("Fetch Notification response:", response);

      if (response?.data?.success && response?.data?.data) {
        const transformedData = response.data.data.map(item => ({
          id: item.id.toString(),
          type: mapStatusToType(item.status),
          title: getTitleFromMessage(item.message),
          message: item.message,
          time: formatDateTime(item.date_time),
          status: mapStatusToType(item.status),
          isRead: item.read_status === "Read",
          complaint_id: item.complaint_id,
          csn: item.csn,
          rawData: item
        }));

        setAllNotifications(transformedData);
        
        // Update counts
        const unreadCount = transformedData.filter(n => !n.isRead).length;
        const readCount = transformedData.filter(n => n.isRead).length;
        
        setNotificationCounts({
          all: transformedData.length,
          unread: unreadCount,
          read: readCount,
        });
      } else {
        setAllNotifications([]);
        setNotificationCounts({ all: 0, unread: 0, read: 0 });
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setAllNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  // Refresh notifications (for pull-to-refresh)
  const refreshNotifications = useCallback(async () => {
    setRefreshing(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  // Mark a single notification as read
  const markAsRead = useCallback(async (notificationId) => {
    setAllNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
    
    // Update counts after marking as read
    setAllNotifications(prev => {
      const unreadCount = prev.filter(n => !n.isRead).length;
      const readCount = prev.filter(n => n.isRead).length;
      setNotificationCounts({
        all: prev.length,
        unread: unreadCount,
        read: readCount,
      });
      return prev;
    });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setAllNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    
    setNotificationCounts(prev => ({
      ...prev,
      unread: 0,
      read: prev.all,
    }));
  }, []);

  // Get filtered notifications
  const getUnreadNotifications = useCallback(() => {
    return allNotifications.filter(n => !n.isRead);
  }, [allNotifications]);

  const getReadNotifications = useCallback(() => {
    return allNotifications.filter(n => n.isRead);
  }, [allNotifications]);

  // Initial fetch on mount
  React.useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        allNotifications,
        unreadNotifications: getUnreadNotifications(),
        readNotifications: getReadNotifications(),
        notificationCounts,
        loading,
        refreshing,
        fetchNotifications,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};