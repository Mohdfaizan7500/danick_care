// QRCodes.js
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Image,
    Modal,
    ScrollView,
    LayoutAnimation,
    ActivityIndicator,
    TextInput,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '../../../components/Header';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import DialogBox from '../../../components/DilaogBox';
import { useAuth } from '../../../context/AuthContext';
import Clipboard from '@react-native-clipboard/clipboard';
import StatusMessage from '../../../components/StatusMessage';
import { AssignQRCodeList, AssignQRCodeCount } from '../../../lib/api';
import NetInfo from '@react-native-community/netinfo';
import NoInternet from '../../NoInternet';


// Tabs - Updated for QR Codes
const TABS = ['All QR', 'Used QR', 'Fresh QR'];

// Skeleton component for loading state
const SkeletonCard = () => (
    <View className="bg-white border border-gray-300 rounded-2xl p-4 mb-3">
        <View className="flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
                <View className="w-20 h-20 bg-gray-200 rounded-xl" />
                <View className="ml-4 flex-1">
                    <View className="h-5 w-32 bg-gray-200 rounded mb-2" />
                    <View className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <View className="h-3 w-40 bg-gray-200 rounded" />
                </View>
            </View>
            <View className="h-6 w-16 bg-gray-200 rounded" />
        </View>
    </View>
);

// Map status to tab name
const getTabFromStatus = (status) => {
    switch (status) {
        case 'AllQRCodes':
            return 'All QR';
        case 'Used':
            return 'Used QR';
        case 'Fresh':
            return 'Fresh QR';
        default:
            return 'All QR';
    }
};

// Get API status parameter based on tab
const getApiStatusParam = (tab) => {
    switch (tab) {
        case 'All QR':
            return '';
        case 'Used QR':
            return '1'; // Used QR codes
        case 'Fresh QR':
            return '0'; // Fresh QR codes
        default:
            return '';
    }
};

