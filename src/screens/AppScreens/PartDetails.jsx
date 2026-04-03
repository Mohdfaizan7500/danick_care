import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity, Modal, StatusBar, TextInput, ActivityIndicator, Linking, Platform, Pressable, RefreshControl } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Package, Hash, Layers, CheckCircle, XCircle,
  ShoppingCart, Heart, Star, Scan, Camera as CameraIcon
} from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { PurchaseMarketPart, GetPartDetailQRCode } from '../../lib/api';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../components/StatusMessage';
import DialogBox from '../../components/DilaogBox';

const PartDetails = () => {
  const route = useRoute();
  const part = route.params.part;
  const { imagUrl, user, token } = useAuth();
  const part_id = part.id;
  const technician_id = user?.id;
  const navigation = useNavigation();

  const [isFavorite, setIsFavorite] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [qrProductData, setQrProductData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [currentPart, setCurrentPart] = useState(part);

  // Image capture states
  const [imageCameraVisible, setImageCameraVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedImageUri, setCapturedImageUri] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [hasImagePermission, setHasImagePermission] = useState(false);
  const [showImagePermissionModal, setShowImagePermissionModal] = useState(false);

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Camera ref for taking photos
  const cameraRef = useRef(null);

  // Get camera devices
  const qrCameraDevice = useCameraDevice('back');
  const imageCameraDevice = useCameraDevice('back');

  // Check camera permission for QR scanning
  useEffect(() => {
    checkCameraPermission();
    checkImageCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);
    setHasPermission(result === RESULTS.GRANTED);

    if (result !== RESULTS.GRANTED) {
      setShowPermissionModal(true);
    }
  };

  const checkImageCameraPermission = async () => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);
    setHasImagePermission(result === RESULTS.GRANTED);

    if (result !== RESULTS.GRANTED) {
      setShowImagePermissionModal(true);
    }
  };

  const requestCameraPermission = async () => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);
    setHasPermission(result === RESULTS.GRANTED);

    if (result === RESULTS.GRANTED) {
      setShowPermissionModal(false);
      setCameraVisible(true);
      toast.custom(
        <StatusMessage type='success' title='Camera permission granted' />,
        { duration: 1500 }
      );
    } else {
      setShowPermissionModal(true);
      toast.custom(
        <StatusMessage
          type='error'
          title='Permission Denied'
          description='Please enable camera permission in settings to scan QR codes'
        />,
        { duration: 3000 }
      );
    }
  };

  const requestImageCameraPermission = async () => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);
    setHasImagePermission(result === RESULTS.GRANTED);

    if (result === RESULTS.GRANTED) {
      setShowImagePermissionModal(false);
      setImageCameraVisible(true);
      toast.custom(
        <StatusMessage type='success' title='Camera permission granted' />,
        { duration: 1500 }
      );
    } else {
      setShowImagePermissionModal(true);
      toast.custom(
        <StatusMessage
          type='error'
          title='Permission Denied'
          description='Please enable camera permission to take photos'
        />,
        { duration: 3000 }
      );
    }
  };

  const openAppSettings = () => {
    openSettings().catch(() => {
      if (Platform.OS === 'android') {
        Linking.openSettings();
      }
    });
  };

  // Take photo function
  const takePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'quality',
          flash: 'off',
          enableShutterSound: false,
        });
        console.log('Photo captured:', photo.path);
        setCapturedImage(photo.path);
        setCapturedImageUri(`file://${photo.path}`);
        setImageCameraVisible(false);
      } catch (error) {
        console.error('Error taking photo:', error);
        toast.custom(
          <StatusMessage type='error' title='Error' description='Failed to capture photo' />,
          { duration: 2000 }
        );
      }
    }
  };

  // Upload image and purchase part together using API function
  const handleAddToBucketWithImage = async () => {
    if (!qrCode || qrCode.trim() === '') {
      toast.custom(
        <StatusMessage type='error' title='Error' description='Please enter or scan QR code first' />,
        { duration: 2000 }
      );
      return;
    }

    if (!capturedImage) {
      toast.custom(
        <StatusMessage type='error' title='Error' description='Please take a photo first' />,
        { duration: 2000 }
      );
      return;
    }

    setLoading(true);
    setUploadingImage(true);

    try {
      // Create form data with image
      const formData = new FormData();
      formData.append('technician_id', technician_id?.toString() || '1');
      formData.append('part_id', part_id?.toString());
      formData.append('QRcode', qrCode.trim());

      // Append the image file
      formData.append('image', {
        uri: capturedImageUri,
        type: 'image/jpeg',
        name: `part_photo_${Date.now()}.jpg`,
      });

      console.log('Purchase payload with image:', {
        technician_id: technician_id?.toString() || '1',
        part_id: part_id?.toString(),
        QRcode: qrCode.trim(),
        image: capturedImageUri
      });

      // Using the API function from api.js
      const response = await PurchaseMarketPart(formData);

      console.log('Purchase response:', response);

      if (response?.data?.status == '2') {
        console.log('Part already in use');
        toast.custom(
          <StatusMessage type='info' title='QR code Already Used for another Complaint' />,
          { duration: 2000 }
        );
        await fetchQRCodeDetails(qrCode.trim());
      } else if (response?.data?.success == true) {
        toast.custom(
          <StatusMessage type='success' title={response?.data?.msg || 'Part added to bucket successfully!'} />,
          { duration: 2000 }
        );
        setQrCode('');
        setQrProductData(null);
        setCapturedImage(null);
        setCapturedImageUri(null);
        await fetchUpdatedPartDetails();
        // Navigate back after successful addition
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        toast.custom(
          <StatusMessage type='error' title={response?.data?.msg || 'Failed to add part to bucket'} />,
          { duration: 2000 }
        );
      }
    } catch (error) {
      console.error('Error in purchase with image:', error);

      if (error.code === 'ECONNABORTED') {
        toast.custom(
          <StatusMessage type='error' title='Timeout' description='Request timed out. Please check your connection.' />,
          { duration: 3000 }
        );
      } else if (error.message === 'Network Error') {
        toast.custom(
          <StatusMessage
            type='error'
            title='Network Error'
            description='Cannot connect to server. Please check:\n1. Your device and computer are on same WiFi\n2. Server is running\n3. Firewall is not blocking the connection'
          />,
          { duration: 5000 }
        );
      } else {
        toast.custom(
          <StatusMessage
            type='error'
            title='Error'
            description={error.message || 'Failed to add part to bucket. Please try again.'}
          />,
          { duration: 3000 }
        );
      }
      setQrProductData(null);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  // Function to fetch updated part details
  const fetchUpdatedPartDetails = async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }

      console.log('Refreshing part details...');

      setTimeout(() => {
        toast.custom(
          <StatusMessage type='info' title='Page refreshed' />,
          { duration: 1000 }
        );
      }, 500);

    } catch (error) {
      console.error('Error fetching updated part details:', error);
      toast.custom(
        <StatusMessage type='error' title='Failed to refresh part details' />,
        { duration: 2000 }
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUpdatedPartDetails(true);
  };

  // Function to fetch QR code details
  const fetchQRCodeDetails = async (qrCodeValue) => {
    setQrLoading(true);
    try {
      const payload = {
        QRCode: qrCodeValue
      };
      const response = await GetPartDetailQRCode(payload);
      console.log('QR Code Details Response:', response);

      if (response?.data?.success && response?.data?.data?.length > 0) {
        const productData = response.data.data[0];
        setQrProductData({
          id: productData.id,
          imageUrl: productData.part_image,
          name: productData.part_name,
          partNumber: productData.id?.toString() || '',
          price: productData.part_price,
          description: productData.description,
          transferBy: productData.transfer_by,
          type: productData.type,
          complaintId: productData.complaint_id,
          technicianName: productData.technician_name,
          qrCode: productData.qr_code
        });
      } else {
        toast.custom(
          <StatusMessage type='error' title={response?.data?.msg || 'No product found for this QR code'} />,
          { duration: 2000 }
        );
        setQrProductData(null);
      }
    } catch (error) {
      console.error('Error fetching QR code details:', error);
      toast.custom(
        <StatusMessage type='error' title='Failed to fetch product details' />,
        { duration: 2000 }
      );
      setQrProductData(null);
    } finally {
      setQrLoading(false);
    }
  };

  // Handle Image Upload (Camera)
  const handleUploadImage = async () => {
    if (hasImagePermission) {
      setImageCameraVisible(true);
    } else {
      requestImageCameraPermission();
    }
  };

  // Handle QR Code Scan
  const handleScanQR = async () => {
    if (hasPermission) {
      setCameraVisible(true);
    } else {
      requestCameraPermission();
    }
  };

  // Handle Add to Bucket button press - Show confirmation modal
  const handleAddToBucketPress = () => {
    if (!capturedImage) {
      toast.custom(
        <StatusMessage type='error' title='Error' message='Please take a photo first' />,
        { duration: 2000 }
      );
      return;
    }
    if (!qrCode || qrCode.trim() === '') {
      toast.custom(
        <StatusMessage type='error' title='Error' message='Please enter or scan QR code first' />,
        { duration: 2000 }
      );
      return;
    }



    setShowConfirmModal(true);
  };

  // Confirm add to bucket
  const confirmAddToBucket = () => {
    setShowConfirmModal(false);
    handleAddToBucketWithImage();
  };

  // Cancel add to bucket
  const cancelAddToBucket = () => {
    setShowConfirmModal(false);
  };

  // Handle QR code search (just validate, don't add)
  const handleQRSearch = async () => {
    if (!qrCode.trim()) {
      toast.custom(
        <StatusMessage type='error' title='Error' description='Please enter a QR code' />,
        { duration: 1500 }
      );
      return;
    }

    setLoading(true);
    try {
      await fetchQRCodeDetails(qrCode.trim());
    } catch (error) {
      console.error('Error in search:', error);
      toast.custom(
        <StatusMessage
          type='error'
          title='Error'
          description={error.message || 'Failed to process QR code. Please try again.'}
        />,
        { duration: 3000 }
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear QR code input
  const clearQrCode = () => {
    setQrCode('');
    setQrProductData(null);
    toast.custom(
      <StatusMessage type='info' title='QR code cleared' />,
      { duration: 1000 }
    );
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetails', { product: product });
  }

  // Stock status logic
  const getStockStatus = () => {
    const inStock = true;
    return {
      color: inStock ? 'text-status-online' : 'text-status-busy',
      bgColor: inStock ? 'bg-primary-sage50' : 'bg-status-busy/10',
      icon: inStock ? CheckCircle : XCircle,
      text: inStock ? 'In Stock' : 'Out of Stock',
      iconColor: inStock ? '#58A890' : '#E86F6F',
    };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;
  const insets = useSafeAreaInsets();

  // Helper to get full image URL
  const getImageUrl = () => {
    if (currentPart.part_image) {
      return imagUrl + currentPart.part_image;
    }
    return 'https://via.placeholder.com/400x400?text=No+Image';
  };

  return (
    <SafeAreaView className="flex-1 pt-10 bg-background-primary" edges={['bottom']}>
      <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />

      {/* Header */}
      <View className="absolute inset-0 z-50 w-90% pointer-events-none">
        <Toaster />
      </View>
      <View className="absolute top-0 z-10 w-full" style={{ top: insets.top }}>
        <Header
          showBackButton
          titlePosition="left"
          containerStyle="bg-transparent px-5 py-4"
          rightComponent={
            <TouchableOpacity onPress={() => {
              setIsFavorite(!isFavorite);
              toast.custom(
                <StatusMessage
                  type='success'
                  title={!isFavorite ? 'Added to favorites' : 'Removed from favorites'}
                />,
                { duration: 1000 }
              );
            }}>
              <Heart
                size={24}
                color={isFavorite ? '#E86F6F' : '#FFFFFF'}
                fill={isFavorite ? '#E86F6F' : 'transparent'}
              />
            </TouchableOpacity>
          }
        />
      </View>

      {/* Confirmation Modal */}
      <DialogBox
        visible={showConfirmModal}
        onClose={cancelAddToBucket}
        title="Confirm Add to Bucket"
        size="sm"
        closeOnBackdropPress={false}
      >
        <View className="items-center py-4">
          <ShoppingCart size={48} color="#58A890" />
          <Text className="text-text-primary text-center text-lg font-bold mt-3">
            Are you sure?
          </Text>
          <Text className="text-text-secondary text-center mt-2 px-4">
            Once added to bucket, this action cannot be undone. Do you want to continue?
          </Text>
        </View>

        <View className="flex-row justify-between mt-6 gap-4">
          <TouchableOpacity
            onPress={cancelAddToBucket}
            className="flex-1 bg-gray-200 rounded-xl py-3"
          >
            <Text className="text-gray-700 text-center font-medium">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmAddToBucket}
            className="flex-1 bg-primary-sage500 rounded-xl py-3"
          >
            <Text className="text-white text-center font-medium">Confirm</Text>
          </TouchableOpacity>
        </View>
      </DialogBox>

      {/* QR Scanner Permission Modal */}
      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPermissionModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <View className="items-center mb-4">
              <Icon name="camera-outline" size={50} color="#3FD298" />
              <Text className="text-xl font-bold text-gray-900 mt-3">
                Camera Permission Required
              </Text>
            </View>

            <Text className="text-gray-600 text-center mb-6">
              Camera permission is needed to scan QR codes. Please grant permission to continue.
            </Text>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowPermissionModal(false)}
                className="flex-1 bg-gray-200 rounded-xl py-3 mr-2"
              >
                <Text className="text-gray-700 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openAppSettings}
                className="flex-1 bg-primary-sage600 rounded-xl py-3 ml-2"
              >
                <Text className="text-white text-center font-medium">
                  Open Settings
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={requestCameraPermission}
              className="mt-3 py-2"
            >
              <Text className="text-primary-sage600 text-center">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Image Camera Permission Modal */}
      <Modal
        visible={showImagePermissionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePermissionModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 mx-6 w-80">
            <View className="items-center mb-4">
              <Icon name="camera-outline" size={50} color="#3FD298" />
              <Text className="text-xl font-bold text-gray-900 mt-3">
                Camera Permission Required
              </Text>
            </View>

            <Text className="text-gray-600 text-center mb-6">
              Camera permission is needed to take photos. Please grant permission to continue.
            </Text>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowImagePermissionModal(false)}
                className="flex-1 bg-gray-200 rounded-xl py-3 mr-2"
              >
                <Text className="text-gray-700 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openAppSettings}
                className="flex-1 bg-primary-sage600 rounded-xl py-3 ml-2"
              >
                <Text className="text-white text-center font-medium">
                  Open Settings
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={requestImageCameraPermission}
              className="mt-3 py-2"
            >
              <Text className="text-primary-sage600 text-center">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Camera Modal for Scanning */}
      <Modal
        visible={cameraVisible}
        animationType="slide"
        onRequestClose={() => setCameraVisible(false)}
      >
        <View style={StyleSheet.absoluteFillObject}>
          {qrCameraDevice && hasPermission ? (
            <Camera
              style={StyleSheet.absoluteFill}
              device={qrCameraDevice}
              isActive={cameraVisible}
              codeScanner={{
                codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'],
                onCodeScanned: (codes) => {
                  if (codes.length > 0 && codes[0].value) {
                    const scannedValue = codes[0].value;
                    console.log('Scanned QR code:', scannedValue);
                    setQrCode(scannedValue);
                    setCameraVisible(false);
                    toast.custom(
                      <StatusMessage type='success' title='QR Code scanned successfully' />,
                      { duration: 1000 }
                    );
                  }
                },
              }}
            />
          ) : (
            <View className="flex-1 justify-center items-center bg-black">
              <Text className="text-white mb-4">Camera not available or permission denied</Text>
              <TouchableOpacity
                onPress={requestCameraPermission}
                className="bg-white px-6 py-3 rounded-lg"
              >
                <Text className="text-black font-medium">Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setCameraVisible(false)}
            className="absolute top-12 right-5 bg-black/50 rounded-full p-3 z-10"
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* Scanner Frame Overlay */}
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center pointer-events-none">
            <View className="w-64 h-64 border-2 border-white rounded-lg" />
            <Text className="text-white mt-4 text-lg bg-black/50 px-4 py-2 rounded-full">
              Align QR code within frame
            </Text>
          </View>
        </View>
      </Modal>

      {/* Image Camera Modal for Taking Photos */}
      <Modal
        visible={imageCameraVisible}
        animationType="slide"
        onRequestClose={() => setImageCameraVisible(false)}
      >
        <View className="flex-1 bg-black">
          {imageCameraDevice && hasImagePermission ? (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={imageCameraDevice}
              isActive={imageCameraVisible}
              photo={true}
            />
          ) : (
            <View className="flex-1 justify-center items-center bg-black">
              <Text className="text-white mb-4">Camera not available or permission denied</Text>
              <TouchableOpacity
                onPress={requestImageCameraPermission}
                className="bg-white px-6 py-3 rounded-lg"
              >
                <Text className="text-black font-medium">Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setImageCameraVisible(false)}
            className="absolute top-12 left-5 bg-black/50 rounded-full p-3 z-10"
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* Capture Button */}
          <TouchableOpacity
            onPress={takePhoto}
            className="absolute bottom-10 self-center"
          >
            <View className="w-20 h-20 rounded-full border-4 border-white bg-white/30 items-center justify-center">
              <View className="w-16 h-16 rounded-full bg-white" />
            </View>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Uploading Indicator */}
      {(uploadingImage || loading) && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <View className="bg-white rounded-xl p-6 items-center">
            <ActivityIndicator size="large" color="#58A890" />
            <Text className="mt-3 text-gray-700 font-medium">
              {uploadingImage ? 'Adding Part in Bucket' : 'Processing...'}
            </Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3FD298', '#58A890']}
            tintColor="#3FD298"
            title="Pull to refresh"
            titleColor="#666"
          />
        }
      >
        {/* Image Section */}
        <View className="w-full h-[240px] bg-background-secondary relative">
          <Image
            source={{ uri: getImageUrl() }}
            className="w-full h-full"
            resizeMode="contain"
          />
          <View className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent" />
        </View>

        {/* Details Card */}
        <View className="bg-white rounded-t-3xl -mt-6 px-6 pt-6 pb-8 shadow-lg">

          {/* Upload Image Button - Replaced with photo display when captured */}
          {!capturedImage ? (
            <TouchableOpacity
              onPress={handleUploadImage}
              className="border-2 border-dashed border-primary-sage400 rounded-xl p-2 items-center justify-center bg-teal-50 mb-6"
            >
              <CameraIcon size={30} color="#3FD298" />
              <Text className="text-primary-sage600 font-semibold text-sm mt-1">Tap to Take Photo</Text>
              <Text className="text-gray-500 text-xs text-center mt-0">
                Photo is required for purchase
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleUploadImage}
              className="mb-6 rounded-xl overflow-hidden border-2 border-primary-sage400 relative"
            >
              <Image
                source={{ uri: capturedImageUri }}
                className="w-full h-48"
                resizeMode="cover"
              />
              <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
                <Text className="text-white text-center text-xs">
                  Tap to take new photo
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* QR Code Input with Scan Icon Inline */}
          <View className="flex-row items-center mb-6">
            <View className="flex-1 flex-row items-center border border-gray-300 rounded-xl bg-white px-3">
              <Icon name="qr-code-outline" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-2 text-base text-black py-3"
                placeholder="Enter QR code number"
                placeholderTextColor={'gray'}
                value={qrCode}
                onChangeText={setQrCode}
                returnKeyType="search"
                onSubmitEditing={handleQRSearch}
                editable={!loading}
              />
              {qrCode.length > 0 && (
                <TouchableOpacity onPress={clearQrCode} className="ml-2 p-1">
                  <Icon name="close-circle-outline" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              onPress={handleScanQR}
              className="ml-3 bg-green-100 border border-green-500 rounded-xl p-3 items-center justify-center"
              style={{ width: 50, height: 43 }}
            >
              <Scan size={24} color="#3FD298" />
            </TouchableOpacity>
          </View>

          {/* QR Product Display - Shows part information */}
          {qrProductData && (
            <Pressable
              onPress={() => handleProductPress(qrProductData)}
              className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
            >
              <Text className="text-md font-bold text-blue-800 mb-3">ℹ️ Part Information</Text>
              <View className="flex-row">
                {qrProductData.imageUrl ? (
                  <Image
                    source={{ uri: qrProductData.imageUrl }}
                    className="w-20 h-20 rounded-lg bg-gray-50"
                    resizeMode="contain"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-lg bg-gray-100 items-center justify-center">
                    <Package size={24} color="#999" />
                  </View>
                )}
                <View className="flex-1 ml-3">
                  <Text className="text-base font-semibold text-gray-900">
                    {qrProductData.name}
                  </Text>
                  <Text className="text-xs text-gray-600 mt-1">
                    QR Code: {qrProductData.qrCode}
                  </Text>
                  <Text className="text-sm font-bold text-primary-sage600 mt-1">
                    ₹{parseFloat(qrProductData.price).toFixed(2)}
                  </Text>
                  {qrProductData.type === "Yes" && (
                    <View className="mt-2">
                      <Text className="text-xs text-orange-700">
                        Used in Complaint #{qrProductData.complaintId}
                      </Text>
                      {qrProductData.technicianName && (
                        <Text className="text-xs text-orange-700 mt-1">
                          Technician: {qrProductData.technicianName}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </View>
              {qrProductData.description && (
                <Text className="text-xs text-gray-600 mt-3">
                  {qrProductData.description}
                </Text>
              )}
            </Pressable>
          )}

          {/* Add to Bucket Button */}
          <TouchableOpacity
            onPress={handleAddToBucketPress}
            className="bg-primary-sage500 mb-4 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
          >
            {loading || uploadingImage ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <ShoppingCart size={22} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Add to Bucket</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Product Name & Price */}
          <View className="flex-row justify-between items-start mb-4">
            <Text className="flex-1 mr-4 text-3xl font-bold text-text-primary">
              {currentPart.part_name}
            </Text>
            <Text className="text-2xl font-bold text-primary-sage600">
              ₹{currentPart.part_price}
            </Text>
          </View>

          {/* Stock Status */}
          <View className="flex-row items-center justify-between mb-4">
            <View className={`flex-row items-center ${stockStatus.bgColor} px-3 py-1.5 rounded-full`}>
              <StockIcon size={18} color={stockStatus.iconColor} />
              <Text className={`ml-1.5 text-sm font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </Text>
            </View>
            {currentPart.rating && (
              <View className="flex-row items-center">
                <Star size={18} color="#F0B27A" fill="#F0B27A" />
                <Text className="ml-1 text-text-secondary font-medium">{currentPart.rating}</Text>
              </View>
            )}
          </View>

          {/* Quick Highlights */}
          <View className="flex-row mb-6">
            <View className="flex-1 items-center p-2 bg-background-secondary rounded-lg mr-2">
              <Package size={20} color="#777777" />
              <Text className="text-xs text-text-secondary mt-1">Section</Text>
              <Text className="text-sm font-semibold text-text-primary">
                {currentPart.section || 'General'}
              </Text>
            </View>
            <View className="flex-1 items-center p-2 bg-background-secondary rounded-lg mx-2">
              <Layers size={20} color="#777777" />
              <Text className="text-xs text-text-secondary mt-1">Category</Text>
              <Text className="text-sm font-semibold text-text-primary">
                {currentPart.category || 'Spare Part'}
              </Text>
            </View>
            <View className="flex-1 items-center p-2 bg-background-secondary rounded-lg ml-2">
              <Hash size={20} color="#777777" />
              <Text className="text-xs text-text-secondary mt-1">Part ID</Text>
              <Text className="text-sm font-semibold text-text-primary">
                {currentPart.id ? `#${currentPart.id}` : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text className="text-lg font-bold text-text-primary mb-2">Description</Text>
            <Text className="text-text-secondary leading-6">
              {currentPart.description || 'No description available.'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PartDetails; 