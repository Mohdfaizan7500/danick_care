import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { Search } from 'lucide-react-native'
import NoInternet from '../NoInternet'
import { useAuth } from '../../context/AuthContext'
import { getAMCList } from '../../lib/api'
import { useNavigation } from '@react-navigation/native'

const AMC = () => {
  const { user, imagUrl } = useAuth();
  const city_id = user?.city_id;
  console.log('city_id:', city_id);
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState('')
  const [imageErrors, setImageErrors] = useState({})
  const [amcServices, setAmcServices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAMC = async () => {
    const payload = {
      city_id: city_id
    }
    try {
      setLoading(true)
      const response = await getAMCList(payload);
      console.log('response:', response?.data?.data)
      const data = response?.data?.data || []
      setAmcServices(data)
    }
    catch (error) {
      console.log("fetch AMC error:", error);
      console.error("fetch AMC error:", error);
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAMC();
  }, [])

  // Filter services based on search
  const getFilteredServices = () => {
    if (!searchQuery) return amcServices

    const query = searchQuery.toLowerCase()
    return amcServices.filter(service =>
      service.name?.toLowerCase().includes(query) ||
      service.title?.toLowerCase().includes(query)
    )
  }

  // Format currency
  const formatCurrency = (amount) => {
    const price = parseFloat(amount)
    if (isNaN(price) || price === 0) return 'Price on Request'
    return '₹' + price.toLocaleString('en-IN')
  }

  // Handle image error
  const handleImageError = (serviceId) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: true }))
  }

  const handleCardPress = (service) => {
    navigation.navigate('AMCDetails', { service })
  }

  const filteredServices = getFilteredServices()

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-secondary">
        <Header
          title={'AMC Services'}
          titlePosition='left'
          containerStyle='bg-transparent px-4 py-3 flex-row items-center justify-between'
          titleStyle='font-bold text-xl text-black'
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#58A890" />
          <Text className="text-text-tertiary mt-4">Loading AMC services...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <Header
        title={'AMC Services'}
        titlePosition='left'
        containerStyle='bg-transparent px-4 py-3 flex-row items-center justify-between'
        titleStyle='font-bold text-xl text-black'
      />

      {/* Search Bar */}
      <View className="px-4 mt-1">
        <View className="flex-row items-center bg-ui-card rounded-2xl border border-ui-border px-3 py-1">
          <Search size={20} color="#999999" />
          <TextInput
            className="flex-1 ml-2 text-text-primary"
            placeholder="Search AMC services..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Results Count */}
      {searchQuery ? (
        <View className="px-4 mt-2">
          <Text className="text-text-tertiary text-sm">
            Found {filteredServices.length} services
          </Text>
        </View>
      ) : null}

      {/* Services Grid */}
      <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap justify-between">
          {filteredServices.length > 0 ? (
            filteredServices.map((service,index) => (
              <TouchableOpacity
                onPress={() => handleCardPress(service)}
                key={index}
                className="w-[48%] bg-ui-card rounded-xl p-3 mb-3 border border-ui-border"
                activeOpacity={0.7}
              >
                {/* Service Image */}
                <View className="w-full h-[140px] rounded-lg bg-primary-sage/20 mb-2 overflow-hidden">
                  {!imageErrors[service.id] && service.image1 ? (
                    <Image
                      source={{ uri: imagUrl + service.image1 }}
                      className="w-full h-full"
                      resizeMode="cover"
                      onError={() => handleImageError(service.id)}
                    />
                  ) : (
                    <View className="w-full h-full bg-primary-sage/30 items-center justify-center">
                      <Text className="text-primary-sage text-xs font-bold">
                        {service.name?.substring(0, 3) || 'AMC'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Service Name/Title */}
                <Text className="text-text-primary font-semibold text-sm mb-1" numberOfLines={2}>
                  {service.title || service.name || 'AMC Service'}
                </Text>

                {/* Price */}
                <Text className="text-primary-sage font-bold text-base">
                  {formatCurrency(service.price)}
                </Text>
                <Text className="text-text-tertiary text-xs">{service.valid || 'per year'}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View className="w-full items-center justify-center py-10">
              <Text className="text-text-tertiary text-center">
                No AMC services found
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  )
}

export default AMC

const styles = StyleSheet.create({})