// Billing.js - Truncates amounts to two decimals (no rounding)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  RefreshControl,
  Animated,
  ToastAndroid,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import {
  FetchPartForComplaints,
  AttechPartWithComplaints,
  RecomplaitAttechPart,
  FetchPartsForReplaced,
  ReplacedPartManagement,
  ComplaintBilling
} from '../../../lib/api';
import { PlusIcon } from 'lucide-react-native';
import EventEmitter from '../../../utils/eventBus';

// Helper: Truncate number to two decimal places (no rounding)
const truncateToTwoDecimals = (num) => {
  if (isNaN(num)) return '0.00';
  const truncated = Math.floor(num * 100) / 100;
  return truncated.toFixed(2);
};

const Billing = () => {
  const navigation = useNavigation();
  const { importedPart, updateImportedPart, user, imagUrl } = useAuth();
  const [discount, setDiscount] = useState('');
  const route = useRoute();
  const complaintData = route.params?.complaintData || null;

  const [isRemarkCompleted, setIsRemarkCompleted] = useState(false);
  const [pendingRemarkData, setPendingRemarkData] = useState(null);

  const [previewImageVisible, setPreviewImageVisible] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState('');

  console.log('Complaint Data in Billing:', complaintData);

  const baseAmount = parseFloat(complaintData?.tot_amt) || 0;
  const platformFee = (complaintData?.platform_fee) || 0;

  const [parts, setParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [removingPartId, setRemovingPartId] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [partSource, setPartSource] = useState({});

  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);
  const [partToRemove, setPartToRemove] = useState(null);
  const [submitDialogVisible, setSubmitDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [billingError, setBillingError] = useState(null);

  const [replaceDialogVisible, setReplaceDialogVisible] = useState(false);
  const [partToReplace, setPartToReplace] = useState(null);
  const [availableParts, setAvailableParts] = useState([]);
  const [loadingPartsList, setLoadingPartsList] = useState(false);
  const [selectedReplacePart, setSelectedReplacePart] = useState(null);
  const [replacingPart, setReplacingPart] = useState(false);

  const [removeReplacementDialogVisible, setRemoveReplacementDialogVisible] = useState(false);
  const [replacementPartToRemove, setReplacementPartToRemove] = useState(null);

  // Keyboard handling
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef(null);
  const footerAnimatedHeight = useRef(new Animated.Value(0)).current;

  const isRecomplaint = complaintData?.recomplaint === 'Yes';
  console.log("isRecomplaint:", isRecomplaint)
  const isAMCComplaint = complaintData?.complaint_type === 'AMC';

  const totalPartsPrice = parts?.reduce((sum, part) => sum + part.price, 0) || 0;
  const totalBeforeDiscount = baseAmount + totalPartsPrice;
  const totalPayable = totalBeforeDiscount - discount;

  const getImageUrl = (imagePath, baseUrl) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    const base = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    return `${base}${cleanPath}`;
  };

  // Keyboard listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardHeight(e.endCoordinates.height);
      Animated.timing(footerAnimatedHeight, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false,
      }).start();
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false);
      setKeyboardHeight(0);
      Animated.timing(footerAnimatedHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    const handleRemarkSubmit = (data) => {
      console.log('Received remark data via event:', data);
      setPendingRemarkData(data);
      setIsRemarkCompleted(true);
    };
    EventEmitter.on('remarkSubmitted', handleRemarkSubmit);
    return () => {
      EventEmitter.off('remarkSubmitted', handleRemarkSubmit);
    };
  }, []);

  const fetchParts = async (isRefresh = false) => {
    if (!complaintData) {
      setLoadingParts(false);
      setRefreshing(false);
      return;
    }
    try {
      if (!isRefresh) setLoadingParts(true);
      setError(null);

      let response;
      let partsData = [];
      let sourceMap = {};

      if (isAMCComplaint && complaintData.amc_complaint_id) {
        const payload = { oldcomp_id: "", amc_complaint_id: complaintData.amc_complaint_id?.toString() || "" };
        const payload_for_new = { technician_id: user?.id?.toString() || '1', complaint_id: complaintData.id?.toString() };
        response = await RecomplaitAttechPart(payload);
        const response2 = await FetchPartForComplaints(payload_for_new);
        let recomplaintParts = [], newParts = [];
        if (response?.data?.data && Array.isArray(response.data.data)) recomplaintParts = response.data.data;
        else if (response?.data?.result && Array.isArray(response.data.result)) recomplaintParts = response.data.result;
        else if (Array.isArray(response?.data)) recomplaintParts = response.data;
        recomplaintParts.forEach(part => sourceMap[part.id] = 'recomplaint');

        if (response2?.data?.data && Array.isArray(response2.data.data)) newParts = response2.data.data;
        else if (response2?.data?.result && Array.isArray(response2.data.result)) newParts = response2.data.result;
        else if (Array.isArray(response2?.data)) newParts = response2.data;
        newParts.forEach(part => sourceMap[part.id] = 'new');

        partsData = [...recomplaintParts, ...newParts];
        setPartSource(sourceMap);
      }
      else if (isRecomplaint && complaintData.oldcomp_id) {
        const payload = { oldcomp_id: complaintData.oldcomp_id?.toString() || "", amc_complaint_id: "" };
        const payload_for_new = { technician_id: user?.id?.toString() || '1', complaint_id: complaintData.id?.toString() };
        response = await RecomplaitAttechPart(payload);
        const response2 = await FetchPartForComplaints(payload_for_new);
        let recomplaintParts = [], newParts = [];
        if (response?.data?.data && Array.isArray(response.data.data)) recomplaintParts = response.data.data;
        else if (response?.data?.result && Array.isArray(response.data.result)) recomplaintParts = response.data.result;
        else if (Array.isArray(response?.data)) recomplaintParts = response.data;
        recomplaintParts.forEach(part => sourceMap[part.id] = 'recomplaint');

        if (response2?.data?.data && Array.isArray(response2.data.data)) newParts = response2.data.data;
        else if (response2?.data?.result && Array.isArray(response2.data.result)) newParts = response2.data.result;
        else if (Array.isArray(response2?.data)) newParts = response2.data;
        newParts.forEach(part => sourceMap[part.id] = 'new');

        partsData = [...recomplaintParts, ...newParts];
        setPartSource(sourceMap);
      }
      else {
        const payload = { technician_id: user?.id?.toString() || '1', complaint_id: complaintData.id?.toString(), amc_type: complaintData?.amc_type?.toString() || '' };
        response = await FetchPartForComplaints(payload);
        if (response?.data?.data && Array.isArray(response.data.data)) partsData = response.data.data;
        else if (response?.data?.result && Array.isArray(response.data.result)) partsData = response.data.result;
        else if (Array.isArray(response?.data)) partsData = response.data;
        else if (response?.data && typeof response.data === 'object') partsData = response.data.parts || response.data.items || [];
        partsData.forEach(part => sourceMap[part.id] = 'new');
        setPartSource(sourceMap);
      }

      let attachedParts = partsData;
      if (!isRecomplaint && !isAMCComplaint) {
        attachedParts = partsData.filter(part => part.status === "1" || part.status === 1);
      }

      const formattedParts = attachedParts.map(part => ({
        id: part.id?.toString() || part._id?.toString() || '',
        name: part.part_name || part.name || 'Part',
        technician_name: part?.technician_name || part?.technicianName || '',
        partNumber: part.part_number || part.partNumber || part.id?.toString() || '',
        qr_code: part.qr_code || null,
        price: sourceMap[part.id] === 'recomplaint' ? 0 : (parseFloat(part.part_price || part.price || 0) || 0),
        imageUrl: getImageUrl(part.imageUrl || part.part_image, imagUrl),
        description: part.description || '',
        transfer_by: part.transfer_by || part.transferredBy || null,
        part_accept: part.part_accept || part.accepted || null,
        status: part.status || null,
        replace_part: part.replace_part || part.replacePart || 'No',
        old_part_id: part.old_part_id || part.oldPartId || null,
        source: sourceMap[part.id] || 'new'
      }));

      setParts(formattedParts);
      if (typeof updateImportedPart === 'function') updateImportedPart(formattedParts);
      if (isRefresh) {
        ToastAndroid.show("refreshed...", ToastAndroid.SHORT, ToastAndroid.TOP);
      }
    } catch (err) {
      console.error('Error fetching parts:', err);
      setError(err.message || 'Failed to fetch parts');
      setParts([]);
      setPartSource({});
      if (typeof updateImportedPart === 'function') updateImportedPart([]);
    } finally {
      setLoadingParts(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchParts(true);
  }, [complaintData, user?.id]);

  const submitBilling = async () => {
    try {
      setBillingError(null);
      const payload = {
        id: complaintData?.id?.toString() || complaintData?.oldcomp_id?.toString(),
        final_amount: truncateToTwoDecimals(totalPayable),
        discount: truncateToTwoDecimals(discount),
      };
      console.log('Submitting billing with payload:', payload);
      const response = await ComplaintBilling(payload);
      if (response?.data?.success) {
        setShowSuccess(true);
        toast.custom(<StatusMessage type='success' title="Bill submitted successfully!" />, { duration: 2000 });
      } else {
        throw new Error(response?.data?.message || 'Failed to submit bill');
      }
    } catch (err) {
      console.error('Error submitting billing:', err);
      setBillingError(err.message);
      toast.custom(<StatusMessage type='error' title={err.message || 'Failed to submit bill'} />, { duration: 3000 });
    } finally {
      setIsSubmitting(false);
      setSubmitDialogVisible(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, [complaintData, user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchParts(true);
    }, [complaintData, user?.id])
  );

  const handleDiscountChange = (text) => {
    const value = parseFloat(text) || 0;
    if (value > totalBeforeDiscount) {
      setDiscountError(`Discount cannot exceed ₹${truncateToTwoDecimals(totalBeforeDiscount)}`);
      setDiscount(totalBeforeDiscount);
    } else if (value < 0) {
      setDiscountError('Discount cannot be negative');
      setDiscount(0);
    } else {
      setDiscountError('');
      setDiscount(value);
    }
  };

  const handleRemovePart = async () => {
    if (partToRemove && parts) {
      setRemovingPartId(partToRemove);
      try {
        const payload = { complaint_id: complaintData?.id?.toString(), part_id: partToRemove, status: "0" };
        const response = await AttechPartWithComplaints(payload);
        if (response?.data?.success) {
          const updatedParts = parts.filter((p) => p.id !== partToRemove);
          setParts(updatedParts);
          updateImportedPart(updatedParts);
          const removedPart = parts.find(p => p.id === partToRemove);
          const newTotalBeforeDiscount = baseAmount + (totalPartsPrice - (removedPart?.price || 0));
          if (discount > newTotalBeforeDiscount) setDiscount(newTotalBeforeDiscount);
          toast.custom(<StatusMessage type='success' title="Part removed successfully" />, { duration: 1500 });
        } else {
          throw new Error(response?.data?.message || 'Failed to remove part');
        }
      } catch (err) {
        toast.custom(<StatusMessage type='error' title={err.message || 'Failed to remove part'} />, { duration: 2000 });
      } finally {
        setRemovingPartId(null);
        setRemoveDialogVisible(false);
        setPartToRemove(null);
      }
    } else {
      setRemoveDialogVisible(false);
      setPartToRemove(null);
    }
  };

  const handlePartClick = (part) => {
    if (part.source === 'new') {
      setPartToRemove(part.id);
      setRemoveDialogVisible(true);
      return;
    }
    if (part.replace_part === "Yes") {
      setReplacementPartToRemove(part);
      setRemoveReplacementDialogVisible(true);
      return;
    }
    if (part.part_accept === "0") {
      const technicianName = part?.technician_name || 'the technician';
      toast.custom(<StatusMessage type='error' title={`This part is transferred to ${technicianName}. Cancel it first to use.`} />, { duration: 3000 });
      return;
    }
    openReplaceDialog(part);
  };

  const openReplaceDialog = async (part) => {
    setPartToReplace(part);
    setSelectedReplacePart(null);
    setAvailableParts([]);
    setReplaceDialogVisible(true);
    await fetchAvailableParts(part.name);
  };

  const fetchAvailableParts = async (partName) => {
    if (!partName || partName.trim() === '') {
      toast.custom(<StatusMessage type='error' title="No part name available" />, { duration: 2000 });
      return;
    }
    setLoadingPartsList(true);
    try {
      const payload = { technician_id: user?.id?.toString() || '1', part_name: partName.trim() };
      const response = await FetchPartsForReplaced(payload);
      let partsData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) partsData = response.data.data;
      else if (response?.data?.result && Array.isArray(response.data.result)) partsData = response.data.result;
      else if (Array.isArray(response?.data)) partsData = response.data;
      if (partsData.length > 0) {
        const formattedParts = partsData.map(part => ({
          part_accept: part?.part_accept,
          old_part_id: part?.old_part_id || null,
          technician_name: part?.technician_name || '',
          id: part.id?.toString(),
          name: part.part_name || 'Part',
          partNumber: part.id?.toString() || '',
          qr_code: part.qr_code || null,
          price: parseFloat(part.part_price) || 0,
          imageUrl: getImageUrl(part.imageUrl || part.part_image, imagUrl),
          description: part.description || '',
          transfer_by: part.transfer_by || 'market',
          status: part.status || '0',
          replace_part: part.replace_part || 'No'
        }));
        setAvailableParts(formattedParts);
      } else {
        setAvailableParts([]);
        toast.custom(<StatusMessage type='info' title={`No replacement parts found for "${partName}"`} />, { duration: 2000 });
      }
    } catch (err) {
      setAvailableParts([]);
      toast.custom(<StatusMessage type='error' title={err.message || "Failed to fetch replacement parts"} />, { duration: 2000 });
    } finally {
      setLoadingPartsList(false);
    }
  };

  // FIXED: This function now ONLY selects the part, no API calls
  const replacePartClicked = (part) => {
    if (part.replace_part === "Yes") {
      toast.custom(<StatusMessage type='info' title={`This part is already a replacement part and cannot be used for replacement again.`} />, { duration: 3000 });
      return;
    }
    if (part.part_accept === "0") {
      toast.custom(<StatusMessage type='info' title={`This part is transferred to ${part.technician_name || 'the technician'}. Cancel it first to use.`} />, { duration: 3000 });
      return;
    }

    // Just select the part - no API call here
    setSelectedReplacePart(part);

  };

  // FIXED: This function handles ALL API calls when Replace button is clicked
  const handleReplacePart = async () => {
    if (!selectedReplacePart || !partToReplace) {
      toast.custom(<StatusMessage type='error' title="Please select a replacement part first" />, { duration: 2000 });
      return;
    }

    setReplacingPart(true);
    try {
      let response;

      if (isRecomplaint || isAMCComplaint) {
        const complaintId = complaintData?.oldcomp_id || complaintData?.id;
        const payload = {
          complaint_id: complaintId?.toString(),
          old_part_id: partToReplace.id?.toString(),
          new_part_id: selectedReplacePart.id?.toString(),
          status: "0",
          part_type: complaintData?.amc_complaint_id === null ? 'Complaint' : 'AMC'
        };
        response = await ReplacedPartManagement(payload);
      } else {
        const payload = {
          complaint_id: complaintData?.id?.toString(),
          old_part_id: partToReplace.id?.toString(),
          new_part_id: selectedReplacePart.id?.toString(),
          status: "0"
        };
        response = await AttechPartWithComplaints(payload);
      }

      if (response?.data?.success) {
        // Update the parts list
        const updatedParts = parts.map(part =>
          part.id === partToReplace.id ? {
            ...selectedReplacePart,
            id: selectedReplacePart.id,
            old_part_id: selectedReplacePart.old_part_id || null,
            name: selectedReplacePart.name,
            partNumber: selectedReplacePart.partNumber,
            qr_code: selectedReplacePart.qr_code || null,
            price: selectedReplacePart.price,
            imageUrl: selectedReplacePart.imageUrl,
            description: selectedReplacePart.description,
            transfer_by: selectedReplacePart.transfer_by,
            status: "1",
            part_accept: null,
            replace_part: "Yes",
            source: 'replacement'
          } : part
        );

        setParts(updatedParts);
        updateImportedPart(updatedParts);

        // Update discount if needed
        const newTotalBeforeDiscount = baseAmount + updatedParts.reduce((sum, p) => sum + p.price, 0);
        if (discount > newTotalBeforeDiscount) setDiscount(newTotalBeforeDiscount);

        toast.custom(<StatusMessage type='success' title="Part replaced successfully" />, { duration: 1500 });

        // Close dialog and reset states
        setReplaceDialogVisible(false);
        setPartToReplace(null);
        setSelectedReplacePart(null);
        setAvailableParts([]);

        // Refresh parts list
        await fetchParts();
      } else {
        throw new Error(response?.data?.message || 'Failed to replace part');
      }
    } catch (err) {
      console.error('Error replacing part:', err);
      toast.custom(<StatusMessage type='error' title={err.message || 'Failed to replace part'} />, { duration: 2000 });
    } finally {
      setReplacingPart(false);
    }
  };

  const handleRemoveReplacementPart = async () => {
    if (!replacementPartToRemove) return;
    try {
      const payload = {
        complaint_id: complaintData?.oldcomp_id?.toString(),
        old_part_id: replacementPartToRemove?.old_part_id?.toString(),
        new_part_id: replacementPartToRemove.id?.toString(),
        status: "1"
      };
      const response = await ReplacedPartManagement(payload);
      if (response?.data?.success) {
        const updatedParts = parts.filter((p) => p.id !== replacementPartToRemove.id);
        setParts(updatedParts);
        updateImportedPart(updatedParts);
        const newTotalBeforeDiscount = baseAmount + updatedParts.reduce((sum, p) => sum + p.price, 0);
        if (discount > newTotalBeforeDiscount) setDiscount(newTotalBeforeDiscount);
        toast.custom(<StatusMessage type='success' title="Replacement part removed successfully" />, { duration: 1500 });
        await fetchParts();
      } else throw new Error(response?.data?.message || 'Failed to remove replacement part');
    } catch (err) {
      toast.custom(<StatusMessage type='error' title={err.message || 'Failed to remove replacement part'} />, { duration: 2000 });
    } finally {
      setRemoveReplacementDialogVisible(false);
      setReplacementPartToRemove(null);
    }
  };

  const getTransferByTextColor = (part) => {
    if (part.part_accept === "0") return 'text-gray-500';
    switch (part.transfer_by) {
      case 'AMC': return 'text-green-700';
      case 'market': return 'text-blue-700';
      default: return 'text-gray-700';
    }
  };

  const getStatusBadge = (part) => {
    if (part.replace_part === "Yes") return <View className="px-2 py-0.5 rounded-full bg-orange-200"><Text className="text-xs font-medium text-orange-700">Replacement Part</Text></View>;
    if (part.part_accept === "0") return <View className="px-2 py-0.5 rounded-full bg-gray-300"><Text className="text-xs font-medium text-gray-600">Transferred</Text></View>;
    return null;
  };

  const renderReplacePartItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => replacePartClicked(item)}
      className={`flex-row items-center p-3 mb-2 rounded-xl border border-gray-300 ${selectedReplacePart?.id === item.id ? 'ring-2 ring-blue-500 bg-green-100 border-green-500' : ''} ${item.part_accept === "0" ? 'opacity-50 bg-gray-100' : ''} ${item.replace_part === "Yes" ? 'opacity-50 bg-gray-100' : ''}`}
      disabled={item.part_accept === "0" || item.replace_part === "Yes"}
    >
      <Image source={{ uri: item.imageUrl }} className="w-12 h-12 rounded-lg bg-gray-300" resizeMode="cover" />
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-start">
          <Text className="text-text-primary font-semibold text-base flex-1 mr-2">{item.name}</Text>
          <View className={`px-2 py-0.5 rounded-full ${item.transfer_by === 'AMC' ? 'bg-green-200' : 'bg-blue-200'}`}>
            <Text className={`text-xs font-medium ${getTransferByTextColor(item)}`}>{item.transfer_by}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2">
          <Text className="text-primary-sage700 font-bold">₹{truncateToTwoDecimals(item.price)}</Text>
          <Text className="text-text-secondary text-sm">Part #: {item.partNumber}</Text>
          <Text className="text-text-secondary text-sm">QR Code: {item?.qr_code}</Text>
        </View>
        <Text className="text-text-tertiary text-xs mt-1" numberOfLines={2}>{item.description}</Text>
      </View>
      {selectedReplacePart?.id === item.id && <Icon name="checkmark-circle" size={24} color="#3b82f6" />}
    </TouchableOpacity>
  );

  const renderLoading = () => (
    <View className="flex-1 justify-center items-center py-10">
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text className="text-text-secondary mt-4">{isRecomplaint ? 'Loading recomplaint parts...' : 'Loading parts...'}</Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 justify-center items-center py-10 px-4">
      <Icon name="alert-circle-outline" size={50} color="#ef4444" />
      <Text className="text-red-500 text-base mt-2 text-center">{error || 'Failed to load parts'}</Text>
      <TouchableOpacity onPress={() => fetchParts()} className="mt-4 bg-primary-sage600 px-6 py-2 rounded-lg"><Text className="text-white font-semibold">Retry</Text></TouchableOpacity>
    </View>
  );

  const CustomModal = ({ visible, onClose, title, children, footer, size = 'lg', containerStyle = '', overlayColor = 'bg-black/50', position = 'center', customPosition = '', closeOnBackdropPress = true, showCloseIcon = true }) => {
    const getSizeStyles = () => { switch (size) { case 'sm': return 'w-4/5'; case 'lg': return 'w-11/12'; default: return 'w-10/12'; } };
    const getPositionStyles = () => { if (customPosition) return customPosition; switch (position) { case 'top': return 'justify-start pt-10'; case 'bottom': return 'justify-end pb-10'; default: return 'justify-center items-center'; } };
    const handleBackdropPress = () => { if (closeOnBackdropPress) onClose(); };
    return (
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View className={`flex-1 ${overlayColor} ${getPositionStyles()} ${containerStyle}`}>
            <TouchableWithoutFeedback>
              <View className={`bg-white border border-gray-300 rounded-2xl ${getSizeStyles()} max-h-[90%]`}>
                <View className="border-b border-gray-200 p-4 flex-row justify-between items-center">
                  <Text className="text-xl font-bold text-text-primary flex-1">{title}</Text>
                  {showCloseIcon && <TouchableOpacity onPress={onClose} className="p-1"><Icon name="close-outline" size={24} color="#666" /></TouchableOpacity>}
                </View>
                <ScrollView className="p-4" showsVerticalScrollIndicator={false}>{children}</ScrollView>
                {footer && <View className="border-t border-gray-200 p-4">{footer}</View>}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const removeDialogFooter = (
    <View className="flex-row justify-end gap-2">
      <TouchableOpacity onPress={() => { setRemoveDialogVisible(false); setPartToRemove(null); }} className="px-4 py-2 rounded-lg bg-gray-200"><Text className="text-gray-700 font-medium">Cancel</Text></TouchableOpacity>
      <TouchableOpacity onPress={handleRemovePart} className="px-4 py-2 rounded-lg bg-red-500"><Text className="text-white font-medium">Remove</Text></TouchableOpacity>
    </View>
  );

  const removeReplacementDialogFooter = (
    <View className="flex-row justify-end gap-2">
      <TouchableOpacity onPress={() => { setRemoveReplacementDialogVisible(false); setReplacementPartToRemove(null); }} className="px-4 py-2 rounded-lg bg-gray-200"><Text className="text-gray-700 font-medium">Cancel</Text></TouchableOpacity>
      <TouchableOpacity onPress={handleRemoveReplacementPart} className="px-4 py-2 rounded-lg bg-red-500"><Text className="text-white font-medium">Confirm</Text></TouchableOpacity>
    </View>
  );

  const replaceDialogFooter = (
    <View className="flex-row justify-end gap-2">
      <TouchableOpacity onPress={() => { setReplaceDialogVisible(false); setPartToReplace(null); setSelectedReplacePart(null); setAvailableParts([]); }} className="px-4 py-2 rounded-lg bg-gray-200"><Text className="text-gray-700 font-medium">Cancel</Text></TouchableOpacity>
      <TouchableOpacity
        onPress={handleReplacePart}
        disabled={!selectedReplacePart || replacingPart}
        className={`px-4 py-2 rounded-lg ${selectedReplacePart && !replacingPart ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        {replacingPart ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-medium">Replace</Text>}
      </TouchableOpacity>
    </View>
  );

  const submitDialogFooter = (
    <View className="flex-row justify-end gap-2">
      <TouchableOpacity onPress={() => setSubmitDialogVisible(false)} className="px-4 py-2 rounded-lg bg-gray-200"><Text className="text-gray-700 font-medium">Cancel</Text></TouchableOpacity>
      <TouchableOpacity onPress={handleConfirmSubmit} className="px-4 py-2 rounded-lg bg-black"><Text className="text-white font-medium">OK</Text></TouchableOpacity>
    </View>
  );

  const successDialogFooter = (
    <View className="flex-row justify-end">
      <TouchableOpacity onPress={handleSuccessClose} className="px-4 py-2 rounded-lg bg-black"><Text className="text-white font-medium">OK</Text></TouchableOpacity>
    </View>
  );

  const handleConfirmSubmit = () => {
    if (discount > totalBeforeDiscount) {
      setDiscountError(`Discount cannot exceed ₹${truncateToTwoDecimals(totalBeforeDiscount)}`);
      return;
    }
    setSubmitDialogVisible(false);
    setIsSubmitting(true);
    submitBilling();
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigation.goBack();
  };

  const handleMainButtonPress = () => {
    if (!isRemarkCompleted) {
      navigation.navigate('Remarkscreen', {
        complaintData: complaintData,
        shouldSubmitOnReturn: true,
        returnToBilling: true,
        totalPayable: totalPayable,
        discount: discount,
      });
    } else {
      if (discount > totalBeforeDiscount) {
        setDiscountError(`Discount cannot exceed ₹${truncateToTwoDecimals(totalBeforeDiscount)}`);
        return;
      }
      setSubmitDialogVisible(true);
    }
  };

  const getButtonText = () => {
    if (!isRemarkCompleted) return 'Next';
    return 'Submit Bill';
  };

  const getButtonColor = () => {
    if (!isRemarkCompleted) return 'bg-blue-600';
    return 'bg-green-600';
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute inset-0 z-50 pointer-events-none"><Toaster /></View>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1">

            {/* Custom Header - Replaced Header component with custom implementation */}
            <View className="bg-white flex-row items-center justify-between px-4 py-4 pr-7 pt-5">
              {/* Left: Back button and Title */}
              <View className="flex-row items-center flex-1">
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="mr-3"
                >
                  <Icon name="chevron-back-outline" size={28} color="#333" />
                </TouchableOpacity>
                <Text className="font-bold text-2xl ml-1 text-gray-900">
                  {!isRecomplaint ? "Billing" : "Billing"}
                </Text>
              </View>

              {/* Right: Add Part from Market Button (Text) and Add Part Button (Icon) */}
              <View className="flex-row items-center">
                {/* Add Part from Market - Text button */}
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Parts', {
                      fromBilling: true,
                      previousScreen: 'Billing',
                      complaintData: complaintData
                    });
                  }}
                  className="bg-gray-100 px-3 py-2 rounded-lg mr-2 flex-row items-center"
                >
                  <Icon name="add-outline" size={18} color="#333" />
                  <Text className="text-gray-700 text-[8px] font-medium ml-1">Purchase Part from Market</Text>
                </TouchableOpacity>

                {/* Add Part button (bag icon) */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('AddPartBilling', { complaintData })}
                  className="w-10 h-10 rounded-full bg-gray-100 justify-center items-center"
                >
                  <Icon name="bag-add-outline" size={24} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={{
                paddingBottom: Platform.OS === 'android' && keyboardVisible ? keyboardHeight + 100 : 100,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              className="flex-1"
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2E7D32', '#4CAF50', '#81C784']}
                  tintColor="#2E7D32"
                  title="Pull to refresh"
                  titleColor="#2E7D32"
                  progressBackgroundColor="#ffffff"
                />
              }
            >
              {loadingParts && !refreshing ? renderLoading() : error ? renderError() : parts && parts.length > 0 ? parts.map((part) => {
                const isRemoving = removingPartId === part.id;
                const isPartTransferred = part.part_accept === "0";
                const isReplacementPart = part.replace_part === "Yes";
                const isFromRecomplaint = part.source === 'recomplaint';
                const isFromNew = part.source === 'new';
                const showDeleteIcon = isFromNew && !isRemoving && !isPartTransferred && !isReplacementPart;
                const showReplaceIcon = isFromRecomplaint && !isReplacementPart && !isPartTransferred;

                const handleImageClick = () => {
                  if (part.imageUrl) {
                    setPreviewImageUrl(part.imageUrl);
                    setPreviewImageVisible(true);
                  } else {
                    toast.custom(<StatusMessage type='info' title="No image available" />, { duration: 1500 });
                  }
                };

                return (
                  <View key={part.id} className={`flex-row items-start p-2 mx-4 mb-2 rounded-xl border border-gray-300 ${isPartTransferred ? 'opacity-60 bg-gray-50' : ''}`} style={{ opacity: isRemoving ? 0.5 : 1 }}>
                    <TouchableOpacity onPress={handleImageClick} disabled={!part.imageUrl}>
                      {part.imageUrl ?
                        <Image source={{ uri: part.imageUrl }} className="w-16 h-16 rounded-lg bg-gray-300" resizeMode="cover" /> :
                        <View className="w-16 h-16 rounded-lg bg-green-100 flex items-center justify-center"><Icon name="cube-outline" size={24} color="#10b981" /></View>
                      }
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 ml-2" onPress={() => handlePartClick(part)} disabled={isPartTransferred || isFromNew}>
                      <View className="flex-row justify-between items-start">
                        <Text className="text-text-primary font-semibold text-sm flex-1 mr-1">{part.name}</Text>
                        {getStatusBadge(part)}
                      </View>
                      <View className="flex-row gap-3 items-center">
                        <Text className="text-text-secondary text-xs">Part #: {part.partNumber}</Text>
                        <Text className="text-text-secondary text-xs">From: {part?.transfer_by}</Text>
                        <Text className="text-text-secondary text-xs">QR: {part.qr_code || 'N/A'}</Text>
                      </View>
                      <Text className={`font-bold text-sm ${isPartTransferred ? 'text-gray-400' : 'text-primary-sage700'}`}>
                        {isFromRecomplaint ? '₹0.00 (Recomplaint Part)' : `₹${truncateToTwoDecimals(part.price)}`}
                      </Text>
                      {isFromRecomplaint && <Text className="text-orange-600 text-xs">From previous complaint - needs replacement</Text>}
                      {isFromNew && <Text className="text-blue-600 text-xs">New part added</Text>}
                    </TouchableOpacity>
                    <View className="flex-row">
                      {showReplaceIcon && <TouchableOpacity onPress={() => openReplaceDialog(part)} className="mr-1"><Icon name="refresh-outline" size={20} color="#3b82f6" /></TouchableOpacity>}
                      {showDeleteIcon && <TouchableOpacity onPress={() => { setPartToRemove(part.id); setRemoveDialogVisible(true); }}><Icon name="trash-outline" size={20} color="#ff4444" /></TouchableOpacity>}
                      {isReplacementPart && <TouchableOpacity onPress={() => { setReplacementPartToRemove(part); setRemoveReplacementDialogVisible(true); }}><Icon name="close-circle-outline" size={22} color="#ff4444" /></TouchableOpacity>}
                    </View>
                    {isRemoving && <ActivityIndicator size="small" color="#ff4444" />}
                  </View>
                );
              }) : (
                <View className="items-center justify-center py-10">
                  <Icon name="cart-outline" size={50} color="#ccc" />
                  <Text className="text-text-tertiary text-base mt-2">{isRecomplaint ? 'No parts found for this recomplaint' : 'No parts added yet'}</Text>
                  <TouchableOpacity onPress={onRefresh} className="mt-4 bg-primary-sage600 px-6 py-2 rounded-lg"><Text className="text-white font-semibold">Refresh</Text></TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('AddPartBilling', { complaintData })} className="mt-4 border w-16 border-gray-400 h-16 items-center justify-center rounded-full"><PlusIcon color={'gray'} /></TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Footer - with truncated two‑decimal formatting */}
            <Animated.View
              className="bg-white border-t border-gray-200"
              style={{ paddingBottom: footerAnimatedHeight }}
            >
              <View className="px-3 pt-2 pb-2">
                <View className="border p-3 mb-2 border-gray-200 rounded-xl bg-gray-50">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-gray-600 text-xs leading-tight">Service Amount</Text>
                    <Text className="text-gray-800 text-xs font-medium">
                      ₹{truncateToTwoDecimals(baseAmount - platformFee - (complaintData?.gst || 0))}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-gray-600 text-[12px] leading-tight">Parts Total</Text>
                    <Text className="text-gray-800 text-xs font-medium">₹{truncateToTwoDecimals(totalPartsPrice)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-gray-600 text-[12px] leading-tight">Platform Fee</Text>
                    <Text className="text-gray-800 text-xs font-medium">₹{truncateToTwoDecimals(platformFee)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-gray-600 text-[12px] leading-tight">GST</Text>
                    <Text className="text-gray-800 text-xs font-medium">₹{truncateToTwoDecimals(complaintData?.gst || 0)}</Text>
                  </View>

                  <View className="flex-row justify-between items-center pt-1 border-t border-gray-200">
                    <Text className="text-gray-700 text-[12px] font-semibold">Subtotal</Text>
                    <Text className="text-gray-800 text-xs font-medium">₹{truncateToTwoDecimals(totalBeforeDiscount)}</Text>
                  </View>
                  <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-gray-600 text-[12px] leading-tight">Discount</Text>
                    <TextInput
                      className="border border-gray-300 text-black bg-white rounded-md px-2 py-2 w-32 text-right text-xl"
                      keyboardType="numeric"
                      placeholder="amount"
                      value={discount ? discount.toString() : ''}
                      onChangeText={handleDiscountChange}
                      placeholderTextColor="#999"
                    />
                  </View>
                  {discountError && <Text className="text-red-500 text-[10px] text-right mt-0.5">{discountError}</Text>}
                </View>

                <View className="flex-row items-center justify-between gap-3 px-6">
                  <View className="flex-1">
                    <Text className="text-gray-600 text-xl font-medium leading-tight">Total Payable</Text>
                    <Text className="text-primary-sage700 font-bold text-2xl">₹{truncateToTwoDecimals(totalPayable)}</Text>
                  </View>
                  <TouchableOpacity
                    className={`py-3 px-16 rounded-xl items-center justify-center ${getButtonColor()}`}
                    onPress={handleMainButtonPress}
                    disabled={isSubmitting}
                    style={{ opacity: isSubmitting ? 0.5 : 1 }}
                  >
                    <Text className="text-white font-bold text-xl">{getButtonText()}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Modals */}
      <Modal visible={previewImageVisible} transparent={true} animationType="fade" onRequestClose={() => setPreviewImageVisible(false)}>
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl w-full max-w-[90%] max-h-[80%] overflow-hidden">
            <View className="flex-row justify-end p-2">
              <TouchableOpacity onPress={() => setPreviewImageVisible(false)} className="p-2">
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <View className="p-4 pt-0">
              <Image source={{ uri: previewImageUrl }} className="w-full h-80" resizeMode="contain" />
            </View>
          </View>
        </View>
      </Modal>

      <CustomModal visible={removeDialogVisible} onClose={() => { setRemoveDialogVisible(false); setPartToRemove(null); }} title="Remove Part" size="sm" footer={removeDialogFooter} overlayColor="bg-black/60" position="center" closeOnBackdropPress={true} showCloseIcon={true}>
        <Text className="text-text-primary text-base">Are you sure you want to remove this part from the bill?</Text>
      </CustomModal>

      <CustomModal visible={removeReplacementDialogVisible} onClose={() => { setRemoveReplacementDialogVisible(false); setReplacementPartToRemove(null); }} title="Remove Replacement Part" size="sm" footer={removeReplacementDialogFooter} overlayColor="bg-black/60" position="center" closeOnBackdropPress={true} showCloseIcon={true}>
        <Text className="text-text-primary text-base">Do you want to remove this replacement part?</Text>
      </CustomModal>

      <CustomModal visible={replaceDialogVisible} onClose={() => { setReplaceDialogVisible(false); setPartToReplace(null); setSelectedReplacePart(null); setAvailableParts([]); }} title={`Replace ${partToReplace?.name || 'Part'}`} size="lg" footer={replaceDialogFooter} overlayColor="bg-black/70" position="bottom" containerStyle="flex-1 items-center justify-center" closeOnBackdropPress={true} showCloseIcon={true}>
        <View className="py-2 ">
          {loadingPartsList ? <View className="items-center py-8"><ActivityIndicator size="large" color="#2E7D32" /><Text className="text-text-secondary mt-2">Loading replacement parts...</Text></View> : availableParts.length > 0 ? <>
            <Text className="text-text-secondary text-xs mb-2">Found {availableParts.length} replacement part(s)</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>{availableParts.map((item) => <View key={item.id}>{renderReplacePartItem({ item })}</View>)}</ScrollView>
          </> : partToReplace && !loadingPartsList ? <View className="items-center py-8"><Icon name="cube-outline" size={50} color="#ccc" /><Text className="text-text-tertiary mt-2">No replacement parts found for "{partToReplace?.name}"</Text><Text className="text-text-tertiary text-sm mt-1">Please try a different part</Text></View> : null}
        </View>
      </CustomModal>

      <CustomModal visible={submitDialogVisible} onClose={() => setSubmitDialogVisible(false)} title="Confirm Submission" size="md" footer={submitDialogFooter} overlayColor="bg-black/50" customPosition="justify-center items-center" closeOnBackdropPress={true} showCloseIcon={true}>
        <View><View className="mt-3 border-gray-200"><Text className="text-text-primary text-base">Total Payable: <Text className="font-bold text-primary-sage700">₹{truncateToTwoDecimals(totalPayable)}</Text></Text><Text className="text-text-secondary text-sm mt-1">Proceed with billing?</Text></View></View>
      </CustomModal>

      <CustomModal visible={isSubmitting} onClose={() => { }} title="Processing" size="sm" overlayColor="bg-black/50" position="center" closeOnBackdropPress={false} showCloseIcon={false}>
        <View className="items-center py-4"><ActivityIndicator size="large" color="#000" /><Text className="text-text-primary text-base mt-3">Submitting bill...</Text></View>
      </CustomModal>

      <CustomModal visible={showSuccess} onClose={handleSuccessClose} title="Success" size="sm" footer={successDialogFooter} overlayColor="bg-green-500/20" position="center" closeOnBackdropPress={false} showCloseIcon={true}>
        <Text className="text-text-primary text-base text-center">Bill submitted successfully!</Text>
      </CustomModal>
    </SafeAreaView>
  );
};

export default Billing;