import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { GetComplaintsDetails } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

const QRCodeDetails = () => {
  const route = useRoute();
  const qrCode = route.params.qrData;
  const { imagUrl } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [expandedParts, setExpandedParts] = useState(false);

  console.log('Received QR Code:', qrCode);
  const complaint_id = qrCode.complaintId || qrCode.complaint_id || 'N/A';
  console.log('Complaint ID:', complaint_id);

  // Fetch complaint details on mount
  useEffect(() => {
    if (complaint_id !== 'N/A') {
      fetchComplaintDetails();
    }
  }, [complaint_id]);

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const payload = {
        complaint_id: complaint_id.toString()
      };
      console.log('Fetch complaint details payload:', payload);
      const response = await GetComplaintsDetails(payload);
      console.log('Complaint Details Response:', response?.data);

      if (response?.data?.success && response?.data?.result) {
        setComplaintDetails(response.data.result);
      } else {
        toast.custom(
          <StatusMessage type='error' title='Failed to load complaint details' />
        );
      }
    } catch (error) {
      console.log('Error fetching complaint details:', error);
      toast.custom(
        <StatusMessage type='error' title='Error' description={error.message} />
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCallPress = (phoneNumber) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRatingColor = (rating) => {
    const ratingValue = parseFloat(rating);
    if (ratingValue >= 4) return 'text-green-600';
    if (ratingValue >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <Header
          title="QR Code Details"
          titlePosition="left"
          titleStyle="font-bold text-2xl ml-5"
          showBackButton={true}
          containerStyle='flex-row pt-3 py-2 px-4'
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#58A890" />
          <Text className="mt-4 text-text-secondary">Loading complaint details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (complaint_id === 'N/A' || !complaintDetails) {
    return (
      <SafeAreaView className="flex-1 bg-background-primary">
        <Header
          title="QR Code Details"
          titlePosition="left"
          titleStyle="font-bold text-2xl ml-5"
          showBackButton={true}
          containerStyle='flex-row pt-3 py-2 px-4'
        />
        <View className="flex-1 justify-center items-center px-6">
          <Icon name="document-text-outline" size={80} color="#CCCCCC" />
          <Text className="text-center text-text-secondary mt-4 text-lg">
            {complaint_id === 'N/A' 
              ? 'This QR code is not associated with any complaint' 
              : 'No complaint details available'}
          </Text>
          <Text className="text-center text-text-tertiary mt-2">
            QR Code: {qrCode?.qrCodeNumber || qrCode?.qr_id || 'N/A'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-primary">
      <Header
        title="QR Code Details"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        containerStyle='flex-row pt-3 py-2 px-4'
      />
      <View className="absolute inset-0 z-50 w-90% pointer-events-none">
        <Toaster />
      </View>

      <ScrollView 
        className="flex-1 px-4" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* QR Code Information Card */}
        <View className="bg-white rounded-2xl p-4 mb-4 mt-4 shadow-sm border border-gray-200">
          <Text className="text-lg font-bold text-text-primary mb-3">QR Code Information</Text>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-text-secondary">QR Code Number</Text>
            <View className="flex-row items-center">
              <Text className="text-text-primary font-semibold">{qrCode?.qrCodeNumber || qrCode?.qr_id || 'N/A'}</Text>
              <TouchableOpacity 
                onPress={() => {
                  // Copy QR code
                  toast.custom(<StatusMessage type='info' title='QR Code Copied!' />);
                }}
                className="ml-2"
              >
                <Icon name="copy-outline" size={18} color="#58A890" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary">Status</Text>
            <View className={`px-2 py-1 rounded-full ${complaintDetails?.status === 'success' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-semibold ${complaintDetails?.status === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                {complaintDetails?.status === 'success' ? 'Used' : 'Fresh'}
              </Text>
            </View>
          </View>
        </View>

        {/* Complaint Details Card */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
          <Text className="text-lg font-bold text-text-primary mb-3">Complaint Details</Text>
          
          <View className="mb-3">
            <Text className="text-text-secondary text-sm">Complaint ID</Text>
            <Text className="text-text-primary font-semibold text-base">#{complaintDetails.id}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-text-secondary text-sm">CSN Number</Text>
            <Text className="text-text-primary font-semibold text-base">{complaintDetails.csn || 'N/A'}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-text-secondary text-sm">Service</Text>
            <Text className="text-text-primary font-semibold text-base">{complaintDetails.service_name || complaintDetails.service || 'N/A'}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-text-secondary text-sm">Customer Name</Text>
            <Text className="text-text-primary font-semibold text-base">{complaintDetails.customer_name || 'N/A'}</Text>
          </View>

          <View className="mb-3">
            <Text className="text-text-secondary text-sm">Customer Mobile</Text>
            <TouchableOpacity 
              onPress={() => handleCallPress(complaintDetails.customer_mobile)}
              className="flex-row items-center"
            >
              <Text className="text-primary-sage600 font-semibold text-base">{complaintDetails.customer_mobile || 'N/A'}</Text>
              <Icon name="call-outline" size={16} color="#58A890" className="ml-2" />
            </TouchableOpacity>
          </View>

          <View className="mb-3">
            <Text className="text-text-secondary text-sm">Service Address</Text>
            <Text className="text-text-primary text-base">{complaintDetails.service_address || 'N/A'}</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-text-secondary text-sm">Slot Date</Text>
              <Text className="text-text-primary font-semibold">{complaintDetails.slot_date || 'N/A'}</Text>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-text-secondary text-sm">Slot Time</Text>
              <Text className="text-text-primary font-semibold">{complaintDetails.slot_time || 'N/A'}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-text-secondary text-sm">Total Paid</Text>
              <Text className="text-primary-sage600 font-bold text-lg">₹{complaintDetails.total_paid_amt || '0'}</Text>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-text-secondary text-sm">Days</Text>
              <Text className="text-text-primary font-semibold">{complaintDetails.days || '0'} days</Text>
            </View>
          </View>

          {complaintDetails.rating && (
            <View className="mb-3">
              <Text className="text-text-secondary text-sm">Rating</Text>
              <View className="flex-row items-center">
                <Text className={`font-semibold text-base ${getRatingColor(complaintDetails.rating)}`}>
                  {complaintDetails.rating}
                </Text>
                <Icon name="star" size={16} color="#F0B27A" className="ml-1" />
              </View>
            </View>
          )}

          {complaintDetails.review && complaintDetails.review !== 'A' && (
            <View className="mb-3">
              <Text className="text-text-secondary text-sm">Review</Text>
              <Text className="text-text-primary">{complaintDetails.review}</Text>
            </View>
          )}

          {complaintDetails.remark && (
            <View className="mb-3">
              <Text className="text-text-secondary text-sm">Remark</Text>
              <Text className="text-text-primary italic">{complaintDetails.remark}</Text>
            </View>
          )}
        </View>

        {/* Parts Used Card */}
        {complaintDetails.parts && complaintDetails.parts.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
            <TouchableOpacity 
              onPress={() => setExpandedParts(!expandedParts)}
              className="flex-row justify-between items-center mb-3"
            >
              <Text className="text-lg font-bold text-text-primary">Parts Used ({complaintDetails.parts.length})</Text>
              <Icon name={expandedParts ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#666" />
            </TouchableOpacity>

            {(expandedParts ? complaintDetails.parts : complaintDetails.parts.slice(0, 3)).map((part, index) => (
              <View key={part.id || index} className="border-t border-gray-100 pt-3 mt-2">
                <View className="flex-row">
                  {part.part_image && (
                    <Image 
                      source={{ uri: part.part_image }}
                      className="w-16 h-16 rounded-lg mr-3"
                      resizeMode="cover"
                    />
                  )}
                  <View className="flex-1">
                    <Text className="text-text-primary font-semibold">{part.part_name}</Text>
                    <Text className="text-text-secondary text-sm">QR Code: {part.qr_code || 'N/A'}</Text>
                    <Text className="text-primary-sage600 font-bold mt-1">₹{part.part_price}</Text>
                  </View>
                </View>
              </View>
            ))}

            {complaintDetails.parts.length > 3 && !expandedParts && (
              <TouchableOpacity 
                onPress={() => setExpandedParts(true)}
                className="mt-3 items-center"
              >
                <Text className="text-primary-sage600 font-semibold">View {complaintDetails.parts.length - 3} more parts</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Additional Info */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
          <Text className="text-lg font-bold text-text-primary mb-3">Additional Information</Text>
          
          <View className="flex-row justify-between mb-2">
            <Text className="text-text-secondary">Recomplaint</Text>
            <Text className="text-text-primary font-semibold">{complaintDetails.recomplaint || 'No'}</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-text-secondary">OTP Verified</Text>
            <Text className="text-text-primary font-semibold">{complaintDetails.verify_otp ? 'Yes' : 'No'}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-text-secondary">Status</Text>
            <View className={`px-2 py-1 rounded-full ${complaintDetails.status === 'success' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-semibold ${complaintDetails.status === 'success' ? 'text-green-600' : 'text-gray-600'}`}>
                {complaintDetails.status?.toUpperCase() || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QRCodeDetails;

const styles = StyleSheet.create({});