import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  ToastAndroid,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
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
  UserIcon,
} from '../../../assets/svgIcons/SVGIcons';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import { useAuth } from '../../../context/AuthContext';
import NoInternet from '../../NoInternet';
import OffLineScreen from '../OffLineScreen';
import { getDeshBoardCount, getProfile, AssignQRCodeCount } from '../../../lib/api';
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { Platform } from 'react-native';
import { openSettings } from 'react-native-permissions';
import { getFCMToken } from '../../../service/getToken';
import Toast from 'react-native-toast-message';

const { width: screenWidth } = Dimensions.get('window');

const Home = () => {
  const insets = useSafeAreaInsets();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    name: profileData?.technician_name || 'John Doe',
    profileImage: profileData?.profile_photo,
    isActive: profileData?.login_status !== 'Online',
    notificationCount: 3,
    technician_id: profileData?.technician_id,
    walletBalance: '₹2,500',
  };

  // Location permission functions
  const checkLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        return await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        return await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    } catch (error) {
      console.log('Permission check error:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        return await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        return await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    } catch (error) {
      console.log('Permission request error:', error);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
      },
      error => {
        console.log('Location error:', error);
        Toast.show({
          type: 'error',
          text1: 'Failed to get location',
          position: 'top',
          visibilityTime: 2000,
          autoHide: true,
          topOffset: 30,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // Storage permission functions
  const checkStoragePermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        return await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      } else {
        if (Platform.Version >= 33) {
          const readImagesStatus = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          return readImagesStatus;
        } else {
          const readStatus = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          const writeStatus = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
          return readStatus === RESULTS.GRANTED && writeStatus === RESULTS.GRANTED ? RESULTS.GRANTED : RESULTS.DENIED;
        }
      }
    } catch (error) {
      console.log('Storage permission check error:', error);
      return RESULTS.DENIED;
    }
  };

  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        return await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      } else {
        if (Platform.Version >= 33) {
          const readImagesResult = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
          await request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);
          return readImagesResult;
        } else {
          const readResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          const writeResult = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
          return readResult === RESULTS.GRANTED && writeResult === RESULTS.GRANTED ? RESULTS.GRANTED : RESULTS.DENIED;
        }
      }
    } catch (error) {
      console.log('Storage permission request error:', error);
      return RESULTS.DENIED;
    }
  };

  const initStoragePermission = async () => {
    try {
      let permissionStatus = await checkStoragePermission();
      console.log('Initial storage permission:', permissionStatus);

      if (permissionStatus === RESULTS.DENIED) {
        const requestStatus = await requestStoragePermission();
        console.log('After storage request:', requestStatus);
        if (requestStatus === RESULTS.GRANTED) {
          Toast.show({
            type: 'success',
            text1: 'Storage access granted',
            position: 'top',
            visibilityTime: 2000,
            autoHide: true,
            topOffset: 30,
          });
        }
        return;
      }

      if (permissionStatus === RESULTS.BLOCKED) {
        Alert.alert(
          'Storage Permission Required',
          'Please enable storage permission from settings to access photos and files',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ]
        );
      }

      if (permissionStatus === RESULTS.GRANTED) {
        console.log('Storage permission already granted');
      }
    } catch (error) {
      console.log('Storage permission initialization error:', error);
    }
  };

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setLoadingProfile(true);
      const response = await getProfile(user.id);
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
      const response = await getDeshBoardCount(payload);
      const data = response?.data;
      if (data?.success) setCount(data);
    } catch (error) {
      console.log('Fetch dashboard error:', error);
    }
  };

  const refreshAllData = useCallback(async (showToast = false) => {
    if (!user?.id) return;
    try {
      await Promise.all([fetchProfile(), fetchDashboardCount()]);
      if (showToast) {

        ToastAndroid.show("Refreshed",ToastAndroid.SHORT);
       
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
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      refreshAllData(false);
      return () => {};
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
    const initPermissions = async () => {
      let locationPermissionStatus = await checkLocationPermission();
      if (locationPermissionStatus === RESULTS.DENIED) {
        const requestStatus = await requestLocationPermission();
        if (requestStatus === RESULTS.GRANTED) getCurrentLocation();
      } else if (locationPermissionStatus === RESULTS.GRANTED) {
        getCurrentLocation();
      } else if (locationPermissionStatus === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Required',
          'Please enable location permission from settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ]
        );
      }
      await initStoragePermission();
    };
    initPermissions();
  }, []);

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
      <LinearGradient
        colors={[`${Colors.primary.sage400}`, '#fff', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
        <View
          className="w-full bg-transparent flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top + 4, paddingBottom: 4 }}
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
                  {loadingProfile ? 'Loading...' : userProfile.name}
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
          <View className="px-4 mt-4 bg-white pt-5">
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3 mx-4">
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-blue-600 text-center text-sm ml-2">Checking connection...</Text>
              </View>
            </View>
          </View>
        )}
        <NoInternet onRetry={handleRetryConnection} isChecking={checkingConnection} />
      </LinearGradient>
    );
  }

  return (
    <View className='flex-1'>
      <LinearGradient
        colors={[`${Colors.primary.sage400}`, '#fff', '#fff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ flex: 1 }}
      >
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent={true} />
        <View
          className="w-full bg-transparent flex-row items-center justify-between px-4"
          style={{ paddingTop: insets.top + 4, paddingBottom: 4 }}
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
                  {loadingProfile ? 'Loading...' : userProfile.name}
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
            <View className="px-4 py-4">
              {/* Status Overview */}
              <View className="mb-6">
                <Text className="text-gray-800 font-bold text-lg mb-3">Status Overview</Text>
                <View className="flex-row justify-between mb-3">
                  <Pressable onPress={() => handleCardPress('All')} className="bg-white rounded-xl p-4 py-6 flex-row items-center justify-between border border-gray-200 flex-1 mr-2">
                    <View>
                      <Text className="text-2xl font-bold text-gray-800">{count?.all || 0}</Text>
                      <Text className="text-xs text-gray-500">All</Text>
                    </View>
                    <View className="bg-red-100 p-3 rounded-full">
                      <ComplaintsIcon width={24} height={24} fill="red" />
                    </View>
                  </Pressable>
                  <Pressable onPress={() => handleCardPress('Cancel')} className="bg-white rounded-xl p-4 flex-row items-center justify-between border border-gray-200 flex-1 ml-2">
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
                  <Pressable onPress={() => handleCardPress('Assign')} className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mr-1">
                    <View className="bg-yellow-100 p-2 rounded-full mb-1">
                      <Icon name="wrench-clock" size={20} color="#eab308" />
                    </View>
                    <Text className="text-lg font-bold text-gray-800">{count?.assign || 0}</Text>
                    <Text className="text-xs text-gray-500 text-center">Assign</Text>
                  </Pressable>
                  <Pressable onPress={() => handleCardPress('Onworking')} className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mx-1">
                    <View className="bg-orange-100 p-2 rounded-full mb-1">
                      <Icon name="clock-outline" size={20} color="#f97316" />
                    </View>
                    <Text className="text-lg font-bold text-gray-800">{count?.onworking || 0}</Text>
                    <Text className="text-xs text-gray-500 text-center">On working</Text>
                  </Pressable>
                  <Pressable onPress={() => handleCardPress('Complete')} className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 ml-1">
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
                  <TouchableOpacity onPress={() => handleCardPress('AMC')} className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 mr-2">
                    <View className="bg-blue-100 p-3 rounded-full mb-2">
                      <FileIcon width={24} height={24} stroke="blue" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">{count?.amc || 0}</Text>
                    <Text className="text-xs text-gray-500 text-center">AMC</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCardPress('Bucket')} className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 ml-2">
                    <View className="bg-orange-100 p-3 rounded-full mb-2">
                      <BucketIcon width={24} height={24} fill="#f97316" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">{count?.bucket || 0}</Text>
                    <Text className="text-xs text-gray-500 text-center">Bucket</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row justify-between">
                  <TouchableOpacity onPress={() => handleCardPress('Pre-Booking')} className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 mr-2">
                    <View className="bg-purple-100 p-3 rounded-full mb-2">
                      <CalanderIcon width={24} height={24} stroke="#a855f7" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">{count?.prebooking || 0}</Text>
                    <Text className="text-xs text-gray-500 text-center">Pre-Booking</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCardPress('Payout')} className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 ml-2">
                    <View className="bg-emerald-100 p-3 rounded-full mb-2">
                      <Wallet size={24} height={24} color="#10b981" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">{formatNumberToK(count?.payout || 0)}</Text>
                    <Text className="text-xs text-gray-500 text-center">Payout</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* QR Code Section */}
              <View className="mb-6">
                <Text className="text-gray-800 font-bold text-lg mt-3 mb-3">QR Code Section</Text>
                <View className="flex-row justify-between">
                  <Pressable onPress={() => handleCardPress('AllQRCodes')} className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mr-1">
                    <View className="bg-purple-100 p-2 rounded-full mb-1">
                      <Icon name="qrcode-scan" size={24} color="#8B5CF6" />
                    </View>
                    <Text className="text-lg font-bold text-gray-800">{count?.allQr || '0'}</Text>
                    <Text className="text-xs text-gray-500 text-center">All QR codes</Text>
                  </Pressable>
                  <Pressable onPress={() => handleCardPress('Used')} className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 mx-1">
                    <View className="bg-orange-100 p-2 rounded-full mb-1">
                      <UsedQrCodeIcon width={24} height={24} fill="#F97316" />
                    </View>
                    <Text className="text-lg font-bold text-gray-800">{count?.usedQr || '0'}</Text>
                    <Text className="text-xs text-gray-500 text-center">Used QR codes</Text>
                  </Pressable>
                  <Pressable onPress={() => handleCardPress('Fresh')} className="bg-white rounded-xl p-3 items-center border border-gray-200 flex-1 ml-1">
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
      </LinearGradient>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});