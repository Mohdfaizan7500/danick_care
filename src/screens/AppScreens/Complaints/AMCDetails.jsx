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
  Platform,
  ActivityIndicator,
  Keyboard,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import Header from '../../../components/Header';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import StatusMessage from '../../../components/StatusMessage';
import { LinkQrCodeIcon } from '../../../assets/svgIcons/SVGIcons';
import { useNavigation } from '@react-navigation/native';

const AMCDetails = () => {
  const [qrCodeNumbers, setQrCodeNumbers] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [linkedItems, setLinkedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [currentPartId, setCurrentPartId] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPartName, setSelectedPartName] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const navigation = useNavigation();

  const device = useCameraDevice('back');

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Dummy AC Spare Parts Data
  const spareParts = [
    {
      id: 1,
      name: 'Compressor',
      price: '₹8,500',
      image: 'https://www.aldahome.com/media/catalog/product/cache/6517c62f5899ad6aa0ba23ceb3eeff97/d/a/daikin-1.8-ton-rotary-compressor-highly-r22.jpg',
      description: 'Rotary compressor for 1.5 ton AC',
      compatibility: 'Daikin, Voltas, LG'
    },
    {
      id: 2,
      name: 'Condenser Coil',
      price: '₹3,200',
      image: 'https://www.aldahome.com/media/catalog/product/cache/6517c62f5899ad6aa0ba23ceb3eeff97/s/a/sansui-split-ac-condenser-coil-1-5-ton-3-star.jpg',
      description: 'Copper condenser coil',
      compatibility: 'All brands'
    },
    {
      id: 3,
      name: 'PCB Board',
      price: '₹2,500',
      image: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRz16XpavGwgAOnW0g7Uf62no0Jo2IhjgYiXmy7yABtQekWZWMf',
      description: 'Main control PCB board',
      compatibility: 'Samsung, LG, Hitachi'
    },
    {
      id: 4,
      name: 'Fan Motor',
      price: '₹1,800',
      image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcS6YKJMFME0ADiMWMv949TunLfLKZpLyLcXILPQs6N-hBEe9AdNQrz_4LU65Gq7sXFd8mFbCJ3L_v6LnvSbI9njG_xHZYMWiA',
      description: 'Outdoor fan motor',
      compatibility: 'Universal'
    },
    {
      id: 5,
      name: 'Capacitor',
      price: '₹450',
      image: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTvqNs-6TjLM4p-hKQknb9jes3Py6x-uDEZ0KCgFp2j4sFD-Xp9v60ENYvoKdoECC_Jw1iRil9Qepwkz0MsEtiZkAv0LYLmQg',
      description: 'Run capacitor 25MFD',
      compatibility: 'All brands'
    },
    {
      id: 6,
      name: 'Thermostat',
      price: '₹650',
      image: 'https://rukminim2.flixcart.com/image/480/640/xif0q/electronic-hobby-kit/e/i/v/geyser-thermostat-and-thermostat-cut-out-suitable-for-v-guard-10-original-imahhfemejtbtsbm.jpeg?q=90',
      description: 'Digital thermostat sensor',
      compatibility: 'Universal'
    },
    {
      id: 7,
      name: 'Remote Control',
      price: '₹350',
      image: 'data:image/jpeg;base64,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',
      description: 'LCD display remote',
      compatibility: 'All brands'
    },
    {
      id: 8,
      name: 'Air Filter',
      price: '₹280',
      image: 'https://via.placeholder.com/60x60?text=Filter',
      description: 'Anti-bacterial air filter',
      compatibility: 'Universal'
    },
    {
      id: 9,
      name: 'Expansion Valve',
      price: '₹1,200',
      image: 'https://via.placeholder.com/60x60?text=Valve',
      description: 'TXV expansion valve',
      compatibility: 'Daikin, Voltas'
    },
    {
      id: 10,
      name: 'Blower Wheel',
      price: '₹950',
      image: 'https://via.placeholder.com/60x60?text=Blower',
      description: 'Indoor blower wheel assembly',
      compatibility: 'LG, Samsung'
    },
  ];

  // Request camera permission
  const requestCameraPermission = async () => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.CAMERA
      : PERMISSIONS.ANDROID.CAMERA;

    const result = await request(permission);
    setHasPermission(result === RESULTS.GRANTED);

    if (result === RESULTS.GRANTED) {
      setShowPermissionModal(false);
      setShowScanner(true);
      toast.custom(
        <StatusMessage type='success' title='Camera Permission Granted' />,
        { duration: 1500 }
      );
    } else {
      setShowPermissionModal(true);
      toast.custom(
        <StatusMessage
          type='error'
          title='Permission Denied'
          description='Please enable camera permission in settings'
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

  // Code scanner handler
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'ean-8', 'code-128'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && currentPartId) {
        const scannedValue = codes[0].value;
        setQrCodeNumbers(prev => ({
          ...prev,
          [currentPartId]: scannedValue
        }));
        setShowScanner(false);
        setCurrentPartId(null);
        toast.success('QR Code Scanned', {
          description: `Code: ${scannedValue}`,
          duration: 2000,
        });
      }
    },
  });

  const handleScan = (partId) => {
    setCurrentPartId(partId);
    if (hasPermission) {
      setShowScanner(true);
    } else {
      requestCameraPermission();
    }
  };

  const handleImagePress = (imageUrl, partName) => {
    setSelectedImage(imageUrl);
    setSelectedPartName(partName);
    setShowImageModal(true);
  };

  const handleQrCodeChange = (partId, value) => {
    setQrCodeNumbers(prev => ({
      ...prev,
      [partId]: value
    }));
  };

  const handleLinkQR = (partId) => {
    const qrCode = qrCodeNumbers[partId];

    if (!qrCode || !qrCode.trim()) {
      toast.custom(
        <StatusMessage type='error' title='Please enter or scan QR code first' />,
        { duration: 2000 }
      );
      return;
    }

    setLoadingStates(prev => ({ ...prev, [partId]: true }));

    // Show loading toast
    const loadingToastId = toast.loading('Linking QR Code to Spare Part...', {
      duration: 2000,
    });

    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [partId]: false }));
      if (!linkedItems.includes(partId)) {
        setLinkedItems([...linkedItems, partId]);
      }
      // Dismiss loading toast and show success
      toast.dismiss(loadingToastId);
      toast.custom(
        <StatusMessage
          type='success'
          title='QR Code Linked Successfully!'
          description={`QR Code: ${qrCode} linked to ${spareParts.find(part => part.id === partId)?.name}`}
        />,
        { duration: 2000 }
      );
    }, 2000);
  };

  const handleNext = () => {
    if (linkedItems.length === 0) {
      toast.custom(
        <StatusMessage type='error' title='Please link at least one spare part' />,
        { duration: 2000 }
      );
      return;
    }

    toast.custom(
      <StatusMessage type='info' title='Proceeding to next step...' />,
      { duration: 2000 }
    );
    setTimeout(() => { navigation.navigate('AMCBilling'); }, 2000);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>

      <Header
        title="Spare Parts QR Linking"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
      />

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* Spare Parts List */}
        <View className="mb-4 mt-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            AC Spare Parts ({spareParts.length})
          </Text>

          {spareParts.map((part) => (
            <View key={part.id} className="bg-white rounded-xl p-3 mb-3 shadow-sm">
              {/* Top row: Image and basic details */}
              <View className="flex-row items-center">
                {/* Left side image - Touchable for modal */}
                {
                  part.image ? (
                    <TouchableOpacity onPress={() => handleImagePress(part.image, part.name)}>

                      <Image source={{ uri: part.image }} className="w-14 h-14 rounded-lg bg-gray-200" />
                    </TouchableOpacity>
                  ) : (
                    <View className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center">
                      <Icon name="cube-outline" size={24} color="#10b981" />
                    </View>
                  )
                }


                {/* Right side details */}
                <View className="flex-1 ml-3">
                  <Text className="text-base font-semibold text-gray-800 mb-1">{part.name}</Text>
                  {linkedItems.includes(part.id) && (
                    <View className="bg-green-500 px-2 py-0.5 rounded mt-1 self-start">
                      <Text className="text-white text-xs font-semibold">✓ QR Linked</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* QR Code Section for each spare part */}
              <View className="pt-3 flex-row border-gray-100">
                {/* QR Input with Scan Icon */}
                <View className="flex-row flex-1 items-center">
                  <View className="flex-1 flex-row items-center border border-gray-300 rounded-l-lg bg-white px-3">
                    <Icon name="qr-code-outline" size={18} color="#666" />
                    <TextInput
                      className="flex-1 ml-2 text-sm text-gray-800 py-3"
                      placeholder="Enter QR Code Number"
                      placeholderTextColor={'gray'}
                      value={qrCodeNumbers[part.id] || ''}
                      onChangeText={(value) => handleQrCodeChange(part.id, value)}
                      keyboardType="default"
                      editable={!loadingStates[part.id] && !linkedItems.includes(part.id)}
                    />
                    {(qrCodeNumbers[part.id] || '').length > 0 && (
                      <TouchableOpacity
                        onPress={() => handleQrCodeChange(part.id, '')}
                        className="ml-2"
                        disabled={linkedItems.includes(part.id)}
                      >
                        <Icon name="close-circle-outline" size={18} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Scan Button */}
                  <TouchableOpacity
                    onPress={() => handleScan(part.id)}
                    disabled={linkedItems.includes(part.id)}
                    className={`rounded-r-lg px-4 py-3 border items-center justify-center ${linkedItems.includes(part.id)
                      ? 'bg-gray-500 border-gray-500'
                      : 'bg-teal-500 border-teal-500'
                      }`}
                  >
                    <Icon name="camera-outline" size={18} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Link Button for each spare part */}
                <TouchableOpacity
                  style={{ width: 40 }}
                  className={`py-2.5 ml-2 px-2 rounded-lg items-center ${linkedItems.includes(part.id) ? 'bg-gray-500' : 'bg-orange-500'
                    }`}
                  onPress={() => handleLinkQR(part.id)}
                  disabled={loadingStates[part.id] || linkedItems.includes(part.id)}
                >
                  {loadingStates[part.id] ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <LinkQrCodeIcon color="white" size={16} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Next Button - Hide when keyboard is visible */}
      {!isKeyboardVisible && (
        <TouchableOpacity
          className="bg-teal-500 py-3.5 mx-5 rounded-xl items-center absolute bottom-3 left-0 right-0"
          onPress={handleNext}
        >
          <Text className="text-white text-lg font-bold">Next</Text>
        </TouchableOpacity>
      )}

      {/* Image Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity
            onPress={() => setShowImageModal(false)}
            className="absolute top-12 right-5 z-10 bg-black/50 rounded-full p-2"
          >
            <Icon name="close" size={28} color="white" />
          </TouchableOpacity>

          <View className="items-center justify-center p-4">
            <Image
              source={{ uri: selectedImage }}
              className="w-80 h-80 rounded-lg"
              resizeMode="contain"
            />
            <Text className="text-white text-lg font-semibold mt-4 text-center">
              {selectedPartName}
            </Text>
            <TouchableOpacity
              onPress={() => setShowImageModal(false)}
              className="mt-6 bg-teal-500 px-6 py-2 rounded-lg"
            >
              <Text className="text-white font-semibold">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Permission Modal */}
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
              Camera permission is needed to scan QR codes for spare parts. Please grant permission to continue.
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
                className="flex-1 bg-teal-600 rounded-xl py-3 ml-2"
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
              <Text className="text-teal-600 text-center">
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => {
          setShowScanner(false);
          setCurrentPartId(null);
        }}
      >
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
            onPress={() => {
              setShowScanner(false);
              setCurrentPartId(null);
            }}
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

export default AMCDetails;

const styles = StyleSheet.create({});