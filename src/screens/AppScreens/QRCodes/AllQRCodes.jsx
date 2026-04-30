import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, ActivityIndicator, RefreshControl, TextInput, Modal } from 'react-native'
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Icon from 'react-native-vector-icons/Ionicons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useAuth } from '../../../context/AuthContext'
import { AssignQRCodeList } from '../../../lib/api'
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import Clipboard from '@react-native-clipboard/clipboard';
import { FlashList } from "@shopify/flash-list";
import QRCodeCard from '../../../components/QRCodeCard'; // Import the card component

// Skeleton component for loading state
const SkeletonCard = () => (
    <View className="bg-white border border-gray-300 rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
                <View className="w-20 h-20 bg-gray-200 rounded-xl" />
                <View className="ml-4 flex-1">
                    <View className="h-5 w-32 bg-gray-200 rounded mb-2" />
                    <View className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <View className="h-3 w-40 bg-gray-200 rounded" />
                </View>
            </View>
            <View className="h-6 w-16 bg-gray-200 rounded" />
        </View>
    </View>
);

const AllQRCodes = ({ route }) => {
    console.log('rote',route)
    const name = route.name;
    console.log('rote',name)

    const { user, imagUrl } = useAuth();
    const navigation = useNavigation();
    const [qrCodes, setQrCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const hasFetched = useRef(false);
    const isMounted = useRef(true);

    const getStatus = ()=>{
        switch(name){
            case "AllQRCodes":
                return "";
            case "UsedQRCodes":
                return "1";
             case "FreshQRCodes":
                return "0";
            default:
                 return "";
        }
    }

    // Fetch QR codes from API
    const fetchQRCodes = async (isRefresh = false) => {
        if (!isMounted.current) return;
        
        try {
            setError(null);
            
            if (!isRefresh) {
                setLoading(true);
            }
            
            const payload = {
                technician_id: user?.id?.toString() || "1",
                status: getStatus(name) // Empty string for all QR codes
            };
            
            console.log('Fetching all QR codes with payload:', payload);
            const response = await AssignQRCodeList(payload);
            console.log('AssignQRCodeList response:', response);

            if (response?.data?.success && response?.data?.data && isMounted.current) {
                // Remove duplicates by qr_id
                const uniqueQRCodes = [];
                const seenIds = new Set();
                
                response.data.data.forEach((item, index) => {
                    if (!seenIds.has(item.qr_id)) {
                        seenIds.add(item.qr_id);
                        uniqueQRCodes.push({
                            id: `${item.qr_id}_${index}`,
                            qrCodeNumber: item.qr_id,
                            complaintId: item.complaint_id || null,
                            status: item.complaint_id ? 'used' : 'fresh',
                            imageUrl: item.qr_img ? `${imagUrl}${item.qr_img}` : null,
                            qr_img: item.qr_img,
                            isUsed: item.complaint_id !== null && item.complaint_id !== "",
                            partName: item.part_name || 'Spare Part',
                            customerName: item.customer_name || null,
                            technicianName: item.technician_name || null
                        });
                    }
                });
                
                setQrCodes(uniqueQRCodes);
            } else if (response?.data?.success === false) {
                const errorMessage = response?.data?.message || 'Failed to fetch QR codes';
                setError(errorMessage);
                toast.custom(
                    <StatusMessage type='error' title={errorMessage} />,
                    { duration: 2000 }
                );
                setQrCodes([]);
            } else {
                setQrCodes([]);
            }
        } catch (err) {
            console.error('Error fetching QR codes:', err);
            const errorMessage = err.message || 'Network error. Please check your connection.';
            setError(errorMessage);
            toast.custom(
                <StatusMessage type='error' title='Failed to load QR codes' description={errorMessage} />,
                { duration: 2000 }
            );
            setQrCodes([]);
        } finally {
            if (isMounted.current) {
                setLoading(false);
                setRefreshing(false);
            }
        }
    };

    // Pull to refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        await fetchQRCodes(true);
    };

    // Copy QR code to clipboard
    const handleCopyQRCode = (qrCodeNumber) => {
        Clipboard.setString(qrCodeNumber);
        toast.custom(
            <StatusMessage
                type='info'
                title='QR Code Copied!'
                message={`QR Code: ${qrCodeNumber}`}
            />,
            { duration: 1000 }
        );
    };

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const handleQRCodePress = (item) => {
        console.log('QR Code pressed:', item.qrCodeNumber);
        if (item.complaintId && item.complaintId !== 'N/A' && item.complaintId !== null) {
            // Navigate to QRCodeDetails screen
            navigation.navigate('QRCodeDetails', { 
                qrData: item,
                status: "qrcode"
            });
        } else {
            toast.custom(
                <StatusMessage 
                    type='info' 
                    title='No Complaint Linked' 
                    message='This QR code is not linked to any complaint.' 
                />,
                { duration: 1500 }
            );
        }
    };

    // Filter products based on search query
    const filteredQRCodes = useMemo(() => {
        if (!searchQuery.trim()) {
            return qrCodes;
        }

        const query = searchQuery.toLowerCase().trim();
        return qrCodes.filter(item =>
            item.qrCodeNumber?.toLowerCase().includes(query) ||
            item.complaintId?.toLowerCase().includes(query) ||
            item.partName?.toLowerCase().includes(query)
        );
    }, [qrCodes, searchQuery]);

    // Get status badge based on usage
    const getStatusBadge = (isUsed) => {
        if (isUsed) {
            return { text: 'Used', color: 'bg-orange-100 text-orange-600' };
        }
        return { text: 'Fresh', color: 'bg-green-100 text-green-600' };
    };

    // Get image URL
    const getImageUrl = (item) => {
        if (item.imageUrl) return item.imageUrl;
        if (item.qr_img) return `${imagUrl}${item.qr_img}`;
        return null;
    };

    // Render each QR code item using the QRCodeCard component
    const renderQRCodeItem = ({ item, index }) => {
        return (
            <QRCodeCard
                item={item}
                index={index}
                onPress={handleQRCodePress}
                onImagePress={openImageModal}
                onCopy={handleCopyQRCode}
                getImageUrl={getImageUrl}
                getStatusBadge={getStatusBadge}
            />
        );
    };

    // Skeleton list renderer
    const renderSkeleton = () => (
        <View style={{ padding: 16 }}>
            {[1, 2, 3, 4].map((key) => (
                <SkeletonCard key={key} />
            ))}
        </View>
    );

    // Initial fetch on mount - only once
    useEffect(() => {
        isMounted.current = true;
        if (!hasFetched.current) {
            hasFetched.current = true;
            fetchQRCodes();
        }
        
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Refresh on focus - only if not loading
    useFocusEffect(
        useCallback(() => {
            console.log('AllQRCodes focused');
            if (!loading && !refreshing) {
                fetchQRCodes(true);
            }
            return () => {};
        }, [loading, refreshing])
    );

    // Loading state
    if (loading && !refreshing) {
        return renderSkeleton();
    }

    // Error state - show retry
    if (error && !loading && qrCodes.length === 0) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 px-4">
                <Icon name="alert-circle-outline" size={64} color="#EF4444" />
                <Text className="text-red-500 text-base text-center mt-4 mb-2">{error}</Text>
                <TouchableOpacity
                    onPress={() => fetchQRCodes()}
                    className="mt-4 bg-teal-600 px-6 py-2 rounded-lg"
                >
                    <Text className="text-white font-semibold">Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header with total count */}
            <View className="flex-row justify-between items-center px-4 py-3 bg-white border-b border-gray-200">
                <Text className="text-sm text-gray-600">
                    Total QR Codes: <Text className="font-bold text-teal-600">{qrCodes.length}</Text>
                </Text>
                <TouchableOpacity onPress={onRefresh} className="p-1">
                    <Icon name="refresh-outline" size={20} color="#58A890" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-4 py-2 bg-white border-b border-gray-200">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-1 border border-gray-200">
                    <Icon name="search-outline" size={20} color="#999999" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-text-primary py-2"
                        placeholder="Search by QR code, complaint ID, part name..."
                        placeholderTextColor="#999999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color="#999999" />
                        </TouchableOpacity>
                    )}
                </View>
                {searchQuery.length > 0 && (
                    <Text className="text-xs text-gray-400 mt-1 ml-1">
                        Found {filteredQRCodes.length} result(s)
                    </Text>
                )}
            </View>

            <FlashList
                data={filteredQRCodes}
                keyExtractor={(item) => item.id}
                renderItem={renderQRCodeItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
                estimatedItemSize={120}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#58A890']}
                        tintColor="#58A890"
                    />
                }
                ListEmptyComponent={
                    !loading && !error && (
                        <View className="items-center justify-center mt-10">
                            <Icon name="qr-code-outline" size={60} color="#CCCCCC" />
                            <Text className="text-center text-gray-400 mt-4">
                                {searchQuery ? 'No QR codes match your search' : 'No QR codes available'}
                            </Text>
                            {searchQuery && (
                                <TouchableOpacity
                                    onPress={() => setSearchQuery('')}
                                    className="mt-2 px-4 py-2 bg-teal-100 rounded-lg"
                                >
                                    <Text className="text-teal-700">Clear Search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
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
                    <View className="w-10/12 h-3/6 bg-white rounded-xl overflow-hidden">
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        )}
                    </View>
                    <TouchableOpacity 
                        onPress={() => setModalVisible(false)}
                        className="absolute top-10 right-5 bg-black/50 rounded-full p-2"
                    >
                        <Icon name="close-outline" size={24} color="#fff" />
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

export default AllQRCodes;

const styles = StyleSheet.create({});