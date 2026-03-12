import { StyleSheet, Text, View, FlatList, Image, TextInput, TouchableOpacity, Pressable } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Search } from 'lucide-react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const SparePartScreen = () => {
    const route = useRoute();
    const product = route.params.product
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredParts, setFilteredParts] = useState(product.spareParts);
    const navigation = useNavigation();

    console.log('route:', route.params.product)

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
            <View className="bg-white px-4 py-2  border-gray-200">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-0">
                    <Search size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
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
                    onPress={()=>handleClickedProduct(item)}
                      className="flex-1 m-2 p-2 bg-white rounded-3xl border border-gray-200 overflow-hidden">
                        <View className='bg-white w-full h-[180] rounded-3xl'>
                            <Image
                                source={{ uri: item.image }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        </View>
                        <View className='px-4 py-3'>
                            <Text className='font-bold text-xl text-black'>{item.name}</Text>
                            <Text className='font-semibold text-blue-800 text-lg'>{item.price}</Text>
                        </View>
                    </Pressable>
                )}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 8 }}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center py-10">
                        <Text className="text-gray-500 text-lg">No spare parts found</Text>
                    </View>
                }
            />
        </SafeAreaView>
    )
}

export default SparePartScreen

const styles = StyleSheet.create({})