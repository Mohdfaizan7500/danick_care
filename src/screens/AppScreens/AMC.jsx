// Enhanced AMC screen with NoInternet and custom hook
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { Search } from 'lucide-react-native'

import { useAuth } from '../../context/AuthContext'
import { getAMCList } from '../../lib/api'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { toast, Toaster } from 'sonner-native'
import StatusMessage from '../../components/StatusMessage'
import { useInternetStatus } from '../../hooks/useInternetStatus'
import NoInternet from '../NoInternet'

const AMC = () => {
  const { user, imagUrl } = useAuth();
  const city_id = user?.city_id;
  const navigation = useNavigation();

  // Use custom internet status hook
  const { isConnected, checkConnection, isChecking } = useInternetStatus();

  const [searchQuery, setSearchQuery] = useState('')
  const [imageErrors, setImageErrors] = useState({})
  const [amcServices, setAmcServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(false) // New state for retry button

  const fetchAMC = async (isRefresh = false) => {
    // Don't fetch if offline
    if (!isConnected) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const payload = {
      city_id: city_id
    }
    try {
      if (!isRefresh) {
        setLoading(true)
      }
      const response = await getAMCList(payload);
      const data = response?.data?.data || []
      setAmcServices(data)

      if (isRefresh && response?.data?.data) {
        toast.custom(
          <StatusMessage type='success' title='AMC services refreshed' />,
          { duration: 1000 }
        );
      }
    }
    catch (error) {
      console.log("fetch AMC error:", error);
      if (isRefresh) {
        toast.custom(
          <StatusMessage type='error' title='Failed to refresh AMC services' />,
          { duration: 1500 }
        );
      }
    }
    finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    if (isConnected) {
      fetchAMC();
    } else {
      setLoading(false);
    }
  }, [isConnected])

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (isConnected) {
        fetchAMC();
      }
    }, [isConnected])
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    if (!isConnected) {
      // If offline, just check connection again
      const connected = await checkConnection();
      if (!connected) {
        setRefreshing(false);
        toast.custom(
          <StatusMessage type='error' title='Still offline. Please check your connection.' />,
          { duration: 1500 }
        );
        return;
      }
    }

    setRefreshing(true);
    await fetchAMC(true);
  }, [isConnected, checkConnection]);

  // Retry connection handler with 2-second checking message
  const handleRetry = async () => {
    // Show checking connection message
    setCheckingConnection(true);
    
    // Wait for 2 seconds while checking connection
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check actual connection
    const connected = await checkConnection();

    if (connected) {
      toast.custom(
        <StatusMessage type='success' title='Connection Restored' />,
        { duration: 1500 }
      );
      // Refresh data when connection is restored
      await fetchAMC(true);
    } else {
      toast.custom(
        <StatusMessage type='error' title='Still offline. Please check your connection.' />,
        { duration: 2000 }
      );
    }
    
    // Hide checking connection message
    setCheckingConnection(false);
  };

  // Filter services based on search
  const getFilteredServices = () => {
    if (!searchQuery) return amcServices

    const query = searchQuery.toLowerCase()
    return amcServices.filter(service =>
      service.name?.toLowerCase().includes(query) ||
      service.title?.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query)
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

  // Loading state
  if (loading && !refreshing) {
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

  // If offline, show NoInternet screen
  if (!isConnected && !loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header
          title={'AMC Services'}
          titlePosition='left'
          containerStyle='bg-transparent px-4 py-3 flex-row items-center justify-between'
          titleStyle='font-bold text-xl text-black'
        />
        <View className="px-4 mt-1 mb-2">
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
        
        {/* Show checking connection message when retry is clicked */}
        {checkingConnection && (
          <View className="px-4 mt-2">
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <View className="flex-row items-center justify-center">
                <ActivityIndicator size="small" color="#3B82F6" />
                <Text className="text-blue-600 text-center text-sm ml-2">
                  Checking connection...
                </Text>
              </View>
            </View>
          </View>
        )}
        
        <NoInternet onRetry={handleRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <View className="absolute inset-0 z-50 w-90% pointer-events-none">
        <Toaster />
      </View>
      <Header
        title={'AMC Services'}
        titlePosition='left'
        containerStyle='bg-transparent px-4 py-3 flex-row items-center justify-between'
        titleStyle='font-bold text-xl text-black'
      />

      {/* Show checking connection message when retry is clicked (online mode) */}
      {checkingConnection && (
        <View className="px-4 mt-2">
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-blue-600 text-center text-sm ml-2">
                Checking connection...
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Optional: Show banner when checking connection from hook */}
      {isChecking && !checkingConnection && (
        <View className="px-4 mt-2">
          <View className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <Text className="text-blue-600 text-center text-sm">
              Checking connection...
            </Text>
          </View>
        </View>
      )}

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

      {/* Services Grid with Pull to Refresh */}
      <ScrollView
        className="flex-1 px-4 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#58A890']}
            tintColor="#58A890"
            title="Pull to refresh"
            titleColor="#58A890"
          />
        }
      >
        <View className="flex-row flex-wrap justify-between">
          {filteredServices.length > 0 ? (
            filteredServices.map((service, index) => (
              <TouchableOpacity
                onPress={() => handleCardPress(service)}
                key={ index}
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
              <Search size={50} color="#CCCCCC" />
              <Text className="text-text-tertiary text-center mt-4">
                {searchQuery ? 'No AMC services match your search' : 'No AMC services available'}
              </Text>
              {searchQuery && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  className="mt-2 px-4 py-2 bg-primary-sage/10 rounded-lg"
                >
                  <Text className="text-primary-sage">Clear Search</Text>
                </TouchableOpacity>
              )}
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