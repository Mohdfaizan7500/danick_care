import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { useAuth } from '../../../context/AuthContext';
import { fetchPartsForComplaint, AttechPartWithComplaints } from '../../../lib/api';

const AddPartBilling = () => {
    const navigation = useNavigation();
    const { importedPart, updateImportedPart, user, imagUrl } = useAuth();
    const route = useRoute();
    const complaintData = route.params?.complaintData || null;

    console.log('Complaint Data in AddPartBilling:', complaintData);

    const [searchQuery, setSearchQuery] = useState('');
    const [parts, setParts] = useState([]);
    const [filteredParts, setFilteredParts] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attachingPartId, setAttachingPartId] = useState(null);
    const isInitialMount = useRef(true);

    // Ensure importedPart is always an array (fallback to empty array)
    const safeImportedPart = Array.isArray(importedPart) ? importedPart : [];

    // Fetch parts from API when component mounts
    const fetchParts = async () => {
        if (!complaintData) {
            console.log('No complaint data available');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                technician_id: user?.id?.toString() || '1',
                service_id: complaintData.service_id?.toString() || complaintData.id?.toString()
            };

            console.log('Fetching parts with payload:', payload);
            const response = await fetchPartsForComplaint(payload);
            console.log('API Response:', response);

            // Handle different response structures
            let partsData = [];
            if (response?.data?.data && Array.isArray(response.data.data)) {
                partsData = response.data.data;
            } else if (response?.data?.result && Array.isArray(response.data.result)) {
                partsData = response.data.result;
            } else if (Array.isArray(response?.data)) {
                partsData = response.data;
            }

            // Map API response to component format
            const formattedParts = partsData.map(part => ({
                id: part.id?.toString(),
                name: part.part_name || 'Part',
                partNumber: part.id?.toString() || '',
                price: parseFloat(part.part_price) || 0,
                imageUrl: part.part_image
                    ? `${imagUrl}${part.part_image}`
                    : 'https://via.placeholder.com/150',
                description: part.description || '',
                transfer_by: part.transfer_by,
                part_accept: part.part_accept, // Keep as string or null
                technician_name: part.technician_name,
                status: part.status // '0' = not attached, '1' = attached
            }));

            console.log('Formatted parts:', formattedParts);
            setParts(formattedParts);
            setFilteredParts(formattedParts);

        } catch (err) {
            console.error('Error fetching parts:', err);
            setError(err.message || 'Failed to fetch parts');
            toast.custom(
                <StatusMessage type='error' title="Failed to load parts" />,
                { duration: 2000 }
            );
            setParts([]);
            setFilteredParts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParts();
    }, [complaintData, user?.id]);

    // Initialize selected parts based on status field
    useEffect(() => {
        if (parts.length > 0 && isInitialMount.current) {
            // Select parts where status is "1" (attached)
            const selectedIds = parts
                .filter(part => part.status === "1" || part.status === 1)
                .map(part => part.id);
            console.log('Selected parts based on status:', selectedIds);
            setSelectedParts(selectedIds);
            isInitialMount.current = false;
        }
    }, [parts]);

    // Filter parts based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredParts(parts);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = parts.filter(
                (part) =>
                    part.name.toLowerCase().includes(query) ||
                    part.partNumber.toLowerCase().includes(query) ||
                    (part.description && part.description.toLowerCase().includes(query))
            );
            setFilteredParts(filtered);
        }
    }, [searchQuery, parts]);

    // Handle part attach/detach
    const handlePartToggle = async (part) => {
        // Check if part_accept is "0" (already assigned)
        if (part.part_accept === "0") {
            toast.custom(
                <StatusMessage 
                    type='error' 
                    title="Part Already Assigned" 
                    message={`${part.name} is already assigned to ${part.technician_name || 'another technician'}. Please cancel it before use.`}
                />,
                { duration: 4000 }
            );
            return; // Stop execution - don't call API
        }

        // If part_accept is null, proceed normally
        const isCurrentlyAttached = selectedParts.includes(part.id);
        const newStatus = isCurrentlyAttached ? "0" : "1";
        
        setAttachingPartId(part.id);
        
        try {
            const payload = {
                part_id: part.id,
                complaint_id: complaintData?.id?.toString(),
                status: newStatus
            };
            
            console.log('Attaching/Detaching part with payload:', payload);
            const response = await AttechPartWithComplaints(payload);
            console.log('Attach/Detach response:', response);
            
            if (response?.data?.success) {
                // Update the part's status in the parts array
                const updatedParts = parts.map(p => {
                    if (p.id === part.id) {
                        return { ...p, status: newStatus };
                    }
                    return p;
                });
                
                setParts(updatedParts);
                setFilteredParts(updatedParts);
                
                // Update selected parts state
                if (newStatus === "1") {
                    // Add to selected parts
                    setSelectedParts(prev => [...prev, part.id]);
                } else {
                    // Remove from selected parts
                    setSelectedParts(prev => prev.filter(id => id !== part.id));
                }
                
                toast.custom(
                    <StatusMessage 
                        type='success' 
                        title={newStatus === "1" ? "Part attached successfully" : "Part detached successfully"} 
                    />,
                    { duration: 1500 }
                );
            } else {
                throw new Error(response?.data?.message || 'Failed to update part');
            }
        } catch (err) {
            console.error('Error attaching/detaching part:', err);
            toast.custom(
                <StatusMessage type='error' title={err.message || 'Failed to update part'} />,
                { duration: 2000 }
            );
        } finally {
            setAttachingPartId(null);
        }
    };

    const renderPartItem = ({ item }) => {
        const isSelected = selectedParts.includes(item.id);
        const isAttaching = attachingPartId === item.id;
        const isAssigned = item.part_accept === "0"; // Part is already assigned to technician
        
        // Calculate opacity - lower opacity for assigned parts
        const cardOpacity = isAssigned ? 0.6 : 1;
        
        const cardClasses = `flex-row items-center p-3 mb-4 rounded-2xl border ${
            isSelected
                ? 'bg-green-50 border-primary-sage600'
                : isAssigned
                ? 'bg-gray-100 border-gray-300'
                : 'bg-white border-ui-border'
        }`;

        return (
            <TouchableOpacity 
                onPress={() => handlePartToggle(item)} 
                className={cardClasses}
                disabled={isAttaching || isAssigned} // Disable if part is already assigned
                style={{ opacity: cardOpacity }}
            >
                <Image
                    source={{ uri: item.imageUrl }}
                    className="w-16 h-16 rounded-lg bg-gray-200"
                    resizeMode="contain"
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                />
                <View className="flex-1 ml-3">
                    <Text className={`font-semibold text-base ${isAssigned ? 'text-gray-500' : 'text-text-primary'}`}>
                        {item.name}
                    </Text>
                    <Text className={`text-sm ${isAssigned ? 'text-gray-400' : 'text-text-secondary'}`}>
                        Part #: {item.partNumber}
                    </Text>
                    {item.description && (
                        <Text className={`text-xs mt-1 ${isAssigned ? 'text-gray-400' : 'text-text-tertiary'}`} numberOfLines={2}>
                            {item.description}
                        </Text>
                    )}
                    <Text className={`font-bold text-base mt-1 ${isAssigned ? 'text-gray-500' : 'text-primary-sage700'}`}>
                        ₹{item.price.toFixed(2)}
                    </Text>
                    
                    {/* Show assigned badge if part is already assigned */}
                    {isAssigned && (
                        <View className="bg-red-100 px-2 py-1 rounded-md mt-2 self-start">
                            <Text className="text-red-600 text-xs font-medium">
                                Transfered to {item.technician_name || 'Technician'}
                            </Text>
                        </View>
                    )}
                </View>
                {isAttaching ? (
                    <ActivityIndicator size="small" color="#2E7D32" />
                ) : (
                    <Icon
                        name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                        size={28}
                        color={isAssigned ? '#ccc' : (isSelected ? '#2E7D32' : '#666')}
                    />
                )}
            </TouchableOpacity>
        );
    };

    const renderLoading = () => (
        <View className="flex-1 justify-center items-center py-10">
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text className="text-text-secondary mt-4">Loading parts...</Text>
        </View>
    );

    const renderError = () => (
        <View className="flex-1 justify-center items-center py-10 px-4">
            <Icon name="alert-circle-outline" size={50} color="#ef4444" />
            <Text className="text-red-500 text-base mt-2 text-center">
                {error || 'Failed to load parts'}
            </Text>
            <TouchableOpacity
                onPress={fetchParts}
                className="mt-4 bg-primary-sage600 px-6 py-2 rounded-lg"
            >
                <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="absolute inset-0 z-50 pointer-events-none">
                <Toaster />
            </View>

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

            {/* Search Bar - Only show if not loading and parts exist */}
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
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close-circle" size={20} color="#666" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}

            {/* Conditional rendering based on loading/error state */}
            {loading ? (
                renderLoading()
            ) : error ? (
                renderError()
            ) : (
                <FlatList
                    data={filteredParts}
                    keyExtractor={(item) => item.id}
                    renderItem={renderPartItem}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center py-10">
                            <Icon name="sad-outline" size={50} color="#ccc" />
                            <Text className="text-text-tertiary text-base mt-2">
                                {searchQuery ? 'No matching parts found' : 'No parts available'}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default AddPartBilling;