import React, { useState, useRef, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Bell, ChevronRight, TestTube, Wallet } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../constants/Color';
import {
  AMCIcon,
  BucketIcon,
  CalanderIcon,
  ComplaintsIcon,
  CompleteIcon,
} from '../../../assets/svgIcons/SVGIcons';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../../../context/AuthContext';
import NoInternet from '../../NoInternet';
import OffLineScreen from '../OffLineScreen';
import { toast } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';

const { width: screenWidth } = Dimensions.get('window');

// Carousel images
const carouselImages = [
  {
    id: 1,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCg65BGb7qcT77GG52LOysgmpeFT82tJtBhQ&s',
  },
  {
    id: 2,
    image:
      'https://www.creativehatti.com/wp-content/uploads/2023/05/Skilled-maintenance-services-landscape-template-17-small.jpg',
  },
  {
    id: 3,
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPBrmXwxsAUF8alwa1ArjE7c5SOlvKbY0BwQ&s',
  },
  {
    id: 4,
    image:
      'https://static.vecteezy.com/system/resources/previews/009/674/443/non_2x/business-design-drawing-air-conditioning-repair-beauty-repairwoman-technician-repairing-air-conditioner-cooler-unit-repair-maintenance-professional-service-flat-cartoon-style-illustration-vector.jpg',
  },
  {
    id: 5,
    image:
      'https://5.imimg.com/data5/SELLER/Default/2024/12/477202864/OX/SK/EW/110823530/cooler-maintenance-service.jpg',
  },
];

