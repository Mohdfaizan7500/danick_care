import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Complaintscard from '../../../components/Complaintscard';
import { getComplaints } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const Assigned = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigation = useNavigation();
  const { user } = useAuth();
  const technicianId = user?.id;

  // Fetch complaints from API with status 'assign'
  const fetchComplaints = async (pageNum = 1, isRefresh = false) => {
    try {
      if (!technicianId) {
        console.log('No technician ID available');
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getComplaints(technicianId, 'assign', pageNum);

      console.log('API Response for Assigned complaints:', response);

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

        setHasMore(newComplaints.length === limit);
      } else {
        console.log('No data or invalid response structure');
        if (isRefresh) {
          setComplaints([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching assigned complaints:', error);
      if (isRefresh) {
        setComplaints([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && technicianId) {
      fetchComplaints(page + 1);
    }
  };

  const handleComplaintPress = (complaint) => {
    console.log('Navigating to complaint detail from Assigned:', complaint);
    navigation.navigate('ComplaintDetail', { complaint });
  };

  useEffect(() => {
    if (technicianId) {
      fetchComplaints(1, true);
    }
  }, [technicianId]);

  useFocusEffect(
    useCallback(() => {
      if (technicianId) {
        console.log('Assigned screen focused - refreshing data');
        fetchComplaints(1, true);
      }
      return () => {
        console.log('Assigned screen unfocused');
      };
    }, [technicianId])
  );

  const renderComplaintCard = ({ item }) => {
    if (!item || !item.id) {
      console.log('Invalid item in renderComplaintCard:', item);
      return null;
    }
    return <Complaintscard item={item} onPress={handleComplaintPress} />;
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#059669" />
      </View>
    );
  };



 
  // Safe key extractor
  const getKey = (item, index) => {
    if (item && item.id) {
      return String(item.id);
    }
    return `fallback-${index}-${Date.now()}`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={complaints}
        renderItem={renderComplaintCard}
        keyExtractor={getKey}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            {!loading && (
              <Text className="text-text-tertiary text-base">
                No assigned complaints found
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

export default Assigned

const styles = StyleSheet.create({})