import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { DownloadIcon } from 'lucide-react-native';
// Import the auth hook
import { useAuth } from '../../../context/AuthContext'; // Adjust the path as needed

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
    // Access the importedPart state and its updater from AuthContext
    const { updateImportedPart } = useAuth();

    const [searchQuery, setSearchQuery] = useState('');
    const [parts, setParts] = useState(MOCK_PARTS);
    const [filteredParts, setFilteredParts] = useState(MOCK_PARTS);
    const [selectedParts, setSelectedParts] = useState([]); // array of part ids
    const [submitting, setSubmitting] = useState(false);

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

    const toggleSelection = (partId) => {
        if (selectedParts.includes(partId)) {
            setSelectedParts(selectedParts.filter((id) => id !== partId));
        } else {
            setSelectedParts([...selectedParts, partId]);
        }
    };

    const handleSubmit = () => {
        if (selectedParts.length === 0) {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Please select at least one part"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return;
        }

        setSubmitting(true);

        // Simulate API call (e.g., saving selection)
        setTimeout(() => {
            setSubmitting(false);

            // Get full part objects for the selected IDs
            const selectedPartObjects = parts.filter(part =>
                selectedParts.includes(part.id)
            );

            // --- Store the selected parts in AuthContext's importedPart state ---
            updateImportedPart(selectedPartObjects);

            toast.custom(
                <StatusMessage
                    type="success"
                    title={`${selectedParts.length} part(s) added successfully!`}
                    className="mx-4 mb-6"
                />,
                { duration: 2000 }
            );

            // Wait a moment for the toast to be visible, then navigate back to Billing with the selected parts
            setTimeout(() => {
                // Navigate to Billing screen and pass the selected parts as a parameter
                navigation.goBack();
            }, 1500);
        }, 2000);
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
            />

            {/* Search Bar */}
            <View className="px-4 py-2">
                <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-0">
                    <Icon name="search-outline" size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-text-primary text-base"
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

            {/* Selected Count & Submit Button */}
            {selectedParts.length > 0 && (
                <View className="px-4 py-3 border-t border-ui-border bg-white">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-text-primary font-semibold">
                            {selectedParts.length} part(s) selected
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        className={`py-3 rounded-xl items-center ${
                            submitting ? 'bg-ui-disabled' : 'bg-black'
                        }`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <View className="flex-row items-center gap-4">
                                <DownloadIcon size={18} color="#fff" />
                                <Text className="text-text-inverse font-semibold text-base">
                                    Import
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

export default AddPartBilling;