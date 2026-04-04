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
  Alert,
  ActivityIndicator,
  RefreshControl,
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
  FileIcon,
  FreshQrCodeIcon,
  UsedQrCodeIcon,
} from '../../../assets/svgIcons/SVGIcons';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../../../context/AuthContext';
import NoInternet from '../../NoInternet';
import OffLineScreen from '../OffLineScreen';
import { toast } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { getDeshBoardCount, getProfile, AssignQRCodeCount } from '../../../lib/api';

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
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false); // New state for retry button
  
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const { IsOnline, user, imagUrl, profileData, updateProfileData } = useAuth();

  // ---------- Network state ----------
  const [isConnected, setIsConnected] = useState(true);

  // ---------- User data from context ----------
  const userProfile = {
    name: profileData?.technician_name || 'John Doe',
    profileImage: profileData?.profile_photo
      ? `${imagUrl}${profileData.profile_photo}`
      : 'https://randomuser.me/api/portraits/men/1.jpg',
    isActive: profileData?.login_status !== 'Online',
    notificationCount: 3,
    walletBalance: '₹2,500',
  };

  // ---------- Fetch profile on mount ----------
  const fetchProfile = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      setLoadingProfile(true);
      const response = await getProfile(user.id);
      const data = response?.data?.data[0];

      if (data) {
        console.log('Profile data fetched:', data);
        // Save profile data to context
        await updateProfileData(data);
      }
    } catch (error) {
      console.log('Fetch profile error:', error);
      console.error('Fetch profile error:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchDashboardCount = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }

    try {
      const payload = {
        technician_id: user?.id.toString(),
      };
      const response = await getDeshBoardCount(payload);
      const data = response?.data;
      if (data?.success) {
        console.log('deshboard count :', data);
        setCount(data);
      }
    } catch (error) {
      console.log('Fetch deshboard error:', error);
      console.error('Fetch deshboard error:', error);
    }
  };

  // ---------- Refresh function for pull-to-refresh ----------
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Fetch all data simultaneously
      await Promise.all([
        fetchProfile(),
        fetchDashboardCount(),
      ]);
      toast.custom(
        <StatusMessage type='success' title={"Data refreshed successfully"} />,
        { duration: 1000 }
      );
    } catch (error) {
      console.log('Refresh error:', error);
      toast.custom(
        <StatusMessage type='error' title={"Failed to refresh data"} />,
        { duration: 1000 }
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Retry connection handler with 2-second checking message
  const handleRetryConnection = async () => {
    // Show checking connection message
    setCheckingConnection(true);
    
    // Wait for 2 seconds while checking connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check actual connection
    const state = await NetInfo.fetch();
    const connected = state.isConnected ?? false;
    
    if (connected) {
      setIsConnected(true);
      toast.custom(
        <StatusMessage type='success' title='Connection Restored' />,
        { duration: 1500 }
      );
      // Refresh data when connection is restored
      await Promise.all([
        fetchProfile(),
        fetchDashboardCount(),
      ]);
    } else {
      toast.custom(
        <StatusMessage type='error' title='Still offline. Please check your connection.' />,
        { duration: 2000 }
      );
    }
    
    // Hide checking connection message
    setCheckingConnection(false);
  };

  useEffect(() => {
    // Fetch data when component mounts and user is available
    if (user?.id) {
      fetchProfile();
      fetchDashboardCount();
    }
  }, [user?.id]);

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
    if (cardName === 'All') navigation.navigate('Complaints', { status: "All" });
    else if (cardName === 'Cancel') navigation.navigate('Complaints', { status: "Cancel" });
    else if (cardName === 'Assign') navigation.navigate('Complaints', { status: "Assign" });
    else if (cardName === 'Onworking') navigation.navigate('Complaints', { status: "Onworking" });
    else if (cardName === 'Complete') navigation.navigate('Complaints', { status: "Complete" });
    else if (cardName === 'Bucket') navigation.navigate('Bucket');
    else if (cardName === 'AMC') navigation.navigate('AMC');
    else if (cardName === 'Pre-Booking') navigation.navigate('PreBooking');
    else if (cardName === 'Payout') navigation.navigate('PayOut');
    else if (cardName === 'AllQRCodes') navigation.navigate('QRCodes', { status: "AllQRCodes" });
    else if (cardName === 'Used') navigation.navigate('QRCodes', { status: "Used" });
    else if (cardName === 'Fresh') navigation.navigate('QRCodes', { status: "Fresh" });
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

  const formatNumberToK = (num) => {
    // Convert to number if it's a string
    const number = parseFloat(num);

    // Check if it's a valid number
    if (isNaN(number)) return '0';

    // Divide by 1000 to get thousands
    const thousands = number / 1000;

    // Format to 1 decimal place and add 'k'
    return `${thousands.toFixed(1)}k`;
  };

  // If offline, show NoInternet screen with custom retry handler
  if (!isConnected) {
    return (
      <LinearGradient
        colors={[`${Colors.primary.sage400}`, '#fff', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <StatusBar
          backgroundColor="transparent"
          barStyle="dark-content"
          translucent={true}
        />
        
        {/* Header with Profile and Icons (for consistency) */}
        <View
          className="w-full bg-transparent flex-row items-center justify-between px-4 "
          style={{ paddingTop: insets.top + 4, paddingBottom: 4 }}
        >
          {/* Left side - Profile */}
          <View className="flex-row items-center flex-1">
            <View className="relative">
              <Image
                source={{ uri: userProfile.profileImage }}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <View
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${userProfile.IsOnline ? 'bg-green-500' : 'bg-gray-400'
                  }`}
              />
            </View>
            <View className="ml-3">
              <Text className="text-gray-700 text-sm">Welcome Back</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-bold text-lg">
                  {loadingProfile ? 'Loading...' : userProfile.name}
                </Text>
              </View>
              <Text
                className={`text-xs font-medium ${userProfile.IsOnline ? 'text-green-600' : 'text-gray-500'
                  }`}
              >
                {userProfile.IsOnline ? '● Active' : '● Inactive'}
              </Text>
            </View>
          </View>

          {/* Right side - Wallet and Notification Icons (disabled when offline) */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handleWalletPress}
              className="mr-3 flex-row items-center bg-white/20 px-3 py-1.5 rounded-full"
              disabled={true}
            >
              <Wallet size={18} color="#999" />
              <Text className="ml-1 text-gray-400 font-semibold">
                {userProfile.walletBalance}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNotificationPress} className="relative" disabled={true}>
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Bell size={22} color="#999" />
              </View>
              {userProfile.notificationCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1">
                  <Text className="text-white text-xs font-bold">
                    {userProfile.notificationCount > 9 ? '9+' : userProfile.notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Show checking connection message when retry is clicked */}
        {checkingConnection && (
          <View className="px-4 mt-4 bg-white  pt-5  ">
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4">
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-blue-600 text-center text-sm ml-2">
                  Checking connection...
                </Text>
              </View>
            </View>
          </View>
        )}

        

        <NoInternet onRetry={handleRetryConnection} isChecking={checkingConnection} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[`${Colors.primary.sage400}`, '#fff', '#fff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
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
              source={{ uri: userProfile.profileImage }}
              className="w-12 h-12 rounded-full border-2 border-white"
            />
            <View
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${userProfile.IsOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}
            />
          </View>
          <View className="ml-3">
            <Text className="text-gray-700 text-sm">Welcome Back</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-900 font-bold text-lg">
                {loadingProfile ? 'Loading...' : userProfile.name}
              </Text>
            </View>
            <Text
              className={`text-xs font-medium ${userProfile.IsOnline ? 'text-green-600' : 'text-gray-500'
                }`}
            >
              {userProfile.IsOnline ? '● Active' : '● Inactive'}
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
              {userProfile.walletBalance}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNotificationPress} className="relative">
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Bell size={22} color="#333" />
            </View>
            {userProfile.notificationCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1">
                <Text className="text-white text-xs font-bold">
                  {userProfile.notificationCount > 9 ? '9+' : userProfile.notificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ---------- CONDITIONAL RENDERING ---------- */}
      {IsOnline ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary.sage400]} // Android
              tintColor={Colors.primary.sage400} // iOS
              title="Pull to refresh" // iOS
              titleColor={Colors.primary.sage400} // iOS
            />
          }
        >
          {/* Carousel Section */}
          <View className="mt-2">
            <FlatList
              ref={flatListRef}
              data={carouselImages}
              renderItem={renderCarouselItem}
              keyExtractor={item => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              getItemLayout={getItemLayout}
            />
            {/* Pagination Dots */}
            <View className="flex-row justify-center mt-2">
              {carouselImages.map((_, index) => (
                <View
                  key={index}
                  className={`h-1.5 rounded-full mx-1 ${index === activeIndex ? 'bg-primary-sage600 w-6' : 'bg-gray-300 w-1.5'
                    }`}
                />
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

              {/* Row 1 → All + Cancel */}
              <View className="flex-row justify-between mb-3">
                {/* All */}
                <Pressable
                  onPress={() => handleCardPress('All')}
                  className="bg-white rounded-xl p-4 py-6 flex-row items-center justify-between border border-gray-200 flex-1 mr-2"
                >
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">{count?.all || 0} </Text>
                    <Text className="text-xs text-gray-500">All</Text>
                  </View>
                  <View className="bg-red-100 p-3 rounded-full">
                    <ComplaintsIcon width={24} height={24} fill="red" />
                  </View>
                </Pressable>

                {/* Cancel */}
                <Pressable
                  onPress={() => handleCardPress('Cancel')}
                  className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-gray-200 flex-1 ml-2"
                >
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">{count?.cancel || 0}</Text>
                    <Text className="text-xs text-gray-500">Cancel</Text>
                  </View>
                  <View className="bg-gray-200 p-3 rounded-full">
                    <Icon name="close-circle-outline" size={24} color="gray" />
                  </View>
                </Pressable>
              </View>

              {/* Row 2 → Assign, Onworking, Complete */}
              <View className="flex-row justify-between">
                {/* Assign */}
                <Pressable
                  onPress={() => handleCardPress('Assign')}
                  className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mr-1"
                >
                  <View className="bg-yellow-100 p-2 rounded-full mb-1">
                    <Icon name="wrench-clock" size={20} color="#eab308" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.assign || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">Assign</Text>
                </Pressable>

                {/* Onworking */}
                <Pressable
                  onPress={() => handleCardPress('Onworking')}
                  className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mx-1"
                >
                  <View className="bg-orange-100 p-2 rounded-full mb-1">
                    <Icon name="clock-outline" size={20} color="#f97316" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.onworking || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">
                    On working
                  </Text>
                </Pressable>

                {/* Complete */}
                <Pressable
                  onPress={() => handleCardPress('Complete')}
                  className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 ml-1"
                >
                  <View className="bg-green-100 p-2 rounded-full mb-1">
                    <CompleteIcon width={20} height={20} fill="teal" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.completed || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">
                    Complete
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Business Metrics */}
            <View>
              <Text className="text-gray-800 font-bold text-lg mb-3">
                Business Metrics
              </Text>

              {/* First Row - AMC and Bucket */}
              <View className="flex-row justify-between mb-3">
                <TouchableOpacity
                  onPress={() => handleCardPress('AMC')}
                  className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 mr-2"
                >
                  <View className="bg-blue-100 p-3 rounded-full mb-2">
                    <FileIcon width={24} height={24} stroke="blue" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {count?.amc || 0}
                  </Text>
                  <Text className="text-xs text-gray-500 text-center">
                    AMC
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
                    {count?.bucket || 0}
                  </Text>
                  <Text className="text-xs text-gray-500 text-center">
                    Bucket
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Second Row - Pre-Booking and Payout */}
              <View className="flex-row justify-between">
                <TouchableOpacity
                  onPress={() => handleCardPress('Pre-Booking')}
                  className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 mr-2"
                >
                  <View className="bg-purple-100 p-3 rounded-full mb-2">
                    <CalanderIcon width={24} height={24} stroke="#a855f7" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800"> {count?.prebooking || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">
                    Pre-Booking
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleCardPress('Payout')}
                  className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 ml-2"
                >
                  <View className="bg-emerald-100 p-3 rounded-full mb-2">
                    <Wallet size={24} height={24} color="#10b981" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">
                    {formatNumberToK(count?.payout || 0)}
                  </Text>
                  <Text className="text-xs text-gray-500 text-center">
                    Payout
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* QR Code Section - UPDATED WITH CORRECT COUNTS */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold text-lg mt-3 mb-3">
                QR Code Section
              </Text>

              <View className="flex-row justify-between">
                {/* All QR codes - Purple theme */}
                <Pressable
                  onPress={() => handleCardPress('AllQRCodes')}
                  className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mr-1"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <View className="bg-purple-100 p-2 rounded-full mb-1">
                    <Icon name="qrcode-scan" size={24} color="#8B5CF6" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.allQr || '0'}</Text>
                  <Text className="text-xs text-gray-500 text-center">All QR codes</Text>
                </Pressable>

                {/* Used QR codes - Orange theme */}
                <Pressable
                  onPress={() => handleCardPress('Used')}
                  className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mx-1"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <View className="bg-orange-100 p-2 rounded-full mb-1">
                    <UsedQrCodeIcon width={24} height={24} fill="#F97316" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.unusedQr || '0'}</Text>
                  <Text className="text-xs text-gray-500 text-center">Used QR codes</Text>
                </Pressable>

                {/* Fresh QR codes (Unused) - Teal theme */}
                <Pressable
                  onPress={() => handleCardPress('Fresh')}
                  className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 ml-1"
                  style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
                >
                  <View className="bg-teal-100 p-2 rounded-full mb-1">
                    <FreshQrCodeIcon width={24} height={24} fill="#14B8A6" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.usedQr || '0'}</Text>
                  <Text className="text-xs text-gray-500 text-center">Fresh QR codes</Text>
                </Pressable>
              </View>
            </View>
          </View>
          <View className="h-8" />
        </ScrollView>
      ) : (
        <OffLineScreen />
      )}
    </LinearGradient>
  );
};

export default Home;

const styles = StyleSheet.create({});