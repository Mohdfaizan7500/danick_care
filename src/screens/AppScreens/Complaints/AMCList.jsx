import { Text, View, FlatList, Image, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import Header from '../../../components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Icon from 'react-native-vector-icons/Ionicons';
const AMCList = () => {
    const navigation = useNavigation();

    const handleAMCPress = (amc) => {
        navigation.navigate('ComplaintAMCDetails', { amc });
    }

    const amcData = [
        {
            id: '1',
            name: 'Basic AMC Plan',
            imageUrl: 'https://www.shutterstock.com/image-vector/air-conditioning-repair-flyer-banner-600nw-2329594219.jpg',
            price: 2999,
            warrantyLimit: '3 months',
            features: ['Free inspection', 'Basic maintenance', 'Phone support']
        },
        {
            id: '2',
            name: 'Standard AMC Plan',
            imageUrl: 'https://www.shutterstock.com/image-vector/air-conditioning-repair-flyer-banner-600nw-2329594219.jpg',
            price: 5999,
            warrantyLimit: '6 months',
            features: ['Free inspection', 'Priority service', '20% spare parts discount', 'Phone & WhatsApp support']
        },
        {
            id: '3',
            name: 'Premium AMC Plan',
            imageUrl: 'https://www.shutterstock.com/image-vector/air-conditioning-repair-flyer-banner-600nw-2329594219.jpg',

            price: 9999,
            warrantyLimit: '12 months',
            features: ['Free inspection', 'Priority service', '30% spare parts discount', 'Free spare parts up to ₹1000', '24/7 dedicated support']
        },
        {
            id: '4',
            name: 'Business AMC Plan',
            imageUrl: 'https://www.shutterstock.com/image-vector/air-conditioning-repair-flyer-banner-600nw-2329594219.jpg',

            price: 14999,
            warrantyLimit: '24 months',
            features: ['Free inspection', 'Emergency service', '50% spare parts discount', 'Free spare parts up to ₹2500', 'Dedicated account manager', 'Monthly reports']
        },
        {
            id: '5',
            name: 'Annual Maintenance Plus',
            imageUrl: 'https://www.shutterstock.com/image-vector/air-conditioning-repair-flyer-banner-600nw-2329594219.jpg',

            price: 7999,
            warrantyLimit: '12 months',
            features: ['Unlimited service calls', 'Free spare parts up to ₹500', 'Quarterly maintenance', 'Priority support']
        }
    ]

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price)
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => handleAMCPress(item)}
            className="bg-white rounded-xl mb-5 overflow-hidden shadow-lg"
            style={{ elevation: 3 }}
            activeOpacity={0.7}
        >

            <View className="relative h-[150px]">
                {
                    item?.imageUrl ? (
                        <>
                            <Image
                                source={{ uri: item.imageUrl }}
                                className="w-full h-full"
                                resizeMode="stretch"
                            />
                            <View className="absolute top-2.5 right-2.5 bg-orange-500 px-2.5 py-1 rounded-full">
                                <Text className="text-white text-xs font-bold">Warranty: {item.warrantyLimit}</Text>
                            </View>
                        </>
                    ) : (
                        <View className="w-full h-full bg-teal-100 flex items-center justify-center">
                            <Icon name="cube-outline" size={80} color="#10b981" />
                        </View>
                    )
                }

            </View>

            <View className="p-4">
                <Text className="text-xl font-bold text-gray-800 mb-2.5">{item.name}</Text>

                <View className="flex-row items-baseline mb-2">
                    <Text className="text-sm text-gray-500 mr-2.5">Price:</Text>
                    <Text className="text-2xl font-bold text-teal-500">{formatPrice(item.price)}</Text>
                </View>

                <View className="flex-row items-center mb-3 pb-3 border-b border-gray-200">
                    <Text className="text-sm text-gray-500 mr-2.5">Warranty Limit:</Text>
                    <Text className="text-base font-semibold text-orange-500">{item.warrantyLimit}</Text>
                </View>

                <View className="mb-4">
                    {item.features.slice(0, 3).map((feature, index) => (
                        <View key={index} className="flex-row items-center mb-1.5">
                            <Text className="text-sm text-teal-500 mr-2 font-bold">✓</Text>
                            <Text className="text-sm text-gray-600 flex-1">{feature}</Text>
                        </View>
                    ))}
                    {item.features.length > 3 && (
                        <Text className="text-xs text-blue-500 mt-1 italic">
                            +{item.features.length - 3} more features
                        </Text>
                    )}
                </View>

                <TouchableOpacity className="bg-teal-500 py-3 rounded-lg items-center mt-2.5">
                    <Text className="text-white text-base font-bold">Buy Now</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    )

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


            <FlatList
                data={amcData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: 15 }}
            />
        </SafeAreaView>
    )
}

export default AMCList