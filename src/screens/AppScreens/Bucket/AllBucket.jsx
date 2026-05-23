import { View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity, RefreshControl, TextInput } from 'react-native'
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Clipboard } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { technicianAssignPart } from '../../../lib/api'
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native'
import { useAuth } from '../../../context/AuthContext'
import { useBucket } from '../../../context/BucketContext'
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../../NoInternet';
import DialogBox from '../../../components/DilaogBox';
import Dialog from '../../../components/Dialog';
import { partTransferCancel, partTransferReceive } from '../../../lib/api';

const AllBucket = ({ route }) => {
  // Get params from navigation
  const { type: propType } = route?.params || {};
  const { imagUrl, user } = useAuth();
  const { refreshCounts: refreshGlobalCounts } = useBucket();
  const navigation = useNavigation();
  const name = route.name;
  console.log("name:", name);

  // Internet connection state
  const [isConnected, setIsConnected] = useState(true);
  const [checkingConnection, setCheckingConnection] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [allPartsData, setAllPartsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [shouldAutoRefresh, setShouldAutoRefresh] = useState(false);
  const autoRefreshTimerRef = useRef(null);
  const isFirstLoadRef = useRef(true);
  const isFetchingRef = useRef(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Confirmation dialog state (existing DialogBox)
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  // Dialog for non‑confirmation messages
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState('info');
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogDescription, setDialogDescription] = useState('');
  const [dialogIconName, setDialogIconName] = useState('');
  const [dialogIconColor, setDialogIconColor] = useState('');

  const showDialog = (type, title, description, iconName = '', iconColor = '') => {
    setDialogType(type);
    setDialogTitle(title);
    setDialogDescription(description);
    if (iconName) setDialogIconName(iconName);
    if (iconColor) setDialogIconColor(iconColor);
    setDialogVisible(true);
  };

  // Filtered data based on search query
  const searchedData = useMemo(() => {
    if (!searchQuery.trim()) return filteredData;
    const query = searchQuery.toLowerCase().trim();
    return filteredData.filter(item =>
      item.part_name?.toLowerCase().includes(query) ||
      item.id?.toString().toLowerCase().includes(query) ||
      item.transfer_by?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query) ||
      item.part_price?.toString().includes(query) ||
      item.qr_code?.toLowerCase().includes(query)
    );
  }, [filteredData, searchQuery]);

  // Auto‑refresh after error
  useEffect(() => {
    if (shouldAutoRefresh && isConnected) {
      if (autoRefreshTimerRef.current) clearTimeout(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = setTimeout(async () => {
        setShouldAutoRefresh(false);
        setRefreshing(true);
        await fetchTechnicianParts(true);
        setRefreshing(false);
      }, 2000);
    }
    return () => {
      if (autoRefreshTimerRef.current) clearTimeout(autoRefreshTimerRef.current);
    };
  }, [shouldAutoRefresh, isConnected]);

  // Monitor internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  const fetchTechnicianParts = useCallback(async (isRefresh = false) => {
    if (isFetchingRef.current && !isRefresh) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    if (!isConnected) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      isFetchingRef.current = true;
      if (!isRefresh) setLoading(true);
      setError(null);

      const payload = {
        technician_id: user?.id?.toString() || "1",
        transfer_by: getStatus(name),
      };
      console.log('Fetch parts payload:', payload);
      const response = await technicianAssignPart(payload);

      if (response?.data?.success) {
        setAllPartsData(response.data.data);
        setSearchQuery('');
        if (refreshGlobalCounts) await refreshGlobalCounts();
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [user?.id, name, isConnected, refreshGlobalCounts]);

  // Initial load only once
  useEffect(() => {
    if (isConnected && isFirstLoadRef.current) {
      isFirstLoadRef.current = false;
      fetchTechnicianParts();
    }
  }, [isConnected, fetchTechnicianParts]);

  // Filter data when propType or allPartsData changes
  useEffect(() => {
    filterDataByType();
  }, [propType, allPartsData]);

  const filterDataByType = () => {
    if (!allPartsData.length) {
      setFilteredData([]);
      return;
    }
    let filtered = [];
    switch (propType) {
      case 'market': filtered = allPartsData.filter(item => item.transfer_by === 'market'); break;
      case 'technician': filtered = allPartsData.filter(item => item.transfer_by === 'technician'); break;
      case 'admin': filtered = allPartsData.filter(item => item.transfer_by === 'admin'); break;
      case 'transfered': filtered = allPartsData.filter(item => item.part_accept === '0' && item.tech_id); break;
      case 'received': filtered = allPartsData.filter(item => item.part_accept === '0'); break;
      default: filtered = allPartsData;
    }
    setFilteredData(filtered);
  };

  const onRefresh = useCallback(() => {
    if (!isConnected) {
      NetInfo.fetch().then(state => setIsConnected(state.isConnected ?? false));
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    fetchTechnicianParts(true);
  }, [isConnected, fetchTechnicianParts]);

  useFocusEffect(
    useCallback(() => {
      if (isConnected && !isFetchingRef.current && !isFirstLoadRef.current) {
        fetchTechnicianParts();
      }
      return () => { };
    }, [isConnected, fetchTechnicianParts])
  );

  const getStatus = () => {
    switch (name) {
      case "AllBucket": return "";
      case "market": return "market";
      case "technician": return "technician";
      case "admin": return "admin";
      case "transfer": return "transfered";
      case "resive": return "received";
      default: return "";
    }
  };

  const getErrorMessage = (error) => {
    if (error?.response?.data?.msg) return error.response.data.msg;
    if (error?.response?.data?.message) return error.response.data.message;
    if (error?.msg) return error.msg;
    if (error?.message) return error.message;
    if (typeof error === 'string') return error;
    return 'Action failed. Please try again.';
  };

  const openConfirmation = (action, item) => {
    setConfirmAction(action);
    setConfirmItem(item);
    setConfirmVisible(true);
  };

  const removeItem = (itemId) => {
    setAllPartsData(prev => prev.filter(p => p.id !== itemId));
  };

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
          const cancelPayload = { part_id: confirmItem.id.toString() };
          console.log(`${confirmAction} payload:`, cancelPayload);
          response = await partTransferCancel(cancelPayload);
          if (response?.data?.status === 'success' || response?.data?.success) {
            successMessage = response?.data?.msg || (confirmAction === 'cancelTransfer' ? 'Transfer cancelled' : 'Rejected');
            removeItem(confirmItem.id);
            await fetchTechnicianParts(true);
          } else throw new Error(response?.data?.msg || 'Failed to cancel');
          break;
        case 'acceptReceived':
          const acceptPayload = { technician_id: user?.id?.toString() || "1", part_id: confirmItem.id.toString() };
          response = await partTransferReceive(acceptPayload);
          if (response?.data?.status === 'success' || response?.data?.success) {
            successMessage = response?.data?.msg || 'Part accepted';
            removeItem(confirmItem.id);
            await fetchTechnicianParts(true);
          } else throw new Error(response?.data?.msg || 'Failed to accept');
          break;
        default: successMessage = 'Action completed';
      }
      if (successMessage) {
        showDialog('success', 'Success', successMessage);
      }
    } catch (error) {
      console.log(`${confirmAction} error:`, error);
      const errMsg = getErrorMessage(error);
      showDialog('error', 'Error', errMsg);
      setShouldAutoRefresh(true);
    } finally {
      setLoadingItemId(null);
      setConfirmItem(null);
      setConfirmAction(null);
    }
  };

  const getDialogContent = () => {
    switch (confirmAction) {
      case 'cancelTransfer': return { title: 'Cancel Transfer', icon: 'close-circle-outline', iconColor: '#E86F6F', message: 'Are you sure you want to cancel this transfer?' };
      case 'acceptReceived': return { title: 'Accept Transfer', icon: 'checkmark-circle-outline', iconColor: '#58A890', message: 'Are you sure you want to accept this transfer?' };
      case 'cancelReceived': return { title: 'Reject Transfer', icon: 'close-circle-outline', iconColor: '#E86F6F', message: 'Are you sure you want to reject this received item?' };
      default: return { title: 'Confirm Action', icon: 'help-circle-outline', iconColor: '#666', message: 'Are you sure?' };
    }
  };

  const renderConfirmFooter = () => {
    const isDestructive = confirmAction?.includes('cancel');
    return (
      <View className="flex-row justify-end space-x-2 gap-4">
        <TouchableOpacity onPress={() => setConfirmVisible(false)} className="px-4 py-2 rounded-lg bg-gray-100 flex-row items-center">
          <Icon name="close-outline" size={18} color="#666" />
          <Text className="text-gray-600 font-medium ml-1">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleConfirmed} className={`px-4 py-2 rounded-lg flex-row items-center ${isDestructive ? 'bg-red-500' : confirmAction === 'acceptReceived' ? 'bg-green-600' : 'bg-teal-600'}`}>
          <Icon name="checkmark-outline" size={18} color="#fff" />
          <Text className="text-white font-medium ml-1">Confirm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const isItemDisabled = (item) => {
    if (propType === 'transfered' || propType === 'received') return false;
    return item?.part_accept == 0;
  };

  // ✅ MODIFIED: No navigation for transfer or receive tabs
  const handleCardPress = (item) => {
    // Do not navigate if the current tab is 'transfered' (Transfer) or 'received' (Receive)
    if (propType === 'transfered' || propType === 'received') {
      // Silently ignore – no navigation, no dialog
      return;
    }

    if (!isConnected) {
      showDialog('warning', 'No Internet Connection', 'Please check your connection');
      return;
    }
    if (isItemDisabled(item)) {
      showDialog('warning', 'Information', `This part is transferred to ${item.technician_name || 'technician'}. Please cancel first to use.`);
      return;
    }
    navigation.navigate('BuckePartDetails', { item });
  };

  const openImageModal = (imageUrl) => {
    setSelectedImage(getImageUrl(imageUrl, imagUrl));
    setImageModalVisible(true);
  };

  const getImageUrl = (imagePath, baseUrl) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const base = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${base}${cleanPath}`;
  };

  const getTabType = () => {
    switch (propType) {
      case 'market': return 'Market';
      case 'technician': return 'Technician';
      case 'admin': return 'Admin';
      case 'transfered': return 'Transfer';
      case 'received': return 'Receive';
      default: return 'All';
    }
  };

  const renderItem = ({ item }) => {
    const isLoading = loadingItemId === item.id;
    const isTransferredTab = propType === 'transfered';
    const isReceivedTab = propType === 'received';
    const disabled = isItemDisabled(item);

    const handleQrCodePress = () => {
      if (item.qr_code) {
        Clipboard.setString(item.qr_code);
        showDialog('info', 'QR Code Copied!', `QR Code: ${item.qr_code}`);
      } else {
        showDialog('warning', 'Information', 'No QR code available');
      }
    };

    return (
      <View className={`border ${disabled && 'opacity-50'} bg-white border-gray-300 rounded-2xl p-4 mb-3 mx-4`}>
        <TouchableOpacity disabled={disabled} onPress={() => handleCardPress(item)} className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => openImageModal(item.part_image)}>
              <View className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                {item.part_image ? (
                  <Image source={{ uri: getImageUrl(item.imageUrl || item.part_image, imagUrl) }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center"><Icon name="image-outline" size={30} color="#999" /></View>
                )}
              </View>
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <View className="flex-row items-center">
                <Text className={`text-lg font-bold ${disabled ? 'text-gray-500' : 'text-gray-800'} flex-1`}>{item.part_name}</Text>
              </View>
              <Text className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'} capitalize`}>{item.transfer_by}</Text>
              <View className="flex-row items-center mt-1">
                <Text className={`font-normal text-xs ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>QR code: {item.qr_code || 'N/A'}</Text>
                <TouchableOpacity onPress={handleQrCodePress} className="ml-2 p-1"><Icon name="copy-outline" size={16} color="#58A890" /></TouchableOpacity>
              </View>
              {item.description && item.description !== '0' && (
                <Text className={`text-xs w-40 ${disabled ? 'text-gray-400' : 'text-gray-500'} mt-1`} numberOfLines={2}>{item.description}</Text>
              )}
              {(propType === 'transfered' || propType === 'received') && item.technician_name && (
                <Text className="text-xs text-blue-500 mt-1">
                  {propType === 'received' ? `Received From: ${item.technician_name}` : `Transferred To: ${item.technician_name}`}
                </Text>
              )}
            </View>
          </View>
          <View className='flex-col items-end'>
            <Text className={`text-xl font-extrabold ${disabled ? 'text-gray-400' : 'text-green-600'}`}>₹{item.part_price}</Text>
            {isTransferredTab && item.part_accept === '0' && (
              <View className="mt-3 flex-row justify-end">
                <TouchableOpacity onPress={() => openConfirmation('cancelTransfer', item)} disabled={isLoading} className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-gray-400' : 'bg-red-500'}`}>
                  {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <><Icon name="close-circle-outline" size={18} color="#fff" /><Text className="text-white font-medium ml-1">Cancel</Text></>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
        {isReceivedTab && item.part_accept !== '1' && (
          <View className="mt-3 flex-row justify-end space-x-2 gap-4">
            <TouchableOpacity onPress={() => openConfirmation('cancelReceived', item)} disabled={isLoading} className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-gray-400' : 'bg-red-500'}`}>
              {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <><Icon name="close-circle-outline" size={18} color="#fff" /><Text className="text-white font-medium ml-1">Reject</Text></>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => openConfirmation('acceptReceived', item)} disabled={isLoading} className={`px-4 py-2 rounded-lg flex-row items-center ${isLoading ? 'bg-gray-400' : 'bg-green-600'}`}>
              {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <><Icon name="checkmark-circle-outline" size={18} color="#fff" /><Text className="text-white font-medium ml-1">Accept</Text></>}
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderSearchBar = () => (
    <View className="px-4 py-2 bg-gray-50">
      <View className={`flex-row items-center bg-white rounded-2xl px-3 py-0 border ${isSearchFocused ? 'border-teal-500' : 'border-gray-300'}`}>
        <Icon name="search-outline" size={20} color="#999" />
        <TextInput className="flex-1 ml-2 text-base text-gray-800" placeholder="Search by name, ID, type, price, or QR code..." placeholderTextColor="#999" value={searchQuery} onChangeText={setSearchQuery} onFocus={() => setIsSearchFocused(true)} onBlur={() => setIsSearchFocused(false)} />
        {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Icon name="close-circle" size={20} color="#999" /></TouchableOpacity>}
      </View>
      {searchQuery.length > 0 && <Text className="text-xs text-gray-500 mt-1 ml-1">Found {searchedData.length} result(s) for "{searchQuery}"</Text>}
    </View>
  );

  if (!isConnected && !loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <NoInternet onRetry={async () => { 
          setCheckingConnection(true); 
          await new Promise(r => setTimeout(r, 2000)); 
          const state = await NetInfo.fetch(); 
          if (state.isConnected) { 
            setIsConnected(true); 
            fetchTechnicianParts(true); 
          } else {
            showDialog('error', 'Still offline', 'Please check your connection');
          }
          setCheckingConnection(false); 
        }} isChecking={checkingConnection} />
      </View>
    );
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="mt-4 text-gray-600 text-base">Loading parts...</Text>
      </View>
    );
  }

  if (error && isConnected) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-4">
        <Text className="text-red-500 text-base text-center mb-4">{error}</Text>
        <TouchableOpacity onPress={() => fetchTechnicianParts()} className="bg-teal-600 px-6 py-2 rounded-lg"><Text className="text-white font-semibold">Retry</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {renderSearchBar()}
      <FlatList
        data={searchedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#58A890']} tintColor="#58A890" title="Pull to refresh" titleColor="#58A890" />}
        ListEmptyComponent={
          !loading && !refreshing ? (
            searchQuery.length > 0 ? (
              <View className="items-center justify-center py-10">
                <Icon name="search-outline" size={60} color="#CCCCCC" />
                <Text className="text-center text-gray-500 mt-4">No items match your search</Text>
                <TouchableOpacity onPress={() => setSearchQuery('')} className="mt-4 px-4 py-2 bg-teal-100 rounded-lg">
                  <Text className="text-teal-700 font-medium">Clear Search</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="items-center justify-center py-10">
                <Icon name="cube-outline" size={60} color="#CCCCCC" />
                <Text className="text-center text-gray-500 mt-4">No parts found</Text>
                <Text className="text-center text-gray-400 text-sm mt-2">Pull to refresh or check back later</Text>
              </View>
            )
          ) : null
        }
      />
      {/* Image Modal */}
      {imageModalVisible && (
        <TouchableOpacity activeOpacity={1} onPress={() => setImageModalVisible(false)} className="absolute inset-0 bg-black/80 justify-center items-center z-50">
          <View className="w-11/12 h-5/6 bg-white rounded-xl overflow-hidden">
            {selectedImage && <Image source={{ uri: selectedImage }} className="w-full h-full" resizeMode="contain" />}
          </View>
        </TouchableOpacity>
      )}
      {/* Confirmation Dialog (existing DialogBox) */}
      <DialogBox visible={confirmVisible} onClose={() => setConfirmVisible(false)} title={getDialogContent().title} size="sm" footer={renderConfirmFooter()} closeOnBackdropPress={false}>
        <View className="items-center py-2">
          <Icon name={getDialogContent().icon} size={48} color={getDialogContent().iconColor} />
          <Text className="text-gray-800 text-center mt-2">{getDialogContent().message}</Text>
        </View>
      </DialogBox>

      {/* Dialog for all non‑confirmation messages */}
      <Dialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        type={dialogType}
        title={dialogTitle}
        description={dialogDescription}
        iconName={dialogIconName}
        iconColor={dialogIconColor}
        confirmText="OK"
        showCancelButton={false}
      />
    </View>
  );
};

export default AllBucket;