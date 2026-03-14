import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera } from 'react-native-image-picker';
import { toast, Toaster } from 'sonner-native';
import { Colors } from '../../constants/Color';
import Header from '../../components/Header';

const AddPart = ({ navigation }) => {
    const [imageUri, setImageUri] = useState(null);
    const [partName, setPartName] = useState('');
    const [modelNumber, setModelNumber] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('Partner');
    const [loading, setLoading] = useState(false);

    const takePhoto = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            includeBase64: false,
            saveToPhotos: true,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                // User cancelled camera
            } else if (response.error) {
                Alert.alert('Error', response.error);
            } else {
                const source = { uri: response.assets[0].uri };
                setImageUri(source.uri);
            }
        });
    };

    const handleSubmit = () => {
        // Validation
        if (!partName.trim()) {
            toast.error('Part name is required');
            return;
        }
        if (!modelNumber.trim()) {
            toast.error('Model number is required');
            return;
        }

        setLoading(true);

        // Simulate API call with 2 second delay
        setTimeout(() => {
            setLoading(false);

            // Clear all fields
            setImageUri(null);
            setPartName('');
            setModelNumber('');
            setPrice('');
            setCategory('Partner');

            // Show success toast
            toast.custom(
                <View className="bg-green-50 border border-green-500 flex-row items-center gap-2 p-4 rounded-xl shadow-lg mx-4">
                    <Icon name="checkmark-circle" size={24} color={Colors.primary.sage500} />
                    <View className="flex-1">
                        <Text className="text-green-800 font-semibold text-base">Success!</Text>
                        <Text className="text-green-700 text-sm">Part added successfully</Text>
                    </View>
                </View>,
                { duration: 3000 }
            );

            // Navigate back after a short delay to let the toast be seen
            setTimeout(() => {
                navigation.goBack();
            }, 800);
        }, 2000);
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Toaster for custom notifications */}
            <View className="absolute inset-0 z-50 pointer-events-none">
                <Toaster />
            </View>

            {/* Custom Header */}
            <Header
                title="Add Part"
                showBackButton={true}
                backButtonColor="#333"
                titleStyle="text-xl font-bold text-gray-800"
                titlePosition="left"
                containerStyle="bg-white px-4 py-3 border-b border-gray-200"
            />

            <ScrollView className="flex-1 px-4 pt-6">
                {/* Image Picker - Camera Only */}
                <TouchableOpacity
                    onPress={takePhoto}
                    className="bg-white rounded-xl border-2 border-dashed border-blue-300 p-4 items-center mb-6"
                >
                    {imageUri ? (
                        <Image
                            source={{ uri: imageUri }}
                            className="w-32 h-32 rounded-lg"
                            resizeMode="cover"
                        />
                    ) : (
                        <>
                            <Icon name="camera-outline" size={40} color="#3b82f6" />
                            <Text className="text-blue-600 mt-2 font-medium">Take Photo</Text>
                        </>
                    )}
                </TouchableOpacity>

                {/* Part Name */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">
                        Part Name <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                        placeholder="e.g., Fan Blade"
                        value={partName}
                        onChangeText={setPartName}
                    />
                </View>

                {/* Model Number */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">
                        Model Number <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                        placeholder="e.g., FB-2025"
                        value={modelNumber}
                        onChangeText={setModelNumber}
                    />
                </View>

                {/* Price (Optional) */}
                <View className="mb-4">
                    <Text className="text-gray-700 font-medium mb-1">
                        Price <Text className="text-gray-400">(optional)</Text>
                    </Text>
                    <TextInput
                        className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base"
                        placeholder="e.g., 299"
                        keyboardType="numeric"
                        value={price}
                        onChangeText={setPrice}
                    />
                </View>

                {/* Category Dropdown */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-medium mb-1">
                        Category <Text className="text-red-500">*</Text>
                    </Text>
                    <View className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <Picker
                            selectedValue={category}
                            onValueChange={(itemValue) => setCategory(itemValue)}
                            dropdownIconColor="#3b82f6"
                            style={{ height: 50 }}
                        >
                            <Picker.Item label="Partner" value="Partner" />
                            <Picker.Item label="Service Center" value="Service Center" />
                            <Picker.Item label="Market" value="Market" />
                            <Picker.Item label="Replace" value="Replace" />
                        </Picker>
                    </View>
                </View>

                {/* Submit Button with Loader */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`bg-blue-600 py-4 rounded-xl mb-10 ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                        <Text className="text-white text-center font-bold text-lg">Add Part</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AddPart;