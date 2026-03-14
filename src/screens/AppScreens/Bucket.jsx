import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { toast, Toaster } from 'sonner-native'
import Header from '../../components/Header'

const Bucket = () => {

  const handleClick = () => {
    // toast.success('gyyt')
    toast.custom(
      <View style={{ backgroundColor: 'red', padding: 12, marginTop: 10, marginHorizontal: 10, borderRadius: 8 }}>
        <Text style={{ color: 'white' }}>gyyt</Text>
      </View>,
      { duration: 3000 }
    );
  }
  return (
    <>

      <View className='flex-1 bg-red-100'>
        <View className="absolute inset-0 z-40 pointer-events-none">
          <Toaster />

        </View>

        <Header title={'gffgufgehfgerufguuifuieiifierfui'} />
        <Text className='text-4xl'>yguyeuyewfguyegffguyfgejdjhfjefuergfuergfuergfuergtfuerfgeutgfeutfghjfdhfhyfgyfyfewyufyfewyfu</Text>
        <View className='flex-1 justify-center  items-center'>

          <TouchableOpacity onPress={handleClick} className='bg-blue-400 px-10 rounded-2xl py-4'>
            <Text>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  )
}

export default Bucket

const styles = StyleSheet.create({})