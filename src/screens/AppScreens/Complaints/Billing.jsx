import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { useAuth } from '../../../context/AuthContext';
import DialogBox from '../../../components/DilaogBox';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { FetchPartForComplaints, AttechPartWithComplaints, RecomplaitAttechPart } from '../../../lib/api';

const Billing = () => {
  const navigation = useNavigation();
  const { importedPart, updateImportedPart, user, imagUrl } = useAuth();
  const [discount, setDiscount] = useState(0);
  const SERVICE_CHARGE = 500;
  const route = useRoute();
  const complaintData = route.params?.complaintData || null;
  console.log('Complaint Data in Billing:', complaintData);

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

  // Check if it's a recomplaint
  const isRecomplaint = complaintData?.recomplaint === 'Yes';

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
        // For recomplaint, call RecomplaitAttechPart API with oldcomp_id
        const payload = {
          technician_id: user?.id?.toString() || '1',
          oldcomp_id: complaintData.oldcomp_id?.toString()
        };
        
        console.log('Fetching recomplaint parts with payload:', payload);
        response = await RecomplaitAttechPart(payload);
        console.log('Recomplaint API Response:', response);
        
        // Handle recomplaint response structure
        if (response?.data?.data && Array.isArray(response.data.data)) {
          partsData = response.data.data;
        } else if (response?.data?.result && Array.isArray(response.data.result)) {
          partsData = response.data.result;
        } else if (Array.isArray(response?.data)) {
          partsData = response.data;
        }
      } else {
        // For new complaint, call FetchPartForComplaints API
        const payload = {
          technician_id: user?.id?.toString() || '1',
          complaint_id: complaintData.id?.toString()
        };
        
        console.log('Fetching new complaint parts with payload:', payload);
        response = await FetchPartForComplaints(payload);
        console.log('New Complaint API Response:', response);
        
        // Handle new complaint response structure
        if (response?.data?.data && Array.isArray(response.data.data)) {
          partsData = response.data.data;
        } else if (response?.data?.result && Array.isArray(response.data.result)) {
          partsData = response.data.result;
        } else if (Array.isArray(response?.data)) {
          partsData = response.data;
        }
      }

      // Filter parts where status is "1" (attached) - only for new complaints
      // For recomplaints, we might want to show all parts or handle differently
      let attachedParts = partsData;
      if (!isRecomplaint) {
        attachedParts = partsData.filter(part => part.status === "1" || part.status === 1);
      }
      
      // Map API response to component format
      const formattedParts = attachedParts.map(part => ({
        id: part.id?.toString(),
        name: part.part_name || part.name || 'Part',
        partNumber: part.id?.toString() || '',
        price: parseFloat(part.part_price || part.price) || 0,
        imageUrl: part.part_image
          ? `${imagUrl}${part.part_image}`
          : 'https://via.placeholder.com/150',
        description: part.description || '',
        transfer_by: part.transfer_by,
        part_accept: part.part_accept,
        status: part.status
      }));

      console.log('Formatted parts:', formattedParts);
      setParts(formattedParts);
      
      // Update context with the attached parts
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

  // Fetch parts on component mount
  useEffect(() => {
    fetchParts();
  }, [complaintData, user?.id]);

  // Refresh parts when screen comes into focus (when returning from AddPartBilling)
  useFocusEffect(
    useCallback(() => {
      console.log('Billing screen focused, refreshing parts...');
      fetchParts();
    }, [complaintData, user?.id])
  );

  // Calculations - use parts from state instead of importedPart
  const totalPartsPrice = parts?.reduce((sum, part) => sum + part.price, 0) || 0;
  const totalBeforeDiscount = totalPartsPrice + SERVICE_CHARGE;
  const totalPayable = totalBeforeDiscount - discount;

  // Handle discount change with validation
  const handleDiscountChange = (text) => {
    const value = parseFloat(text) || 0;
    
    // Check if discount exceeds total before discount
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
        // Call API to detach part with status "0"
        const payload = {
          part_id: partToRemove,
          complaint_id: complaintData?.id?.toString(),
          status: "0"
        };
        
        console.log('Detaching part with payload:', payload);
        const response = await AttechPartWithComplaints(payload);
        console.log('Detach response:', response);
        
        if (response?.data?.success) {
          // Update local state by removing the part
          const updatedParts = parts.filter((p) => p.id !== partToRemove);
          setParts(updatedParts);
          updateImportedPart(updatedParts);
          
          // Reset discount if it exceeds new total
          const removedPart = parts.find(p => p.id === partToRemove);
          const newTotalBeforeDiscount = (totalPartsPrice - (removedPart?.price || 0)) + SERVICE_CHARGE;
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

  // Submit flow: confirmation → loading → success → navigate back
  const handleConfirmSubmit = () => {
    // Validate discount before submission
    if (discount > totalBeforeDiscount) {
      setDiscountError(`Discount cannot exceed ₹${totalBeforeDiscount.toFixed(2)}`);
      return;
    }
    
    // Hide confirmation dialog
    setSubmitDialogVisible(false);
    // Show loading
    setIsSubmitting(true);
    
    // Simulate API call for 1 second
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1000);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Navigate back to previous screen
    navigation.goBack();
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

  // Render loading state
  const renderLoading = () => (
    <View className="flex-1 justify-center items-center py-10">
      <ActivityIndicator size="large" color="#2E7D32" />
      <Text className="text-text-secondary mt-4">
        {isRecomplaint ? 'Loading recomplaint parts...' : 'Loading parts...'}
      </Text>
    </View>
  );

  // Render error state
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
        showRightIcon={!isRecomplaint} // Hide add part button for recomplaints
        customRightIconComponent={
          <Icon name="bag-add-outline" size={24} color="#333" />
        }
        onRightIconPress={() => navigation.navigate('AddPartBilling',{ complaintData })}
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
            return (
              <View
                key={part.id}
                className="flex-row items-center p-3 mx-4 mb-3 bg-gray-50 rounded-xl border border-gray-200"
                style={{ opacity: isRemoving ? 0.5 : 1 }}
              >
                {/* Part Image */}
                <Image
                  source={{ uri: part.imageUrl }}
                  className="w-12 h-12 rounded-lg bg-gray-300"
                  resizeMode="cover"
                  onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                />
                {/* Details */}
                <View className="flex-1 ml-3">
                  <Text className="text-text-primary font-semibold text-base">
                    {part.name}
                  </Text>
                  <Text className="text-text-secondary text-sm">
                    Part #: {part.partNumber}
                  </Text>
                  <Text className="text-primary-sage700 font-bold text-base mt-1">
                    ₹{part.price.toFixed(2)}
                  </Text>
                </View>
                {/* Remove Icon - hide for recomplaint parts if they shouldn't be removable */}
                {!isRecomplaint && !isRemoving && (
                  <TouchableOpacity
                    onPress={() => {
                      setPartToRemove(part.id);
                      setRemoveDialogVisible(true);
                    }}
                  >
                    <Icon name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                )}
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
          {/* Total Parts Price */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-md">Total Parts Price</Text>
            <Text className="font-semibold">₹{totalPartsPrice.toFixed(2)}</Text>
          </View>

          {/* Service Charge */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-md">Service Charge</Text>
            <Text className="font-semibold">₹{SERVICE_CHARGE.toFixed(2)}</Text>
          </View>

          {/* Subtotal */}
          <View className="flex-row items-center justify-between mb-2 pt-2 border-t border-gray-200">
            <Text className="font-medium text-md">Subtotal</Text>
            <Text className="font-semibold">₹{totalBeforeDiscount.toFixed(2)}</Text>
          </View>

          {/* Discount Input */}
          <View className="mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="font-medium text-md">Discount</Text>
              <TextInput
                className="border border-gray-300 rounded-lg px-3 py-1 w-24 text-right"
                keyboardType="numeric"
                value={discount.toString()}
                onChangeText={handleDiscountChange}
                placeholder="0"
              />
            </View>
            {discountError ? (
              <Text className="text-red-500 text-xs mt-1 text-right">
                {discountError}
              </Text>
            ) : null}
          </View>

          {/* Total Payable */}
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
          disabled={parts.length === 0 || isSubmitting}
          style={{ opacity: parts.length === 0 ? 0.5 : 1 }}
        >
          <Text className="text-white font-bold text-xl">Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Remove Part Dialog */}
      <DialogBox
        visible={removeDialogVisible}
        onClose={() => {
          setRemoveDialogVisible(false);
          setPartToRemove(null);
        }}
        title="Remove Part"
        size="sm"
        footer={removeDialogFooter}
        closeOnBackdropPress={true}
      >
        <Text className="text-text-primary text-base">
          Are you sure you want to remove this part from the bill?
        </Text>
      </DialogBox>

      {/* Submit Confirmation Dialog */}
      <DialogBox
        visible={submitDialogVisible}
        onClose={() => setSubmitDialogVisible(false)}
        title="Confirm Submission"
        size="md"
        footer={submitDialogFooter}
        closeOnBackdropPress={true}
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
      </DialogBox>

      {/* Loading Dialog */}
      <DialogBox
        visible={isSubmitting}
        onClose={() => {}} // Disable closing while loading
        title="Processing"
        size="sm"
        closeOnBackdropPress={false}
      >
        <View className="items-center py-4">
          <ActivityIndicator size="large" color="#000" />
          <Text className="text-text-primary text-base mt-3">
            Submitting bill...
          </Text>
        </View>
      </DialogBox>

      {/* Success Dialog */}
      <DialogBox
        visible={showSuccess}
        onClose={handleSuccessClose}
        title="Success"
        size="sm"
        footer={successDialogFooter}
        closeOnBackdropPress={false}
      >
        <Text className="text-text-primary text-base text-center">
          Bill submitted successfully!
        </Text>
      </DialogBox>
    </SafeAreaView>
  );
};

export default Billing;