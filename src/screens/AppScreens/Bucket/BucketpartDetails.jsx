import { useState, useMemo } from 'react';
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

// Generate 40 dummy partners
const generateDummyPartners = (count) => {
  const firstNames = [
    'Amit', 'Priya', 'Ravi', 'Sneha', 'Vikram', 'Anjali', 'Rajesh', 'Deepa',
    'Suresh', 'Kavita', 'Arjun', 'Pooja', 'Manoj', 'Neha', 'Sanjay', 'Divya',
    'Vinod', 'Meena', 'Sunil', 'Rekha', 'Anil', 'Shilpa', 'Gaurav', 'Jyoti',
    'Nitin', 'Sarita', 'Deepak', 'Kiran', 'Pankaj', 'Anita', 'Rahul', 'Swati',
    'Ashok', 'Neeta', 'Vijay', 'Geeta', 'Sanjeev', 'Komal', 'Rajiv', 'Nidhi'
  ];
  const lastNames = [
    'Sharma', 'Patel', 'Kumar', 'Reddy', 'Singh', 'Desai', 'Gupta', 'Nair',
    'Iyer', 'Joshi', 'Verma', 'Malhotra', 'Mehta', 'Choudhary', 'Yadav', 'Rao',
    'Saxena', 'Mishra', 'Trivedi', 'Bhat', 'Menon', 'Pillai', 'Kaur', 'Thakur'
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `p${i + 1}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
  }));
};

const DUMMY_PARTNERS = generateDummyPartners(40);

const BucketpartDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params;

  // State for partner selection modal
  const [partnerModalVisible, setPartnerModalVisible] = useState(false);
  const [selectedTransferPartner, setSelectedTransferPartner] = useState(null);
  const [tempSelectedPartner, setTempSelectedPartner] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // State for transfer loading
  const [transferLoading, setTransferLoading] = useState(false);

  // Filter partners based on search
  const filteredPartners = useMemo(() => {
    return DUMMY_PARTNERS.filter(partner =>
      partner.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const partNumber = item.partNumber || item.id;
  const addedDate = item.addedDate || new Date().toLocaleDateString('en-GB');

  // Open modal for partner selection
  const openPartnerModal = () => {
    setTempSelectedPartner(selectedTransferPartner); // pre-select current if any
    setSearchQuery('');
    setPartnerModalVisible(true);
  };

  // Confirm selection in modal
  const confirmPartnerSelection = () => {
    if (tempSelectedPartner) {
      setSelectedTransferPartner(tempSelectedPartner);
    }
    setPartnerModalVisible(false);
  };

  // Actual transfer
  const handleTransfer = () => {
    if (!selectedTransferPartner) {
      toast.error('Please select a partner first');
      return;
    }
    setTransferLoading(true);
    setTimeout(() => {
      setTransferLoading(false);
      setSelectedTransferPartner(null);
      toast.custom(<StatusMessage type='success' title={`Part transferred to ${selectedTransferPartner.name}`}/>,{duration:1000});
    }, 2000);
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
        <View className="w-full h-100 bg-background-secondary">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* Details */}
        <View className="p-5">
          <Text className="text-2xl font-bold text-text-primary mb-2">
            {item.name}
          </Text>

          <View className="flex-row items-center mb-2">
            <Icon name="barcode-outline" size={18} color="#666666" />
            <Text className="text-text-secondary ml-2">Part No: {partNumber}</Text>
          </View>

          <View className="flex-row items-center mb-2">
            <Icon name="folder-outline" size={18} color="#666666" />
            <Text className="text-text-secondary ml-2">Type: {item.parentType}</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Icon name="calendar-outline" size={18} color="#666666" />
            <Text className="text-text-secondary ml-2">Added on: {addedDate}</Text>
          </View>

          {item.parentType === 'Partner' && (
            <View className="bg-primary-sage50 p-4 rounded-xl mb-6 border border-primary-sage200">
              <Text className="text-primary-sage800 font-semibold mb-1">
                Current Partner
              </Text>
              <View className="flex-row items-center">
                <Icon name="business-outline" size={16} color="#287860" />
                <Text className="text-primary-sage700 ml-2">
                  {item.parentName} (ID: {item.partnerId || 'P12345'})
                </Text>
              </View>
            </View>
          )}

          {/* Dropdown Button for Partner Selection */}
          <TouchableOpacity
            onPress={openPartnerModal}
            className="flex-row items-center justify-between bg-background-secondary border border-ui-border rounded-xl p-4 mb-4"
          >
            <View className="flex-row items-center">
              <Icon name="people-outline" size={20} color="#666666" />
              <Text className="text-text-primary ml-2 font-medium">
                {selectedTransferPartner
                  ? `Selected: ${selectedTransferPartner.name}`
                  : 'Select Partner for Transfer'}
              </Text>
            </View>
            <Icon name="chevron-down" size={20} color="#666666" />
          </TouchableOpacity>

          {/* Transfer Button (enabled only when partner selected) */}
          <TouchableOpacity
            onPress={handleTransfer}
            disabled={!selectedTransferPartner || transferLoading}
            className={`py-4 rounded-xl flex-row items-center justify-center ${!selectedTransferPartner || transferLoading
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
                  {selectedTransferPartner
                    ? `Transfer to ${selectedTransferPartner.name}`
                    : 'Confirm Transfer'}
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
        title="Select Partner"
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
              className={`py-4 rounded-xl flex-row items-center justify-center ${!tempSelectedPartner ? 'bg-primary-sage300' : 'bg-primary-sage600'
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
                {tempSelectedPartner.name}
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
            placeholder="Search partners..."
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

        {/* Partner List */}
        <FlatList
          data={filteredPartners}
          keyExtractor={(p) => p.id}
          renderItem={({ item: partner }) => (
            <TouchableOpacity
              onPress={() => setTempSelectedPartner(partner)}
              className={`p-4 rounded-xl mb-2 border ${tempSelectedPartner?.id === partner.id
                  ? 'border-primary-sage400 bg-primary-sage50'
                  : 'border-ui-border bg-background-secondary'
                }`}
            >
              <Text className="text-base font-medium text-text-primary">
                {partner.name}
              </Text>
              <Text className="text-xs text-text-tertiary">ID: {partner.id}</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          className="max-h-[400px]"
          ListEmptyComponent={
            <View className="py-10 items-center">
              <Icon name="people-outline" size={40} color="#DDDDDD" />
              <Text className="text-text-tertiary mt-2">No partners found</Text>
            </View>
          }
        />
      </DialogBox>
    </SafeAreaView>
  );
};

export default BucketpartDetails;