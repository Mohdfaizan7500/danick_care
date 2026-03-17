import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast } from 'sonner-native';

// Dummy list of partners for transfer
const DUMMY_PARTNERS = [
  { id: 'p1', name: 'ElectroMart' },
  { id: 'p2', name: 'LightHouse' },
  { id: 'p3', name: 'CleanTech' },
  { id: 'p4', name: 'PhoneFix' },
  { id: 'p5', name: 'CoolTech' },
  { id: 'p6', name: 'FreshMart' },
  { id: 'p7', name: 'DairyFarm' },
];

const BucketpartDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { item } = route.params; // item passed from Bucket screen

  // State for transfer modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [loading, setLoading] = useState(false);

  // Part number fallback (if not present, use id)
  const partNumber = item.partNumber || item.id;

  // Date added – if not present, use current date
  const addedDate = item.addedDate || new Date().toLocaleDateString('en-GB');

  // Handle transfer button press
  const handleTransfer = () => {
    if (!selectedPartner) {
      toast.error('Please select a partner');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setModalVisible(false);
      setSelectedPartner(null);
      toast.success(`Part transferred to ${selectedPartner.name}`);
    }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Part Details"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
      />

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Big Image */}
        <View className="w-full h-64 bg-gray-100">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* Details Container */}
        <View className="p-5">
          {/* Name */}
          <Text className="text-2xl font-bold text-gray-900 mb-2">
            {item.name}
          </Text>

          {/* Part Number */}
          <View className="flex-row items-center mb-2">
            <Icon name="barcode-outline" size={18} color="#666" />
            <Text className="text-gray-600 ml-2">Part No: {partNumber}</Text>
          </View>

          {/* Parent Type */}
          <View className="flex-row items-center mb-2">
            <Icon name="folder-outline" size={18} color="#666" />
            <Text className="text-gray-600 ml-2">Type: {item.parentType}</Text>
          </View>

          {/* Date Added */}
          <View className="flex-row items-center mb-4">
            <Icon name="calendar-outline" size={18} color="#666" />
            <Text className="text-gray-600 ml-2">Added on: {addedDate}</Text>
          </View>

          {/* Partner Info (only if type is Partner) */}
          {item.parentType === 'Partner' && (
            <View className="bg-blue-50 p-4 rounded-xl mb-6">
              <Text className="text-blue-800 font-semibold mb-1">
                Partner Details
              </Text>
              <View className="flex-row items-center">
                <Icon name="business-outline" size={16} color="#1e40af" />
                <Text className="text-blue-700 ml-2">
                  {item.parentName} (ID: {item.partnerId || 'P12345'})
                </Text>
              </View>
            </View>
          )}

          {/* Transfer Button */}
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-blue-600 py-4 rounded-xl flex-row items-center justify-center"
          >
            <Icon name="swap-horizontal" size={20} color="white" />
            <Text className="text-white font-semibold text-lg ml-2">
              Transfer to Another Partner
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Transfer Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Select Partner</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Partner List */}
            <FlatList
              data={DUMMY_PARTNERS}
              keyExtractor={(p) => p.id}
              renderItem={({ item: partner }) => (
                <TouchableOpacity
                  onPress={() => setSelectedPartner(partner)}
                  className={`p-4 rounded-xl mb-2 border ${
                    selectedPartner?.id === partner.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <Text className="text-base font-medium">{partner.name}</Text>
                  <Text className="text-xs text-gray-500">ID: {partner.id}</Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              className="max-h-96"
            />

            {/* Transfer Button with Loading */}
            <TouchableOpacity
              onPress={handleTransfer}
              disabled={loading}
              className={`mt-4 py-4 rounded-xl flex-row items-center justify-center ${
                loading ? 'bg-blue-300' : 'bg-blue-600'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Icon name="send" size={20} color="white" />
                  <Text className="text-white font-semibold text-lg ml-2">
                    Transfer
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BucketpartDetails;