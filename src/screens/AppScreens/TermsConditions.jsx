import { StyleSheet, Text, View, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import Header from '../../components/Header'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/Feather'
import { TermsSupport } from '../../lib/api' // Import the API function

const TermsConditions = () => {
  const [activeTab, setActiveTab] = useState('terms')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [termsContent, setTermsContent] = useState([])
  const [policiesContent, setPoliciesContent] = useState([])
  const scrollViewRef = useRef(null)
  const fadeAnim = useRef(new Animated.Value(1)).current

  const tabs = [
    { id: 'terms', label: 'Terms', icon: 'file' },
    { id: 'policies', label: 'Policies', icon: 'shield' }
  ]

  // Fetch support data on component mount
  useEffect(() => {
    fetchTermsData()
  }, [])

  const fetchTermsData = async () => {
    setLoading(true)
    try {
      const response = await TermsSupport()
      console.log('TermsSupport api response:', response)

      if (response.data?.success && response.data?.data?.length > 0) {
        const data = response.data.data[0]

        // Format terms content from API response
        const formattedTerms = formatTermsContent(data.terms)
        setTermsContent(formattedTerms)

        // Format policy content from API response
        const formattedPolicies = formatPolicyContent(data.policy)
        setPoliciesContent(formattedPolicies)
      } else {
        // Set default content if API response is unexpected
        setDefaultContent()
      }
    } catch (error) {
      console.error('Error fetching terms data:', error)
      setDefaultContent()
    } finally {
      setLoading(false)
    }
  }

  const formatTermsContent = (termsText) => {
    if (!termsText) return getDefaultTerms()

    // Split the terms text into sections based on common patterns
    const sections = []

    // Try to split by numbered sections or paragraphs
    const lines = termsText.split(/\\n|\n/)

    // Create sections from the text
    let currentSection = {
      title: 'Terms and Conditions',
      points: []
    }

    lines.forEach(line => {
      line = line.trim()
      if (line.length === 0) return

      // Check if line looks like a section header (starts with number or specific keywords)
      if (line.match(/^\d+\./) ||
        line.match(/^[A-Z][a-z]+:/) ||
        line.toLowerCase().includes('service') ||
        line.toLowerCase().includes('warranty') ||
        line.toLowerCase().includes('cancellation') ||
        line.toLowerCase().includes('payment') ||
        line.toLowerCase().includes('liability')) {

        if (currentSection.points.length > 0) {
          sections.push({ ...currentSection })
        }
        currentSection = {
          title: line.replace(/^\d+\.\s*/, '').replace(':', ''),
          points: []
        }
      } else if (line.length > 0) {
        currentSection.points.push(line)
      }
    })

    if (currentSection.points.length > 0) {
      sections.push(currentSection)
    }

    return sections.length > 0 ? sections : [{
      title: 'Service Terms',
      points: [termsText]
    }]
  }

  const formatPolicyContent = (policyText) => {
    if (!policyText) return getDefaultPolicies()

    const sections = []
    const paragraphs = policyText.split(/\n\n|\n/)

    let currentSection = {
      title: 'Privacy Policy',
      points: []
    }

    paragraphs.forEach(paragraph => {
      paragraph = paragraph.trim()
      if (paragraph.length === 0) return

      if (paragraph.toLowerCase().includes('privacy') ||
        paragraph.toLowerCase().includes('data') ||
        paragraph.toLowerCase().includes('security') ||
        paragraph.toLowerCase().includes('information')) {

        if (currentSection.points.length > 0) {
          sections.push({ ...currentSection })
        }
        currentSection = {
          title: paragraph.substring(0, 50).replace(':', ''),
          points: []
        }
      } else if (paragraph.length > 0) {
        currentSection.points.push(paragraph)
      }
    })

    if (currentSection.points.length > 0) {
      sections.push(currentSection)
    }

    return sections.length > 0 ? sections : [{
      title: 'Privacy Policy',
      points: [policyText]
    }]
  }

  const getDefaultTerms = () => {
    return [
      {
        title: 'Service Agreement',
        points: [
          'Provide accurate appliance information',
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
    ]
  }

  const getDefaultPolicies = () => {
    return [
      {
        title: 'Privacy Policy',
        points: [
          'Your data is never shared',
          'Location access only during service',
          'Photos shared only for work proof'
        ]
      },
      {
        title: 'Safety Policy',
        points: [
          'ID card carrying technicians',
          'Safety gear mandatory',
          'Work area cleaned after service'
        ]
      },
      {
        title: 'Payment Policy',
        points: [
          'Secure payment gateway',
          'Multiple payment options',
          'Digital receipts provided'
        ]
      }
    ]
  }

  const setDefaultContent = () => {
    setTermsContent(getDefaultTerms())
    setPoliciesContent(getDefaultPolicies())
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
      await fetchTermsData()
      console.log('Terms & Conditions refreshed')
    } catch (error) {
      console.error('Error refreshing:', error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Skeleton Loader Components
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

  // Render content based on loading state
  const renderContent = () => {
    if (loading) {
      switch (activeTab) {
        case 'terms':
          return <TermsSkeleton />
        case 'policies':
          return <PoliciesSkeleton />
        default:
          return <TermsSkeleton />
      }
    }

    switch (activeTab) {
      case 'terms':
        return <TabContent content={termsContent} />
      case 'policies':
        return <TabContent content={policiesContent} />
      default:
        return null
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title={'Terms & Policies'}
        titlePosition='left'
        titleStyle='font-bold text-xl text-gray-800'
      />
      <View className='flex-1 bg-gray-50'>

        <View className="px-4 pt-2">
          {/* Last Updated */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Icon name="clock" size={12} color="#9CA3AF" />
              <Text className="text-gray-400 text-xs ml-1">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View className="flex-row bg-white rounded-xl p-1 mb-4">
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                disabled={loading}
                className={`flex-1 py-2.5 rounded-lg flex-row items-center justify-center ${activeTab === tab.id ? 'bg-teal-500' : ''
                  }`}
              >
                <Icon
                  name={tab.icon}
                  size={14}
                  color={activeTab === tab.id ? '#fff' : '#6B7280'}
                />
                <Text
                  className={`ml-1.5 text-sm font-medium ${activeTab === tab.id ? 'text-white' : 'text-gray-600'
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
      </View>
    </SafeAreaView>
  )
}

export default TermsConditions