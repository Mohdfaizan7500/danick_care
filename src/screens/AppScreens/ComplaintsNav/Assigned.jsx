import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Complaintscard from '../../../components/Complaintscard';
import { getComplaints } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import DialogBox from '../../../components/Dialog';


const Assigned = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const navigation = useNavigation();
  const { user } = useAuth();
  const technicianId = user?.id;

  const fetchComplaints = async (pageNum = 1, isRefresh = false) => {
    // ... unchanged
    try {
      if (!technicianId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await getComplaints(technicianId, 'assign', pageNum);
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
        if (isRefresh) setComplaints([]);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching assigned complaints:', error);
      if (isRefresh) setComplaints([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && technicianId) fetchComplaints(page + 1);
  };

  const handleComplaintPress = (complaint) => {
    const csn = complaint?.csn?.toString() || '';
    if (/^0+$/.test(csn)) {
      setDialogMessage('CSN is incorrect. Please contact Admin.');
      setDialogVisible(true);
      return;
    }
    console.log('Navigating to complaint detail from Assigned:', complaint);
    navigation.navigate('ComplaintDetail', { complaint });
  };

  useEffect(() => {
    if (technicianId) fetchComplaints(1, true);
  }, [technicianId]);

  useFocusEffect(
    useCallback(() => {
      if (technicianId) fetchComplaints(1, true);
    }, [technicianId])
  );

  const renderComplaintCard = ({ item }) => {
    if (!item || !item.id) return null;
    return <Complaintscard item={item} onPress={handleComplaintPress} />;
  };

  const renderFooter = () => {
    if (!loading) return null;
    return <View className="py-4"><ActivityIndicator size="small" color="#059669" /></View>;
  };

  const getKey = (item, index) => item?.id ? String(item.id) : `fallback-${index}`;

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={complaints}
        renderItem={renderComplaintCard}
        keyExtractor={getKey}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            {!loading && <Text className="text-text-tertiary text-base">No assigned complaints found</Text>}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={() => fetchComplaints(1, true)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
      />

      <DialogBox
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        title="Invalid CSN"
        size="sm"
        closeOnBackdropPress={true}
      >
        <View className="py-2">
          <Text className="text-gray-700 text-base">{dialogMessage}</Text>
        </View>
      </DialogBox>
    </View>
  )
}

export default Assigned