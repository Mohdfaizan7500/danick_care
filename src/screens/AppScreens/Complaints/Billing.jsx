import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import { useAuth } from '../../../context/AuthContext';
import DialogBox from '../../../components/DilaogBox';

const Billing = () => {
  const navigation = useNavigation();
  const { importedPart, updateImportedPart } = useAuth();
  const [discount, setDiscount] = useState(0);
  const SERVICE_CHARGE = 500;

  // Dialog states
  const [removeDialogVisible, setRemoveDialogVisible] = useState(false);
  const [partToRemove, setPartToRemove] = useState(null);
  const [submitDialogVisible, setSubmitDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculations
  const totalPartsPrice = importedPart?.reduce((sum, part) => sum + part.price, 0) || 0;
  const totalPayable = totalPartsPrice + SERVICE_CHARGE - discount;

  const handleRemovePart = () => {
    if (partToRemove && importedPart) {
      const updatedParts = importedPart.filter((p) => p.id !== partToRemove);
      updateImportedPart(updatedParts);
    }
    setRemoveDialogVisible(false);
    setPartToRemove(null);
  };

  // Submit flow: confirmation → loading → success → navigate back
  const handleConfirmSubmit = () => {
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
        onPress={() => setRemoveDialogVisible(false)}
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="Billing"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        showRightIcon={true}
        customRightIconComponent={
          <Icon name="bag-add-outline" size={24} color="#333" />
        }
        onRightIconPress={() => navigation.navigate('AddPartBilling')}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 pr-7 pt-5"
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {importedPart && importedPart.length > 0 ? (
          importedPart.map((part) => (
            <View
              key={part.id}
              className="flex-row items-center p-3 mx-4 mb-3 bg-gray-50 rounded-xl border border-gray-200"
            >
              {/* Part Image */}
              <Image
                source={{ uri: part.imageUrl }}
                className="w-12 h-12 rounded-lg bg-gray-300"
                resizeMode="cover"
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
              {/* Remove Icon */}
              <TouchableOpacity
                onPress={() => {
                  setPartToRemove(part.id);
                  setRemoveDialogVisible(true);
                }}
              >
                <Icon name="trash-outline" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View className="items-center justify-center py-10">
            <Icon name="cart-outline" size={50} color="#ccc" />
            <Text className="text-text-tertiary text-base mt-2">
              No parts added yet
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

          {/* Discount Input */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="font-medium text-md">Discount</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-1 w-24 text-right"
              keyboardType="numeric"
              value={discount.toString()}
              onChangeText={(text) => setDiscount(parseFloat(text) || 0)}
              placeholder="0"
            />
          </View>

          {/* Total Payable */}
          <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <Text className="font-medium text-md">Total Payable Amount</Text>
            <Text className="font-bold text-lg">₹{totalPayable.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-black py-5 rounded-xl w-full flex justify-center items-center"
          onPress={() => setSubmitDialogVisible(true)}
        >
          <Text className="text-white font-bold text-xl">Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Remove Part Dialog */}
      <DialogBox
        visible={removeDialogVisible}
        onClose={() => setRemoveDialogVisible(false)}
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
          
          <View className="mt-3  border-gray-200">
            <Text className="text-text-primary text-base">
              Total Payable:{' '}
              <Text className="font-bold">₹{totalPayable.toFixed(2)}</Text>
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