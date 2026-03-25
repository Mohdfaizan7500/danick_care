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
  PlatformColor,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast } from 'sonner-native';
import NetInfo from '@react-native-community/netinfo';
import Header from '../../../components/Header';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import NoInternet from '../../NoInternet';

// Dummy QR code suggestions
const DUMMY_QR_CODES = [
  { id: '1', code: 'QR123456' },
  { id: '2', code: 'QR789012' },
  { id: '3', code: 'QR345678' },
];

// Dummy product data (in real app, fetched based on QR code)
const DUMMY_PRODUCT = {
  imageUrl: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,h_600/NI_CATALOG/IMAGES/ciw/2026/2/20/827c49ac-3edc-43cb-90cb-59be138d6971_SD7HHGTXF2_MN_19022026.png',
  name: 'LED Bulb 12W',
  partNumber: 'LB-12W-B22',
  price: 249,
};

const Scan = () => {
  const [searchText, setSearchText] = useState('');
  const [searchedProduct, setSearchedProduct] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isConnected, setIsConnected] = useState(true); // Internet connection state

  const device = useCameraDevice('back');
  const device_os = PlatformColor.OS;
  console.log('device:', device_os)

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

  // Code scanner handler
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const scannedValue = codes[0].value;
        setSearchText(scannedValue);
        setShowScanner(false);
        setTimeout(() => {
          setSearchedProduct(DUMMY_PRODUCT);
          toast.success(`Found item for code: ${scannedValue}`);
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
    setTimeout(() => {
      setSearchedProduct(DUMMY_PRODUCT);
      toast.success(`Found item for code: ${searchText}`);
    }, 500);
  };

  const handleClear = () => {
    setSearchText('');
    setSearchedProduct(null);
  };

  // Retry connection (used by NoInternet component if it accepts onRetry)
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

  // Main UI when online
  return (
    // <View className='flex-1 justify-center items-center'>
    //   <Text className='font-bold text-2xl'>Scan screen in development</Text>


    // </View>
    <SafeAreaView className="flex-1 bg-white">
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
            or drag and drop an image
          </Text>
        </TouchableOpacity>

        {/* Search Input with Inline Button and Clear Icon */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1 flex-row items-center border border-gray-300 rounded-l-xl bg-white px-3 ">
            <Icon name="qr-code-outline" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-base text-gray-800 py-5"
              placeholder="Enter QR code number"
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={handleClear} className="ml-2">
                <Icon name="close-circle-outline" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-primary-sage600 rounded-r-xl px-5 py-5 border border-primary-sage600 items-center justify-center"
          >
            <Text className="text-white font-semibold text-base">Search</Text>
          </TouchableOpacity>
        </View>

        {/* Dummy QR Code Suggestions */}
        <View className="mb-6">
          <Text className="text-gray-700 font-semibold text-base mb-2">Try these QR codes:</Text>
          <View className="flex-row flex-wrap">
            {DUMMY_QR_CODES.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSearchText(item.code)}
                className="bg-gray-100 rounded-full px-4 py-2 mr-2 mb-2"
              >
                <Text className="text-primary-sage800">{item.code}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Search Result */}
        {searchedProduct && (
          <View className="bg-white border border-gray-200 rounded-xl p-4 ">
            <Text className="text-lg font-bold text-gray-900 mb-3">Item Found</Text>
            <View className="flex-row">
              <Image
                source={{ uri: searchedProduct.imageUrl }}
                className="w-20 h-20 rounded-lg bg-white"
                resizeMode="cover"
              />
              <View className="flex-1 ml-4 justify-center">
                <Text className="text-base font-semibold text-gray-900">{searchedProduct.name}</Text>
                <Text className="text-sm text-gray-600 mt-1">Part #: {searchedProduct.partNumber}</Text>
                <Text className="text-lg font-bold text-primary-sage600 mt-1">₹{searchedProduct.price}</Text>
              </View>
            </View>
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