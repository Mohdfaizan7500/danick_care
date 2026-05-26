import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import Complaintscard from '../../../components/Complaintscard';
import { getComplaints } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import DialogBox from '../../../components/Dialog';

const AllComplaints = () => {
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
  const technicianId = user?.id || 1;

  const fetchComplaints = async (pageNum = 1, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const response = await getComplaints(technicianId, '', pageNum);
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
      console.error('Error fetching complaints:', error);
      if (isRefresh) setComplaints([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) fetchComplaints(page + 1);
  };

  const handleComplaintPress = (complaint) => {
    const csn = complaint?.csn?.toString() || '';
    if (/^0+$/.test(csn)) {
      setDialogMessage('CSN is incorrect. Please contact Admin.');
      setDialogVisible(true);
      return;
    }

    if (complaint?.status === 'cancel') {
      console.log('Complaint is cancelled - no navigation');
      return;
    }
    if (complaint?.status === 'success' || complaint?.status === 'complete') {
      navigation.navigate('QRCodeDetails', { complaint, status: "complaint" });
    } else {
      navigation.navigate('ComplaintDetail', { complaint, status: "complaint" });
    }
  };

  useEffect(() => {
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

  const renderFooter = () => {
    if (!loading) return null;
    return <View className="py-4"><ActivityIndicator size="small" color="#059669" /></View>;
  };

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
            {!loading && <Text className="text-text-tertiary text-base">No complaints found</Text>}
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

export default AllComplaints