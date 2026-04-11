import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator, TouchableOpacity, Linking, StatusBar, Platform, PermissionsAndroid } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { GetComplaintsDetails } from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { DownloadIcon } from '../../../assets/svgIcons/SVGIcons';
import ReactNativeBlobUtil from 'react-native-blob-util';
import DialogBox from '../../../components/DilaogBox';

const QRCodeDetails = () => {
  const route = useRoute();
  const status = route.params?.status || 'complaint';
  console.log('Status in QRCodeDetails:', status);
  const qrCode = route.params.qrData || route.params.complaint || route.params.qrCode || {};
  console.log('Route params in QRCodeDetails:', qrCode);
  const { imagUrl } = useAuth();

  const [loading, setLoading] = useState(false);
  const [complaintDetails, setComplaintDetails] = useState(null);
  const [expandedParts, setExpandedParts] = useState(false);
  const [expandedCommission, setExpandedCommission] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);
  
  // Dialog state
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({
    title: '',
    message: '',
    fileName: '',
    filePath: '',
    onConfirm: null
  });

  console.log('Received QR Code:', qrCode);
  const complaint_id = qrCode.complaintId || qrCode.complaint_id || qrCode.id || 'N/A';
  console.log('Complaint ID:', complaint_id);

  // Check if Android 13+ (API 33+)
  const isAndroid13OrAbove = () => {
    return Platform.OS === 'android' && Platform.Version >= 33;
  };

  // Request storage permission based on Android version
  const requestStoragePermissionOnMount = async () => {
    if (Platform.OS === 'android') {
      try {
        let granted = false;

        if (isAndroid13OrAbove()) {
          // For Android 13+, request granular media permissions
          const permissions = [
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          ];

          const results = await PermissionsAndroid.requestMultiple(permissions);

          granted = Object.values(results).every(
            result => result === PermissionsAndroid.RESULTS.GRANTED
          );

          if (granted) {
            console.log('All media permissions granted');
          } else {
            console.log('Some media permissions denied');
          }
        } else {
          // For Android 12 and below, request storage permissions
          granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message: 'This app needs access to your storage to download and save PDF invoices.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          ) === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (granted) {
          setHasStoragePermission(true);
          console.log('Storage permission granted');
        } else {
          setHasStoragePermission(false);
          console.log('Storage permission denied');
          if (!isAndroid13OrAbove()) {
            toast.custom(
              <StatusMessage type='warning' title='Permission Required' message='Storage permission is needed to download PDFs. You can enable it in settings.' />
            );
          }
        }
      } catch (err) {
        console.log('Permission request error:', err);
        setHasStoragePermission(false);
      }
    } else {
      // iOS doesn't require explicit storage permission
      setHasStoragePermission(true);
    }
  };

  // Request storage permission for download (if not already granted)
  const requestStoragePermissionForDownload = async () => {
    if (Platform.OS === 'android') {
      try {
        if (isAndroid13OrAbove()) {
          // For Android 13+, check if we have media permissions
          const hasImagePermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          );

          if (!hasImagePermission) {
            const permissions = [
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
              PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
            ];

            const results = await PermissionsAndroid.requestMultiple(permissions);
            return Object.values(results).every(
              result => result === PermissionsAndroid.RESULTS.GRANTED
            );
          }
          return true;
        } else {
          // For Android 12 and below
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: 'Storage Permission Required',
              message: 'App needs access to your storage to download PDF files',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
      } catch (err) {
        console.log('Permission error:', err);
        return false;
      }
    }
    return true;
  };

  // Show dialog helper
  const showDialog = (title, message, fileName = '', filePath = '', onConfirm = null) => {
    setDialogConfig({
      title,
      message,
      fileName,
      filePath,
      onConfirm
    });
    setDialogVisible(true);
  };

  // Close dialog
  const closeDialog = () => {
    setDialogVisible(false);
    setDialogConfig({
      title: '',
      message: '',
      fileName: '',
      filePath: '',
      onConfirm: null
    });
  };

  // Handle dialog action (Open PDF)
  const handleDialogAction = async () => {
    if (dialogConfig.onConfirm) {
      await dialogConfig.onConfirm();
    }
    closeDialog();
  };

  // Fetch complaint details on mount
  useEffect(() => {
    if (complaint_id !== 'N/A') {
      fetchComplaintDetails();
    }
  }, [complaint_id]);

  // Request storage permission when component mounts
  useEffect(() => {
    requestStoragePermissionOnMount();
  }, []);

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

  // Open PDF file
  const openPDF = async (filePath) => {
    try {
      if (Platform.OS === 'android') {
        // For Android, use content:// URI if possible, otherwise file://
        await ReactNativeBlobUtil.android.actionViewIntent(filePath, 'application/pdf');
      } else if (Platform.OS === 'ios') {
        await ReactNativeBlobUtil.ios.openDocument(filePath);
      }
    } catch (error) {
      console.error('Error opening PDF:', error);
      toast.custom(
        <StatusMessage type='error' title='Error' message='Unable to open PDF file' />
      );
    }
  };

  // Handle PDF download with react-native-blob-util - Saves to Downloads folder
  const handleDownloadPDF = async () => {
    const invoiceUrl = complaintDetails?.invoice;

    if (!invoiceUrl) {
      toast.custom(
        <StatusMessage
          type='error'
          title='No Invoice Found'
          message='No PDF invoice available for this complaint'
        />
      );
      return;
    }

    // Check if already downloading
    if (downloading) {
      toast.custom(
        <StatusMessage type='info' title='Download in progress' message='Please wait...' />
      );
      return;
    }

    try {
      setDownloading(true);

      // Request permission for Android if not already granted
      let permissionGranted = hasStoragePermission;
      if (!permissionGranted && Platform.OS === 'android') {
        permissionGranted = await requestStoragePermissionForDownload();
        if (permissionGranted) {
          setHasStoragePermission(true);
        }
      }

      if (!permissionGranted) {
        toast.custom(
          <StatusMessage type='error' title='Permission Denied' message='Cannot download PDF without storage permission. Please enable it in settings.' />
        );
        setDownloading(false);
        return;
      }

      // Show downloading toast
      toast.custom(
        <StatusMessage type='info' title='Downloading' message='Downloading PDF...' />
      );

      // Generate unique filename
      const timestamp = new Date().getTime();
      const fileName = `Invoice_${complaintDetails.id || complaintDetails.csn || 'complaint'}_${timestamp}.pdf`;

      let downloadPath;
      let finalPath;

      if (Platform.OS === 'android') {
        // For Android, save directly to Downloads folder without DownloadManager
        // so we can access the file path immediately
        const { config, fs } = ReactNativeBlobUtil;
        
        // Get the Downloads directory path
        const downloadsDir = fs.dirs.DownloadDir;
        downloadPath = `${downloadsDir}/${fileName}`;
        
        console.log('Download path for Android:', downloadPath);
        
        // Download file directly without DownloadManager
        const response = await config({
          fileCache: false,
          path: downloadPath,
          overwrite: true,
        }).fetch('GET', invoiceUrl);
        
        finalPath = response.path();
        console.log('Download completed at:', finalPath);
        
        // Verify file exists
        const exists = await fs.exists(finalPath);
        if (exists) {
          const fileInfo = await fs.stat(finalPath);
          console.log('File size:', fileInfo.size, 'bytes');
          
          toast.custom(
            <StatusMessage 
              type='success' 
              title='Download Complete' 
              message={`PDF saved to Downloads folder`} 
            />
          );
          
          // Show DialogBox with option to open PDF
          showDialog(
            'Download Complete',
            `PDF "${fileName}" has been downloaded successfully!\n\nSaved to: Downloads folder`,
            fileName,
            finalPath,
            () => openPDF(finalPath)
          );
        } else {
          throw new Error('File not found after download');
        }
      } else {
        // iOS: Save to documents directory
        const { config, fs } = ReactNativeBlobUtil;
        const documentsDir = fs.dirs.DocumentDir;
        downloadPath = `${documentsDir}/${fileName}`;
        
        const response = await config({
          fileCache: false,
          path: downloadPath,
        }).fetch('GET', invoiceUrl);
        
        finalPath = response.path();
        console.log('Download completed on iOS:', finalPath);
        
        toast.custom(
          <StatusMessage type='success' title='Download Complete' message='PDF downloaded successfully!' />
        );
        
        // Show DialogBox for iOS
        showDialog(
          'Download Complete',
          `PDF "${fileName}" has been downloaded successfully!`,
          fileName,
          finalPath,
          () => openPDF(finalPath)
        );
      }
      
    } catch (error) {
      console.error('PDF Download Error:', error);
      toast.custom(
        <StatusMessage type='error' title='Download Failed' message='Unable to download PDF. Please check your internet connection and try again.' />
      );
    } finally {
      setDownloading(false);
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

  // Get header title based on status
  const getHeaderTitle = () => {
    if (status === 'complaint') {
      return 'Complaint Details';
    }
    return 'QR Code Details';
  };

  // Format rating to show as X/5
  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    const parts = rating.split('/');
    if (parts.length === 2) {
      return `${parts[0]} / ${parts[1]}`;
    }
    return rating;
  };

  // Render commission in 3-column row format
  const renderCommissionRow = () => {
    if (!complaintDetails?.commission || complaintDetails.commission.length === 0) {
      return null;
    }

    const commission = complaintDetails.commission[0];

    return (
      <View className="mt-2">
        <View className="flex-row bg-gray-100 rounded-t-lg p-3 border-b border-gray-200">
          <View className="flex-1 items-center">
            <Text className="font-bold text-text-primary text-sm">Total Amount</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="font-bold text-text-primary text-sm">Technician Fund</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="font-bold text-text-primary text-sm">Admin Fund</Text>
          </View>
        </View>

        <View className="flex-row bg-white rounded-b-lg p-3">
          <View className="flex-1 items-center">
            <Text className="text-text-primary font-semibold">₹{parseFloat(commission.fund).toFixed(2)}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-green-600 font-bold">₹{parseFloat(commission.tech_fund).toFixed(2)}</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-orange-600 font-bold">₹{parseFloat(commission.admin_fund).toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render multiple commission entries
  const renderMultipleCommissionRows = () => {
    if (!complaintDetails?.commission || complaintDetails.commission.length === 0) {
      return null;
    }

    return (
      <View className="mt-2">
        <View className="flex-row bg-gray-100 rounded-t-lg p-3 border-b border-gray-200">
          <View className="flex-1 items-center">
            <Text className="font-bold text-text-primary text-sm">Total Amount</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="font-bold text-text-primary text-sm">Technician Fund</Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="font-bold text-text-primary text-sm">Admin Fund</Text>
          </View>
        </View>

        {complaintDetails.commission.map((commission, index) => (
          <View
            key={index}
            className={`flex-row p-3 ${index === complaintDetails.commission.length - 1 ? 'rounded-b-lg' : 'border-b border-gray-100'} ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
          >
            <View className="flex-1 items-center">
              <Text className="text-text-primary font-semibold">₹{parseFloat(commission.fund).toFixed(2)}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-green-600 font-bold">₹{parseFloat(commission.tech_fund).toFixed(2)}</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-orange-600 font-bold">₹{parseFloat(commission.admin_fund).toFixed(2)}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar backgroundColor="white" barStyle="dark-content" translucent={true} />
        <Header
          title={getHeaderTitle()}
          titlePosition="left"
          titleStyle="font-bold text-2xl ml-5"
          showBackButton={true}
          containerStyle='flex-row bg-white pt-3 py-2 px-4'
          showRightIcon={true}
          customRightIconComponent={
            <DownloadIcon width={24} height={24} fill="#555" />
          }
          onRightIconPress={handleDownloadPDF}
        />
        <View className="flex-1 justify-center items-center bg-gray-50">
          <ActivityIndicator size="large" color="#58A890" />
          <Text className="mt-4 text-text-secondary">Loading complaint details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (complaint_id === 'N/A' || !complaintDetails) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar backgroundColor="white" barStyle="dark-content" translucent={true} />
        <Header
          title={getHeaderTitle()}
          titlePosition="left"
          titleStyle="font-bold text-2xl ml-5"
          showBackButton={true}
          containerStyle='flex-row bg-white pt-3 py-2 px-4'
          showRightIcon={true}
          customRightIconComponent={
            <DownloadIcon width={24} height={24} fill="#555" />
          }
          onRightIconPress={handleDownloadPDF}
        />
        <View className="flex-1 justify-center items-center px-6">
          <Icon name="document-text-outline" size={80} color="#CCCCCC" />
          <Text className="text-center text-text-secondary mt-4 text-lg">
            {complaint_id === 'N/A'
              ? 'This QR code is not associated with any complaint'
              : 'No complaint details available'}
          </Text>
          <Text className="text-center text-text-tertiary mt-2">
            {qrCode?.qr_id && `QR Code: ${qrCode?.qrCodeNumber || qrCode?.qr_id || 'N/A'}`}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Header
        title={getHeaderTitle()}
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
        showBackButton={true}
        containerStyle='flex-row bg-white pt-3 py-2 px-4'
        showRightIcon={true}
        customRightIconComponent={
          <DownloadIcon width={24} height={24} fill="#555" />
        }
        onRightIconPress={handleDownloadPDF}
      />
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>

      <ScrollView
        className="flex-1 px-4 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* QR Code Information Card */}
        {status === 'qrcode' && (
          <View className="bg-white rounded-2xl p-4 mt-4 shadow-sm border border-gray-200">
            <Text className="text-lg font-bold text-text-primary mb-3">QR Code Information</Text>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-text-secondary">QR Code Number</Text>
              <View className="flex-row items-center">
                <Text className="text-text-primary font-semibold">{qrCode?.qrCodeNumber || qrCode?.qr_id || 'N/A'}</Text>
                <TouchableOpacity
                  onPress={() => {
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
        )}

        {/* Complaint Details Card */}
        <View className="bg-white rounded-2xl p-4 mb-4 mt-4 shadow-sm border border-gray-200">
          <Text className="text-lg font-bold text-text-primary mb-3">Complaint Details</Text>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-text-secondary text-sm">Complaint ID</Text>
              <Text className="text-text-primary font-semibold text-base">#{complaintDetails.id}</Text>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-text-secondary text-sm">CSN Number</Text>
              <Text className="text-text-primary font-semibold text-base">{complaintDetails.csn || 'N/A'}</Text>
            </View>
          </View>

          <View className="mb-3">
            <Text className="text-text-secondary text-sm">Service</Text>
            <Text className="text-text-primary font-semibold text-base">{complaintDetails.service_name || complaintDetails.service || 'N/A'}</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-text-secondary text-sm">Customer Name</Text>
              <Text className="text-text-primary font-semibold text-base">{complaintDetails.customer_name || 'N/A'}</Text>
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-text-secondary text-sm">Customer Mobile</Text>
              <TouchableOpacity
                onPress={() => handleCallPress(complaintDetails.customer_mobile)}
                className="flex-row items-center"
              >
                <Icon name="call-outline" size={16} color="#58A890" />
                <Text className="text-primary-sage600 ml-2 font-semibold text-base">{complaintDetails.customer_mobile || 'N/A'}</Text>
              </TouchableOpacity>
            </View>
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

          <View className="flex-row justify-between mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-text-secondary text-sm">Rating</Text>
              {complaintDetails.rating ? (
                <View className="flex-row items-center">
                  <Text className={`font-semibold text-base ${getRatingColor(complaintDetails.rating)}`}>
                    {formatRating(complaintDetails.rating)}
                  </Text>
                  <Icon name="star" size={16} color="#F0B27A" className="ml-1" />
                </View>
              ) : (
                <Text className="text-text-primary">N/A</Text>
              )}
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-text-secondary text-sm">Remark</Text>
              <Text className="text-text-primary italic" numberOfLines={2}>
                {complaintDetails.remark || 'No remarks'}
              </Text>
            </View>
          </View>

          {complaintDetails.review && complaintDetails.review !== 'A' && (
            <View className="mb-3">
              <Text className="text-text-secondary text-sm">Review</Text>
              <Text className="text-text-primary">{complaintDetails.review}</Text>
            </View>
          )}

          {complaintDetails.invoice && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <TouchableOpacity
                onPress={handleDownloadPDF}
                disabled={downloading}
                className="flex-row items-center justify-center bg-primary-sage600 py-3 rounded-xl"
              >
                {downloading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Icon name="document-text-outline" size={20} color="#ffffff" />
                    <Text className="text-white font-semibold ml-2">Download Invoice PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Commission Card */}
        {complaintDetails.commission && complaintDetails.commission.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-200">
            <TouchableOpacity
              onPress={() => setExpandedCommission(!expandedCommission)}
              className="flex-row justify-between items-center mb-3"
            >
              <Text className="text-lg font-bold text-text-primary">Commission Details</Text>
              <Icon name={expandedCommission ? "chevron-up-outline" : "chevron-down-outline"} size={20} color="#666" />
            </TouchableOpacity>

            {!expandedCommission && renderCommissionRow()}
            {expandedCommission && renderMultipleCommissionRows()}

            {complaintDetails.commission.length > 1 && (
              <TouchableOpacity
                onPress={() => setExpandedCommission(!expandedCommission)}
                className="mt-3 items-center pt-2 border-t border-gray-100"
              >
                <Text className="text-primary-sage600 font-semibold">
                  {expandedCommission ? 'Show Less' : `View All (${complaintDetails.commission.length} entries)`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

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
            <Text className="text-text-primary font-semibold">{complaintDetails.verify_otp === "1" ? 'Yes' : 'No'}</Text>
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

      {/* Dialog Box Component */}
      <DialogBox
        visible={dialogVisible}
        onClose={closeDialog}
        title={dialogConfig.title}
        size="md"
        showCloseButton={true}
        closeOnBackdropPress={false}
      >
        <View className="py-2">
          <Text className="text-gray-700 text-base leading-6 mb-4">
            {dialogConfig.message}
          </Text>
          
          <View className="flex-row space-x-3 mt-2">
            <TouchableOpacity
              onPress={closeDialog}
              className="flex-1 bg-gray-200 py-3 rounded-lg"
            >
              <Text className="text-gray-700 font-semibold text-center">Close</Text>
            </TouchableOpacity>
            
            {dialogConfig.onConfirm && (
              <TouchableOpacity
                onPress={handleDialogAction}
                className="flex-1 bg-primary-sage600 py-3 rounded-lg"
              >
                <Text className="text-white font-semibold text-center">Open PDF</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </DialogBox>
    </SafeAreaView>
  );
};

export default QRCodeDetails;

const styles = StyleSheet.create({});