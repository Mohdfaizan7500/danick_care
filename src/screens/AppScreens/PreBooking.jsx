import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDate = new Date();
  const [displayMonth, setDisplayMonth] = useState(currentDate.getMonth() + 1);
  const [displayYear, setDisplayYear] = useState(currentDate.getFullYear());

  // Animation
  const slideAnim = useRef(new Animated.Value(0)).current;
  const directionRef = useRef('left');

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  };

  const animateMonthChange = (direction) => {
    directionRef.current = direction;
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
    const lastDay = new Date(year, month, 0); // last day of month
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

    // 1. Selected dates (cyan background)
    selectedDates.forEach((date) => {
      marked[date] = {
        selected: true,
        customStyles: {
          container: {
            backgroundColor: '#68DAAC', // cyan
            borderRadius: 8,
          },
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
                backgroundColor: '#f3f4f6', // light gray
                borderRadius: 8,
              },
              text: {
                color: '#9ca3af', // gray text
              },
            },
          };
        } else {
          // If somehow already marked (should not happen), mark as disabled
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
      }
    });

    // 3. Highlight today with gray border if not selected/disabled
    const todayStr = today.toISOString().split('T')[0];
    console.log('todat date:',todayStr)
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

    // Safety check – disabled days should not trigger onDayPress, but just in case
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

    setSelectedDates((prev) => {
      if (prev.includes(dateString)) {
        return prev.filter((d) => d !== dateString);
      } else {
        return [...prev, dateString];
      }
    });
  };

  const handleSubmit = () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

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

      setSelectedDates([]);
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
        <View className="flex-row items-start gap-4 ">
          <View className="bg-green-100 w-14 h-14 flex justify-center items-center rounded-2xl">
            <CalenderIcon width={24} height={24} stroke={'teal'} />
          </View>
          <View>
            <Text className="font-bold text-xl text-black">Set Your Availability</Text>
            <Text className="text-gray-600 font-normal text-sm">
              Tap the dates you can accept service requests.
            </Text>
          </View>
        </View>

        <View className="flex-row px-3 pt-6 items-center justify-between ">
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
        <Animated.View
          style={{
            transform: [{ translateX: slideAnim }],
            height: 500,
            marginVertical: 16,
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
              textDayFontSize: 16,
              textMonthFontSize: 0,
              textDayHeaderFontSize: 14,
              'stylesheet.calendar.main': {
                week: {
                  marginTop: 10,
                  marginBottom: 30,
                  marginLeft: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                },
              },
            }}
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 12,
            }}
          />
        </Animated.View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`rounded-2xl py-5 items-center flex-row justify-center ${
            isSubmitting ? 'bg-primary-sage300' : 'bg-primary-sage600'
          }`}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="text-white font-semibold text-base ml-2">Submitting...</Text>
            </>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Confirm {selectedDates.length} Date{selectedDates.length !== 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PreBooking;