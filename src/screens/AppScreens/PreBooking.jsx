import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast, Toaster } from 'sonner-native';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../constants/Color';
import { CalenderIcon } from '../../assets/svgIcons/SVGIcons';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

const PreBooking = () => {
  const [selectedDates, setSelectedDates] = useState([]);

  const currentDate = new Date();
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Dummy data generation
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    // Generate 5 dates in the current month (starting from today)
    const currentMonthDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(currentYear, currentMonth - 1, today.getDate() + i);
      if (date.getMonth() + 1 === currentMonth) {
        currentMonthDates.push(date.toISOString().split('T')[0]);
      }
    }

    // Previous month
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    // Generate 10 dates in the previous month (any dates, they will be disabled)
    const prevMonthDates = [];
    for (let i = 1; i <= 10; i++) {
      const date = new Date(prevYear, prevMonth - 1, i);
      // Only add if the date is valid (i <= last day of month)
      if (date.getMonth() + 1 === prevMonth) {
        prevMonthDates.push(date.toISOString().split('T')[0]);
      }
    }

    const dummySelected = [...currentMonthDates, ...prevMonthDates];
    setSelectedDates(dummySelected);
  }, []);

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const animateMonthChange = (direction) => {
    const toValue = direction === 'left' ? -screenWidth : screenWidth;

    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePrevMonth = () => {
    animateMonthChange('right');
    if (displayMonth === 1) {
      setDisplayMonth(12);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = () => {
    animateMonthChange('left');
    if (displayMonth === 12) {
      setDisplayMonth(1);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const getCurrentDateString = () => {
    const monthStr = displayMonth.toString().padStart(2, '0');
    return `${displayYear}-${monthStr}-01`;
  };

  // Helper: get all dates in current month as Date objects
  const getDatesInMonth = (year, month) => {
    const dates = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  };

  // Build markedDates object
  const buildMarkedDates = () => {
    const marked = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Selected dates – differentiate between current month and other months
    selectedDates.forEach((dateStr) => {
      const [year, month] = dateStr.split('-').map(Number);
      const isCurrentMonth = (year === displayYear && month === displayMonth);
      const selectedDate = new Date(dateStr);
      const isPast = selectedDate < today;

      const containerStyle = isCurrentMonth
        ? { backgroundColor: '#68DAAC', borderRadius: 8 }   // cyan for current month
        : { backgroundColor: '#2e7d32', borderRadius: 8 }; // dark green for other months

      marked[dateStr] = {
        selected: true,
        disabled: isPast, // Mark as disabled if it's a past date
        customStyles: {
          container: containerStyle,
          text: {
            color: 'white',
            fontWeight: 'bold',
          },
        },
      };
    });

    // 2. Disable all dates in current month that are before today
    const monthDates = getDatesInMonth(displayYear, displayMonth);
    monthDates.forEach((date) => {
      if (date < today) {
        const dateStr = date.toISOString().split('T')[0];
        if (!marked[dateStr]) {
          marked[dateStr] = {
            disabled: true,
            customStyles: {
              container: {
                backgroundColor: '#f3f4f6',
                borderRadius: 8,
              },
              text: {
                color: '#9ca3af',
              },
            },
          };
        } else if (!marked[dateStr].selected) {
          // If not selected but disabled, ensure disabled style
          marked[dateStr].disabled = true;
          marked[dateStr].customStyles = {
            container: {
              backgroundColor: '#f3f4f6',
              borderRadius: 8,
            },
            text: {
              color: '#9ca3af',
            },
          };
        }
        // For selected past dates, we keep the selected style but also set disabled=true above
      }
    });

    // 3. Highlight today with gray border if not selected/disabled
    const todayStr = today.toISOString().split('T')[0];
    if (!marked[todayStr]) {
      marked[todayStr] = {
        customStyles: {
          container: {
            borderWidth: 1,
            borderColor: '#9ca3af',
            borderRadius: 8,
          },
          text: {
            color: '#111827',
          },
        },
      };
    } else if (!marked[todayStr].disabled && !marked[todayStr].selected) {
      marked[todayStr].customStyles = {
        ...marked[todayStr].customStyles,
        container: {
          ...(marked[todayStr].customStyles?.container || {}),
          borderWidth: 1,
          borderColor: '#9ca3af',
        },
      };
    }

    return marked;
  };

  const handleDayPress = (day) => {
    const dateString = day.dateString;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // If the date is disabled (including past or pre‑selected dummy dates), ignore click
    if (selectedDate < today) {
      toast.custom(
        <View className="bg-orange-50 border border-orange-500 flex-row items-center gap-2 p-4 rounded-xl shadow-lg mx-4">
          <Icon name="warning-outline" size={24} color="#f97316" />
          <View className="flex-1">
            <Text className="text-orange-800 font-semibold text-base">Cannot select past dates</Text>
          </View>
        </View>,
        { duration: 2000 }
      );
      return;
    }

    // Toggle selection and show toast
    const isSelected = selectedDates.includes(dateString);
    if (isSelected) {
      setSelectedDates(prev => prev.filter(d => d !== dateString));
      toast.custom(
        <View className="bg-blue-50 border border-blue-500 flex-row items-center gap-2 p-4 rounded-xl shadow-lg mx-4">
          <Icon name="calendar-outline" size={24} color="#3b82f6" />
          <View className="flex-1">
            <Text className="text-blue-800 font-semibold text-base">Date removed</Text>
            <Text className="text-blue-700 text-sm">{dateString} has been removed.</Text>
          </View>
        </View>,
        { duration: 2000 }
      );
    } else {
      setSelectedDates(prev => [...prev, dateString]);
      toast.custom(
        <View className="bg-green-50 border border-green-500 flex-row items-center gap-2 p-4 rounded-xl shadow-lg mx-4">
          <Icon name="checkmark-circle" size={24} color="#22c55e" />
          <View className="flex-1">
            <Text className="text-green-800 font-semibold text-base">Date added</Text>
            <Text className="text-green-700 text-sm">{dateString} has been added to your availability.</Text>
          </View>
        </View>,
        { duration: 2000 }
      );
    }
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
        <View className="flex-row items-start gap-4 mb-6">
          <View className="bg-green-100 w-14 h-14 flex justify-center items-center rounded-2xl">
            <CalenderIcon width={24} height={24} stroke={'teal'} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-xl text-black">Set Your Availability</Text>
            <Text className="text-gray-600 font-normal text-sm">
              Tap the dates you can accept service requests.
            </Text>
            {selectedDates.length > 0 && (
              <View className="mt-2 flex-row flex-wrap">
                <Text className="text-sm text-gray-700">
                  Selected: {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="flex-row px-3 pt-2 items-center justify-between mb-4">
          <Text className="font-bold text-black text-2xl">
            {getMonthName(displayMonth)} {displayYear}
          </Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={handlePrevMonth}
              className="bg-gray-100 rounded-full w-9 flex justify-center items-center h-9"
            >
              <ChevronLeft size={20} stroke="black" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNextMonth}
              className="bg-gray-100 rounded-full w-9 flex justify-center items-center h-9"
            >
              <ChevronRight size={20} stroke="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Animated Calendar */}
        <View style={{ flex: 1 }}>
          <Animated.View
            style={{
              transform: [{ translateX: slideAnim }],
              minHeight: 480,
              width: '100%',
            }}
          >
            <Calendar
              key={`${displayYear}-${displayMonth}`}
              current={getCurrentDateString()}
              onDayPress={handleDayPress}
              markingType="custom"
              markedDates={buildMarkedDates()}
              hideArrows={true}
              renderHeader={() => null}
              theme={{
                todayTextColor: '#3b82f6',
                textDayFontSize: 20,
                textMonthFontSize: 0,
                textDayHeaderFontSize: 14,
                'stylesheet.calendar.main': {
                  week: {
                    marginTop: 10,
                    marginBottom: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  },
                },
              }}
              style={{
                width: '100%',
                height: 480,
                borderRadius: 12,
              }}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PreBooking;