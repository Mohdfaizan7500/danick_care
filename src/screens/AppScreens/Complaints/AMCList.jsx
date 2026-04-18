import { Text, View, FlatList, Image, TouchableOpacity, StatusBar, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons';
import { AMCConvertList, ProceedAMC } from '../../../lib/api'
import DialogBox from '../../../components/DilaogBox'
import { useAuth } from '../../../context/AuthContext'
import { toast } from 'sonner-native'
import StatusMessage from '../../../components/StatusMessage'

const AMCList = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { complaintData } = route.params || {};
    console.log('Received complaint data in AMCList:', complaintData);

    const [loading, setLoading] = useState(false)
    const [amcData, setAmcData] = useState([])
    const [refreshing, setRefreshing] = useState(false)
    const [selectedAMC, setSelectedAMC] = useState(null)
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [processingAMC, setProcessingAMC] = useState(false)

    // Get user from auth context
    const { user } = useAuth()

    // Get city_id and service_name from complaintData
    const cityId = complaintData?.city_id || '1'
    const serviceName = complaintData?.service || 'AC'

    useEffect(() => {
        loadAMCList()
    }, [])

    const loadAMCList = async () => {
        setLoading(true)
        try {
            const payload = {
                city_id: cityId,
                service_name: serviceName
            }
            const response = await AMCConvertList(payload)
            console.log('AMC List response:', response)

            if (response?.data?.success) {
                const data = response.data.data || []
                // Remove duplicates based on id
                const uniqueData = removeDuplicates(data)
                setAmcData(uniqueData)
            } else {
                console.error('Failed to load AMC list:', response?.data)
            }
        } catch (error) {
            console.error('Error loading AMC list:', error)
        } finally {
            setLoading(false)
        }
    }

    // Function to remove duplicate items based on id
    const removeDuplicates = (data) => {
        const seen = new Set()
        return data.filter(item => {
            const id = item.id?.toString()
            if (seen.has(id)) {
                console.warn(`Duplicate item found with id: ${id}`)
                return false
            }
            seen.add(id)
            return true
        })
    }

    const onRefresh = async () => {
        setRefreshing(true)
        await loadAMCList()
        setRefreshing(false)
    }

    const handleAMCPress = (amc) => {
        setSelectedAMC(amc)
        setShowConfirmModal(true)
    }

    const handleConfirmConversion = async () => {
        setShowConfirmModal(false)

        if (!selectedAMC) return

        setProcessingAMC(true)

        try {
            // Prepare payload for ProceedAMC API
            const payload = {
                amc_id: selectedAMC.id?.toString(),
                complaint_id: complaintData?.id?.toString(),
                technician_id: user?.id?.toString()
            }

            console.log('ProceedAMC payload:', payload)

            const response = await ProceedAMC(payload)
            console.log('ProceedAMC response:', response)

            // Check if response is successful
            // After successful ProceedAMC response
            if (response?.data?.success || response?.success) {
                // Show success message
                toast.custom(
                    <StatusMessage
                        type='success'
                        title='Success!'
                        message='AMC plan has been successfully applied to this complaint.'
                    />,
                    { duration: 2000 }
                )

                // Extract the amc_complaint_id from response
                const amcComplaintId = response?.data?.amc_complaint_id || response?.amc_complaint_id

                console.log('AMC Complaint ID from response:', amcComplaintId)

                // Navigate to next screen with response data
                navigation.replace('ComplaintAMCDetails', {
                    amc: selectedAMC,
                    complaintData: complaintData,
                    proceedResponse: response?.data,
                    amcComplaintId: amcComplaintId  // Pass the amc_complaint_id explicitly
                })

            } else {
                // Handle API error response
                const errorMessage = response?.data?.message || response?.message || 'Failed to proceed with AMC plan. Please try again.'
                toast.custom(
                    <StatusMessage type='error' title='Failed' message={errorMessage} />,
                    { duration: 2000 }
                )
            }
        } catch (error) {
            console.error('Error proceeding with AMC:', error)
            toast.custom(
                <StatusMessage
                    type='error'
                    title='Error'
                    message={error.message || 'Something went wrong. Please try again.'}
                />,
                { duration: 2000 }
            )
        } finally {
            setProcessingAMC(false)
            setSelectedAMC(null)
        }
    }

    const handleCancelConversion = () => {
        setShowConfirmModal(false)
        setSelectedAMC(null)
    }

    // Parse HTML content to extract features
    const parseFeatures = (htmlContent) => {
        if (!htmlContent) return []

        const features = []
        const regex = /<i class="fa fa-check-circle" style="color:green"><\/i>\s*(.*?)<br>/g
        let match

        while ((match = regex.exec(htmlContent)) !== null) {
            if (match[1] && match[1].trim()) {
                features.push(match[1].trim())
            }
        }

        return features
    }

    const formatPrice = (price) => {
        const numPrice = parseFloat(price)
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(numPrice)
    }

    const renderItem = ({ item, index }) => {
        const features = parseFeatures(item.content)
        const imageUrl = item.image1 ? `https://dainikcare.com/dainik_care_admin/${item.image1}` : null

        // Generate a unique key for features using index
        const getFeatureKey = (feature, featureIndex) => `${item.id}_feature_${featureIndex}_${feature.substring(0, 10)}`

        return (
            <TouchableOpacity
                onPress={() => handleAMCPress(item)}
                className="bg-white rounded-xl mb-5 overflow-hidden shadow-lg"
                style={{ elevation: 3 }}
                activeOpacity={0.7}
            >
                <View className="relative h-[150px]">
                    {imageUrl ? (
                        <>
                            <Image
                                source={{ uri: imageUrl }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <View className="absolute top-2.5 right-2.5 bg-orange-500 px-2.5 py-1 rounded-full">
                                <Text className="text-white text-xs font-bold">{item.valid || 'Warranty Included'}</Text>
                            </View>
                        </>
                    ) : (
                        <View className="w-full h-full bg-teal-100 flex items-center justify-center">
                            <Icon name="cube-outline" size={80} color="#10b981" />
                        </View>
                    )}
                </View>

                <View className="p-4">
                    <Text className="text-xl font-bold text-gray-800 mb-2.5">{item.name}</Text>

                    <View className="flex-row items-baseline mb-2">
                        <Text className="text-sm text-gray-500 mr-2.5">Price:</Text>
                        <Text className="text-2xl font-bold text-teal-500">{formatPrice(item.price)}</Text>
                    </View>

                    <View className="flex-row items-center mb-3 pb-3 border-b border-gray-200">
                        <Text className="text-sm text-gray-500 mr-2.5">Validity:</Text>
                        <Text className="text-base font-semibold text-orange-500">{item.valid || '1 Year'}</Text>
                    </View>

                    <View className="mb-4">
                        {features.map((feature, featureIndex) => (
                            <View key={getFeatureKey(feature, featureIndex)} className="flex-row items-center mb-1.5">
                                <Text className="text-sm text-teal-500 mr-2 font-bold">✓</Text>
                                <Text className="text-sm text-gray-600 flex-1">{feature}</Text>
                            </View>
                        ))}

                        {features.length === 0 && item.parts && item.parts.length > 0 && (
                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-1">Covered Parts:</Text>
                                {item.parts.slice(0, 3).map((part, partIndex) => (
                                    <View key={`${item.id}_part_${partIndex}_${part.part_id || partIndex}`} className="flex-row items-center mb-1.5">
                                        <Text className="text-sm text-teal-500 mr-2 font-bold">•</Text>
                                        <Text className="text-sm text-gray-600 flex-1">{part.part_name}</Text>
                                    </View>
                                ))}
                                {item.parts.length > 3 && (
                                    <Text className="text-xs text-blue-500 mt-1 italic">
                                        +{item.parts.length - 3} more parts covered
                                    </Text>
                                )}
                            </View>
                        )}
                    </View>

                    <TouchableOpacity
                        className="bg-teal-500 py-3 rounded-lg items-center mt-2.5"
                        onPress={() => handleAMCPress(item)}
                        disabled={processingAMC}
                    >
                        <Text className="text-white text-base font-bold">
                            {processingAMC && selectedAMC?.id === item.id ? 'Processing...' : 'Buy Now'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
                <Header
                    title="AMC"
                    titlePosition="left"
                    titleStyle="font-bold text-2xl ml-5"
                    showBackButton={true}
                    containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
                />
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#10b981" />
                    <Text className="text-gray-500 mt-4">Loading AMC plans...</Text>
                </View>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />

            <Header
                title={`AMC Plans for ${serviceName}`}
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5"
                showBackButton={true}
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
            />

            {/* Loading overlay for AMC processing */}
            {processingAMC && (
                <View className="absolute inset-0 bg-black/50 z-50 justify-center items-center">
                    <View className="bg-white rounded-lg p-6 items-center">
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text className="text-gray-800 font-semibold mt-4">
                            Processing AMC Plan...
                        </Text>
                        <Text className="text-gray-500 text-sm mt-2">
                            Please wait while we process your request
                        </Text>
                    </View>
                </View>
            )}

            <FlatList
                data={amcData}
                renderItem={renderItem}
                keyExtractor={(item, index) => {
                    // Use index as fallback if id is duplicate or missing
                    const uniqueKey = item?.id
                        ? `${item.id}_${index}`
                        : `item_${index}_${Date.now()}`
                    return uniqueKey
                }}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 15 }}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListEmptyComponent={
                    !loading && (
                        <View className="flex-1 justify-center items-center py-10">
                            <Icon name="document-text-outline" size={80} color="#CCCCCC" />
                            <Text className="text-gray-500 text-center mt-4">
                                No AMC plans available
                            </Text>
                        </View>
                    )
                }
            />

            {/* Confirmation Dialog */}
            <DialogBox
                visible={showConfirmModal}
                onClose={handleCancelConversion}
                title="Confirm AMC Conversion"
                size="md"
                showCloseButton={true}
                closeIconName="close"
                closeIconSize={24}
                closeIconColor="#666"
                modalAnimationType="fade"
                closeOnBackdropPress={true}
            >
                <View className="py-2">
                    {/* Warning Icon */}
                    <View className="items-center mb-4">
                        <View className="w-16 h-16 rounded-full bg-orange-100 items-center justify-center">
                            <Icon name="alert-circle" size={40} color="#F97316" />
                        </View>
                    </View>

                    {/* AMC Details */}
                    {selectedAMC && (
                        <View className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <Text className="text-center text-gray-800 font-semibold">
                                {selectedAMC.name}
                            </Text>
                            <Text className="text-center text-teal-600 font-bold mt-1">
                                {formatPrice(selectedAMC.price)}
                            </Text>
                            <Text className="text-center text-gray-500 text-sm mt-1">
                                Validity: {selectedAMC.valid || '1 Year'}
                            </Text>
                        </View>
                    )}

                    {/* Question Text */}
                    <Text className="text-lg font-semibold text-center text-gray-800 mb-3">
                        क्या आप इस complaint को AMC में convert करना चाहते हैं?
                    </Text>

                    <Text className="text-base text-center text-gray-600 mb-4">
                        Do you want to convert this complaint to AMC?
                    </Text>

                    {/* Important Note Box */}
                    <View className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                        <View className="flex-row items-center mb-2">
                            <Icon name="information-circle" size={20} color="#D97706" />
                            <Text className="text-yellow-700 font-semibold ml-2">Important Note:</Text>
                        </View>
                        <Text className="text-yellow-700 text-sm">
                            ⚠️ अगर आप AMC cancel करना चाहते हैं, तो सभी QR codes को हटाना अनिवार्य है।
                        </Text>
                        <Text className="text-yellow-700 text-sm mt-1">
                            ⚠️ If you want to cancel the AMC, you must detach all QR codes first.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row mt-2">
                        <TouchableOpacity
                            onPress={handleCancelConversion}
                            className="flex-1 bg-gray-200 py-3 rounded-lg mr-2"
                        >
                            <Text className="text-gray-700 text-center font-semibold text-base">
                                नहीं / No
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleConfirmConversion}
                            className="flex-1 bg-teal-500 py-3 rounded-lg ml-2"
                            disabled={processingAMC}
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                {processingAMC ? 'Processing...' : 'हाँ / Yes'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </DialogBox>
        </SafeAreaView>
    )
}

export default AMCList