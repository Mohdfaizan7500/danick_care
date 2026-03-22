import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
  Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const SkeletonSalaryCard = () => {
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
      <View className="flex-row items-center justify-between">
        <View className="w-16 h-5 bg-gray-200 rounded" />
        <View className="w-16 h-5 bg-gray-200 rounded" />
        <View className="w-12 h-5 bg-gray-200 rounded" />
      </View>
      <View className="flex-row items-center justify-between mt-3">
        <View className="w-20 h-6 bg-gray-200 rounded" />
        <View className="w-32 h-5 bg-gray-200 rounded" />
      </View>
    </Animated.View>
  );
};

const SalaryTab = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  showMonthYearModal,
  setShowMonthYearModal,
  isSalaryLoading,
  salarySummary,
  salaryData,
  handleMonthYearConfirm,
  formatCurrency,
}) => {
  // Local state for month/year selection in modal
  const [tempMonth, setTempMonth] = useState(selectedMonth);
  const [tempYear, setTempYear] = useState(selectedYear);

  // When modal opens, reset temp to current selections
  React.useEffect(() => {
    if (showMonthYearModal) {
      setTempMonth(selectedMonth);
      setTempYear(selectedYear);
    }
  }, [showMonthYearModal]);

  const handleYearChange = (direction) => {
    const currentYear = parseInt(tempYear, 10);
    if (direction === 'prev') {
      setTempYear((currentYear - 1).toString());
    } else {
      setTempYear((currentYear + 1).toString());
    }
  };

  const handleMonthSelect = (month) => {
    setTempMonth(month);
  };

  const handleConfirm = () => {
    setSelectedMonth(tempMonth);
    setSelectedYear(tempYear);
    handleMonthYearConfirm(); // call the parent's confirm handler
    setShowMonthYearModal(false);
  };

  const renderSalaryItem = ({ item }) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Icon name="log-in-outline" size={20} color="#3b82f6" />
          <Text className="ml-2 text-gray-700 font-medium">{item.login}</Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="log-out-outline" size={20} color="#ef4444" />
          <Text className="ml-2 text-gray-700 font-medium">{item.logout}</Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="time-outline" size={20} color="#f59e0b" />
          <Text className="ml-2 text-gray-700 font-medium">{item.hours}h</Text>
        </View>
      </View>
      <View className="flex-row items-center justify-between mt-3">
        <View className="flex-row items-center">
          <Icon name="cash-outline" size={20} color="#10b981" />
          <Text className="ml-2 text-gray-800 font-bold">{formatCurrency(item.amount)}</Text>
        </View>
        <View className="flex-row items-center">
          <Icon name="calendar-outline" size={20} color="#6b7280" />
          <Text className="ml-2 text-gray-600 text-sm">{item.datetime}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Summary Cards */}
      <View className="flex-row justify-between px-4 py-3">
        <View className="bg-green-50 rounded-xl p-3 flex-1 mr-2 items-center border border-green-200">
          <Icon name="wallet-outline" size={24} color="#10b981" />
          <Text className="text-gray-600 text-xs mt-1">Total</Text>
          <Text className="text-green-700 font-bold text-lg">{formatCurrency(salarySummary.total)}</Text>
        </View>
        <View className="bg-blue-50 rounded-xl p-3 flex-1 mx-2 items-center border border-blue-200">
          <Icon name="checkmark-done-outline" size={24} color="#3b82f6" />
          <Text className="text-gray-600 text-xs mt-1">Paid</Text>
          <Text className="text-blue-700 font-bold text-lg">{formatCurrency(salarySummary.paid)}</Text>
        </View>
        <View className="bg-orange-50 rounded-xl p-3 flex-1 ml-2 items-center border border-orange-200">
          <Icon name="hourglass-outline" size={24} color="#f97316" />
          <Text className="text-gray-600 text-xs mt-1">Balance</Text>
          <Text className="text-orange-700 font-bold text-lg">{formatCurrency(salarySummary.balance)}</Text>
        </View>
      </View>

      {/* Month/Year Filter Button */}
      <View className="flex-row justify-end px-4 py-2">
        <TouchableOpacity
          className="flex-row items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-300"
          onPress={() => setShowMonthYearModal(true)}
        >
          <Icon name="calendar-outline" size={18} color="#4b5563" />
          <Text className="text-gray-700 ml-2 font-medium">
            {selectedMonth} {selectedYear}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Month/Year Picker Modal */}
      <Modal visible={showMonthYearModal} transparent animationType="slide">
        <View className="flex-1 justify-center bg-black/50">
          <View className="bg-white mx-6 rounded-xl p-5">
            <Text className="text-lg font-bold text-gray-800 mb-3">Select Month & Year</Text>
            
            {/* Year selector with arrows */}
            <View className="flex-row items-center justify-between mb-4">
              <TouchableOpacity
                onPress={() => handleYearChange('prev')}
                className="p-2 bg-gray-100 rounded-full"
              >
                <Icon name="chevron-back" size={24} color="#4b5563" />
              </TouchableOpacity>
              <Text className="text-xl font-semibold text-gray-800">{tempYear}</Text>
              <TouchableOpacity
                onPress={() => handleYearChange('next')}
                className="p-2 bg-gray-100 rounded-full"
              >
                <Icon name="chevron-forward" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {/* Month grid */}
            <View className="flex-row flex-wrap justify-between">
              {months.map((month) => (
                <TouchableOpacity
                  key={month}
                  className={`w-[30%] py-3 mb-3 rounded-lg ${
                    tempMonth === month ? 'bg-primary-sage500' : 'bg-gray-100'
                  }`}
                  onPress={() => handleMonthSelect(month)}
                >
                  <Text
                    className={`text-center font-medium ${
                      tempMonth === month ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {month.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action buttons */}
            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-gray-200 mr-2"
                onPress={() => setShowMonthYearModal(false)}
              >
                <Text className="text-gray-700 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 rounded-lg bg-primary-sage500"
                onPress={handleConfirm}
              >
                <Text className="text-white font-medium">Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* List or Skeletons */}
      {isSalaryLoading ? (
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={() => <SkeletonSalaryCard />}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={salaryData}
          renderItem={renderSalaryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default SalaryTab;