import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useCallback, useRef } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Complaintscard from '../../../components/Complaintscard';
// import { getComplaints } from '../../../lib/api'; // Adjust path as needed
import { useAuth } from '../../../context/AuthContext'; // Adjust path as needed
import dummyData from '../../../lib/dummyData';

const Complete = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  const navigation = useNavigation();
  const { user } = useAuth(); // Get user data from auth context
  const technicianId = user?.id; // Use actual technician ID

  const fetchIdRef = useRef(0);

  // Fetch complaints from API with status 'complete'
  const fetchComplaints = async (pageNum = 1, isRefresh = false) => {
    const fetchId = ++fetchIdRef.current;
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // const response = await getComplaints(technicianId, 'success', pageNum);
      await new Promise(resolve => setTimeout(resolve, 500));
      if (fetchId !== fetchIdRef.current) return;
      const response = dummyData.complaintsList;
      
      
      if (response?.data?.success && response?.data?.result) {
        const newComplaints = response.data.result;
        if (fetchId !== fetchIdRef.current) return;
        const currentPage = parseInt(response.data.page) || pageNum;
        const limit = response.data.limit || 10;
        
        
        if (isRefresh) {
          setComplaints(newComplaints);
          setPage(1);
        } else {
          setComplaints(prev => {
            const existingIds = new Set(prev.map(item => item?.id));
            const unique = newComplaints.filter(item => !existingIds.has(item.id));
            return [...prev, ...unique];
          });
          setPage(currentPage);
        }
        
        // Check if there are more items to load
        setHasMore(newComplaints.length === limit);
      } else {
        if (fetchId !== fetchIdRef.current) return;
        if (isRefresh) {
          setComplaints([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      if (fetchId !== fetchIdRef.current) return;
      if (isRefresh) {
        setComplaints([]);
      }
    } finally {
      if (fetchId !== fetchIdRef.current) return;
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
    
    // Check if complaint status is 'success'
    if (complaint?.status === 'success') {
      navigation.navigate('QRCodeDetails', { 
        complaint, 
        status: "complaint" 
      });
    } else {
      navigation.navigate('ComplaintDetail', { 
        complaint, 
        status: "complaint" 
      });
    }
  };

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchComplaints(1, true);
      return () => {
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

 

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={complaints}
        renderItem={renderComplaintCard}
        keyExtractor={(item, index) => `${item.id}_${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            {!loading && (
              <Text className="text-text-tertiary text-base">
                No completed complaints found
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

export default Complete

const styles = StyleSheet.create({})
