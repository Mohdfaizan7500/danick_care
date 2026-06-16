import { Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Image, Dimensions, Modal, Alert, Platform, PermissionsAndroid, ToastAndroid, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { useRoute, useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { GetAMCDetails } from '../../lib/api'
import Icon from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Header from '../../components/Header'
import ReactNativeBlobUtil from 'react-native-blob-util'
import { toast, Toaster } from 'sonner-native'
import StatusMessage from '../../components/StatusMessage';
import DialogBox from '../../components/DilaogBox';
import Clipboard from '@react-native-clipboard/clipboard';
import { useAuth } from '../../context/AuthContext'
import { UserIcon } from '../../assets/svgIcons/SVGIcons'

const { width, height } = Dimensions.get('window')

const CompleteAMCDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { imagUrl } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [amcDetails, setAmcDetails] = useState(null);
    const [error, setError] = useState(null);
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
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

    const amcData = route.params?.amcData;
    const id = amcData?.id;

    // Helper to get full image URL
    const getFullImageUrl = (imagePath) => {
        if (!imagePath) return null;
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
        const base = imagUrl?.endsWith('/') ? imagUrl : `${imagUrl}/`;
        return `${base}${cleanPath}`;
    };

    // Copy to clipboard function (only for CSN and AMC ID now)
    const copyToClipboard = (text, label) => {
        Clipboard.setString(text);
        ToastAndroid.show('Copied!', ToastAndroid.SHORT);
    };

    // Handle phone number press - but phone is masked, so we won't call this anymore
    const handlePhonePress = (phoneNumber) => {
        if (phoneNumber && phoneNumber !== 'N/A') {
            Linking.openURL(`tel:${phoneNumber}`);
        } else {
            toast.custom(
                <StatusMessage 
                    type='error' 
                    title='Cannot Call' 
                    message='Phone number is not available' 
                />
            );
        }
    };

    // Check if Android 13+ (API 33+)
    const isAndroid13OrAbove = () => {
        return Platform.OS === 'android' && Platform.Version >= 33;
    };

    // Request storage permission on mount
    const requestStoragePermissionOnMount = async () => {
        if (Platform.OS === 'android') {
            try {
                let granted = false;

                if (isAndroid13OrAbove()) {
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
            setHasStoragePermission(true);
        }
    };

    // Request storage permission for download
    const requestStoragePermissionForDownload = async () => {
        if (Platform.OS === 'android') {
            try {
                if (isAndroid13OrAbove()) {
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

    const handleDialogAction = async () => {
        if (dialogConfig.onConfirm) {
            await dialogConfig.onConfirm();
        }
        closeDialog();
    };

    // Open PDF file
    const openPDF = async (filePath) => {
        try {
            if (Platform.OS === 'android') {
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

    // Download functions
    const downloadWithDownloadManager = async (downloadUrl, fileName, destinationPath) => {
        try {
            const isAndroidQOrAbove = Platform.Version >= 29;

            const downloadOptions = {
                path: destinationPath,
                description: `Downloading invoice ${fileName}`,
                title: fileName,
                useDownloadManager: true,
                mediaScannable: true,
                notification: true,
            };

            if (isAndroidQOrAbove) {
                downloadOptions.mime = 'application/pdf';
            }

            const configOptions = {
                fileCache: false,
                path: destinationPath,
                appendExt: 'pdf',
                addAndroidDownloads: downloadOptions,
            };

            const response = await ReactNativeBlobUtil
                .config(configOptions)
                .fetch('GET', downloadUrl);

            return response.path();
        } catch (error) {
            console.error('DownloadManager error:', error);
            throw error;
        }
    };

    const downloadDirectly = async (downloadUrl, filePath) => {
        const response = await ReactNativeBlobUtil.config({
            fileCache: false,
            path: filePath,
            overwrite: true,
        }).fetch('GET', downloadUrl);
        return response.path();
    };

    const handleDownloadInvoice = async () => {
        const invoiceUrl = amcDetails?.invoice;
        if (!invoiceUrl) {
            toast.custom(<StatusMessage type='error' title='No Invoice Found' message='No PDF invoice available for this AMC' />);
            return;
        }
        const isValidUrl = (url) => {
            if (!url) return false;
            const urlPattern = /^(https?:\/\/|ftp:\/\/|file:\/\/)/i;
            return urlPattern.test(url);
        };
        if (!isValidUrl(invoiceUrl)) {
            toast.custom(<StatusMessage type='error' title='Download Link Not Available' message='The invoice data is not a valid download link.' />);
            return;
        }
        if (downloading) {
            toast.custom(<StatusMessage type='info' title='Download in progress' message='Please wait...' />);
            return;
        }
        try {
            setDownloading(true);
            let permissionGranted = hasStoragePermission;
            if (!permissionGranted && Platform.OS === 'android') {
                permissionGranted = await requestStoragePermissionForDownload();
                if (permissionGranted) setHasStoragePermission(true);
            }
            if (!permissionGranted) {
                toast.custom(<StatusMessage type='error' title='Permission Denied' message='Cannot download PDF without storage permission.' />);
                setDownloading(false);
                return;
            }
            toast.custom(<StatusMessage type='info' title='Downloading' message='Downloading PDF...' />);
            const timestamp = new Date().getTime();
            const fileName = `AMC_Invoice_${amcDetails.csn || amcDetails.id}_${timestamp}.pdf`;
            let finalPath = '';
            if (Platform.OS === 'android') {
                const { fs } = ReactNativeBlobUtil;
                const downloadPath = `${fs.dirs.DownloadDir}/${fileName}`;
                try {
                    finalPath = await downloadWithDownloadManager(invoiceUrl, fileName, downloadPath);
                } catch (dmError) {
                    finalPath = await downloadDirectly(invoiceUrl, downloadPath);
                }
                const exists = await fs.exists(finalPath);
                if (exists) {
                    toast.custom(<StatusMessage type='success' title='Download Complete' message={`PDF saved to Downloads folder`} />);
                    showDialog('Download Complete', `PDF "${fileName}" has been downloaded successfully!\n\nSaved to: Downloads folder`, fileName, finalPath, () => openPDF(finalPath));
                } else {
                    throw new Error('File not found after download');
                }
            } else {
                const { fs } = ReactNativeBlobUtil;
                const documentsDir = fs.dirs.DocumentDir;
                const downloadPath = `${documentsDir}/${fileName}`;
                finalPath = await downloadDirectly(invoiceUrl, downloadPath);
                toast.custom(<StatusMessage type='success' title='Download Complete' message='PDF downloaded successfully!' />);
                showDialog('Download Complete', `PDF "${fileName}" has been downloaded successfully!`, fileName, finalPath, () => openPDF(finalPath));
            }
        } catch (error) {
            console.error('PDF Download Error:', error);
            toast.custom(<StatusMessage type='error' title='Download Failed' message='Unable to download PDF. Please check your internet connection and try again.' />);
        } finally {
            setDownloading(false);
        }
    };

    const fetchAMCDetails = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            setError(null);
            const payload = { id: id };
            console.log('Fetching AMC details with payload:', payload);
            const response = await GetAMCDetails(payload);
            console.log('AMC Details Response:', response?.data);
            if (response?.data?.success && response?.data?.result) {
                setAmcDetails(response.data.result);
            } else {
                setError('Failed to load AMC details');
            }
        } catch (err) {
            console.error('Error fetching AMC details:', err);
            setError(err.message || 'Failed to load AMC details');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAMCDetails(true);
    }, [id]);

    useEffect(() => {
        if (id) fetchAMCDetails();
    }, [id]);

    useEffect(() => {
        requestStoragePermissionOnMount();
    }, []);

    const handleViewImage = (imageUrl) => {
        setSelectedImage(getFullImageUrl(imageUrl));
        setImageModalVisible(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return { bg: '#10B981', text: 'Completed', icon: 'check-circle', color: '#10B981', bgLight: '#D1FAE5' };
            case 'pending':
                return { bg: '#F59E0B', text: 'Pending', icon: 'clock', color: '#F59E0B', bgLight: '#FEF3C7' };
            case 'cancelled':
                return { bg: '#EF4444', text: 'Cancelled', icon: 'cancel', color: '#EF4444', bgLight: '#FEE2E2' };
            default:
                return { bg: '#6B7280', text: status || 'Unknown', icon: 'help-circle', color: '#6B7280', bgLight: '#F3F4F6' };
        }
    };

    // Render related complaints with navigation on tap (only when status is 'success')
    const renderRelatedComplaints = () => {
        if (!amcDetails?.RelatedComplaint || amcDetails.RelatedComplaint.length === 0) {
            return null;
        }

        return (
            <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Related Complaints</Text>
                {amcDetails.RelatedComplaint.map((complaint, index) => {
                    const statusObj = getStatusColor(complaint.status);
                    const isCompleted = complaint.status === 'success';

                    return (
                        <TouchableOpacity
                            key={complaint.id || index}
                            activeOpacity={isCompleted ? 0.7 : 1}
                            onPress={() => {
                                if (isCompleted) {
                                    navigation.navigate('QRCodeDetails', {
                                        complaint: { id: complaint.id },
                                        status: 'complaint'
                                    });
                                } else {
                                    toast.custom(
                                        <StatusMessage
                                            type='info'
                                            title='Not Available'
                                            message='Complaint details can only be viewed when status is Completed.'
                                        />
                                    );
                                }
                            }}
                            className="mb-3"
                        >
                            <View 
                                className="flex-row items-center p-3 rounded-xl"
                                style={{ 
                                    backgroundColor: statusObj.bgLight,
                                    borderWidth: 1,
                                    borderColor: statusObj.color + '30'
                                }}
                            >
                                <View className="w-10 h-10 rounded-full justify-center items-center mr-3" style={{ backgroundColor: statusObj.color + '20' }}>
                                    <MaterialCommunityIcons name={statusObj.icon} size={20} color={statusObj.color} />
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-sm font-semibold text-gray-800">Complaint #{complaint.id}</Text>
                                        <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: statusObj.bgLight }}>
                                            <Text className="text-xs font-semibold" style={{ color: statusObj.color }}>
                                                {statusObj.text}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center mt-1">
                                        <MaterialCommunityIcons name="calendar" size={12} color="#6B7280" />
                                        <Text className="text-xs text-gray-500 ml-1">{complaint.sloat_date}</Text>
                                        <MaterialCommunityIcons name="clock-outline" size={12} color="#6B7280" className="ml-3" />
                                        <Text className="text-xs text-gray-500 ml-1">{complaint.time_sloat}</Text>
                                    </View>
                                </View>
                                {isCompleted && (
                                    <MaterialCommunityIcons name="chevron-right" size={20} color="#6B7280" />
                                )}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    const renderParts = () => {
        if (!amcDetails?.parts || amcDetails.parts.length === 0) return null;
        return (
            <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Parts Information</Text>
                {amcDetails.parts.map((part, index) => {
                    const imageUrl = getFullImageUrl(part.part_image);
                    return (
                        <View key={part.id || index} className="bg-gray-50 rounded-xl p-3 mb-2">
                            <View className="flex-row items-center">
                                {imageUrl ? (
                                    <TouchableOpacity onPress={() => handleViewImage(part.part_image)}>
                                        <Image source={{ uri: imageUrl }} className="w-12 h-12 rounded-lg mr-3" resizeMode="cover" />
                                    </TouchableOpacity>
                                ) : (
                                    <View className="w-12 h-12 rounded-lg mr-3 bg-gray-200 items-center justify-center">
                                        <MaterialCommunityIcons name="image-off" size={24} color="#9CA3AF" />
                                    </View>
                                )}
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold text-gray-800">{part.part_name}</Text>
                                    <Text className="text-xs text-gray-500 mt-1">QR Code: {part.qr_code}</Text>
                                </View>
                                <Text className="text-sm font-bold text-indigo-600">₹{parseFloat(part.part_price || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderCommission = () => {
        if (!amcDetails?.commission || amcDetails.commission.length === 0) return null;
        const commission = amcDetails.commission[0];
        return (
            <View className="bg-white rounded-2xl p-4 mb-4">
                <Text className="text-lg font-semibold text-gray-800 mb-3">Commission Details</Text>
                <View className="bg-indigo-50 rounded-xl p-4">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-gray-600">Total Amount:</Text>
                        <Text className="text-sm font-semibold text-gray-800">₹{parseFloat(commission.fund || 0).toFixed(2)}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-gray-600">Technician Fund:</Text>
                        <Text className="text-sm font-semibold text-emerald-600">₹{parseFloat(commission.tech_fund || 0).toFixed(2) }</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-gray-600">Admin Fund:</Text>
                        <Text className="text-sm font-semibold text-blue-600">₹{parseFloat(commission.admin_fund || 0).toFixed(2)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header title="AMC Details" />
                <View className="absolute inset-0 z-50 pointer-events-none"><Toaster /></View>
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text className="mt-3 text-base text-gray-500">Loading AMC details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <Header title="AMC Details" />
                <View className="absolute inset-0 z-50 pointer-events-none"><Toaster /></View>
                <View className="flex-1 justify-center items-center px-8">
                    <MaterialCommunityIcons name="alert-circle" size={80} color="#EF4444" />
                    <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">Oops! Something went wrong</Text>
                    <Text className="text-sm text-gray-500 text-center mb-6">{error}</Text>
                    <TouchableOpacity onPress={() => fetchAMCDetails()} className="flex-row items-center bg-indigo-600 px-6 py-3 rounded-xl gap-2">
                        <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
                        <Text className="text-base font-semibold text-white">Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    if (!amcDetails) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <Header title="AMC Details" />
                <View className="absolute inset-0 z-50 pointer-events-none"><Toaster /></View>
                <View className="flex-1 justify-center items-center">
                    <MaterialCommunityIcons name="file-document-outline" size={80} color="#D1D5DB" />
                    <Text className="text-lg font-semibold text-gray-800 mt-4">No data available</Text>
                </View>
            </SafeAreaView>
        );
    }

    const status = getStatusColor(amcDetails.status);

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Header title="AMC Details" />
            <View className="absolute inset-0 z-50 pointer-events-none"><Toaster /></View>

            <ScrollView 
                className="flex-1 bg-gray-50" 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#6366F1']}
                        tintColor="#6366F1"
                        title="Pull to refresh"
                        titleColor="#6366F1"
                    />
                }
            >
                <View className="p-4">
                    {/* Header Card */}
                    <View className="bg-white rounded-2xl p-4 mb-4">
                        <View className="flex-row justify-between items-start mb-3">
                            <View className="flex-1">
                                <Text className="text-xs text-gray-500 mb-1">CSN Number</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-xl font-bold text-gray-800">{amcDetails.csn}</Text>
                                    <TouchableOpacity onPress={() => copyToClipboard(amcDetails.csn, 'CSN Number')} className="ml-2">
                                        <MaterialCommunityIcons name="content-copy" size={18} color="#6366F1" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View className={`px-3 py-1.5 rounded-full`} style={{ backgroundColor: status.bgLight }}>
                                <View className="flex-row items-center gap-1">
                                    <MaterialCommunityIcons name={status.icon} size={14} color={status.color} />
                                    <Text className="text-xs font-semibold" style={{ color: status.color }}>{status.text}</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                            <Text className="text-xs text-gray-500">AMC ID: #{amcDetails.id}</Text>
                            <TouchableOpacity onPress={() => copyToClipboard(amcDetails.id.toString(), 'AMC ID')} className="ml-2">
                                <MaterialCommunityIcons name="content-copy" size={16} color="#6366F1" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Customer Information - masked name & phone */}
                    <View className="bg-white rounded-2xl p-4 mb-4">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">Customer Information</Text>
                        <View className="flex-row items-center mb-3">
                            <View className="w-12 h-12 rounded-full bg-teal-500 justify-center items-center mr-3">
                                <UserIcon stroke={'#fff'}/>
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-semibold text-gray-800">****</Text>
                                <View className="flex-row items-center mt-1">
                                    <Text className="text-sm text-teal-600 font-medium">****</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row items-start mt-2 pt-2 border-t border-gray-100">
                            <MaterialCommunityIcons name="map-marker" size={16} color="#EF4444" />
                            <Text className="text-sm text-gray-600 ml-2 flex-1">{amcDetails.service_address}</Text>
                        </View>
                    </View>

                    {/* Service Details */}
                    <View className="bg-white rounded-2xl p-4 mb-4">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">Service Details</Text>
                        <View className="mb-2">
                            <Text className="text-xs text-gray-500 mb-1">Service Type</Text>
                            <Text className="text-sm font-medium text-gray-800">{amcDetails.service}</Text>
                        </View>
                        <View>
                            <Text className="text-xs text-gray-500 mb-1">Service Name</Text>
                            <Text className="text-sm text-gray-800">{amcDetails.service_name}</Text>
                        </View>
                    </View>

                    {/* Slot Information */}
                    {(amcDetails.slot_date || amcDetails.slot_time) && (
                        <View className="bg-white rounded-2xl p-4 mb-4">
                            <Text className="text-lg font-semibold text-gray-800 mb-3">Slot Information</Text>
                            <View className="flex-row items-center bg-amber-50 p-3 rounded-xl">
                                <MaterialCommunityIcons name="calendar-clock" size={20} color="#F59E0B" />
                                <View className="ml-3 flex-1">
                                    <Text className="text-sm font-semibold text-amber-800">{amcDetails.slot_date}</Text>
                                    <Text className="text-xs text-amber-600 mt-0.5">{amcDetails.slot_time}</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Payment Details */}
                    <View className="bg-white rounded-2xl p-4 mb-4">
                        <Text className="text-lg font-semibold text-gray-800 mb-3">Payment Details</Text>
                        <View className="bg-gray-50 p-3 rounded-xl">
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-sm text-gray-600">Total Amount:</Text>
                                <Text className="text-sm font-semibold text-gray-800">₹{parseFloat(amcDetails.tot_amt || 0).toFixed(2)}</Text>
                            </View>
                            {amcDetails.discount && amcDetails.discount !== '0' && (
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-sm text-gray-600">Discount:</Text>
                                    <Text className="text-sm font-semibold text-emerald-600">-₹{parseFloat(amcDetails.discount || 0).toFixed(2)}</Text>
                                </View>
                            )}
                            {amcDetails.platform_fee && (
                                <View className="flex-row justify-between pt-2 border-t border-gray-200">
                                    <Text className="text-sm text-gray-600">Platform Fee:</Text>
                                    <Text className="text-sm font-semibold text-gray-800">₹{parseFloat(amcDetails.platform_fee || 0).toFixed(2)}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Download Invoice Button */}
                    {/* {amcDetails.invoice && (
                        <View className="mb-4">
                            <TouchableOpacity onPress={handleDownloadInvoice} disabled={downloading} className="flex-row items-center justify-center bg-teal-500 py-3 rounded-xl">
                                {downloading ? <ActivityIndicator size="small" color="#ffffff" /> : (
                                    <>
                                        <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
                                        <Text className="text-white font-semibold ml-2">Download Invoice PDF</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )} */}

                    {/* Parts Information */}
                    {renderParts()}

                    {/* Commission Details */}
                    {renderCommission()}

                    {/* Related Complaints */}
                    {renderRelatedComplaints()}

                    {/* Review & Remark */}
                    {(amcDetails.review || amcDetails.remark) && (
                        <View className="bg-white rounded-2xl p-4 mb-4">
                            <Text className="text-lg font-semibold text-gray-800 mb-3">Feedback</Text>
                            {amcDetails.review && (
                                <View className="flex-row items-center bg-amber-50 p-3 rounded-xl mb-2">
                                    <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
                                    <Text className="text-sm text-amber-800 ml-2">Rating: {amcDetails.review}</Text>
                                </View>
                            )}
                            {amcDetails.remark && (
                                <View className="bg-gray-50 p-3 rounded-xl">
                                    <MaterialCommunityIcons name="comment-text-outline" size={16} color="#6B7280" />
                                    <Text className="text-sm text-gray-600 mt-1">{amcDetails.remark}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {/* Uploaded Image */}
                    {amcDetails.upload_image && (
                        <View className="bg-white rounded-2xl p-4 mb-4">
                            <Text className="text-lg font-semibold text-gray-800 mb-3">Uploaded Image</Text>
                            <TouchableOpacity onPress={() => handleViewImage(amcDetails.upload_image)} className="relative">
                                <Image source={{ uri: getFullImageUrl(amcDetails.upload_image) }} className="w-full h-48 rounded-xl" resizeMode="cover" />
                                <View className="absolute inset-0 bg-black/30 rounded-xl justify-center items-center">
                                    <MaterialCommunityIcons name="eye" size={40} color="#FFFFFF" />
                                    <Text className="text-white font-semibold mt-2">Tap to View</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Recomplaint Badge */}
                    {amcDetails.recomplaint && amcDetails.recomplaint !== '0' && (
                        <View className="bg-red-50 rounded-2xl p-4 mb-4 flex-row items-center justify-center">
                            <MaterialCommunityIcons name="alert-circle" size={24} color="#EF4444" />
                            <Text className="text-base font-semibold text-red-600 ml-2">Recomplaint Active</Text>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Image Modal - White square view box */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={imageModalVisible}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-white rounded-2xl w-11/12 max-h-[80%] overflow-hidden">
                        <View className="flex-row justify-end p-2">
                            <TouchableOpacity onPress={() => setImageModalVisible(false)} className="p-2">
                                <MaterialCommunityIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <View className="p-4 pt-0 items-center justify-center">
                            {selectedImage && (
                                <Image
                                    source={{ uri: selectedImage }}
                                    className="w-full h-80 rounded-lg"
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </View>
                </View>
            </Modal>

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
                    <Text className="text-gray-700 text-base leading-6 mb-4">{dialogConfig.message}</Text>
                    <View className="flex-row gap-5 mt-2">
                        <TouchableOpacity onPress={closeDialog} className="flex-1 bg-gray-200 py-3 rounded-lg">
                            <Text className="text-gray-700 font-semibold text-center">Close</Text>
                        </TouchableOpacity>
                        {dialogConfig.onConfirm && (
                            <TouchableOpacity onPress={handleDialogAction} className="flex-1 bg-indigo-600 py-3 rounded-lg">
                                <Text className="text-white font-semibold text-center">Open PDF</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </DialogBox>
        </SafeAreaView>
    )
}

export default CompleteAMCDetails