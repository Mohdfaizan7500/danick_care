import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { toast, Toaster } from 'sonner-native';
import StatusMessage from '../../../components/StatusMessage';
import { CSNComplaints } from '../../../lib/api';
import { SafeAreaView } from 'react-native-safe-area-context';

const RelatedComplaints = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {
        customerId,
        customerName,
        customerMobile,
        currentComplaintId,
        currentComplaintCsn,
    } = route.params || {};

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [relatedComplaints, setRelatedComplaints] = useState([]);
    const [error, setError] = useState(null);

    // Fetch related complaints using CSN
    const fetchRelatedComplaints = async () => {
        if (!currentComplaintCsn) {
            setError('No CSN available to fetch related complaints');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await CSNComplaints({ csn: currentComplaintCsn });
            console.log('CSNComplaints response:', response);

            if (response?.data?.success) {
                setRelatedComplaints(response.data.result || []);
                if (response.data.result?.length === 0) {
                    toast.custom(
                        <StatusMessage
                            type="info"
                            title="No Related Complaints"
                            message={`No complaints found for CSN: ${currentComplaintCsn}`}
                        />,
                        { duration: 3000 }
                    );
                }
            } else {
                setError(response?.data?.msg || 'Failed to fetch related complaints');
                toast.custom(
                    <StatusMessage
                        type="error"
                        title="Error"
                        message={response?.data?.msg || 'Failed to fetch related complaints'}
                    />,
                    { duration: 3000 }
                );
            }
        } catch (error) {
            console.error('Error fetching related complaints:', error);
            setError(error.message || 'Failed to fetch related complaints');
            toast.custom(
                <StatusMessage
                    type="error"
                    title="Error"
                    message={error.message || 'Failed to fetch related complaints'}
                />,
                { duration: 3000 }
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRelatedComplaints();
    }, [currentComplaintCsn]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchRelatedComplaints();
    };

    const handleComplaintPress = (complaint) => {
        navigation.navigate('QRCodeDetails', {
            complaint: complaint,
            status: 'complaint',
            qrData: complaint,
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success':
            case 'complete':
                return '#22C55E';
            case 'pending':
                return '#F59E0B';
            case 'assign':
                return '#3B82F6';
            case 'in_progress':
            case 'onworking':
                return '#8B5CF6';
            case 'cancel':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'assign': return 'Assigned';
            case 'in_progress': return 'In Progress';
            case 'onworking': return 'On Working';
            case 'pending': return 'Pending';
            case 'complete': return 'Complete';
            case 'success': return 'Success';
            case 'cancel': return 'Cancel';
            default: return status || 'N/A';
        }
    };

    const getStatusBgColor = (status) => {
        switch (status) {
            case 'success':
            case 'complete':
                return '#DCFCE7';
            case 'pending':
                return '#FEF3C7';
            case 'assign':
                return '#DBEAFE';
            case 'in_progress':
            case 'onworking':
                return '#EDE9FE';
            case 'cancel':
                return '#FEE2E2';
            default:
                return '#F3F4F6';
        }
    };

    const renderComplaintItem = ({ item }) => {
        const isCurrentComplaint = item.id === currentComplaintId;
        const statusColor = getStatusColor(item.status);
        const statusBgColor = getStatusBgColor(item.status);

        return (
            <TouchableOpacity
                onPress={() => handleComplaintPress(item)}
                style={[
                    styles.complaintCard,
                    isCurrentComplaint && styles.currentComplaintCard,
                ]}
                activeOpacity={0.7}
            >
                {/* Header - CSN and Status */}
                <View style={styles.cardHeader}>
                    <View style={styles.csnContainer}>
                        <Text style={styles.csnText}>#{item.csn}</Text>
                        {isCurrentComplaint && (
                            <View style={styles.currentBadge}>
                                <Text style={styles.currentBadgeText}>Current</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusBgColor }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {getStatusDisplay(item.status)}
                        </Text>
                    </View>
                </View>

                {/* Service Name */}
                <Text style={styles.serviceName}>
                    {item.service_name || 'Service'}
                </Text>

                {/* Date and Time */}
                <View style={styles.dateTimeContainer}>
                    <Icon name="calendar-outline" size={14} color="#6B7280" />
                    <Text style={styles.dateText}>
                        {item.slot_date || item.date_time?.split(' ')[0] || 'N/A'}
                    </Text>
                    {item.slot_time && (
                        <>
                            <Icon name="time-outline" size={14} color="#6B7280" style={styles.timeIcon} />
                            <Text style={styles.dateText}>{item.slot_time}</Text>
                        </>
                    )}
                </View>

                {/* Amount and Complaint Type */}
                <View style={styles.footerContainer}>
                    <View style={styles.amountContainer}>
                        <Icon name="cash-outline" size={14} color="#059669" />
                        <Text style={styles.amountText}>₹{item.tot_amt || '0'}</Text>
                    </View>
                    <View style={styles.typeContainer}>
                        <Icon name="document-text-outline" size={14} color="#6B7280" />
                        <Text style={styles.typeText}>
                            {item.complaint_type || 'Service'}
                        </Text>
                    </View>
                </View>

                {/* Recomplaint indicator */}
                {item.recomplaint === 'Yes' && (
                    <View style={styles.recomplaintBadge}>
                        <Icon name="repeat-outline" size={12} color="#EA580C" />
                        <Text style={styles.recomplaintText}>Re-complaint</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="document-text-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No related complaints found</Text>
            <Text style={styles.emptySubtitle}>
                No complaints found for CSN: {currentComplaintCsn}
            </Text>
        </View>
    );

    const renderErrorState = () => (
        <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={60} color="#EF4444" />
            <Text style={styles.errorTitle}>Error Loading Complaints</Text>
            <Text style={styles.errorMessage}>{error || 'Failed to load related complaints'}</Text>
            <TouchableOpacity
                onPress={fetchRelatedComplaints}
                style={styles.retryButton}
            >
                <Icon name="refresh-outline" size={18} color="white" />
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            <View style={styles.toasterContainer}>
                <Toaster />
            </View>

            {/* Custom Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="chevron-back-outline" size={28} color="#333333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Related Complaints</Text>
                <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                    <Icon name="refresh-outline" size={22} color="#333" />
                </TouchableOpacity>
            </View>

           

            {/* Complaints List */}
            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#14B8A6" />
                    <Text style={styles.loadingText}>Loading related complaints...</Text>
                </View>
            ) : error ? (
                renderErrorState()
            ) : (
                <FlatList
                    data={relatedComplaints}
                    renderItem={renderComplaintItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={['#14B8A6']}
                            tintColor="#14B8A6"
                            title="Pull to refresh"
                            titleColor="#14B8A6"
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    toasterContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        pointerEvents: 'none',
    },
    headerContainer: {
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        padding: 4,
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        flex: 1,
        textAlign: 'center',
    },
    refreshButton: {
        padding: 4,
        width: 40,
        alignItems: 'flex-end',
    },
    customerInfoContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    customerName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    customerInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    customerInfoText: {
        fontSize: 13,
        color: '#6B7280',
        marginLeft: 6,
    },
    countContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    countText: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#6B7280',
    },
    listContainer: {
        padding: 16,
        paddingBottom: 30,
    },
    complaintCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    currentComplaintCard: {
        borderColor: '#8B5CF6',
        borderWidth: 2,
        backgroundColor: '#F5F3FF',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    csnContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    csnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    currentBadge: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 6,
    },
    currentBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
    },
    serviceName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 6,
    },
    dateTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        flexWrap: 'wrap',
    },
    dateText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    timeIcon: {
        marginLeft: 10,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 4,
    },
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    amountText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#059669',
        marginLeft: 4,
    },
    typeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    typeText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
    },
    recomplaintBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    recomplaintText: {
        fontSize: 11,
        color: '#EA580C',
        fontWeight: '500',
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 4,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 24,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#EF4444',
        textAlign: 'center',
        marginTop: 16,
    },
    errorMessage: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },
    retryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#14B8A6',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 8,
    },
});

export default RelatedComplaints;