import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { launchCamera } from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import DialogBox from '../../../components/DilaogBox';
import { UploadComplaintImage, deletComplaintImage, getComplaintImage, UpdateRemark } from '../../../lib/api';
import ToggleSwitch from 'toggle-switch-react-native';

const Remarkscreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { complaintData, isVerified, isImageUploaded } = route.params || {};
    console.log('Complaint Data received in Remarkscreen:', complaintData);

    // State for images
    const [image1Uri, setImage1Uri] = useState(null);
    const [image2Uri, setImage2Uri] = useState(null);
    const [uploadingImage1, setUploadingImage1] = useState(false);
    const [uploadingImage2, setUploadingImage2] = useState(false);
    const [image1Id, setImage1Id] = useState(null);
    const [image2Id, setImage2Id] = useState(null);
    const [deletingImage1, setDeletingImage1] = useState(false);
    const [deletingImage2, setDeletingImage2] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // State for Customer Type dropdown
    const [selectedCustomerType, setSelectedCustomerType] = useState('');
    const [customerTypeDropdownVisible, setCustomerTypeDropdownVisible] = useState(false);
    const customerTypeOptions = ['A', 'B', 'C', 'D'];

    // State for remark
    const [remark, setRemark] = useState('');

    // State for delete confirmation dialog
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null); // '1' or '2'

    // State for Convert to AMC toggle
    const [convertToAMC, setConvertToAMC] = useState(false);

    // Compute if form is complete (only needed when convertToAMC is false)
    const isFormComplete =
        (selectedCustomerType || '').trim() !== '' &&
        (remark || '').trim() !== '' &&
        image1Uri !== null &&
        image2Uri !== null &&
        image1Id !== null &&
        image2Id !== null;

    // Fetch existing images on component mount
    useEffect(() => {
        if (complaintData?.remark && complaintData.remark !== '') {
            setRemark(complaintData.remark);
        }
        if (complaintData?.review && complaintData.review !== '') {
            setSelectedCustomerType(complaintData.review);
        }
    }, [complaintData]);

    useEffect(() => {
        if (complaintData.remark !== '') {
            setRemark(complaintData.remark);
        }
        if (complaintData.review !== '') {
            setSelectedCustomerType(complaintData.review);
        }

    }, []);

    // Function to fetch existing images from server
    const fetchExistingImages = async () => {
        setLoadingImages(true);

        try {
            // Fetch before working images (status 2)
            const beforePayload = {
                complaint_id: complaintData.id.toString(),
                status: '2'
            };

            console.log('Fetching before working images with payload:', beforePayload);
            const beforeResponse = await getComplaintImage(beforePayload);
            console.log('Before images response:', beforeResponse);

            // Fetch after working images (status 3)
            const afterPayload = {
                complaint_id: complaintData.id.toString(),
                status: '3'
            };

            console.log('Fetching after working images with payload:', afterPayload);
            const afterResponse = await getComplaintImage(afterPayload);
            console.log('After images response:', afterResponse);

            // Process before working images
            if (beforeResponse?.data?.success && beforeResponse.data.result?.length > 0) {
                const beforeImage = beforeResponse.data.result[0];
                setImage1Uri(beforeImage.image);
                setImage1Id(beforeImage.id);
                console.log('Loaded before working image:', beforeImage);
            }

            // Process after working images
            if (afterResponse?.data?.success && afterResponse.data.result?.length > 0) {
                const afterImage = afterResponse.data.result[0];
                setImage2Uri(afterImage.image);
                setImage2Id(afterImage.id);
                console.log('Loaded after working image:', afterImage);
            }

        } catch (error) {
            console.error('Error fetching existing images:', error);
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Failed to load existing images"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
        } finally {
            setLoadingImages(false);
        }
    };


    useEffect(() => {
        fetchExistingImages()
    }, [])
    // ----- Camera permission functions -----
    const checkCameraPermission = async () => {
        if (Platform.OS === 'ios') {
            return await check(PERMISSIONS.IOS.CAMERA);
        } else {
            return await check(PERMISSIONS.ANDROID.CAMERA);
        }
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === 'ios') {
            return await request(PERMISSIONS.IOS.CAMERA);
        } else {
            return await request(PERMISSIONS.ANDROID.CAMERA);
        }
    };

    // Function to delete image from server
    const deleteImageFromServer = async (imageId, imageNumber) => {
        if (!imageId) return;

        try {
            // Set deleting state
            if (imageNumber === 1) setDeletingImage1(true);
            else setDeletingImage2(true);

            const payload = {
                id: imageId.toString()
            };

            console.log('Deleting image with payload:', payload);
            const response = await deletComplaintImage(payload);
            console.log('Delete response for image', imageNumber, ':', response);

            if (response && response.data && response.data.success) {
                toast.custom(
                    <StatusMessage
                        type="success"
                        title={`Image ${imageNumber} deleted successfully!`}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                return true;
            } else {
                toast.custom(
                    <StatusMessage
                        type="error"
                        title={response?.data?.msg || response?.data?.message || `Failed to delete image ${imageNumber}`}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                return false;
            }
        } catch (error) {
            console.error(`Error deleting image ${imageNumber}:`, error);

            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }

            toast.custom(
                <StatusMessage
                    type="error"
                    title={error.response?.data?.msg || error.response?.data?.message || error.message || `Failed to delete image ${imageNumber}. Please try again.`}
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return false;
        } finally {
            // Clear deleting state
            if (imageNumber === 1) setDeletingImage1(false);
            else setDeletingImage2(false);
        }
    };

    // Function to upload image to server
    const uploadImageToServer = async (imageUri, imageNumber) => {
        try {
            // Set uploading state based on image number
            if (imageNumber === 1) setUploadingImage1(true);
            else setUploadingImage2(true);

            // Create form data for file upload
            const formData = new FormData();

            // Get file info
            const fileUri = imageUri;
            const fileName = fileUri.split('/').pop();
            const fileType = 'image/jpeg';

            // Append the image file
            formData.append('image', {
                uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
                name: fileName || `photo_${Date.now()}.jpg`,
                type: fileType,
            });

            // Set different image_type and status for image 1 and image 2
            const imageType = imageNumber === 1 ? 'after working' : 'after working';
            const status = imageNumber === 1 ? '2' : '3';

            // Append other parameters
            formData.append('complaint_id', complaintData?.id?.toString() || '');
            formData.append('image_type', imageType);
            formData.append('status', status);

            console.log('Uploading image with params:', {
                complaint_id: complaintData?.id,
                image_type: imageType,
                status: status,
                fileName: fileName,
                imageNumber: imageNumber
            });

            // Call the upload API
            const response = await UploadComplaintImage(formData);
            console.log('Upload response for image', imageNumber, ':', response);

            // Check if upload was successful
            if (response && response.data && response.data.success) {
                const imageId = response.data.id;

                // Store the image ID
                if (imageNumber === 1) {
                    setImage1Id(imageId);
                } else {
                    setImage2Id(imageId);
                }

                toast.custom(
                    <StatusMessage
                        type="success"
                        title={`Image ${imageNumber} uploaded successfully!`}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );

                return true;
            } else {
                // Clear URI if upload failed
                if (imageNumber === 1) {
                    setImage1Uri(null);
                } else {
                    setImage2Uri(null);
                }

                toast.custom(
                    <StatusMessage
                        type="error"
                        title={response?.data?.msg || response?.data?.message || `Failed to upload image ${imageNumber}`}
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                return false;
            }

        } catch (error) {
            console.error(`Error uploading image ${imageNumber}:`, error);

            // Clear URI if upload failed
            if (imageNumber === 1) {
                setImage1Uri(null);
            } else {
                setImage2Uri(null);
            }

            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }

            toast.custom(
                <StatusMessage
                    type="error"
                    title={error.response?.data?.msg || error.response?.data?.message || error.message || `Failed to upload image ${imageNumber}. Please try again.`}
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return false;
        } finally {
            // Clear uploading state
            if (imageNumber === 1) setUploadingImage1(false);
            else setUploadingImage2(false);
        }
    };

    // Camera capture function
    const captureImage = async (imageNumber) => {
        try {
            const permissionStatus = await checkCameraPermission();

            if (permissionStatus === RESULTS.GRANTED) {
                openCamera(imageNumber);
            } else if (permissionStatus === RESULTS.DENIED) {
                const requestStatus = await requestCameraPermission();
                if (requestStatus === RESULTS.GRANTED) {
                    openCamera(imageNumber);
                } else {
                    toast.custom(
                        <StatusMessage
                            type="error"
                            title="Camera permission denied"
                            className="mx-4 mb-6"
                        />,
                        { duration: 2000 }
                    );
                }
            } else if (permissionStatus === RESULTS.BLOCKED) {
                toast.custom(
                    <StatusMessage
                        type="error"
                        title="Camera permission is blocked. Please enable it in settings to take photos."
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
            }
        } catch (error) {
            console.log('Camera permission error:', error);
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Error accessing camera"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
        }
    };

    const openCamera = (imageNumber) => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            quality: 0.8,
            saveToPhotos: false,
        };

        launchCamera(options, async (response) => {
            if (response.didCancel) return;
            if (response.error) {
                toast.custom(
                    <StatusMessage
                        type="error"
                        title="Error taking photo"
                        className="mx-4 mb-6"
                    />,
                    { duration: 3000 }
                );
                return;
            }
            if (response.assets && response.assets[0]) {
                const uri = response.assets[0].uri;

                // Set image URI first
                if (imageNumber === 1) {
                    setImage1Uri(uri);
                } else {
                    setImage2Uri(uri);
                }

                // Show success toast
                toast.custom(
                    <StatusMessage
                        type="success"
                        title={`Image ${imageNumber} captured successfully`}
                        className="mx-4 mb-6"
                    />,
                    { duration: 2000 }
                );

                // Automatically upload the image after capture
                await uploadImageToServer(uri, imageNumber);
            }
        });
    };

    // Show delete confirmation dialog
    const showDeleteConfirmation = (imageNumber) => {
        setImageToDelete(imageNumber);
        setDeleteDialogVisible(true);
    };

    // Handle delete confirmation
    const handleDeleteConfirmed = async () => {
        const imageNumber = imageToDelete;
        const imageId = imageNumber === 1 ? image1Id : image2Id;

        // Close dialog immediately
        setDeleteDialogVisible(false);

        // If image has an ID, delete from server first
        if (imageId) {
            const deleted = await deleteImageFromServer(imageId, imageNumber);
            if (!deleted) {
                return; // Stop if server deletion failed
            }
        }

        // Clear local state
        if (imageNumber === 1) {
            setImage1Uri(null);
            setImage1Id(null);
        } else {
            setImage2Uri(null);
            setImage2Id(null);
        }

        setImageToDelete(null);
    };

    // Handle delete cancellation
    const handleDeleteCancelled = () => {
        setDeleteDialogVisible(false);
        setImageToDelete(null);
    };

    // Handle next button
    const handleNext = async () => {
        // If convertToAMC is true, directly navigate to AMCList
        if (convertToAMC) {
            navigation.navigate('AMCList', { complaintData: complaintData });
            return;
        }

        // Check if both images are uploaded (have IDs)
        if (!image1Id || !image2Id) {
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Please wait for both images to upload completely"
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
            return;
        }

        try {
            setSubmitting(true);

            // Prepare payload for UpdateRemark API
            const payload = {
                complaint_id: complaintData?.id?.toString(),
                remark: remark,
                review: selectedCustomerType
            };

            console.log('Updating remark with payload:', payload);
            const response = await UpdateRemark(payload);
            console.log('UpdateRemark response:', response);

            if (response?.data?.success) {
                toast.custom(
                    <StatusMessage
                        type="success"
                        title={response.data.msg || "Remark updated successfully!"}
                        className="mx-4 mb-6"
                    />,
                    { duration: 2000 }
                );

                // Navigate to billing screen after successful update
                setTimeout(() => {
                    navigation.replace('Billing', {
                        selectedCustomerType,
                        remark,
                        image1Id: image1Id,
                        image2Id: image2Id,
                        image1Uri: image1Uri,
                        image2Uri: image2Uri,
                        complaintData: complaintData,
                        convertToAMC: convertToAMC // Pass the AMC toggle state
                    });
                }, 500);
            } else {
                throw new Error(response?.data?.msg || response?.data?.message || 'Failed to update remark');
            }
        } catch (error) {
            console.error('Error updating remark:', error);
            toast.custom(
                <StatusMessage
                    type="error"
                    title={error.message || 'Failed to update remark. Please try again.'}
                    className="mx-4 mb-6"
                />,
                { duration: 3000 }
            );
        } finally {
            setSubmitting(false);
        }
    };

    // Dropdown footer buttons
    const customerTypeFooter = (
        <View className="flex-row justify-end gap-2">
            <TouchableOpacity
                onPress={() => setCustomerTypeDropdownVisible(false)}
                className="px-4 py-2 rounded-lg bg-gray-200"
            >
                <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    // Delete confirmation dialog footer
    const deleteDialogFooter = (
        <View className="flex-row justify-end gap-2">
            <TouchableOpacity
                onPress={handleDeleteCancelled}
                className="px-4 py-2 rounded-lg bg-gray-200"
            >
                <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={handleDeleteConfirmed}
                className="px-4 py-2 rounded-lg bg-red-500"
            >
                <Text className="text-white font-medium">Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="absolute inset-0 z-50 pointer-events-none">
                <Toaster />
            </View>

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
                    {/* Loading Indicator */}
                    {loadingImages && (
                        <View className="mb-4 p-4 bg-gray-100 rounded-xl items-center">
                            <ActivityIndicator size="large" color="#000" />
                            <Text className="text-text-primary mt-2">Loading existing images...</Text>
                        </View>
                    )}

                    {/* Convert to AMC with Toggle Switch - Inline */}
                    <View className="flex-row justify-between items-center mb-4 p-3 bg-gray-50 rounded-xl">
                        <View>
                            <Text className="text-text-primary font-semibold text-base">
                                Convert to AMC
                            </Text>
                            <Text className="text-text-tertiary text-xs mt-1">
                                {convertToAMC ? 'Yes, convert to AMC' : 'No, regular service'}
                            </Text>
                        </View>
                        <ToggleSwitch
                            isOn={convertToAMC}
                            onToggle={setConvertToAMC}
                            onColor="#14B8A6"
                            offColor="#D1D5DB"
                            size="medium"
                            thumbOnStyle={{ backgroundColor: '#FFFFFF' }}
                            thumbOffStyle={{ backgroundColor: '#FFFFFF' }}
                            thumbOnStyleCustom={{ backgroundColor: '#FFFFFF' }}
                            thumbOffStyleCustom={{ backgroundColor: '#FFFFFF' }}
                            animationSpeed={200}
                        />
                    </View>

                    {/* Customer Type Dropdown - Only show when convertToAMC is false */}
                    {!convertToAMC && (
                        <View className="mb-4">
                            <Text className="text-text-primary font-semibold text-base mb-1">
                                Select Customer Type
                            </Text>
                            <TouchableOpacity
                                onPress={() => setCustomerTypeDropdownVisible(true)}
                                className="border border-ui-border rounded-xl px-4 py-3 bg-background-secondary flex-row justify-between items-center"
                            >
                                <Text className={selectedCustomerType ? 'text-text-primary' : 'text-text-tertiary'}>
                                    {selectedCustomerType || 'Choose Customer Type (A, B, C, D)'}
                                </Text>
                                <Icon name="chevron-down" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Remark - Only show when convertToAMC is false */}
                    {!convertToAMC && (
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
                    )}

                    {/* Image Upload Section - Only show when convertToAMC is false */}
                    {!convertToAMC && (
                        <>
                            <Text className="text-text-primary font-semibold text-base mb-2">
                                Capture Images
                            </Text>
                            <View className='flex-row justify-between gap-4'>
                                {/* Image 1 - Before Working */}
                                <View className="flex-1 mb-4">
                                    <Text className="text-text-secondary text-sm mb-1">Before Working Image</Text>
                                    {image1Uri ? (
                                        <View className="relative">
                                            <Image
                                                source={{ uri: image1Uri }}
                                                className="w-full h-[200px] rounded-xl bg-gray-200"
                                                resizeMode="cover"
                                            />
                                            <TouchableOpacity
                                                onPress={() => showDeleteConfirmation(1)}
                                                disabled={deletingImage1}
                                                className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                                            >
                                                {deletingImage1 ? (
                                                    <ActivityIndicator size="small" color="#ff4444" />
                                                ) : (
                                                    <Icon name="trash-outline" size={22} color="#ff4444" />
                                                )}
                                            </TouchableOpacity>
                                            {uploadingImage1 && (
                                                <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
                                                    <ActivityIndicator size="large" color="#fff" />
                                                    <Text className="text-white mt-2">Uploading...</Text>
                                                </View>
                                            )}
                                            {image1Id && !uploadingImage1 && !deletingImage1 && (
                                                <View className="absolute bottom-2 left-2 bg-green-500/80 rounded-full px-2 py-1">
                                                    <Text className="text-white text-xs">Uploaded ✓</Text>
                                                </View>
                                            )}
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => captureImage(1)}
                                            disabled={loadingImages}
                                            className="border-2 border-dashed border-ui-border rounded-xl p-6 items-center justify-center bg-background-secondary"
                                            style={{ minHeight: 200 }}
                                        >
                                            <Icon name="camera-outline" size={40} color="#666" />
                                            <Text className="text-text-primary font-semibold text-base mt-2 text-center">
                                                Capture Before Working
                                            </Text>
                                            <Text className="text-text-tertiary text-sm text-center mt-1">
                                                Tap to open camera
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {/* Image 2 - After Working */}
                                <View className="flex-1 mb-4">
                                    <Text className="text-text-secondary text-sm mb-1">After Working Image</Text>
                                    {image2Uri ? (
                                        <View className="relative">
                                            <Image
                                                source={{ uri: image2Uri }}
                                                className="w-full h-[200px] rounded-xl bg-gray-200"
                                                resizeMode="cover"
                                            />
                                            <TouchableOpacity
                                                onPress={() => showDeleteConfirmation(2)}
                                                disabled={deletingImage2}
                                                className="absolute top-2 right-2 bg-white/80 rounded-full p-1"
                                            >
                                                {deletingImage2 ? (
                                                    <ActivityIndicator size="small" color="#ff4444" />
                                                ) : (
                                                    <Icon name="trash-outline" size={22} color="#ff4444" />
                                                )}
                                            </TouchableOpacity>
                                            {uploadingImage2 && (
                                                <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
                                                    <ActivityIndicator size="large" color="#fff" />
                                                    <Text className="text-white mt-2">Uploading...</Text>
                                                </View>
                                            )}
                                            {image2Id && !uploadingImage2 && !deletingImage2 && (
                                                <View className="absolute bottom-2 left-2 bg-green-500/80 rounded-full px-2 py-1">
                                                    <Text className="text-white text-xs">Uploaded ✓</Text>
                                                </View>
                                            )}
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => captureImage(2)}
                                            disabled={loadingImages}
                                            className="border-2 border-dashed border-ui-border rounded-xl p-6 items-center justify-center bg-background-secondary"
                                            style={{ minHeight: 200 }}
                                        >
                                            <Icon name="camera-outline" size={40} color="#666" />
                                            <Text className="text-text-primary font-semibold text-base mt-2 text-center">
                                                Capture After Working
                                            </Text>
                                            <Text className="text-text-tertiary text-sm text-center mt-1">
                                                Tap to open camera
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </>
                    )}

                    {/* Next Button */}
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={!convertToAMC && (!isFormComplete || uploadingImage1 || uploadingImage2 || deletingImage1 || deletingImage2 || loadingImages || submitting)}
                        className={`py-4 rounded-xl items-center mb-8 ${
                            convertToAMC 
                                ? 'bg-black' 
                                : (isFormComplete && !uploadingImage1 && !uploadingImage2 && !deletingImage1 && !deletingImage2 && !loadingImages && !submitting)
                                    ? 'bg-black'
                                    : 'bg-gray-400'
                        }`}
                    >
                        <Text className="text-white font-semibold text-base">
                            {submitting ? 'Submitting...' :
                                loadingImages ? 'Loading Images...' :
                                    uploadingImage1 || uploadingImage2 ? 'Uploading Images...' :
                                        deletingImage1 || deletingImage2 ? 'Deleting Image...' :
                                            convertToAMC ? 'Next' : 'Next'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Customer Type Selection Dialog */}
            <DialogBox
                visible={customerTypeDropdownVisible}
                onClose={() => setCustomerTypeDropdownVisible(false)}
                title="Select Customer Type"
                size="sm"
                footer={customerTypeFooter}
                closeOnBackdropPress={true}
            >
                <View className="py-2">
                    {customerTypeOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => {
                                setSelectedCustomerType(option);
                                setCustomerTypeDropdownVisible(false);
                            }}
                            className={`py-3 px-2 border-b border-gray-100 ${selectedCustomerType === option ? 'bg-primary-sage100' : ''
                                }`}
                        >
                            <Text
                                className={`text-base ${selectedCustomerType === option
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

            {/* Delete Confirmation Dialog */}
            <DialogBox
                visible={deleteDialogVisible}
                onClose={handleDeleteCancelled}
                title="Delete Image"
                size="sm"
                footer={deleteDialogFooter}
                closeOnBackdropPress={true}
            >
                <View className="py-4">
                    <Text className="text-text-primary text-center">
                        Are you sure you want to delete this image?
                    </Text>
                    <Text className="text-text-secondary text-center text-sm mt-2">
                        This action cannot be undone.
                    </Text>
                </View>
            </DialogBox>
        </SafeAreaView>
    );
};

export default Remarkscreen;