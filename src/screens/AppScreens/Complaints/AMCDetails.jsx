import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import Header from '../../../components/Header';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import StatusMessage from '../../../components/StatusMessage';

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

  const device = useCameraDevice('back');

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
      
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        
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
                <TouchableOpacity onPress={() => handleImagePress(part.image, part.name)}>
                  <Image source={{ uri: part.image }} className="w-14 h-14 rounded-lg bg-gray-200" />
                </TouchableOpacity>
                
                {/* Right side details */}
                <View className="flex-1 ml-3">
                  <Text className="text-base font-semibold text-gray-800 mb-1">{part.name}</Text>
                  <Text className="text-sm text-gray-600 font-medium">{part.price}</Text>
                  <Text className="text-xs text-gray-500 mt-1">{part.description}</Text>
                  <Text className="text-xs text-teal-600 mt-1">Compatible: {part.compatibility}</Text>
                  {linkedItems.includes(part.id) && (
                    <View className="bg-green-500 px-2 py-0.5 rounded mt-1 self-start">
                      <Text className="text-white text-xs font-semibold">✓ QR Linked</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* QR Code Section for each spare part */}
              <View className="mt-3 pt-3 border-t border-gray-100">
                <Text className="text-xs font-medium text-gray-600 mb-2">QR Code Details</Text>
                
                {/* QR Input with Scan Icon */}
                <View className="flex-row items-center">
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
                    className={`rounded-r-lg px-4 py-3 border items-center justify-center ${
                      linkedItems.includes(part.id) 
                        ? 'bg-gray-300 border-gray-300' 
                        : 'bg-teal-500 border-teal-500'
                    }`}
                  >
                    <Icon name="camera-outline" size={18} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Link Button for each spare part */}
                <TouchableOpacity 
                  className={`mt-3 py-2 rounded-lg items-center ${
                    linkedItems.includes(part.id) ? 'bg-gray-300' : 'bg-orange-500'
                  }`}
                  onPress={() => handleLinkQR(part.id)}
                  disabled={loadingStates[part.id] || linkedItems.includes(part.id)}
                >
                  {loadingStates[part.id] ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text className="text-white font-semibold text-sm">
                      {linkedItems.includes(part.id) ? 'QR Code Linked' : 'Link QR Code to Part'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
        
        {/* Next Button */}
        <TouchableOpacity 
          className="bg-green-500 py-3.5 rounded-xl items-center mt-4 mb-5"
          onPress={handleNext}
        >
          <Text className="text-white text-lg font-bold">Next</Text>
        </TouchableOpacity>
        
        <View className="h-5" />
      </ScrollView>

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
      <Modal visible={showScanner} animationType="slide" onRequestClose={() => {
        setShowScanner(false);
        setCurrentPartId(null);
      }}>
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