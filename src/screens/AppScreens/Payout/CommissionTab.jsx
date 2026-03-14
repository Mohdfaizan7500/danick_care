import React, { useRef,useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Button,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Ionicons';

const SkeletonCommissionCard = () => {
  const opacity = useRef(new Animated.Value(0.3)).current;
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

  return (
    <Animated.View style={{ opacity }} className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View className="w-32 h-5 bg-gray-200 rounded" />
        <View className="w-16 h-6 bg-gray-200 rounded-full" />
      </View>
      <View className="flex-row justify-between mt-2">
        <View className="items-center">
          <View className="w-10 h-3 bg-gray-200 rounded mb-1" />
          <View className="w-12 h-4 bg-gray-200 rounded" />
        </View>
        <View className="items-center">
          <View className="w-10 h-3 bg-gray-200 rounded mb-1" />
          <View className="w-12 h-4 bg-gray-200 rounded" />
        </View>
        <View className="items-center">
          <View className="w-10 h-3 bg-gray-200 rounded mb-1" />
          <View className="w-12 h-4 bg-gray-200 rounded" />
        </View>
        <View className="items-center">
          <View className="w-10 h-3 bg-gray-200 rounded mb-1" />
          <View className="w-12 h-4 bg-gray-200 rounded" />
        </View>
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
  isCommissionLoading,
  commissionSummary,
  commissionData,
  handleStartDateSelect,
  handleEndDateSelect,
  handleCommissionSubmit,
  formatCurrency,
}) => {
  const renderCommissionItem = ({ item }) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center flex-1">
          <Icon name="person-outline" size={20} color="#3b82f6" />
          <Text className="ml-2 text-gray-800 font-semibold">{item.csn}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${item.status === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
          <Text className={`text-xs font-bold ${item.status === 'credit' ? 'text-green-700' : 'text-red-700'}`}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between mt-2">
        <View className="items-center">
          <Text className="text-gray-500 text-xs">Total</Text>
          <Text className="text-gray-800 font-bold">{formatCurrency(item.total)}</Text>
        </View>
        <View className="items-center">
          <Text className="text-gray-500 text-xs">Tech</Text>
          <Text className="text-gray-800 font-bold">{formatCurrency(item.tech)}</Text>
        </View>
        <View className="items-center">
          <Text className="text-gray-500 text-xs">Admin</Text>
          <Text className="text-gray-800 font-bold">{formatCurrency(item.admin)}</Text>
        </View>
        <View className="items-center">
          <Icon name="calendar-outline" size={16} color="#6b7280" />
          <Text className="text-gray-600 text-xs">{item.date}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Summary Cards */}
      <View className="flex-row flex-wrap justify-between px-4 py-3">
        <View className="bg-green-50 rounded-xl p-2 w-[18%] items-center border border-green-200">
          <Icon name="stats-chart-outline" size={20} color="#10b981" />
          <Text className="text-gray-600 text-xs">Total</Text>
          <Text className="text-green-700 font-bold text-xs">{formatCurrency(commissionSummary.total)}</Text>
        </View>
        <View className="bg-blue-50 rounded-xl p-2 w-[18%] items-center border border-blue-200">
          <Icon name="construct-outline" size={20} color="#3b82f6" />
          <Text className="text-gray-600 text-xs">Tech</Text>
          <Text className="text-blue-700 font-bold text-xs">{formatCurrency(commissionSummary.tech)}</Text>
        </View>
        <View className="bg-purple-50 rounded-xl p-2 w-[18%] items-center border border-purple-200">
          <Icon name="person-outline" size={20} color="#8b5cf6" />
          <Text className="text-gray-600 text-xs">Admin</Text>
          <Text className="text-purple-700 font-bold text-xs">{formatCurrency(commissionSummary.admin)}</Text>
        </View>
        <View className="bg-yellow-50 rounded-xl p-2 w-[18%] items-center border border-yellow-200">
          <Icon name="checkmark-done-outline" size={20} color="#eab308" />
          <Text className="text-gray-600 text-xs">Paid</Text>
          <Text className="text-yellow-700 font-bold text-xs">{formatCurrency(commissionSummary.paid)}</Text>
        </View>
        <View className="bg-orange-50 rounded-xl p-2 w-[18%] items-center border border-orange-200">
          <Icon name="hourglass-outline" size={20} color="#f97316" />
          <Text className="text-gray-600 text-xs">Balance</Text>
          <Text className="text-orange-700 font-bold text-xs">{formatCurrency(commissionSummary.balance)}</Text>
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
          className="flex-1 flex-row items-center bg-blue-500 rounded-full px-3 py-2 ml-1 justify-center"
          onPress={handleCommissionSubmit}
        >
          <Icon name="checkmark-outline" size={16} color="#ffffff" />
          <Text className="text-white ml-1 text-xs font-semibold">Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Start Date Calendar Modal */}
      <Modal visible={showStartCalendar} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white mx-4 rounded-xl p-4">
            <Text className="text-lg font-bold mb-3">Select Start Date</Text>
            <Calendar
              onDayPress={handleStartDateSelect}
              markedDates={{
                [startDate]: { selected: true, selectedColor: '#3b82f6' },
              }}
              theme={{
                selectedDayBackgroundColor: '#3b82f6',
                todayTextColor: '#3b82f6',
              }}
            />
            <Button title="Close" onPress={() => setShowStartCalendar(false)} />
          </View>
        </View>
      </Modal>

      {/* End Date Calendar Modal */}
      <Modal visible={showEndCalendar} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white mx-4 rounded-xl p-4">
            <Text className="text-lg font-bold mb-3">Select End Date</Text>
            <Calendar
              onDayPress={handleEndDateSelect}
              markedDates={{
                [endDate]: { selected: true, selectedColor: '#3b82f6' },
              }}
              theme={{
                selectedDayBackgroundColor: '#3b82f6',
                todayTextColor: '#3b82f6',
              }}
            />
            <Button title="Close" onPress={() => setShowEndCalendar(false)} />
          </View>
        </View>
      </Modal>

      {/* List or Skeletons */}
      {isCommissionLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <SkeletonCommissionCard />}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={commissionData}
          renderItem={renderCommissionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};


export default CommissionTab;