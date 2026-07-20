// Remarkscreen.js - with AMC billing support, upload blocking overlay & image resizing
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    RefreshControl,
    Modal,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Header from '../../../components/Header';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import DialogBox from '../../../components/DilaogBox';
// import {
//     UploadComplaintImage,
//     deletComplaintImage,
//     getComplaintImage,
//     UpdateRemark,
//     ComplaintBilling,
//     AMCBilling as AMCBillingAPI,
// } from '../../../lib/api';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import dummyData from '../../../lib/dummyData';

// Camera Modal Component (unchanged)
const CustomCameraModal = ({ visible, onClose, onCapture }) => {
    const device = useCameraDevice('back');
    const { hasPermission, requestPermission } = useCameraPermission();
    const cameraRef = useRef(null);

    useEffect(() => {
        if (visible && !hasPermission) requestPermission();
    }, [visible, hasPermission, requestPermission]);

    const takePhoto = async () => {
        if (!cameraRef.current) return;
        try {
            const photo = await cameraRef.current.takePhoto({
                qualityPrioritization: 'quality',
                flash: 'off',
            });
            const uri = `file://${photo.path}`;
            onCapture(uri);
            onClose();
        } catch (error) {
            toast.custom(<StatusMessage type="error" title="Could not take photo. Please try again." className="mx-4 mb-6" />, { duration: 3000 });
        }
    };

    if (!visible) return null;

    if (!hasPermission) {
        return (
            <Modal transparent animationType="slide" visible={visible}>
                <View style={styles.modalContainer}>
                    <View style={styles.permissionBox}>
                        <Text style={styles.permissionText}>Camera permission required</Text>
                        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                            <Text style={styles.permissionButtonText}>Grant Permission</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closePermissionText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    }

    if (!device) {
        return (
            <Modal transparent animationType="slide" visible={visible}>
                <View style={styles.modalContainer}>
                    <Text style={styles.errorText}>No back camera available on this device</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.closeText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }

    return (
        <Modal transparent={false} animationType="slide" visible={visible}>
            <View style={StyleSheet.absoluteFill}>
                <Camera
                    ref={cameraRef}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    photo={true}
                />
                <View style={styles.cameraControls}>
                    <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                        <View style={styles.innerCaptureButton} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.closeCameraButton} onPress={onClose}>
                        <Icon name="close" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const Remarkscreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {
        complaintData,
        shouldSubmitOnReturn = false,
        returnToBilling = false,
        totalPayable = 0,
        discount = 0,
        billingType = 'complaint',
        amcData,
        billingId,
        location,
        technicianId,
        platformFee = 0,
    } = route.params || {};


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
    const [refreshing, setRefreshing] = useState(false);

    // Review & remark
    const [selectedCustomerType, setSelectedCustomerType] = useState('');
    const [customerTypeDropdownVisible, setCustomerTypeDropdownVisible] = useState(false);
    const customerTypeOptions = ['A', 'B', 'C', 'D', 'E'];
    const [remark, setRemark] = useState('');

    // Validation errors
    const [reviewError, setReviewError] = useState(false);
    const [remarkError, setRemarkError] = useState(false);
    const [image1Error, setImage1Error] = useState(false);
    const [image2Error, setImage2Error] = useState(false);

    // Delete & camera
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [cameraVisible, setCameraVisible] = useState(false);
    const [pendingImageNumber, setPendingImageNumber] = useState(null);

    // Billing confirmation modal
    const [submitConfirmationVisible, setSubmitConfirmationVisible] = useState(false);

    // Helper: is any image currently uploading?
    const isAnyUploading = uploadingImage1 || uploadingImage2;

    // Fetch existing images
    const fetchExistingImages = async () => {
        setLoadingImages(true);
        try {
            const beforePayload = { complaint_id: complaintData.id.toString(), status: '2' };
            // const beforeResponse = await getComplaintImage(beforePayload);
            await new Promise(resolve => setTimeout(resolve, 500));
            const beforeResponse = dummyData.getComplaintImages;
            const afterPayload = { complaint_id: complaintData.id.toString(), status: '3' };
            // const afterResponse = await getComplaintImage(afterPayload);
            await new Promise(resolve => setTimeout(resolve, 500));
            const afterResponse = dummyData.getComplaintImages;
            if (beforeResponse?.data?.success && beforeResponse.data.result?.length > 0) {
                const beforeImage = beforeResponse.data.result[0];
                setImage1Uri(beforeImage.image);
                setImage1Id(beforeImage.id);
                setImage1Error(false);
            }
            if (afterResponse?.data?.success && afterResponse.data.result?.length > 0) {
                const afterImage = afterResponse.data.result[0];
                setImage2Uri(afterImage.image);
                setImage2Id(afterImage.id);
                setImage2Error(false);
            }
        } catch (error) {
            toast.custom(<StatusMessage type="error" title="Failed to load existing images" className="mx-4 mb-6" />, { duration: 3000 });
        } finally {
            setLoadingImages(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            setImage1Uri(null);
            setImage2Uri(null);
            setImage1Id(null);
            setImage2Id(null);
            setSelectedCustomerType('');
            setRemark('');
            setReviewError(false);
            setRemarkError(false);
            setImage1Error(false);
            setImage2Error(false);
            await fetchExistingImages();
            if (complaintData?.remark && complaintData.remark !== '') setRemark(complaintData.remark);
            if (complaintData?.review && complaintData.review !== '') setSelectedCustomerType(complaintData.review);
            toast.custom(<StatusMessage type="success" title="Refreshed" description="All data has been updated successfully" className="mx-4 mb-6" />, { duration: 2000 });
        } catch (error) {
            toast.custom(<StatusMessage type="error" title="Refresh Failed" description={error.message || "Please try again"} className="mx-4 mb-6" />, { duration: 3000 });
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchExistingImages();
            if (complaintData?.remark && complaintData.remark !== '') setRemark(complaintData.remark);
            if (complaintData?.review && complaintData.review !== '') setSelectedCustomerType(complaintData.review);
            return () => {};
        }, [complaintData?.id])
    );

    useEffect(() => {
        if (complaintData?.remark && complaintData.remark !== '') setRemark(complaintData.remark);
        if (complaintData?.review && complaintData.review !== '') setSelectedCustomerType(complaintData.review);
    }, [complaintData]);

    // Delete image from server
    const deleteImageFromServer = async (imageId, imageNumber) => {
        if (!imageId) return;
        try {
            if (imageNumber === 1) setDeletingImage1(true);
            else setDeletingImage2(true);
            const payload = { id: imageId.toString() };
            // const response = await deletComplaintImage(payload);
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.deleteImage;
            if (response && response.data && response.data.success) {
                toast.custom(<StatusMessage type="success" title={`Image ${imageNumber} deleted successfully!`} className="mx-4 mb-6" />, { duration: 3000 });
                return true;
            } else {
                toast.custom(<StatusMessage type="error" title={response?.data?.msg || `Failed to delete image ${imageNumber}`} className="mx-4 mb-6" />, { duration: 3000 });
                return false;
            }
        } catch (error) {
            toast.custom(<StatusMessage type="error" title={error.message || `Failed to delete image ${imageNumber}. Please try again.`} className="mx-4 mb-6" />, { duration: 3000 });
            return false;
        } finally {
            if (imageNumber === 1) setDeletingImage1(false);
            else setDeletingImage2(false);
        }
    };

    // Helper to get file size in bytes
    const getFileSize = async (uri) => {
        try {
            const filePath = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
            const stat = await RNFS.stat(filePath);
            return stat.size;
        } catch (err) {
            return 0;
        }
    };

    // Resize image and upload it
    const resizeAndUpload = async (originalUri, imageNumber) => {
        if (imageNumber === 1) {
            setImage1Uri(originalUri);
            setUploadingImage1(true);
        } else {
            setImage2Uri(originalUri);
            setUploadingImage2(true);
        }

        try {
            const originalSize = await getFileSize(originalUri);

            const resizedImage = await ImageResizer.createResizedImage(
                originalUri,
                800,
                800,
                'JPEG',
                60,
                0,
                undefined,
                false
            );

            const resizedUri = resizedImage.uri;

            const resizedSize = await getFileSize(resizedUri);

            if (imageNumber === 1) setImage1Uri(resizedUri);
            else setImage2Uri(resizedUri);

            await uploadImageToServer(resizedUri, imageNumber);
        } catch (error) {
            try {
                await uploadImageToServer(originalUri, imageNumber);
            } catch (uploadErr) {
                if (imageNumber === 1) setImage1Uri(null);
                else setImage2Uri(null);
                toast.custom(<StatusMessage type="error" title="Failed to process image" className="mx-4 mb-6" />, { duration: 3000 });
            }
        } finally {
            if (imageNumber === 1) setUploadingImage1(false);
            else setUploadingImage2(false);
        }
    };

    // Upload image to server
    const uploadImageToServer = async (imageUri, imageNumber) => {
        try {
            const formData = new FormData();
            const fileUri = imageUri;
            const fileName = fileUri.split('/').pop();
            formData.append('image', {
                uri: Platform.OS === 'ios' ? fileUri.replace('file://', '') : fileUri,
                name: fileName || `photo_${Date.now()}.jpg`,
                type: 'image/jpeg',
            });
            const imageType = 'after working';
            const status = imageNumber === 1 ? '2' : '3';
            formData.append('complaint_id', complaintData?.id?.toString() || '');
            formData.append('image_type', imageType);
            formData.append('status', status);
            // const response = await UploadComplaintImage(formData);
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.uploadImage;
            if (response && response.data && response.data.success) {
                const imageId = response.data.id;
                if (imageNumber === 1) {
                    setImage1Id(imageId);
                    setImage1Error(false);
                } else {
                    setImage2Id(imageId);
                    setImage2Error(false);
                }
                toast.custom(<StatusMessage type="success" title={`Image ${imageNumber} uploaded successfully!`} className="mx-4 mb-6" />, { duration: 3000 });
                return true;
            } else {
                if (imageNumber === 1) setImage1Uri(null);
                else setImage2Uri(null);
                toast.custom(<StatusMessage type="error" title={response?.data?.msg || `Failed to upload image ${imageNumber}`} className="mx-4 mb-6" />, { duration: 3000 });
                return false;
            }
        } catch (error) {
            if (imageNumber === 1) setImage1Uri(null);
            else setImage2Uri(null);
            toast.custom(<StatusMessage type="error" title={error.message || `Failed to upload image ${imageNumber}. Please try again.`} className="mx-4 mb-6" />, { duration: 3000 });
            return false;
        }
    };

    const openCameraForImage = (imageNumber) => {
        setPendingImageNumber(imageNumber);
        setCameraVisible(true);
    };

    const handleCapture = async (uri) => {
        if (!pendingImageNumber) return;
        const imageNumber = pendingImageNumber;
        toast.custom(<StatusMessage type="success" title={`Image ${imageNumber} captured successfully`} className="mx-4 mb-6" />, { duration: 2000 });
        await resizeAndUpload(uri, imageNumber);
        setPendingImageNumber(null);
    };

    const showDeleteConfirmation = (imageNumber) => {
        setImageToDelete(imageNumber);
        setDeleteDialogVisible(true);
    };

    const handleDeleteConfirmed = async () => {
        const imageNumber = imageToDelete;
        const imageId = imageNumber === 1 ? image1Id : image2Id;
        setDeleteDialogVisible(false);
        if (imageId) {
            const deleted = await deleteImageFromServer(imageId, imageNumber);
            if (!deleted) return;
        }
        if (imageNumber === 1) { setImage1Uri(null); setImage1Id(null); setImage1Error(true); }
        else { setImage2Uri(null); setImage2Id(null); setImage2Error(true); }
        setImageToDelete(null);
    };

    const handleDeleteCancelled = () => {
        setDeleteDialogVisible(false);
        setImageToDelete(null);
    };

    // Update remark only (API)
    const updateRemarkOnly = async () => {
        try {
            const payload = {
                complaint_id: complaintData?.id?.toString(),
                remark: remark,
                review: selectedCustomerType,
            };
            // const response = await UpdateRemark(payload);
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.updateRemark;
            if (!response?.data?.success) {
                throw new Error(response?.data?.msg || 'Failed to update remark');
            }
            return true;
        } catch (error) {
            toast.custom(<StatusMessage type="error" title={error.message || 'Failed to update remark'} className="mx-4 mb-6" />, { duration: 3000 });
            return false;
        }
    };

    // Submit billing – handles both normal complaint and AMC
    const submitBilling = async () => {
        if (!selectedCustomerType || !remark.trim() || !image1Id || !image2Id) {
            // This should not be reached because main button validates first
            return;
        }

        setSubmitting(true);
        try {
            const remarkUpdated = await updateRemarkOnly();
            if (!remarkUpdated) {
                setSubmitting(false);
                return;
            }

            if (billingType === 'amc') {
                const amcPayload = {
                    amc_complaint_id: complaintData?.id?.toString(),
                    technician_id: technicianId || '',
                    final_amount: totalPayable.toString(),
                    discount: discount.toString(),
                    latitude: location?.latitude || '',
                    longitude: location?.longitude || '',
                };
                const amcResponse = await AMCBillingAPI(amcPayload);
                if (amcResponse?.data?.success) {
                    toast.custom(<StatusMessage type="success" title="AMC purchased successfully!" className="mx-4 mb-6" />, { duration: 2000 });
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'BottomTabs' }],
                    });
                } else {
                    throw new Error(amcResponse?.data?.msg || 'Failed to purchase AMC');
                }
            } else {
                const billingPayload = {
                    id: complaintData?.id?.toString(),
                    final_amount: totalPayable.toString(),
                    discount: discount.toString(),
                    review: selectedCustomerType,
                    remark: remark,
                };
                // const response = await ComplaintBilling(billingPayload);
                await new Promise(resolve => setTimeout(resolve, 500));
                const response = dummyData.complaintBilling;
                if (response?.data?.success) {
                    toast.custom(<StatusMessage type="success" title="Bill submitted successfully!" className="mx-4 mb-6" />, { duration: 2000 });
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'ComplaintsTopNavigation', params: { status: "Assign" } }],
                    });
                } else {
                    throw new Error(response?.data?.message || 'Failed to submit bill');
                }
            }
        } catch (error) {
            toast.custom(<StatusMessage type="error" title={error.message || 'Failed to submit billing'} className="mx-4 mb-6" />, { duration: 3000 });
        } finally {
            setSubmitting(false);
            setSubmitConfirmationVisible(false);
        }
    };

    // Main validation function – runs on button press
    const validateAndProceed = () => {
        let valid = true;

        // Reset all errors
        setReviewError(false);
        setRemarkError(false);
        setImage1Error(false);
        setImage2Error(false);

        if (!selectedCustomerType || !selectedCustomerType.trim()) {
            setReviewError(true);
            valid = false;
        }
        if (!remark || !remark.trim()) {
            setRemarkError(true);
            valid = false;
        }
        if (!image1Id) {
            setImage1Error(true);
            valid = false;
        }
        if (!image2Id) {
            setImage2Error(true);
            valid = false;
        }

        if (!valid) {
            return; // Stop here; errors are shown in the UI
        }

        // Proceed based on flow
        if (shouldSubmitOnReturn && returnToBilling) {
            setSubmitConfirmationVisible(true);
        } else {
            handleNextOriginal();
        }
    };

    // Original Next (for non-billing flow)
    const handleNextOriginal = async () => {
        try {
            setSubmitting(true);
            const payload = {
                complaint_id: complaintData?.id?.toString(),
                remark: remark,
                review: selectedCustomerType,
            };
            // const response = await UpdateRemark(payload);
            await new Promise(resolve => setTimeout(resolve, 500));
            const response = dummyData.updateRemark;
            if (response?.data?.success) {
                toast.custom(<StatusMessage type="success" title={response.data.msg || "Remark updated successfully!"} className="mx-4 mb-6" />, { duration: 2000 });
                setTimeout(() => {
                    navigation.replace('Billing', {
                        selectedCustomerType,
                        remark,
                        image1Id,
                        image2Id,
                        image1Uri,
                        image2Uri,
                        complaintData: complaintData,
                        convertToAMC: false,
                    });
                }, 500);
            } else {
                throw new Error(response?.data?.msg || 'Failed to update remark');
            }
        } catch (error) {
            toast.custom(<StatusMessage type="error" title={error.message || 'Failed to update remark. Please try again.'} className="mx-4 mb-6" />, { duration: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    const getButtonText = () => {
        if (refreshing) return 'Refreshing...';
        if (submitting) return 'Submitting...';
        if (loadingImages) return 'Loading Images...';
        if (uploadingImage1 || uploadingImage2) return 'Uploading Images...';
        if (deletingImage1 || deletingImage2) return 'Deleting Image...';
        return shouldSubmitOnReturn && returnToBilling ? 'Submit Bill' : 'Next';
    };

    // Button is always enabled, but we'll style it differently if still loading/uploading
    const isProcessing = refreshing || submitting || loadingImages || uploadingImage1 || uploadingImage2 || deletingImage1 || deletingImage2;

    // Dialog footers
    const confirmationFooter = (
        <View className="flex-row justify-end gap-2">
            <TouchableOpacity onPress={() => setSubmitConfirmationVisible(false)} className="px-4 py-2 rounded-lg bg-gray-200">
                <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submitBilling} disabled={submitting} className="px-4 py-2 rounded-lg bg-green-600">
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-medium">Confirm</Text>}
            </TouchableOpacity>
        </View>
    );

    const customerTypeFooter = (
        <View className="flex-row justify-end gap-2">
            <TouchableOpacity onPress={() => setCustomerTypeDropdownVisible(false)} className="px-4 py-2 rounded-lg bg-gray-200">
                <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
        </View>
    );

    const deleteDialogFooter = (
        <View className="flex-row justify-end gap-2">
            <TouchableOpacity onPress={handleDeleteCancelled} className="px-4 py-2 rounded-lg bg-gray-200">
                <Text className="text-gray-700 font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteConfirmed} className="px-4 py-2 rounded-lg bg-red-500">
                <Text className="text-white font-medium">Delete</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="absolute inset-0 z-50 pointer-events-none"><Toaster /></View>
            <Header
                title="Remark"
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5"
                showBackButton={true}
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 pr-7 pt-5"
            />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView
                    className="flex-1 px-4 pt-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#000000']}
                            tintColor="#000000"
                            title="Pull to refresh"
                            titleColor="#000000"
                        />
                    }
                >
                    {loadingImages && !refreshing && (
                        <View className="mb-4 p-4 bg-gray-100 rounded-xl items-center">
                            <ActivityIndicator size="large" color="#000" />
                            <Text className="text-text-primary mt-2">Loading existing images...</Text>
                        </View>
                    )}
                    <Text className="text-black font-semibold text-sm">Complaint: {complaintData?.service_name}</Text>
                    <View className="bg-yellow-100 self-start px-4 py-2 mt-1 border border-yellow-500 rounded-xl">
                        <Text className="text-yellow-800 font-semibold text-sm">CSN ID: {complaintData?.csn}</Text>
                    </View>

                    {/* Review Dropdown */}
                    <View className="mb-4 mt-4">
                        <Text className="text-text-primary font-semibold text-base mb-1">Rating<Text className="text-red-500">*</Text></Text>
                        <TouchableOpacity
                            onPress={() => {
                                setReviewError(false);
                                setCustomerTypeDropdownVisible(true);
                            }}
                            className={`border rounded-xl px-4 py-3 bg-background-secondary flex-row justify-between items-center ${reviewError ? 'border-red-500' : 'border-ui-border'}`}
                        >
                            <Text className={selectedCustomerType ? 'text-text-primary' : 'text-text-tertiary'}>{selectedCustomerType || 'Choose rating (A, B, C, D, E)'}</Text>
                            <Icon name="chevron-down" size={20} color="#666" />
                        </TouchableOpacity>
                        {reviewError && <Text className="text-red-500 text-xs mt-1">Please select a review</Text>}
                    </View>

                    {/* Remark Input */}
                    <View className="mb-4">
                        <Text className="text-text-primary font-semibold text-base mb-1">Remark <Text className="text-red-500">*</Text></Text>
                        <TextInput
                            className={`border rounded-xl px-4 py-3 text-text-primary bg-background-secondary ${remarkError ? 'border-red-500' : 'border-ui-border'}`}
                            placeholder="Add any remarks"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            value={remark}
                            onChangeText={(text) => {
                                setRemarkError(false);
                                setRemark(text);
                            }}
                        />
                        {remarkError && <Text className="text-red-500 text-xs mt-1">Please enter a remark</Text>}
                    </View>

                    <Text className="text-text-primary font-semibold text-base mb-2">Capture Images <Text className="text-red-500">*</Text></Text>
                    <View className="flex-row justify-between gap-4">
                        {/* Image 1 */}
                        <View className="flex-1 mb-4">
                            <Text className="text-text-secondary text-sm mb-1">CSN Sticker Image</Text>
                            {image1Uri ? (
                                <View className={`relative rounded-xl overflow-hidden ${image1Error ? 'border-2 border-red-500' : ''}`}>
                                    <Image source={{ uri: image1Uri }} className="w-full h-[200px] rounded-xl bg-gray-200" resizeMode="cover" />
                                    <TouchableOpacity onPress={() => showDeleteConfirmation(1)} disabled={deletingImage1} className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                                        {deletingImage1 ? <ActivityIndicator size="small" color="#ff4444" /> : <Icon name="trash-outline" size={22} color="#ff4444" />}
                                    </TouchableOpacity>
                                    {uploadingImage1 && (
                                        <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
                                            <ActivityIndicator size="large" color="#fff" />
                                            <Text className="text-white mt-2">Compressing & Uploading...</Text>
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
                                    onPress={() => openCameraForImage(1)}
                                    disabled={loadingImages || refreshing}
                                    className={`border-2 border-dashed rounded-xl p-6 items-center justify-center bg-background-secondary ${image1Error ? 'border-red-500' : 'border-ui-border'}`}
                                    style={{ minHeight: 200 }}
                                >
                                    <Icon name="camera-outline" size={40} color="#666" />
                                    <Text className="text-text-primary font-semibold text-base mt-2 text-center">Capture With CSN Sticker</Text>
                                    <Text className="text-text-tertiary text-sm text-center mt-1">Tap to open camera (Back only)</Text>
                                </TouchableOpacity>
                            )}
                            {image1Error && <Text className="text-red-500 text-xs mt-1">Please capture this image</Text>}
                        </View>

                        {/* Image 2 */}
                        <View className="flex-1 mb-4">
                            <Text className="text-text-secondary text-sm mb-1">After Working Image</Text>
                            {image2Uri ? (
                                <View className={`relative rounded-xl overflow-hidden ${image2Error ? 'border-2 border-red-500' : ''}`}>
                                    <Image source={{ uri: image2Uri }} className="w-full h-[200px] rounded-xl bg-gray-200" resizeMode="cover" />
                                    <TouchableOpacity onPress={() => showDeleteConfirmation(2)} disabled={deletingImage2} className="absolute top-2 right-2 bg-white/80 rounded-full p-1">
                                        {deletingImage2 ? <ActivityIndicator size="small" color="#ff4444" /> : <Icon name="trash-outline" size={22} color="#ff4444" />}
                                    </TouchableOpacity>
                                    {uploadingImage2 && (
                                        <View className="absolute inset-0 bg-black/50 rounded-xl items-center justify-center">
                                            <ActivityIndicator size="large" color="#fff" />
                                            <Text className="text-white mt-2">Compressing & Uploading...</Text>
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
                                    onPress={() => openCameraForImage(2)}
                                    disabled={loadingImages || refreshing}
                                    className={`border-2 border-dashed rounded-xl p-6 items-center justify-center bg-background-secondary ${image2Error ? 'border-red-500' : 'border-ui-border'}`}
                                    style={{ minHeight: 200 }}
                                >
                                    <Icon name="camera-outline" size={40} color="#666" />
                                    <Text className="text-text-primary font-semibold text-base mt-2 text-center">Capture After Working</Text>
                                    <Text className="text-text-tertiary text-sm text-center mt-1">Tap to open camera (Back only)</Text>
                                </TouchableOpacity>
                            )}
                            {image2Error && <Text className="text-red-500 text-xs mt-1">Please capture this image</Text>}
                        </View>
                    </View>

                    {/* Main Button – always enabled */}
                    <TouchableOpacity
                        onPress={validateAndProceed}
                        className={`py-4 rounded-xl items-center mb-8 ${isProcessing ? 'bg-gray-400' : 'bg-blue-600'}`}
                    >
                        <Text className="text-white font-semibold text-base">{getButtonText()}</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Dialogs */}
            <DialogBox visible={customerTypeDropdownVisible} onClose={() => setCustomerTypeDropdownVisible(false)} title="Select Review" size="sm" footer={customerTypeFooter} closeOnBackdropPress={true}>
                <View className="py-2">
                    {customerTypeOptions.map((option) => (
                        <TouchableOpacity
                            key={option}
                            onPress={() => {
                                setSelectedCustomerType(option);
                                setCustomerTypeDropdownVisible(false);
                                setReviewError(false);
                            }}
                            className={`py-3 px-2 border-b border-gray-100 ${selectedCustomerType === option ? 'bg-primary-sage100' : ''}`}
                        >
                            <Text className={`text-base ${selectedCustomerType === option ? 'text-primary-sage700 font-semibold' : 'text-text-primary'}`}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </DialogBox>

            <DialogBox visible={deleteDialogVisible} onClose={handleDeleteCancelled} title="Delete Image" size="sm" footer={deleteDialogFooter} closeOnBackdropPress={true}>
                <View className="py-4">
                    <Text className="text-text-primary text-center">Are you sure you want to delete this image?</Text>
                    <Text className="text-text-secondary text-center text-sm mt-2">This action cannot be undone.</Text>
                </View>
            </DialogBox>

            <DialogBox visible={submitConfirmationVisible} onClose={() => setSubmitConfirmationVisible(false)} title="Confirm Bill Submission" size="sm" footer={confirmationFooter} closeOnBackdropPress={true}>
                <View className="py-4">
                    <Text className="text-text-primary text-center text-base">Total Payable: <Text className="font-bold text-green-700">₹{parseFloat(totalPayable || 0).toFixed(2)}</Text></Text>
                    <Text className="text-text-secondary text-center text-sm mt-3">Review: <Text className="font-semibold">{selectedCustomerType}</Text></Text>
                    <Text className="text-text-secondary text-center text-sm">Remark: <Text className="font-semibold">{remark}</Text></Text>
                    <Text className="text-text-secondary text-center text-sm mt-3">Proceed with billing?</Text>
                </View>
            </DialogBox>

            <CustomCameraModal visible={cameraVisible} onClose={() => { setCameraVisible(false); setPendingImageNumber(null); }} onCapture={handleCapture} />

            {/* FULL-SCREEN BLOCKING OVERLAY DURING IMAGE UPLOAD */}
            {isAnyUploading && (
                <View style={styles.blockingOverlay}>
                    <ActivityIndicator size="large" color="#ffffff" />
                    <Text style={styles.blockingText}>Processing & uploading image...</Text>
                    <Text style={styles.blockingSubText}>Please do not close the app</Text>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraControls: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'gray',
    },
    innerCaptureButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    closeCameraButton: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 12,
        borderRadius: 40,
    },
    permissionBox: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    permissionText: {
        fontSize: 18,
        marginBottom: 20,
    },
    permissionButton: {
        backgroundColor: '#58A890',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    permissionButtonText: { color: 'white', fontWeight: 'bold' },
    closePermissionText: { marginTop: 15, color: 'red' },
    errorText: { color: 'white', fontSize: 18, marginBottom: 20 },
    closeText: { color: 'white', fontSize: 16 },
    blockingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    blockingText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 16,
    },
    blockingSubText: {
        color: '#dddddd',
        fontSize: 14,
        marginTop: 8,
    },
});

export default Remarkscreen;
