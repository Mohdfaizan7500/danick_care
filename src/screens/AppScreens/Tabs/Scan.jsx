import { StyleSheet, Text, View, } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Scan = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Scan</Text>
        <Text style={styles.subtitle}>Scan Screen Content</Text>
      </View>
    </SafeAreaView>
  )
}

export default Scan

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
})