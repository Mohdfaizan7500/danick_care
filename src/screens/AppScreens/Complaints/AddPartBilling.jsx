import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
    ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { useAuth } from '../../../context/AuthContext';
// import { fetchPartsForComplaint, AttechPartWithComplaints } from '../../../lib/api';
import dummyData from '../../../lib/dummyData';

// Helper function to display N/A for missing values
const getDisplayValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }
    return value;
};

const AddPartBilling = () => {
    const navigation = useNavigation();
    const { importedPart, updateImportedPart, user, imagUrl } = useAuth();
    const route = useRoute();
    const complaintData = route.params?.complaintData || null;

    const [searchQuery, setSearchQuery] = useState('');
    const [parts, setParts] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [attachingPartId, setAttachingPartId] = useState(null);
    const isInitialMount = useRef(true);
    const isFetching = useRef(false);

    // Memoize safeImportedPart
    const safeImportedPart = useMemo(() => 
        Array.isArray(importedPart) ? importedPart : [],
        [importedPart]
    );

    // Memoize getImageUrl function
    const getImageUrl = useCallback((imagePath, baseUrl) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        const base = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
        return `${base}${cleanPath}`;
    }, []);

    // Memoize fetchParts function
    const fetchParts = useCallback(async (isRefresh = false) => {
        if (!complaintData || isFetching.current) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        isFetching.current = true;

        try {
            if (!isRefresh) {
                setLoading(true);
            }
            setError(null);
            setErrorMessage(null);

            const payload = {
                technician_id: user?.id?.toString() || '1',
                service_id: complaintData.service_id?.toString() || complaintData.id?.toString()
            };

            // const response = await fetchPartsForComplaint(payload);
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.fetchPartsForReplaced;

            // Check for error in response
            if (response?.data?.success === false) {
                const errorMsg = response?.data?.error?.sqlMessage || 
                                response?.data?.error?.message || 
                                'Failed to fetch parts';
                setError(errorMsg);
                setErrorMessage(errorMsg);
                ToastAndroid.show(errorMsg, ToastAndroid.LONG);
                setParts([]);
                return;
            }

            let partsData = [];
            if (response?.data?.data && Array.isArray(response.data.data)) {
                partsData = response.data.data;
            } else if (response?.data?.result && Array.isArray(response.data.result)) {
                partsData = response.data.result;
            } else if (Array.isArray(response?.data)) {
                partsData = response.data;
            }

            const formattedParts = partsData.map(part => ({
                id: part.id?.toString() || getDisplayValue(part.id),
                qr_code: part.qr_code || getDisplayValue(part.qr_code),
                name: part.part_name || 'Part',
                partNumber: part.id?.toString() || getDisplayValue(part.id),
                price: parseFloat(part.part_price) || 0,
                imageUrl: getImageUrl(part.imageUrl || part.part_image, imagUrl),
                description: part.description || '',
                transfer_by: part.transfer_by || getDisplayValue(part.transfer_by),
                part_accept: part.part_accept,
                technician_name: part.technician_name || getDisplayValue(part.technician_name),
                status: part.status
            }));

            setParts(formattedParts);

            if (isRefresh) {
                isInitialMount.current = true;
                ToastAndroid.show('Parts refreshed successfully', ToastAndroid.SHORT);
            }

        } catch (err) {
            const errorMsg = err?.response?.data?.error?.sqlMessage || 
                            err?.response?.data?.message || 
                            err?.message || 
                            'Failed to fetch parts';
            setError(errorMsg);
            setErrorMessage(errorMsg);
            if (!isRefresh) {
                ToastAndroid.show(errorMsg, ToastAndroid.LONG);
            }
            setParts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
            isFetching.current = false;
        }
    }, [complaintData, user?.id, getImageUrl, imagUrl]);

    // Pull to refresh handler
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchParts(true);
    }, [fetchParts]);

    // Initial fetch
    useEffect(() => {
        fetchParts();
    }, [fetchParts]);

    // Refresh when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchParts(true);
        }, [fetchParts])
    );

    // Initialize selected parts based on status field
    useEffect(() => {
        if (parts.length > 0 && isInitialMount.current) {
            const selectedIds = parts
                .filter(part => part.status === "1" || part.status === 1)
                .map(part => part.id);
            setSelectedParts(selectedIds);
            isInitialMount.current = false;
        }
    }, [parts]);

    // Memoize filtered parts based on search query
    const filteredParts = useMemo(() => {
        if (searchQuery.trim() === '') {
            return parts;
        }
        const query = searchQuery.toLowerCase();
        return parts.filter(
            (part) =>
                part.name.toLowerCase().includes(query) ||
                part.partNumber.toLowerCase().includes(query) ||
                (part.description && part.description.toLowerCase().includes(query))
        );
    }, [searchQuery, parts]);

    // Memoize handlePartToggle function
    const handlePartToggle = useCallback(async (part) => {
        // Clear any previous error
        setErrorMessage(null);

        if (part.part_accept === "0") {
            const technicianName = part.technician_name && part.technician_name !== 'N/A' 
                ? part.technician_name 
                : 'another technician';
            const errorMsg = `${part.name} is already assigned to ${technicianName}`;
            setErrorMessage(errorMsg);
            ToastAndroid.show(errorMsg, ToastAndroid.LONG);
            return;
        }

        const isCurrentlyAttached = selectedParts.includes(part.id);
        const newStatus = isCurrentlyAttached ? "0" : "1";

        setAttachingPartId(part.id);

        try {
            const payload = {
                part_id: part.id,
                complaint_id: complaintData?.id?.toString(),
                status: newStatus
            };

            // const response = await AttechPartWithComplaints(payload);
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.partTransfer;

            // Check for error in response
            if (response?.data?.success === false) {
                const errorMsg = response?.data?.error?.sqlMessage || 
                                response?.data?.error?.message || 
                                response?.data?.message || 
                                'Failed to update part';
                setErrorMessage(errorMsg);
                ToastAndroid.show(errorMsg, ToastAndroid.LONG);
                return;
            }

            if (response?.data?.success) {
                const updatedParts = parts.map(p => {
                    if (p.id === part.id) {
                        return { ...p, status: newStatus };
                    }
                    return p;
                });

                setParts(updatedParts);

                if (newStatus === "1") {
                    setSelectedParts(prev => [...prev, part.id]);
                    ToastAndroid.show(`${part.name} added to bill`, ToastAndroid.SHORT);
                } else {
                    setSelectedParts(prev => prev.filter(id => id !== part.id));
                    ToastAndroid.show(`${part.name} removed from bill`, ToastAndroid.SHORT);
                }
            } else {
                throw new Error(response?.data?.message || 'Failed to update part');
            }
        } catch (err) {
            const errorMsg = err?.response?.data?.error?.sqlMessage || 
                            err?.response?.data?.message || 
                            err?.message || 
                            'Failed to update part';
            setErrorMessage(errorMsg);
            ToastAndroid.show(errorMsg, ToastAndroid.LONG);
        } finally {
            setAttachingPartId(null);
        }
    }, [selectedParts, parts, complaintData]);

    // Memoize renderPartItem function - Reduced card height with bold titles
    const renderPartItem = useCallback(({ item }) => {
        const isSelected = selectedParts.includes(item.id);
        const isAttaching = attachingPartId === item.id;
        const isAssigned = item.part_accept === "0";
        const cardOpacity = isAssigned ? 0.6 : 1;

        const cardClasses = `flex-row items-center p-2 mb-3 rounded-xl border ${isSelected
            ? 'bg-green-50 border-primary-sage600'
            : isAssigned
                ? 'bg-gray-100 border-gray-300'
                : 'bg-white border-ui-border'
            }`;

        return (
            <TouchableOpacity
                onPress={() => handlePartToggle(item)}
                className={cardClasses}
                disabled={isAttaching || isAssigned}
                style={{ opacity: cardOpacity }}
                activeOpacity={0.7}
            >
                {/* Image - Reduced size */}
                {item?.imageUrl ? (
                    <Image
                        source={{ uri: item.imageUrl }}
                        className="w-12 h-12 rounded-lg bg-gray-200"
                        resizeMode="contain"
                    />
                ) : (
                    <View className="w-12 h-12 rounded-lg bg-green-100 items-center justify-center">
                        <Icon name="cube-outline" size={24} color="#10b981" />
                    </View>
                )}

                {/* Content - Compact layout with bold titles */}
                <View className="flex-1 ml-2">
                    <View className="flex-row items-center justify-between">
                        <Text className={`font-bold text-sm text-black ${isAssigned ? 'text-gray-500' : ''}`}>
                            {item.name || 'Part'}
                        </Text>
                        {isAssigned && (
                            <View className="bg-red-100 px-1.5 py-0.5 rounded-md mr-2">
                                <Text className="text-red-600 text-[10px] font-medium">
                                    Transferred
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    <View className="flex-row items-center mt-0.5">
                        <Text className={`text-[11px] text-black font-bold mr-1`}>
                            Part #:
                        </Text>
                        <Text className={`text-[11px] ${isAssigned ? 'text-gray-400' : 'text-text-secondary'}`}>
                            {getDisplayValue(item.partNumber)}
                        </Text>
                        
                        <Text className={`text-[11px] text-black font-bold ml-3 mr-1`}>
                            QR:
                        </Text>
                        <Text className={`text-[11px] ${isAssigned ? 'text-gray-400' : 'text-text-secondary'}`}>
                            {getDisplayValue(item.qr_code)}
                        </Text>
                         {/* <Text className={`text-[11px] text-black font-bold ml-3 mr-1`}>
                            Price:
                        </Text> */}
                        <Text style={{color:'green', fontWeight:"500"}} className={`text-[11px] ml-4 ${isAssigned ? 'text-green-400' : 'text-text-secondary'}`}>
                            ₹{getDisplayValue(item.price)}
                        </Text>
                    </View>

                    {/* Transfer By Badge - Fixed positioning */}
                    <View className="absolute right-0 top-0">
                        <View className="bg-[#C4DAFF] px-2 py-0.5 rounded-full">
                            <Text style={{color:'blue'}} className={`text-[11px] font-medium ${isAssigned ? 'text-blue-800' : 'text-text-secondary'}`}>
                                {getDisplayValue(item?.transfer_by)}
                            </Text>
                        </View>
                    </View>
                    
                    <View className="flex-row items-center mt-0.5">
                        {/* <Text className={`text-[11px] text-black font-bold mr-1`}>
                            Description:
                        </Text> */}
                        <Text className={`text-[11px] flex-1 ${isAssigned ? 'text-gray-400' : 'text-text-secondary'}`} >
                            {getDisplayValue(item.description)}
                        </Text>
                    </View>

                    {isAssigned && item.technician_name && item.technician_name !== 'N/A' && (
                        <Text className="text-red-500 text-[10px] mt-0.5">
                            To: {item.technician_name}
                        </Text>
                    )}
                </View>

                {/* Action Icon - Compact */}
                {isAttaching ? (
                    <ActivityIndicator size="small" color="#2E7D32" />
                ) : (
                    <Icon
                        name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                        size={24}
                        color={isAssigned ? '#ccc' : (isSelected ? '#2E7D32' : '#666')}
                    />
                )}
            </TouchableOpacity>
        );
    }, [selectedParts, attachingPartId, handlePartToggle]);

    // Memoize key extractor
    const keyExtractor = useCallback((item) => item.id || Math.random().toString(), []);

    // Memoize loading and error components
    const renderLoading = useCallback(() => (
        <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text className="text-text-secondary mt-4">Loading parts...</Text>
        </View>
    ), []);

    const renderError = useCallback(() => (
        <View className="flex-1 justify-center items-center py-10 px-4">
            <Icon name="alert-circle-outline" size={50} color="#ef4444" />
            <Text className="text-red-500 text-base mt-2 text-center">
                {error || 'Failed to load parts'}
            </Text>
            <TouchableOpacity
                onPress={() => fetchParts()}
                className="mt-4 bg-primary-sage600 px-6 py-2 rounded-lg"
            >
                <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
        </View>
    ), [error, fetchParts]);

    const renderEmptyComponent = useCallback(() => (
        <View className="items-center justify-center py-10">
            <Icon name="sad-outline" size={50} color="#ccc" />
            <Text className="text-text-tertiary text-base mt-2">
                {searchQuery ? 'No matching parts found' : 'No parts available'}
            </Text>
            {!searchQuery && (
                <TouchableOpacity
                    onPress={onRefresh}
                    className="mt-4 bg-primary-sage600 px-6 py-2 rounded-lg"
                >
                    <Text className="text-white font-semibold">Refresh</Text>
                </TouchableOpacity>
            )}
        </View>
    ), [searchQuery, onRefresh]);

    // Memoize FlatList props
    const flatListProps = useMemo(() => ({
        data: filteredParts,
        keyExtractor,
        renderItem: renderPartItem,
        contentContainerStyle: {
            paddingHorizontal: 16,
            paddingBottom: 16,
            paddingTop: 8,
            flexGrow: 1,
            ...(filteredParts.length === 0 && { justifyContent: 'center' })
        },
        refreshControl: (
            <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2E7D32', '#4CAF50', '#81C784']}
                tintColor="#2E7D32"
                title="Pull to refresh"
                titleColor="#2E7D32"
                progressBackgroundColor="#ffffff"
            />
        ),
        ListEmptyComponent: renderEmptyComponent,
        showsVerticalScrollIndicator: true,
        initialNumToRender: 10,
        maxToRenderPerBatch: 10,
        windowSize: 5,
        removeClippedSubviews: true,
    }), [filteredParts, keyExtractor, renderPartItem, refreshing, onRefresh, renderEmptyComponent]);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Header
                title="Add Parts in Bill"
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5"
                showBackButton={true}
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 pr-7 pt-5"
                rightComponent={
                    selectedParts.length > 0 && (
                        <View className="bg-primary-sage500 rounded-full px-3 py-1">
                            <Text className="text-white font-bold text-sm">
                                {selectedParts.length}
                            </Text>
                        </View>
                    )
                }
            />

            {/* Inline Error Display - Red background with white text */}
            {errorMessage && (
                <View className="bg-red-600 px-4 py-3 mx-4 mt-2 rounded-lg">
                    <View className="flex-row items-center">
                        <Icon name="alert-circle" size={20} color="#ffffff" />
                        <Text className="text-white font-medium ml-2 flex-1">
                            {errorMessage}
                        </Text>
                        <TouchableOpacity onPress={() => setErrorMessage(null)}>
                            <Icon name="close" size={20} color="#ffffff" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* Search Bar */}
            {!loading && parts.length > 0 && (
                <View className="px-4 py-2">
                    <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-0">
                        <Icon name="search-outline" size={20} color="#666" />
                        <TextInput
                            className="flex-1 ml-2 text-text-primary text-base py-3"
                            placeholder="Search by name, part number or description"
                            placeholderTextColor="#999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <TouchableOpacity
                            onPress={() => setSearchQuery('2')}
                            className="bg-amber-400 px-2 py-1 rounded-md ml-2"
                        >
                            <Text className="text-xs font-bold text-white">Demo</Text>
                        </TouchableOpacity>
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Conditional rendering */}
            {loading && !refreshing ? (
                renderLoading()
            ) : error ? (
                renderError()
            ) : (
                <FlatList {...flatListProps} />
            )}
        </SafeAreaView>
    );
};

export default AddPartBilling;
