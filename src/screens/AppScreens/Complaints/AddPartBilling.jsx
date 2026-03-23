import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { useAuth } from '../../../context/AuthContext';

// Mock parts data (same as before)
const MOCK_PARTS = [
    {
        id: '1',
        name: 'Air Filter',
        partNumber: 'AF-1234',
        price: 25.99,
        imageUrl: 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRzpUD-MLZryWW0f7BHSKBVTa4PykYQZ_8mNsfn1-mNfil1EHaoGdbABmNleekWiTKDPnbfUEUencWb95yJyShEicu2ikhd4Ocqu5jLiAqkLJvEMk3JLRrSCQ',
    },
    {
        id: '2',
        name: 'Oil Filter',
        partNumber: 'OF-5678',
        price: 15.50,
        imageUrl: 'https://m.media-amazon.com/images/I/718ZB090iKL._AC_UF1000,1000_QL80_.jpg',
    },
    {
        id: '3',
        name: 'Brake Pad Set',
        partNumber: 'BP-9012',
        price: 45.00,
        imageUrl: 'https://rukminim2.flixcart.com/image/480/640/xif0q/vehicle-disc-pad/o/a/r/front-and-back-brake-pad-pa-original-imagp5gbzzfpxrte.jpeg?q=90',
    },
    {
        id: '4',
        name: 'Spark Plug',
        partNumber: 'SP-3456',
        price: 8.75,
        imageUrl: 'https://di-uploads-pod36.dealerinspire.com/bmwofreading/uploads/2020/06/bmw-spark-plugs-reading-pa.jpg',
    },
    {
        id: '5',
        name: 'Battery',
        partNumber: 'BT-7890',
        price: 120.00,
        imageUrl: 'https://rukminim2.flixcart.com/image/480/480/xif0q/electronic-hobby-kit/t/i/u/5v-1500-mah-polymer-ni-mh-rechargeable-4-cell-battery-pack-original-imagpedczmkj5nkh.jpeg?q=90',
    },
];

const AddPartBilling = () => {
    const navigation = useNavigation();
    const { importedPart, updateImportedPart } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [parts] = useState(MOCK_PARTS);
    const [filteredParts, setFilteredParts] = useState(MOCK_PARTS);
    const [selectedParts, setSelectedParts] = useState([]);

    // Ensure importedPart is always an array (fallback to empty array)
    const safeImportedPart = Array.isArray(importedPart) ? importedPart : [];

    // Initialize selected parts from context when component mounts or context updates
    useEffect(() => {
        const selectedIds = safeImportedPart
            .filter(part => parts.some(p => p.id === part.id))
            .map(part => part.id);
        setSelectedParts(selectedIds);
    }, [safeImportedPart, parts]);

    // Filter parts based on search query
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredParts(parts);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = parts.filter(
                (part) =>
                    part.name.toLowerCase().includes(query) ||
                    part.partNumber.toLowerCase().includes(query)
            );
            setFilteredParts(filtered);
        }
    }, [searchQuery, parts]);

    // Sync context with current selection
    const syncContext = (newSelectedIds) => {
        // Get the full objects of the newly selected parts
        const selectedPartObjects = parts.filter(part =>
            newSelectedIds.includes(part.id)
        );

        // Keep other parts from context that are NOT in the current parts list
        const otherParts = safeImportedPart.filter(
            part => !parts.some(p => p.id === part.id)
        );

        // Combine and update context
        updateImportedPart([...otherParts, ...selectedPartObjects]);
    };

    const toggleSelection = (partId) => {
        const newSelectedIds = selectedParts.includes(partId)
            ? selectedParts.filter(id => id !== partId)
            : [...selectedParts, partId];

        setSelectedParts(newSelectedIds);
        syncContext(newSelectedIds);
    };

    const renderPartItem = ({ item }) => {
        const isSelected = selectedParts.includes(item.id);
        const cardClasses = `flex-row items-center p-3 mb-4 rounded-2xl border ${
            isSelected
                ? 'bg-green-50 border-primary-sage600'
                : 'bg-white border-ui-border'
        }`;

        return (
            <TouchableOpacity onPress={() => toggleSelection(item.id)} className={cardClasses}>
                <Image
                    source={{ uri: item.imageUrl }}
                    className="w-16 h-16 rounded-lg bg-gray-200"
                    resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                    <Text className="text-text-primary font-semibold text-base">
                        {item.name}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                        Part #: {item.partNumber}
                    </Text>
                    <Text className="text-primary-sage700 font-bold text-base">
                        ₹{item.price.toFixed(2)}
                    </Text>
                </View>
                <Icon
                    name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                    size={28}
                    color={isSelected ? '#2E7D32' : '#666'}
                />
            </TouchableOpacity>
        );
    };

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

            {/* Search Bar */}
            <View className="px-4 py-2">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-0">
                    <Icon name="search-outline" size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-text-primary text-base py-3"
                        placeholder="Search by name or part number"
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

            {/* Parts List */}
            <FlatList
                data={filteredParts}
                keyExtractor={(item) => item.id}
                renderItem={renderPartItem}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-10">
                        <Icon name="sad-outline" size={50} color="#ccc" />
                        <Text className="text-text-tertiary text-base mt-2">
                            No parts found
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
};

export default AddPartBilling;