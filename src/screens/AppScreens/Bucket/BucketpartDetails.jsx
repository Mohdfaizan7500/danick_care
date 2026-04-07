import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import Header from '../../../components/Header';
import DialogBox from '../../../components/DilaogBox';
import StatusMessage from '../../../components/StatusMessage';
import { getAllTechnician, partTransferToTechnician } from '../../../lib/api';

const BucketpartDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;
  console.log('item:', item)

  // State for partner selection modal
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [selectedTransferPartner, setSelectedTransferPartner] = useState(null);
  const [tempSelectedPartner, setTempSelectedPartner] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  // State for transfer loading
  const [transferLoading, setTransferLoading] = useState(false);

  // Filter partners based on search
  const filteredPartners = useMemo(() => {
    return technicians.filter(tech =>
      tech.technician_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [technicians, searchQuery]);

  // Get display values from item
  const partNumber = item.partNumber || item.id || 'N/A';
  const addedDate = item.addedDate || (item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'));
  const partName = item.name || item.part_name || 'Part Name';
  const partPrice = item.price || item.part_price || '0';
  const partImage = item.imageUrl || (item.part_image ? `https://dainikcare.com/dainik_care_admin/${item.part_image}` : null);
  const parentType = item.parentType || item.transfer_by || 'Unknown';
  const parentName = item.parentName || (item.transfer_by === 'market' ? 'Market' :
    item.transfer_by === 'partner' ? 'Partner' :
      item.transfer_by === 'admin' ? 'Service Center' : 'Unknown');
  const description = item.description || 'No description available';
  const partId = item.id;

  // Check if transfer is allowed (market parts cannot be transferred)
  const isTransferAllowed = () => {
    if (parentType === 'market' || item.transfer_by === 'market') {
      return false;
    }
    return true;
  };

  // Format parent type display
  const getParentTypeDisplay = (type) => {
    switch (type) {
      case 'market':
        return 'Market';
      case 'partner':
        return 'Partner';
      case 'admin':
        return 'Service Center';
      case 'replace':
        return 'Replace';
      default:
        return type;
    }
  };

  // Fetch all technicians
  const fetchAllTechnicians = async () => {
    try {
      setLoadingTechnicians(true);
      const response = await getAllTechnician();
      console.log('Technicians response:', response);

      // Handle API response
      const data = response?.data?.data || [];
      setTechnicians(data);
    } catch (error) {
      console.log('fetchAllTechnicians error:', error);
      console.error('fetchAllTechnicians error:', error);
      toast.error('Failed to load technicians');
      setTechnicians([]);
    } finally {
      setLoadingTechnicians(false);
    }
  };

  // Open modal for partner selection
  const openPartnerModal = () => {
    // Check if transfer is allowed before opening modal
    if (!isTransferAllowed()) {
      toast.error('Market parts cannot be transferred');
      return;
    }
    setTempSelectedPartner(selectedTransferPartner);
    setSearchQuery('');
    setPartnerModalVisible(true);
    // Fetch technicians when modal opens
    fetchAllTechnicians();
  };

  // Confirm selection in modal
  const confirmPartnerSelection = () => {
    if (tempSelectedPartner) {
      setSelectedTransferPartner(tempSelectedPartner);
    }
    setPartnerModalVisible(false);
  };

  // Actual transfer with navigation and refresh
  const handleTransfer = async () => {
    // Check if transfer is allowed first
    if (!isTransferAllowed()) {
      toast.error('Market parts cannot be transferred');
      return;
    }

    if (!selectedTransferPartner) {
      toast.error('Please select a partner first');
      return;
    }

    try {
      setTransferLoading(true);
      const payload = {
        technician_id: selectedTransferPartner.id,
        part_id: partId
      };

      console.log('Transfer payload:', payload);
      const response = await partTransferToTechnician(payload);
      console.log('Transfer response:', response);

      // Show success toast
      toast.custom(
        <StatusMessage
          type='success'
          title={`Part transferred to ${selectedTransferPartner.technician_name}`}
        />,
        { duration: 2000 }
      );

      // Wait for a short moment to ensure toast is shown, then navigate back
      setTimeout(() => {
        navigation.goBack();
      }, 500);

    } catch (error) {
      console.log('Failed to transfer:', error);
      console.error('Failed to transfer:', error);
      toast.error('Transfer failed. Please try again.');
      setTransferLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <View className="absolute inset-0 z-50 w-90% pointer-events-none">
        <Toaster />
      </View>
      <Header
        title="Part Details"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5 text-text-primary"
        showBackButton={true}
        containerStyle="bg-background-primary flex-row items-center justify-between px-4 py-4 border-b border-ui-border"
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Image */}
        <View className="w-full h-96 bg-background-secondary">
          {partImage ? (
            <Image
              source={{ uri: partImage }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Icon name="image-outline" size={60} color="#CCCCCC" />
              <Text className="text-text-tertiary mt-2">No Image Available</Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View className="p-5">
          <Text className="text-2xl font-bold text-text-primary mb-2">
            {partName}
          </Text>

          <View className="flex-row items-center mb-2">
            <Icon name="pricetag-outline" size={18} color="#666666" />
            <Text className="text-text-secondary ml-2">Price: ₹{partPrice}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Icon name="barcode-outline" size={18} color="#666666" />
            <Text className="text-text-secondary ml-2">Part ID: {partId}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Icon name="qr-code-outline" size={18} color="#666666" />
            <Text className="text-text-secondary ml-2">Part No: {partNumber}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Icon name="folder-outline" size={18} color="#666666" />
            <Text className="text-text-secondary ml-2">Type: {getParentTypeDisplay(parentType)}</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Icon name="calendar-outline" size={18} color="#666666" />
            <Text className="text-text-secondary ml-2">Added on: {addedDate}</Text>
          </View>

          {/* Description Section */}
          {description && description !== 'No description available' && (
            <View className="bg-background-secondary p-4 rounded-xl mb-4 border border-ui-border">
              <Text className="text-text-primary font-semibold mb-2">Description</Text>
              <Text className="text-text-secondary leading-5">{description}</Text>
            </View>
          )}

          {/* Current Partner Section - Only show for Partner type */}
          {parentType === 'partner' && (
            <View className="bg-primary-sage50 p-4 rounded-xl mb-6 border border-primary-sage200">
              <Text className="text-primary-sage800 font-semibold mb-1">
                Current Partner
              </Text>
              <View className="flex-row items-center">
                <Icon name="business-outline" size={16} color="#287860" />
                <Text className="text-primary-sage700 ml-2">
                  {parentName} (ID: {item.partnerId || 'N/A'})
                </Text>
              </View>
            </View>
          )}

          {/* Market Part Warning Section */}
          {!isTransferAllowed() && (
            <View className="bg-red-50 p-4 rounded-xl mb-4 border border-red-200">
              <View className="flex-row items-center">
                <Icon name="alert-circle" size={20} color="#DC2626" />
                <Text className="text-red-700 font-semibold ml-2">
                  Market Part - Cannot Be Transferred
                </Text>
              </View>
              <Text className="text-red-600 text-sm mt-1 ml-7">
                Parts from the market cannot be transferred to technicians. This part is from {parentName}.
              </Text>
            </View>
          )}

          {/* Dropdown Button for Partner Selection - Disabled for market parts */}
          <TouchableOpacity
            onPress={openPartnerModal}
            disabled={!isTransferAllowed()}
            className={`flex-row items-center justify-between rounded-xl p-4 mb-4 ${
              !isTransferAllowed() 
                ? 'bg-gray-100 border border-gray-200 opacity-60' 
                : 'bg-background-secondary border border-ui-border'
            }`}
          >
            <View className="flex-row items-center">
              <Icon 
                name="people-outline" 
                size={20} 
                color={!isTransferAllowed() ? "#999999" : "#666666"} 
              />
              <Text className={`ml-2 font-medium ${
                !isTransferAllowed() ? 'text-text-tertiary' : 'text-text-primary'
              }`}>
                {!isTransferAllowed()
                  ? 'Transfer not available for market parts'
                  : selectedTransferPartner
                    ? `Selected: ${selectedTransferPartner.technician_name}`
                    : 'Select Partner for Transfer'
                }
              </Text>
            </View>
            <Icon 
              name="chevron-down" 
              size={20} 
              color={!isTransferAllowed() ? "#999999" : "#666666"} 
            />
          </TouchableOpacity>

          {/* Transfer Button - Disabled for market parts */}
          <TouchableOpacity
            onPress={handleTransfer}
            disabled={!isTransferAllowed() || !selectedTransferPartner || transferLoading}
            className={`py-4 rounded-xl flex-row items-center justify-center ${
              !isTransferAllowed() || !selectedTransferPartner || transferLoading
                ? 'bg-primary-sage300'
                : 'bg-primary-sage600'
            }`}
          >
            {transferLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Icon name="swap-horizontal" size={20} color="white" />
                <Text className="text-text-inverse font-semibold text-lg ml-2">
                  {!isTransferAllowed()
                    ? 'Cannot Transfer Market Part'
                    : selectedTransferPartner
                      ? `Transfer to ${selectedTransferPartner.technician_name}`
                      : 'Confirm Transfer'
                  }
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Partner Selection Modal */}
      <DialogBox
        visible={partnerModalVisible}
        onClose={() => setPartnerModalVisible(false)}
        title="Select Technician"
        size="lg"
        showCloseButton={true}
        closeIconName="close"
        closeIconColor="#777777"
        footer={
          <View className="w-full">
            {/* Confirm Button */}
            <TouchableOpacity
              onPress={confirmPartnerSelection}
              disabled={!tempSelectedPartner}
              className={`py-4 rounded-xl flex-row items-center justify-center ${
                !tempSelectedPartner ? 'bg-primary-sage300' : 'bg-primary-sage600'
              }`}
            >
              <Icon name="checkmark" size={20} color="white" />
              <Text className="text-text-inverse font-semibold text-lg ml-2">
                Confirm Selection
              </Text>
            </TouchableOpacity>
          </View>
        }
        footerStyle="border-t border-ui-border pt-3"
        closeOnBackdropPress={true}
      >
        {/* Selected partner indicator inside modal */}
        {tempSelectedPartner && (
          <View className="flex-row items-center justify-between bg-primary-sage50 p-3 rounded-xl mb-3 border border-primary-sage200">
            <View className="flex-row items-center">
              <Icon name="person" size={18} color="#287860" />
              <Text className="text-primary-sage800 font-medium ml-2">
                {tempSelectedPartner.technician_name}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setTempSelectedPartner(null)}>
              <Icon name="close-circle" size={20} color="#777777" />
            </TouchableOpacity>
          </View>
        )}

        {/* Search Bar */}
        <View className="flex-row items-center bg-background-secondary rounded-xl px-3 py-2 mb-3 border border-ui-border">
          <Icon name="search" size={20} color="#999999" />
          <TextInput
            className="flex-1 ml-2 text-base text-text-primary"
            placeholder="Search technicians..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Technician List */}
        {loadingTechnicians ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#58A890" />
            <Text className="text-text-tertiary mt-2">Loading technicians...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPartners}
            keyExtractor={(tech) => tech.id?.toString()}
            renderItem={({ item: tech }) => (
              <TouchableOpacity
                onPress={() => setTempSelectedPartner(tech)}
                className={`p-4 rounded-xl mb-2 border ${
                  tempSelectedPartner?.id === tech.id
                    ? 'border-primary-sage400 bg-primary-sage50'
                    : 'border-ui-border bg-background-secondary'
                }`}
              >
                <Text className="text-base font-medium text-text-primary">
                  {tech.technician_name}
                </Text>
                <Text className="text-xs text-text-tertiary">ID: {tech.id}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            className="max-h-[400px]"
            ListEmptyComponent={
              <View className="py-10 items-center">
                <Icon name="people-outline" size={40} color="#DDDDDD" />
                <Text className="text-text-tertiary mt-2">No technicians found</Text>
              </View>
            }
          />
        )}
      </DialogBox>
    </SafeAreaView>
  );
};

export default BucketpartDetails;