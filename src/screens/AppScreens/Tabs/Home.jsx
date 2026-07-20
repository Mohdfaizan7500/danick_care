import React, { useState, useEffect, useCallback } from 'react';
import {
  StatusBar,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  ToastAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Bell, Wallet } from 'lucide-react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors } from '../../../constants/Color';
import {
  BucketIcon,
  CalanderIcon,
  ComplaintsIcon,
  CompleteIcon,
  FileIcon,
  FreshQrCodeIcon,
  UsedQrCodeIcon,
  UserIcon,
} from '../../../assets/svgIcons/SVGIcons';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../../../context/AuthContext';
import NoInternet from '../../NoInternet';
import OffLineScreen from '../OffLineScreen';
// import { getDeshBoardCount, getProfile } from '../../../lib/api';
import { getFCMToken } from '../../../service/getToken';
import Toast from 'react-native-toast-message';
import { notificationRefreshEmitter } from '../../../navigation/NotificationHandler';
import dummyData from '../../../lib/dummyData';

const { width: screenWidth } = Dimensions.get('window');

const Home = () => {
  const insets = useSafeAreaInsets();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isRefreshingFromNotification, setIsRefreshingFromNotification] = useState(false);

  const navigation = useNavigation();
  const { IsOnline, user, imagUrl, profileData, updateProfileData, setIsOnline } = useAuth();

  const [isConnected, setIsConnected] = useState(true);

  const getValidImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const isValidUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');
    if (isValidUrl) return imagePath;
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const baseUrl = imagUrl?.endsWith('/') ? imagUrl : `${imagUrl}/`;
    return `${baseUrl}${cleanImagePath}`;
  };

  const getProfileImageSource = () => {
    if (profileData?.profile_photo) {
      const imageUrl = getValidImageUrl(profileData.profile_photo);
      if (imageUrl) return { uri: imageUrl };
    }
    return require('../../../assets/images/profileImage.jpg');
  };

  const userProfile = {
    name: profileData?.technician_name || 'User Name',
    profileImage: profileData?.profile_photo,
    isActive: profileData?.login_status !== 'Online',
    notificationCount: 3,
    technician_id: profileData?.technician_id,
    walletBalance: '₹2,500',
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setLoadingProfile(true);
      // const response = await getProfile(user.id);
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = dummyData.profileData;
      const data = response?.data?.data[0];
      if (data) {
        await updateProfileData(data);
        const isOnline = data?.login_status === 'Online';
        await setIsOnline(isOnline);
      }
    } catch (error) {
      console.log('Fetch profile error:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchDashboardCount = async () => {
    if (!user?.id) return;
    try {
      const payload = {
        technician_id: user?.id.toString(),
        city_id: user?.city_id.toString()
      };
      // const response = await getDeshBoardCount(payload);
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = dummyData.dashboardCount;
      const data = response?.data;
      if (data?.success) setCount(data);
    } catch (error) {
      console.log('Fetch dashboard error:', error);
    }
  };

  const refreshAllData = useCallback(async (showToast = false, isFromNotification = false) => {
    if (!user?.id) return;
    try {
      if (isFromNotification) {
        setIsRefreshingFromNotification(true);
      }

      await Promise.all([fetchProfile(), fetchDashboardCount()]);

      if (showToast) {
        ToastAndroid.show("Refreshed", ToastAndroid.SHORT);
      }
    } catch (error) {
      if (showToast) {
        Toast.show({
          type: 'error',
          text1: 'Failed to refresh data',
          position: 'top',
          visibilityTime: 1000,
          autoHide: true,
          topOffset: 30,
        });
      }
    } finally {
      if (isFromNotification) {
        setIsRefreshingFromNotification(false);
      }
    }
  }, [user?.id]);

  // Add notification listener for refresh
  useEffect(() => {
    const refreshListener = () => {
      console.log('🔄 Notification received, refreshing Home data...');
      refreshAllData(true, true);
    };

    // Subscribe to refresh events
    notificationRefreshEmitter.on('refresh', refreshListener);

    // Cleanup listener on unmount
    return () => {
      notificationRefreshEmitter.off('refresh', refreshListener);
    };
  }, [refreshAllData]);

  useFocusEffect(
    useCallback(() => {
      refreshAllData(false);
      return () => { };
    }, [refreshAllData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAllData(true);
    setRefreshing(false);
  };

  const handleRetryConnection = async () => {
    setCheckingConnection(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const state = await NetInfo.fetch();
    const connected = state.isConnected ?? false;

    if (connected) {
      setIsConnected(true);
      Toast.show({
        type: 'success',
        text1: 'Connection Restored',
        position: 'top',
        visibilityTime: 1500,
        autoHide: true,
        topOffset: 30,
      });
      await refreshAllData(true);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Still offline. Please check your connection.',
        position: 'top',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
      });
    }
    setCheckingConnection(false);
  };

  useEffect(() => {
    if (user?.id && isInitialLoad) {
      refreshAllData(false);
      setIsInitialLoad(false);
    }
  }, [user?.id, isInitialLoad]);

  useEffect(() => {
    console.log("FCM token", getFCMToken());
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const handleNotificationPress = () => {
    if (!isConnected) return;
    if (!IsOnline) {
      Toast.show({
        type: 'error',
        text1: 'Alert',
        text2: "You Can't access, contact to service center.",
        position: 'top',
        visibilityTime: 2000,
        autoHide: true,
        topOffset: 30,
      });
      return;
    }
    navigation.navigate('NotificationTopNavigation');
  };

  const handleProfilePress = () => {
    if (!isConnected) return;
    if (!IsOnline) {
      Toast.show({
        type: 'error',
        text1: "You Can't access, contact to service center",
        position: 'top',
        visibilityTime: 1000,
        autoHide: true,
        topOffset: 30,
      });
      return;
    }
    navigation.navigate('Profile');
  };

  const handleWalletPress = () => {
    if (!isConnected) return;
    if (!IsOnline) {
      Toast.show({
        type: 'error',
        text1: "You Can't access, contact to service center",
        position: 'top',
        visibilityTime: 1000,
        autoHide: true,
        topOffset: 30,
      });
      return;
    }
    navigation.navigate('Wallet');
  };

  const handleCardPress = cardName => {
    if (!isConnected) return;
    if (!IsOnline) {
      Toast.show({
        type: 'error',
        text1: "You Can't access, contact to service center",
        position: 'top',
        visibilityTime: 1000,
        autoHide: true,
        topOffset: 30,
      });
      return;
    }
    if (cardName === 'All') navigation.navigate('ComplaintsTopNavigation', { status: "All" });
    else if (cardName === 'Cancel') navigation.navigate('ComplaintsTopNavigation', { status: "Cancel" });
    else if (cardName === 'Assign') navigation.navigate('ComplaintsTopNavigation', { status: "Assign" });
    else if (cardName === 'Onworking') navigation.navigate('ComplaintsTopNavigation', { status: "Onworking" });
    else if (cardName === 'Complete') navigation.navigate('ComplaintsTopNavigation', { status: "Complete" });
    else if (cardName === 'Bucket') navigation.navigate('BucketNavigation');
    else if (cardName === 'AMC') navigation.navigate('AMC');
    else if (cardName === 'Pre-Booking') navigation.navigate('PreBooking');
    // else if (cardName === 'Payout') navigation.navigate('Contects');
    else if (cardName === 'Payout') navigation.navigate('PayOut');
    else if (cardName === 'AllQRCodes') navigation.navigate('QRCodeNavigation', { status: "AllQRCodes" });
    else if (cardName === 'Used') navigation.navigate('QRCodeNavigation', { status: "UsedQRCodes" });
    else if (cardName === 'Fresh') navigation.navigate('QRCodeNavigation', { status: "FreshQRCodes" });
  };

  const formatNumberToK = (num) => {
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    const thousands = number / 1000;
    return `${thousands.toFixed(1)}k`;
  };

  const notificationCount = count?.notifications || 0;

  if (!isConnected) {
    return (
      <View className='flex-1 bg-teal-50'>
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />

        <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
          <View className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-teal-200/40" />
          <View className="absolute top-40 -left-16 w-52 h-52 rounded-full bg-emerald-200/30" />
          <View className="absolute top-80 right-8 w-40 h-40 rounded-full bg-cyan-200/35" />
          <View className="absolute -bottom-10 left-1/3 w-72 h-72 rounded-full bg-teal-100/40" />
          <View className="absolute top-20 left-1/4 w-20 h-20 rounded-full bg-green-200/25" />
          <View className="absolute bottom-40 -right-8 w-36 h-36 rounded-full bg-emerald-100/30" />
        </View>

        <View
          className="w-full bg-transparent flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top + 4, paddingBottom: 4, zIndex: 1 }}
        >
          <Pressable onPress={() => handleProfilePress()} className="flex-row items-center flex-1">
            <View className="relative">
              {userProfile.profileImage ? (
                <Image
                  source={userProfile.profileImage}
                  className="w-12 h-12 rounded-full border-2 border-white"
                  onError={(error) => console.log('Profile image loading error:', error.nativeEvent.error)}
                />
              ) : (
                <View className="items-center justify-center w-14 h-14 bg-gray-200 rounded-full">
                  <UserIcon width={28} height={28} stroke={'gray'} />
                </View>
              )}
            </View>
            <View className="ml-3">
              <Text className="text-gray-700 text-sm">Welcome Back</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-900 font-bold text-lg">
                  {userProfile.name}
                </Text>
              </View>
              <Text className={`text-xs font-medium ${IsOnline ? 'text-green-600' : 'text-gray-500'}`}>
                {IsOnline ? '● Active ' : '● Inactive'}
              </Text>
            </View>
          </Pressable>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleNotificationPress} className="relative" disabled={true}>
              <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Bell size={22} color="#999" />
              </View>
              {notificationCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1">
                  <Text className="text-white text-xs font-bold">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {checkingConnection && (
          <View className="px-4 mt-4 pt-5" style={{zIndex: 1}}>
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4">
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-blue-600 text-center text-sm ml-2">Checking connection...</Text>
              </View>
            </View>
          </View>
        )}
        <View style={{zIndex: 1, flex: 1}}>
          <NoInternet onRetry={handleRetryConnection} isChecking={checkingConnection} />
        </View>
      </View>
    );
  }

  return (
    <View className='flex-1 bg-teal-50'>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />

      <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
        <View className="absolute -top-20 -right-10 w-64 h-64 rounded-full bg-teal-200/40" />
        <View className="absolute top-40 -left-16 w-52 h-52 rounded-full bg-emerald-200/30" />
        <View className="absolute top-80 right-8 w-40 h-40 rounded-full bg-cyan-200/35" />
        <View className="absolute -bottom-10 left-1/3 w-72 h-72 rounded-full bg-teal-100/40" />
        <View className="absolute top-20 left-1/4 w-20 h-20 rounded-full bg-green-200/25" />
        <View className="absolute bottom-40 -right-8 w-36 h-36 rounded-full bg-emerald-100/30" />
      </View>

      {IsOnline ? (
        <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary.sage400]}
                tintColor={Colors.primary.sage400}
                title="Pull to refresh"
                titleColor={Colors.primary.sage400}
              />
            }
          >
          {/* Show a small indicator when refreshing from notification */}
          {isRefreshingFromNotification && (
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-2 mx-4 mt-2">
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-blue-600 text-center text-sm ml-2">Updating...</Text>
              </View>
            </View>
          )}

          <View
            className="w-full bg-transparent flex-row items-center justify-between px-5"
            style={{ paddingTop: insets.top + 4, paddingBottom: 14 }}
          >
            <Pressable onPress={() => handleProfilePress()} className="flex-row items-center flex-1">
              <View className="relative">
                {userProfile.profileImage ? (
                  <Image
                    source={userProfile.profileImage}
                    className="w-12 h-12 rounded-full border-2 border-white"
                    onError={(error) => console.log('Profile image loading error:', error.nativeEvent.error)}
                  />
                ) : (
                  <View className="items-center justify-center w-14 h-14 bg-gray-200 rounded-full">
                    <UserIcon width={28} height={28} stroke={'gray'} />
                  </View>
                )}
                <View className={`absolute bottom-1 right-0 w-3 h-3 rounded-full border-2 border-white ${IsOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
              </View>
              <View className="ml-3">
                <Text className="text-gray-700 text-sm">Welcome Back</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-900 font-bold text-lg">
                    {userProfile.name}
                  </Text>
                </View>
                <View className='flex-row gap-2 items-center'>
                  <Text className={`text-xs font-medium ${IsOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {IsOnline ? '● Active ' : '● Inactive'}
                  </Text>
                  <Text className='font-normal text-xs text-gray-700'>ID:{userProfile?.technician_id || 'N/A'}</Text>
                </View>
              </View>
            </Pressable>
            <View className="flex-row items-center">
              <TouchableOpacity onPress={handleNotificationPress} className="relative">
                <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                  <Bell size={22} color="#333" />
                </View>
                {notificationCount > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-5 h-5 items-center justify-center px-1">
                    <Text className="text-white text-xs font-bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-4 py-4">
            {/* Status Overview */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold text-lg mb-3">Status Overview</Text>
              <View className="flex-row justify-between mb-3">
                <Pressable onPress={() => handleCardPress('All')} className="bg-white rounded-[25px] p-4 py-6 flex-row items-center justify-between shadow-sm border border-gray-200 flex-1 mr-2">
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">{count?.all || 0}</Text>
                    <Text className="text-xs text-gray-500">All</Text>
                  </View>
                  <View className="bg-red-100 p-3 rounded-full">
                    <ComplaintsIcon width={24} height={24} fill="red" />
                  </View>
                </Pressable>
                <Pressable onPress={() => handleCardPress('Cancel')} className="bg-white rounded-[25px] p-4 flex-row items-center justify-between shadow-sm border border-gray-200 flex-1 ml-2">
                  <View>
                    <Text className="text-2xl font-bold text-gray-800">{count?.cancel || 0}</Text>
                    <Text className="text-xs text-gray-500">Cancel</Text>
                  </View>
                  <View className="bg-gray-200 p-3 rounded-full">
                    <Icon name="close-circle-outline" size={24} color="gray" />
                  </View>
                </Pressable>
              </View>
              <View className="flex-row justify-between">
                <Pressable onPress={() => handleCardPress('Assign')} className="bg-white rounded-[25px] p-3 items-center shadow-sm border border-gray-200 flex-1 mr-1">
                  <View className="bg-yellow-100 p-2 rounded-full mb-1">
                    <Icon name="wrench-clock" size={20} color="#eab308" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.assign || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">Assign</Text>
                </Pressable>
                <Pressable onPress={() => handleCardPress('Onworking')} className="bg-white rounded-[25px] p-3 items-center shadow-sm border border-gray-200 flex-1 mx-1">
                  <View className="bg-orange-100 p-2 rounded-full mb-1">
                    <Icon name="clock-outline" size={20} color="#f97316" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.onworking || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">On working</Text>
                </Pressable>
                <Pressable onPress={() => handleCardPress('Complete')} className="bg-white rounded-[25px] p-3 items-center shadow-sm border border-gray-200 flex-1 ml-1">
                  <View className="bg-green-100 p-2 rounded-full mb-1">
                    <CompleteIcon width={20} height={20} fill="teal" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.completed || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">Complete</Text>
                </Pressable>
              </View>
            </View>

            {/* Business Metrics */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold text-lg mb-3">Business Metrics</Text>
              <View className="flex-row justify-between mb-3">
                <TouchableOpacity onPress={() => handleCardPress('AMC')} className="bg-white rounded-[25px] p-4 items-center shadow-sm border border-gray-200 flex-1 mr-2">
                  <View className="bg-blue-100 p-3 rounded-full mb-2">
                    <FileIcon width={24} height={24} stroke="blue" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{count?.amc || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">AMC</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCardPress('Bucket')} className="bg-white rounded-[25px] p-4 items-center shadow-sm border border-gray-200 flex-1 ml-2">
                  <View className="bg-orange-100 p-3 rounded-full mb-2">
                    <BucketIcon width={24} height={24} fill="#f97316" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{count?.bucket || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">Bucket</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between">
                <TouchableOpacity onPress={() => handleCardPress('Pre-Booking')} className="bg-white rounded-[25px] p-4 items-center shadow-sm border border-gray-200 flex-1 mr-2">
                  <View className="bg-purple-100 p-3 rounded-full mb-2">
                    <CalanderIcon width={24} height={24} stroke="#a855f7" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{count?.prebooking || 0}</Text>
                  <Text className="text-xs text-gray-500 text-center">Pre-Booking</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleCardPress('Payout')} className="bg-white rounded-[25px] p-4 items-center shadow-sm border border-gray-200 flex-1 ml-2">
                  <View className="bg-emerald-100 p-3 rounded-full mb-2">
                    <Wallet size={24} height={24} color="#10b981" />
                  </View>
                  <Text className="text-2xl font-bold text-gray-800">{formatNumberToK(count?.payout || 0)}</Text>
                  <Text className="text-xs text-gray-500 text-center">Balance</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* QR Code Section */}
            <View className="mb-6">
              <Text className="text-gray-800 font-bold text-lg mt-3 mb-3">QR Code Section</Text>
              <View className="flex-row justify-between">
                <Pressable onPress={() => handleCardPress('AllQRCodes')} className="bg-white rounded-[25px] p-3 items-center shadow-sm border border-gray-200 flex-1 mr-1">
                  <View className="bg-purple-100 p-2 rounded-full mb-1">
                    <Icon name="qrcode-scan" size={24} color="#8B5CF6" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.allQr || '0'}</Text>
                  <Text className="text-xs text-gray-500 text-center">All QR codes</Text>
                </Pressable>
                <Pressable onPress={() => handleCardPress('Used')} className="bg-white rounded-[25px] p-3 items-center shadow-sm border border-gray-200 flex-1 mx-1">
                  <View className="bg-orange-100 p-2 rounded-full mb-1">
                    <UsedQrCodeIcon width={24} height={24} fill="#F97316" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.usedQr || '0'}</Text>
                  <Text className="text-xs text-gray-500 text-center">Used QR codes</Text>
                </Pressable>
                <Pressable onPress={() => handleCardPress('Fresh')} className="bg-white rounded-[25px] p-3 items-center shadow-sm border border-gray-200 flex-1 ml-1">
                  <View className="bg-teal-100 p-2 rounded-full mb-1">
                    <FreshQrCodeIcon width={24} height={24} fill="#14B8A6" />
                  </View>
                  <Text className="text-lg font-bold text-gray-800">{count?.unusedQr || '0'}</Text>
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
    </View>
  );
};

export default Home;