import { Text, View, FlatList, Image, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Header from '../../../components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons';
import { AMCConvertList } from '../../../lib/api'
import DialogBox from '../../../components/DilaogBox'

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
                setAmcData(response.data.data || [])
            } else {
                console.error('Failed to load AMC list:', response?.data)
            }
        } catch (error) {
            console.error('Error loading AMC list:', error)
        } finally {
            setLoading(false)
        }
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

    const handleConfirmConversion = () => {
        setShowConfirmModal(false)
        if (selectedAMC) {
            navigation.navigate('ComplaintAMCDetails', { amc: selectedAMC, complaintData })
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

    const renderItem = ({ item }) => {
        const features = parseFeatures(item.content)
        const imageUrl = item.image1 ? `https://dainikcare.com/dainik_care_admin/${item.image1}` : null
        
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
                        {features.map((feature, index) => (
                            <View key={index} className="flex-row items-center mb-1.5">
                                <Text className="text-sm text-teal-500 mr-2 font-bold">✓</Text>
                                <Text className="text-sm text-gray-600 flex-1">{feature}</Text>
                            </View>
                        ))}
                       
                        {features.length === 0 && item.parts && item.parts.length > 0 && (
                            <View>
                                <Text className="text-sm font-semibold text-gray-700 mb-1">Covered Parts:</Text>
                                {item.parts.slice(0, 3).map((part, index) => (
                                    <View key={index} className="flex-row items-center mb-1.5">
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
                    >
                        <Text className="text-white text-base font-bold">Buy Now</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        )
    }

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-gray-100">
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
        <SafeAreaView className="flex-1 bg-gray-100">
            <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />

            <Header
                title={`AMC Plans for ${serviceName}`}
                titlePosition="left"
                titleStyle="font-bold text-2xl ml-5"
                showBackButton={true}
                containerStyle="bg-white flex-row items-center justify-between px-4 py-4 border-b border-gray-200"
            />

            <FlatList
                data={amcData}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
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
                            ⚠️ अगर आप AMC cancel करना चाहते हैं, तो सभी QR codes को detach करना अनिवार्य है।
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
                        >
                            <Text className="text-white text-center font-semibold text-base">
                                हाँ / Yes
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </DialogBox>
        </SafeAreaView>
    )
}

export default AMCList