import { StyleSheet, Text, View, FlatList, Image, TextInput, TouchableOpacity, Pressable, Dimensions, Platform, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Search } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAllSparePart } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const { width: screenWidth } = Dimensions.get('window')

// Skeleton card component with proper styling
const SkeletonCard = ({ width, margin }) => (
    <View style={{ width, margin }} className="p-2 bg-white rounded-3xl border border-gray-200 overflow-hidden">
        {/* Image skeleton */}
        <View className="bg-gray-200 w-full h-[70] rounded-3xl" />
        
        {/* Content skeleton */}
        <View className="px-4 py-3">
            <View className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
            <View className="h-5 bg-gray-200 rounded w-1/2" />
        </View>
    </View>
)

const SparePartScreen = () => {
    const route = useRoute();
    const product = route.params.product
    const product_id = product?.id;
    const [searchQuery, setSearchQuery] = useState('');
    const [partsData, setPartsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const navigation = useNavigation();
    const { user, imagUrl } = useAuth();

    const device = Platform.OS;
    console.log('device:', device)

    const fetchSpareParts = async (isRefresh = false) => {
        try {
            if (!isRefresh) {
                setLoading(true);
            }
            setError(null);
            const response = await getAllSparePart(product_id);
            console.log('API Response:', response);
            const data = response?.data?.data || [];
            setPartsData(data);
        } catch (error) {
            console.error('Error fetching spare Parts:', error);
            setError('Failed to load spare parts. Please try again.');
            setPartsData([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchSpareParts();
    }, [])

    // Pull to refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchSpareParts(true);
    };

    // Filter parts based on search query (search in part_name)
    const filteredParts = partsData.filter(item =>
        item.part_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const handleClickedProduct = (part) => {
        navigation.navigate('PartDetails', { part })
    }

    // Grid configuration
    const numColumns = 3;
    const margin = 8; // m-2 = 8
    const containerPadding = 8;
    const itemWidth = (screenWidth - (containerPadding * 2) - (margin * 2 * numColumns)) / numColumns;

    const renderItem = ({ item }) => (
        <Pressable
            onPress={() => handleClickedProduct(item)}
            style={{ width: itemWidth, margin }}
            className="p-2 bg-white rounded-3xl border border-gray-200 overflow-hidden"
        >
            <View className='bg-white w-full h-[70] rounded-3xl'>
                <Image
                    source={{ uri: imagUrl + item.part_image }}
                    className="w-full h-full"
                    resizeMode="contain"
                    onError={(e) => console.log('Image load error for', item.name, e.nativeEvent.error)}
                    defaultSource={require('../../assets/images/profileImage.jpg')}
                />
            </View>
            <View className='px-4 py-3'>
                <Text className='font-bold text-xs text-black' numberOfLines={2}>
                    {item.part_name}
                </Text>
                <Text className='font-semibold text-blue-800 text-lg'>₹{item.part_price}</Text>
            </View>
        </Pressable>
    );

    // Skeleton loader using FlatList
    const renderSkeletonLoader = () => {
        // Create skeleton data array with 12 items (4 rows of 3 cards)
        const skeletonData = Array(9).fill().map((_, index) => ({ id: `skeleton-${index}` }));
        
        return (
            <FlatList
                data={skeletonData}
                renderItem={({ item }) => (
                    <SkeletonCard width={itemWidth} margin={margin} />
                )}
                keyExtractor={item => item.id}
                numColumns={numColumns}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: containerPadding }}
                scrollEnabled={false}
            />
        );
    };

    const renderError = () => (
        <View className="flex-1 items-center justify-center py-10">
            <Text className="text-red-500 text-sm mb-2">{error}</Text>
            <TouchableOpacity onPress={() => fetchSpareParts()} className="bg-primary-sage500 px-6 py-3 rounded-lg">
                <Text className="text-white font-medium">Retry</Text>
            </TouchableOpacity>
        </View>
    );

    const renderEmpty = () => (
        <View className="flex-1 items-center justify-center py-10">
            <Text className="text-gray-500 text-sm">No spare parts found</Text>
        </View>
    );

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <Header
                title={`${product?.name || 'Spare'} - Spare Parts`}
                titleStyle={'text-2xl font-bold'}
                showBackButton={true}
                titlePosition="left"
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
            />

            {/* Search Bar */}
            <View className="bg-white px-4 py-2 border-gray-200">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-0">
                    <Search size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 py-3 text-base text-gray-800"
                        placeholder="Search spare parts..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Text className="text-gray-500 font-medium">Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading ? (
                renderSkeletonLoader()
            ) : error ? (
                renderError()
            ) : (
                <FlatList
                    data={filteredParts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id?.toString() || Math.random().toString()}
                    numColumns={numColumns}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: containerPadding, flexGrow: 1 }}
                    ListEmptyComponent={renderEmpty}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#3FD298', '#58A890']}
                            tintColor="#3FD298"
                            title="Pull to refresh"
                            titleColor="#666"
                        />
                    }
                />
            )}
        </SafeAreaView>
    )
}

export default SparePartScreen