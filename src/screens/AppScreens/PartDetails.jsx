import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Modal, StatusBar } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header'
import { useRoute } from '@react-navigation/native'
import { Package, Tag, Hash, Layers, CheckCircle, XCircle, FileText, ShoppingCart, Heart } from 'lucide-react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

const PartDetails = () => {
    const route = useRoute();
    const part = route.params.part;
    const [modalVisible, setModalVisible] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    console.log('Part details:', part);

    // Function to get stock status color and text
    const getStockStatus = () => {
        // You can customize this logic based on your data
        // For now, let's assume inStock is a boolean property
        const inStock = part.inStock !== undefined ? part.inStock : true;
        return {
            color: inStock ? 'text-green-600' : 'text-red-600',
            bgColor: inStock ? 'bg-green-50' : 'bg-red-50',
            icon: inStock ? CheckCircle : XCircle,
            text: inStock ? 'In Stock' : 'Out of Stock'
        };
    };

    const stockStatus = getStockStatus();
    const StockIcon = stockStatus.icon;

    const insets = useSafeAreaInsets()

    return (
        <SafeAreaView className='flex-1 bg-white'
        >
            <StatusBar backgroundColor={'transparent'} barStyle={'dark-content'} translucent={true} />

            {/* Header with absolute positioning */}
            <View className='absolute top-0 z-10 w-full'
                style={{ top: insets.top,  }}
            >
                <Header
                    showBackButton={true}
                    titlePosition="left"
                    containerStyle="bg-transparent  py-4 px-5"
                />
            </View>

            {/* Scrollable Content */}
            <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
                {/* Product Image Section */}
                <View className='w-full h-96 bg-white'>
                    <Image
                        source={{ uri: part.image || part.imageUrl || 'https://via.placeholder.com/400x400?text=No+Image' }}
                        className='w-full h-full'
                        resizeMode="contain"
                    />

                  
                </View>

                {/* Product Details Section */}
                <View className='bg-white rounded-t-3xl -mt-6 p-6'>
                    {/* Product Name and Price */}
                    <View className='flex-row justify-between items-center mb-4'>
                        <Text className='text-3xl font-bold text-gray-900 flex-1 mr-4'>
                            {part.name}
                        </Text>
                        <Text className='text-2xl font-bold text-blue-600'>
                            {part.price}
                        </Text>
                    </View>

                    {/* Stock Status */}
                    <View className={`flex-row items-center ${stockStatus.bgColor} px-4 py-3 rounded-xl mb-4`}>
                        <StockIcon size={24} color={stockStatus.color === 'text-green-600' ? '#16a34a' : '#dc2626'} />
                        <Text className={`ml-2 font-semibold ${stockStatus.color}`}>
                            {stockStatus.text}
                        </Text>
                    </View>

                    {/* Part Details Grid */}
                    <View className='bg-gray-50 rounded-xl p-4 mb-4'>
                        {/* Part Number */}
                        <View className='flex-row items-center py-3 border-b border-gray-200'>
                            <Hash size={20} color="#4b5563" />
                            <Text className='flex-1 ml-3 text-gray-600'>Part Number</Text>
                            <Text className='font-semibold text-gray-900'>{part.partNumber || 'N/A'}</Text>
                        </View>

                        {/* Category */}
                        <View className='flex-row items-center py-3 border-b border-gray-200'>
                            <Layers size={20} color="#4b5563" />
                            <Text className='flex-1 ml-3 text-gray-600'>Category</Text>
                            <View className='bg-primary-sage50 px-3 py-1 rounded-full'>
                                <Text className='text-primary-sage900 font-medium'>{part.category || part.categoryName || 'General'}</Text>
                            </View>
                        </View>

                        {/* Manufacturer */}
                        <View className='flex-row items-center py-3 border-b border-gray-200'>
                            <Package size={20} color="#4b5563" />
                            <Text className='flex-1 ml-3 text-gray-600'>Manufacturer</Text>
                            <Text className='font-semibold text-gray-900'>{part.manufacturer || 'Original'}</Text>
                        </View>

                        {/* Warranty */}
                        <View className='flex-row items-center py-3'>
                            <FileText size={20} color="#4b5563" />
                            <Text className='flex-1 ml-3 text-gray-600'>Warranty</Text>
                            <Text className='font-semibold text-gray-900'>{part.warranty || '1 Year'}</Text>
                        </View>
                    </View>

                    {/* Description Section */}
                    <View className='mb-6'>
                        <Text className='text-lg font-bold text-gray-900 mb-2'>Description</Text>
                        <Text className='text-gray-600 leading-6'>
                            {part.description || part.desc || 'No description available for this product.'}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className='flex-row gap-4'>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className='flex-1 bg-primary-sage500 py-4 rounded-xl flex-row items-center justify-center'
                        >
                            <ShoppingCart size={20} color="white" />
                            <Text className='text-white font-bold text-lg ml-2'>Add to Bucket</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </ScrollView>

            {/* Modal for Additional Information */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className='flex-1 justify-end bg-black/50'>
                    <View className='bg-white rounded-t-3xl p-6'>
                        {/* Modal Header */}
                        <View className='flex-row justify-between items-center mb-4'>
                            <Text className='text-xl font-bold text-gray-900'>Product Details</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Text className='text-blue-600 font-semibold'>Close</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Modal Content */}
                        <ScrollView className='max-h-96'>
                            <View className='space-y-4'>
                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Product Name</Text>
                                    <Text className='text-base font-semibold text-gray-900'>{part.name}</Text>
                                </View>

                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Part Number</Text>
                                    <Text className='text-base font-semibold text-gray-900'>{part.partNumber || 'N/A'}</Text>
                                </View>

                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Category</Text>
                                    <Text className='text-base font-semibold text-gray-900'>{part.category || part.categoryName || 'General'}</Text>
                                </View>

                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Price</Text>
                                    <Text className='text-base font-semibold text-blue-600'>{part.price}</Text>
                                </View>

                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Availability</Text>
                                    <View className={`flex-row items-center ${stockStatus.bgColor} px-3 py-2 rounded-lg self-start`}>
                                        <StockIcon size={16} color={stockStatus.color === 'text-green-600' ? '#16a34a' : '#dc2626'} />
                                        <Text className={`ml-1 font-medium ${stockStatus.color}`}>
                                            {stockStatus.text}
                                        </Text>
                                    </View>
                                </View>

                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Description</Text>
                                    <Text className='text-base text-gray-700 leading-5'>
                                        {part.description || part.desc || 'No description available.'}
                                    </Text>
                                </View>

                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Specifications</Text>
                                    <Text className='text-base text-gray-700'>
                                        {part.specifications || 'Standard specifications apply'}
                                    </Text>
                                </View>

                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Shipping</Text>
                                    <Text className='text-base text-gray-700'>Free shipping on orders above ₹500</Text>
                                </View>

                                <View>
                                    <Text className='text-sm text-gray-500 mb-1'>Returns</Text>
                                    <Text className='text-base text-gray-700'>7-day easy returns</Text>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Modal Footer Button */}
                        <TouchableOpacity
                            onPress={() => {
                                setModalVisible(false);
                                // Add to cart logic here
                                console.log('Added to cart:', part);
                            }}
                            className='mt-4 bg-blue-600 py-3  rounded-xl'
                        >
                            <Text className='text-white font-bold text-center text-lg'>Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

export default PartDetails

const styles = StyleSheet.create({})