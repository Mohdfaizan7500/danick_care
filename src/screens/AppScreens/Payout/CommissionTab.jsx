import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  FlatList,
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import { CommissionPayout } from '../../../lib/api';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { ComplaintsIcon, UserIcon } from '../../../assets/svgIcons/SVGIcons';
import { BrickWallIcon } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const SkeletonCommissionCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ opacity }} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View className="w-32 h-5 bg-gray-200 rounded" />
        <View className="w-16 h-6 bg-gray-200 rounded-full" />
      </View>
      <View className="flex-row justify-between mt-2">
        {[1, 2, 3, 4].map((_, i) => (
          <View key={i} className="items-center">
            <View className="w-10 h-3 bg-gray-200 rounded mb-1" />
            <View className="w-12 h-4 bg-gray-200 rounded" />
          </View>
        ))}
      </View>
    </Animated.View>
  );
};

const CommissionTab = ({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showStartCalendar,
  setShowStartCalendar,
  showEndCalendar,
  setShowEndCalendar,
  handleStartDateSelect,
  handleEndDateSelect,
  formatCurrency,
}) => {
  const { profileData } = useAuth();
  const navigation = useNavigation();

  // State for dynamic data
  const [commissionData, setCommissionData] = useState([]);
  const [isCommissionLoading, setIsCommissionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [commissionSummary, setCommissionSummary] = useState({
    total_fund: 0,
    total_tech: 0,
    total_admin_fund: 0,
    debit_admin: 0
  });

  const fetchCommissionPayout = async (isRefresh = false, showToast = false) => {
    try {
      if (!isRefresh) {
        setIsCommissionLoading(true);
      }

      const payload = {
        technician_id: profileData?.id || profileData?.technician_id,
      };

      console.log('Fetching Commission Payout with payload:', payload);
      const response = await CommissionPayout(payload);
      console.log('Commission Payout Response:', response);

      if (response?.data?.success) {
        // Set commission data from API response
        const apiData = response.data.data || [];

        // Add a unique key to each item to handle duplicate IDs
        const dataWithUniqueKeys = apiData.map((item, index) => ({
          ...item,
          uniqueKey: `${item.id}_${item.date}_${index}` // Create unique key using id + date + index
        }));

        setCommissionData(dataWithUniqueKeys);

        // Set summary from API response
        if (response.data.totals) {
          setCommissionSummary({
            total_fund: response.data.totals.total_fund || 0,
            total_tech: response.data.totals.total_tech || 0,
            total_admin_fund: response.data.totals.total_admin_fund || 0,
            debit_admin: response.data.totals.debit_admin || 0
          });
        }

        if (isRefresh && showToast) {
          toast.custom(
            <StatusMessage
              type='success'
              title="Commission data refreshed"
              message={`Found ${apiData.length} commission records`}
            />,
            { duration: 500, dismissible: true }
          );
        } else if (isRefresh) {
          console.log('Commission data refreshed successfully');
        }
      } else {
        if (isRefresh && showToast) {
          toast.custom(
            <StatusMessage
              type='error'
              title="Refresh failed"
              message={response?.data?.message || 'Failed to refresh commission data'}
            />,
            { duration: 2000 }
          );
        }
        console.error('API returned success: false', response?.data);
      }
    } catch (error) {
      console.error('Error fetching payout data:', error);
      if (isRefresh && showToast) {
        toast.custom(
          <StatusMessage
            type='error'
            title="Network Error"
            message={error.message || 'Failed to fetch commission data'}
          />,
          { duration: 2000 }
        );
      }
    } finally {
      setIsCommissionLoading(false);
      setRefreshing(false);
    }
  };

  // Handle commission submit (filter by date range)
  const handleCommissionSubmit = async () => {
    setIsCommissionLoading(true);
    try {
      const payload = {
        technician_id: profileData?.id || profileData?.technician_id,
        start_date: startDate,
        end_date: endDate,
      };

      console.log('Filtering Commission with payload:', payload);
      const response = await CommissionPayout(payload);
      console.log('Filtered Commission Response:', response);

      if (response?.data?.success) {
        const apiData = response.data.data || [];

        // Add a unique key to each item
        const dataWithUniqueKeys = apiData.map((item, index) => ({
          ...item,
          uniqueKey: `${item.id}_${item.date}_${index}`
        }));

        setCommissionData(dataWithUniqueKeys);

        if (response.data.totals) {
          setCommissionSummary({
            total_fund: response.data.totals.total_fund || 0,
            total_tech: response.data.totals.total_tech || 0,
            total_admin_fund: response.data.totals.total_admin_fund || 0,
            debit_admin: response.data.totals.debit_admin || 0
          });
        }

        toast.custom(
          <StatusMessage
            type='success'
            title="Filter applied"
            message={`Showing ${apiData.length} commission records from ${startDate} to ${endDate}`}
          />,
          { duration: 2000 }
        );
      } else {
        toast.custom(
          <StatusMessage
            type='error'
            title="Filter failed"
            message={response?.data?.message || 'Failed to filter commission data'}
          />,
          { duration: 2000, dismissible: true }
        );
      }
    } catch (error) {
      console.error('Error filtering commission data:', error);
      toast.custom(
        <StatusMessage
          type='error'
          title="Error"
          message={error.message || 'Failed to apply filter'}
        />,
        { duration: 2000 }
      );
    } finally {
      setIsCommissionLoading(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCommissionPayout(true, true); // Pass true to show toast
  };

  useEffect(() => {
    fetchCommissionPayout(false, false);
  }, []);

  const renderCommissionItem = ({ item }) => {
    // Calculate amounts based on available data
    const totalAmount = parseFloat(item.fund) || 0;
    const techAmount = parseFloat(item.tech_fund) || 0;
    const adminAmount = parseFloat(item.admin_fund) || 0;

    // Determine status based on collection status
    const isCollected = item.status?.toLowerCase() === 'collect';
    const status = isCollected ? 'credit' : 'debit';

    // Format date
    const formattedDate = item.date ? new Date(item.date).toLocaleDateString() : 'N/A';

    return (
      <TouchableOpacity
        // Disable if no ID (skeleton or invalid data)
        className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm" onPress={() => handleCardPress(item)}>
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center flex-1">
            <Icon name="business-outline" size={20} color="#3b82f6" />

            <Text className="ml-2 text-gray-800 font-semibold" numberOfLines={1}>
              {item?.csn} - {item?.name || 'Admin'}
            </Text>
          </View>
          <View className={`px-3 py-1 rounded-full ${status === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
            <Text className={`text-xs font-bold ${status === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
              {item.status?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-between mt-2">
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Type</Text>
            <Text className="text-gray-800 font-bold text-xs">{item.type || 'Admin'}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Total</Text>
            <Text className="text-gray-800 font-bold">{formatCurrency(totalAmount)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Tech</Text>
            <Text className="text-gray-800 font-bold">{formatCurrency(techAmount)}</Text>
          </View>
          <View className="items-center">
            <Text className="text-gray-500 text-xs">Admin</Text>
            <Text className="text-gray-800 font-bold">{formatCurrency(adminAmount)}</Text>
          </View>
          <View className="items-center">
            <Icon name="calendar-outline" size={16} color="#6b7280" />
            <Text className="text-gray-600 text-xs">{formattedDate}</Text>
          </View>
        </View>

        {/* Mobile number if available */}
        {item.mobile && (
          <View className="flex-row items-center mt-2 pt-2 border-t border-gray-100">
            <Icon name="call-outline" size={14} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1">Mobile: {item.mobile}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Teal color constant
  const teal = '#3FD298';

  const handleCardPress = async (complaint) => {
    if (complaint.comp_id === null ||
      complaint.comp_id === undefined ||
      complaint.comp_id === '') {
      toast.custom(
        <StatusMessage
          type='info'
          title="Invalid Record"
          message="This commission record does not have valid details to show."
        />,
        { duration: 2000 }
      );
      return;
    }
    // Navigate to Commission Details screen with item data
    navigation.navigate('QRCodeDetails', { complaint });
  }

  return (
    <View className="flex-1 bg-gray-50">
     

      {/* Summary Cards with dynamic data */}
      <View className="flex-row flex-wrap justify-between px-4 py-3">
        <View className="bg-green-50 rounded-xl p-2 w-[18%] items-center border border-green-200">
          <Icon name="stats-chart-outline" size={20} color="#10b981" />
          <Text className="text-gray-600 text-xs">Total</Text>
          <Text className="text-green-700 font-bold text-xs">
            {formatCurrency(commissionSummary.total_fund)}
          </Text>
        </View>
        <View className="bg-blue-50 rounded-xl p-2 w-[18%] items-center border border-blue-200">
          <Icon name="construct-outline" size={20} color="#3b82f6" />
          <Text className="text-gray-600 text-xs">Tech</Text>
          <Text className="text-blue-700 font-bold text-xs">
            {formatCurrency(commissionSummary.total_tech)}
          </Text>
        </View>
        <View className="bg-purple-50 rounded-xl p-2 w-[18%] items-center border border-purple-200">
          <Icon name="person-outline" size={20} color="#8b5cf6" />
          <Text className="text-gray-600 text-xs">Admin</Text>
          <Text className="text-purple-700 font-bold text-xs">
            {formatCurrency(commissionSummary.total_admin_fund)}
          </Text>
        </View>
        <View className="bg-yellow-50 rounded-xl p-2 w-[18%] items-center border border-yellow-200">
          <Icon name="checkmark-done-outline" size={20} color="#eab308" />
          <Text className="text-gray-600 text-xs">Paid</Text>
          <Text className="text-yellow-700 font-bold text-xs">
            {formatCurrency(commissionSummary.debit_admin)}
          </Text>
        </View>


        <View className="bg-orange-50 rounded-xl p-2 w-[18%] items-center border border-orange-200">
          <Icon name="hourglass-outline" size={20} color="#f97316" />
          <Text className="text-gray-600 text-xs">Balance</Text>
          <Text className="text-orange-700 font-bold text-xs">
            {formatCurrency(commissionSummary.total_admin_fund - commissionSummary.debit_admin)}
          </Text>
        </View>
      </View>

      {/* Date Pickers + Submit Button */}
      <View className="flex-row justify-between px-4 py-2">
        <TouchableOpacity
          className="flex-1 flex-row items-center bg-gray-100 rounded-full px-3 py-2 mr-1 border border-gray-300"
          onPress={() => setShowStartCalendar(true)}
        >
          <Icon name="calendar-outline" size={16} color="#4b5563" />
          <Text className="text-gray-700 ml-1 text-xs" numberOfLines={1}>
            {startDate}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 flex-row items-center bg-gray-100 rounded-full px-3 py-2 mx-1 border border-gray-300"
          onPress={() => setShowEndCalendar(true)}
        >
          <Icon name="calendar-outline" size={16} color="#4b5563" />
          <Text className="text-gray-700 ml-1 text-xs" numberOfLines={1}>
            {endDate}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex flex-row items-center bg-primary-sage500 rounded-full px-3 py-2 ml-1 justify-center"
          onPress={handleCommissionSubmit}
        >
          <Icon name="search" size={16} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Start Date Calendar Modal */}
      <Modal visible={showStartCalendar} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white mx-4 rounded-2xl p-5 shadow-xl">
            <Text className="text-lg font-bold mb-3 text-gray-800">Select Start Date</Text>
            <Calendar
              onDayPress={handleStartDateSelect}
              markedDates={{
                [startDate]: { selected: true, selectedColor: teal },
              }}
              theme={{
                selectedDayBackgroundColor: teal,
                todayTextColor: teal,
                arrowColor: teal,
                monthTextColor: teal,
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 15,
              }}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
              }}
            />
            <View className="mt-4">
              <Button title="Close" onPress={() => setShowStartCalendar(false)} color={teal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* End Date Calendar Modal */}
      <Modal visible={showEndCalendar} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white mx-4 rounded-2xl p-5 shadow-xl">
            <Text className="text-lg font-bold mb-3 text-gray-800">Select End Date</Text>
            <Calendar
              onDayPress={handleEndDateSelect}
              markedDates={{
                [endDate]: { selected: true, selectedColor: teal },
              }}
              theme={{
                selectedDayBackgroundColor: teal,
                todayTextColor: teal,
                arrowColor: teal,
                monthTextColor: teal,
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 15,
              }}
              style={{
                borderRadius: 12,
                overflow: 'hidden',
              }}
            />
            <View className="mt-4">
              <Button title="Close" onPress={() => setShowEndCalendar(false)} color={teal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* List or Skeletons with Pull to Refresh */}
      {isCommissionLoading && !refreshing ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <SkeletonCommissionCard />}
          keyExtractor={(_, index) => `skeleton_${index}`}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={commissionData}
          renderItem={renderCommissionItem}
          keyExtractor={(item) => item.uniqueKey || `${item.id}_${item.date}_${Math.random()}`}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[teal, '#10b981', '#3b82f6']}
              tintColor={teal}
              title="Pull to refresh commission data"
              titleColor={teal}
              progressBackgroundColor="#ffffff"
            />
          }
          ListEmptyComponent={
            <View className="items-center justify-center py-10">
              <Icon name="document-text-outline" size={60} color="#ccc" />
              <Text className="text-gray-400 text-base mt-3">No commission data found</Text>
              <Text className="text-gray-400 text-sm mt-1">Try changing date range or pull to refresh</Text>
              <TouchableOpacity
                onPress={onRefresh}
                className="mt-4 bg-primary-sage500 px-6 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Refresh Now</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </View>
  );
};

export default CommissionTab;