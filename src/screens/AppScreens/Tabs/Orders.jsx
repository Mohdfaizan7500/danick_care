import { Text, View, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../../components/Header'
import { AcceptComplaint, PendingComplaints, PendingComplaintCount } from '../../../lib/api'
import DialogBox from '../../../components/DilaogBox'
import { useAuth } from '../../../context/AuthContext'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { useOrder } from '../../../context/OrderContext';

const Orders = ({ route }) => {
    const { user } = useAuth();
    const city_id = user?.city_id;
    const technician_id = user?.id;

    const { refreshOrderCount } = useOrder();

    const [complaints, setComplaints] = useState([])
    const [filteredComplaints, setFilteredComplaints] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [processingId, setProcessingId] = useState(null)
    const [dialogVisible, setDialogVisible] = useState(false)
    const [selectedComplaint, setSelectedComplaint] = useState(null)
    const [pendingCount, setPendingCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchPendingComplaints()
        fetchPendingComplaintCount()
    }, [])

    const fetchPendingComplaintCount = async () => {
        try {
            const payload = {
                city_id: city_id?.toString() || "1",
                technician_id: technician_id?.toString() || "1"
            }
            const response = await PendingComplaintCount(payload)
            console.log("fetch pending complaint response :", response)

            if (response?.data?.success) {
                const count = response?.data?.Pendingcomplaints || 0
                setPendingCount(count)
                // Also update the badge count in BottomTabs if callback exists
                if (refreshOrderCount) {
                    refreshOrderCount(count)
                }
            } else if (response?.success) {
                const count = response?.Pendingcomplaints || 0
                setPendingCount(count)
                if (refreshOrderCount) {
                    refreshOrderCount(count)
                }
            } else {
                console.log('Unexpected count response structure:', response)
                setPendingCount(0)
            }
        } catch (error) {
            console.error('Error fetching pending complaint count:', error)
            setPendingCount(0)
        }
    }

    const fetchPendingComplaints = async () => {
        try {
            setLoading(true)
            const payload = {
                city_id: city_id?.toString() || "1",
                technician_id: technician_id?.toString() || "1"
            }
            const response = await PendingComplaints(payload)

            if (response?.data?.success) {
                const complaintsData = response.data.result || []
                setComplaints(complaintsData)
                setFilteredComplaints(complaintsData)
            } else if (response?.success) {
                const complaintsData = response.result || []
                setComplaints(complaintsData)
                setFilteredComplaints(complaintsData)
            } else {
                console.log('Unexpected response structure:', response)
                setComplaints([])
                setFilteredComplaints([])
            }
        } catch (error) {
            console.error('Error fetching complaints:', error)
            setDialogVisible(true)
            setSelectedComplaint({
                type: 'error',
                title: 'Error',
                message: error?.message || 'Something went wrong while fetching complaints'
            })
            setComplaints([])
            setFilteredComplaints([])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const handleSearch = (text) => {
        setSearchQuery(text)

        if (text.trim() === '') {
            setFilteredComplaints(complaints)
        } else {
            const filtered = complaints.filter(item =>
                item.customer_name?.toLowerCase().includes(text.toLowerCase()) ||
                item.csn?.toLowerCase().includes(text.toLowerCase()) ||
                item.service_name?.toLowerCase().includes(text.toLowerCase()) ||
                item.service?.toLowerCase().includes(text.toLowerCase()) ||
                item.service_address?.toLowerCase().includes(text.toLowerCase())
            )
            setFilteredComplaints(filtered)
        }
    }

    const handleAccept = async (complaintId) => {
        setSelectedComplaint({
            type: 'accept',
            title: 'Accept Complaint',
            message: 'Are you sure you want to accept this complaint?',
            complaintId: complaintId
        })
        setDialogVisible(true)
    }

    const confirmAccept = async () => {
        try {
            setProcessingId(selectedComplaint.complaintId)
            setDialogVisible(false)

            const payload = {
                technician_id: technician_id?.toString() || "1",
                complaint_id: selectedComplaint.complaintId.toString()
            }

            const response = await AcceptComplaint(payload)

            if (response?.data?.success || response?.success) {
                setSelectedComplaint({
                    type: 'success',
                    title: 'Success',
                    message: 'Complaint accepted successfully'
                })
                setDialogVisible(true)

                // Update complaints list
                const updatedComplaints = complaints.filter(item => item.id !== selectedComplaint.complaintId)
                setComplaints(updatedComplaints)
                setFilteredComplaints(updatedComplaints)

                // Update pending count
                const newCount = Math.max(0, pendingCount - 1)
                setPendingCount(newCount)

                // IMPORTANT: Refresh the badge count in BottomTabs
                if (refreshBadgeCount) {
                    refreshBadgeCount(newCount)
                } else {
                    // If callback not available, fetch fresh count
                    fetchPendingComplaintCount()
                }
            } else {
                setSelectedComplaint({
                    type: 'error',
                    title: 'Error',
                    message: response?.data?.msg || response?.msg || 'Failed to accept complaint'

                })
                fetchPendingComplaints();
                setDialogVisible(true)
            }
        } catch (error) {
            console.error('Error accepting complaint:', error)
            setSelectedComplaint({
                type: 'error',
                title: 'Error',
                message: error?.msg || 'Something went wrong while accepting complaint'
            })
            fetchPendingComplaints();
            setDialogVisible(true)
        } finally {
            setProcessingId(null)
        }
    }

    const renderComplaintCard = ({ item }) => {
        const isProcessing = processingId === item.id

        return (
            <View className="bg-white rounded-xl mb-4 shadow-sm overflow-hidden">
                <View className="flex-row justify-between items-center px-4 pt-3 pb-2 border-b border-gray-100">
                    <Text className="text-sm font-semibold text-orange-600">
                        CSN: {item.csn || 'N/A'}
                    </Text>
                    <View className="px-2 py-1 rounded-full bg-orange-500">
                        <Text className="text-xs font-semibold text-white capitalize">
                            {item.status || 'pending'}
                        </Text>
                    </View>
                </View>

                <View className="p-4">
                    <Text className="text-base font-bold text-gray-800 mb-1">
                        {item.customer_name}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-0.5">
                        {item.service_name}
                    </Text>
                    <Text className="text-xs text-gray-500 mb-1.5">
                        Service: {item.service}
                    </Text>
                    <Text className="text-xs text-gray-600 mb-2 leading-5" numberOfLines={2}>
                        Address: {item.service_address}
                    </Text>

                    <View className="flex-row justify-between mb-1.5">
                        <Text className="text-xs text-gray-600">
                            📅 {item.slot_date || 'Date not set'}
                        </Text>
                        <Text className="text-xs text-gray-600">
                            🕒 {item.slot_time || 'Time not set'}
                        </Text>
                    </View>

                    {item.tot_amt !== "0" && item.tot_amt !== "0.00" && (
                        <Text className="text-sm font-semibold text-green-600 mt-1">
                            Amount: ₹{item.tot_amt}
                        </Text>
                    )}
                </View>

                <View className="px-4 pb-4">
                    <TouchableOpacity
                        className={`bg-green-500 py-3 rounded-lg items-center justify-center ${isProcessing ? 'opacity-60' : ''}`}
                        onPress={() => handleAccept(item.id)}
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text className="text-white text-base font-semibold">Accept Complaint</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const renderEmptyList = () => (
        <View className="flex-1 justify-center items-center py-16">
            <Icon name="inbox" size={64} color="#ccc" />
            <Text className="text-base text-gray-400 text-center mt-4">
                {searchQuery ? 'No matching complaints found' : 'No pending complaints'}
            </Text>
        </View>
    )

    const handleRefresh = () => {
        setRefreshing(true)
        fetchPendingComplaints()
        fetchPendingComplaintCount()
    }

    const renderDialogContent = () => {
        if (!selectedComplaint) return null

        switch (selectedComplaint.type) {
            case 'accept':
                return (
                    <View className="py-2">
                        <Text className="text-gray-600 text-base mb-6 text-center">
                            {selectedComplaint.message}
                        </Text>
                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-300 py-3 rounded-lg"
                                onPress={() => {
                                    setDialogVisible(false)
                                    setSelectedComplaint(null)
                                }}
                            >
                                <Text className="text-gray-700 text-base font-semibold text-center">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-green-500 py-3 rounded-lg"
                                onPress={confirmAccept}
                            >
                                <Text className="text-white text-base font-semibold text-center">Accept</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )

            case 'success':
                return (
                    <View className="py-4 items-center">
                        <Icon name="check-circle" size={60} color="#4CAF50" />
                        <Text className="text-gray-800 text-base text-center mt-4 mb-2">
                            {selectedComplaint.message}
                        </Text>
                        <TouchableOpacity
                            className="bg-green-500 px-6 py-3 rounded-lg mt-4 min-w-[120px]"
                            onPress={() => {
                                setDialogVisible(false)
                                setSelectedComplaint(null)
                                // Refresh the list to ensure consistency
                                handleRefresh()
                            }}
                        >
                            <Text className="text-white text-base font-semibold text-center">OK</Text>
                        </TouchableOpacity>
                    </View>
                )

            case 'error':
                return (
                    <View className="py-4 items-center">
                        <Icon name="error-outline" size={60} color="#F44336" />
                        <Text className="text-gray-800 text-base text-center mt-4 mb-2">
                            {selectedComplaint.message}
                        </Text>
                        <TouchableOpacity
                            className="bg-red-500 px-6 py-3 rounded-lg mt-4 min-w-[120px]"
                            onPress={() => {
                                setDialogVisible(false)
                                setSelectedComplaint(null)
                            }}
                        >
                            <Text className="text-white text-base font-semibold text-center">OK</Text>
                        </TouchableOpacity>
                    </View>
                )

            default:
                return null
        }
    }

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <Header
                    title="Pending Complaints"
                    titlePosition="left"
                    titleStyle="font-bold text-2xl ml-5"
                    showBackButton={true}
                    containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
                />
                <View className="flex-1 justify-center items-center bg-gray-50">
                    <ActivityIndicator size="large" color="#FF5722" />
                    <Text className="mt-2.5 text-base text-gray-500">Loading complaints...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Header
                title={`Pending Complaints (${pendingCount})`}
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5"
                showBackButton={true}
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
            />

            <View className="bg-white px-4 py-3 border-b border-gray-200">
                <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
                    <Icon name="search" size={20} color="#666" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-gray-800"
                        placeholder="Search by customer name, CSN, service..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={handleSearch}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => handleSearch('')}>
                            <Icon name="close" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View className="flex-1 bg-gray-50">
                <FlatList
                    data={filteredComplaints}
                    renderItem={renderComplaintCard}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
                    ListEmptyComponent={renderEmptyList}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            </View>

            <DialogBox
                visible={dialogVisible}
                onClose={() => {
                    setDialogVisible(false)
                    setSelectedComplaint(null)
                }}
                title={selectedComplaint?.title || ''}
                size="md"
                showCloseButton={selectedComplaint?.type !== 'accept'}
                closeOnBackdropPress={selectedComplaint?.type !== 'accept'}
            >
                {renderDialogContent()}
            </DialogBox>
        </SafeAreaView>
    )
}

export default Orders