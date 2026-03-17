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

// Tabs
const TABS = ['All', 'Partner', 'Market', 'Service Center', 'Replace', 'Transferred', 'Received'];

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

// Initial data (unchanged)

const INITIAL_PRODUCTS = [
  // Partner items
  { id: '1', partNumber: 'PN001', name: 'Fan Blade', parentName: 'ElectroMart', price: 299, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ092ZmyiurfyPE6lukBRbrmFWDGyXjmLtaeQ&s', parentType: 'Partner', addedDate: '15/03/2025', partnerId: 'P1001' },
  { id: '2', partNumber: 'PN002', name: 'LED Bulb', parentName: 'LightHouse', price: 149, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7VCVioPAz2HhNdIIPRCQAUknUPOUwt9bQfA&s', parentType: 'Partner', addedDate: '14/03/2025', partnerId: 'P1002' },
  { id: '3', partNumber: 'PN003', name: 'Washing Machine', parentName: 'CleanTech', price: 18999, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr1PSO-E2_GRxQyTNXpJpe0H5sOp-DsNxJ-Q&s', parentType: 'Partner', addedDate: '13/03/2025', partnerId: 'P1003' },
  { id: '4', partNumber: 'PN004', name: 'Mobile Screen', parentName: 'PhoneFix', price: 3500, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3QUvHKfLajkDzou6GVlHCT7u2OygNuaLQHw&s', parentType: 'Partner', addedDate: '12/03/2025', partnerId: 'P1004' },
  { id: '5', partNumber: 'PN005', name: 'Air Conditioner', parentName: 'CoolTech', price: 32000, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW0SXO2EQqvMvSOfy1cEh2OQICuCY_27TOqg&s', parentType: 'Partner', addedDate: '11/03/2025', partnerId: 'P1005' },
  // Market items
  { id: '6', partNumber: 'PN006', name: 'Organic Rice', parentName: 'FreshMart', price: 120, imageUrl: 'https://picsum.photos/id/100/100/100', parentType: 'Market', addedDate: '10/03/2025' },
  { id: '7', partNumber: 'PN007', name: 'Milk', parentName: 'DairyFarm', price: 60, imageUrl: 'https://picsum.photos/id/101/100/100', parentType: 'Market', addedDate: '09/03/2025' },
  { id: '8', partNumber: 'PN008', name: 'Eggs', parentName: 'FarmFresh', price: 80, imageUrl: 'https://picsum.photos/id/102/100/100', parentType: 'Market', addedDate: '08/03/2025' },
  { id: '9', partNumber: 'PN009', name: 'Bread', parentName: 'BakeryHouse', price: 40, imageUrl: 'https://picsum.photos/id/103/100/100', parentType: 'Market', addedDate: '07/03/2025' },
  { id: '10', partNumber: 'PN010', name: 'Cooking Oil', parentName: 'OilMart', price: 150, imageUrl: 'https://picsum.photos/id/104/100/100', parentType: 'Market', addedDate: '06/03/2025' },
  // Service Center items
  { id: '11', partNumber: 'PN011', name: 'AC Service', parentName: 'CoolCare', price: 499, imageUrl: 'https://picsum.photos/id/105/100/100', parentType: 'Service Center', addedDate: '05/03/2025' },
  { id: '12', partNumber: 'PN012', name: 'Plumbing', parentName: 'PipeFix', price: 299, imageUrl: 'https://picsum.photos/id/106/100/100', parentType: 'Service Center', addedDate: '04/03/2025' },
  { id: '13', partNumber: 'PN013', name: 'Electrical Repair', parentName: 'SparkTech', price: 399, imageUrl: 'https://picsum.photos/id/107/100/100', parentType: 'Service Center', addedDate: '03/03/2025' },
  { id: '14', partNumber: 'PN014', name: 'Pest Control', parentName: 'PestFree', price: 799, imageUrl: 'https://picsum.photos/id/108/100/100', parentType: 'Service Center', addedDate: '02/03/2025' },
  { id: '15', partNumber: 'PN015', name: 'Cleaning Service', parentName: 'ShineHome', price: 249, imageUrl: 'https://picsum.photos/id/109/100/100', parentType: 'Service Center', addedDate: '01/03/2025' },
  // Replace items
  { id: '16', partNumber: 'PN016', name: 'Battery', parentName: 'PowerUp', price: 1200, imageUrl: 'https://picsum.photos/id/110/100/100', parentType: 'Replace', addedDate: '28/02/2025' },
  { id: '17', partNumber: 'PN017', name: 'Tyre', parentName: 'WheelWorld', price: 3500, imageUrl: 'https://picsum.photos/id/111/100/100', parentType: 'Replace', addedDate: '27/02/2025' },
  { id: '18', partNumber: 'PN018', name: 'Phone Battery', parentName: 'CellFix', price: 1500, imageUrl: 'https://picsum.photos/id/112/100/100', parentType: 'Replace', addedDate: '26/02/2025' },
  { id: '19', partNumber: 'PN019', name: 'Laptop Keyboard', parentName: 'TechRepair', price: 2200, imageUrl: 'https://picsum.photos/id/113/100/100', parentType: 'Replace', addedDate: '25/02/2025' },
  { id: '20', partNumber: 'PN020', name: 'Water Purifier Filter', parentName: 'AquaPure', price: 800, imageUrl: 'https://picsum.photos/id/114/100/100', parentType: 'Replace', addedDate: '24/02/2025' },
  // Transferred items (sent)
  { id: '21', partNumber: 'PN021', name: 'Smart Bulb', parentName: 'LightHouse', price: 199, imageUrl: 'https://picsum.photos/id/115/100/100', parentType: 'Partner', addedDate: '20/03/2025', transferStatus: 'sent', transferId: 'TR001', toPartner: 'TechZone' },
  { id: '22', partNumber: 'PN022', name: 'Router', parentName: 'NetGear', price: 1299, imageUrl: 'https://picsum.photos/id/116/100/100', parentType: 'Partner', addedDate: '19/03/2025', transferStatus: 'sent', transferId: 'TR002', toPartner: 'ConnectPlus' },
  { id: '23', partNumber: 'PN023', name: 'Power Bank', parentName: 'ChargePro', price: 899, imageUrl: 'https://picsum.photos/id/117/100/100', parentType: 'Partner', addedDate: '18/03/2025', transferStatus: 'sent', transferId: 'TR003', toPartner: 'MobileHub' },
  // Received items
  { id: '24', partNumber: 'PN024', name: 'HDMI Cable', parentName: 'CableWorld', price: 299, imageUrl: 'https://picsum.photos/id/118/100/100', parentType: 'Partner', addedDate: '17/03/2025', transferStatus: 'received', transferId: 'TR004', fromPartner: 'ElectroMart' },
  { id: '25', partNumber: 'PN025', name: 'Mouse', parentName: 'Peripherals', price: 399, imageUrl: 'https://picsum.photos/id/119/100/100', parentType: 'Partner', addedDate: '16/03/2025', transferStatus: 'received', transferId: 'TR005', fromPartner: 'TechSupply' },
  { id: '26', partNumber: 'PN026', name: 'Keyboard', parentName: 'KeyCo', price: 599, imageUrl: 'https://picsum.photos/id/120/100/100', parentType: 'Partner', addedDate: '15/03/2025', transferStatus: 'received', transferId: 'TR006', fromPartner: 'InputDevices' },
];


const Bucket = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [tabPositions, setTabPositions] = useState([]);
  const scrollViewRef = useRef(null);
  const [loadingItemId, setLoadingItemId] = useState(null);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const tabTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
    };
  }, []);

  // Confirmation dialog state
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'cancelTransfer', 'acceptReceived', 'cancelReceived', 'add'
  const [confirmItem, setConfirmItem] = useState(null);

  // Filter products based on selected tab
  const filteredProducts = products.filter((item) => {
    if (selectedTab === 'All') {
      return !item.transferStatus;
    } else if (selectedTab === 'Transferred') {
      return item.transferStatus === 'sent';
    } else if (selectedTab === 'Received') {
      return item.transferStatus === 'received';
    } else {
      return !item.transferStatus && item.parentType === selectedTab;
    }
  });

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const handleTabPress = (tab, index) => {
    setSelectedTab(tab);
    setIsTabLoading(true);
    
    // Clear any existing timeout
    if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
    
    // Set new timeout to hide skeleton after 1 second
    tabTimeoutRef.current = setTimeout(() => {
      setIsTabLoading(false);
    }, 1000);

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
      <View className="flex-row justify-end space-x-2">
        <TouchableOpacity
          onPress={() => setConfirmVisible(false)}
          className="px-4 py-2 rounded-full bg-background-tertiary flex-row items-center"
        >
          <Icon name="close-outline" size={18} color="#666" />
          <Text className="text-text-secondary font-medium ml-1">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirmed}
          className={`px-4 py-2 rounded-full flex-row items-center ${
            isDestructive ? 'bg-ui-error' : 
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
              className={`px-4 py-2 rounded-full flex-row items-center ${isLoading ? 'bg-ui-disabled' : 'bg-ui-error'}`}
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
          <View className="mt-3 flex-row justify-end space-x-2">
            {/* Accept button */}
            <TouchableOpacity
              onPress={() => openConfirmation('acceptReceived', item)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full flex-row items-center mr-2 ${isLoading ? 'bg-ui-disabled' : 'bg-ui-success'}`}
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
            {/* Cancel button */}
            <TouchableOpacity
              onPress={() => openConfirmation('cancelReceived', item)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-full flex-row items-center ${isLoading ? 'bg-ui-disabled' : 'bg-ui-error'}`}
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
                className={`text-base px-4 py-1 rounded-full font-semibold ${
                  selectedTab === tab
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