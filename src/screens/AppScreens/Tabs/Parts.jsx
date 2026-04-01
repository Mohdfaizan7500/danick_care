import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
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

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={[...Array(6)]} // Show 6 skeleton items initially
        renderItem={() => <SkeletonItem />}
        keyExtractor={(_, index) => `skeleton-${index}`}
        numColumns={numColumns}
        scrollEnabled={false}
        contentContainerStyle={{ padding: itemMargin }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
      />
    </View>
  );
};

const SkeletonItem = () => {
  return (
    <View style={{ width: itemWidth, margin: itemMargin / 2 }}>
      <View className="bg-white rounded-2xl px-4 py-6 items-center border border-gray-200">
        {/* Image Skeleton */}
        <View className="w-full h-20 bg-gray-200 rounded-lg mb-2 overflow-hidden">
          <View className="w-full h-full bg-gray-200 animate-pulse" />
        </View>
        {/* Text Skeleton */}
        <View className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
      </View>
    </View>
  );
};

const Parts = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user, imagUrl } = useAuth();

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
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
        console.log('Mapped categories:', mappedCategories);
        setError(null);
      } else {
        toast.custom(
          <StatusMessage type='warning' title='No categories found' />,
          { duration: 2000 }
        );
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message);
      toast.custom(
        <StatusMessage type='error' title='Failed to load categories. Please try again.' />,
        { duration: 2000 }
      );
      setCategories([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, imagUrl]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    if (!isConnected) {
      toast.custom(
        <StatusMessage type='error' title='No internet connection' />,
        { duration: 2000 }
      );
      return;
    }
    setIsRefreshing(true);
    await fetchCategories();
  }, [isConnected, fetchCategories]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchCategories();
    } else {
      setIsLoading(false);
    }
  }, [user, fetchCategories]);

  // Network listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const handleSelectProduct = (product) => {
    if (!isConnected) {
      toast.custom(
        <StatusMessage type='error' title='No internet connection' />,
        { duration: 2000 }
      );
      return;
    }
    navigation.navigate('SparePartScreen', { product });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={{ width: itemWidth, margin: itemMargin / 2 }}
      onPress={() => handleSelectProduct(item)}
      disabled={!isConnected}
      activeOpacity={0.7}
    >
      <View className="bg-white rounded-2xl px-4 py-6 items-center border border-gray-200 shadow-sm">
        <View className="w-full h-20 bg-white overflow-hidden mb-2">
          <Image
            source={{ uri: item.imageUrl }}
            className="w-full h-full rounded-lg"
            resizeMode="contain"
            onError={(e) => console.log('Image load error for', item.name, e.nativeEvent.error)}
            defaultSource={require('../../../assets/images/profileImage.jpg')}
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
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, }}>
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

      <View className="flex-1 bg-red-50">
        {isLoading ? (
          <SkeletonLoader />
        ) : categories.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-600">No categories available</Text>
            <TouchableOpacity
              onPress={onRefresh}
              className="mt-4 bg-primary-sage600 px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={item => item.id.toString()}
            numColumns={numColumns}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: itemMargin }}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={['#58A890']}
                tintColor="#58A890"
                title="Pull to refresh"
                titleColor="#58A890"
              />
            }
          />
        )}
      </View>
    </View>
  );
};

export default Parts;

const styles = StyleSheet.create({});