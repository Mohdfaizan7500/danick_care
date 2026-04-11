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
import { useNavigation, useRoute } from '@react-navigation/native';

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

  const route = useRoute();
  console.log('AMCDetails route params:', route.params);

  const { amc, complaintData } = route.params || {};
  console.log('AMC Data:', amc);
  console.log('Complaint Data:', complaintData);

  // Get parts from AMC data
  const spareParts = amc?.parts || [];
  console.log('Spare Parts from AMC:', spareParts);

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
    setSelectedImage(imageUrl || 'https://via.placeholder.com/200');
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
          description={`QR Code: ${qrCode} linked to ${spareParts.find(part => part.id === partId)?.part_name || 'part'}`}
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
    setTimeout(() => { 
      navigation.navigate('AMCBilling', { 
        linkedParts: linkedItems.map(id => ({
          id,
          part_name: spareParts.find(part => part.id === id)?.part_name,
          qr_code: qrCodeNumbers[id]
        })),
        amc,
        complaintData 
      }); 
    }, 2000);
  };

  // Get image URL helper
  const getImageUrl = (partName) => {
    // You can map part names to specific images or use a default
    const defaultImage = 'https://via.placeholder.com/60x60?text=Part';
    return defaultImage;
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
        {/* AMC Info Header - Now inside ScrollView */}
        <View className="bg-white rounded-xl p-4 mb-4 mt-2 shadow-sm">
          <Text className="text-lg font-bold text-gray-800">{amc?.name || 'AMC Plan'}</Text>
          <Text className="text-sm text-gray-600 mt-1">Valid: {amc?.valid || '1 Year'}</Text>
          <Text className="text-sm text-teal-600 font-semibold mt-1">Price: ₹{amc?.price || '0'}</Text>
        </View>

        {/* Spare Parts List */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Spare Parts to Link ({spareParts.length})
          </Text>

          {spareParts.length > 0 ? (
            spareParts.map((part, index) => (
              <View key={part.id || index} className="bg-white rounded-xl p-3 mb-3 shadow-sm">
                {/* Top row: Image and basic details */}
                <View className="flex-row items-center">
                  {/* Right side details */}
                  <View className="flex-row gap-5 ml-3">
                    <Text className="text-base font-semibold text-gray-800">
                      {part.part_name}
                    </Text>
                    {linkedItems.includes(part.id || index) && (
                      <View className="bg-green-500 px-2 py-0.5 rounded mt-1 self-start">
                        <Text className="text-white text-xs font-semibold">✓ QR Linked</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* QR Code Section for each spare part */}
                <View className="pt-2 flex-row border-gray-100">
                  {/* QR Input with Scan Icon */}
                  <View className="flex-row flex-1 items-center">
                    <View className="flex-1 flex-row items-center border border-gray-300 rounded-l-lg bg-white px-3">
                      <Icon name="qr-code-outline" size={18} color="#666" />
                      <TextInput
                        className="flex-1 ml-2 text-sm text-gray-800 py-3"
                        placeholder="Enter QR Code Number"
                        placeholderTextColor={'gray'}
                        value={qrCodeNumbers[part.id || index] || ''}
                        onChangeText={(value) => handleQrCodeChange(part.id || index, value)}
                        keyboardType="default"
                        editable={!loadingStates[part.id || index] && !linkedItems.includes(part.id || index)}
                      />
                      {(qrCodeNumbers[part.id || index] || '').length > 0 && (
                        <TouchableOpacity
                          onPress={() => handleQrCodeChange(part.id || index, '')}
                          className="ml-2"
                          disabled={linkedItems.includes(part.id || index)}
                        >
                          <Icon name="close-circle-outline" size={18} color="#999" />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Scan Button */}
                    <TouchableOpacity
                      onPress={() => handleScan(part.id || index)}
                      disabled={linkedItems.includes(part.id || index)}
                      className={`rounded-r-lg px-4 py-3 border items-center justify-center ${
                        linkedItems.includes(part.id || index)
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
                    className={`py-2.5 ml-2 px-2 rounded-lg items-center ${
                      linkedItems.includes(part.id || index) ? 'bg-gray-500' : 'bg-orange-500'
                    }`}
                    onPress={() => handleLinkQR(part.id || index)}
                    disabled={loadingStates[part.id || index] || linkedItems.includes(part.id || index)}
                  >
                    {loadingStates[part.id || index] ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <LinkQrCodeIcon color="white" size={16} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white rounded-xl p-8 items-center justify-center">
              <Icon name="cube-outline" size={60} color="#CCCCCC" />
              <Text className="text-gray-500 text-center mt-4">
                No spare parts found for this AMC plan
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Next Button - Hide when keyboard is visible */}
      {!isKeyboardVisible && spareParts.length > 0 && (
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