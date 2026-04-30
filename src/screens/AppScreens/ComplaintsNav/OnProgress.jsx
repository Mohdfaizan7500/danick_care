import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Complaintscard from '../../../components/Complaintscard';
import { getComplaints } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const OnProgress = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const navigation = useNavigation();
  const { user } = useAuth();
  const technicianId = user?.id;

  const fetchComplaints = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log("fatch call api for onprogress ")

      const response = await getComplaints(technicianId, 'onworking', pageNum);
      console.log("respone on onprogress:",response.data.result)

      if (response?.data?.success && response?.data?.result) {
        const newComplaints = response.data.result;
        const limit = response.data.limit || 10;

        if (isRefresh) {
          setComplaints(newComplaints);
          setPage(1);
        } else {
          setComplaints(prev => [...prev, ...newComplaints]);
          setPage(pageNum);
        }

        setHasMore(newComplaints.length === limit);
      } else {
        if (isRefresh) setComplaints([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching on-progress complaints:', error);
      if (isRefresh) setComplaints([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchComplaints(page + 1);
    }
  };

  const handleComplaintPress = (complaint) => {
    console.log('Navigating to complaint detail from OnProgress:', complaint);
    navigation.navigate('ComplaintDetail', { complaint });
  };

  useEffect(() => {
    console.log("onprogrews screen mount")
    fetchComplaints(1, true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchComplaints(1, true);
    }, [])
  );

  const renderComplaintCard = ({ item }) => (
    <Complaintscard item={item} onPress={handleComplaintPress} />
  );



 
  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={complaints}
        renderItem={renderComplaintCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            {!loading && (
              <Text className="text-text-tertiary text-base">
                No complaints in progress
              </Text>
            )}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={() => fetchComplaints(1, true)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => loading && !refreshing && (
          <View className="py-4">
            <ActivityIndicator size="small" color="#059669" />
          </View>
        )}
      />
    </View>
  )
}

export default OnProgress

const styles = StyleSheet.create({})