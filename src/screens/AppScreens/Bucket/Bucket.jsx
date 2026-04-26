import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
  LayoutAnimation,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import DialogBox from '../../../components/DilaogBox';
import { useAuth } from '../../../context/AuthContext';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  getPartCount,
  technicianAssignPart,
  partTransferCancel,
  partTransferReceive
} from '../../../lib/api';
import StatusMessage from '../../../components/StatusMessage';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../../NoInternet';

// Tabs
const TABS = ['All', 'Technician', 'Market', 'Admin', 'Transferred', 'Received'];

// Skeleton component for loading state
const SkeletonCard = () => (
  <View className="bg-white border border-gray-300 rounded-2xl p-4 mb-3">
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <View className="w-20 h-20 bg-gray-200 rounded-xl" />
        <View className="ml-4 flex-1">
          <View className="h-5 w-32 bg-gray-200 rounded mb-2" />
          <View className="h-4 w-24 bg-gray-200 rounded" />
          <View className="h-3 w-40 bg-gray-200 rounded mt-2" />
        </View>
      </View>
      <View className="h-6 w-16 bg-gray-200 rounded" />
    </View>
  </View>
);

const Bucket = () => {
  const navigation = useNavigation();

  // Internet connection state
  const [isConnected, setIsConnected] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(false);

  const [selectedTab, setSelectedTab] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tabPositions, setTabPositions] = useState([]);
  const scrollViewRef = useRef(null);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [products, setProducts] = useState([]);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [shouldAutoRefresh, setShouldAutoRefresh] = useState(false);
  const [autoRefreshMessage, setAutoRefreshMessage] = useState('');
  const [partCounts, setPartCounts] = useState({
    all: 0,
    technician: 0,
    market: 0,
    admin: 0,
    transferred: 0,
    received: 0
  });
  const tabTimeoutRef = useRef(null);
  const autoRefreshTimerRef = useRef(null);
  const { user, imagUrl } = useAuth();
  const technician_id = user?.id;

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Swipe gesture handling for tab navigation
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) < 50) return;
        
        const currentIndex = TABS.indexOf(selectedTab);
        if (gestureState.dx > 0 && currentIndex > 0) {
          // Swipe right - go to previous tab
          handleTabPress(TABS[currentIndex - 1], currentIndex - 1);
        } else if (gestureState.dx < 0 && currentIndex < TABS.length - 1) {
          // Swipe left - go to next tab
          handleTabPress(TABS[currentIndex + 1], currentIndex + 1);
        }
      },
    })
  ).current;

  // Monitor internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-refresh after error
  useEffect(() => {
    if (shouldAutoRefresh && isConnected) {
      // Clear any existing timer
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
      }
      
      // Show auto-refresh message
      
      
      // Set timer to refresh after 2 seconds
      autoRefreshTimerRef.current = setTimeout(async () => {
        setShouldAutoRefresh(false);
        setAutoRefreshMessage('');
        
        // Perform refresh like pull-to-refresh
        setRefreshing(true);
        const transferBy = getTransferByParam(selectedTab);
        await Promise.all([
          fetchParts(transferBy, true),
          fetchPartCount()
        ]);
        setRefreshing(false);
        
        toast.custom(
          <StatusMessage type='success' title='Data Refreshed' />,
          { duration: 1000 }
        );
      }, 2000);
    }
    
    return () => {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
      }
    };
  }, [shouldAutoRefresh, isConnected, selectedTab, autoRefreshMessage]);

  // Map tab to transfer_by parameter
  const getTransferByParam = (tab) => {
    switch (tab) {
      case 'All':
        return '';
      case 'Technician':
        return 'technician';
      case 'Market':
        return 'market';
      case 'Admin':
        return 'admin';
      case 'Transferred':
        return 'transfered';
      case 'Received':
        return 'received';
      default:
        return '';
    }
  };

  const getImageUrl = (imagePath, baseUrl) => {
    if (!imagePath) return null;

    // Check if it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Otherwise, construct URL with base URL
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const base = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${base}${cleanPath}`;
  };

  const fetchParts = async (transfer_by, isRefresh = false) => {
    // Don't fetch if offline
    if (!isConnected) {
      setIsTabLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      if (!isRefresh) {
        setIsTabLoading(true);
      }
      const payload = {
        technician_id: technician_id?.toString(),
        transfer_by: transfer_by
      };

      console.log('Fetch parts payload:', payload);
      const response = await technicianAssignPart(payload);
      console.log('API Response:', response?.data);

      // Handle API response
      const data = response?.data?.data || [];

      // Transform API data to match component structure
      const formattedProducts = Array.isArray(data) ? data.map(item => ({
        id: item.id?.toString(),
        partNumber: item.id,
        name: item.part_name,
        parentName: item.transfer_by === 'market' ? 'Market' :
          item.transfer_by === 'technician' ? 'Technician' :
            item.transfer_by === 'admin' ? 'Admin' :
              item.transfer_by === 'replace' ? 'Replace' : 'Unknown',
        price: item.part_price,
        imageUrl: getImageUrl(item.imageUrl || item.part_image, imagUrl),
        parentType: item.transfer_by,
        addedDate: item.created_at || new Date().toLocaleDateString(),
        description: item.description,
        transferStatus: item.transfer_status,
        transferId: item.transfer_id,
        toPartner: item.to_partner,
        fromPartner: item.from_partner,
        part_accept: item.part_accept,
        qr_code: item.qr_code,
        technician_name: item.technician_name,
        ...item
      })) : [];

      setProducts(formattedProducts);

      if (isRefresh) {
        toast.custom(
          <StatusMessage type='success' title='Bucket refreshed successfully' />,
          { duration: 1000 }
        );
      }
    } catch (error) {
      console.log('fetch part error:', error);
      console.error('fetch part error:', error);
      if (!isRefresh) {
        toast.custom(
          <StatusMessage type='error' title='Failed to load items' />,
          { duration: 1500 }
        );
      }
      setProducts([]);
    } finally {
      setIsTabLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPartCount = async () => {
    // Don't fetch if offline
    if (!isConnected) return;

    try {
      const payload = {
        technician_id: technician_id?.toString(),
      };
      const response = await getPartCount(payload);
      console.log('Part count response:', response?.data);
      const data = response?.data || {};

      setPartCounts({
        all: data.all || 0,
        technician: data.technician || 0,
        market: data.market || 0,
        admin: data.admin || 0,
        transferred: data.transfered || 0,
        received: data.received || 0
      });
    } catch (error) {
      console.log('fetch part count error:', error);
      console.error('fetch part count error:', error);
    }
  };

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }

    const query = searchQuery.toLowerCase().trim();
    return products.filter(item =>
      item.name?.toLowerCase().includes(query) ||
      item.id?.toString().toLowerCase().includes(query) ||
      item.parentName?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.price?.toString().includes(query) ||
      item.qr_code?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  useEffect(() => {
    if (isConnected) {
      fetchPartCount();
    }
  }, [isConnected]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
      if (autoRefreshTimerRef.current) clearTimeout(autoRefreshTimerRef.current);
    };
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (isConnected) {
      const transferBy = getTransferByParam(selectedTab);
      fetchParts(transferBy);
    }
    // Clear search when changing tabs
    setSearchQuery('');
  }, [selectedTab, isConnected]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isConnected) {
        const transferBy = getTransferByParam(selectedTab);
        fetchParts(transferBy);
        fetchPartCount();
      }
    }, [selectedTab, isConnected])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    if (!isConnected) {
      // If offline, just check connection again
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? false);
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    const transferBy = getTransferByParam(selectedTab);
    await Promise.all([
      fetchParts(transferBy, true),
      fetchPartCount()
    ]);
  }, [selectedTab, isConnected]);

  // Retry connection handler
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
      const transferBy = getTransferByParam(selectedTab);
      await Promise.all([
        fetchParts(transferBy, true),
        fetchPartCount()
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

  // Confirmation dialog state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const handleTabPress = (tab, index) => {
    setSelectedTab(tab);
    // Clear search when changing tabs
    setSearchQuery('');

    // Scroll to tab
    if (scrollViewRef.current && tabPositions[index] !== undefined) {
      scrollViewRef.current.scrollTo({
        x: tabPositions[index] - 20,
        animated: true,
      });
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleCardPress = (item) => {
    if (!isConnected) return;

    console.log(item);
    if (item?.part_accept == 0) {
      toast.custom(<StatusMessage type='warning' title={'Information'} message={`This part is transferred to ${item.technician_name} technician. Please cancel first for use.`} />);
    } else {
      navigation.navigate('BucketpartDetails', { item });
    }
  };

  // Open confirmation dialog
  const openConfirmation = (action, item) => {
    setConfirmAction(action);
    setConfirmItem(item);
    setConfirmVisible(true);
  };

  // Remove item from products list
  const removeItem = (itemId) => {
    setProducts(prev => prev.filter(p => p.id !== itemId));
  };

  // Helper function to extract error message from backend response
  const getErrorMessage = (error) => {
    // Try to get message from different possible locations in the error object
    if (error?.response?.data?.msg) {
      return error.response.data.msg;
    }
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    if (error?.msg) {
      return error.msg;
    }
    if (error?.message) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    return 'Action failed. Please try again.';
  };

  // Handle confirmed action
  const handleConfirmed = async () => {
    setConfirmVisible(false);
    if (!confirmItem || !confirmAction) return;

    setLoadingItemId(confirmItem.id);

    try {
      let response;
      let successMessage = '';

      switch (confirmAction) {
        case 'cancelTransfer':
        case 'cancelReceived':
          // Call cancel transfer API for both cancelTransfer and cancelReceived
          const cancelPayload = {
            part_id: confirmItem.id.toString()
          };

          console.log(`${confirmAction} payload:`, cancelPayload);
          response = await partTransferCancel(cancelPayload);
          console.log(`${confirmAction} response:`, response?.data);

          // Check if the API call was successful
          if (response?.data?.status === 'success' || response?.data?.success) {
            successMessage = response?.data?.msg ||
              (confirmAction === 'cancelTransfer'
                ? `Transfer cancelled successfully`
                : `Received item rejected successfully`);
            removeItem(confirmItem.id);
            // Update part counts after cancellation
            await fetchPartCount();
            // Refresh current tab data
            const transferBy = getTransferByParam(selectedTab);
            await fetchParts(transferBy);
          } else {
            throw new Error(response?.data?.msg || 'Failed to cancel');
          }
          break;

        case 'acceptReceived':
          // Call accept/receive transfer API
          const acceptPayload = {
            technician_id: technician_id?.toString(),
            part_id: confirmItem.id.toString()
          };

          console.log('Accept transfer payload:', acceptPayload);
          response = await partTransferReceive(acceptPayload);
          console.log('Accept transfer response:', response?.data);

          // Check if the API call was successful
          if (response?.data?.status === 'success' || response?.data?.success) {
            successMessage = response?.data?.msg || `Part accepted successfully`;
            // Remove item from list after successful accept
            removeItem(confirmItem.id);
            // Update part counts after acceptance
            await fetchPartCount();
            // Refresh current tab data
            const transferBy = getTransferByParam(selectedTab);
            await fetchParts(transferBy);
          } else {
            throw new Error(response?.data?.msg || 'Failed to accept transfer');
          }
          break;

        case 'add':
          // Handle add to bucket action
          toast.info('Add to bucket API not implemented yet');
          break;

        default:
          successMessage = 'Action completed';
      }

      if (successMessage) {
        toast.custom(<StatusMessage type='success' title={successMessage} />);
      }

    } catch (error) {
      console.log(`${confirmAction} error:`, error);
      
      // Extract the error message from the backend response
      const errorMessage = getErrorMessage(error);
      
      toast.custom(
        <StatusMessage type='error' title={errorMessage} />
      );
      
      // Trigger auto-refresh after error (like pull-to-refresh)
      setAutoRefreshMessage(errorMessage);
      setShouldAutoRefresh(true);
    } finally {
      setLoadingItemId(null);
      setConfirmItem(null);
      setConfirmAction(null);
    }
  };

  // Get dialog content based on action
  const getDialogContent = () => {
    switch (confirmAction) {
      case 'cancelTransfer':
        return {
          title: 'Cancel Transfer',
          icon: 'close-circle-outline',
          iconColor: '#E86F6F',
          message: 'Are you sure you want to cancel this transfer?'
        };
      case 'acceptReceived':
        return {
          title: 'Accept Transfer',
          icon: 'checkmark-circle-outline',
          iconColor: '#58A890',
          message: 'Are you sure you want to accept this transfer?'
        };
      case 'cancelReceived':
        return {
          title: 'Reject Transfer',
          icon: 'close-circle-outline',
          iconColor: '#E86F6F',
          message: 'Are you sure you want to reject this received item?'
        };
      case 'add':
        return {
          title: 'Add to Bucket',
          icon: 'bag-add-outline',
          iconColor: '#88D8C0',
          message: 'Are you sure you want to add this item to your bucket?'
        };
      default:
        return {
          title: 'Confirm Action',
          icon: 'help-circle-outline',
          iconColor: '#666',
          message: 'Are you sure?'
        };
    }
  };

  // Render confirmation dialog footer
  const renderConfirmFooter = () => {
    const isDestructive = confirmAction?.includes('cancel');

    return (
      <View className="flex-row justify-end space-x-2 gap-4">
        <TouchableOpacity
          onPress={() => setConfirmVisible(false)}
          className="px-4 py-2 rounded-lg bg-background-tertiary flex-row items-center"
        >
          <Icon name="close-outline" size={18} color="#666" />
          <Text className="text-text-secondary font-medium ml-1">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirmed}
          className={`px-4 py-2 rounded-lg flex-row items-center ${isDestructive ? 'bg-ui-error' :
            confirmAction === 'acceptReceived' ? 'bg-ui-success' :
              'bg-primary-sage600'
            }`}
        >
          <Icon name="checkmark-outline" size={18} color="#fff" />
          <Text className="text-white font-medium ml-1">Confirm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Get count for a specific tab
  const getTabCount = (tab) => {
    switch (tab) {
      case 'All':
        return partCounts.all;
      case 'Technician':
        return partCounts.technician;
      case 'Market':
        return partCounts.market;
      case 'Admin':
        return partCounts.admin;
      case 'Transferred':
        return partCounts.transferred;
      case 'Received':
        return partCounts.received;
      default:
        return 0;
    }
  };

  const renderItem = ({ item }) => {
    const isLoading = loadingItemId === item.id;
    const isTransferredTab = selectedTab === 'Transferred';
    const isReceivedTab = selectedTab === 'Received';

    // Handle QR code icon click
    const handleQrCodePress = () => {
      if (item.qr_code) {
        Clipboard.setString(item.qr_code);
        toast.custom(
          <StatusMessage
            type='info'
            title={'QR Code Copied!'}
            message={`QR Code: ${item.qr_code}`}
          />,
          { duration: 1000 }
        );
      } else {
        toast.custom(
          <StatusMessage
            type='warning'
            title={'Information'}
            message={'No QR code available for this item'}
          />,
          { duration: 1000 }
        );
      }
    };

    return (
      <View
        className={`border ${item?.part_accept == 0 && (!isTransferredTab && !isReceivedTab) && 'opacity-50'} bg-white border-gray-300 rounded-2xl p-4 mb-3`}
      >
        {/* Main card content (pressable) */}
        <TouchableOpacity onPress={() => handleCardPress(item)} className="flex-row items-center justify-between">
          {/* Left side: image + text */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => openImageModal(item.imageUrl)}>
              <View className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Icon name="image-outline" size={30} color="#999" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-text-primary flex-1">{item.name}</Text>
              </View>
              <Text className="text-sm text-text-tertiary">{item.parentName}</Text>
              {/* QR Code Icon */}
              <View className="flex-row items-center mt-1">
                <Text className='font-normal text-xs text-gray-600'>QR code: {item.qr_code || 'N/A'}</Text>
                <TouchableOpacity
                  onPress={handleQrCodePress}
                  className="ml-2 p-1"
                >
                  <Icon name="copy-outline" size={16} color="#58A890" />
                </TouchableOpacity>
              </View>
              {item.description ? (
                <Text className="text-xs w-40 text-text-tertiary mt-1" numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              {item.part_accept == 0 && (
                <Text className="text-xs text-ui-info mt-1">
                  {selectedTab == 'Received' ? `Received From: ${item.technician_name}` : `Transferred To: ${item.technician_name}`}
                </Text>
              )}
            </View>
          </View>

          {/* Right side: price */}
          <View className='flex-col items-end'>
            <Text className="text-xl font-extrabold text-ui-success">
              ₹{item.price}
            </Text>
            {/* Conditional buttons */}
            {isTransferredTab && (
              <View className="mt-3 flex-row justify-end">
                <TouchableOpacity
                  onPress={() => openConfirmation('cancelTransfer', item)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-ui-disabled' : 'bg-ui-error'}`}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Icon name="close-circle-outline" size={18} color="#fff" />
                      <Text className="text-white font-medium ml-1">Cancel</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {isReceivedTab && (
          <View className="mt-3 flex-row justify-end space-x-2 gap-4">
            {/* Cancel button */}
            <TouchableOpacity
              onPress={() => openConfirmation('cancelReceived', item)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-ui-disabled' : 'bg-red-500'}`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="close-circle-outline" size={18} color="#fff" />
                  <Text className="text-white font-medium ml-1">Reject</Text>
                </>
              )}
            </TouchableOpacity>
            {/* Accept button */}
            <TouchableOpacity
              onPress={() => openConfirmation('acceptReceived', item)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-ui-disabled' : 'bg-ui-success'}`}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Icon name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text className="text-white font-medium ml-1">Accept</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Skeleton list renderer
  const renderSkeleton = () => (
    <View style={{ padding: 16 }}>
      {[1, 2, 3, 4, 5].map((key) => (
        <SkeletonCard key={key} />
      ))}
    </View>
  );

  // If offline, show NoInternet screen
  if (!isConnected && !isTabLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <Header
          title="Bucket"
          titlePosition="left"
          titleStyle="font-bold text-2xl ml-5"
          showRightIcon={true}
          containerStyle='flex-row pt-3 py-2 px-4'
          customRightIconComponent={
            <Icon name="bag-add-outline" size={24} color="#999" />
          }
          onRightIconPress={() => {
            if (isConnected) navigation.navigate('AddPart');
          }}
        />
        {/* Search Bar */}
        <View className="px-4 py-0 bg-background-primary">
          <View className={`flex-row items-center bg-background-secondary rounded-xl px-3 py-0 border ${isSearchFocused ? 'border-primary-sage500' : 'border-ui-border'}`}>
            <Icon name="search-outline" size={20} color="#999999" />
            <TextInput
              className="flex-1 ml-2 text-base text-text-primary"
              placeholder="Search by name, ID, type, or price..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={20} color="#999999" />
              </TouchableOpacity>
            )}
          </View>
          {searchQuery.length > 0 && (
            <Text className="text-xs text-text-tertiary mt-1 ml-1">
              Found {filteredProducts.length} result(s)
            </Text>
          )}
        </View>

        {/* Filter Tabs */}
        <View className="py-2 border-b border-ui-border">
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-2"
          >
            {TABS.map((tab, index) => {
              const count = getTabCount(tab);
              return (
                <TouchableOpacity
                  key={tab}
                  onPress={() => handleTabPress(tab, index)}
                  onLayout={(event) => {
                    const layout = event.nativeEvent.layout;
                    setTabPositions((prev) => {
                      const newPositions = [...prev];
                      newPositions[index] = layout.x;
                      return newPositions;
                    });
                  }}
                  className="mr-2"
                >
                  <View
                    className={`px-4 py-1 rounded-full flex-row items-center ${selectedTab === tab
                      ? 'bg-primary-sage600'
                      : 'bg-background-tertiary'
                      }`}
                  >
                    <Text
                      className={`text-base font-semibold ${selectedTab === tab
                        ? 'text-text-inverse'
                        : 'text-text-secondary'
                        }`}
                    >
                      {tab}
                    </Text>

                    <View
                      className={`ml-1.5 px-1.5 rounded-full min-w-[20px] h-5 items-center justify-center ${selectedTab === tab
                        ? 'bg-white/30'
                        : 'bg-ui-border'
                        }`}
                    >
                      <Text
                        className={`text-xs font-bold ${selectedTab === tab
                          ? 'text-text-inverse'
                          : 'text-text-tertiary'
                          }`}
                      >
                        {count || '0'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <NoInternet onRetry={handleRetryConnection} isChecking={checkingConnection} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <Header
        title="Bucket"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showRightIcon={true}
        containerStyle='flex-row pt-3 py-2 px-4'
        customRightIconComponent={
          <Icon name="bag-add-outline" size={24} color="#333" />
        }
        onRightIconPress={() => navigation.navigate('AddPart')}
      />
      <View className="absolute inset-0 z-50 w-90% pointer-events-none">
        <Toaster />
      </View>

      {/* Search Bar */}
      <View className="px-4 py-0 bg-background-primary">
        <View className={`flex-row items-center bg-background-secondary rounded-xl px-3 py-0 border ${isSearchFocused ? 'border-primary-sage500' : 'border-ui-border'}`}>
          <Icon name="search-outline" size={20} color="#999999" />
          <TextInput
            className="flex-1 ml-2 text-base text-text-primary"
            placeholder="Search by name, ID, type, or price..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && (
          <Text className="text-xs text-text-tertiary mt-1 ml-1">
            Found {filteredProducts.length} result(s)
          </Text>
        )}
      </View>

      {/* Filter Tabs */}
      <View className="py-2 border-b border-ui-border">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-2"
        >
          {TABS.map((tab, index) => {
            const count = getTabCount(tab);
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => handleTabPress(tab, index)}
                onLayout={(event) => {
                  const layout = event.nativeEvent.layout;
                  setTabPositions((prev) => {
                    const newPositions = [...prev];
                    newPositions[index] = layout.x;
                    return newPositions;
                  });
                }}
                className="mr-2"
              >
                <View
                  className={`px-4 py-1 rounded-full flex-row items-center ${selectedTab === tab
                    ? 'bg-primary-sage600'
                    : 'bg-background-tertiary'
                    }`}
                >
                  <Text
                    className={`text-base font-semibold ${selectedTab === tab
                      ? 'text-text-inverse'
                      : 'text-text-secondary'
                      }`}
                  >
                    {tab}
                  </Text>

                  <View
                    className={`ml-1.5 px-1.5 rounded-full min-w-[20px] h-5 items-center justify-center ${selectedTab === tab
                      ? 'bg-white/30'
                      : 'bg-ui-border'
                      }`}
                  >
                    <Text
                      className={`text-xs font-bold ${selectedTab === tab
                        ? 'text-text-inverse'
                        : 'text-text-tertiary'
                        }`}
                    >
                      {count}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Conditional rendering: skeleton or list with swipe gestures and pull to refresh */}
      {isTabLoading && !refreshing ? (
        renderSkeleton()
      ) : (
        <View {...panResponder.panHandlers} style={{ flex: 1 }}>
          <FlatList
            data={filteredProducts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#58A890']}
                tintColor="#58A890"
                title="Pull to refresh"
                titleColor="#58A890"
              />
            }
            ListEmptyComponent={
              <View className="items-center justify-center mt-10">
                <Icon name="search-outline" size={60} color="#CCCCCC" />
                <Text className="text-center text-text-tertiary mt-4">
                  {searchQuery ? 'No items match your search' : 'No items found'}
                </Text>
                {searchQuery && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    className="mt-2 px-4 py-2 bg-primary-sage100 rounded-lg"
                  >
                    <Text className="text-primary-sage700">Clear Search</Text>
                  </TouchableOpacity>
                )}
                {/* Swipe hint */}
                {!searchQuery && products.length === 0 && !isTabLoading && (
                  <View className="mt-8 flex-row items-center">
                    <Icon name="swap-horizontal-outline" size={20} color="#999" />
                    <Text className="text-text-tertiary ml-2">
                      Swipe left/right to change tabs
                    </Text>
                  </View>
                )}
              </View>
            }
          />
        </View>
      )}

      {/* Image Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/80 justify-center items-center"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View className="w-11/12 h-5/6 bg-white rounded-xl overflow-hidden">
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Confirmation Dialog */}
      <DialogBox
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        title={getDialogContent().title}
        size="sm"
        footer={renderConfirmFooter()}
        closeOnBackdropPress={false}
      >
        <View className="items-center py-2">
          <Icon
            name={getDialogContent().icon}
            size={48}
            color={getDialogContent().iconColor}
          />
          <Text className="text-text-primary text-center mt-2">
            {getDialogContent().message}
          </Text>
        </View>
      </DialogBox>
    </SafeAreaView>
  );
};

export default Bucket;