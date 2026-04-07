import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
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

const Billing = () => {
  const navigation = useNavigation();
  const { importedPart, updateImportedPart, user, imagUrl } = useAuth();
  const [discount, setDiscount] = useState('');
  const route = useRoute();
  const complaintData = route.params?.complaintData || null;
  console.log('Complaint Data in Billing:', complaintData);

  // Get base amount from complaint data (tot_amt)
  const baseAmount = parseFloat(complaintData?.tot_amt) || 0;

  // State for parts
  const [parts, setParts] = useState([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [error, setError] = useState(null);
  const [removingPartId, setRemovingPartId] = useState(null);
  const [discountError, setDiscountError] = useState('');

  // Dialog states
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);
  const [partToRemove, setPartToRemove] = useState(null);
  const [submitDialogVisible, setSubmitDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [billingError, setBillingError] = useState(null);

  // Replace part dialog states
  const [replaceDialogVisible, setReplaceDialogVisible] = useState(false);
  const [partToReplace, setPartToReplace] = useState(null);
  const [availableParts, setAvailableParts] = useState([]);
  const [loadingPartsList, setLoadingPartsList] = useState(false);
  const [selectedReplacePart, setSelectedReplacePart] = useState(null);
  const [replacingPart, setReplacingPart] = useState(false);

  // New state for replacement part removal confirmation
  const [removeReplacementDialogVisible, setRemoveReplacementDialogVisible] = useState(false);
  const [replacementPartToRemove, setReplacementPartToRemove] = useState(null);

  // Check if it's a recomplaint
  const isRecomplaint = complaintData?.recomplaint === 'Yes';

  // Calculate total amounts
  const totalPartsPrice = parts?.reduce((sum, part) => sum + part.price, 0) || 0;
  const totalBeforeDiscount = baseAmount + totalPartsPrice;
  const totalPayable = totalBeforeDiscount - discount;

  // Function to fetch available parts for replacement
  const fetchAvailableParts = async (partName) => {
    if (!partName || partName.trim() === '') {
      toast.custom(
        <StatusMessage type='error' title="No part name available" />,
        { duration: 2000 }
      );
      return;
    }

    setLoadingPartsList(true);
    try {
      const payload = {
        technician_id: user?.id?.toString() || '1',
        part_name: partName.trim()
      };

      console.log('Fetching parts for replacement with payload:', payload);
      const response = await FetchPartsForReplaced(payload);
      console.log('FetchPartsForReplaced response:', response);

      let partsData = [];
      if (response?.data?.data && Array.isArray(response.data.data)) {
        partsData = response.data.data;
      } else if (response?.data?.result && Array.isArray(response.data.result)) {
        partsData = response.data.result;
      } else if (Array.isArray(response?.data)) {
        partsData = response.data;
      }

      if (partsData.length > 0) {
        const formattedParts = partsData.map(part => ({
          part_accept: part?.part_accept,
          old_part_id: part?.old_part_id || null,
          technician_name: part?.technician_name || '',
          id: part.id?.toString(),
          name: part.part_name || 'Part',
          partNumber: part.id?.toString() || '',
          price: parseFloat(part.part_price) || 0,
          imageUrl: part?.part_image,
          description: part.description || '',
          transfer_by: part.transfer_by || 'market',
          status: part.status || '0',
          replace_part: part.replace_part || 'No'
        }));

        setAvailableParts(formattedParts);

        if (formattedParts.length === 0) {
          toast.custom(
            <StatusMessage type='info' title={`No replacement parts found for "${partName}"`} />,
            { duration: 2000 }
          );
        }
      } else {
        setAvailableParts([]);
        toast.custom(
          <StatusMessage type='info' title={`No replacement parts found for "${partName}"`} />,
          { duration: 2000 }
        );
      }

    } catch (err) {
      console.error('Error fetching available parts:', err);
      setAvailableParts([]);
      toast.custom(
        <StatusMessage type='error' title={err.message || "Failed to fetch replacement parts"} />,
        { duration: 2000 }
      );
    } finally {
      setLoadingPartsList(false);
    }
  };

  // Function to handle part replacement
  const handleReplacePart = async () => {
    if (!selectedReplacePart || !partToReplace) return;

    setReplacingPart(true);

    try {
      if (isRecomplaint && complaintData?.oldcomp_id) {
        const payload = {
          complaint_id: complaintData.oldcomp_id?.toString(),
          old_part_id: partToReplace.id?.toString(),
          new_part_id: selectedReplacePart.id?.toString(),
          status: "0"
        };

        console.log('Calling ReplacedPartManagement with payload:', payload);
        const response = await ReplacedPartManagement(payload);
        console.log('ReplacedPartManagement response:', response);

        if (response?.data?.success) {
          const updatedParts = parts.map(part =>
            part.id === partToReplace.id
              ? {
                ...selectedReplacePart,
                id: selectedReplacePart.id,
                old_part_id: selectedReplacePart.old_part_id || null,
                name: selectedReplacePart.name,
                partNumber: selectedReplacePart.partNumber,
                price: selectedReplacePart.price,
                imageUrl: selectedReplacePart.imageUrl,
                description: selectedReplacePart.description,
                transfer_by: selectedReplacePart.transfer_by,
                status: "1",
                part_accept: null,
                replace_part: selectedReplacePart.replace_part || 'No'
              }
              : part
          );

          setParts(updatedParts);
          updateImportedPart(updatedParts);

          // Reset discount if it exceeds new total
          const newTotalBeforeDiscount = baseAmount + updatedParts.reduce((sum, p) => sum + p.price, 0);
          if (discount > newTotalBeforeDiscount) {
            setDiscount(newTotalBeforeDiscount);
            setDiscountError('');
          }

          toast.custom(
            <StatusMessage type='success' title="Part replaced successfully" />,
            { duration: 1500 }
          );

          setReplaceDialogVisible(false);
          setPartToReplace(null);
          setSelectedReplacePart(null);
          setAvailableParts([]);
          await fetchParts();
        } else {
          throw new Error(response?.data?.message || 'Failed to replace part');
        }
      } else {
        const payload = {
          complaint_id: complaintData?.id?.toString(),
          old_part_id: partToReplace.id?.toString(),
          new_part_id: selectedReplacePart.id?.toString(),
          status: "0"
        };

        console.log('Removing and adding new part:', payload);
        const response = await AttechPartWithComplaints(payload);
        console.log('Replace part response:', response);

        if (response?.data?.success) {
          const updatedParts = parts.map(part =>
            part.id === partToReplace.id
              ? {
                ...selectedReplacePart,
                id: selectedReplacePart.id,
                old_part_id: selectedReplacePart.old_part_id || null,
                name: selectedReplacePart.name,
                partNumber: selectedReplacePart.partNumber,
                price: selectedReplacePart.price,
                imageUrl: selectedReplacePart.imageUrl,
                description: selectedReplacePart.description,
                transfer_by: selectedReplacePart.transfer_by,
                status: "1",
                part_accept: null,
                replace_part: selectedReplacePart.replace_part || 'No'
              }
              : part
          );

          setParts(updatedParts);
          updateImportedPart(updatedParts);

          const newTotalBeforeDiscount = baseAmount + updatedParts.reduce((sum, p) => sum + p.price, 0);
          if (discount > newTotalBeforeDiscount) {
            setDiscount(newTotalBeforeDiscount);
            setDiscountError('');
          }

          toast.custom(
            <StatusMessage type='success' title="Part replaced successfully" />,
            { duration: 1500 }
          );

          setReplaceDialogVisible(false);
          setPartToReplace(null);
          setSelectedReplacePart(null);
          setAvailableParts([]);
        } else {
          throw new Error(response?.data?.message || 'Failed to replace part');
        }
      }
    } catch (err) {
      console.error('Error replacing part:', err);
      toast.custom(
        <StatusMessage type='error' title={err.message || 'Failed to replace part'} />,
        { duration: 2000 }
      );
    } finally {
      setReplacingPart(false);
    }
  };

  // Function to remove a replacement part
  const handleRemoveReplacementPart = async () => {
    if (!replacementPartToRemove) return;

    try {
      const payload = {
        complaint_id: complaintData?.oldcomp_id?.toString(),
        old_part_id: replacementPartToRemove?.old_part_id?.toString(),
        new_part_id: replacementPartToRemove.id?.toString(),
        status: "1"
      };
      console.log('Payload for removing replacement part:', payload);

      const response = await ReplacedPartManagement(payload);
      console.log('Remove replacement part response:', response);

      if (response?.data?.success) {
        const updatedParts = parts.filter((p) => p.id !== replacementPartToRemove.id);
        setParts(updatedParts);
        updateImportedPart(updatedParts);

        const newTotalBeforeDiscount = baseAmount + updatedParts.reduce((sum, p) => sum + p.price, 0);
        if (discount > newTotalBeforeDiscount) {
          setDiscount(newTotalBeforeDiscount);
          setDiscountError('');
        }

        toast.custom(
          <StatusMessage type='success' title="Replacement part removed successfully" />,
          { duration: 1500 }
        );

        await fetchParts();
      } else {
        throw new Error(response?.data?.message || 'Failed to remove replacement part');
      }
    } catch (err) {
      console.error('Error removing replacement part:', err);
      toast.custom(
        <StatusMessage type='error' title={err.message || 'Failed to remove replacement part'} />,
        { duration: 2000 }
      );
    } finally {
      setRemoveReplacementDialogVisible(false);
      setReplacementPartToRemove(null);
    }
  };

  // Function to fetch parts based on complaint type
  const fetchParts = async () => {
    if (!complaintData) {
      console.log('No complaint data available');
      setLoadingParts(false);
      return;
    }

    try {
      setLoadingParts(true);
      setError(null);

      let response;
      let partsData = [];

      if (isRecomplaint && complaintData.oldcomp_id) {
        const payload = {
          technician_id: user?.id?.toString() || '1',
          oldcomp_id: complaintData.oldcomp_id?.toString()
        };

        console.log('Fetching recomplaint parts with payload:', payload);
        response = await RecomplaitAttechPart(payload);
        console.log('Recomplaint API Response:', response);

        if (response?.data?.data && Array.isArray(response.data.data)) {
          partsData = response.data.data;
        } else if (response?.data?.result && Array.isArray(response.data.result)) {
          partsData = response.data.result;
        } else if (Array.isArray(response?.data)) {
          partsData = response.data;
        }
      } else {
        const payload = {
          technician_id: user?.id?.toString() || '1',
          complaint_id: complaintData.id?.toString()
        };

        console.log('Fetching new complaint parts with payload:', payload);
        response = await FetchPartForComplaints(payload);
        console.log('New Complaint API Response:', response);

        if (response?.data?.data && Array.isArray(response.data.data)) {
          partsData = response.data.data;
        } else if (response?.data?.result && Array.isArray(response.data.result)) {
          partsData = response.data.result;
        } else if (Array.isArray(response?.data)) {
          partsData = response.data;
        }
      }

      let attachedParts = partsData;
      if (!isRecomplaint) {
        attachedParts = partsData.filter(part => part.status === "1" || part.status === 1);
      }

      const formattedParts = attachedParts.map(part => ({
        id: part.id?.toString(),
        name: part.part_name || part.name || 'Part',
        technician_name: part?.technician_name || '',
        partNumber: part.id?.toString() || '',
        price: parseFloat(part.part_price || part.price) || 0,
        imageUrl: part.part_image,
        description: part.description || '',
        transfer_by: part.transfer_by,
        part_accept: part.part_accept,
        status: part.status,
        replace_part: part.replace_part || 'No',
        old_part_id: part.old_part_id || null
      }));

      console.log('Formatted parts:', formattedParts);
      setParts(formattedParts);
      updateImportedPart(formattedParts);

    } catch (err) {
      console.error('Error fetching parts:', err);
      setError(err.message || 'Failed to fetch parts');
      setParts([]);
      updateImportedPart([]);
    } finally {
      setLoadingParts(false);
    }
  };

  // Function to submit billing
  const submitBilling = async () => {
    try {
      setBillingError(null);

      const payload = {
        id: complaintData?.id?.toString() || complaintData?.oldcomp_id?.toString(),
        final_amount: totalPayable.toFixed(2),
        discount: discount.toString()
      };

      console.log('Submitting billing with payload:', payload);
      const response = await ComplaintBilling(payload);
      console.log('ComplaintBilling response:', response);

      if (response?.data?.success) {
        setShowSuccess(true);
        toast.custom(
          <StatusMessage type='success' title="Bill submitted successfully!" />,
          { duration: 2000 }
        );
      } else {
        throw new Error(response?.data?.message || 'Failed to submit bill');
      }
    } catch (err) {
      console.error('Error submitting billing:', err);
      setBillingError(err.message);
      toast.custom(
        <StatusMessage type='error' title={err.message || 'Failed to submit bill'} />,
        { duration: 3000 }
      );
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
      console.log('Billing screen focused, refreshing parts...');
      fetchParts();
    }, [complaintData, user?.id])
  );

  const handleDiscountChange = (text) => {
    const value = parseFloat(text) || 0;

    if (value > totalBeforeDiscount) {
      setDiscountError(`Discount cannot exceed ₹${totalBeforeDiscount.toFixed(2)}`);
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
        const payload = {
          complaint_id: complaintData?.id?.toString(),
          old_part_id: partToRemove,
          status: "0"
        };

        console.log('Detaching part with payload:', payload);
        const response = await AttechPartWithComplaints(payload);
        console.log('Detach response:', response);

        if (response?.data?.success) {
          const updatedParts = parts.filter((p) => p.id !== partToRemove);
          setParts(updatedParts);
          updateImportedPart(updatedParts);

          const removedPart = parts.find(p => p.id === partToRemove);
          const newTotalBeforeDiscount = baseAmount + (totalPartsPrice - (removedPart?.price || 0));
          if (discount > newTotalBeforeDiscount) {
            setDiscount(newTotalBeforeDiscount);
            setDiscountError('');
          }

          toast.custom(
            <StatusMessage type='success' title="Part removed successfully" />,
            { duration: 1500 }
          );
        } else {
          throw new Error(response?.data?.message || 'Failed to remove part');
        }
      } catch (err) {
        console.error('Error removing part:', err);
        toast.custom(
          <StatusMessage type='error' title={err.message || 'Failed to remove part'} />,
          { duration: 2000 }
        );
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
    if (part.replace_part === "Yes") {
      setReplacementPartToRemove(part);
      setRemoveReplacementDialogVisible(true);
      return;
    }

    if (part.part_accept === "0") {
      const technicianName = part?.technician_name || 'the technician';
      toast.custom(
        <StatusMessage
          type='error'
          title={`This part is transferred to ${technicianName}. Cancel it first to use.`}
        />,
        { duration: 3000 }
      );
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

  const handleConfirmSubmit = () => {
    if (discount > totalBeforeDiscount) {
      setDiscountError(`Discount cannot exceed ₹${totalBeforeDiscount.toFixed(2)}`);
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

  const replacePartClicked = async (part) => {
    console.log('Replace part clicked:', part);

    if (part.replace_part === "Yes") {
      toast.custom(
        <StatusMessage
          type='info'
          title={`This part is already a replacement part and cannot be used for replacement again.`}
        />,
        { duration: 3000 }
      );
      return;
    }

    if (part.part_accept === "0") {
      toast.custom(
        <StatusMessage
          type='info'
          title={`This part is transferred to ${part.technician_name || 'the technician'}. Cancel it first to use.`}
        />,
        { duration: 3000 }
      );
      return;
    }

    if (isRecomplaint && complaintData?.oldcomp_id) {
      const payload = {
        complaint_id: complaintData.oldcomp_id?.toString(),
        old_part_id: partToReplace?.id?.toString(),
        new_part_id: part.id?.toString(),
        status: "0"
      };

      console.log('Calling ReplacedPartManagement with payload:', payload);

      try {
        const response = await ReplacedPartManagement(payload);
        console.log('ReplacedPartManagement response:', response);

        if (response?.data?.success) {
          const updatedParts = parts.map(p =>
            p.id === partToReplace?.id
              ? {
                ...part,
                id: part.id,
                old_part_id: part.old_part_id || null,
                name: part.name,
                partNumber: part.partNumber,
                price: part.price,
                imageUrl: part.imageUrl,
                description: part.description,
                transfer_by: part.transfer_by,
                status: "1",
                part_accept: null,
                replace_part: part.replace_part || 'No'
              }
              : p
          );

          setParts(updatedParts);
          updateImportedPart(updatedParts);

          const newTotalBeforeDiscount = baseAmount + updatedParts.reduce((sum, p) => sum + p.price, 0);
          if (discount > newTotalBeforeDiscount) {
            setDiscount(newTotalBeforeDiscount);
            setDiscountError('');
          }

          toast.custom(
            <StatusMessage type='success' title="Part replaced successfully" />,
            { duration: 1500 }
          );

          setReplaceDialogVisible(false);
          setPartToReplace(null);
          setSelectedReplacePart(null);
          setAvailableParts([]);
          await fetchParts();
        } else {
          throw new Error(response?.data?.message || 'Failed to replace part');
        }
      } catch (error) {
        console.error('Error in ReplacedPartManagement:', error);
        toast.custom(
          <StatusMessage
            type='error'
            title={error.message || 'Failed to replace part'}
          />,
          { duration: 3000 }
        );
      }
    } else {
      setSelectedReplacePart(part);
      toast.custom(
        <StatusMessage
          type='info'
          title={`You selected ${part.name} for replacement. Click Replace to confirm.`}
        />,
        { duration: 3000 }
      );
    }
  };

  const getTransferByTextColor = (part) => {
    if (part.part_accept === "0") {
      return 'text-gray-500';
    }

    switch (part.transfer_by) {
      case 'AMC':
        return 'text-green-700';
      case 'market':
        return 'text-blue-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStatusBadge = (part) => {
    if (part.replace_part === "Yes") {
      return (
        <View className="px-2 py-0.5 rounded-full bg-orange-200">
          <Text className="text-xs font-medium text-orange-700">
            Replacement Part
          </Text>
        </View>
      );
    }

    if (part.part_accept === "0") {
      return (
        <View className="px-2 py-0.5 rounded-full bg-gray-300">
          <Text className="text-xs font-medium text-gray-600">
            Transferred
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderReplacePartItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => replacePartClicked(item)}
      className={`flex-row items-center p-3 mb-2 rounded-xl border border-gray-300 ${selectedReplacePart?.id === item.id ? 'ring-2 ring-blue-500' : ''
        } ${item.part_accept === "0" ? 'opacity-50 bg-gray-100' : ''
        } ${item.replace_part === "Yes" ? 'opacity-50 bg-gray-100' : ''
        }`}
      disabled={item.part_accept === "0" || item.replace_part === "Yes"}
    >
      <Image
        source={{ uri: item.imageUrl }}
        className="w-12 h-12 rounded-lg bg-gray-300"
        resizeMode="cover"
        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
      />
      <View className="flex-1 ml-3">
        <View className="flex-row justify-between items-start">
          <Text className="text-text-primary font-semibold text-base flex-1 mr-2">
            {item.name}
          </Text>
          <View className={`px-2 py-0.5 rounded-full ${item.transfer_by === 'AMC' ? 'bg-green-200' : 'bg-blue-200'}`}>
            <Text className={`text-xs font-medium ${getTransferByTextColor(item)}`}>
              {item.transfer_by === 'AMC' ? 'AMC Part' : 'Market Part'}
            </Text>
          </View>
        </View>
        <Text className="text-text-secondary text-sm">
          Part #: {item.partNumber}
        </Text>
        <Text className="text-text-tertiary text-xs mt-1" numberOfLines={2}>
          {item.description}
        </Text>
        <View className="flex-row justify-between items-center mt-1">
          <Text className="text-primary-sage700 font-bold">
            ₹{item.price.toFixed(2)}
          </Text>
          {item.price === 0 && (
            <Text className="text-green-600 text-xs font-medium">
              Free (AMC)
            </Text>
          )}
        </View>
        {item.replace_part === "Yes" && (
          <Text className="text-orange-600 text-xs mt-1">
            This is a replacement part
          </Text>
        )}
        {item.part_accept === "0" && item.technician_name ? (
          <Text className="text-red-500 text-xs mt-1">
            Transferred to: {item.technician_name}
          </Text>
        ) : (
          <Text className="text-green-600 text-xs mt-1">
            Available for use
          </Text>
        )}
      </View>
      {selectedReplacePart?.id === item.id && (
        <Icon name="checkmark-circle" size={24} color="#3b82f6" />
      )}
    </TouchableOpacity>
  );

  const renderLoading = () => (
    <View className="flex-1 justify-center items-center py-10">
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text className="text-text-secondary mt-4">
        {isRecomplaint ? 'Loading recomplaint parts...' : 'Loading parts...'}
      </Text>
    </View>
  );

  const renderError = () => (
    <View className="flex-1 justify-center items-center py-10 px-4">
      <Icon name="alert-circle-outline" size={50} color="#ef4444" />
      <Text className="text-red-500 text-base mt-2 text-center">
        {error || 'Failed to load parts'}
      </Text>
      <TouchableOpacity
        onPress={fetchParts}
        className="mt-4 bg-primary-sage600 px-6 py-2 rounded-lg"
      >
        <Text className="text-white font-semibold">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Modal component for dialogs
  const CustomModal = ({
    visible,
    onClose,
    title,
    children,
    footer,
    size = 'lg',
    containerStyle = '',
    overlayColor = 'bg-black/50',
    position = 'center',
    customPosition = '',
    closeOnBackdropPress = true,
    showCloseIcon = true
  }) => {
    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'w-4/5';
        case 'lg':
          return 'w-11/12';
        default:
          return 'w-10/12';
      }
    };

    const getPositionStyles = () => {
      if (customPosition) return customPosition;
      switch (position) {
        case 'top':
          return 'justify-start pt-10';
        case 'bottom':
          return 'justify-end pb-10';
        default:
          return 'justify-center items-center';
      }
    };

    const handleBackdropPress = () => {
      if (closeOnBackdropPress) {
        onClose();
      }
    };

    return (
      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <View className={`flex-1 ${overlayColor} ${getPositionStyles()} ${containerStyle}`}>
            <TouchableWithoutFeedback>
              <View className={`bg-white border border-gray-300 rounded-2xl ${getSizeStyles()} max-h-[90%]`}>
                <View className="border-b border-gray-200 p-4 flex-row justify-between items-center">
                  <Text className="text-xl font-bold text-text-primary flex-1">
                    {title}
                  </Text>
                  {showCloseIcon && (
                    <TouchableOpacity
                      onPress={onClose}
                      className="p-1"
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="close-outline" size={24} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
                <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                  {children}
                </ScrollView>
                {footer && (
                  <View className="border-t border-gray-200 p-4">
                    {footer}
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  // Footer for remove dialog
  const removeDialogFooter = (
    <View className="flex-row justify-end gap-2">
      <TouchableOpacity
        onPress={() => {
          setRemoveDialogVisible(false);
          setPartToRemove(null);
        }}
        className="px-4 py-2 rounded-lg bg-gray-200"
      >
        <Text className="text-gray-700 font-medium">Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleRemovePart}
        className="px-4 py-2 rounded-lg bg-red-500"
      >
        <Text className="text-white font-medium">Remove</Text>
      </TouchableOpacity>
    </View>
  );

  // Footer for remove replacement dialog
  const removeReplacementDialogFooter = (
    <View className="flex-row justify-end gap-2">
      <TouchableOpacity
        onPress={() => {
          setRemoveReplacementDialogVisible(false);
          setReplacementPartToRemove(null);
        }}
        className="px-4 py-2 rounded-lg bg-gray-200"
      >
        <Text className="text-gray-700 font-medium">Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleRemoveReplacementPart}
        className="px-4 py-2 rounded-lg bg-red-500"
      >
        <Text className="text-white font-medium">Confirm</Text>
      </TouchableOpacity>
    </View>
  );

  // Footer for replace dialog
  const replaceDialogFooter = (
    <View className="flex-row justify-end gap-2">
      <TouchableOpacity
        onPress={() => {
          setReplaceDialogVisible(false);
          setPartToReplace(null);
          setSelectedReplacePart(null);
          setAvailableParts([]);
        }}
        className="px-4 py-2 rounded-lg bg-gray-200"
      >
        <Text className="text-gray-700 font-medium">Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleReplacePart}
        disabled={!selectedReplacePart || replacingPart}
        className={`px-4 py-2 rounded-lg ${selectedReplacePart ? 'bg-blue-500' : 'bg-gray-300'}`}
      >
        {replacingPart ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text className="text-white font-medium">Replace</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  // Footer for submit confirmation dialog
  const submitDialogFooter = (
    <View className="flex-row justify-end gap-2">
      <TouchableOpacity
        onPress={() => setSubmitDialogVisible(false)}
        className="px-4 py-2 rounded-lg bg-gray-200"
      >
        <Text className="text-gray-700 font-medium">Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleConfirmSubmit}
        className="px-4 py-2 rounded-lg bg-black"
      >
        <Text className="text-white font-medium">OK</Text>
      </TouchableOpacity>
    </View>
  );

  // Footer for success dialog
  const successDialogFooter = (
    <View className="flex-row justify-end">
      <TouchableOpacity
        onPress={handleSuccessClose}
        className="px-4 py-2 rounded-lg bg-black"
      >
        <Text className="text-white font-medium">OK</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>

      <Header
        title={isRecomplaint ? "Recomplaint Billing" : "Billing"}
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        showRightIcon={true}
        customRightIconComponent={
          <Icon name="bag-add-outline" size={24} color="#333" />
        }
        onRightIconPress={() => navigation.navigate('AddPartBilling', { complaintData })}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 pr-7 pt-5"
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {loadingParts ? (
          renderLoading()
        ) : error ? (
          renderError()
        ) : parts && parts.length > 0 ? (
          parts.map((part) => {
            const isRemoving = removingPartId === part.id;
            const isPartTransferred = part.part_accept === "0";
            const isReplacementPart = part.replace_part === "Yes";

            return (
              <View
                key={part.id}
                className={`flex-row items-center p-3 mx-4 mb-3 rounded-xl border border-gray-300 ${isPartTransferred ? 'opacity-60 bg-gray-50' : ''
                  }`}
                style={{ opacity: isRemoving ? 0.5 : 1 }}
              >
                <TouchableOpacity
                  onPress={() => handlePartClick(part)}
                  disabled={isPartTransferred}
                >
                  {part.imageUrl ? (
                    <Image
                      source={{ uri: part.imageUrl }}
                      className="w-12 h-12 rounded-lg bg-gray-300"
                      resizeMode="cover"
                      onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                    />
                  ) : (
                    <View className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Icon name="cube-outline" size={20} color="#10b981" />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 ml-3"
                  onPress={() => handlePartClick(part)}
                  disabled={isPartTransferred}
                >
                  <View className="flex-row justify-between items-center">
                    <Text className="text-text-primary font-semibold text-base flex-1">
                      {part.name}
                    </Text>
                    {getStatusBadge(part)}
                  </View>
                  <Text className="text-text-secondary text-sm">
                    Part #: {part.partNumber}
                  </Text>
                  <Text className={`font-bold text-base mt-1 ${isPartTransferred ? 'text-gray-400' : 'text-primary-sage700'
                    }`}>
                    ₹{part.price.toFixed(2)}
                  </Text>
                </TouchableOpacity>
                <View className="flex-row">

                  {!isRecomplaint && !isRemoving && !isPartTransferred && !isReplacementPart && (
                    <TouchableOpacity
                      onPress={() => {
                        setPartToRemove(part.id);
                        setRemoveDialogVisible(true);
                      }}
                    >
                      <Icon name="trash-outline" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  )}
                  {isReplacementPart && (
                    <TouchableOpacity
                      onPress={() => {
                        setReplacementPartToRemove(part);
                        setRemoveReplacementDialogVisible(true);
                      }}
                    >
                      <Icon name="close-circle-outline" size={24} color="#ff4444" />
                    </TouchableOpacity>
                  )}
                </View>
                {isRemoving && <ActivityIndicator size="small" color="#ff4444" />}
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-10">
            <Icon name="cart-outline" size={50} color="#ccc" />
            <Text className="text-text-tertiary text-base mt-2">
              {isRecomplaint ? 'No parts found for this recomplaint' : 'No parts added yet'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View className="bg-white justify-end px-3 py-2 border-t border-gray-200">
        <View className="border p-5 w-full mb-3 border-gray-300 rounded-2xl">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-md">Base Amount</Text>
            <Text className="font-semibold">₹{baseAmount - complaintData?.platform_fee}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-md">Platform Fee</Text>
            <Text className="font-semibold">₹{complaintData?.platform_fee}</Text>
          </View>
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-md">Total Base Amount</Text>
            <Text className="font-semibold">₹{baseAmount.toFixed(2)}</Text>
          </View>

          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-md">Total Parts Price</Text>
            <Text className="font-semibold">₹{totalPartsPrice.toFixed(2)}</Text>
          </View>

          <View className="flex-row items-center justify-between mb-2 pt-2 border-t border-gray-200">
            <Text className="font-medium text-md">Subtotal</Text>
            <Text className="font-semibold">₹{totalBeforeDiscount.toFixed(2)}</Text>
          </View>

          <View className="mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-medium text-md">Discount</Text>
              <TextInput
                className="border border-gray-300 text-black rounded-lg px-3 py-1 w-24 text-right"
                keyboardType="numeric"
                placeholder="amount"
                value={discount ? discount.toString() : ''}
                onChangeText={handleDiscountChange}
                placeholderTextColor="#999"
              />
            </View>
            {discountError ? (
              <Text className="text-red-500 text-xs mt-1 text-right">
                {discountError}
              </Text>
            ) : null}
          </View>

          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <Text className="font-medium text-md">Total Payable Amount</Text>
            <Text className="font-bold text-lg text-primary-sage700">
              ₹{totalPayable.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-black py-5 rounded-xl w-full flex justify-center items-center"
          onPress={() => {
            if (discount > totalBeforeDiscount) {
              setDiscountError(`Discount cannot exceed ₹${totalBeforeDiscount.toFixed(2)}`);
              return;
            }
            setSubmitDialogVisible(true);
          }}
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.5 : 1 }}
        >
          <Text className="text-white font-bold text-xl">Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <CustomModal
        visible={removeDialogVisible}
        onClose={() => {
          setRemoveDialogVisible(false);
          setPartToRemove(null);
        }}
        title="Remove Part"
        size="sm"
        footer={removeDialogFooter}
        overlayColor="bg-black/60"
        position="center"
        closeOnBackdropPress={true}
        showCloseIcon={true}
      >
        <Text className="text-text-primary text-base">
          Are you sure you want to remove this part from the bill?
        </Text>
      </CustomModal>

      <CustomModal
        visible={removeReplacementDialogVisible}
        onClose={() => {
          setRemoveReplacementDialogVisible(false);
          setReplacementPartToRemove(null);
        }}
        title="Remove Replacement Part"
        size="sm"
        footer={removeReplacementDialogFooter}
        overlayColor="bg-black/60"
        position="center"
        closeOnBackdropPress={true}
        showCloseIcon={true}
      >
        <Text className="text-text-primary text-base">
          Do you want to remove this replacement part?
        </Text>
      </CustomModal>

      <CustomModal
        visible={replaceDialogVisible}
        onClose={() => {
          setReplaceDialogVisible(false);
          setPartToReplace(null);
          setSelectedReplacePart(null);
          setAvailableParts([]);
        }}
        title={`Replace ${partToReplace?.name || 'Part'}`}
        size="lg"
        footer={!isRecomplaint ? replaceDialogFooter : null}
        overlayColor="bg-black/70"
        position="bottom"
        containerStyle="flex-1 items-center justify-center"
        closeOnBackdropPress={true}
        showCloseIcon={true}
      >
        <View className="py-2">
          <Text className="text-text-primary text-base mb-3">
            Select a replacement part for <Text className="font-bold">{partToReplace?.name}</Text>:
          </Text>

          {loadingPartsList ? (
            <View className="items-center py-8">
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text className="text-text-secondary mt-2">Loading replacement parts...</Text>
            </View>
          ) : availableParts.length > 0 ? (
            <>
              <Text className="text-text-secondary text-xs mb-2">
                Found {availableParts.length} replacement part(s)
              </Text>
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>
                {availableParts.map((item) => (
                  <View key={item.id}>
                    {renderReplacePartItem({ item })}
                  </View>
                ))}
              </ScrollView>
            </>
          ) : partToReplace && !loadingPartsList ? (
            <View className="items-center py-8">
              <Icon name="cube-outline" size={50} color="#ccc" />
              <Text className="text-text-tertiary mt-2">
                No replacement parts found for "{partToReplace?.name}"
              </Text>
              <Text className="text-text-tertiary text-sm mt-1">
                Please try a different part
              </Text>
            </View>
          ) : null}
        </View>
      </CustomModal>

      <CustomModal
        visible={submitDialogVisible}
        onClose={() => setSubmitDialogVisible(false)}
        title="Confirm Submission"
        size="md"
        footer={submitDialogFooter}
        overlayColor="bg-black/50"
        customPosition="justify-center items-center"
        closeOnBackdropPress={true}
        showCloseIcon={true}
      >
        <View>
          <View className="mt-3 border-gray-200">
            <Text className="text-text-primary text-base">
              Total Payable:{' '}
              <Text className="font-bold text-primary-sage700">₹{totalPayable.toFixed(2)}</Text>
            </Text>
            <Text className="text-text-secondary text-sm mt-1">
              Proceed with billing?
            </Text>
          </View>
        </View>
      </CustomModal>

      <CustomModal
        visible={isSubmitting}
        onClose={() => { }}
        title="Processing"
        size="sm"
        overlayColor="bg-black/50"
        position="center"
        closeOnBackdropPress={false}
        showCloseIcon={false}
      >
        <View className="items-center py-4">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-text-primary text-base mt-3">
            Submitting bill...
          </Text>
        </View>
      </CustomModal>

      <CustomModal
        visible={showSuccess}
        onClose={handleSuccessClose}
        title="Success"
        size="sm"
        footer={successDialogFooter}
        overlayColor="bg-green-500/20"
        position="center"
        closeOnBackdropPress={false}
        showCloseIcon={true}
      >
        <Text className="text-text-primary text-base text-center">
          Bill submitted successfully!
        </Text>
      </CustomModal>
    </SafeAreaView>
  );
};

export default Billing;