const Home = () => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const { IsOnline } = useAuth();

  // ---------- Network state ----------
  const [isConnected, setIsConnected] = useState(true);

  // ---------- User data (mock) ----------
  const user = {
    name: 'John Doe',
    profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    isActive: true,
    notificationCount: 3,
    walletBalance: '₹2,500',
  };

  // ---------- Auto‑scroll for carousel ----------
  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current) {
        const nextIndex = (activeIndex + 1) % carouselImages.length;
        flatListRef.current.scrollToIndex({ index: nextIndex, animated: true });
        setActiveIndex(nextIndex);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeIndex]);

  // ---------- Network listener ----------
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  // ---------- Handlers ----------
  const handleNotificationPress = () => {
    if (!isConnected) return;
    if (!IsOnline) return toast.custom(<StatusMessage type='error' title={"You Can't access, contact to service center "} />, { duration: 1000 });
    navigation.navigate('Notification');
  };

  const handleWalletPress = () => {
    if (!isConnected) return;
    if (!IsOnline) return toast.custom(<StatusMessage type='error' title={"You Can't access, contact to service center "} />, { duration: 1000 });
    navigation.navigate('Wallet');
  };

  const handleCardPress = cardName => {
    if (!isConnected) return;
    if (cardName === 'Complaints') navigation.navigate('Complaints');
    else if (cardName === 'Bucket') navigation.navigate('Bucket');
    else if (cardName === 'AMC') navigation.navigate('AMC');
    else if (cardName === 'Pre-Booking') navigation.navigate('PreBooking');
    else if (cardName === 'Payout') navigation.navigate('PayOut');
  };

  // ---------- Carousel helpers ----------
  const renderCarouselItem = ({ item }) => (
    <View style={{ width: screenWidth }} className="px-5">
      <View className="bg-white rounded-2xl overflow-hidden">
        <Image
          source={{ uri: item.image }}
          className="w-full h-48"
          resizeMode="cover"
        />
      </View>
    </View>
  );

  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / screenWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };

  const getItemLayout = (data, index) => ({
    length: screenWidth,
    offset: screenWidth * index,
    index,
  });

  return (
    <LinearGradient
      colors={[`${Colors.primary.sage400}`, '#fff', '#fff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{flex:1}}
    >
      <StatusBar
        backgroundColor="transparent"
        barStyle="dark-content"
        translucent={true}
      />

      {/* Header with Profile and Icons */}
      <View
        className="w-full bg-transparent flex-row items-center justify-between px-4"
        style={{ paddingTop: insets.top + 4, paddingBottom: 4 }}
      >
        {/* Left side - Profile */}
        <View className="flex-row items-center flex-1">
          <View className="relative">
            <Image
              source={{ uri: user.profileImage }}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <View
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                user.isActive ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </View>
          <View className="ml-3">
            <Text className="text-gray-700 text-sm">Welcome Back</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-900 font-bold text-lg">
                {user.name}
              </Text>
            </View>
            <Text
              className={`text-xs font-medium ${
                user.isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {user.isActive ? '● Active' : '● Inactive'}
            </Text>
          </View>
        </View>

        {/* Right side - Wallet and Notification Icons */}
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleWalletPress}
            className="mr-3 flex-row items-center bg-white/20 px-3 py-1.5 rounded-full"
          >
            <Wallet size={18} color="#333" />
            <Text className="ml-1 text-gray-800 font-semibold">
              {user.walletBalance}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNotificationPress} className="relative">
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Bell size={22} color="#333" />
            </View>
            {user.notificationCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">
                  {user.notificationCount > 9 ? '9+' : user.notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- CONDITIONAL RENDERING ---------- */}
      {isConnected ? (
        IsOnline ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Carousel */}
            <View className="mt-2">
              <FlatList
                ref={flatListRef}
                data={carouselImages}
                renderItem={renderCarouselItem}
                keyExtractor={item => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={getItemLayout}
                initialScrollIndex={activeIndex}
              />
              <View className="flex-row justify-center mt-3">
                {carouselImages.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      flatListRef.current?.scrollToIndex({
                        index,
                        animated: true,
                      });
                      setActiveIndex(index);
                    }}
                  >
                    <View
                      className={`w-2 h-2 rounded-full mx-1 ${
                        index === activeIndex ? 'bg-blue-500 w-4' : 'bg-gray-300'
                      }`}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cards Section */}
            <View className="px-4 py-4">
              {/* Status Overview */}
              <View className="mb-6">
                <Text className="text-gray-800 font-bold text-lg mb-3">
                  Status Overview
                </Text>
                <View className="flex-row justify-between mb-3">
                  <Pressable
                    onPress={() => handleCardPress('Complaints')}
                    className="bg-white rounded-xl p-4 items-center justify-between flex-row border border-gray-200 flex-1 mr-2"
                  >
                    <View>
                      <Text className="text-2xl font-bold text-gray-800">
                        24
                      </Text>
                      <Text className="text-xs text-gray-500 text-center">
                        Complaints
                      </Text>
                    </View>
                    <View className="bg-red-100 p-3 rounded-full mb-2">
                      <ComplaintsIcon width={24} height={24} fill="red" />
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => handleCardPress('Onworking')}
                    className="bg-white rounded-xl p-4 items-center justify-between flex-row border border-gray-200 flex-1 ml-2"
                  >
                    <View>
                      <Text className="text-2xl font-bold text-gray-800">
                        08
                      </Text>
                      <Text className="text-xs text-gray-500 text-center">
                        Onworking
                      </Text>
                    </View>
                    <View className="bg-yellow-100 p-3 rounded-full mb-2">
                      <Icon name="wrench-clock" size={24} color="#eab308" />
                    </View>
                  </Pressable>
                </View>
                <View className="flex-row justify-between">
                  <Pressable
                    onPress={() => handleCardPress('Pending')}
                    className="bg-white justify-between flex-row rounded-xl p-4 items-center border border-gray-200 flex-1 mr-2"
                  >
                    <View>
                      <Text className="text-2xl font-bold text-gray-800">
                        12
                      </Text>
                      <Text className="text-xs text-gray-500 text-center">
                        Pending
                      </Text>
                    </View>
                    <View className="bg-orange-100 p-3 rounded-full mb-2">
                      <Icon name="clock-outline" size={24} color="#f97316" />
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => handleCardPress('Complete')}
                    className="bg-white justify-between flex-row rounded-xl p-4 items-center border border-gray-200 flex-1 ml-2"
                  >
                    <View>
                      <Text className="text-2xl font-bold text-gray-800">
                        67
                      </Text>
                      <Text className="text-xs text-gray-500 text-center">
                        Complete
                      </Text>
                    </View>
                    <View className="bg-green-100 p-3 rounded-full mb-2">
                      <CompleteIcon width={24} height={24} fill="teal" />
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Business Metrics */}
              <View>
                <Text className="text-gray-800 font-bold text-lg mb-3">
                  Business Metrics
                </Text>
                <View className="flex-row justify-between mb-3">
                  <TouchableOpacity
                    onPress={() => handleCardPress('Complaints')}
                    className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 mr-2"
                  >
                    <View className="bg-red-100 p-3 rounded-full mb-2">
                      <ComplaintsIcon width={24} height={24} fill="red" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">
                      24
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      Complaints
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleCardPress('Bucket')}
                    className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 ml-2"
                  >
                    <View className="bg-orange-100 p-3 rounded-full mb-2">
                      <BucketIcon width={24} height={24} fill="#f97316" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">
                      156
                    </Text>
                    <Text className="text-xs text-gray-500 text-center">
                      Bucket
                    </Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-between mb-3">
                  <TouchableOpacity
                    onPress={() => handleCardPress('AMC')}
                    className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mr-2"
                  >
                    <View className="bg-green-100 p-2 rounded-full mb-1">
                      <AMCIcon width={22} height={22} stroke="#22c55e" />
                    </View>
                    <Text className="text-lg font-bold text-gray-800">32</Text>
                    <Text className="text-[10px] text-gray-500 text-center">
                      AMC
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleCardPress('Pre-Booking')}
                    className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mx-1"
                  >
                    <View className="bg-purple-100 p-2 rounded-full mb-1">
                      <CalanderIcon width={22} height={22} stroke="#a855f7" />
                    </View>
                    <Text className="text-lg font-bold text-gray-800">45</Text>
                    <Text className="text-[10px] text-gray-500 text-center">
                      Pre-Booking
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleCardPress('Payout')}
                    className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 ml-2"
                  >
                    <View className="bg-emerald-100 p-2 rounded-full mb-1">
                      <Wallet size={22} height={22} color="#10b981" />
                    </View>
                    <Text className="text-lg font-bold text-gray-800">
                      ₹12.5k
                    </Text>
                    <Text className="text-[10px] text-gray-500 text-center">
                      Payout
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View className="h-8" />
          </ScrollView>
        ) : (
          <OffLineScreen />
        )
      ) : (
        <NoInternet />
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({});