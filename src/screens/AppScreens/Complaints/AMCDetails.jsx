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
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import Header from '../../../components/Header';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import StatusMessage from '../../../components/StatusMessage';
import { BucketIcon, LinkQrCodeIcon } from '../../../assets/svgIcons/SVGIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  AMCQRCodeInsertPart, 
  AMCQRCodeRemove, 
  FetchPartsForReplaced,
  AMCPartQRCodeUpdatePart,
  RemoveAMCPart,
  AMCComplaintDetails,
  DeletAMCRecordWithParts 
} from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import DialogBox from '../../../components/DilaogBox';

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
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingRecord, setDeletingRecord] = useState(false);
  
  // New states for fetched AMC complaint details
  const [loadingComplaintDetails, setLoadingComplaintDetails] = useState(false);
  const [fetchedComplaint, setFetchedComplaint] = useState(null);
  const [fetchedAmcDetails, setFetchedAmcDetails] = useState(null);
  
  // New states for part replacement
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [selectedReplacePart, setSelectedReplacePart] = useState(null);
  const [availableParts, setAvailableParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(false);
  const [selectedReplacementPart, setSelectedReplacementPart] = useState(null);
  const [replacedParts, setReplacedParts] = useState({}); // Store replaced part info
  const [replaceLoadingStates, setReplaceLoadingStates] = useState({});
  const [removeReplaceLoadingStates, setRemoveReplaceLoadingStates] = useState({});

  const navigation = useNavigation();

  const route = useRoute();
  console.log('AMCDetails route params:', route.params);

  const { amc, complaintData, amcComplaintId } = route.params || {};
  console.log('AMC Data:', amc);
  console.log('Complaint Data:', complaintData);
  console.log('AMC Complaint ID:', amcComplaintId);

  // Get parts from AMC data (use fetched data if available)
  const spareParts = fetchedAmcDetails?.parts || amc?.parts || [];
  console.log('Spare Parts from AMC:', spareParts);

  const device = useCameraDevice('back');
  const technicianId = user?.id || '1';

  // Check if all parts are linked
  const allPartsLinked = spareParts.length > 0 && linkedItems.length === spareParts.length;

  // Fetch AMC Complaint Details on mount
  useEffect(() => {
    fetchAMCComplaintDetails();
  }, []);

  // Fetch AMC Complaint Details
  const fetchAMCComplaintDetails = async () => {
    // Use amcComplaintId from params or from complaintData
    const complaintId = amcComplaintId || complaintData?.id;
    
    if (!complaintId) {
      console.log('No complaint ID available for AMCComplaintDetails');
      generateBillingId();
      return;
    }

    setLoadingComplaintDetails(true);
    
    try {
      const payload = {
        amc_complaint_id: complaintId.toString(),
        technician_id: technicianId,
      };
      
      console.log('Fetching AMC Complaint Details with payload:', payload);
      const response = await AMCComplaintDetails(payload);
      console.log('AMCComplaintDetails response:', response);
      
      if (response?.data?.success) {
        const complaint = response.data.complaint;
        const amcDetailsData = response.data.amc_details;
        
        setFetchedComplaint(complaint);
        setFetchedAmcDetails(amcDetailsData);
        
        // Set billing ID from complaint data if available
        if (complaint?.billing_id) {
          setBillingId(complaint.billing_id);
        } else {
          generateBillingId();
        }
        
        toast.custom(
          <StatusMessage 
            type='success' 
            title='AMC Details Loaded' 
            message={`Loaded details for ${amcDetailsData?.name || 'AMC Plan'}`}
          />,
          { duration: 2000 }
        );
      } else {
        console.error('Failed to load AMC complaint details:', response?.data);
        generateBillingId();
        toast.custom(
          <StatusMessage 
            type='warning' 
            title='Information' 
            message='Could not load AMC details. Using provided data.' 
          />,
          { duration: 2000 }
        );
      }
    } catch (error) {
      console.error('Error fetching AMC complaint details:', error);
      generateBillingId();
      toast.custom(
        <StatusMessage 
          type='error' 
          title='Error' 
          message={error.message || 'Failed to load AMC details'} 
        />,
        { duration: 3000 }
      );
    } finally {
      setLoadingComplaintDetails(false);
    }
  };

  // Generate random billing ID on component mount
  const generateBillingId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const newBillingId = `AMC${randomNum}`;
    setBillingId(newBillingId);
    console.log('Generated Billing ID:', newBillingId);
  };

  // Handle delete AMC record with parts
  const handleDeleteAMCRecord = async () => {
    const amcId = fetchedAmcDetails?.id?.toString() || amc?.id?.toString();
    const complaintId = fetchedComplaint?.complaint_id?.toString() || complaintData?.id?.toString();
    
    if (!amcId || !complaintId || !billingId) {
      toast.custom(
        <StatusMessage 
          type='error' 
          title='Cannot Delete' 
          message='Missing required information to delete AMC record.' 
        />,
        { duration: 3000 }
      );
      return;
    }

    setDeletingRecord(true);
    
    try {
      const payload = {
        amc_id: amcId,
        complaint_id: complaintId,
        billing_id: billingId,
      };
      
      console.log('Deleting AMC record with payload:', payload);
      const response = await DeletAMCRecordWithParts(payload);
      console.log('DeletAMCRecordWithParts response:', response);
      
      if (response?.data?.success) {
        toast.custom(
          <StatusMessage 
            type='success' 
            title='Success' 
            message='AMC record has been deleted successfully.' 
          />,
          { duration: 2000 }
        );
        
        // Navigate back after successful deletion
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        toast.custom(
          <StatusMessage 
            type='error' 
            title='Failed to Delete' 
            message={response?.data?.msg || response?.data?.message || 'Please try again.'} 
          />,
          { duration: 3000 }
        );
      }
    } catch (error) {
      console.error('Error deleting AMC record:', error);
      toast.custom(
        <StatusMessage 
          type='error' 
          title='Error' 
          message={error.message || 'Failed to delete AMC record. Please try again.'} 
        />,
        { duration: 3000 }
      );
    } finally {
      setDeletingRecord(false);
      setShowDeleteConfirmModal(false);
    }
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
        toast.custom(
          <StatusMessage
            type='error'
            title='Cannot Go Back'
            message={`Please remove all linked QR code(s) first. \n(कृपया पहले सभी लिंक किए गए QR कोड हटाएं)`}
          />,
          { duration: 3000 }
        );
        return true;
      }
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
      const payload = {
        technician_id: technicianId,
        amc_id: fetchedAmcDetails?.id?.toString() || amc?.id?.toString() || '',
        comp_id: fetchedComplaint?.complaint_id?.toString() || complaintData?.id?.toString() || '',
        billing_id: billingId,
        part_name: partName,
        qr_code: qrCode,
      };

      console.log('Linking QR Code with payload:', payload);

      const response = await AMCQRCodeInsertPart(payload);
      console.log('AMC QR Code Insert Part response:', response);

      if (response?.data?.success) {
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
        toast.custom(
          <StatusMessage
            type='error'
            title='Failed to Link QR Code'
            message={response?.data?.msg || response?.data?.message || 'Please try again'}
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
          message={error.message || 'Please try again'}
        />,
        { duration: 3000 }
      );
    } finally {
      setLoadingStates(prev => ({ ...prev, [partId]: false }));
    }
  };

  // Handle Replace Part (Bucket Icon Click)
  const handleReplacePart = async (partId, partName) => {
    // Check if part is already replaced
    if (replacedParts[partId]) {
      toast.custom(
        <StatusMessage
          type='info'
          title='Part Already Replaced'
          description={`${partName} has already been replaced with ${replacedParts[partId].replacement_part_name}`}
        />,
        { duration: 3000 }
      );
      return;
    }

    setSelectedReplacePart({ id: partId, name: partName });
    setLoadingParts(true);
    setShowReplaceModal(true);

    try {
      const payload = {
        technician_id: technicianId,
        part_name: partName,
      };

      console.log('Fetching replacement parts with payload:', payload);
      const response = await FetchPartsForReplaced(payload);
      console.log('FetchPartsForReplaced response:', response);

      if (response?.data?.success && response?.data?.data) {
        setAvailableParts(response.data.data);
        if (response.data.data.length === 0) {
          toast.custom(
            <StatusMessage
              type='warning'
              title='No Replacement Parts Available'
              description={`No replacement parts found for ${partName}`}
            />,
            { duration: 3000 }
          );
        }
      } else {
        toast.custom(
          <StatusMessage
            type='error'
            title='Failed to Fetch Parts'
            message={response?.data?.msg || 'Please try again'}
          />,
          { duration: 3000 }
        );
        setShowReplaceModal(false);
      }
    } catch (error) {
      console.error('Error fetching replacement parts:', error);
      toast.custom(
        <StatusMessage
          type='error'
          title='Error'
          message={error.message || 'Failed to fetch replacement parts'}
        />,
        { duration: 3000 }
      );
      setShowReplaceModal(false);
    } finally {
      setLoadingParts(false);
    }
  };

  // Handle selecting a replacement part
  const handleSelectReplacement = (part) => {
    setSelectedReplacementPart(part);
  };

  // Handle confirming the replacement with API call
  const handleConfirmReplacement = async () => {
    if (!selectedReplacementPart) {
      toast.custom(
        <StatusMessage
          type='error'
          title='No Part Selected'
          description='Please select a replacement part'
        />,
        { duration: 2000 }
      );
      return;
    }

    const partId = selectedReplacePart.id;
    const partName = selectedReplacePart.name;
    
    setReplaceLoadingStates(prev => ({ ...prev, [partId]: true }));

    try {
      // Prepare payload for API
      const payload = {
        technician_id: technicianId,
        amc_id: fetchedAmcDetails?.id?.toString() || amc?.id?.toString() || '',
        comp_id: fetchedComplaint?.complaint_id?.toString() || complaintData?.id?.toString() || '',
        billing_id: billingId,
        qr_code: selectedReplacementPart.qr_code,
      };

      console.log('Updating part with replacement API payload:', payload);
      const response = await AMCPartQRCodeUpdatePart(payload);
      console.log('AMCPartQRCodeUpdatePart response:', response);

      if (response?.data?.success) {
        // Store the replaced part information locally
        setReplacedParts(prev => ({
          ...prev,
          [partId]: {
            original_part_name: partName,
            replacement_part_id: selectedReplacementPart.id,
            replacement_part_name: selectedReplacementPart.part_name,
            replacement_qr_code: selectedReplacementPart.qr_code,
            replacement_image: selectedReplacementPart.part_image,
            replacement_price: selectedReplacementPart.part_price,
            replacement_description: selectedReplacementPart.description,
          }
        }));

        // Auto-fill the QR code with the replacement part's QR code
        setQrCodeNumbers(prev => ({
          ...prev,
          [partId]: selectedReplacementPart.qr_code
        }));

        // Auto-link the replacement part if not already linked
        if (!linkedItems.includes(partId)) {
          setLinkedItems(prev => [...prev, partId]);
        }

        // Show success toast
        toast.custom(
          <StatusMessage
            type='success'
            title='Part Replaced Successfully!'
            description={`${partName} replaced with ${selectedReplacementPart.part_name}`}
          />,
          { duration: 3000 }
        );

        // Close modal and reset states
        setShowReplaceModal(false);
        setSelectedReplacePart(null);
        setSelectedReplacementPart(null);
        setAvailableParts([]);
      } else {
        // Failed to update
        toast.custom(
          <StatusMessage
            type='error'
            title='Failed to Replace Part'
            message={response?.data?.msg || response?.data?.message || 'Please try again'}
          />,
          { duration: 3000 }
        );
      }
    } catch (error) {
      console.error('Error replacing part:', error);
      toast.custom(
        <StatusMessage
          type='error'
          title='Error Replacing Part'
          message={error.message || 'Please try again'}
        />,
        { duration: 3000 }
      );
    } finally {
      setReplaceLoadingStates(prev => ({ ...prev, [partId]: false }));
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
      const payload = {
        technician_id: technicianId,
        qr_code: qrCode,
      };

      console.log('Removing QR Code with payload:', payload);

      const response = await AMCQRCodeRemove(payload);
      console.log('AMC QR Code Remove response:', response);

      if (response?.data?.success) {
        setLinkedItems(prev => prev.filter(id => id !== partId));
        
        // Also remove replaced part info if exists
        if (replacedParts[partId]) {
          const newReplacedParts = { ...replacedParts };
          delete newReplacedParts[partId];
          setReplacedParts(newReplacedParts);
        }

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

  // Handle removing the replacement with API call
  const handleRemoveReplacement = async (partId, partName) => {
    const replacedInfo = replacedParts[partId];
    if (!replacedInfo) return;

    setRemoveReplaceLoadingStates(prev => ({ ...prev, [partId]: true }));

    try {
      // Prepare payload for API
      const payload = {
        technician_id: technicianId,
        amc_id: fetchedAmcDetails?.id?.toString() || amc?.id?.toString() || '',
        comp_id: fetchedComplaint?.complaint_id?.toString() || complaintData?.id?.toString() || '',
        billing_id: billingId,
        qr_code: replacedInfo.replacement_qr_code,
      };

      console.log('Removing replacement part with payload:', payload);
      const response = await RemoveAMCPart(payload);
      console.log('RemoveAMCPart response:', response);

      if (response?.data?.success) {
        // Remove from linked items
        setLinkedItems(prev => prev.filter(id => id !== partId));
        
        // Remove replaced part info
        const newReplacedParts = { ...replacedParts };
        delete newReplacedParts[partId];
        setReplacedParts(newReplacedParts);

        // Clear the QR code
        setQrCodeNumbers(prev => ({
          ...prev,
          [partId]: ''
        }));

        toast.custom(
          <StatusMessage
            type='success'
            title='Replacement Removed Successfully!'
            description={`Replacement for ${partName} has been removed.`}
          />,
          { duration: 3000 }
        );
      } else {
        toast.custom(
          <StatusMessage
            type='error'
            title='Failed to Remove Replacement'
            message={response?.data?.msg || response?.data?.message || 'Please try again'}
          />,
          { duration: 3000 }
        );
      }
    } catch (error) {
      console.error('Error removing replacement:', error);
      toast.custom(
        <StatusMessage
          type='error'
          title='Error Removing Replacement'
          message={error.message || 'Please try again'}
        />,
          { duration: 3000 }
      );
    } finally {
      setRemoveReplaceLoadingStates(prev => ({ ...prev, [partId]: false }));
    }
  };

  const handleNext = () => {
    toast.custom(
      <StatusMessage type='info' title='Proceeding to next step...' />,
      { duration: 2000 }
    );
    setTimeout(() => {
      navigation.navigate('AMCBilling', {
        linkedParts: linkedItems.map(id => ({
          id,
          part_name: spareParts.find(part => part.id === id)?.part_name,
          qr_code: qrCodeNumbers[id],
          replaced_with: replacedParts[id] || null
        })),
        amc: fetchedAmcDetails || amc,
        complaintData: fetchedComplaint || complaintData,
        billingId
      });
    }, 2000);
  };

  const handleHeaderBack = () => {
    if (linkedItems.length > 0) {
      toast.custom(
        <StatusMessage
          type='error'
          title='Cannot Go Back'
          message={`Please remove all linked QR code(s) first. \nकृपया पहले सभी लिंक किए गए QR कोड हटाएं`}
        />,
        { duration: 3000 }
      );
    } else {
      navigation.goBack();
    }
  };

  // Render replacement part item in modal
  const renderReplacementItem = ({ item }) => {
    const isSelected = selectedReplacementPart?.id === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => handleSelectReplacement(item)}
        className={`flex-row p-3 mb-2 rounded-lg border ${isSelected ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white'}`}
      >
        <View className="w-16 h-16 bg-gray-100 rounded-lg mr-3 overflow-hidden">
          {item.part_image ? (
            <Image 
              source={{ uri: item.part_image }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <Icon name="image-outline" size={24} color="#999" />
            </View>
          )}
        </View>
        
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800">{item.part_name}</Text>
          <Text className="text-xs text-gray-600 mt-1" numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm font-semibold text-teal-600">₹{item.part_price}</Text>
            <Text className="text-xs text-gray-500">QR: {item.qr_code}</Text>
          </View>
        </View>
        
        {isSelected && (
          <View className="justify-center ml-2">
            <Icon name="checkmark-circle" size={24} color="#14B8A6" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Custom header right component with delete icon
  const renderHeaderRight = () => {
    if (linkedItems.length > 0) {
      return (
        <TouchableOpacity
          onPress={() => setShowDeleteConfirmModal(true)}
          className="mr-2"
        >
          <Icon name="trash-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      );
    }
    return null;
  };

  // Show loading indicator while fetching complaint details
  if (loadingComplaintDetails) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header
          title="Spare Parts QR Linking"
          titlePosition="left"
          titleStyle="font-bold text-2xl ml-5"
          showBackButton={true}
          onBackPress={handleHeaderBack}
          containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#14B8A6" />
          <Text className="text-gray-600 mt-4">Loading AMC details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>

      <Header
        title="Spare Parts QR Linking"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        onBackPress={handleHeaderBack}
        showRightIcon={linkedItems.length > 0}
        customRightIconComponent={renderHeaderRight()}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
      />

      <ScrollView
        className="flex-1 px-4 bg-gray-100"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {/* AMC Info Header */}
        <View className="bg-white rounded-xl p-4 mb-4 mt-2 shadow-sm">
          <Text className="text-lg font-bold text-gray-800">{fetchedAmcDetails?.name || amc?.name || 'AMC Plan'}</Text>
          <Text className="text-sm text-gray-600 mt-1">Valid: {fetchedAmcDetails?.valid || amc?.valid || '1 Year'}</Text>
          <Text className="text-sm text-teal-600 font-semibold mt-1">Price: ₹{fetchedAmcDetails?.price || amc?.price || '0'}</Text>
          {billingId && (
            <Text className="text-xs text-gray-500 mt-2">Billing ID: {billingId}</Text>
          )}

          {/* Show complaint info if available */}
          {fetchedComplaint && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="text-xs text-gray-500">Complaint ID: {fetchedComplaint.complaint_id}</Text>
              <Text className="text-xs text-gray-500">Status: {fetchedComplaint.status}</Text>
              <Text className="text-xs text-gray-500">Total Service: {fetchedComplaint.total_service}</Text>
            </View>
          )}

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

          {linkedItems.length > 0 && linkedItems.length < spareParts.length && (
            <View className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <Text className="text-yellow-700 text-xs text-center">
                ⚠️ Please link all {spareParts.length} spare parts to continue
              </Text>
            </View>
          )}

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
              const replacedInfo = replacedParts[partId];
              const isReplacing = replaceLoadingStates[partId];
              const isRemovingReplace = removeReplaceLoadingStates[partId];

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
                      {replacedInfo && (
                        <View className="bg-orange-500 px-2 py-0.5 rounded ml-2">
                          <Text className="text-white text-xs font-semibold">Replaced</Text>
                        </View>
                      )}
                    </View>

                    {/* Remove button for linked items */}
                    {isLinked && !replacedInfo &&(
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

                  {/* QR Code Section - Display replaced part info or input form */}
                  <View className="pt-2 border-t border-gray-100">
                    {isLinked && replacedInfo ? (
                      // Display replaced part information with image and details
                      <View>
                        {/* Replacement Part Card */}
                        <View className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                          <View className="flex-row">
                            {/* Part Image */}
                            <TouchableOpacity
                              onPress={() => handleImagePress(replacedInfo.replacement_image, replacedInfo.replacement_part_name)}
                              className="w-20 h-20 bg-gray-200 rounded-lg mr-3 overflow-hidden"
                            >
                              {replacedInfo.replacement_image ? (
                                <Image 
                                  source={{ uri: replacedInfo.replacement_image }} 
                                  className="w-full h-full"
                                  resizeMode="cover"
                                />
                              ) : (
                                <View className="w-full h-full items-center justify-center">
                                  <Icon name="image-outline" size={24} color="#999" />
                                </View>
                              )}
                            </TouchableOpacity>

                            {/* Part Details */}
                            <View className="flex-1">
                              <Text className="text-sm font-semibold text-gray-800">
                                {replacedInfo.replacement_part_name}
                              </Text>
                              <Text className="text-xs text-gray-600 mt-1" numberOfLines={2}>
                                {replacedInfo.replacement_description || 'Replacement part for this component'}
                              </Text>
                              <View className="flex-row justify-between items-center mt-2">
                                <Text className="text-base font-bold text-teal-600">
                                  ₹{replacedInfo.replacement_price}
                                </Text>
                                <Text className="text-xs text-gray-500">
                                  QR: {replacedInfo.replacement_qr_code}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Remove Replacement Button */}
                          <TouchableOpacity
                            onPress={() => handleRemoveReplacement(partId, partName)}
                            disabled={isRemovingReplace}
                            className="mt-3 bg-red-500 py-2 rounded-lg flex-row items-center justify-center"
                          >
                            {isRemovingReplace ? (
                              <ActivityIndicator size="small" color="white" />
                            ) : (
                              <>
                                <Icon name="close-circle-outline" size={18} color="white" />
                                <Text className="text-white text-sm font-medium ml-2">
                                  Remove Replacement
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : isLinked && !replacedInfo ? (
                      // Show linked QR code without replacement
                      <View className="flex-row items-center bg-gray-50 rounded-lg p-3">
                        <Icon name="qr-code" size={20} color="#4CAF50" />
                        <Text className="text-sm text-gray-700 ml-2 flex-1">{currentQrCode}</Text>
                      </View>
                    ) : (
                      // Show input and scan for unlinked items
                      <View>
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

                          {/* Replace Part Button (Bucket Icon) - Only show for unlinked items */}
                          <TouchableOpacity
                            className="py-2.5 px-3 rounded-lg items-center bg-red-500 ml-2"
                            onPress={() => handleReplacePart(partId, partName)}
                            disabled={loadingStates[partId]}
                          >
                            <BucketIcon color="white" size={16} />
                          </TouchableOpacity>
                        </View>

                        {/* Link Button - Separate row for better layout */}
                        <TouchableOpacity
                          className="py-2.5 px-4 rounded-lg items-center bg-orange-500 mt-2"
                          onPress={() => handleLinkQR(partId, partName, index)}
                          disabled={loadingStates[partId]}
                        >
                          {loadingStates[partId] ? (
                            <ActivityIndicator size="small" color="white" />
                          ) : (
                            <View className="flex-row items-center">
                              <LinkQrCodeIcon color="white" size={16} />
                              <Text className="text-white text-sm font-medium ml-2">Link QR Code</Text>
                            </View>
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

      {/* Next Button */}
      {!isKeyboardVisible && spareParts.length > 0 && (
        <TouchableOpacity
          className={`py-3.5 mx-5 rounded-xl items-center absolute bottom-10 left-0 right-0 ${allPartsLinked ? 'bg-teal-500' : 'bg-gray-400'
            }`}
          onPress={handleNext}
        >
          <Text className="text-white text-lg font-bold">
            {allPartsLinked ? 'Next' : `Link ${spareParts.length - linkedItems.length} More`}
          </Text>
        </TouchableOpacity>
      )}

      {/* Replacement Parts Modal */}
      <DialogBox
        visible={showReplaceModal}
        onClose={() => {
          setShowReplaceModal(false);
          setSelectedReplacePart(null);
          setSelectedReplacementPart(null);
          setAvailableParts([]);
        }}
        title={`Replace ${selectedReplacePart?.name || 'Part'}`}
        size="lg"
        modalAnimationType="slide"
        closeOnBackdropPress={!loadingParts}
        footer={
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => {
                setShowReplaceModal(false);
                setSelectedReplacePart(null);
                setSelectedReplacementPart(null);
                setAvailableParts([]);
              }}
              className="flex-1 bg-gray-200 rounded-lg py-3"
            >
              <Text className="text-gray-700 text-center font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmReplacement}
              className="flex-1 bg-teal-500 rounded-lg py-3"
              disabled={!selectedReplacementPart}
            >
              <Text className="text-white text-center font-medium">
                Replace Part
              </Text>
            </TouchableOpacity>
          </View>
        }
      >
        {loadingParts ? (
          <View className="py-10 items-center">
            <ActivityIndicator size="large" color="#14B8A6" />
            <Text className="text-gray-600 mt-4">Loading replacement parts...</Text>
          </View>
        ) : availableParts.length > 0 ? (
          <>
            <Text className="text-sm text-gray-600 mb-3">
              Select a replacement part for {selectedReplacePart?.name}:
            </Text>
            <FlatList
              data={availableParts}
              renderItem={renderReplacementItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              maxHeight={400}
              className="mb-2"
            />
          </>
        ) : (
          <View className="py-10 items-center">
            <Icon name="alert-circle-outline" size={50} color="#FFA500" />
            <Text className="text-gray-600 text-center mt-4">
              No replacement parts available for {selectedReplacePart?.name}
            </Text>
          </View>
        )}
      </DialogBox>

      {/* Delete Confirmation Modal */}
      <DialogBox
        visible={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        title="Delete AMC Record"
        size="sm"
        modalAnimationType="fade"
        closeOnBackdropPress={!deletingRecord}
        footer={
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => setShowDeleteConfirmModal(false)}
              className="flex-1 bg-gray-200 rounded-lg py-3"
              disabled={deletingRecord}
            >
              <Text className="text-gray-700 text-center font-medium">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDeleteAMCRecord}
              className="flex-1 bg-red-500 rounded-lg py-3"
              disabled={deletingRecord}
            >
              {deletingRecord ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-medium">Delete</Text>
              )}
            </TouchableOpacity>
          </View>
        }
      >
        <View className="py-4 items-center">
          <Icon name="alert-circle" size={50} color="#EF4444" />
          <Text className="text-lg font-semibold text-gray-800 text-center mt-3">
            Are you sure?
          </Text>
          <Text className="text-gray-600 text-center mt-2">
            This will delete the entire AMC record along with all linked parts. This action cannot be undone.
          </Text>
        </View>
      </DialogBox>

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
          <TouchableOpacity
            onPress={() => {
              setShowScanner(false);
              setCurrentPartId(null);
            }}
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

export default AMCDetails;

const styles = StyleSheet.create({});