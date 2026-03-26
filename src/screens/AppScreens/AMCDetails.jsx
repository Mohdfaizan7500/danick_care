import { StyleSheet, Text, View, ScrollView, Image, StatusBar } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { CheckCircle } from 'lucide-react-native'
import { useAuth } from '../../context/AuthContext'

const AMCDetails = () => {
    const route = useRoute();
    const service = route.params?.service
    const insets = useSafeAreaInsets();
    const { imagUrl } = useAuth();

    console.log('service:', service)

    // Format price
    const formatPrice = (price) => {
        const amount = parseFloat(price)
        if (isNaN(amount) || amount === 0) return 'Price on Request'
        return '₹' + amount.toLocaleString('en-IN')
    }

    // Parse content HTML to extract list items
    const parseContentItems = (content) => {
        if (!content) return []

        // Extract text between <i> tags and after the icons
        const items = []
        const regex = /<i[^>]*><\/i>\s*([^<]+)(?:<br>|$)/g
        let match

        while ((match = regex.exec(content)) !== null) {
            const text = match[1].trim()
            if (text) {
                items.push(text)
            }
        }

        // If regex fails, split by <br> and clean
        if (items.length === 0) {
            return content.split('<br>')
                .map(item => item.replace(/<[^>]*>/g, '').trim())
                .filter(item => item)
        }

        return items
    }

    const features = parseContentItems(service?.content)

    return (
        <SafeAreaView className='flex-1 bg-background-secondary'>
            {/* Header */}
             <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
            
            <View className="absolute top-0 left-0 right-0 z-10" style={{ paddingTop: insets.top }}>
                <Header
                    showBackButton
                    titlePosition="left"
                    containerStyle="bg-transparent px-5 py-4"
                />
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 30 }}
            >
                {/* Hero Image - Increased height options */}
                {/* Option 1: h-80 (20rem / 320px) */}
                {/* <View className="w-full h-80 bg-primary-sage/10 mb-4"> */}

                {/* Option 2: h-96 (24rem / 384px) */}
                {/* <View className="w-full h-96 bg-primary-sage/10 mb-4"> */}

                {/* Option 3: h-[400px] (400px) */}
                {/* <View className="w-full h-[400px] bg-primary-sage/10 mb-4"> */}

                {/* Option 4: h-[450px] (450px) - Recommended */}
                <View className="w-full h-[370px] bg-primary-sage/10 mb-4">
                    {service?.image1 ? (
                        <Image
                            source={{ uri: imagUrl + service.image1 }}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center">
                            <Text className="text-primary-sage text-lg font-semibold">No Image Available</Text>
                        </View>
                    )}
                </View>

                {/* Content Container */}
                <View className="px-5">
                    {/* Title and Price Section */}
                    <View className="mb-6">
                        <Text className="text-text-primary text-2xl font-bold mb-2">
                            {service?.title || service?.name || 'AMC Service'}
                        </Text>
                        <View className="flex-row items-baseline mt-2">
                            <Text className="text-primary-sage600 text-3xl font-bold">
                                {formatPrice(service?.price)}
                            </Text>
                            <Text className="text-text-tertiary text-sm ml-2">
                                / {service?.valid || 'year'}
                            </Text>
                        </View>
                    </View>

                    {/* Validity Badge */}
                    {service?.valid && (
                        <View className="bg-primary-sage50 rounded-xl p-3 mb-6 flex-row items-center">
                            <CheckCircle size={20} color="#58A890" />
                            <Text className="text-primary-sage700 ml-2 font-medium">
                                {service.valid}
                            </Text>
                        </View>
                    )}



                    {/* Parts Covered Section */}
                    {service?.parts && service.parts.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-text-primary text-lg font-bold mb-4">
                                Parts Covered:
                            </Text>
                            <View className="flex-row flex-wrap">
                                {service.parts.map((part, index) => (
                                    <View key={index} className="bg-primary-sage50 rounded-lg px-3 py-2 mr-2 mb-2">
                                        <Text className="text-primary-sage700 text-sm font-medium">
                                            {part.part_name || part}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                    {/* Features Section */}
                    {features.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-text-primary text-lg font-bold mb-4">
                                What's Included:
                            </Text>
                            <View className="space-y-3">
                                {features.map((feature, index) => (
                                    <View key={index} className="flex-row items-start">
                                        <CheckCircle size={18} color="#58A890" style={{ marginTop: 2 }} />
                                        <Text className="text-text-secondary text-base ml-3 flex-1">
                                            {feature}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                    {/* Description Section */}
                    {service?.description && (
                        <View className="mb-6">
                            <Text className="text-text-primary text-lg font-bold mb-3">
                                Description:
                            </Text>
                            <Text className="text-text-secondary text-base leading-6">
                                {service.description}
                            </Text>
                        </View>
                    )}

                    {/* Additional Notes */}
                    <View className="bg-ui-card rounded-xl p-4 border border-ui-border">
                        <Text className="text-text-tertiary text-sm text-center">
                            For more details or to purchase this AMC plan, please contact our support team.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default AMCDetails

const styles = StyleSheet.create({})