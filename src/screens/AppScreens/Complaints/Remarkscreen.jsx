import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { launchImageLibrary } from 'react-native-image-picker';
import DialogBox from '../../../components/DilaogBox';

const Remarkscreen = () => {
    const navigation = useNavigation();

    // State for images
    const [image1Uri, setImage1Uri] = useState(null);
    const [image2Uri, setImage2Uri] = useState(null);

    // State for AMC dropdown
    const [selectedAMC, setSelectedAMC] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const amcOptions = ['A', 'B', 'C', 'D', 'E'];

    // State for remark
    const [remark, setRemark] = useState('');

    // Compute if form is complete
    const isFormComplete = 
        selectedAMC.trim() !== '' && 
        remark.trim() !== '' && 
        image1Uri !== null && 
        image2Uri !== null;

    // Image picker function
    const pickImage = (imageNumber) => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) return;
            if (response.error) {
                toast.error('Error picking image');
                return;
            }
            if (response.assets && response.assets[0]) {
                const uri = response.assets[0].uri;
                if (imageNumber === 1) setImage1Uri(uri);
                else setImage2Uri(uri);

                // Show success toast
                toast.custom(
                    <StatusMessage
                        type="success"
                        title={`Image ${imageNumber} uploaded successfully`}
                        className="mx-4 mb-6"
                    />,
                    { duration: 2000 }
                );
            }
        });
    };

    // Delete image
    const deleteImage = (imageNumber) => {
        if (imageNumber === 1) setImage1Uri(null);
        else setImage2Uri(null);
    };

    // Handle next button
    const handleNext = () => {
        // Since button is disabled unless form is complete, we can safely navigate
        navigation.replace('Billing', {
            selectedAMC,
            remark,
            image1: image1Uri,
            image2: image2Uri,
        });
    };

    // Dropdown footer buttons
    const dropdownFooter = (
        <View className="flex-row justify-end gap-2">
            <TouchableOpacity
                onPress={() => setDropdownVisible(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
            >
                <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Toaster position="top-center" />

            <Header
                title="Remark"
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5"
                showBackButton={true}
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 pr-7 pt-5"
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
                    {/* AMC Dropdown */}
                    <View className="mb-4">
                        <Text className="text-text-primary font-semibold text-base mb-1">
                            Select AMC
                        </Text>
                        <TouchableOpacity
                            onPress={() => setDropdownVisible(true)}
                            className="border border-ui-border rounded-xl px-4 py-3 bg-background-secondary flex-row justify-between items-center"
                        >
                            <Text className={selectedAMC ? 'text-text-primary' : 'text-text-tertiary'}>
                                {selectedAMC || 'Choose AMC option'}
                            </Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Remark */}
                    <View className="mb-4">
                        <Text className="text-text-primary font-semibold text-base mb-1">
                            Remark
                        </Text>
                        <TextInput
                            className="border border-ui-border rounded-xl px-4 py-3 text-text-primary bg-background-secondary"
                            placeholder="Add any remarks"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={remark}
                            onChangeText={setRemark}
                        />
                    </View>

                    {/* Image Upload Section */}
                    <Text className="text-text-primary font-semibold text-base mb-2">
                        Upload Images
                    </Text>

                    {/* Image 1 */}
                    <View className="mb-4">
                        <Text className="text-text-secondary text-sm mb-1">Image 1</Text>
                        {image1Uri ? (
                            <View className="relative">
                                <Image
                                    source={{ uri: image1Uri }}
                                    className="w-full h-40 rounded-xl bg-gray-200"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={() => deleteImage(1)}
                                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                                >
                                    <Icon name="trash-outline" size={22} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => pickImage(1)}
                                className="border-2 border-dashed border-ui-border rounded-xl p-6 items-center justify-center bg-background-secondary"
                            >
                                <Icon name="cloud-upload-outline" size={40} color="#666" />
                                <Text className="text-text-primary font-semibold text-base mt-2">
                                    Upload Image 1
                                </Text>
                                <Text className="text-text-tertiary text-sm text-center mt-1">
                                    Tap to browse
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Image 2 */}
                    <View className="mb-6">
                        <Text className="text-text-secondary text-sm mb-1">Image 2</Text>
                        {image2Uri ? (
                            <View className="relative">
                                <Image
                                    source={{ uri: image2Uri }}
                                    className="w-full h-40 rounded-xl bg-gray-200"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={() => deleteImage(2)}
                                    className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                                >
                                    <Icon name="trash-outline" size={22} color="#ff4444" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={() => pickImage(2)}
                                className="border-2 border-dashed border-ui-border rounded-xl p-6 items-center justify-center bg-background-secondary"
                            >
                                <Icon name="cloud-upload-outline" size={40} color="#666" />
                                <Text className="text-text-primary font-semibold text-base mt-2">
                                    Upload Image 2
                                </Text>
                                <Text className="text-text-tertiary text-sm text-center mt-1">
                                    Tap to browse
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Next Button - enabled only when all fields are filled */}
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={!isFormComplete}
                        className={`py-4 rounded-xl items-center mb-8 ${
                            isFormComplete ? 'bg-black' : 'bg-gray-400'
                        }`}
                    >
                        <Text className="text-white font-semibold text-base">Next</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* AMC Selection Dialog */}
            <DialogBox
                visible={dropdownVisible}
                onClose={() => setDropdownVisible(false)}
                title="Select AMC"
                size="sm"
                footer={dropdownFooter}
                closeOnBackdropPress={true}
            >
                <View className="py-2">
                    {amcOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => {
                                setSelectedAMC(option);
                                setDropdownVisible(false);
                            }}
                            className={`py-3 px-2 border-b border-gray-100 ${
                                selectedAMC === option ? 'bg-primary-sage100' : ''
                            }`}
                        >
                            <Text
                                className={`text-base ${
                                    selectedAMC === option
                                        ? 'text-primary-sage700 font-semibold'
                                        : 'text-text-primary'
                                }`}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </DialogBox>
        </SafeAreaView>
    );
};

export default Remarkscreen;