const QRCodes = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const status = route.params?.status || null;
    console.log('QRCodes route params:', route.params);

    // Internet connection state
    const [isConnected, setIsConnected] = useState(true);

    // Set initial tab based on status param
    const initialTab = getTabFromStatus(status);
    const [selectedTab, setSelectedTab] = useState(initialTab);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [tabPositions, setTabPositions] = useState([]);
    const scrollViewRef = useRef(null);
    const [loadingItemId, setLoadingItemId] = useState(null);
    const [products, setProducts] = useState([]);
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [qrCounts, setQrCounts] = useState({
        all: 0,
        used: 0,
        fresh: 0
    });
    const tabTimeoutRef = useRef(null);
    const { user, imagUrl } = useAuth();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Monitor internet connection
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected ?? false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch QR code counts from API
    const fetchQRCodeCounts = async () => {
        // Don't fetch if offline
        if (!isConnected) return;

        try {
            const technicianId = user?.id?.toString() || '1';
            const payload = {
                technician_id: technicianId
            };

            console.log('Fetch QR counts payload:', payload);
            const response = await AssignQRCodeCount(payload);
            console.log('QR Counts Response:', response?.data);

            if (response?.data?.success) {
                setQrCounts({
                    all: response.data.all || 0,
                    used: response.data.used || 0,
                    fresh: response.data.unused || 0 // Note: API returns 'unused' for fresh QR codes
                });
            } else {
                console.log('Failed to fetch QR counts');
            }
        } catch (error) {
            console.log('fetch QR code counts error:', error);
        }
    };

    // Fetch QR data from API
    const fetchQRData = async (tab, isRefresh = false) => {
        // Don't fetch if offline
        if (!isConnected) {
            setIsTabLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            if (!isRefresh) {
                setIsTabLoading(true);
            }

            const technicianId = user?.id?.toString() || '1';
            const statusParam = getApiStatusParam(tab);

            const payload = {
                technician_id: technicianId,
                status: statusParam
            };

            console.log('Fetch QR data payload:', payload);
            const response = await AssignQRCodeList(payload);
            console.log('API Response:', response?.data);

            if (response?.data?.success) {
                const apiData = response.data.data || [];

                // Transform API data to match component structure
                const formattedProducts = apiData.map((item, index) => ({
                    id: item.qr_id || index.toString(),
                    qrCodeNumber: item.qr_id,
                    complaintId: item.complaint_id || 'N/A',
                    partName: item.part_name || 'Spare Part',
                    status: item.complaint_id ? 'used' : 'fresh', // Determine status based on complaint_id
                    imageUrl: item.qr_img ? `${imagUrl}${item.qr_img}` : null,
                    qr_img: item.qr_img,

                }));

                setProducts(formattedProducts);

                // Also fetch counts to ensure they're up to date
                await fetchQRCodeCounts();
            } else {
                toast.custom(
                    <StatusMessage type='error' title={response?.data?.message || 'Failed to load QR codes'} />
                );
                setProducts([]);
            }

        } catch (error) {
            console.log('fetch QR data error:', error);
            toast.custom(
                <StatusMessage type='error' title='Failed to load QR codes' description={error.message} />
            );
            setProducts([]);
        } finally {
            setIsTabLoading(false);
            setRefreshing(false);
        }
    };

    // Filter products based on search query
    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) {
            return products;
        }

        const query = searchQuery.toLowerCase().trim();
        return products.filter(item =>
            item.qrCodeNumber?.toLowerCase().includes(query) ||
            item.complaintId?.toLowerCase().includes(query) ||
            item.partName?.toLowerCase().includes(query) ||
            item.customerName?.toLowerCase().includes(query) ||
            item.technicianName?.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (tabTimeoutRef.current) clearTimeout(tabTimeoutRef.current);
        };
    }, []);

    // Fetch counts when component mounts
    useEffect(() => {
        if (isConnected) {
            fetchQRCodeCounts();
        }
    }, [isConnected]);

    // Fetch data when tab changes
    useEffect(() => {
        if (isConnected) {
            fetchQRData(selectedTab);
        }
        // Clear search when changing tabs
        setSearchQuery('');
    }, [selectedTab, isConnected]);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            if (isConnected) {
                fetchQRData(selectedTab);
                fetchQRCodeCounts();
            }
        }, [selectedTab, isConnected])
    );

    // Pull to refresh handler
    const onRefresh = useCallback(async () => {
        if (!isConnected) {
            // If offline, just check connection again
            const state = await NetInfo.fetch();
            setIsConnected(state.isConnected ?? false);
            return;
        }

        setRefreshing(true);
        await Promise.all([
            fetchQRData(selectedTab, true),
            fetchQRCodeCounts()
        ]);
    }, [selectedTab, isConnected]);

    // Retry connection handler
    const handleRetry = async () => {
        const state = await NetInfo.fetch();
        const connected = state.isConnected ?? false;
        setIsConnected(connected);

        if (connected) {
            toast.custom(
                <StatusMessage type='success' title='Connection Restored' />,
                { duration: 1500 }
            );
            // Refresh data when connection is restored
            await Promise.all([
                fetchQRData(selectedTab, true),
                fetchQRCodeCounts()
            ]);
        }
    };

    // Confirmation dialog state
    const [confirmVisible, setConfirmVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [confirmItem, setConfirmItem] = useState(null);

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const handleTabPress = (tab, index) => {
        setSelectedTab(tab);
        // Clear search when changing tabs
        setSearchQuery('');

        // Scroll to tab
        if (scrollViewRef.current && tabPositions[index] !== undefined) {
            scrollViewRef.current.scrollTo({
                x: tabPositions[index] - 20,
                animated: true,
            });
        }
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    };

    const handleCardPress = (item) => {
        if (item.complaintId && item.complaintId !== 'N/A') {
            navigation.navigate('QRCodeDetails', { qrData: item, status: "qrcode" });
        }
        else {
            toast.custom(
                <StatusMessage type='info' title='No Complaint Linked' message='This QR code is not linked to any complaint.' />
            );
        }
    };

    // Open confirmation dialog
    const openConfirmation = (action, item) => {
        setConfirmAction(action);
        setConfirmItem(item);
        setConfirmVisible(true);
    };

    // Remove item from products list
    const removeItem = (itemId) => {
        setProducts(prev => prev.filter(p => p.id !== itemId));
        // Update counts locally
        setQrCounts(prev => ({
            ...prev,
            all: prev.all - 1,
            [selectedTab === 'Used QR' ? 'used' : 'fresh']: selectedTab === 'Used QR' ? prev.used - 1 : prev.fresh - 1
        }));
    };

    // Handle confirmed action
    const handleConfirmed = async () => {
        setConfirmVisible(false);
        if (!confirmItem || !confirmAction) return;

        setLoadingItemId(confirmItem.id);

        try {
            let successMessage = '';

            switch (confirmAction) {
                case 'markAsUsed':
                    // Mark QR as used - you can implement API call here
                    successMessage = `QR Code ${confirmItem.qrCodeNumber} marked as used successfully`;
                    removeItem(confirmItem.id);
                    // Refresh counts after action
                    await fetchQRCodeCounts();
                    break;

                case 'delete':
                    // Delete QR code - you can implement API call here
                    successMessage = `QR Code ${confirmItem.qrCodeNumber} deleted successfully`;
                    removeItem(confirmItem.id);
                    // Refresh counts after action
                    await fetchQRCodeCounts();
                    break;

                default:
                    successMessage = 'Action completed';
            }

            if (successMessage) {
                toast.custom(<StatusMessage type='success' title={successMessage} />);
            }

        } catch (error) {
            console.log(`${confirmAction} error:`, error);
            toast.error(error.message || 'Action failed. Please try again.');
        } finally {
            setLoadingItemId(null);
            setConfirmItem(null);
            setConfirmAction(null);
        }
    };

    // Get dialog content based on action
    const getDialogContent = () => {
        switch (confirmAction) {
            case 'markAsUsed':
                return {
                    title: 'Mark as Used',
                    icon: 'checkmark-circle-outline',
                    iconColor: '#58A890',
                    message: 'Are you sure you want to mark this QR code as used?'
                };
            case 'delete':
                return {
                    title: 'Delete QR Code',
                    icon: 'trash-outline',
                    iconColor: '#E86F6F',
                    message: 'Are you sure you want to delete this QR code? This action cannot be undone.'
                };
            default:
                return {
                    title: 'Confirm Action',
                    icon: 'help-circle-outline',
                    iconColor: '#666',
                    message: 'Are you sure?'
                };
        }
    };

    // Render confirmation dialog footer
    const renderConfirmFooter = () => {
        const isDestructive = confirmAction === 'delete';

        return (
            <View className="flex-row justify-end space-x-2 gap-4">
                <TouchableOpacity
                    onPress={() => setConfirmVisible(false)}
                    className="px-4 py-2 rounded-lg bg-background-tertiary flex-row items-center"
                >
                    <Icon name="close-outline" size={18} color="#666" />
                    <Text className="text-text-secondary font-medium ml-1">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleConfirmed}
                    className={`px-4 py-2 rounded-lg flex-row items-center ${isDestructive ? 'bg-ui-error' :
                        confirmAction === 'markAsUsed' ? 'bg-ui-success' :
                            'bg-primary-sage600'
                        }`}
                >
                    <Icon name="checkmark-outline" size={18} color="#fff" />
                    <Text className="text-white font-medium ml-1">Confirm</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Get count for a specific tab
    const getTabCount = (tab) => {
        switch (tab) {
            case 'All QR':
                return qrCounts.all;
            case 'Used QR':
                return qrCounts.used;
            case 'Fresh QR':
                return qrCounts.fresh;
            default:
                return 0;
        }
    };

    const renderItem = ({ item }) => {
        const isLoading = loadingItemId === item.id;
        const isFreshTab = selectedTab === 'Fresh QR';
        const isUsedTab = selectedTab === 'Used QR';
        const isAllTab = selectedTab === 'All QR';

        // Handle QR code copy
        const handleCopyQRCode = () => {
            Clipboard.setString(item.qrCodeNumber);
            toast.custom(
                <StatusMessage
                    type='info'
                    title='QR Code Copied!'
                    message={`QR Code: ${item.qrCodeNumber}`}
                />,
                { duration: 1000 }
            );
        };

        // Get full image URL
        const getImageUrl = () => {
            if (item.imageUrl) {
                return item.imageUrl;
            }
            if (item.qr_img) {
                return `${imagUrl}${item.qr_img}`;
            }
            return null;
        };

        return (
            <View className="bg-white border border-gray-300 rounded-2xl p-4 mb-3">
                {/* Main card content (pressable) */}
                <TouchableOpacity onPress={() => handleCardPress(item)}>
                    <View className="flex-row">
                        {/* QR Code Image */}
                        <TouchableOpacity onPress={() => openImageModal(getImageUrl())}>
                            <View className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 items-center justify-center">
                                {getImageUrl() ? (
                                    <Image
                                        source={{ uri: getImageUrl() }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Icon name="qr-code-outline" size={50} color="#000" />
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* QR Code Details */}
                        <View className="ml-4 flex-1">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-lg font-bold text-text-primary">{item.qrCodeNumber}</Text>
                                {/* Show status badge based on tab and item status */}
                                {isAllTab && item.status === 'fresh' && (
                                    <View className="bg-green-100 px-2 py-1 rounded-full">
                                        <Text className="text-green-600 text-xs font-semibold">Fresh</Text>
                                    </View>
                                )}
                                {isAllTab && item.status === 'used' && (
                                    <View className="bg-orange-100 px-2 py-1 rounded-full">
                                        <Text className="text-orange-600 text-xs font-semibold">Used</Text>
                                    </View>
                                )}
                                {isFreshTab && (
                                    <View className="bg-green-100 px-2 py-1 rounded-full">
                                        <Text className="text-green-600 text-xs font-semibold">Fresh</Text>
                                    </View>
                                )}
                                {isUsedTab && (
                                    <View className="bg-orange-100 px-2 py-1 rounded-full">
                                        <Text className="text-orange-600 text-xs font-semibold">Used</Text>
                                    </View>
                                )}
                            </View>

                            {/* Part Name */}
                            {item.partName && item.partName !== 'Spare Part' && (
                                <Text className="text-sm text-gray-700 mt-1">{item.partName}</Text>
                            )}

                            {/* Complaint ID - only show if exists */}
                            {item.complaintId && item.complaintId !== 'N/A' && (
                                <View className="flex-row items-center mt-1">
                                    <Icon name="document-text-outline" size={14} color="#666" />
                                    <Text className="text-xs text-gray-600 ml-1">
                                        Complaint ID: {item.complaintId}
                                    </Text>
                                </View>
                            )}

                            {/* Copy QR Code Button */}
                            <View className="flex-row items-center mt-2">
                                <TouchableOpacity
                                    onPress={handleCopyQRCode}
                                    className="flex-row items-center bg-gray-100 px-3 py-1 rounded-lg"
                                >
                                    <Icon name="copy-outline" size={14} color="#58A890" />
                                    <Text className="text-xs text-primary-sage600 ml-1">Copy QR</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    // Skeleton list renderer
    const renderSkeleton = () => (
        <View style={{ padding: 16 }}>
            {[1, 2, 3, 4].map((key) => (
                <SkeletonCard key={key} />
            ))}
        </View>
    );

    // If offline, show NoInternet screen
    if (!isConnected) {
        return (
            <SafeAreaView className="flex-1 bg-background-primary">
                <Header
                    title="QR Codes"
                    titlePosition="left"
                    titleStyle="font-bold text-2xl ml-5"
                    showRightIcon={false}
                    containerStyle='flex-row pt-3 py-2 px-4'
                />
                <View className="px-4 py-0 bg-background-primary">
                    <View className={`flex-row items-center bg-background-secondary rounded-xl px-3 py-0 border ${isSearchFocused ? 'border-primary-sage500' : 'border-ui-border'}`}>
                        <Icon name="search-outline" size={20} color="#999999" />
                        <TextInput
                            className="flex-1 ml-2 text-base text-text-primary"
                            placeholder="Search by QR code, complaint ID, part name..."
                            placeholderTextColor="#999999"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setIsSearchFocused(false)}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Icon name="close-circle" size={20} color="#999999" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {searchQuery.length > 0 && (
                        <Text className="text-xs text-text-tertiary mt-1 ml-1">
                            Found {filteredProducts.length} result(s)
                        </Text>
                    )}
                </View>

                {/* Filter Tabs */}
                <View className="py-2 border-b border-ui-border">
                    <ScrollView
                        ref={scrollViewRef}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="px-2"
                    >
                        {TABS.map((tab, index) => {
                            const count = getTabCount(tab);
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => handleTabPress(tab, index)}
                                    onLayout={(event) => {
                                        const layout = event.nativeEvent.layout;
                                        setTabPositions((prev) => {
                                            const newPositions = [...prev];
                                            newPositions[index] = layout.x;
                                            return newPositions;
                                        });
                                    }}
                                    className="mr-2"
                                >
                                    <View
                                        className={`px-4 py-1 rounded-full flex-row items-center ${selectedTab === tab
                                            ? 'bg-primary-sage600'
                                            : 'bg-background-tertiary'
                                            }`}
                                    >
                                        <Text
                                            className={`text-base font-semibold ${selectedTab === tab
                                                ? 'text-text-inverse'
                                                : 'text-text-secondary'
                                                }`}
                                        >
                                            {tab}
                                        </Text>

                                        <View
                                            className={`ml-1.5 px-1.5 rounded-full min-w-[20px] h-5 items-center justify-center ${selectedTab === tab
                                                ? 'bg-white/30'
                                                : 'bg-ui-border'
                                                }`}
                                        >
                                            <Text
                                                className={`text-xs font-bold ${selectedTab === tab
                                                    ? 'text-text-inverse'
                                                    : 'text-text-tertiary'
                                                    }`}
                                            >
                                                {count}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
                <NoInternet onRetry={handleRetry} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background-primary">
            <Header
                title="QR Codes"
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5"
                showRightIcon={false}
                containerStyle='flex-row pt-3 py-2 px-4'
            />
            <View className="absolute inset-0 z-50 pointer-events-none">
                <Toaster />

            </View>

            {/* Search Bar */}
            <View className="px-4 py-0 bg-background-primary">
                <View className={`flex-row items-center bg-background-secondary rounded-xl px-3 py-0 border ${isSearchFocused ? 'border-primary-sage500' : 'border-ui-border'}`}>
                    <Icon name="search-outline" size={20} color="#999999" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-text-primary"
                        placeholder="Search by QR code, complaint ID, part name..."
                        placeholderTextColor="#999999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color="#999999" />
                        </TouchableOpacity>
                    )}
                </View>
                {searchQuery.length > 0 && (
                    <Text className="text-xs text-text-tertiary mt-1 ml-1">
                        Found {filteredProducts.length} result(s)
                    </Text>
                )}
            </View>

            {/* Filter Tabs */}
            <View className="py-2 border-b border-ui-border">
                <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-2"
                >
                    {TABS.map((tab, index) => {
                        const count = getTabCount(tab);
                        return (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => handleTabPress(tab, index)}
                                onLayout={(event) => {
                                    const layout = event.nativeEvent.layout;
                                    setTabPositions((prev) => {
                                        const newPositions = [...prev];
                                        newPositions[index] = layout.x;
                                        return newPositions;
                                    });
                                }}
                                className="mr-2"
                            >
                                <View
                                    className={`px-4 py-1 rounded-full flex-row items-center ${selectedTab === tab
                                        ? 'bg-primary-sage600'
                                        : 'bg-background-tertiary'
                                        }`}
                                >
                                    <Text
                                        className={`text-base font-semibold ${selectedTab === tab
                                            ? 'text-text-inverse'
                                            : 'text-text-secondary'
                                            }`}
                                    >
                                        {tab}
                                    </Text>

                                    <View
                                        className={`ml-1.5 px-1.5 rounded-full min-w-[20px] h-5 items-center justify-center ${selectedTab === tab
                                            ? 'bg-white/30'
                                            : 'bg-ui-border'
                                            }`}
                                    >
                                        <Text
                                            className={`text-xs font-bold ${selectedTab === tab
                                                ? 'text-text-inverse'
                                                : 'text-text-tertiary'
                                                }`}
                                        >
                                            {count}
                                        </Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Conditional rendering: skeleton or list */}
            {isTabLoading ? (
                renderSkeleton()
            ) : (
                <FlatList
                    data={filteredProducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#58A890']}
                            tintColor="#58A890"
                        />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-10">
                            <Icon name="qr-code-outline" size={60} color="#CCCCCC" />
                            <Text className="text-center text-text-tertiary mt-4">
                                {searchQuery ? 'No QR codes match your search' : `No ${selectedTab.toLowerCase()} available`}
                            </Text>
                            {searchQuery && (
                                <TouchableOpacity
                                    onPress={() => setSearchQuery('')}
                                    className="mt-2 px-4 py-2 bg-primary-sage100 rounded-lg"
                                >
                                    <Text className="text-primary-sage700">Clear Search</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    }
                />
            )}

            {/* Image Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/80 justify-center items-center"
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View className="w-10/12 h-3/6 bg-white rounded-xl overflow-hidden">
                        {selectedImage && (
                            <Image
                                source={{ uri: selectedImage }}
                                className="w-full h-full"
                                resizeMode="contain"
                            />
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Confirmation Dialog */}
            <DialogBox
                visible={confirmVisible}
                onClose={() => setConfirmVisible(false)}
                title={getDialogContent().title}
                size="sm"
                footer={renderConfirmFooter()}
                closeOnBackdropPress={false}
            >
                <View className="items-center py-2">
                    <Icon
                        name={getDialogContent().icon}
                        size={48}
                        color={getDialogContent().iconColor}
                    />
                    <Text className="text-text-primary text-center mt-2">
                        {getDialogContent().message}
                    </Text>
                </View>
            </DialogBox>
        </SafeAreaView>
    );
};

export default QRCodes;