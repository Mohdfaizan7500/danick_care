import { StyleSheet, Text, View, FlatList, Image, TextInput, TouchableOpacity, Pressable, Dimensions, Platform, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Search } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAllSparePart } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const { width: screenWidth } = Dimensions.get('window')

// Skeleton card component – replace animate-pulse with static gray if needed
const SkeletonCard = ({ width, margin }) => (
    <View style={{ width, margin }} className="p-2 bg-white rounded-3xl border border-gray-200 overflow-hidden">
        <View className="bg-gray-200 w-full h-[70] rounded-3xl" /> 
        <View className="px-4 py-3">
            <View className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <View className="h-6 bg-gray-200 rounded w-1/2" />
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
    const [error, setError] = useState(null); // new state for error
    const navigation = useNavigation();
    const { user, imagUrl } = useAuth();

    const device = Platform.OS;
    console.log('device:', device)

    const fetchSpareParts = async () => {
        try {
            setLoading(true);
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
        }
    }

    useEffect(() => {
        fetchSpareParts();
    }, [])

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
            className="p-2 bg-white flex justify-between rounded-3xl border border-gray-200 overflow-hidden"
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

    const renderSkeleton = () => (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: containerPadding }}>
            {Array(6).fill().map((_, index) => (
                <SkeletonCard key={index} width={itemWidth} margin={margin} />
            ))}
        </View>
    );

    const renderError = () => (
        <View className="flex-1 items-center justify-center py-10">
            <Text className="text-red-500 text-sm mb-2">{error}</Text>
            <TouchableOpacity onPress={fetchSpareParts} className="bg-blue-500 px-4 py-2 rounded-lg">
                <Text className="text-white">Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className='flex-1 bg-white'>
            <Header
                title={`${product.name} - Spare Parts`}
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
                renderSkeleton()
            ) : error ? (
                renderError()
            ) : (
                <FlatList
                    data={filteredParts}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    numColumns={numColumns}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: containerPadding }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-10">
                            <Text className="text-gray-500 text-sm">No spare parts found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    )
}

export default SparePartScreen