import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import StatusMessage from '../../../components/StatusMessage';
import { toast, Toaster } from 'sonner-native';
import { GetComplaintsDetails } from '../../../lib/api';

const ProductDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { product } = route.params;
    
    const [complaintDetails, setComplaintDetails] = useState(null);
    const [loadingComplaint, setLoadingComplaint] = useState(false);
    
    console.log('Received product data:', product);

    // Fetch complaint details when component mounts and product has complaintId and type is "Yes"
    useEffect(() => {
        if (product?.complaintId && product?.type === "Yes") {
            fetchComplaintDetails(product.complaintId);
        }
    }, [product]);

    const fetchComplaintDetails = async (complaintId) => {
        setLoadingComplaint(true);
        try {
            const payload = {
                complaint_id: complaintId
            };
            const response = await GetComplaintsDetails(payload);
            console.log('Complaint Details Response:', response);
            
            if (response?.data?.success && response?.data?.result) {
                setComplaintDetails(response.data.result);
                toast.custom(
                    <StatusMessage type='success' title='Complaint details loaded' />,
                    { duration: 1500 }
                );
            } else {
                toast.custom(
                    <StatusMessage type='error' title='Failed to load complaint details' />,
                    { duration: 2000 }
                );
            }
        } catch (error) {
            console.error('Error fetching complaint details:', error);
            toast.custom(
                <StatusMessage type='error' title='Error loading complaint details' />,
                { duration: 2000 }
            );
        } finally {
            setLoadingComplaint(false);
        }
    };

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

    const getStatusBadge = (status) => {
        switch(status) {
            case 'success':
                return { color: '#10B981', bg: '#D1FAE5', text: 'Completed' };
            case 'pending':
                return { color: '#F59E0B', bg: '#FEF3C7', text: 'Pending' };
            case 'in-progress':
                return { color: '#3B82F6', bg: '#DBEAFE', text: 'In Progress' };
            default:
                return { color: '#6B7280', bg: '#F3F4F6', text: status || 'Unknown' };
        }
    };

    const handleCopyToClipboard = (text, label) => {
        toast.custom(
            <StatusMessage type='success' title={`${label} copied to clipboard`} />,
            { duration: 1500 }
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
           <View className="absolute inset-0 z-50 w-90% pointer-events-none">
            <Toaster />
          </View>
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
                    {/* Warning Banner for Already in Use Part */}
                    {product.type === "Yes" && (
                        <View className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <View className="flex-row items-center mb-2">
                                <Icon name="warning-outline" size={20} color="#eab308" />
                                <Text className="text-yellow-700 font-semibold ml-2">
                                    Part Already in Use
                                </Text>
                            </View>
                            <Text className="text-yellow-700 text-sm">
                                This part is currently being used in Complaint #{product.complaintId}
                            </Text>
                            {product.technicianName && (
                                <Text className="text-yellow-700 text-sm mt-1">
                                    Assigned to Technician: {product.technicianName}
                                </Text>
                            )}
                        </View>
                    )}

                    {/* Complaint Details Section - Loading State */}
                    {product.type === "Yes" && loadingComplaint && (
                        <View className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <View className="flex-row items-center">
                                <ActivityIndicator size="small" color="#3B82F6" />
                                <Text className="text-blue-600 ml-2">Loading complaint details...</Text>
                            </View>
                        </View>
                    )}

                    {/* Complaint Details Section - Display Data */}
                    {product.type === "Yes" && complaintDetails && (
                        <View className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <View className="flex-row items-center mb-3">
                                <Icon name="document-text-outline" size={20} color="#3B82F6" />
                                <Text className="text-blue-700 font-semibold ml-2">
                                    Complaint Details
                                </Text>
                            </View>
                            
                            <View className="space-y-2">
                                {/* Complaint ID */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">Complaint ID:</Text>
                                    <Text className="text-gray-800 text-sm font-medium">#{complaintDetails.id}</Text>
                                </View>
                                
                                {/* CSN */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">CSN Number:</Text>
                                    <Text className="text-gray-800 text-sm font-medium">{complaintDetails.csn}</Text>
                                </View>
                                
                                {/* Service Name */}
                                <View>
                                    <Text className="text-gray-600 text-sm mb-1">Service:</Text>
                                    <Text className="text-gray-800 text-sm font-medium">{complaintDetails.service_name}</Text>
                                </View>
                                
                                {/* Customer Name */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">Customer Name:</Text>
                                    <Text className="text-gray-800 text-sm font-medium">{complaintDetails.customer_name}</Text>
                                </View>
                                
                                {/* Customer Mobile */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">Mobile Number:</Text>
                                    <Text className="text-gray-800 text-sm font-medium">{complaintDetails.customer_mobile}</Text>
                                </View>
                                
                                {/* Service Address */}
                                <View>
                                    <Text className="text-gray-600 text-sm mb-1">Service Address:</Text>
                                    <Text className="text-gray-800 text-sm">{complaintDetails.service_address}</Text>
                                </View>
                                
                                {/* Slot Date & Time */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">Slot Date:</Text>
                                    <Text className="text-gray-800 text-sm font-medium">{complaintDetails.slot_date}</Text>
                                </View>
                                
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">Slot Time:</Text>
                                    <Text className="text-gray-800 text-sm font-medium">{complaintDetails.slot_time}</Text>
                                </View>
                                
                                {/* Total Paid Amount */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">Total Amount:</Text>
                                    <Text className="text-green-600 text-sm font-bold">₹{complaintDetails.total_paid_amt}</Text>
                                </View>
                                
                                {/* Status Badge */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-600 text-sm">Status:</Text>
                                    <View className={`px-3 py-1 rounded-full`} style={{ backgroundColor: getStatusBadge(complaintDetails.status).bg }}>
                                        <Text className={`text-xs font-medium`} style={{ color: getStatusBadge(complaintDetails.status).color }}>
                                            {getStatusBadge(complaintDetails.status).text}
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* Rating */}
                                {complaintDetails.rating && (
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-gray-600 text-sm">Rating:</Text>
                                        <View className="flex-row items-center">
                                            <Icon name="star" size={14} color="#F59E0B" />
                                            <Text className="text-gray-800 text-sm ml-1">{complaintDetails.rating}</Text>
                                        </View>
                                    </View>
                                )}
                                
                                {/* Remark */}
                                {complaintDetails.remark && (
                                    <View>
                                        <Text className="text-gray-600 text-sm mb-1">Remark:</Text>
                                        <Text className="text-gray-800 text-sm">{complaintDetails.remark}</Text>
                                    </View>
                                )}
                                
                                {/* Parts Used in Complaint */}
                                {complaintDetails.parts && complaintDetails.parts.length > 0 && (
                                    <View className="mt-2 pt-2 border-t border-blue-200">
                                        <Text className="text-blue-700 font-semibold text-sm mb-2">
                                            Parts Used in This Complaint
                                        </Text>
                                        {complaintDetails.parts.map((part, index) => (
                                            <View key={index} className="mb-2 p-2 bg-white rounded-lg">
                                                <View className="flex-row justify-between">
                                                    <Text className="text-gray-800 text-sm font-medium">{part.part_name}</Text>
                                                    <Text className="text-green-600 text-sm font-bold">₹{part.part_price}</Text>
                                                </View>
                                                {part.qr_code && (
                                                    <Text className="text-gray-500 text-xs mt-1">QR: {part.qr_code}</Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </View>
                    )}

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