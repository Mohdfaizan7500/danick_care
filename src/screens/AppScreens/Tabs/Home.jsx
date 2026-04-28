import React, { useState, useRef, useEffect, useCallback } from 'react'; // Add useCallback
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
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
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
import { check, request, RESULTS, PERMISSIONS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { Platform } from 'react-native';
import { openSettings } from 'react-native-permissions';
import{getFCMToken} from '../../../service/getToken';
const { width: screenWidth } = Dimensions.get('window');

const Home = () => {
  const insets = useSafeAreaInsets();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [count, setCount] = useState(null);
  const [checkingConnection, setCheckingConnection] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial load

  const navigation = useNavigation();
  const { IsOnline, user, imagUrl, profileData, updateProfileData, setIsOnline } = useAuth();

  // ---------- Network state ----------
  const [isConnected, setIsConnected] = useState(true);

  // Helper function to get valid image URL
  const getValidImageUrl = (imagePath) => {
    if (!imagePath) {
      return null;
    }

    // Check if it's already a valid URL (starts with http:// or https://)
    const isValidUrl = imagePath.startsWith('http://') || imagePath.startsWith('https://');

    if (isValidUrl) {
      return imagePath;
    }

    // If not a valid URL, construct URL using imagUrl + imagePath
    // Remove leading slashes from imagePath if present to avoid double slashes
    const cleanImagePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    const baseUrl = imagUrl?.endsWith('/') ? imagUrl : `${imagUrl}/`;

    return `${baseUrl}${cleanImagePath}`;
  };

  // Get profile image source
  const getProfileImageSource = () => {
    if (profileData?.profile_photo) {
      const imageUrl = getValidImageUrl(profileData.profile_photo);
      if (imageUrl) {
        return { uri: imageUrl };
      }
    }
    // Fallback to default image
    return require('../../../assets/images/profileImage.jpg');
  };

  // Get user profile object
  const userProfile = {
    name: profileData?.technician_name || 'John Doe',
    profileImage: getProfileImageSource(),
    isActive: profileData?.login_status !== 'Online',
    notificationCount: 3,
    technician_id :profileData?.technician_id,
    walletBalance: '₹2,500',
  };

  // ---------- Location Permission Functions ----------
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
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
      },
      error => {
        console.log('Location error:', error);
        toast.custom(
          <StatusMessage type="error" title="Failed to get location" />
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  };

  // ---------- Storage Permission Functions ----------
  const checkStoragePermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        return await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
      } else {
        // For Android 13+ (API 33+), check granular permissions
        if (Platform.Version >= 33) {
          const readImagesStatus = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          return readImagesStatus;
        } else {
          // For older Android versions
          const readStatus = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          const writeStatus = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
          return readStatus === RESULTS.GRANTED && writeStatus === RESULTS.GRANTED
            ? RESULTS.GRANTED
            : RESULTS.DENIED;
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
        // For Android 13+ (API 33+)
        if (Platform.Version >= 33) {
          const readImagesResult = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          // Also request for videos and audio if needed for your use case
          await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
          await request(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO);
          return readImagesResult;
        } else {
          // For older Android versions
          const readResult = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          const writeResult = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
          return readResult === RESULTS.GRANTED && writeResult === RESULTS.GRANTED
            ? RESULTS.GRANTED
            : RESULTS.DENIED;
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
          console.log('Storage permission granted');
          toast.custom(
            <StatusMessage type="success" title="Storage access granted" />
          );
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
        console.log('Profile photo path:', data.profile_photo);
        await updateProfileData(data);
        const isOnline = data?.login_status === 'Online';
        console.log("Active status set:", isOnline);
        await setIsOnline(isOnline);
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
        city_id:user?.city_id.toString()
      };
      console.log("deshboards count payload :",payload)
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

  // Main refresh function that fetches all data
  const refreshAllData = useCallback(async (showToast = false) => {
    if (!user?.id) {
      console.log('No user ID available for refresh');
      return;
    }
    
    console.log('Refreshing all data...');
    try {
      await Promise.all([
        fetchProfile(),
        fetchDashboardCount(),
      ]);
      
      if (showToast) {
        toast.custom(
          <StatusMessage type='success' title={"Data refreshed successfully"} />,
          { duration: 1000 }
        );
      }
      console.log('All data refreshed successfully');
    } catch (error) {
      console.log('Refresh error:', error);
      if (showToast) {
        toast.custom(
          <StatusMessage type='error' title={"Failed to refresh data"} />,
          { duration: 1000 }
        );
      }
    }
  }, [user?.id]); // Add dependencies

  // useFocusEffect - Refreshes data whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Home screen focused - refreshing data');
      
      // Refresh all data when screen comes into focus
      refreshAllData(false); // false means don't show toast for auto-refresh
      
      return () => {
        // Cleanup function when screen loses focus
        console.log('Home screen unfocused');
      };
    }, [refreshAllData])
  );

  // ---------- Refresh function for pull-to-refresh ----------
  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAllData(true); // true means show toast notification
    setRefreshing(false);
  };

  // Retry connection handler
  const handleRetryConnection = async () => {
    setCheckingConnection(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const state = await NetInfo.fetch();
    const connected = state.isConnected ?? false;

    if (connected) {
      setIsConnected(true);
      toast.custom(
        <StatusMessage type='success' title='Connection Restored' />,
        { duration: 1500 }
      );
      await refreshAllData(true);
    } else {
      toast.custom(
        <StatusMessage type='error' title='Still offline. Please check your connection.' />,
        { duration: 2000 }
      );
    }
    setCheckingConnection(false);
  };

  // ---------- Initialize all permissions ----------
  useEffect(() => {
    const initPermissions = async () => {
      // Initialize location permission
      let locationPermissionStatus = await checkLocationPermission();

      console.log('Initial location permission:', locationPermissionStatus);

      if (locationPermissionStatus === RESULTS.DENIED) {
        const requestStatus = await requestLocationPermission();
        console.log('After location request:', requestStatus);

        if (requestStatus === RESULTS.GRANTED) {
          // Get location if permission granted
          getCurrentLocation();
        }
      } else if (locationPermissionStatus === RESULTS.GRANTED) {
        // Get location if permission already granted
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

      // Initialize storage permission
      await initStoragePermission();
    };

    initPermissions();
  }, []);

  // ---------- Fetch data when component mounts ----------
  useEffect(() => {
    if (user?.id && isInitialLoad) {
      refreshAllData(false);
      setIsInitialLoad(false);
    }
  }, [user?.id, isInitialLoad]);

  useEffect(()=>{
    console.log(getFCMToken())
  },[])

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
    if (cardName === 'All') navigation.navigate('ComplaintsTopNavigation', { status: "All" });
    else if (cardName === 'Cancel') navigation.navigate('ComplaintsTopNavigation', { status: "Cancel" });
    else if (cardName === 'Assign') navigation.navigate('ComplaintsTopNavigation', { status: "Assign" });
    else if (cardName === 'Onworking') navigation.navigate('ComplaintsTopNavigation', { status: "Onworking" });
    else if (cardName === 'Complete') navigation.navigate('ComplaintsTopNavigation', { status: "Complete" });
    else if (cardName === 'Bucket') navigation.navigate('Bucket');
    else if (cardName === 'AMC') navigation.navigate('AMC');
    else if (cardName === 'Pre-Booking') navigation.navigate('PreBooking');
    else if (cardName === 'Payout') navigation.navigate('PayOut');
    else if (cardName === 'AllQRCodes') navigation.navigate('QRCodes', { status: "AllQRCodes" });
    else if (cardName === 'Used') navigation.navigate('QRCodes', { status: "Used" });
    else if (cardName === 'Fresh') navigation.navigate('QRCodes', { status: "Fresh" });
  };

  const formatNumberToK = (num) => {
    const number = parseFloat(num);
    if (isNaN(number)) return '0';
    const thousands = number / 1000;
    return `${thousands.toFixed(1)}k`;
  };

  // Fix: Add null check for count before accessing notifications
  const notificationCount = count?.notifications || 0;

  // If offline, show NoInternet screen
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

        <View
          className="w-full bg-transparent flex-row items-center justify-between px-4 "
          style={{ paddingTop: insets.top + 4, paddingBottom: 4 }}
        >
          <View className="flex-row items-center flex-1">
            <View className="relative">
              <Image
                source={userProfile.profileImage}
                className="w-12 h-12 rounded-full border-2 border-white"
              />
              <View
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${IsOnline ? 'bg-green-500' : 'bg-gray-400'
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
                className={`text-xs font-medium ${IsOnline ? 'text-green-600' : 'text-gray-500'
                  }`}
              >
                {IsOnline ? '● Active ' : '● Inactive'} 
              </Text>
            </View>
          </View>

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
    <View className='flex-1'>
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
          <View className="flex-row items-center flex-1">
            <View className="relative">
              <Image
                source={userProfile.profileImage}
                className="w-12 h-12 rounded-full border-2 border-white"
                onError={(error) => {
                  console.log('Profile image loading error:', error.nativeEvent.error);
                }}
              />
              <View
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${IsOnline ? 'bg-green-500' : 'bg-gray-400'
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
              <View className='flex-row gap-2 items-center'>
              <Text
                className={`text-xs font-medium ${IsOnline ? 'text-green-600' : 'text-gray-500'
                  }`}
              >
                {IsOnline ? '● Active ' : '● Inactive'} 
              </Text>
              <Text className='font-normal text-xs text-gray-700'>ID:{userProfile?.technician_id || 'N/A'}</Text>
            </View>
            </View>
          </View>

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
                <Text className="text-gray-800 font-bold text-lg mb-3">
                  Status Overview
                </Text>

                <View className="flex-row justify-between mb-3">
                  <Pressable
                    onPress={() => handleCardPress('All')}
                    className="bg-white rounded-xl p-4 py-6 flex-row items-center justify-between border border-gray-200 flex-1 mr-2"
                  >
                    <View>
                      <Text className="text-2xl font-bold text-gray-800">{count?.all || 0}</Text>
                      <Text className="text-xs text-gray-500">All</Text>
                    </View>
                    <View className="bg-red-100 p-3 rounded-full">
                      <ComplaintsIcon width={24} height={24} fill="red" />
                    </View>
                  </Pressable>

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

                <View className="flex-row justify-between">
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
              <View className="mb-6">
                <Text className="text-gray-800 font-bold text-lg mb-3">
                  Business Metrics
                </Text>

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

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    onPress={() => handleCardPress('Pre-Booking')}
                    className="bg-white rounded-xl p-4 items-center border border-gray-200 flex-1 mr-2"
                  >
                    <View className="bg-purple-100 p-3 rounded-full mb-2">
                      <CalanderIcon width={24} height={24} stroke="#a855f7" />
                    </View>
                    <Text className="text-2xl font-bold text-gray-800">{count?.prebooking || 0}</Text>
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

              {/* QR Code Section */}
              <View className="mb-6">
                <Text className="text-gray-800 font-bold text-lg mt-3 mb-3">
                  QR Code Section
                </Text>

                <View className="flex-row justify-between">
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
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({});