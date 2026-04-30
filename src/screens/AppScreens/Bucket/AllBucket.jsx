import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Clipboard } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { technicianAssignPart } from '../../../lib/api'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../../../context/AuthContext'
import { useBucket } from '../../../context/BucketContext'
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../../NoInternet';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import DialogBox from '../../../components/DilaogBox';
import { partTransferCancel, partTransferReceive } from '../../../lib/api';

const AllBucket = ({ route }) => {
  // Get params from navigation
  const { type: propType } = route?.params || {};
  const { refreshCounts: refreshCountsFromParent } = route?.params || {};
  const { imagUrl, user } = useAuth();
  const { refreshCounts: refreshGlobalCounts } = useBucket();
  const navigation = useNavigation();
  const name = route.name
  console.log("name:", name)

  // Internet connection state
  const [isConnected, setIsConnected] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(false);
  
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [allPartsData, setAllPartsData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [loadingItemId, setLoadingItemId] = useState(null)
  const [imageModalVisible, setImageModalVisible] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')
  const [shouldAutoRefresh, setShouldAutoRefresh] = useState(false)
  const autoRefreshTimerRef = useRef(null)
  const isFirstLoadRef = useRef(true)
  const isFetchingRef = useRef(false)

  // Confirmation dialog state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  // Auto-refresh after error
  useEffect(() => {
    if (shouldAutoRefresh && isConnected) {
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
      }
      
      autoRefreshTimerRef.current = setTimeout(async () => {
        setShouldAutoRefresh(false);
        setRefreshing(true);
        await fetchTechnicianParts(true);
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
  }, [shouldAutoRefresh, isConnected]);

  // Monitor internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  // Initial load only once
  useEffect(() => {
    if (isConnected && isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      fetchTechnicianParts();
    }
  }, [isConnected]);

  const getStatus = () => {
    switch (name) {
      case "AllBucket":
        return "";
      case "market":
        return "market";
      case "technician":
        return "technician";
      case "admin":
        return "admin";
      case "transfer":
        return "transfered";
      case "resive":
        return "received";
      default:
        return "";
    }
  }

  // Filter data when type or allPartsData changes
  useEffect(() => {
    filterDataByType()
  }, [propType, allPartsData])

  const filterDataByType = () => {
    if (!allPartsData.length) return

    let filtered = []

    switch (propType) {
      case 'market':
        filtered = allPartsData.filter(item => item.transfer_by === 'market')
        break
      case 'technician':
        filtered = allPartsData.filter(item => item.transfer_by === 'technician')
        break
      case 'admin':
        filtered = allPartsData.filter(item => item.transfer_by === 'admin')
        break
      case 'transfered':
        filtered = allPartsData.filter(item => item.part_accept === '0' && item.tech_id)
        break
      case 'received':
        filtered = allPartsData.filter(item => item.part_accept === '1')
        break
      case 'all':
      default:
        filtered = allPartsData
        break
    }

    setFilteredData(filtered)
  }

  // Helper function to refresh counts
  const refreshBucketCounts = async () => {
    // Use the global refresh function from context
    if (refreshGlobalCounts) {
      await refreshGlobalCounts();
    }
    // Also call parent refresh if provided
    if (refreshCountsFromParent && typeof refreshCountsFromParent === 'function') {
      await refreshCountsFromParent();
    }
  };

  const fetchTechnicianParts = async (isRefresh = false) => {
    // Prevent multiple simultaneous calls
    if (isFetchingRef.current && !isRefresh) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    // Don't fetch if offline
    if (!isConnected) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      isFetchingRef.current = true;
      
      if (!isRefresh) {
        setLoading(true)
      }
      setError(null)

      const payload = {
        technician_id: user?.id?.toString() || "1",
        transfer_by: getStatus(name),
      }

      console.log('Fetch parts payload:', payload)
      const response = await technicianAssignPart(payload)

      if (response?.data?.success) {
        setAllPartsData(response.data.data)
        
        // Refresh counts after successful fetch
        await refreshBucketCounts();
        
        if (isRefresh) {
          toast.custom(
            <StatusMessage type='success' title='Bucket refreshed successfully' />,
            { duration: 1000 }
          );
        }
      } else {
        setError('Failed to fetch data')
      }
    } catch (err) {
      console.error('Error fetching parts:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
      setRefreshing(false)
      isFetchingRef.current = false
    }
  }

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    if (!isConnected) {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? false);
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    await fetchTechnicianParts(true);
  }, [isConnected]);

  // Refresh data when screen comes into focus - but only if needed
  useFocusEffect(
    useCallback(() => {
      if (isConnected && !isFetchingRef.current && !isFirstLoadRef.current) {
        fetchTechnicianParts();
      }
      return () => {
        // Cleanup if needed
      };
    }, [isConnected])
  );

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
      await fetchTechnicianParts(true);
    } else {
      toast.custom(
        <StatusMessage type='error' title='Still offline. Please check your connection.' />,
        { duration: 2000 }
      );
    }

    setCheckingConnection(false);
  };

  // Helper function to extract error message from backend response
  const getErrorMessage = (error) => {
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

  // Open confirmation dialog
  const openConfirmation = (action, item) => {
    setConfirmAction(action);
    setConfirmItem(item);
    setConfirmVisible(true);
  };

  // Remove item from list
  const removeItem = (itemId) => {
    setAllPartsData(prev => prev.filter(p => p.id !== itemId));
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
          const cancelPayload = {
            part_id: confirmItem.id.toString()
          };

          console.log(`${confirmAction} payload:`, cancelPayload);
          response = await partTransferCancel(cancelPayload);
          console.log(`${confirmAction} response:`, response?.data);

          if (response?.data?.status === 'success' || response?.data?.success) {
            successMessage = response?.data?.msg ||
              (confirmAction === 'cancelTransfer'
                ? `Transfer cancelled successfully`
                : `Received item rejected successfully`);
            removeItem(confirmItem.id);
            await fetchTechnicianParts(true);
          } else {
            throw new Error(response?.data?.msg || 'Failed to cancel');
          }
          break;

        case 'acceptReceived':
          const acceptPayload = {
            technician_id: user?.id?.toString() || "1",
            part_id: confirmItem.id.toString()
          };

          console.log('Accept transfer payload:', acceptPayload);
          response = await partTransferReceive(acceptPayload);
          console.log('Accept transfer response:', response?.data);

          if (response?.data?.status === 'success' || response?.data?.success) {
            successMessage = response?.data?.msg || `Part accepted successfully`;
            removeItem(confirmItem.id);
            await fetchTechnicianParts(true);
          } else {
            throw new Error(response?.data?.msg || 'Failed to accept transfer');
          }
          break;

        default:
          successMessage = 'Action completed';
      }

      if (successMessage) {
        toast.custom(<StatusMessage type='success' title={successMessage} />);
      }

    } catch (error) {
      console.log(`${confirmAction} error:`, error);
      
      const errorMessage = getErrorMessage(error);
      
      toast.custom(
        <StatusMessage type='error' title={errorMessage} />
      );
      
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
          className="px-4 py-2 rounded-lg bg-gray-100 flex-row items-center"
        >
          <Icon name="close-outline" size={18} color="#666" />
          <Text className="text-gray-600 font-medium ml-1">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirmed}
          className={`px-4 py-2 rounded-lg flex-row items-center ${isDestructive ? 'bg-red-500' :
            confirmAction === 'acceptReceived' ? 'bg-green-600' :
              'bg-teal-600'
            }`}
        >
          <Icon name="checkmark-outline" size={18} color="#fff" />
          <Text className="text-white font-medium ml-1">Confirm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Show toast/message
  const showToast = (title, message, type = 'info') => {
    toast.custom(
      <StatusMessage type={type} title={title} message={message} />,
      { duration: 1000 }
    );
  };

  // Check if item should be disabled (not pressable)
  const isItemDisabled = (item) => {
    // For Transferred tab - items are not disabled (they have Cancel button)
    if (propType === 'transfered') return false;
    
    // For Received tab - items are not disabled (they have Accept/Reject buttons)
    if (propType === 'received') return false;
    
    // For all other tabs (All, Market, Technician, Admin)
    // Disable if part_accept is '0' (part is transferred)
    return item?.part_accept == 0;
  };

  // Handle card press with navigation
  const handleCardPress = (item) => {
    if (!isConnected) {
      toast.custom(
        <StatusMessage type='warning' title='No Internet Connection' message='Please check your connection' />,
        { duration: 1500 }
      );
      return;
    }

    // Check if item is disabled (transferred part)
    if (isItemDisabled(item)) {
      toast.custom(
        <StatusMessage 
          type='warning' 
          title='Information' 
          message={`This part is transferred to ${item.technician_name || 'technician'}. Please cancel first to use.`} 
        />,
        { duration: 1500 }
      );
      return;
    }

    console.log('Card pressed:', item);
    // Navigate to details screen
    navigation.navigate('BuckePartDetails', { item });
  };

  // Open image modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(getImageUrl(imageUrl, imagUrl))
    setImageModalVisible(true)
  }

  const getImageUrl = (imagePath, baseUrl) => {
    if (!imagePath) return null;

    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const base = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${base}${cleanPath}`;
  };

  // Get the current tab type for display
  const getTabType = () => {
    switch (propType) {
      case 'market': return 'Market'
      case 'technician': return 'Technician'
      case 'admin': return 'Admin'
      case 'transfered': return 'Transfer'
      case 'received': return 'Receive'
      default: return 'All'
    }
  }

  // Render each item
  const renderItem = ({ item }) => {
    const isLoading = loadingItemId === item.id;
    const isTransferredTab = propType === 'transfered';
    const isReceivedTab = propType === 'received';
    const disabled = isItemDisabled(item);

    // Handle QR code icon click
    const handleQrCodePress = () => {
      if (item.qr_code) {
        Clipboard.setString(item.qr_code);
        showToast(
          'QR Code Copied!',
          `QR Code: ${item.qr_code}`,
          'info'
        );
      } else {
        showToast(
          'Information',
          'No QR code available for this item',
          'warning'
        );
      }
    };

    return (
      <View
        className={`border ${disabled && 'opacity-50'} bg-white border-gray-300 rounded-2xl p-4 mb-3 mx-4`}
      >
        {/* Main card content (pressable) */}
        <TouchableOpacity
          disabled={disabled}
          onPress={() => handleCardPress(item)} 
          className="flex-row items-center justify-between"
        >
          {/* Left side: image + text */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => openImageModal(item.part_image)}>
              <View className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                {item.part_image ? (
                  <Image
                    source={{ uri: getImageUrl(item.imageUrl || item.part_image, imagUrl) }}
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
                <Text className={`text-lg font-bold ${disabled ? 'text-gray-500' : 'text-gray-800'} flex-1`}>
                  {item.part_name}
                </Text>
              </View>
              <Text className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'} capitalize`}>
                {item.transfer_by}
              </Text>

              {/* QR Code Icon */}
              <View className="flex-row items-center mt-1">
                <Text className={`font-normal text-xs ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                  QR code: {item.qr_code || 'N/A'}
                </Text>
                <TouchableOpacity
                  onPress={handleQrCodePress}
                  className="ml-2 p-1"
                >
                  <Icon name="copy-outline" size={16} color="#58A890" />
                </TouchableOpacity>
              </View>

              {item.description && item.description !== '0' ? (
                <Text className={`text-xs w-40 ${disabled ? 'text-gray-400' : 'text-gray-500'} mt-1`} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}

              {(propType === 'transfered' || propType === 'received') && item.technician_name && (
                <Text className="text-xs text-blue-500 mt-1">
                  {propType === 'received'
                    ? `Received From: ${item.technician_name}`
                    : `Transferred To: ${item.technician_name}`}
                </Text>
              )}
            </View>
          </View>

          {/* Right side: price */}
          <View className='flex-col items-end'>
            <Text className={`text-xl font-extrabold ${disabled ? 'text-gray-400' : 'text-green-600'}`}>
              ₹{item.part_price}
            </Text>

            {/* Conditional buttons for Transfer tab */}
            {isTransferredTab && item.part_accept === '0' && (
              <View className="mt-3 flex-row justify-end">
                <TouchableOpacity
                  onPress={() => openConfirmation('cancelTransfer', item)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-gray-400' : 'bg-red-500'}`}
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

        {/* Conditional buttons for Receive tab */}
        {isReceivedTab && item.part_accept !== '1' && (
          <View className="mt-3 flex-row justify-end space-x-2 gap-4">
            {/* Reject button */}
            <TouchableOpacity
              onPress={() => openConfirmation('cancelReceived', item)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-gray-400' : 'bg-red-500'}`}
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
              className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-gray-400' : 'bg-green-600'}`}
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

  // If offline, show NoInternet screen
  if (!isConnected && !loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <NoInternet onRetry={handleRetryConnection} isChecking={checkingConnection} />
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-4 text-gray-600 text-base">Loading parts...</Text>
      </View>
    )
  }

  // Error state
  if (error && isConnected) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-500 text-base text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={() => fetchTechnicianParts()}
          className="bg-teal-600 px-6 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Empty state
  if (filteredData.length === 0 && !loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Icon name="folder-open-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-500 text-base text-center mt-4">
          No {getTabType().toLowerCase()} parts found
        </Text>
        {!isConnected && (
          <TouchableOpacity
            onPress={handleRetryConnection}
            className="mt-4 bg-teal-600 px-6 py-2 rounded-lg"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  // Main render
  return (
    <View className="flex-1 bg-gray-50">
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
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
      />

      {/* Image Modal */}
      <TouchableOpacity
        visible={imageModalVisible}
        activeOpacity={1}
        onPress={() => setImageModalVisible(false)}
        className={`${imageModalVisible ? 'flex' : 'hidden'} absolute inset-0 bg-black/80 justify-center items-center z-50`}
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
          <Text className="text-gray-800 text-center mt-2">
            {getDialogContent().message}
          </Text>
        </View>
      </DialogBox>
    </View>
  )
}

export default AllBucket