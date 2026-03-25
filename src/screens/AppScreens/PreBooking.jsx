import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toast, Toaster } from 'sonner-native';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { CalenderIcon } from '../../assets/svgIcons/SVGIcons';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { getAttendanceApi, MarkAttandance } from '../../lib/api';

const { width: screenWidth } = Dimensions.get('window');

// Helper: get local date string YYYY-MM-DD (no timezone shift)
const getLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Custom day component with loading spinner
const CustomDay = memo(({ date, state, marking, onPress, loadingDates }) => {
  const dateString = date.dateString;
  const isLoading = loadingDates.has(dateString);

  let containerStyle = {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  };

  if (marking?.selected) {
    const bgColor = marking.customStyles?.container?.backgroundColor || '#68DAAC';
    containerStyle.backgroundColor = bgColor;
    containerStyle.borderRadius = 8;
  } else if (state === 'disabled') {
    containerStyle.backgroundColor = '#f3f4f6';
    containerStyle.borderRadius = 8;
  } else if (state === 'today') {
    containerStyle.borderWidth = 1;
    containerStyle.borderColor = '#9ca3af';
    containerStyle.borderRadius = 8;
  }

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={() => onPress(date)}
      disabled={state === 'disabled' || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#58A890" />
      ) : (
        <Text
          style={{
            fontSize: 16,
            color: marking?.selected ? 'white' : state === 'disabled' ? '#9ca3af' : '#111827',
          }}
        >
          {date.day}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const PreBooking = () => {
  const { user } = useAuth();
  const [selectedDates, setSelectedDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(new Set()); // individual day spinners
  const [loading, setLoading] = useState(true); // overall modal loading
  const [error, setError] = useState(null);

  const currentDate = new Date();
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());

  const slideAnim = useRef(new Animated.Value(0)).current;

  // Compute the next 3 dates (today, tomorrow, day after tomorrow) – these are locked
  const lockedDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dates = [];
    for (let i = 0; i < 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(getLocalDateString(date));
    }
    return dates;
  }, []);

  // Format month as MM-YYYY (1‑based month)
  const formatMonth = useCallback((month, year) => {
    const monthNumber = month.toString().padStart(2, '0');
    return `${monthNumber}-${year}`;
  }, []);

  // Fetch attendance data when month/year or user changes
  const fetchAttendance = useCallback(async () => {
    if (!user?.id) return;
    const monthStr = formatMonth(displayMonth, displayYear);
    setLoading(true);
    setError(null);
    try {
      const response = await getAttendanceApi(user.id, monthStr);
      console.log('Fetched Attendance:', response);

      // Response structure: response.data.data is an array of objects with 'date' property
      const datesArray = response?.data?.data || [];
      if (Array.isArray(datesArray)) {
        const dateStrings = datesArray.map(item => item.date).filter(Boolean);
        console.log('Extracted date strings:', dateStrings);
        setSelectedDates(dateStrings);
      } else {
        setSelectedDates([]);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError(err.message);
      toast.error('Failed to load attendance. Please try again.');
      setSelectedDates([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, displayMonth, displayYear, formatMonth]);

  useEffect(() => {
    if (user?.id) {
      fetchAttendance();
    }
  }, [fetchAttendance, user?.id]);

  const getMonthName = useCallback((month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }, []);

  const animateMonthChange = useCallback((direction) => {
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
  }, [slideAnim]);

  const handlePrevMonth = useCallback(() => {
    animateMonthChange('right');
    setDisplayMonth(prev => {
      if (prev === 1) return 12;
      return prev - 1;
    });
    setDisplayYear(prev => {
      if (displayMonth === 1) return prev - 1;
      return prev;
    });
  }, [animateMonthChange, displayMonth]);

  const handleNextMonth = useCallback(() => {
    animateMonthChange('left');
    setDisplayMonth(prev => {
      if (prev === 12) return 1;
      return prev + 1;
    });
    setDisplayYear(prev => {
      if (displayMonth === 12) return prev + 1;
      return prev;
    });
  }, [animateMonthChange, displayMonth]);

  const getCurrentDateString = useCallback(() => {
    const monthStr = displayMonth.toString().padStart(2, '0');
    return `${displayYear}-${monthStr}-01`;
  }, [displayMonth, displayYear]);

  const getDatesInMonth = useCallback((year, month) => {
    const dates = [];
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }
    return dates;
  }, []);

  // Memoize the marked dates object
  const markedDates = useMemo(() => {
    const marked = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = getLocalDateString(today);

    // Selected dates
    selectedDates.forEach((dateStr) => {
      const [year, month] = dateStr.split('-').map(Number);
      const isCurrentMonth = (year === displayYear && month === displayMonth);
      const selectedDate = new Date(dateStr);
      const isPast = selectedDate < today;
      const isLocked = lockedDates.includes(dateStr);

      let bgColor = '#68DAAC'; // default green
      if (isLocked) {
        bgColor = '#68DAAC';
      } else if (!isCurrentMonth) {
        bgColor = '#2e7d32';
      }

      const containerStyle = {
        backgroundColor: bgColor,
        borderRadius: 8,
      };

      marked[dateStr] = {
        selected: true,
        disabled: isPast,
        locked: isLocked,
        customStyles: {
          container: containerStyle,
          text: { color: 'white', fontWeight: 'bold' },
        },
      };
    });

    // Disable past dates in current month
    const monthDates = getDatesInMonth(displayYear, displayMonth);
    monthDates.forEach((date) => {
      if (date < today) {
        const dateStr = getLocalDateString(date);
        if (!marked[dateStr]) {
          marked[dateStr] = {
            disabled: true,
            customStyles: {
              container: { backgroundColor: '#f3f4f6', borderRadius: 8 },
              text: { color: '#9ca3af' },
            },
          };
        } else if (!marked[dateStr].selected) {
          marked[dateStr].disabled = true;
          marked[dateStr].customStyles = {
            container: { backgroundColor: '#f3f4f6', borderRadius: 8 },
            text: { color: '#9ca3af' },
          };
        }
      }
    });

    // Highlight today
    if (!marked[todayStr]) {
      marked[todayStr] = {
        customStyles: {
          container: { borderWidth: 1, borderColor: 'red', borderRadius: 8 },
          text: { color: '#000' },
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
  }, [selectedDates, displayMonth, displayYear, lockedDates, getDatesInMonth]);

  const handleDayPress = useCallback(async (day) => {
    const dateString = day.dateString;
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // Prevent double click while loading
    if (loadingDates.has(dateString)) return;

    const isSelected = selectedDates.includes(dateString);

    // BLOCK: cannot uncheck a locked date
    if (isSelected && lockedDates.includes(dateString)) {
      toast.custom(
        <View className="bg-orange-50 border border-orange-500 flex-row items-center gap-2 p-4 rounded-xl shadow-lg mx-4">
          <Icon name="lock-closed" size={24} color="#f97316" />
          <View className="flex-1">
            <Text className="text-orange-800 font-semibold text-base">Locked date</Text>
            <Text className="text-orange-700 text-sm">You cannot remove this date because it is in the next 3 days.</Text>
          </View>
        </View>,
        { duration: 3000 }
      );
      return;
    }

    const [year, monthdata, daydata] = dateString.split('-');
    const cityId = user?.city_id || '1';
    const techId = user?.id || '1';
    const month = `${monthdata}-${year}`;
    console.log("month on prebooking:", month);

    // Add to loading set (shows spinner on that day)
    setLoadingDates(prev => new Set(prev).add(dateString));

    try {
      const response = await MarkAttandance(cityId, techId, dateString, month);
      console.log('MarkAttendance response:', response);
      // Refresh the attendance list after successful API call
      await fetchAttendance();

      if (isSelected) {
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
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast.error('Failed to update availability. Please try again.');
    } finally {
      // Remove from loading set (hides spinner)
      setLoadingDates(prev => {
        const newSet = new Set(prev);
        newSet.delete(dateString);
        return newSet;
      });
    }
  }, [selectedDates, loadingDates, lockedDates, user, fetchAttendance]);

  const renderCustomDay = useCallback(({ date, state, marking }) => (
    <CustomDay
      date={date}
      state={state}
      marking={marking}
      onPress={handleDayPress}
      loadingDates={loadingDates}
    />
  ), [handleDayPress, loadingDates]);

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
              onDayPress={() => { }} // handled by custom day
              markingType="custom"
              markedDates={markedDates}
              hideArrows={true}
              renderHeader={() => null}
              dayComponent={renderCustomDay}
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

      {/* Modal with Activity Indicator */}
      <Modal
        visible={loading}
        transparent={true}
        animationType="fade"
        onRequestClose={() => { }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 12,
              alignItems: 'center',
              elevation: 5,
            }}
          >
            <ActivityIndicator size="large" color="#58A890" />
            <Text style={{ marginTop: 12, fontSize: 16, color: '#333' }}>
              Loading availability...
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default PreBooking;