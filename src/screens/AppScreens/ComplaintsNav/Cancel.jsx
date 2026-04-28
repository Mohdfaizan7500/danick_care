import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import Complaintscard from '../../../components/Complaintscard';
import { getComplaints } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const Cancel = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { user } = useAuth();
  const technicianId = user?.id ;

  const fetchComplaints = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getComplaints(technicianId, 'cancel', pageNum);

      console.log('API Response for Cancelled complaints:', response);

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
      console.error('Error fetching cancelled complaints:', error);
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

  useEffect(() => {
    fetchComplaints(1, true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Cancel screen focused - refreshing data');
      fetchComplaints(1, true);
      return () => {
        console.log('Cancel screen unfocused');
      };
    }, [])
  );

  const mapApiStatusToDisplay = (status) => {
    const statusMap = {
      'assign': 'Assigned',
      'onworking': 'On Progress',
      'complete': 'Complete',
      'cancel': 'Cancel',
    };
    return statusMap[status] || status;
  };

  const transformComplaintData = (complaint) => ({
    id: complaint.id,
    csn: complaint.csn,
    status: mapApiStatusToDisplay(complaint.status),
    service: complaint.service,
    service_name: complaint.service_name,
    customer_name: complaint.customer_name,
    service_address: complaint.service_address,
    customer_mobile: complaint.customer_mobile,
    tot_amt: complaint.tot_amt,
    slot_date: complaint.slot_date,
    isRecomplaint: complaint.recomplaint === 'Yes',
    days: complaint.days,
  });

  const transformedComplaints = complaints.map(transformComplaintData);

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={transformedComplaints}
        renderItem={({ item }) => <Complaintscard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            {!loading && (
              <Text className="text-text-tertiary text-base">
                No cancelled complaints found
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

export default Cancel

const styles = StyleSheet.create({})