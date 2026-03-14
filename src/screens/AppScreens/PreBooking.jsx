import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import { toast, Toaster } from 'sonner-native';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/Color';

const PreBooking = () => {
  const [markedDates, setMarkedDates] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const years = Array.from({ length: 11 }, (_, i) => currentDate.getFullYear() - 5 + i);
  const months = [
    { label: 'January', value: 1 },
    { label: 'February', value: 2 },
    { label: 'March', value: 3 },
    { label: 'April', value: 4 },
    { label: 'May', value: 5 },
    { label: 'June', value: 6 },
    { label: 'July', value: 7 },
    { label: 'August', value: 8 },
    { label: 'September', value: 9 },
    { label: 'October', value: 10 },
    { label: 'November', value: 11 },
    { label: 'December', value: 12 },
  ];

  const getCurrentDateString = () => {
    const monthStr = selectedMonth.toString().padStart(2, '0');
    return `${selectedYear}-${monthStr}-01`;
  };

  // Live list of available (selected) dates
  const availableDatesList = Object.keys(markedDates).filter(
    (date) => markedDates[date].selected
  );

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    const currentMark = markedDates[dateString];
    const newStatus = currentMark?.selected ? 'booked' : 'available';

    setMarkedDates((prev) => ({
      ...prev,
      [dateString]: {
        selected: newStatus === 'available',
        selectedColor: newStatus === 'available' ? '#22c55e' : '#ef4444',
        customStyles: {
          container: {
            backgroundColor: newStatus === 'available' ? '#22c55e' : '#ef4444',
            borderRadius: 8,
          },
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      },
    }));
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.custom(
        <View className="bg-green-50 border border-green-500 flex-row items-center gap-2 p-4 rounded-xl shadow-lg mx-4">
          <Icon name="checkmark-circle" size={24} color={Colors.primary.sage500} />
          <View className="flex-1">
            <Text className="text-green-800 font-semibold text-base">Success!</Text>
            <Text className="text-green-700 text-sm">Your availability has been saved.</Text>
          </View>
        </View>,
        { duration: 3000 }
      );

      setMarkedDates({});
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>

      <Header
        title="Pre-Booking Availability"
        showBackButton
        backButtonColor="#333"
        titlePosition="center"
        titleStyle="text-lg font-semibold text-gray-800"
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 pt-2 pb-6">
        {/* Month/Year Pickers */}
        <View className="flex-row justify-center gap-4 space-x-5 mb-0">
          <View className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
            <Picker
              selectedValue={selectedMonth}
              onValueChange={(itemValue) => setSelectedMonth(itemValue)}
              dropdownIconColor="#333"
              style={{ height: 50, width: '100%' }}
            >
              {months.map((month) => (
                <Picker.Item key={month.value} label={month.label} value={month.value} />
              ))}
            </Picker>
          </View>

          <View className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
            <Picker
              selectedValue={selectedYear}
              onValueChange={(itemValue) => setSelectedYear(itemValue)}
              dropdownIconColor="#333"
              style={{ height: 50, width: '100%' }}
            >
              {years.map((year) => (
                <Picker.Item key={year} label={year.toString()} value={year} />
              ))}
            </Picker>
          </View>
        </View>

        <Calendar
          current={getCurrentDateString()}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          markingType="custom"
          theme={{
            todayTextColor: '#3b82f6',
            arrowColor: '#3b82f6',
            monthTextColor: '#1f2937',
            textMonthFontWeight: 'bold',
            textDayFontSize: 14,
          }}
          className="rounded-lg shadow-sm"
          hideArrows={true}
        />

        {/* Legend */}
        <View className="flex-row justify-around mt-6 mb-8">
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-green-500 rounded-full mr-2" />
            <Text className="text-gray-700">Available</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-4 h-4 bg-red-500 rounded-full mr-2" />
            <Text className="text-gray-700">Booked</Text>
          </View>
        </View>

        {/* Selected count and confirm button */}
        <View className="mb-4">
          <Text className="text-center text-gray-800 text-lg font-semibold">
            {availableDatesList.length} dates selected
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`py-3 rounded-lg items-center flex-row justify-center ${
            isSubmitting ? 'bg-primary-sage300' : 'bg-primary-sage500'
          }`}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-semibold text-base ml-2">Submitting...</Text>
            </>
          ) : (
            <Text className="text-white font-semibold text-base">
              Confirm {availableDatesList.length} Dates
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PreBooking;