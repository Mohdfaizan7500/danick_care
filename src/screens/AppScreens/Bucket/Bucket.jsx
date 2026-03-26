import { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast } from 'sonner-native';
import DialogBox from '../../../components/DilaogBox';
import { useAuth } from '../../../context/AuthContext';
import { technicianAssignPart } from '../../../lib/api';

// Tabs
const TABS = ['All', 'Partner', 'Market', 'Service Center', 'Transferred', 'Received'];

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
  const [selectedTab, setSelectedTab] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tabPositions, setTabPositions] = useState([]);
  const scrollViewRef = useRef(null);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [products, setProducts] = useState([]);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const tabTimeoutRef = useRef(null);
  const { user, imagUrl } = useAuth();
  const technician_id = user?.id;

  // Map tab to transfer_by parameter
  const getTransferByParam = (tab) => {
    switch (tab) {
      case 'All':
        return '';
      case 'Partner':
        return 'technician';
      case 'Market':
        return 'market';
      case 'Service Center':
        return 'admin';

      case 'Transferred':
        return 'technician';
      case 'Received':
        return 'technician';
      default:
        return '';
    }
  };

  const fetchParts = async (transfer_by) => {
    try {
      setIsTabLoading(true);
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
          item.transfer_by === 'partner' ? 'Partner' :
            item.transfer_by === 'admin' ? 'Service Center' :
              item.transfer_by === 'replace' ? 'Replace' : 'Unknown',
        price: item.part_price,
        imageUrl: item.part_image ? imagUrl + item.part_image : 'https://via.placeholder.com/100',
        parentType: item.transfer_by,
        addedDate: item.created_at || new Date().toLocaleDateString(),
        description: item.description,
        transferStatus: item.transfer_status,
        transferId: item.transfer_id,
        toPartner: item.to_partner,
        fromPartner: item.from_partner,
        ...item
      })) : [];

      setProducts(formattedProducts);
    } catch (error) {
      console.log('fetch part error:', error);
      console.error('fetch part error:', error);
      toast.error('Failed to load items');
      setProducts([]);
    } finally {
      setIsTabLoading(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
    };
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    const transferBy = getTransferByParam(selectedTab);
    fetchParts(transferBy);
  }, [selectedTab]);

  // Confirmation dialog state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);

  // Filter products based on selected tab (additional client-side filtering if needed)
  const filteredProducts = products;

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const handleTabPress = (tab, index) => {
    setSelectedTab(tab);

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
    navigation.navigate('BucketpartDetails', { item });
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

  // Handle confirmed action
  const handleConfirmed = () => {
    setConfirmVisible(false);
    if (!confirmItem || !confirmAction) return;

    setLoadingItemId(confirmItem.id);
    setTimeout(() => {
      setLoadingItemId(null);
      const actionMessages = {
        cancelTransfer: `Transfer ${confirmItem.transferId} cancelled`,
        acceptReceived: `Transfer ${confirmItem.transferId} accepted`,
        cancelReceived: `Transfer ${confirmItem.transferId} rejected`,
        add: `${confirmItem.name} added to bucket`,
      };
      toast.success(actionMessages[confirmAction] || 'Action completed');

      // Remove item from list after any transfer action
      if (confirmAction.startsWith('cancel') || confirmAction === 'acceptReceived') {
        removeItem(confirmItem.id);
      }

      setConfirmItem(null);
      setConfirmAction(null);
    }, 1500);
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

  const renderItem = ({ item }) => {
    const isLoading = loadingItemId === item.id;
    const isTransferredTab = selectedTab === 'Transferred';
    const isReceivedTab = selectedTab === 'Received';

    return (
      <View className="bg-white border border-gray-300 rounded-2xl p-4 mb-3">
        {/* Main card content (pressable) */}
        <TouchableOpacity onPress={() => handleCardPress(item)} className="flex-row items-center justify-between">
          {/* Left side: image + text */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => openImageModal(item.imageUrl)}>
              <View className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                <Image
                  source={{ uri: item.imageUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-text-primary">{item.name}</Text>
              <Text className="text-sm text-text-tertiary">{item.parentName}</Text>
              {item.description ? (
                <Text className="text-xs text-text-tertiary mt-1" numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              {item.transferStatus && (
                <Text className="text-xs text-ui-info mt-1">
                  {item.transferStatus === 'sent' ? `To: ${item.toPartner}` : `From: ${item.fromPartner}`}
                </Text>
              )}
            </View>
          </View>

          {/* Right side: price */}
          <Text className="text-xl font-extrabold text-ui-success">
            ₹{item.price}
          </Text>
        </TouchableOpacity>

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
                  <Text className="text-white font-medium ml-1">Cancel</Text>
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

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <Header
        title="Bucket"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showRightIcon={true}
        customRightIconComponent={
          <Icon name="bag-add-outline" size={24} color="#333" />
        }
        onRightIconPress={() => navigation.navigate('AddPart')}
      />

      {/* Filter Tabs */}
      <View className="py-2 border-b border-ui-border">
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-2"
        >
          {TABS.map((tab, index) => (
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
              <Text
                className={`text-base px-4 py-1 rounded-full font-semibold ${selectedTab === tab
                  ? 'bg-primary-sage600 text-text-inverse'
                  : 'bg-background-tertiary text-text-secondary'
                  }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Conditional rendering: skeleton or list */}
      {isTabLoading ? (
        renderSkeleton()
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text className="text-center text-text-tertiary mt-10">
              No items found
            </Text>
          }
        />
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