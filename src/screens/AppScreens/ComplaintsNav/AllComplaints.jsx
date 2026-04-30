import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Complaintscard from '../../../components/Complaintscard';
import { getComplaints } from '../../../lib/api'; // Adjust path as needed
import { useAuth } from '../../../context/AuthContext'; // Adjust path as needed

const AllComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const navigation = useNavigation();
  const { user } = useAuth(); // Get user data from auth context
  const technicianId = user?.id || 1; // Use actual technician ID
  

  // Fetch complaints from API
  const fetchComplaints = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getComplaints(technicianId, '', pageNum);
      
      console.log('API Response oon all complaint tab:', response);
      
      if (response?.data?.success && response?.data?.result) {
        const newComplaints = response.data.result;
        const currentPage = parseInt(response.data.page) || pageNum;
        const limit = response.data.limit || 10;
        
        
        if (isRefresh) {
          setComplaints(newComplaints);
          setPage(1);
        } else {
          setComplaints(prev => [...prev, ...newComplaints]);
          setPage(currentPage);
        }
        
        // Check if there are more items to load
        setHasMore(newComplaints.length === limit);
      } else {
        console.log('No data or invalid response structure');
        if (isRefresh) {
          setComplaints([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      if (isRefresh) {
        setComplaints([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load more data when scrolling to bottom
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchComplaints(page + 1);
    }
  };

  // Handle card press - conditional navigation based on status
  const handleComplaintPress = (complaint) => {
    console.log('Complaint pressed:', complaint);
    console.log('Complaint status:', complaint?.status);
    
    // Check if status is 'cancel' - do nothing (no navigation)
    if (complaint?.status === 'cancel') {
      console.log('Complaint is cancelled - no navigation');
      return;
    }
    
    // Check if complaint status is 'success' or 'complete'
    if (complaint?.status === 'success' || complaint?.status === 'complete') {
      console.log('Navigating to QRCodeDetails for completed complaint');
      navigation.navigate('QRCodeDetails', { 
        complaint, 
        status: "complaint" 
      });
    } else {
      console.log('Navigating to ComplaintDetail');
      navigation.navigate('ComplaintDetail', { 
        complaint, 
        status: "complaint" 
      });
    }
  };

  // Initial load when component mounts
  useEffect(() => {
    fetchComplaints(1, true);
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused - refreshing data');
      fetchComplaints(1, true);
      return () => {
        console.log('Screen unfocused');
      };
    }, [])
  );

  const renderComplaintCard = ({ item }) => (
    <Complaintscard item={item} onPress={handleComplaintPress} />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#059669" />
      </View>
    );
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'assign':
        return 'bg-primary-sage100';
      case 'onworking':
        return 'bg-ui-warning/20';
      case 'complete':
      case 'success':
        return 'bg-ui-success/20';
      case 'cancel':
        return 'bg-ui-error/20';
      case 'pending':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case 'assign':
        return 'text-primary-sage700';
      case 'onworking':
        return 'text-ui-warning';
      case 'complete':
      case 'success':
        return 'text-ui-success';
      case 'cancel':
        return 'text-ui-error';
      case 'pending':
        return 'text-text-tertiary';
      default:
        return 'text-text-tertiary';
    }
  };

 

 

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={complaints}
        renderItem={renderComplaintCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            {!loading && (
              <Text className="text-text-tertiary text-base">
                No complaints found
              </Text>
            )}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={() => fetchComplaints(1, true)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
      />
    </View>
  )
}

export default AllComplaints

const styles = StyleSheet.create({})