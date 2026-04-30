import { Text, View, TouchableOpacity, ScrollView, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { TermsSupport } from '../../lib/api' // Import the API function directly

const Support = () => {
  const [supportData, setSupportData] = useState({
    mobile: '',
    mobile2: '',
    email: '',
    hours: ''
  })
  const [loading, setLoading] = useState(true)

  

  // Fetch support data on component mount
  useEffect(() => {
    fetchSupportData()
  }, [])

  const fetchSupportData = async () => {
    setLoading(true)
    try {
      const response = await TermsSupport() // Call the imported API function directly
      console.log('TermsSupport api response:', response)

      if (response.data?.success && response.data?.data?.length > 0) {
        const supportInfo = response.data.data[0]

        setSupportData({
          mobile: supportInfo.mobile || '',
          mobile2: supportInfo.mobile2 || '',
          email: supportInfo.email || '',
          hours: supportInfo.hours || '24/7 Support Available',
          address:supportInfo?.address
        })
      } else {
        // Set default values if API response structure is unexpected
        setSupportData({
          mobile: 'N/A',
          mobile2: 'N/A',
          email: 'N/A',
          hours: '24/7 Support Available'
        })
      }
    } catch (error) {
      console.error('Error fetching support data:', error)
      // Set default values if API fails
      setSupportData({
        mobile: '+917055880880',
        mobile2: '+917252043100',
        email: 'dainikcare@gmail.com',
        hours: '24/7 Support Available'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleContactPress = (type, value) => {
    switch (type) {
      case 'email':
        if (value) Linking.openURL(`mailto:${value}`)
        break
      case 'phone':
        if (value) Linking.openURL(`tel:${value}`)
        break
      case 'website':
        if (value) Linking.openURL(`https://${value}`)
        break
      default:
        break
    }
  }

  const SupportCard = ({ item }) => (
    <TouchableOpacity
      className="bg-white p-5 rounded-2xl mb-3 flex-row items-center border border-gray-100"
      style={{
        shadowColor: '#88D8C0',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2
      }}
    >
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mr-4"
        style={{ backgroundColor: item.iconColor + '15' }}
      >
        <Icon name={item.icon} size={28} color={item.iconColor} />
      </View>

      <View className="flex-1">
        <Text className="text-gray-800 text-lg font-semibold mb-1">{item.title}</Text>
        <Text className="text-gray-500 text-sm">{item.description}</Text>
      </View>

      <Icon name="chevron-right" size={20} color="#BBBBBB" />
    </TouchableOpacity>
  )

  const ContactInfoItem = ({ item }) => (
    <TouchableOpacity
      className="flex-row items-center py-3"
      onPress={() => handleContactPress(item.type, item.value)}
      disabled={item.type === 'hours'}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: item.color + '15' }}
      >
        <Icon name={item.icon} size={18} color={item.color} />
      </View>

      <View className="flex-1">
        <Text className="text-gray-600 text-xs uppercase tracking-wider mb-1">{item.type}</Text>
        <Text className="text-gray-800 text-base">{item.value}</Text>
      </View>

      {item.type !== 'hours' && item.type !== 'address'  && (
        <Icon name="open-in-new" size={18} color="#BBBBBB" />
      )}
    </TouchableOpacity>
  )

  // Prepare contact info array from API data
  const contactInfo = [
    {
      id: '1',
      type: 'email',
      value: supportData.email,
      icon: 'email',
      color: '#88D8C0'
    },
    {
      id: '2',
      type: 'phone',
      value: supportData.mobile,
      icon: 'phone',
      color: '#58A890'
    },
    {
      id: '3',
      type: 'phone',
      value: supportData.mobile2,
      icon: 'phone',
      color: '#70C0A8'
    },
    {
      id: '4',
      type: 'hours',
      value: supportData.hours,
      icon: 'access-time',
      color: '#777777'
    },
    {
      id: '5',
      type: 'address',
      value: supportData.address,
      icon: 'access-time',
      color: '#777777'
    }
  ]

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title={'Support'}
        titlePosition='left'
        titleStyle='font-bold text-xl'
      />

      <ScrollView
        className="flex-1 px-4 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Loading Indicator */}
        {loading && (
          <View className="py-10 items-center">
            <Text className="text-gray-500">Loading support information...</Text>
          </View>
        )}

       

        {/* Contact Information */}
        <View className="mt-6 bg-white rounded-2xl p-5 border border-gray-100">
          <View className="flex-row items-center mb-4">
            <View className="w-8 h-8 rounded-full bg-primary-sage50 items-center justify-center mr-3">
              <Icon name="contact-support" size={16} color="#88D8C0" />
            </View>
            <Text className="text-gray-800 text-lg font-semibold">Contact Information</Text>
          </View>

          {!loading && contactInfo.map(item => (
            <ContactInfoItem key={item.id} item={item} />
          ))}
        </View>

        {/* Quick Help Section */}
        <View className="mt-6 bg-primary-sage50 rounded-2xl p-5 border border-primary-sage200">
          <View className="flex-row items-center mb-3">
            <Icon name="lightbulb" size={20} color="#88D8C0" />
            <Text className="text-gray-800 text-base font-semibold ml-2">Quick Help</Text>
          </View>

          <Text className="text-gray-600 text-sm leading-5 mb-4">
            Having trouble? Check our FAQ section for instant answers to common questions,
            or start a live chat with our support team.
          </Text>

        
        </View>

        {/* Response Time Badge */}
        <View className="mt-6 items-center">
          <View className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full">
            <Icon name="schedule" size={16} color="#777777" />
            <Text className="text-gray-600 text-xs ml-2">Average response time: 2-4 hours</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Support