import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useCallback, useRef } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Complaintscard from '../../../components/Complaintscard';
// import { getComplaints } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import DialogBox from '../../../components/Dialog'; // adjust path if needed
import dummyData from '../../../lib/dummyData';


const OnProgress = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const navigation = useNavigation();
  const { user } = useAuth();
  const technicianId = user?.id;

  const fetchIdRef = useRef(0);

  const fetchComplaints = async (pageNum = 1, isRefresh = false) => {
    const fetchId = ++fetchIdRef.current;
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // const response = await getComplaints(technicianId, 'onworking', pageNum);
      await new Promise(resolve => setTimeout(resolve, 500));
      if (fetchId !== fetchIdRef.current) return;
      const response = dummyData.complaintsList;
      if (response?.data?.success && response?.data?.result) {
        const newComplaints = response.data.result;
        if (fetchId !== fetchIdRef.current) return;
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
          setPage(pageNum);
        }
        setHasMore(newComplaints.length === limit);
      } else {
        if (fetchId !== fetchIdRef.current) return;
        if (isRefresh) setComplaints([]);
        setHasMore(false);
      }
    } catch (error) {
      if (fetchId !== fetchIdRef.current) return;
      if (isRefresh) setComplaints([]);
    } finally {
      if (fetchId !== fetchIdRef.current) return;
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) fetchComplaints(page + 1);
  };

  const handleComplaintPress = (complaint) => {
    const csn = complaint?.csn?.toString() || '';
    // Check if CSN consists only of zeros (e.g., "0", "00", "000", "0000", "00000")
    if (/^0+$/.test(csn)) {
      setDialogMessage('CSN is incorrect. Please contact Admin.');
      setDialogVisible(true);
      return;
    }
    navigation.navigate('ComplaintDetail', { complaint });
  };

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
        keyExtractor={(item, index) => `${item.id}_${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-10">
            {!loading && <Text className="text-text-tertiary text-base">No complaints in progress</Text>}
          </View>
        )}
        refreshing={refreshing}
        onRefresh={() => fetchComplaints(1, true)}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={() => loading && !refreshing && (
          <View className="py-4"><ActivityIndicator size="small" color="#059669" /></View>
        )}
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

export default OnProgress
