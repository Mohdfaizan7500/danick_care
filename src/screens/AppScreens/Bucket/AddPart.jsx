import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet, // <-- Add this
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchCamera } from 'react-native-image-picker';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { toast, Toaster } from 'sonner-native';
import Header from '../../../components/Header';

// Dummy product data (in real app, fetched based on QR code)
const DUMMY_PRODUCT = {
  imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/ciw/2026/2/20/827c49ac-3edc-43cb-90cb-59be138d6971_SD7HHGTXF2_MN_19022026.png',
  name: 'LED Bulb 12W',
  partNumber: 'LB-12W-B22',
  price: 249,
  category: 'Partner', // default category
};

const AddPartByQR = () => {
  const navigation = useNavigation();

  // QR code state
  const [qrCode, setQrCode] = useState('');

  // Form fields
  const [imageUri, setImageUri] = useState(null);
  const [partName, setPartName] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Partner');

  // UI states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Camera scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const device = useCameraDevice('back');

  // Request camera permission when scanner opens
  useEffect(() => {
    if (showScanner) {
      requestCameraPermission();
    }
  }, [showScanner]);

  const requestCameraPermission = async () => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);
    setHasPermission(result === RESULTS.GRANTED);
    if (result !== RESULTS.GRANTED) {
      Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
      setShowScanner(false);
    }
  };

  // Code scanner handler
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const scannedValue = codes[0].value;
        setQrCode(scannedValue);
        setShowScanner(false);
        // Automatically fetch details after scan
        fetchProductDetails(scannedValue);
      }
    },
  });

  // Simulate API call to fetch product details by QR code
  const fetchProductDetails = (code) => {
    if (!code.trim()) {
      toast.error('Please enter a QR code');
      return;
    }

    setFetching(true);
    // Simulate network delay
    setTimeout(() => {
      // In a real app, you'd fetch based on the code
      // Here we just use dummy data
      setImageUri(DUMMY_PRODUCT.imageUrl);
      setPartName(DUMMY_PRODUCT.name);
      setModelNumber(DUMMY_PRODUCT.partNumber);
      setPrice(DUMMY_PRODUCT.price.toString());
      setCategory(DUMMY_PRODUCT.category);
      setFetching(false);
      toast.success(`Details fetched for code: ${code}`);
    }, 1000);
  };

  // Take photo for part image (optional override)
  const takePhoto = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
      saveToPhotos: true,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        // User cancelled
      } else if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setImageUri(source.uri);
      }
    });
  };

  // Handle adding to bucket
  const handleAddToBucket = () => {
    // Basic validation
    if (!partName.trim()) {
      toast.error('Part name is required');
      return;
    }
    if (!modelNumber.trim()) {
      toast.error('Model number is required');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.custom(
        <View className="bg-primary-sage50 border border-primary-sage400 flex-row items-center gap-2 p-4 rounded-xl shadow-lg mx-4">
          <Icon name="checkmark-circle" size={24} color="#58A890" />
          <View className="flex-1">
            <Text className="text-primary-sage800 font-semibold text-base">Added to Bucket!</Text>
            <Text className="text-primary-sage700 text-sm">{partName} has been added.</Text>
          </View>
        </View>,
        { duration: 2000 }
      );
      // Navigate back after a short delay
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      {/* Toaster for notifications */}
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>

      <Header
        title="Add Part by QR"
        showBackButton
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5 text-text-primary"
        containerStyle="bg-background-primary px-4 py-4 border-b border-ui-border"
      />

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 30 }}>
        {/* QR Code Input Row */}
        <View className="mb-6">
          <Text className="text-text-primary font-medium mb-1">
            QR Code <Text className="text-status-busy">*</Text>
          </Text>
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center border border-ui-border rounded-l-xl bg-background-primary px-3 py-2">
              <Icon name="qr-code-outline" size={20} color="#777777" />
              <TextInput
                className="flex-1 ml-2 text-base text-text-primary"
                placeholder="Enter or scan QR code"
                placeholderTextColor="#999999"
                value={qrCode}
                onChangeText={setQrCode}
                returnKeyType="search"
                onSubmitEditing={() => fetchProductDetails(qrCode)}
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowScanner(true)}
              className="bg-primary-sage600 rounded-r-xl px-4 py-3 items-center justify-center"
            >
              <Icon name="scan-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
          {/* Fetch button for manual entry */}
          <TouchableOpacity
            onPress={() => fetchProductDetails(qrCode)}
            disabled={fetching || !qrCode.trim()}
            className={`mt-2 py-2 rounded-lg flex-row items-center justify-center ${
              fetching || !qrCode.trim() ? 'bg-ui-disabled' : 'bg-primary-sage500'
            }`}
          >
            {fetching ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Icon name="cloud-download-outline" size={18} color="white" />
                <Text className="text-text-inverse font-medium ml-1">Fetch Details</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Image Picker - Camera Only */}
        <TouchableOpacity
          onPress={takePhoto}
          className="bg-background-secondary rounded-xl border-2 border-dashed border-primary-sage400 p-4 items-center mb-6"
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="w-32 h-32 rounded-lg"
              resizeMode="cover"
            />
          ) : (
            <>
              <Icon name="camera-outline" size={40} color="#70C0A8" />
              <Text className="text-primary-sage600 mt-2 font-medium">Take Part Photo</Text>
              <Text className="text-text-tertiary text-xs">(optional, can override)</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Part Name */}
        <View className="mb-4">
          <Text className="text-text-primary font-medium mb-1">
            Part Name <Text className="text-status-busy">*</Text>
          </Text>
          <TextInput
            className="bg-background-primary border border-ui-border rounded-lg px-4 py-3 text-base text-text-primary"
            placeholder="e.g., LED Bulb"
            placeholderTextColor="#999999"
            value={partName}
            onChangeText={setPartName}
          />
        </View>

        {/* Model Number */}
        <View className="mb-4">
          <Text className="text-text-primary font-medium mb-1">
            Model Number <Text className="text-status-busy">*</Text>
          </Text>
          <TextInput
            className="bg-background-primary border border-ui-border rounded-lg px-4 py-3 text-base text-text-primary"
            placeholder="e.g., LB-12W-B22"
            placeholderTextColor="#999999"
            value={modelNumber}
            onChangeText={setModelNumber}
          />
        </View>

        {/* Price (Optional) */}
        <View className="mb-4">
          <Text className="text-text-primary font-medium mb-1">
            Price <Text className="text-text-tertiary">(optional)</Text>
          </Text>
          <TextInput
            className="bg-background-primary border border-ui-border rounded-lg px-4 py-3 text-base text-text-primary"
            placeholder="e.g., 249"
            placeholderTextColor="#999999"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Category (can be made editable if needed) */}
        <View className="mb-6">
          <Text className="text-text-primary font-medium mb-1">Category</Text>
          <View className="bg-background-secondary border border-ui-border rounded-lg px-4 py-3">
            <Text className="text-text-primary">{category}</Text>
          </View>
        </View>

        {/* Add to Bucket Button */}
        <TouchableOpacity
          onPress={handleAddToBucket}
          disabled={loading}
          className={`bg-primary-sage600 py-4 rounded-xl flex-row items-center justify-center mb-6 ${
            loading ? 'opacity-70' : ''
          }`}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Icon name="basket-outline" size={22} color="white" />
              <Text className="text-text-inverse font-bold text-lg ml-2">Add to Bucket</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* QR Scanner Modal */}
      <Modal visible={showScanner} animationType="slide" onRequestClose={() => setShowScanner(false)}>
        <View style={StyleSheet.absoluteFillObject}>
          {device && hasPermission ? (
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={showScanner}
              codeScanner={codeScanner}
            />
          ) : (
            <View className="flex-1 justify-center items-center bg-background-inverse">
              <Text className="text-text-inverse">Camera not available or permission denied</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => setShowScanner(false)}
            className="absolute top-12 right-5 bg-black/50 rounded-full p-3"
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
            <View className="w-64 h-64 border-2 border-white rounded-lg" />
            <Text className="text-white mt-4 text-lg">Align QR code within frame</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddPartByQR;

const styles = StyleSheet.create({}); // Keep empty style if needed, or remove