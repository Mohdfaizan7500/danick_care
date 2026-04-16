import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import DialogBox from '../../../components/DilaogBox';
import { useRoute } from '@react-navigation/native';

const AMCBilling = () => {
  const [subtotal, setSubtotal] = useState(12500); // Example subtotal
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [gst, setGst] = useState(18); // 18% GST
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const route = useRoute();
  const complaintdata = route.params;
  console.log(complaintdata)

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
  const gstAmount = (taxableAmount * gst) / 100;
  const totalAmount = taxableAmount + gstAmount;

  const handleBookNow = () => {
    if (loading) return;
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    setShowConfirmation(false);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Simulate success (you can add your actual API logic here)
      const isSuccess = true; // Change to false to test error case
      
      if (isSuccess) {
        setShowSuccessDialog(true);
        console.log({
          subtotal,
          discount: discountAmount,
          discountType,
          gst: gstAmount,
          total: totalAmount
        });
      } else {
        setErrorMessage('Failed to process booking. Please try again.');
        setShowErrorDialog(true);
      }
    }, 1500);
  };

  const handleResetForm = () => {
    setDiscount('');
    setDiscountType('percentage');
    setShowSuccessDialog(false);
  };

  const formatCurrency = (amount) => {
    return '₹' + amount.toFixed(2);
  };

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
          {/* Bill Summary Card */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Bill Summary</Text>
            
            {/* Subtotal */}
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base text-gray-600">Subtotal</Text>
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
              <Text className="text-base text-gray-600">GST ({gst}%)</Text>
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

          {/* Additional Charges Section (Optional) */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <Text className="text-lg font-bold text-gray-800 mb-3">Additional Charges</Text>
            
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base text-gray-600">Service Tax</Text>
              <Text className="text-base text-gray-800">Included in GST</Text>
            </View>
            
            <View className="flex-row justify-between items-center">
              <Text className="text-base text-gray-600">Convenience Fee</Text>
              <Text className="text-base text-gray-800">Free</Text>
            </View>
          </View>

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
            <Text className="text-white text-lg font-bold">Book Now • {formatCurrency(totalAmount)}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Confirmation Dialog */}
      <DialogBox
        visible={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Confirm Booking"
        size="md"
        footer={confirmationFooter}
        closeOnBackdropPress={true}
      >
        <View className="py-4">
          {/* Customer Info */}
          <View className="mb-4">
            <Text className="text-gray-800 font-semibold text-base mb-2">Booking Details</Text>
            <View className="bg-gray-50 rounded-lg p-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Subtotal:</Text>
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
                <Text className="text-gray-600">GST ({gst}%):</Text>
                <Text className="text-gray-800 font-medium">{formatCurrency(gstAmount)}</Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-200 mt-1">
                <Text className="text-gray-800 font-bold">Total Amount:</Text>
                <Text className="text-teal-600 font-bold text-lg">{formatCurrency(totalAmount)}</Text>
              </View>
            </View>
          </View>

          {/* Payment Method Info */}
          <View className="mb-3">
            <Text className="text-gray-600 text-sm">Payment Method: <Text className="text-gray-800 font-medium">To be paid at service center</Text></Text>
          </View>

          {/* Confirmation Message */}
          <View className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <View className="flex-row items-center mb-1">
              <Icon name="information-circle-outline" size={18} color="#D97706" />
              <Text className="text-yellow-700 font-semibold ml-1">Please Confirm</Text>
            </View>
            <Text className="text-yellow-600 text-sm">
              Are you sure you want to proceed with this booking? This action cannot be undone.
            </Text>
          </View>
        </View>
      </DialogBox>

      {/* Success Dialog */}
      <DialogBox
        visible={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Booking Successful!"
        size="sm"
        footer={successFooter}
        closeOnBackdropPress={false}
      >
        <View className="py-4 items-center">
          <View className="bg-green-100 rounded-full p-3 mb-3">
            <Icon name="checkmark-circle" size={50} color="#10B981" />
          </View>
          <Text className="text-gray-800 text-center text-base mb-2">
            Your booking has been confirmed successfully!
          </Text>
          <Text className="text-teal-600 font-bold text-xl mb-2">
            {formatCurrency(totalAmount)}
          </Text>
          <Text className="text-gray-500 text-center text-sm">
            Booking ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
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
        title="Booking Failed"
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