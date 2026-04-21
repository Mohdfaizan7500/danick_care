import { StyleSheet, Text, View, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, Modal, Image, Dimensions } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { useAuth } from '../../context/AuthContext'
import { TechnicianAMC } from '../../lib/api'
import Icon from 'react-native-vector-icons/MaterialIcons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from '@react-navigation/native'

const { width, height } = Dimensions.get('window')

const MyAmc = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [amcData, setAmcData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [expandedCard, setExpandedCard] = useState(null);

    console.log("user:", user);

    const handleCardPress = (item) => {
        navigation.navigate('CompleteAMCDetails', { amcData: item });
    };

    const fetchAMCData = async (page = 1, isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else if (page === 1) {
                setLoading(true);
            } else {
                setLoadingMore(true);
            }

            setError(null);

            const payload = {
                technician_id: user?.id || '1',
            };

            const params = {
                technician_id: user?.id || '1',
                page: page.toString()
            };

            console.log('Fetching AMC data with payload:', payload, 'params:', params);

            const response = await TechnicianAMC(payload, params);

            console.log('API Response:', response?.data);

            if (response?.data?.success && response?.data?.result) {
                const newData = response.data.result;
                const currentLimit = response.data.limit || 10;
                const currentPageNum = parseInt(response.data.page) || page;

                const hasMoreData = newData.length === currentLimit;

                if (isRefresh || page === 1) {
                    setAmcData(newData);
                } else {
                    setAmcData(prevData => [...prevData, ...newData]);
                }

                setHasMore(hasMoreData);
                setCurrentPage(currentPageNum);
            } else {
                setError('No data available');
                setHasMore(false);
            }
        } catch (err) {
            console.error('Error fetching AMC data:', err);
            setError(err.message || 'Failed to load AMC data');
            setHasMore(false);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const onRefresh = () => {
        fetchAMCData(1, true);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore && !refreshing) {
            fetchAMCData(currentPage + 1, false);
        }
    };

    useEffect(() => {
        fetchAMCData(1, false);
    }, []);

    const handleImagePress = (imageUrl) => {
        setSelectedImage(imageUrl);
        setModalVisible(true);
    };

    const toggleExpand = (id) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
                return { bg: '#10B981', text: 'Completed', icon: 'check-circle' };
            case 'pending':
                return { bg: '#F59E0B', text: 'Pending', icon: 'clock' };
            case 'cancelled':
                return { bg: '#EF4444', text: 'Cancelled', icon: 'cancel' };
            default:
                return { bg: '#6B7280', text: status || 'Unknown', icon: 'help-circle' };
        }
    };

    const renderFooter = () => {
        if (!loadingMore) return null;

        return (
            <View className="py-5 items-center">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="text-sm text-gray-500 mt-2">Loading more AMC records...</Text>
            </View>
        );
    };

    const renderHeader = () => {
        if (amcData.length === 0) return null;

        return (
            <View className="px-4 pt-4 pb-2">
                <View className="flex-row items-center bg-white px-4 py-3 rounded-xl shadow-sm">
                    <MaterialCommunityIcons name="file-document-outline" size={24} color="#00c0a9" />
                    <Text className="text-sm text-gray-500 ml-3">
                        Total <Text className="text-lg font-bold text-teal-600">{amcData.length}</Text> AMC Records
                    </Text>
                </View>
            </View>
        );
    };

    const renderAMCItem = ({ item, index }) => {
        const status = getStatusColor(item.status);
        const isExpanded = expandedCard === item.id;

        return (
            <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => toggleExpand(item.id)}
                className="px-4 mb-3"
            >
                <View className="bg-white rounded-2xl p-4 shadow-md">
                    {/* Header Section */}
                    <View className="flex-row justify-between items-center mb-3">
                        <View className="flex-row items-center bg-gray-100 px-2.5 py-1 rounded-lg">
                            <MaterialCommunityIcons name="barcode" size={20} color="#00c0a9" />
                            <Text className="text-sm font-semibold text-gray-800 ml-1.5">{item.csn || 'N/A'}</Text>
                        </View>
                        <View className={`flex-row items-center px-2.5 py-1 rounded-full gap-1`} style={{ backgroundColor: status.bg + '15' }}>
                            <MaterialCommunityIcons name={status.icon} size={14} color={status.bg} />
                            <Text className="text-xs font-semibold ml-1" style={{ color: status.bg }}>{status.text}</Text>
                        </View>
                    </View>

                    {/* Customer Info */}
                    <View className="flex-row items-center mb-3 pb-3 border-b border-gray-100">
                        <View className="w-12 h-12 rounded-full bg-teal-600 justify-center items-center mr-3">
                            <Text className="text-xl font-bold text-white">
                                {(item.customer_name || 'U')[0].toUpperCase()}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-gray-800 mb-1">{item.customer_name || 'N/A'}</Text>
                            <View className="flex-row items-center gap-1">
                                <Icon name="phone" size={14} color="#9CA3AF" />
                                <Text className="text-xs text-gray-500">{item.customer_mobile || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Service Info */}
                    {item.service && (
                        <View className="flex-row items-center mb-2 flex-wrap">
                            <MaterialCommunityIcons name="tools" size={16} color="#6366F1" />
                            <Text className="text-xs font-medium text-gray-500 ml-2 mr-1">Service:</Text>
                            <Text className="text-xs text-gray-800 font-medium flex-1">{item.service}</Text>
                        </View>
                    )}

                    {/* AMC Plan */}
                    {item.amc_name && (
                        <View className="flex-row items-center mb-2 flex-wrap">
                            <MaterialCommunityIcons name="shield-check" size={16} color="#10B981" />
                            <Text className="text-xs font-medium text-gray-500 ml-2 mr-1">AMC Plan:</Text>
                            <Text className="text-xs text-gray-800 font-medium flex-1" numberOfLines={1}>{item.amc_name}</Text>
                        </View>
                    )}

                    {/* Slot Info */}
                    {(item.slot_date || item.slot_time) && (
                        <View className="flex-row items-center bg-amber-50 px-2.5 py-1.5 rounded-lg mt-2">
                            <MaterialCommunityIcons name="calendar-clock" size={16} color="#F59E0B" />
                            <Text className="text-xs font-medium text-amber-700 ml-2">
                                {item.slot_date} {item.slot_time ? `• ${item.slot_time}` : ''}
                            </Text>
                        </View>
                    )}

                    {/* Expandable Section */}
                    {isExpanded && (
                        <View className="mt-3">
                            <View className="h-px bg-gray-100 my-3" />

                            {/* Amount Details */}
                            {(item.tot_amt || item.discount || item.platform_fee) && (
                                <View className="bg-gray-50 p-3 rounded-xl mb-3">
                                    <Text className="text-sm font-semibold text-gray-800 mb-2">Payment Details</Text>
                                    {item.tot_amt && item.tot_amt !== "" && (
                                        <View className="flex-row justify-between items-center mb-1.5">
                                            <Text className="text-xs text-gray-500">Total Amount:</Text>
                                            <Text className="text-sm font-semibold text-gray-800">₹{parseFloat(item.tot_amt).toFixed(2)}</Text>
                                        </View>
                                    )}
                                    {item.discount && item.discount !== '0' && (
                                        <View className="flex-row justify-between items-center mb-1.5">
                                            <Text className="text-xs text-gray-500">Discount:</Text>
                                            <Text className="text-sm font-semibold text-emerald-600">-₹{parseFloat(item.discount).toFixed(2)}</Text>
                                        </View>
                                    )}
                                    {item.platform_fee && (
                                        <View className="flex-row justify-between items-center mb-1.5">
                                            <Text className="text-xs text-gray-500">Platform Fee:</Text>
                                            <Text className="text-sm font-semibold text-gray-800">₹{parseFloat(item.platform_fee).toFixed(2)}</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Address */}
                            {item.service_address && item.service_address !== ', , ' && item.service_address !== ', ,' && (
                                <View className="flex-row bg-red-50 p-3 rounded-xl mb-3">
                                    <MaterialCommunityIcons name="map-marker" size={16} color="#EF4444" />
                                    <Text className="text-xs text-red-600 ml-2 flex-1">{item.service_address}</Text>
                                </View>
                            )}

                            {/* Review & Remark */}
                            {item.review && (
                                <View className="flex-row items-center bg-amber-50 p-3 rounded-xl mb-3">
                                    <MaterialCommunityIcons name="star" size={16} color="#FBBF24" />
                                    <Text className="text-xs font-medium text-amber-700 ml-2">Rating: {item.review}</Text>
                                </View>
                            )}

                            {item.remark && (
                                <View className="flex-row bg-gray-100 p-3 rounded-xl mb-3">
                                    <MaterialCommunityIcons name="comment-text-outline" size={16} color="#6B7280" />
                                    <Text className="text-xs text-gray-500 ml-2 flex-1 italic">{item.remark}</Text>
                                </View>
                            )}

                            {item.recomplaint && item.recomplaint !== '0' && (
                                <View className="flex-row items-center self-start bg-red-100 px-2.5 py-1 rounded-lg mb-3">
                                    <MaterialCommunityIcons name="alert-circle" size={14} color="#EF4444" />
                                    <Text className="text-xs font-semibold text-red-500 ml-1.5">Recomplaint</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={() => handleCardPress(item)}
                                className="mt-3 bg-teal-50 py-2 rounded-lg"
                            >
                                <Text className="text-teal-600 text-center font-semibold">
                                    View Complete Details
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Expand Indicator */}
                    <View className="items-center mt-2">
                        <MaterialCommunityIcons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={24}
                            color="#9CA3AF"
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const EmptyComponent = () => (
        <View className="flex-1 justify-center items-center py-16">
            <MaterialCommunityIcons name="file-document-outline" size={80} color="#D1D5DB" />
            <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">No AMC Records Found</Text>
            <Text className="text-sm text-gray-500 text-center">Pull down to refresh or check back later</Text>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header title={'My AMC'} />
                <View className="flex-1 justify-center items-center bg-gray-50">
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text className="mt-3 text-base text-gray-500">Loading AMC records...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (error && !refreshing && amcData.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Header title={'My AMC'} />
                <View className="flex-1 justify-center items-center px-8">
                    <MaterialCommunityIcons name="alert-circle" size={80} color="#EF4444" />
                    <Text className="text-lg font-semibold text-gray-800 mt-4 mb-2">Oops! Something went wrong</Text>
                    <Text className="text-sm text-gray-500 text-center mb-6">{error}</Text>
                    <TouchableOpacity
                        onPress={() => fetchAMCData(1, false)}
                        className="flex-row items-center bg-teal-600 px-6 py-3 rounded-xl gap-2"
                    >
                        <MaterialCommunityIcons name="refresh" size={20} color="#FFFFFF" />
                        <Text className="text-base font-semibold text-white">Try Again</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Header title={'My AMC'} />
            <View className='flex-1 bg-gray-50'>
                <View>{renderHeader()}</View>
                <FlatList
                    data={amcData}
                    renderItem={renderAMCItem}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}

                    ListEmptyComponent={EmptyComponent}
                    ListFooterComponent={renderFooter}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.3}
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
                />
            </View>

            {/* Image Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/95">
                    <View className="absolute top-10 right-5 z-10">
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            className="bg-white/20 rounded-full p-2"
                        >
                            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            style={{ width: width, height: height }}
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>


        </SafeAreaView>
    )
}

export default MyAmc