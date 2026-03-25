import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import Header from '../../../components/Header';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toast, Toaster } from 'sonner-native';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../../NoInternet';
import { useAuth } from '../../../context/AuthContext';
import { getAllSparePartcategories } from '../../../lib/api';

const { width: screenWidth } = Dimensions.get('window');
const numColumns = 3;
const itemMargin = 6; // m-1.5 = 6px (half on each side)
const itemWidth = (screenWidth - (itemMargin * (numColumns + 1))) / numColumns; // subtract total margin

const Parts = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user ,imagUrl} = useAuth();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const cityId = user?.city_id || '1';
        const response = await getAllSparePartcategories(cityId);
        console.log('Fetched spare part categories:', response);
        
        const fetchedData = response?.data?.data;
        if (Array.isArray(fetchedData) && fetchedData.length > 0) {
          const mappedCategories = fetchedData.map(item => ({
            id: item.id,
            name: item.service_name,
            imageUrl: `${imagUrl}${item.image}`,
          }));
          setCategories(mappedCategories);
          // console.log('Mapped categories:', mappedCategories);
        } else {
          toast.warning('No categories found');
          setCategories([]);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        toast.error('Failed to load categories. Please try again.');
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCategories();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectProduct = (product) => {
    if (!isConnected) return;
    navigation.navigate('SparePartScreen', { product });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={{ width: itemWidth, margin: itemMargin / 2 }}
      onPress={() => handleSelectProduct(item)}
      disabled={!isConnected}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-2xl px-1 pt-1 py-2 items-center border border-gray-300">
        <View className="w-full h-20 bg-white overflow-hidden mb-2">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full rounded-lg"
            resizeMode="cover"
            onError={(e) => console.log('Image load error for', item.name, e.nativeEvent.error)}
            defaultSource={require('../../../assets/images/profileImage.jpg')} // optional fallback
          />
        </View>
        <Text className="text-sm font-semibold text-gray-800 text-center" numberOfLines={1}>
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // If offline, show NoInternet
  if (!isConnected) {
    return (
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <Header
          title="Spare Parts"
          titleStyle="text-2xl font-bold"
          showBackButton={false}
          titlePosition="left"
          containerStyle="bg-white flex-row items-center justify-between px-4 py-5 border-b border-gray-200"
        />
        <NoInternet />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: 12 }}>
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>

      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      <Header
        title="Spare Parts"
        titleStyle="text-2xl font-bold"
        showBackButton={false}
        titlePosition="left"
        containerStyle="bg-white flex-row items-center justify-between px-4 py-5 border-b border-gray-200"
      />

      <View className="flex-1 bg-gray-50">
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#58A890" />
            <Text className="mt-4 text-gray-600">Loading categories...</Text>
          </View>
        ) : categories.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">No categories available</Text>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id.toString()}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: itemMargin }}
            columnWrapperStyle={{ justifyContent: 'space-between' }} // still useful for spacing between columns
          />
        )}
      </View>
    </View>
  );
};

export default Parts;

const styles = StyleSheet.create({});