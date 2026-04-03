import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Header from '../../components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Feather'

const TermsConditions = () => {
  const [activeTab, setActiveTab] = useState('terms')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const scrollViewRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  const tabs = [
    { id: 'terms', label: 'Terms', icon: 'file' },
    { id: 'policies', label: 'Policies', icon: 'shield' },
    { id: 'contact', label: 'Contact', icon: 'mail' }
  ]

  const [termsContent, setTermsContent] = useState([
    {
      title: 'Service Agreement',
      points: [
        'Provide accurate AC unit information',
        'Allow technician access to the unit',
        'Payment due upon service completion'
      ]
    },
    {
      title: 'Warranty',
      points: [
        '30 days service warranty',
        '6 months on spare parts',
        'Free re-service for same issue'
      ]
    },
    {
      title: 'Cancellation',
      points: [
        'Free: 24+ hours before',
        '50%: 12-24 hours before',
        'Full: Less than 12 hours'
      ]
    }
  ])

  const [policiesContent, setPoliciesContent] = useState([
    {
      title: 'Privacy',
      points: [
        'Your data is never shared',
        'Location access only during service',
        'Photos shared only for work proof'
      ]
    },
    {
      title: 'Safety',
      points: [
        'ID card carrying technicians',
        'Safety gear mandatory',
        'Work area cleaned after service'
      ]
    },
    {
      title: 'Payment',
      points: [
        'Secure payment gateway',
        'Multiple payment options',
        'Digital receipts provided'
      ]
    }
  ])

  // Simulate initial loading
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      // Data is already loaded from initial state
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Animate refresh
  const animateRefresh = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      })
    ]).start()
  }

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    animateRefresh()
    
    try {
      // Simulate fetching latest terms and conditions
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // You can fetch updated content from your API here
      // const response = await fetchTermsAndConditions()
      // setTermsContent(response.terms)
      // setPoliciesContent(response.policies)
      
      console.log('Terms & Conditions refreshed')
      
    } catch (error) {
      console.error('Error refreshing:', error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Skeleton Loader Components
  const SkeletonLine = ({ width = '100%', height = 14, marginTop = 0 }) => (
    <Animated.View 
      style={{
        width: width,
        height: height,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
        marginTop: marginTop,
        overflow: 'hidden'
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#F3F4F6',
          transform: [{ translateX: useRef(new Animated.Value(-100)).current }]
        }}
      />
    </Animated.View>
  )

  const SkeletonCard = () => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
      <SkeletonLine width="60%" height={20} marginTop={0} />
      <View className="mt-4 space-y-3">
        <SkeletonLine width="90%" height={14} marginTop={8} />
        <SkeletonLine width="85%" height={14} marginTop={8} />
        <SkeletonLine width="95%" height={14} marginTop={8} />
      </View>
    </View>
  )

  const SkeletonContact = () => (
    <View className="bg-white rounded-xl p-6 items-center border border-gray-200">
      <View className="w-16 h-16 rounded-full bg-gray-200 mb-4" />
      <SkeletonLine width="120" height={20} marginTop={0} />
      <SkeletonLine width="180" height={14} marginTop={12} />
      <SkeletonLine width="200" height={48} marginTop={16} />
      <View className="flex-row mt-4 pt-4 border-t border-gray-100">
        <SkeletonLine width="20" height={14} marginTop={0} />
        <SkeletonLine width="120" height={14} marginTop={0} style={{ marginLeft: 8 }} />
      </View>
    </View>
  )

  const ShimmerEffect = () => {
    const shimmerAnim = useRef(new Animated.Value(0)).current

    useEffect(() => {
      const shimmerLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      )
      shimmerLoop.start()

      return () => shimmerLoop.stop()
    }, [])

    const translateX = shimmerAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-200, 200]
    })

    return (
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.4)',
          transform: [{ translateX }]
        }}
      />
    )
  }

  const ShimmerSkeletonCard = () => (
    <View className="bg-white rounded-xl p-4 border border-gray-200 mb-3 overflow-hidden">
      <View className="w-40 h-5 bg-gray-200 rounded-lg" />
      <View className="mt-4 space-y-3">
        <View className="h-3.5 bg-gray-200 rounded-lg w-[90%]" />
        <View className="h-3.5 bg-gray-200 rounded-lg w-[85%]" />
        <View className="h-3.5 bg-gray-200 rounded-lg w-[95%]" />
      </View>
      <ShimmerEffect />
    </View>
  )

  const ShimmerSkeletonContact = () => (
    <View className="bg-white rounded-xl p-6 items-center border border-gray-200 overflow-hidden">
      <View className="w-16 h-16 rounded-full bg-gray-200 mb-4" />
      <View className="w-32 h-5 bg-gray-200 rounded-lg" />
      <View className="w-44 h-3.5 bg-gray-200 rounded-lg mt-3" />
      <View className="w-52 h-12 bg-gray-200 rounded-xl mt-4" />
      <View className="flex-row mt-4 pt-4 border-t border-gray-100">
        <View className="w-5 h-3.5 bg-gray-200 rounded-lg" />
        <View className="w-32 h-3.5 bg-gray-200 rounded-lg ml-2" />
      </View>
      <ShimmerEffect />
    </View>
  )

  const TabContent = ({ content }) => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View className="space-y-3 gap-3">
        {content.map((item, idx) => (
          <View key={idx} className="bg-white rounded-xl p-4 border border-gray-300 shadow-lg">
            <Text className="text-gray-800 font-semibold text-base mb-6">
              {item.title}
            </Text>
            {item.points.map((point, pointIdx) => (
              <View key={pointIdx} className="flex-row items-start mb-2">
                <View className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 mr-2" />
                <Text className="text-gray-600 text-sm flex-1">{point}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </Animated.View>
  )

  // Loading Skeleton for Terms Tab
  const TermsSkeleton = () => (
    <View className="space-y-3 gap-3">
      <ShimmerSkeletonCard />
      <ShimmerSkeletonCard />
      <ShimmerSkeletonCard />
    </View>
  )

  // Loading Skeleton for Policies Tab
  const PoliciesSkeleton = () => (
    <View className="space-y-3 gap-3">
      <ShimmerSkeletonCard />
      <ShimmerSkeletonCard />
      <ShimmerSkeletonCard />
    </View>
  )

  // Loading Skeleton for Contact Tab
  const ContactSkeleton = () => (
    <ShimmerSkeletonContact />
  )

  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      switch (activeTab) {
        case 'terms':
          return <TermsSkeleton />
        case 'policies':
          return <PoliciesSkeleton />
        case 'contact':
          return <ContactSkeleton />
        default:
          return <TermsSkeleton />
      }
    }

    switch (activeTab) {
      case 'terms':
        return <TabContent content={termsContent} />
      case 'policies':
        return <TabContent content={policiesContent} />
      case 'contact':
        return (
          <Animated.View style={{ opacity: fadeAnim }}>
            <View className="bg-white rounded-xl p-6 items-center border border-gray-100 shadow-md">
              <View className="w-16 h-16 rounded-full bg-teal-50 items-center justify-center mb-4">
                <Icon name="headphones" size={28} color="#58A890" />
              </View>
              <Text className="text-gray-800 font-semibold text-lg mb-1">
                Need Help?
              </Text>
              <Text className="text-gray-400 text-sm text-center mb-4">
                Our support team is here 24/7
              </Text>
              <TouchableOpacity className="bg-teal-500 px-6 py-3 rounded-xl w-full">
                <Text className="text-white font-semibold text-center">
                  Contact Support
                </Text>
              </TouchableOpacity>
              <View className="flex-row mt-4 pt-4 border-t border-gray-100">
                <Icon name="mail" size={14} color="#9CA3AF" />
                <Text className="text-gray-500 text-xs ml-2">
                  support@acservice.com
                </Text>
              </View>
            </View>
          </Animated.View>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Header 
        title={'Terms & Policies'}
        titlePosition='left'
        titleStyle='font-bold text-xl text-gray-800'
      />
      
      <View className="px-4 pt-2">
        {/* Last Updated */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Icon name="clock" size={12} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs ml-1">
              Updated: March 13, 2026
            </Text>
          </View>
          <TouchableOpacity>
            <Text className="text-teal-600 text-xs font-medium">View Full PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white rounded-xl p-1 mb-4">
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              disabled={loading}
              className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${
                activeTab === tab.id ? 'bg-teal-500' : ''
              }`}
            >
              <Icon 
                name={tab.icon} 
                size={14} 
                color={activeTab === tab.id ? '#fff' : '#6B7280'} 
              />
              <Text 
                className={`ml-1.5 text-sm font-medium ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-600'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#58A890', '#3FD298', '#88D8C0']}
            tintColor="#58A890"
            title="Pull to refresh"
            titleColor="#9CA3AF"
            progressBackgroundColor="#FFFFFF"
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  )
}

export default TermsConditions