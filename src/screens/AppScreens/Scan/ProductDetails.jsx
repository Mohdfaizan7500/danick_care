import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import React from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import StatusMessage from '../../../components/StatusMessage';
import { toast } from 'sonner-native';

const ProductDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { product } = route.params;
    
    console.log('Received product data:', product);

    const formatPrice = (price) => {
        const numPrice = parseFloat(price);
        return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
    };

    const getStatusColor = (status) => {
        if (status === 'market') return '#10B981'; // green
        if (status === 'technician') return '#3B82F6'; // blue
        if (status === 'accepted') return '#8B5CF6'; // purple
        return '#6B7280'; // gray
    };

    const getStatusText = (status) => {
        if (status === 'market') return 'From Market';
        if (status === 'technician') return 'From Technician';
        if (status === 'accepted') return 'Accepted';
        return 'Unknown';
    };

    const handleCopyToClipboard = (text, label) => {
        // For React Native, you would need to use Clipboard API
        // This is a placeholder for the actual implementation
        toast.custom(
            <StatusMessage type='success' title={`${label} copied to clipboard`} />,
            { duration: 1500 }
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <StatusBar
                    backgroundColor="transparent"
                    barStyle="dark-content"
                    translucent={true}
                  />
            <Header
                title="Product Details"
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5 text-text-primary"
                showBackButton={true}
                backButtonColor="#333333"
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
            />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Product Image Section */}
                <View className="bg-white">
                    {product.imageUrl ? (
                        <Image
                            source={{ uri: product.imageUrl }}
                            className="w-full h-80"
                            resizeMode="contain"
                            onError={() => {
                                toast.custom(
                                    <StatusMessage type='error' title='Failed to load image' />,
                                    { duration: 1500 }
                                );
                            }}
                        />
                    ) : (
                        <View className="w-full h-80 bg-gray-100 items-center justify-center">
                            <Icon name="image-outline" size={80} color="#9CA3AF" />
                            <Text className="text-gray-400 mt-2">No Image Available</Text>
                        </View>
                    )}
                </View>

                {/* Product Info Section */}
                <View className="bg-white mt-2 px-4 py-6">
                    {/* Product Name */}
                    <Text className="text-2xl font-bold text-gray-900 mb-2">
                        {product.name || 'Product Name'}
                    </Text>

                    {/* Part Number */}
                    <TouchableOpacity 
                        onPress={() => handleCopyToClipboard(product.partNumber, 'Part Number')}
                        className="flex-row items-center mb-3"
                    >
                        <Icon name="pricetag-outline" size={18} color="#6B7280" />
                        <Text className="text-gray-600 ml-2">
                            Part #: {product.partNumber || 'N/A'}
                        </Text>
                        <Icon name="copy-outline" size={16} color="#9CA3AF" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>

                    {/* Price */}
                    <View className="flex-row items-center mb-4">
                        <Icon name="cash-outline" size={20} color="#10B981" />
                        <Text className="text-2xl font-bold text-green-600 ml-2">
                            ₹{formatPrice(product.price)}
                        </Text>
                    </View>

                    {/* Divider */}
                    <View className="h-px bg-gray-200 my-4" />

                    {/* Description */}
                    {product.description && (
                        <View className="mb-4">
                            <Text className="text-lg font-semibold text-gray-900 mb-2">
                                Description
                            </Text>
                            <Text className="text-gray-600 leading-6">
                                {product.description}
                            </Text>
                        </View>
                    )}

                    {/* Transfer Information */}
                    {product.transferBy && (
                        <View className="mb-4">
                            <Text className="text-lg font-semibold text-gray-900 mb-2">
                                Transfer Information
                            </Text>
                            <View className="bg-gray-50 rounded-lg p-4">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-600">Transfer From:</Text>
                                    <View className="flex-row items-center">
                                        <View 
                                            className="w-2 h-2 rounded-full mr-2"
                                            style={{ backgroundColor: getStatusColor(product.transferBy) }}
                                        />
                                        <Text className="text-gray-900 font-medium">
                                            {getStatusText(product.transferBy)}
                                        </Text>
                                    </View>
                                </View>
                                
                                {product.technicianName && (
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-gray-600">Technician:</Text>
                                        <Text className="text-gray-900 font-medium">
                                            {product.technicianName}
                                        </Text>
                                    </View>
                                )}
                                
                                {product.partAccept && (
                                    <View className="flex-row justify-between">
                                        <Text className="text-gray-600">Status:</Text>
                                        <Text className="text-green-600 font-medium">
                                            Accepted
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Additional Details */}
                    <View className="mb-4">
                        <Text className="text-lg font-semibold text-gray-900 mb-2">
                            Additional Details
                        </Text>
                        <View className="bg-gray-50 rounded-lg p-4">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-gray-600">Product ID:</Text>
                                <TouchableOpacity 
                                    onPress={() => handleCopyToClipboard(product.id, 'Product ID')}
                                    className="flex-row items-center"
                                >
                                    <Text className="text-gray-900">{product.id || 'N/A'}</Text>
                                    <Icon name="copy-outline" size={14} color="#9CA3AF" style={{ marginLeft: 6 }} />
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row justify-between">
                                <Text className="text-gray-600">Status:</Text>
                                <Text className={`font-medium ${product.partAccept ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {product.partAccept ? 'Accepted' : 'Pending'}
                                </Text>
                            </View>
                            {product.transTech && (
                                <View className="flex-row justify-between mt-2">
                                    <Text className="text-gray-600">Transfer Tech:</Text>
                                    <Text className="text-gray-900">{product.transTech}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Action Buttons */}
                <View className="px-4 py-6 mb-6">
                    <TouchableOpacity
                        onPress={() => {
                            toast.custom(
                                <StatusMessage type='success' title='Product details saved' />,
                                { duration: 1500 }
                            );
                            navigation.goBack();
                        }}
                        className="bg-primary-sage600 rounded-xl py-4 items-center mb-3"
                    >
                        <Text className="text-white font-semibold text-base">
                            Close
                        </Text>
                    </TouchableOpacity>
                    
                    {!product.partAccept && (
                        <TouchableOpacity
                            onPress={() => {
                                toast.custom(
                                    <StatusMessage type='info' title='Request sent to accept product' />,
                                    { duration: 2000 }
                                );
                                // Add accept product logic here
                            }}
                            className="bg-green-600 rounded-xl py-4 items-center"
                        >
                            <Text className="text-white font-semibold text-base">
                                Accept Product
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default ProductDetails;

const styles = StyleSheet.create({});