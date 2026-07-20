import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import DialogBox from '../../../components/DilaogBox';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
// import { AMCBilling as AMCBillingAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { check, request, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import dummyData from '../../../lib/dummyData';

const AMCBilling = () => {
  const [discount, setDiscount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [billingResponse, setBillingResponse] = useState(null);
  const navigation = useNavigation();

  // Location states
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(true); // full‑screen loader flag
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const route = useRoute();
  const { linkedParts, amc, complaintData, billingId } = route.params;
  const { user, imagUrl } = useAuth();

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
    return '₹' + Number(amount).toFixed(2);
  };

  const subtotal = amc?.price ? parseFloat(amc.price) : 0;
  const platformFee = complaintData?.platform_fee ? parseFloat(complaintData.platform_fee) : 0;

  const calculateDiscountAmount = () => {
    if (!discount) return 0;
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue)) return 0;
    return Math.min(discountValue, subtotal);
  };

  const discountAmount = calculateDiscountAmount();
  const finalAmount = subtotal - discountAmount + platformFee;

  // ---------- Location functions (unchanged) ----------
  const checkLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        return await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        return await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    } catch (error) {
      console.log('Permission check error:', error);
      return RESULTS.UNAVAILABLE;
    }
  };

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        return await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      } else {
        return await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      }
    } catch (error) {
      console.log('Permission request error:', error);
      return RESULTS.UNAVAILABLE;
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      let timeoutId;
      const successCallback = (position) => {
        if (timeoutId) clearTimeout(timeoutId);
        const { latitude, longitude, accuracy } = position.coords;
        resolve({ latitude: latitude.toString(), longitude: longitude.toString(), accuracy });
      };
      const errorCallback = (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        let errorMessage = 'Failed to get location';
        if (error.code === 1) errorMessage = 'Location permission denied';
        else if (error.code === 2) errorMessage = 'Location unavailable. Please enable GPS.';
        else if (error.code === 3) errorMessage = 'Location request timed out.';
        reject(new Error(errorMessage));
      };
      timeoutId = setTimeout(() => errorCallback({ code: 3, message: 'Timeout' }), 15000);
      Geolocation.getCurrentPosition(successCallback, errorCallback, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      });
    });
  };

  const initializeLocation = async (retryCount = 0) => {
    const maxRetries = 2;
    try {
      let permissionStatus = await checkLocationPermission();
      if (permissionStatus === RESULTS.GRANTED) {
        setHasLocationPermission(true);
        setIsGettingLocation(true);
        try {
          const location = await getCurrentLocation();
          setCurrentLocation(location);
          return location;
        } catch (error) {
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return initializeLocation(retryCount + 1);
          }
          throw error;
        } finally {
          setIsGettingLocation(false);
        }
      }
      if (permissionStatus === RESULTS.DENIED) {
        const requestStatus = await requestLocationPermission();
        if (requestStatus === RESULTS.GRANTED) {
          setHasLocationPermission(true);
          setIsGettingLocation(true);
          const location = await getCurrentLocation();
          setCurrentLocation(location);
          setIsGettingLocation(false);
          return location;
        } else {
          setHasLocationPermission(false);
          throw new Error('Location permission denied');
        }
      }
      if (permissionStatus === RESULTS.BLOCKED) {
        setHasLocationPermission(false);
        Alert.alert(
          'Location Permission Required',
          'Please enable location access in settings for AMC purchase.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ]
        );
        throw new Error('Location permission blocked');
      }
      throw new Error('Unable to check location permission');
    } catch (error) {
      console.log('Location initialization error:', error);
      throw error;
    }
  };

  // Fetch location on mount
  useEffect(() => {
    const fetchLocation = async () => {
      setIsFetchingLocation(true);
      try {
        const location = await initializeLocation();
        if (location) console.log('Location obtained:', location);
      } catch (err) {
        console.error('Location fetch failed:', err.message);
        toast.custom(
          <StatusMessage type="error" title={err.message || 'Failed to get location'} />,
          { duration: 3000 }
        );
      } finally {
        setIsFetchingLocation(false);
      }
    };
    fetchLocation();
  }, []);

  // ---------- NEW: Navigate to Remarkscreen for AMC billing ----------
  const handleProceedToPayment = () => {
    if (loading) return;
    if (!currentLocation) {
      toast.custom(
        <StatusMessage type="error" title="Location not available. Please try again." />,
        { duration: 3000 }
      );
      return;
    }

    // Navigate to Remarkscreen with AMC context
    navigation.navigate('Remarkscreen', {
      billingType: 'amc',
      complaintData: complaintData,
      amcData: amc,
      billingId: billingId,
      shouldSubmitOnReturn: true,
      returnToBilling: true,
      totalPayable: finalAmount,
      discount: discountAmount,
      location: currentLocation,
      technicianId: user?.id?.toString(),
      platformFee: platformFee,
    });
  };

  const handleResetAndNavigateHome = () => {
    setShowSuccessDialog(false);
    navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'BottomTabs' }] }));
  };

  const parseAMCBenefits = (content) => {
    if (!content) return [];
    const textContent = content.replace(/<[^>]*>/g, ' ');
    return textContent.split('•').filter(b => b.trim()).map(b => b.trim());
  };
  const amcBenefits = parseAMCBenefits(amc?.content);

  // Full‑screen loader while fetching location
  if (isFetchingLocation) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header title="AMC Billing" showBackButton containerStyle="bg-white border-b border-gray-200 px-4 py-4" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#14b8a6" />
          <Text className="mt-4 text-gray-600">Fatching data , Please wait...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Main UI (location status row removed)
  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute inset-0 z-50 pointer-events-none"><Toaster /></View>
      <Header
        title="AMC Billing"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
      />
      <ScrollView className="flex-1 bg-gray-100" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* AMC Details Card */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-3">{amc?.title || amc?.name}</Text>
            {amcBenefits.length > 0 && (
              <View className="mb-3">
                {amcBenefits.map((benefit, index) => (
                  <View key={index} className="flex-row items-center mb-1">
                    <Icon name="checkmark-circle" size={16} color="#10B981" />
                    <Text className="text-gray-600 text-sm ml-2">{benefit}</Text>
                  </View>
                ))}
              </View>
            )}
            <View className="flex-row justify-between items-center pt-2 border-t border-gray-200">
              <Text className="text-gray-600">Validity:</Text>
              <Text className="text-teal-600 font-semibold">{amc?.valid || "4 Service Valid For 1 Year"}</Text>
            </View>
          </View>

          {/* Bill Summary Card */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-4">Bill Summary</Text>
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base text-gray-600">AMC Plan Price</Text>
              <Text className="text-base font-semibold text-gray-800">{formatCurrency(subtotal)}</Text>
            </View>
            <View className="mb-3 pb-2 border-b border-gray-200">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base text-gray-600">Discount (Fixed Amount)</Text>
              </View>
              <View className="flex-row items-center">
                <View className="flex-1 flex-row items-center bg-gray-50 rounded-lg border border-gray-300 px-3 mr-2">
                  <Text className="text-gray-600 font-medium mr-1">₹</Text>
                  <TextInput
                    className="flex-1 py-3 text-gray-800"
                    placeholder="Enter discount amount"
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
                    <Text className="text-green-700 font-semibold">-{formatCurrency(discountAmount)}</Text>
                  </View>
                )}
              </View>
              {discount && discountAmount === 0 && (
                <Text className="text-red-500 text-xs mt-1">Discount cannot exceed subtotal</Text>
              )}
            </View>
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base text-gray-600">Platform Fee</Text>
              <Text className="text-base font-semibold text-gray-800">{formatCurrency(platformFee)}</Text>
            </View>
            <View className="flex-row justify-between items-center mt-3 pt-2">
              <Text className="text-xl font-bold text-gray-900">Total Amount</Text>
              <Text className="text-2xl font-bold text-teal-600">{formatCurrency(finalAmount)}</Text>
            </View>
          </View>

          {complaintData && (
            <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
              <Text className="text-lg font-bold text-gray-800 mb-3">Complaint Information</Text>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-gray-600">AMC Complaint ID:</Text>
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

      <View className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <TouchableOpacity
          onPress={handleProceedToPayment}
          disabled={loading || !currentLocation}
          className={`py-4 rounded-xl items-center ${loading || !currentLocation ? 'bg-gray-400' : 'bg-teal-600'}`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-lg font-bold ml-2">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-bold">Proceed to Payment • {formatCurrency(finalAmount)}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Dialog */}
      <DialogBox
        visible={showSuccessDialog}
        onClose={handleResetAndNavigateHome}
        title="AMC Purchased Successfully!"
        size="md"
        footer={
          <View className="flex-row justify-center">
            <TouchableOpacity onPress={handleResetAndNavigateHome} className="px-6 py-2 rounded-lg bg-teal-600">
              <Text className="text-white font-medium">OK</Text>
            </TouchableOpacity>
          </View>
        }
        closeOnBackdropPress={false}
      >
        <View className="py-4 items-center">
          <View className="bg-green-100 rounded-full p-3 mb-3"><Icon name="checkmark-circle" size={50} color="#10B981" /></View>
          <Text className="text-gray-800 text-center text-base mb-2 font-semibold">{successMessage || "Your AMC plan has been purchased successfully!"}</Text>
          <View className="bg-teal-50 rounded-lg p-3 mb-3 w-full">
            <Text className="text-gray-600 text-center text-sm">Amount Paid</Text>
            <Text className="text-teal-600 font-bold text-2xl text-center">{formatCurrency(finalAmount)}</Text>
          </View>
          <View className="bg-gray-50 rounded-lg p-3 mb-3 w-full">
            <Text className="text-gray-600 text-sm text-center">Transaction ID</Text>
            <Text className="text-gray-800 font-medium text-sm text-center">{billingResponse?.transaction_id || billingId || 'N/A'}</Text>
          </View>
          <View className="bg-blue-50 rounded-lg p-3 w-full">
            <Text className="text-blue-600 text-xs text-center">✅ AMC Plan Activated Successfully</Text>
            <Text className="text-blue-600 text-xs text-center mt-1">📧 Confirmation sent to registered mobile number</Text>
            <Text className="text-blue-600 text-xs text-center mt-1">⏱️ Validity: {amc?.valid || "4 Service Valid For 1 Year"}</Text>
          </View>
        </View>
      </DialogBox>

      {/* Error Dialog */}
      <DialogBox
        visible={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        title="Purchase Failed"
        size="sm"
        footer={
          <View className="flex-row justify-center">
            <TouchableOpacity onPress={() => setShowErrorDialog(false)} className="px-6 py-2 rounded-lg bg-red-600">
              <Text className="text-white font-medium">Try Again</Text>
            </TouchableOpacity>
          </View>
        }
        closeOnBackdropPress={true}
      >
        <View className="py-4 items-center">
          <View className="bg-red-100 rounded-full p-3 mb-3"><Icon name="close-circle" size={50} color="#EF4444" /></View>
          <Text className="text-gray-800 text-center text-base mb-2">{errorMessage || "Something went wrong. Please try again."}</Text>
          <Text className="text-gray-500 text-center text-sm">Please check your internet connection and try again</Text>
        </View>
      </DialogBox>
    </SafeAreaView>
  );
};

export default AMCBilling;

const styles = StyleSheet.create({});