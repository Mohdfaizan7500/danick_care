import { Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Scan = () => {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1 justify-center items-center p-5">
        <Text className="text-2xl font-bold text-gray-800 mb-2.5">
          Scan
        </Text>
        <Text className="text-base text-gray-600">
          Scan Screen Content
        </Text>
      </View>
    </SafeAreaView>
  )
}

export default Scan