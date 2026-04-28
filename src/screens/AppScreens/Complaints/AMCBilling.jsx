import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../../../components/Header';
import DialogBox from '../../../components/DilaogBox';
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native';
import { AMCBilling as AMCBillingAPI } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { check, request, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { useDashboard } from '../../../contexts/DashboardContext'; // Import dashboard context if using

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
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const route = useRoute();
  const { linkedParts, amc, complaintData, billingId } = route.params;
  const { user } = useAuth();

  // Optional: Get dashboard refresh function if using context
  // const { triggerRefresh } = useDashboard();

  console.log("AMC Data:", amc);
  console.log("Linked Parts:", linkedParts);
  console.log("Complaint Data:", complaintData);
  console.log("Billing ID:", billingId);

  // Format currency function
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0.00';
    }
    return '₹' + Number(amount).toFixed(2);
  };

  // Parse AMC price to number
  const subtotal = amc?.price ? parseFloat(amc.price) : 0;

  // Platform fee from complaint data
  const platformFee = complaintData?.platform_fee ? parseFloat(complaintData.platform_fee) : 0;

  // Calculate discount amount (fixed only)
  const calculateDiscountAmount = () => {
    if (!discount) return 0;
    const discountValue = parseFloat(discount);
    if (isNaN(discountValue)) return 0;
    return Math.min(discountValue, subtotal);
  };

  const discountAmount = calculateDiscountAmount();
  const finalAmount = subtotal - discountAmount + platformFee;

  // Location permission and getting current location
  const checkLocationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
        console.log('iOS location permission status:', status);
        return status;
      } else {
        const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        console.log('Android location permission status:', status);
        return status;
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
        const { latitude, longitude } = position.coords;
        console.log('=== LOCATION OBTAINED IN AMC BILLING ===');
        console.log('Latitude:', latitude);
        console.log('Longitude:', longitude);
        console.log('Accuracy:', position.coords.accuracy);
        console.log('=========================================');
        resolve({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          accuracy: position.coords.accuracy
        });
      };

      const errorCallback = (error) => {
        if (timeoutId) clearTimeout(timeoutId);
        console.log('Location error code:', error.code);
        console.log('Location error message:', error.message);

        let errorMessage = 'Failed to get location';
        if (error.code === 1) {
          errorMessage = 'Location permission denied';
        } else if (error.code === 2) {
          errorMessage = 'Location unavailable. Please enable GPS.';
        } else if (error.code === 3) {
          errorMessage = 'Location request timed out. Please try again.';
        }

        reject(new Error(errorMessage));
      };

      timeoutId = setTimeout(() => {
        errorCallback({ code: 3, message: 'Location request timed out after 15 seconds' });
      }, 15000);

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
      console.log('Initializing location, attempt:', retryCount + 1);

      let permissionStatus = await checkLocationPermission();
      console.log('Current permission status:', permissionStatus);

      if (permissionStatus === RESULTS.GRANTED) {
        setHasLocationPermission(true);
        setIsGettingLocation(true);

        try {
          const location = await getCurrentLocation();
          setCurrentLocation(location);
          console.log('✅ LOCATION SUCCESSFULLY OBTAINED');
          console.log('Latitude saved:', location.latitude);
          console.log('Longitude saved:', location.longitude);
          toast.custom(
            <StatusMessage type="success" title="Location obtained successfully" />,
            { duration: 2000 }
          );
          return location;
        } catch (error) {
          console.log('Error getting location:', error.message);

          if (retryCount < maxRetries) {
            console.log(`Retrying location fetch (${retryCount + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            return initializeLocation(retryCount + 1);
          }

          toast.custom(
            <StatusMessage type="error" title={error.message} />,
            { duration: 3000 }
          );
          return null;
        } finally {
          setIsGettingLocation(false);
        }
      }

      if (permissionStatus === RESULTS.DENIED) {
        console.log('Permission denied, requesting...');
        const requestStatus = await requestLocationPermission();
        console.log('Request result:', requestStatus);

        if (requestStatus === RESULTS.GRANTED) {
          setHasLocationPermission(true);
          setIsGettingLocation(true);
          try {
            const location = await getCurrentLocation();
            setCurrentLocation(location);
            console.log('✅ LOCATION SUCCESSFULLY OBTAINED AFTER PERMISSION');
            console.log('Latitude saved:', location.latitude);
            console.log('Longitude saved:', location.longitude);
            toast.custom(
              <StatusMessage type="success" title="Location obtained successfully" />,
              { duration: 2000 }
            );
            return location;
          } catch (error) {
            console.log('Error getting location:', error.message);
            toast.custom(
              <StatusMessage type="error" title={error.message} />,
              { duration: 3000 }
            );
            return null;
          } finally {
            setIsGettingLocation(false);
          }
        } else {
          setHasLocationPermission(false);
          toast.custom(
            <StatusMessage type="error" title="Location permission is required for AMC purchase" />,
            { duration: 3000 }
          );
          return null;
        }
      }

      if (permissionStatus === RESULTS.BLOCKED) {
        setHasLocationPermission(false);
        Alert.alert(
          'Location Permission Required',
          'This app requires location permission for AMC purchase. Please enable location access in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ]
        );
        return null;
      }

      return null;
    } catch (error) {
      console.log('Location initialization error:', error);
      setIsGettingLocation(false);
      return null;
    }
  };

  // Initialize location when component mounts
  useEffect(() => {
    const getLocationOnMount = async () => {
      const location = await initializeLocation();
      if (location) {
        console.log('Location saved in variable on mount:', location);
      }
    };
    getLocationOnMount();
  }, []);

  const handleBookNow = () => {
    if (loading) return;
    
    // Check if location is available
    if (!currentLocation) {
      toast.custom(
        <StatusMessage type="error" title="Getting location. Please wait or try again." />,
        { duration: 3000 }
      );
      initializeLocation();
      return;
    }
    
    setShowConfirmation(true);
  };

  const handleConfirmBooking = async () => {
    setShowConfirmation(false);
    setLoading(true);

    try {
      // Use the saved location from state
      let location = currentLocation;
      
      // If location is not available, try to get it again
      if (!location) {
        console.log('Location not available, fetching again...');
        location = await initializeLocation();
        if (!location) {
          throw new Error('Unable to get location. Please enable GPS and try again.');
        }
      }

      console.log('Using location for AMC Billing:');
      console.log('Latitude:', location.latitude);
      console.log('Longitude:', location.longitude);

      // Prepare payload for AMCBilling API
      const payload = {
        amc_complaint_id: complaintData?.id.toString(),
        technician_id: user?.id?.toString() || user?.technician_id?.toString(),
        final_amount: subtotal.toString(),
        discount: discountAmount.toString(),
        latitude: location.latitude,
        longitude: location.longitude
      };

      console.log('AMC Billing Payload:', payload);

      const response = await AMCBillingAPI(payload);
      console.log('AMC Billing Response:', response);

      // Check if response is successful
      if (response?.data?.success === true) {
        // Success case - get message from response
        const successMsg = response?.data?.msg || response?.data?.message || "AMC purchased successfully!";
        setSuccessMessage(successMsg);
        setBillingResponse(response.data);
        
        // Optional: Refresh dashboard counts if using context
        // if (triggerRefresh) {
        //   await triggerRefresh();
        // }
        
        // Show success dialog
        setShowSuccessDialog(true);
        
        toast.custom(
          <StatusMessage type="success" title={successMsg} />,
          { duration: 3000 }
        );
        
      } else {
        // Error case - get error message from response
        const errorMsg = response?.data?.msg || 
                        response?.data?.message || 
                        response?.data?.error || 
                        'Failed to process AMC billing';
        throw new Error(errorMsg);
      }

    } catch (error) {
      console.error('AMC Billing error:', error);
      setErrorMessage(error.message || 'Failed to process booking. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle reset - Navigate to home screen and reset all routes
  const handleResetAndNavigateHome = () => {
    setShowSuccessDialog(false);
    
    // Reset all routes and navigate to home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'BottomTabs' }], // Replace 'Home' with your actual home screen name
      })
    );
  };

  const handleResetForm = () => {
    setDiscount('');
    setShowSuccessDialog(false);
  };

  // Parse AMC content HTML to array of benefits
  const parseAMCBenefits = (content) => {
    if (!content) return [];
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

  // Success Dialog Footer - Updated to navigate to home
  const successFooter = (
    <View className="flex-row justify-center">
      <TouchableOpacity
        onPress={handleResetAndNavigateHome}
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
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>
      
      <Header
        title="AMC Billing"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
      />

      <ScrollView className="flex-1 bg-gray-100" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Location Status Indicator */}
          <View className="mb-4">
            <View className={`flex-row items-center ${hasLocationPermission && currentLocation ? 'bg-green-50' : 'bg-yellow-50'} p-2 rounded-lg`}>
              <Icon
                name="location-outline"
                size={20}
                color={hasLocationPermission && currentLocation ? "#10b981" : "#eab308"}
              />
              <Text className={`ml-2 text-sm ${hasLocationPermission && currentLocation ? 'text-green-700' : 'text-yellow-700'}`}>
                {isGettingLocation ? 'Getting location...' :
                  hasLocationPermission && currentLocation ? 'Location ready for AMC purchase' :
                    'Location permission required for AMC purchase'}
              </Text>
            </View>
            {currentLocation && (
              <Text className="text-xs text-gray-500 mt-1 ml-7">
                Lat: {currentLocation.latitude}, Lng: {currentLocation.longitude}
              </Text>
            )}
          </View>

          {/* AMC Details Card */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm">
            <Text className="text-xl font-bold text-gray-800 mb-3">{amc?.title || amc?.name}</Text>
            
            {/* AMC Benefits */}
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

            {/* AMC Price */}
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base text-gray-600">AMC Plan Price</Text>
              <Text className="text-base font-semibold text-gray-800">
                {formatCurrency(subtotal)}
              </Text>
            </View>

            {/* Discount Section - Fixed Only */}
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
                    <Text className="text-green-700 font-semibold">
                      -{formatCurrency(discountAmount)}
                    </Text>
                  </View>
                )}
              </View>

              {discount && discountAmount === 0 && (
                <Text className="text-red-500 text-xs mt-1">
                  Discount cannot exceed subtotal
                </Text>
              )}
            </View>

            {/* Platform Fee */}
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-200">
              <Text className="text-base text-gray-600">Platform Fee</Text>
              <Text className="text-base font-semibold text-gray-800">
                {formatCurrency(platformFee)}
              </Text>
            </View>

            {/* Total Amount */}
            <View className="flex-row justify-between items-center mt-3 pt-2">
              <Text className="text-xl font-bold text-gray-900">Total Amount</Text>
              <Text className="text-2xl font-bold text-teal-600">
                {formatCurrency(finalAmount)}
              </Text>
            </View>
          </View>

          {/* Complaint Info Card */}
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

      {/* Book Now Button */}
      <View className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <TouchableOpacity
          onPress={handleBookNow}
          disabled={loading || isGettingLocation}
          className={`py-4 rounded-xl items-center ${loading || isGettingLocation ? 'bg-gray-400' : 'bg-teal-600'}`}
        >
          {loading || isGettingLocation ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-lg font-bold ml-2">
                {isGettingLocation ? 'Getting location...' : 'Processing...'}
              </Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-bold">Proceed to Payment • {formatCurrency(finalAmount)}</Text>
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
                <Text className="text-gray-600">Platform Fee:</Text>
                <Text className="text-gray-800 font-medium">{formatCurrency(platformFee)}</Text>
              </View>
              <View className="flex-row justify-between pt-2 border-t border-gray-200 mt-1">
                <Text className="text-gray-800 font-bold">Total Amount:</Text>
                <Text className="text-teal-600 font-bold text-lg">{formatCurrency(finalAmount)}</Text>
              </View>
            </View>
          </View>

          {/* Location Info */}
          {currentLocation && (
            <View className="mb-3">
              <View className="flex-row items-center">
                <Icon name="location-outline" size={16} color="#6B7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  Location: {currentLocation.latitude}, {currentLocation.longitude}
                </Text>
              </View>
            </View>
          )}

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

      {/* Success Dialog - Updated to navigate to home on OK */}
      <DialogBox
        visible={showSuccessDialog}
        onClose={handleResetAndNavigateHome}
        title="AMC Purchased Successfully!"
        size="md"
        footer={successFooter}
        closeOnBackdropPress={false}
      >
        <View className="py-4 items-center">
          <View className="bg-green-100 rounded-full p-3 mb-3">
            <Icon name="checkmark-circle" size={50} color="#10B981" />
          </View>
          <Text className="text-gray-800 text-center text-base mb-2 font-semibold">
            {successMessage || "Your AMC plan has been purchased successfully!"}
          </Text>
          
          {/* Amount Display */}
          <View className="bg-teal-50 rounded-lg p-3 mb-3 w-full">
            <Text className="text-gray-600 text-center text-sm">Amount Paid</Text>
            <Text className="text-teal-600 font-bold text-2xl text-center">
              {formatCurrency(finalAmount)}
            </Text>
          </View>
          
          {/* Transaction Details */}
          <View className="bg-gray-50 rounded-lg p-3 mb-3 w-full">
            <Text className="text-gray-600 text-sm text-center">Transaction ID</Text>
            <Text className="text-gray-800 font-medium text-sm text-center">
              {billingResponse?.transaction_id || billingId || 'N/A'}
            </Text>
          </View>
          
          {/* Plan Details */}
          <View className="bg-blue-50 rounded-lg p-3 w-full">
            <Text className="text-blue-600 text-xs text-center">
              ✅ AMC Plan Activated Successfully
            </Text>
            <Text className="text-blue-600 text-xs text-center mt-1">
              📧 Confirmation sent to registered mobile number
            </Text>
            <Text className="text-blue-600 text-xs text-center mt-1">
              ⏱️ Validity: {amc?.valid || "4 Service Valid For 1 Year"}
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