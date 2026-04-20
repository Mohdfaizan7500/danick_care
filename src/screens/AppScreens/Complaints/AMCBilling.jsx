import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import DialogBox from '../../../components/DilaogBox';
import { useRoute } from '@react-navigation/native';
import { ComplaintBilling } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const AMCBilling = () => {
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [billingResponse, setBillingResponse] = useState(null);

  const route = useRoute();
  const { linkedParts, amc, complaintData, billingId } = route.params;
  const { user } = useAuth();

  console.log("AMC Data:", amc);
  console.log("Linked Parts:", linkedParts);
  console.log("Complaint Data:", complaintData);
  console.log("Billing ID:", billingId);

  // Parse AMC price to number
  const subtotal = parseFloat(amc?.price) || 0;

  // Calculate discount amount
  const calculateDiscountAmount = () => {
    if (!discount) return 0;
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue)) return 0;
    
    if (discountType === 'percentage') {
      return (subtotal * discountValue) / 100;
    } else {
      return Math.min(discountValue, subtotal);
    }
  };

  const discountAmount = calculateDiscountAmount();
  const taxableAmount = subtotal - discountAmount;
  const gstRate = 18; // 18% GST
  const gstAmount = (taxableAmount * gstRate) / 100;
  const totalAmount = taxableAmount + gstAmount;

  const formatCurrency = (amount) => {
    return '₹' + amount.toFixed(2);
  };

  const handleBookNow = () => {
    if (loading) return;
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    setShowConfirmation(false);
    setLoading(true);
    
    try {
      // Prepare payload for ComplaintBilling API
      const payload = {
        complaint_id: complaintData?.id || complaintData?.complaint_id,
        technician_id: user?.technician_id || user?.id,
        amc_id: amc?.id,
        billing_id: billingId,
        subtotal: subtotal,
        discount: discountAmount,
        discount_type: discountType,
        gst: gstAmount,
        gst_rate: gstRate,
        total: totalAmount,
        parts: linkedParts?.map(part => ({
          part_id: part.id,
          part_name: part.name,
          quantity: part.quantity || 1,
          price: part.price
        })) || []
      };

      console.log('Billing Payload:', payload);

      const response = await ComplaintBilling(payload);
      console.log('Billing Response:', response);

      if (response?.data?.success || response?.success) {
        setBillingResponse(response.data);
        setShowSuccessDialog(true);
      } else {
        throw new Error(response?.data?.message || 'Failed to process billing');
      }
      
    } catch (error) {
      console.error('Billing error:', error);
      setErrorMessage(error.message || 'Failed to process booking. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetForm = () => {
    setDiscount('');
    setDiscountType('percentage');
    setShowSuccessDialog(false);
  };

  // Parse AMC content HTML to array of benefits
  const parseAMCBenefits = (content) => {
    if (!content) return [];
    // Extract text between <i> tags or just split by <br>
    const textContent = content.replace(/<[^>]*>/g, ' ');
    return textContent.split('•').filter(b => b.trim()).map(b => b.trim());
  };

  const amcBenefits = parseAMCBenefits(amc?.content);

  // Confirmation Dialog Footer
  const confirmationFooter = (
    <View className="flex-row justify-end gap-3">
      <TouchableOpacity
        onPress={() => setShowConfirmation(false)}
        className="px-4 py-2 rounded-lg bg-gray-200"
      >
        <Text className="text-gray-700 font-medium">Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleConfirmBooking}
        className="px-4 py-2 rounded-lg bg-teal-600"
      >
        <Text className="text-white font-medium">Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );

  // Success Dialog Footer
  const successFooter = (
    <View className="flex-row justify-center">
      <TouchableOpacity
        onPress={handleResetForm}
        className="px-6 py-2 rounded-lg bg-teal-600"
      >
        <Text className="text-white font-medium">OK</Text>
      </TouchableOpacity>
    </View>
  );

  // Error Dialog Footer
  const errorFooter = (
    <View className="flex-row justify-center">
      <TouchableOpacity
        onPress={() => setShowErrorDialog(false)}
        className="px-6 py-2 rounded-lg bg-red-600"
      >
        <Text className="text-white font-medium">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <Header
        title="AMC Billing"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* AMC Details Card */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-3">{amc?.title || amc?.name}</Text>
            
            
            
           

            <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
              <Text className="text-gray-600">Validity:</Text>
              <Text className="text-teal-600 font-semibold">{amc?.valid || "4 Service Valid For 1 Year"}</Text>
            </View>
          </View>

          
          {/* Bill Summary Card */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Bill Summary</Text>
            
            {/* AMC Price */}
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base text-gray-600">AMC Plan Price</Text>
              <Text className="text-base font-semibold text-gray-800">
                {formatCurrency(subtotal)}
              </Text>
            </View>

            {/* Discount Section */}
            <View className="mb-3 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base text-gray-600">Discount</Text>
                <TouchableOpacity 
                  onPress={() => setDiscountType(discountType === 'percentage' ? 'fixed' : 'percentage')}
                  className="bg-gray-100 px-3 py-1 rounded-full"
                >
                  <Text className="text-xs text-teal-600 font-medium">
                    Switch to {discountType === 'percentage' ? 'Fixed Amount' : 'Percentage'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View className="flex-row items-center">
                <View className="flex-1 flex-row items-center bg-gray-50 rounded-lg border border-gray-300 px-3 mr-2">
                  {discountType === 'percentage' && (
                    <Text className="text-gray-600 font-medium mr-1">%</Text>
                  )}
                  {discountType === 'fixed' && (
                    <Text className="text-gray-600 font-medium mr-1">₹</Text>
                  )}
                  <TextInput
                    className="flex-1 py-3 text-gray-800"
                    placeholder={discountType === 'percentage' ? "Enter discount %" : "Enter discount amount"}
                    placeholderTextColor="#999"
                    value={discount}
                    onChangeText={setDiscount}
                    keyboardType="numeric"
                  />
                  {discount !== '' && (
                    <TouchableOpacity onPress={() => setDiscount('')}>
                      <Icon name="close-circle-outline" size={18} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
                {discountAmount > 0 && (
                  <View className="bg-green-100 px-3 py-2 rounded-lg">
                    <Text className="text-green-700 font-semibold">
                      -{formatCurrency(discountAmount)}
                    </Text>
                  </View>
                )}
              </View>
              
              {discount && discountAmount === 0 && discountType === 'fixed' && (
                <Text className="text-red-500 text-xs mt-1">
                  Discount cannot exceed subtotal
                </Text>
              )}
            </View>

            {/* Taxable Amount */}
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base text-gray-600">Taxable Amount</Text>
              <Text className="text-base font-semibold text-gray-800">
                {formatCurrency(taxableAmount)}
              </Text>
            </View>

            {/* GST */}
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base text-gray-600">GST ({gstRate}%)</Text>
              <Text className="text-base font-semibold text-gray-800">
                {formatCurrency(gstAmount)}
              </Text>
            </View>

            {/* Total Amount */}
            <View className="flex-row justify-between items-center mt-3 pt-2">
              <Text className="text-xl font-bold text-gray-900">Total Amount</Text>
              <Text className="text-2xl font-bold text-teal-600">
                {formatCurrency(totalAmount)}
              </Text>
            </View>
          </View>

          {/* Complaint Info Card */}
          {complaintData && (
            <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-800 mb-3">Complaint Information</Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">Complaint ID:</Text>
                <Text className="text-gray-800 font-medium">{complaintData.id || complaintData.complaint_id}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-gray-600">Billing ID:</Text>
                <Text className="text-gray-800 font-medium">{billingId}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Book Now Button */}
      <View className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <TouchableOpacity
          onPress={handleBookNow}
          disabled={loading}
          className={`py-4 rounded-xl items-center ${loading ? 'bg-gray-400' : 'bg-teal-600'}`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-lg font-bold ml-2">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-bold">Proceed to Payment • {formatCurrency(totalAmount)}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Dialog */}
      <DialogBox
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm AMC Purchase"
        size="md"
        footer={confirmationFooter}
        closeOnBackdropPress={true}
      >
        <View className="py-4">
          {/* AMC Info */}
          <View className="mb-4">
            <Text className="text-gray-800 font-semibold text-base mb-2">AMC Details</Text>
            <View className="bg-gray-50 rounded-lg p-3">
              <Text className="text-gray-800 font-medium mb-1">{amc?.title || amc?.name}</Text>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Plan Price:</Text>
                <Text className="text-gray-800 font-medium">{formatCurrency(subtotal)}</Text>
              </View>
              {discountAmount > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-gray-600">Discount:</Text>
                  <Text className="text-green-600 font-medium">-{formatCurrency(discountAmount)}</Text>
                </View>
              )}
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Taxable Amount:</Text>
                <Text className="text-gray-800 font-medium">{formatCurrency(taxableAmount)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">GST ({gstRate}%):</Text>
                <Text className="text-gray-800 font-medium">{formatCurrency(gstAmount)}</Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-200 mt-1">
                <Text className="text-gray-800 font-bold">Total Amount:</Text>
                <Text className="text-teal-600 font-bold text-lg">{formatCurrency(totalAmount)}</Text>
              </View>
            </View>
          </View>

          {/* Validity Info */}
          <View className="mb-3">
            <View className="flex-row items-center">
              <Icon name="calendar-outline" size={16} color="#6B7280" />
              <Text className="text-gray-600 text-sm ml-1">Validity: <Text className="text-gray-800 font-medium">{amc?.valid || "4 Service Valid For 1 Year"}</Text></Text>
            </View>
          </View>

          {/* Confirmation Message */}
          <View className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <View className="flex-row items-center mb-1">
              <Icon name="information-circle-outline" size={18} color="#D97706" />
              <Text className="text-yellow-700 font-semibold ml-1">Please Confirm</Text>
            </View>
            <Text className="text-yellow-600 text-sm">
              Are you sure you want to purchase this AMC plan? This action cannot be undone.
            </Text>
          </View>
        </View>
      </DialogBox>

      {/* Success Dialog */}
      <DialogBox
        visible={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="AMC Purchased Successfully!"
        size="sm"
        footer={successFooter}
        closeOnBackdropPress={false}
      >
        <View className="py-4 items-center">
          <View className="bg-green-100 rounded-full p-3 mb-3">
            <Icon name="checkmark-circle" size={50} color="#10B981" />
          </View>
          <Text className="text-gray-800 text-center text-base mb-2">
            Your AMC plan has been purchased successfully!
          </Text>
          <Text className="text-teal-600 font-bold text-xl mb-2">
            {formatCurrency(totalAmount)}
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            Transaction ID: {billingResponse?.transaction_id || billingId}
          </Text>
          <View className="bg-blue-50 rounded-lg p-2 mt-3 w-full">
            <Text className="text-blue-600 text-xs text-center">
              A confirmation message has been sent to your registered mobile number
            </Text>
          </View>
        </View>
      </DialogBox>

      {/* Error Dialog */}
      <DialogBox
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Purchase Failed"
        size="sm"
        footer={errorFooter}
        closeOnBackdropPress={true}
      >
        <View className="py-4 items-center">
          <View className="bg-red-100 rounded-full p-3 mb-3">
            <Icon name="close-circle" size={50} color="#EF4444" />
          </View>
          <Text className="text-gray-800 text-center text-base mb-2">
            {errorMessage || "Something went wrong. Please try again."}
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            Please check your internet connection and try again
          </Text>
        </View>
      </DialogBox>
    </SafeAreaView>
  );
};

export default AMCBilling;

const styles = StyleSheet.create({});