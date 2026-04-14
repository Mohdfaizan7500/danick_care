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
  BackHandler,
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
import { AMCQRCodeInsertPart, AMCQRCodeRemove } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const AMCDetails = () => {
  const { user } = useAuth();
  const [qrCodeNumbers, setQrCodeNumbers] = useState({});
  const [loadingStates, setLoadingStates] = useState({});
  const [removalLoadingStates, setRemovalLoadingStates] = useState({});
  const [linkedItems, setLinkedItems] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [currentPartId, setCurrentPartId] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPartName, setSelectedPartName] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [billingId, setBillingId] = useState(null);
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
  const technicianId = user?.id || '1';

  // Check if all parts are linked
  const allPartsLinked = spareParts.length > 0 && linkedItems.length === spareParts.length;

  // Generate random billing ID on component mount
  useEffect(() => {
    generateBillingId();
  }, []);

  // Generate 6 digit random number for billing ID
  const generateBillingId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newBillingId = `AMC${randomNum}`;
    setBillingId(newBillingId);
    console.log('Generated Billing ID:', newBillingId);
  };

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

  // Handle back button press
  useEffect(() => {
    const backAction = () => {
      if (linkedItems.length > 0) {
        // Show toast message if there are linked QR codes
        toast.custom(
          <StatusMessage 
            type='error' 
            title='Cannot Go Back' 
            message={`Please remove all linked QR code(s) first`} 
          />,
          { duration: 3000 }
        );
        return true; // Prevent back action
      }
      // Allow back action if no linked items
      navigation.goBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [linkedItems, navigation]);

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

  const handleLinkQR = async (partId, partName, partIndex) => {
    const qrCode = qrCodeNumbers[partId];

    if (!qrCode || !qrCode.trim()) {
      toast.custom(
        <StatusMessage type='error' title='Please enter or scan QR code first' />,
        { duration: 2000 }
      );
      return;
    }

    setLoadingStates(prev => ({ ...prev, [partId]: true }));

    try {
      // Prepare payload for API
      const payload = {
        technician_id: technicianId,
        amc_id: amc?.id?.toString() || '',
        comp_id: complaintData?.id?.toString() || '',
        billing_id: billingId,
        part_name: partName,
        qr_code: qrCode,
      };

      console.log('Linking QR Code with payload:', payload);
      
      // Call API to insert part with QR code
      const response = await AMCQRCodeInsertPart(payload);
      console.log('AMC QR Code Insert Part response:', response);

      if (response?.data?.success) {
        // Success - mark as linked
        if (!linkedItems.includes(partId)) {
          setLinkedItems([...linkedItems, partId]);
        }
        
        toast.custom(
          <StatusMessage
            type='success'
            title='QR Code Linked Successfully!'
            description={`${partName} linked with QR Code: ${qrCode}`}
          />,
          { duration: 2000 }
        );
      } else {
        // Failed to link
        toast.custom(
          <StatusMessage
            type='error'
            title='Failed to Link QR Code'
            description={response?.data?.msg || response?.data?.message || 'Please try again'}
          />,
          { duration: 3000 }
        );
      }
    } catch (error) {
      console.error('Error linking QR code:', error);
      toast.custom(
        <StatusMessage
          type='error'
          title='Error Linking QR Code'
          description={error.message || 'Please try again'}
        />,
        { duration: 3000 }
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, [partId]: false }));
    }
  };

  const handleRemoveQR = async (partId, partName, qrCode) => {
    if (!qrCode || !qrCode.trim()) {
      toast.custom(
        <StatusMessage type='error' title='No QR code to remove' />,
        { duration: 2000 }
      );
      return;
    }

    setRemovalLoadingStates(prev => ({ ...prev, [partId]: true }));

    try {
      // Prepare payload for removal API
      const payload = {
        technician_id: technicianId,
        qr_code: qrCode,
      };

      console.log('Removing QR Code with payload:', payload);
      
      // Call API to remove QR code
      const response = await AMCQRCodeRemove(payload);
      console.log('AMC QR Code Remove response:', response);

      if (response?.data?.success) {
        // Success - remove from linked items
        setLinkedItems(prev => prev.filter(id => id !== partId));
        
        // Clear the QR code input for this part
        setQrCodeNumbers(prev => ({
          ...prev,
          [partId]: ''
        }));
        
        toast.custom(
          <StatusMessage
            type='success'
            title='QR Code Removed Successfully!'
            description={`${partName} QR code has been unlinked`}
          />,
          { duration: 2000 }
        );
      } else {
        // Failed to remove
        toast.custom(
          <StatusMessage
            type='error'
            title='Failed to Remove QR Code'
            description={response?.data?.msg || response?.data?.message || 'Please try again'}
          />,
          { duration: 3000 }
        );
      }
    } catch (error) {
      console.error('Error removing QR code:', error);
      toast.custom(
        <StatusMessage
          type='error'
          title='Error Removing QR Code'
          description={error.message || 'Please try again'}
        />,
        { duration: 3000 }
      );
    } finally {
      setRemovalLoadingStates(prev => ({ ...prev, [partId]: false }));
    }
  };

  const handleNext = () => {
    if (!allPartsLinked) {
      const remainingCount = spareParts.length - linkedItems.length;
      toast.custom(
        <StatusMessage 
          type='error' 
          title='Cannot Proceed' 
          message={`Please link all spare parts first (${remainingCount} remaining)`} 
        />,
        { duration: 3000 }
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
        complaintData,
        billingId 
      }); 
    }, 2000);
  };

  // Custom back button handler for the header
  const handleHeaderBack = () => {
    if (linkedItems.length > 0) {
      toast.custom(
        <StatusMessage 
          type='error' 
          title='Cannot Go Back' 
          message={`Please remove all linked QR code(s) first`} 
        />,
        { duration: 3000 }
      );
    } else {
      navigation.goBack();
    }
  };

  // Get image URL helper
  const getImageUrl = (partName) => {
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
        onBackPress={handleHeaderBack}
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
          {billingId && (
            <Text className="text-xs text-gray-500 mt-2">Billing ID: {billingId}</Text>
          )}
          
          {/* Progress indicator */}
          {spareParts.length > 0 && (
            <View className="mt-3">
              <View className="flex-row justify-between mb-1">
                <Text className="text-xs text-gray-600">Linking Progress</Text>
                <Text className="text-xs font-semibold text-teal-600">
                  {linkedItems.length}/{spareParts.length} Parts Linked
                </Text>
              </View>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${(linkedItems.length / spareParts.length) * 100}%` }}
                />
              </View>
            </View>
          )}
          
          {/* Warning message when QR codes are linked */}
          {linkedItems.length > 0 && linkedItems.length < spareParts.length && (
            <View className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <Text className="text-yellow-700 text-xs text-center">
                ⚠️ Please link all {spareParts.length} spare parts to continue
              </Text>
            </View>
          )}
          
          {/* Success message when all parts are linked */}
          {allPartsLinked && (
            <View className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2">
              <Text className="text-green-700 text-xs text-center">
                ✓ All {spareParts.length} spare parts linked successfully! You can now proceed.
              </Text>
            </View>
          )}
        </View>

        {/* Spare Parts List */}
        <View className="mb-4">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Spare Parts to Link ({spareParts.length})
          </Text>

          {spareParts.length > 0 ? (
            spareParts.map((part, index) => {
              const partId = part.id || index;
              const partName = part.part_name;
              const isLinked = linkedItems.includes(partId);
              const currentQrCode = qrCodeNumbers[partId];
              
              return (
                <View key={partId} className="bg-white rounded-xl p-3 mb-3 shadow-sm">
                  {/* Top row with remove button if linked */}
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <Text className="text-base font-semibold text-gray-800">
                        {partName}
                      </Text>
                      {isLinked && (
                        <View className="bg-green-500 px-2 py-0.5 rounded ml-2">
                          <Text className="text-white text-xs font-semibold">✓ QR Linked</Text>
                        </View>
                      )}
                    </View>
                    
                    {/* Remove button in header for linked items */}
                    {isLinked && (
                      <TouchableOpacity
                        onPress={() => handleRemoveQR(partId, partName, currentQrCode)}
                        disabled={removalLoadingStates[partId]}
                        className="bg-red-500 px-3 py-1.5 rounded-lg flex-row items-center"
                      >
                        {removalLoadingStates[partId] ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <>
                            <Icon name="trash-outline" size={14} color="white" />
                            <Text className="text-white text-xs font-medium ml-1">Remove</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* QR Code Section */}
                  <View className="pt-2 border-t border-gray-100">
                    {isLinked ? (
                      // Show linked QR code as readonly
                      <View className="flex-row items-center bg-gray-50 rounded-lg p-3">
                        <Icon name="qr-code" size={20} color="#4CAF50" />
                        <Text className="text-sm text-gray-700 ml-2 flex-1">{currentQrCode}</Text>
                      </View>
                    ) : (
                      // Show input and scan for unlinked items
                      <View className="flex-row items-center">
                        <View className="flex-1 flex-row items-center border border-gray-300 rounded-l-lg bg-white px-3">
                          <Icon name="qr-code-outline" size={18} color="#666" />
                          <TextInput
                            className="flex-1 ml-2 text-sm text-gray-800 py-3"
                            placeholder="Enter QR Code Number"
                            placeholderTextColor={'gray'}
                            value={currentQrCode || ''}
                            onChangeText={(value) => handleQrCodeChange(partId, value)}
                            keyboardType="default"
                          />
                          {(currentQrCode || '').length > 0 && (
                            <TouchableOpacity
                              onPress={() => handleQrCodeChange(partId, '')}
                              className="ml-2"
                            >
                              <Icon name="close-circle-outline" size={18} color="#999" />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Scan Button */}
                        <TouchableOpacity
                          onPress={() => handleScan(partId)}
                          className="rounded-r-lg px-4 py-3 border items-center justify-center bg-teal-500 border-teal-500"
                        >
                          <Icon name="camera-outline" size={18} color="white" />
                        </TouchableOpacity>

                        {/* Link Button */}
                        <TouchableOpacity
                          className="py-2.5 px-3 rounded-lg items-center bg-orange-500 ml-2"
                          onPress={() => handleLinkQR(partId, partName, index)}
                          disabled={loadingStates[partId]}
                        >
                          {loadingStates[partId] ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <LinkQrCodeIcon color="white" size={16} />
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
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

      {/* Next Button - Only enabled when all parts are linked */}
      {!isKeyboardVisible && spareParts.length > 0 && (
        <TouchableOpacity
          className={`py-3.5 mx-5 rounded-xl items-center absolute bottom-3 left-0 right-0 ${
            allPartsLinked ? 'bg-teal-500' : 'bg-gray-400'
          }`}
          onPress={handleNext}
          disabled={!allPartsLinked}
        >
          <Text className="text-white text-lg font-bold">
            {allPartsLinked ? 'Next' : `Link ${spareParts.length - linkedItems.length} More`}
          </Text>
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