import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../components/Header';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';      
// Extended sample data – each category now has at least 5 products
const PRODUCTS = [
  // Partner (existing working URLs)
  { id: '1', name: 'Fan Blade', parentName: 'ElectroMart', price: 299, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ092ZmyiurfyPE6lukBRbrmFWDGyXjmLtaeQ&s', parentType: 'Partner' },
  { id: '2', name: 'LED Bulb', parentName: 'LightHouse', price: 149, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7VCVioPAz2HhNdIIPRCQAUknUPOUwt9bQfA&s', parentType: 'Partner' },
  { id: '3', name: 'Washing Machine', parentName: 'CleanTech', price: 18999, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTr1PSO-E2_GRxQyTNXpJpe0H5sOp-DsNxJ-Q&s', parentType: 'Partner' },
  { id: '4', name: 'Mobile Screen', parentName: 'PhoneFix', price: 3500, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3QUvHKfLajkDzou6GVlHCT7u2OygNuaLQHw&s', parentType: 'Partner' },
  { id: '5', name: 'Air Conditioner', parentName: 'CoolTech', price: 32000, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW0SXO2EQqvMvSOfy1cEh2OQICuCY_27TOqg&s', parentType: 'Partner' },

  // Market (now with valid Picsum images)
  { id: '6', name: 'Organic Rice', parentName: 'FreshMart', price: 120, imageUrl: 'https://picsum.photos/id/100/100/100', parentType: 'Market' },
  { id: '7', name: 'Milk', parentName: 'DairyFarm', price: 60, imageUrl: 'https://picsum.photos/id/101/100/100', parentType: 'Market' },
  { id: '8', name: 'Eggs', parentName: 'FarmFresh', price: 80, imageUrl: 'https://picsum.photos/id/102/100/100', parentType: 'Market' },
  { id: '9', name: 'Bread', parentName: 'BakeryHouse', price: 40, imageUrl: 'https://picsum.photos/id/103/100/100', parentType: 'Market' },
  { id: '10', name: 'Cooking Oil', parentName: 'OilMart', price: 150, imageUrl: 'https://picsum.photos/id/104/100/100', parentType: 'Market' },

  // Service Center
  { id: '11', name: 'AC Service', parentName: 'CoolCare', price: 499, imageUrl: 'https://picsum.photos/id/105/100/100', parentType: 'Service Center' },
  { id: '12', name: 'Plumbing', parentName: 'PipeFix', price: 299, imageUrl: 'https://picsum.photos/id/106/100/100', parentType: 'Service Center' },
  { id: '13', name: 'Electrical Repair', parentName: 'SparkTech', price: 399, imageUrl: 'https://picsum.photos/id/107/100/100', parentType: 'Service Center' },
  { id: '14', name: 'Pest Control', parentName: 'PestFree', price: 799, imageUrl: 'https://picsum.photos/id/108/100/100', parentType: 'Service Center' },
  { id: '15', name: 'Cleaning Service', parentName: 'ShineHome', price: 249, imageUrl: 'https://picsum.photos/id/109/100/100', parentType: 'Service Center' },

  // Replace
  { id: '16', name: 'Battery', parentName: 'PowerUp', price: 1200, imageUrl: 'https://picsum.photos/id/110/100/100', parentType: 'Replace' },
  { id: '17', name: 'Tyre', parentName: 'WheelWorld', price: 3500, imageUrl: 'https://picsum.photos/id/111/100/100', parentType: 'Replace' },
  { id: '18', name: 'Phone Battery', parentName: 'CellFix', price: 1500, imageUrl: 'https://picsum.photos/id/112/100/100', parentType: 'Replace' },
  { id: '19', name: 'Laptop Keyboard', parentName: 'TechRepair', price: 2200, imageUrl: 'https://picsum.photos/id/113/100/100', parentType: 'Replace' },
  { id: '20', name: 'Water Purifier Filter', parentName: 'AquaPure', price: 800, imageUrl: 'https://picsum.photos/id/114/100/100', parentType: 'Replace' },
];
const TABS = ['All', 'Partner', 'Market', 'Service Center', 'Replace'];

const Bucket = () => {
  const navigation = useNavigation();
  const [selectedTab, setSelectedTab] = useState('All');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredProducts =
    selectedTab === 'All'
      ? PRODUCTS
      : PRODUCTS.filter((item) => item.parentType === selectedTab);

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View className="bg-white border border-gray-300 rounded-2xl p-4 mb-3 flex-row items-center justify-between">
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
        <View className="ml-4">
          <Text className="text-lg font-bold text-black">{item.name}</Text>
          <Text className="text-sm text-gray-500">{item.parentName}</Text>
        </View>
      </View>

      {/* Right side: price (large and bold) */}
      <Text className="text-xl font-extrabold text-blue-900">
        ₹{item.price}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="bg-white flex-1">
      <Header
        title="Bucket"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showRightIcon={true}                                        // <-- Enable right icon
        customRightIconComponent={
          <Icon name="bag-add-outline" size={24} color="#333" />      // <-- Part icon
        }
        onRightIconPress={() => navigation.navigate('AddPart')}      // <-- Navigate to 'Parts' screen
      />

      {/* Filter Tabs */}
      <View className="py-2 border-b border-gray-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-2"
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className="mr-2"
            >
              <Text
                className={`text-base px-4 py-1 rounded-full font-semibold ${selectedTab === tab
                  ? 'bg-blue-700 text-white'
                  : 'text-gray-600'
                  }`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">
            No products found
          </Text>
        }
      />

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
    </SafeAreaView>
  );
};

export default Bucket;