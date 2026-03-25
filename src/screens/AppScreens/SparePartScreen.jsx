import { StyleSheet, Text, View, FlatList, Image, TextInput, TouchableOpacity, Pressable, Dimensions, Platform } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Search } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const { width: screenWidth } = Dimensions.get('window')

const SparePartScreen = () => {
    const route = useRoute();
    const product = route.params.product
    console.log("product on spare part screen :",product)
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredParts, setFilteredParts] = useState(product.spareParts);
    const navigation = useNavigation();

    const device = Platform.OS;
    console.log('device:',device)

    const handleSearch = (text) => {
        setSearchQuery(text);
        if (text.trim() === '') {
            setFilteredParts(product.spareParts);
        } else {
            const filtered = product.spareParts.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredParts(filtered);
        }
    };

    const handleClickedProduct = (part)=>{
        navigation.navigate('PartDetails',{part})
    }

    // Grid configuration
    const numColumns = 3;
    const margin = 8; // m-2 = 8
    const containerPadding = 8; // contentContainerStyle padding
    // Calculate item width: screen width minus horizontal padding and margins
    const itemWidth = (screenWidth - (containerPadding * 2) - (margin * 2 * numColumns)) / numColumns;

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

            <FlatList
                data={filteredParts}
                renderItem={({ item }) => (
                    <Pressable
                        onPress={() => handleClickedProduct(item)}
                        style={{ width: itemWidth, margin }}
                        className="p-2 bg-white flex justify-between rounded-3xl border border-gray-200 overflow-hidden"
                    >
                        <View className='bg-white w-full h-[70] rounded-3xl'>
                            <Image
                                source={{ uri: item.image }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                        <View className='px-4 py-3'>
                            <Text className='font-bold text-xs text-black'>{item.name}</Text>
                            <Text className='font-semibold text-blue-800 text-lg'>{item.price}</Text>
                        </View>
                    </Pressable>
                )}
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
        </SafeAreaView>
    )
}

export default SparePartScreen

const styles = StyleSheet.create({})