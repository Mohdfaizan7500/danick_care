import { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
  Alert,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import NetInfo from '@react-native-community/netinfo';
import Header from '../../../components/Header';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import NoInternet from '../../NoInternet';
import { GetPartDetailQRCode } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import StatusMessage from '../../../components/StatusMessage';

const Scan = () => {
  const [searchText, setSearchText] = useState('A11069');
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(false);
  const { imagUrl } = useAuth();
  const navigation = useNavigation();

  const device = useCameraDevice('back');

  // Monitor internet connection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  // Request camera permission on mount or when opening scanner
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

  // Function to fetch part details from API
  // Function to fetch part details from API
  const fetchPartDetails = async (qrCode) => {
    setLoading(true);
    try {
      const payload = {
        QRCode: qrCode
      };
      const response = await GetPartDetailQRCode(payload);
      console.log('API Response:', response);

      if (response?.data?.success && response?.data?.data?.length > 0) {
        const productData = response.data.data[0];
        console.log('Product Image:', `${imagUrl}${productData.part_image}`);
        setSearchedProduct({
          id: productData.id,
          imageUrl: productData.part_image
            ? `${imagUrl}${productData.part_image}`
            : null,
          name: productData.part_name,
          partNumber: productData.id?.toString() || '',
          price: productData.part_price,
          description: productData.description,
          transferBy: productData.transfer_by,
          partAccept: productData.part_accept,
          transTech: productData.trans_tech,
          technicianName: productData.technician_name,
          type: productData.type,
          complaintId: productData.complaint_id, // Adds complaint ID
        });
        console.log('Fetched Product Type:', productData.type);
        console.log('Complaint ID:', productData.complaint_id);

        toast.custom(
          <StatusMessage type='success' title={`Found item for code: ${qrCode}`} />,
          { duration: 1000 }
        );
      } else {
        toast.custom(
          <StatusMessage type='error' title={`${response?.data?.msg || 'No product found for this QR code'}`} />,
          { duration: 1000 }
        );

        setSearchedProduct(null);
      }
    } catch (error) {
      console.error('Error fetching part details:', error);
      toast.error('Failed to fetch product details');
      setSearchedProduct(null);
    } finally {
      setLoading(false);
    }
  };

  // Code scanner handler
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const scannedValue = codes[0].value;
        setSearchText(scannedValue);
        setShowScanner(false);
        setTimeout(() => {
          fetchPartDetails(scannedValue);
        }, 500);
      }
    },
  });

  const handleScan = () => {
    setShowScanner(true);
  };

  const handleSearch = () => {
    if (!searchText.trim()) {
      toast.error('Please enter a QR code');
      return;
    }
    fetchPartDetails(searchText.trim());
  };

  const handleClear = () => {
    setSearchText('');
    setSearchedProduct(null);
  };

  // Retry connection
  const handleRetry = () => {
    NetInfo.fetch().then(state => setIsConnected(state.isConnected ?? false));
  };

  // If offline, show NoInternet screen
  if (!isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header
          title="Scan QR Code"
          titlePosition="left"
          titleStyle="font-bold text-2xl ml-5"
          showBackButton={true}
          containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
        />
        <NoInternet />
      </SafeAreaView>
    );
  }

  const handleProductPress = (product) => {
    // Navigate to Product Details screen with product data
    navigation.navigate('ProductDetails', { product: product });

  }

  // Main UI when online
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute inset-0 z-50 w-90% pointer-events-none">
        <Toaster />
      </View>
      <Header
        title="Scan QR Code"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
      />

      <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Scan Drop Box */}
        <TouchableOpacity
          onPress={handleScan}
          className="border-2 border-dashed border-primary-sage400 rounded-xl p-2 items-center justify-center bg-teal-50 mb-6"
        >
          <Icon name="scan-outline" size={30} color="#3FD298" />
          <Text className="text-primary-sage600 font-semibold text-sm mt-1">Tap to Scan QR Code</Text>
          <Text className="text-gray-500 text-xs text-center mt-0">
            or enter QR code manually
          </Text>
        </TouchableOpacity>

        {/* Search Input with Inline Button and Clear Icon */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 flex-row items-center border border-gray-300 rounded-l-xl bg-white px-3">
            <Icon name="qr-code-outline" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800 py-5"
              placeholder="Enter QR code number"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              editable={!loading}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleClear} className="ml-2">
                <Icon name="close-circle-outline" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            disabled={loading}
            className={`rounded-r-xl px-5 py-5 border items-center justify-center ${loading
              ? 'bg-gray-400 border-gray-400'
              : 'bg-primary-sage600 border-primary-sage600'
              }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading && (
          <View className="bg-white border border-gray-200 rounded-xl p-8 items-center justify-center mb-6">
            <ActivityIndicator size="large" color="#3FD298" />
            <Text className="text-gray-600 mt-4">Searching for product...</Text>
          </View>
        )}

        {/* Search Result */}
        {!loading && searchedProduct && (
          <Pressable
            onPress={() => handleProductPress(searchedProduct)}
            className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-3">Item Found</Text>

            {/* Check if type is "Yes" and show warning message */}
            {searchedProduct.type === "Yes" && (
              <View className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <View className="flex-row items-center mb-2">
                  <Icon name="warning-outline" size={20} color="#eab308" />
                  <Text className="text-yellow-700 font-semibold ml-2">
                    Part Already in Use
                  </Text>
                </View>
                <Text className="text-yellow-700 text-sm">
                  This part is currently being used in Complaint #{searchedProduct.complaintId}
                </Text>
                {searchedProduct.technicianName && (
                  <Text className="text-yellow-700 text-sm mt-1">
                    Assigned to Technician: {searchedProduct.technicianName}
                  </Text>
                )}
              </View>
            )}

            <View className="flex-row">
              {searchedProduct.imageUrl ? (
                <Image
                  source={{ uri: searchedProduct.imageUrl }}
                  className="w-20 h-20 rounded-lg bg-gray-50"
                  resizeMode="contain"
                  onError={() => console.log('Image load error')}
                  defaultSource={'https://nigamcommunications.com/public/images/no_product.png'}
                />
              ) : (
                <View className="w-20 h-20 rounded-lg bg-gray-100 items-center justify-center">
                  <Icon name="image-outline" size={30} color="#999" />
                </View>
              )}
              <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-gray-900">
                  {searchedProduct.name}
                </Text>
                <Text className="text-sm text-gray-600 mt-1">
                  Part #: {searchedProduct.partNumber}
                </Text>
                <Text className="text-lg font-bold text-primary-sage600 mt-1">
                  ₹{parseFloat(searchedProduct.price).toFixed(2)}
                </Text>
                {searchedProduct.description && (
                  <Text className="text-sm text-gray-600 mt-2">
                    {searchedProduct.description}
                  </Text>
                )}
                {searchedProduct.transferBy && (
                  <View className="mt-2 pt-2 border-t border-gray-100">
                    <Text className="text-xs text-gray-500">
                      Transfer By: {searchedProduct.transferBy}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}

        {/* No Result Message */}
        {!loading && !searchedProduct && searchText.length > 0 && (
          <View className="bg-white border border-gray-200 rounded-xl p-8 items-center justify-center mb-6">
            <Icon name="search-outline" size={50} color="#999" />
            <Text className="text-gray-600 text-center mt-4">
              No product found for QR code: {searchText}
            </Text>
            <Text className="text-gray-400 text-center text-sm mt-2">
              Please check the QR code and try again
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Scanner Modal */}
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
            <View className="flex-1 justify-center items-center bg-black">
              <Text className="text-white">Camera not available or permission denied</Text>
            </View>
          )}
          {/* Close Button */}
          <TouchableOpacity
            onPress={() => setShowScanner(false)}
            className="absolute top-12 right-5 bg-black/50 rounded-full p-3"
          >
            <Icon name="close" size={24} color="white" />
          </TouchableOpacity>

          {/* Scanner Frame Overlay */}
          <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
            <View className="w-64 h-64 border-2 border-white rounded-lg" />
            <Text className="text-white mt-4 text-lg">Align QR code within frame</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Scan;

const styles = StyleSheet.create({});