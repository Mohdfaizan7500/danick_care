import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { Search, Package, Wrench, Hash, Camera, RefreshCw, Filter, ChevronDown } from 'lucide-react-native'
import { useAuth } from '../../context/AuthContext'
import { ReplacePartsCount, TechnicianReplacePart } from '../../lib/api'

const ReplaceParts = () => {
  const { user } = useAuth();
  console.log('Authenticated user:', user);

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)

  // State for dynamic data
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [counts, setCounts] = useState({
    AllPart: 0,
    TechParts: 0,
    AdminParts: 0
  })
  const [parts, setParts] = useState([])
  const [activeFilter, setActiveFilter] = useState('') // '', 'Yes', 'No'
  
  // Refs to track loading states and prevent multiple calls
  const isInitialLoadDone = useRef(false)
  const isRefreshingRef = useRef(false)
  const isLoadingRef = useRef(false)
  const activeFilterRef = useRef('')

  // Get technician_id from user context
  const technicianId = user?.id || '1'

  // Update ref when activeFilter changes
  useEffect(() => {
    activeFilterRef.current = activeFilter
  }, [activeFilter])

  // Load counts - wrapped with ref check
  const loadCounts = useCallback(async () => {
    try {
      const payload = { technician_id: technicianId }
      const response = await ReplacePartsCount(payload)
      console.log('Counts response:', response)
      if (response?.data?.success) {
        setCounts({
          AllPart: response.data.AllPart || 0,
          TechParts: response.data.TechParts || 0,
          AdminParts: response.data.AdminParts || 0
        })
      }
    } catch (error) {
      console.error('Error loading counts:', error)
    }
  }, [technicianId])

  // Load parts - wrapped with ref check to prevent multiple calls
  const loadParts = useCallback(async (accept, isInitial = false) => {
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      console.log('Load parts already in progress, skipping...')
      return
    }

    isLoadingRef.current = true
    
    try {
      const payload = {
        technician_id: technicianId,
        accept: accept || ''
      }
      const response = await TechnicianReplacePart(payload)
      console.log('Parts response:', response)
      if (response?.data?.success) {
        setParts(response.data.data || [])
        if (!isInitial) {
          setActiveFilter(accept)
        }
      }
    } catch (error) {
      console.error('Error loading parts:', error)
    } finally {
      isLoadingRef.current = false
    }
  }, [technicianId])

  // Load initial data - only once
  const loadInitialData = useCallback(async () => {
    if (isInitialLoadDone.current) return
    
    setLoading(true)
    try {
      await Promise.all([
        loadCounts(),
        loadParts('', true)
      ])
        
      isInitialLoadDone.current = true
    } catch (error) {
      console.error('Error loading initial data:', error)
    } finally {
      setLoading(false)
    }
  }, [loadCounts, loadParts])

  // Initial load effect
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Pull to refresh handler - completely isolated
  const onRefresh = useCallback(async () => {
    // Prevent multiple refreshes
    if (isRefreshingRef.current || isLoadingRef.current) {
      console.log('Refresh or load already in progress, skipping...')
      return
    }
    
    isRefreshingRef.current = true
    setRefreshing(true)
    
    try {
      // Get current filter value
      const currentFilter = activeFilterRef.current
      
      // Refresh both in parallel
      await Promise.all([
        loadCounts(),
        loadParts(currentFilter)
      ])
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setRefreshing(false)
      isRefreshingRef.current = false
    }
  }, [loadCounts, loadParts])

  // Handle card clicks with proper checks
  const handleTotalPartsClick = useCallback(() => {
    if (activeFilterRef.current !== '' && !isLoadingRef.current && !isRefreshingRef.current) {
      loadParts('')
    }
  }, [loadParts])

  const handleTechPartsClick = useCallback(() => {
    if (activeFilterRef.current !== 'No' && !isLoadingRef.current && !isRefreshingRef.current) {
      loadParts('No')
    }
  }, [loadParts])

  const handleAdminPartsClick = useCallback(() => {
    if (activeFilterRef.current !== 'Yes' && !isLoadingRef.current && !isRefreshingRef.current) {
      loadParts('Yes')
    }
  }, [loadParts])

  // Get status based on part_accept
  const getPartStatus = (partAccept) => {
    if (partAccept === 'Yes') return 'returned'
    if (partAccept === 'No') return 'pending'
    return 'available'
  }

  // Filter parts based on search query
  const getFilteredParts = useCallback(() => {
    if (!searchQuery) return parts

    const query = searchQuery.toLowerCase()
    return parts.filter(part =>
      part.part_name?.toLowerCase().includes(query) ||
      part.qr_code?.toLowerCase().includes(query) ||
      part.description?.toLowerCase().includes(query) ||
      part.id?.toString().includes(query)
    )
  }, [searchQuery, parts])

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'returned':
        return 'bg-green-500'
      case 'pending':
        return 'bg-red-400'
      default:
        return 'bg-gray-400'
    }
  }

  const filteredParts = getFilteredParts()

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title={'Replace Parts'}
        titlePosition='left'
        containerStyle='bg-transparent px-4 py-4 flex-row items-center justify-between'
        titleStyle='font-bold text-xl text-gray-900'
      />

      {/* Loading Indicator */}
      {loading && !refreshing && (
        <View className="flex-1 justify-center items-center py-10">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Loading parts...</Text>
        </View>
      )}

      {/* Main ScrollView with all content */}
      {!loading && (
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
              title="Pull to refresh"
              titleColor="#3B82F6"
            />
          }
        >
          {/* Statistics Cards */}
          <View className="px-4 mt-2">
            <View className="flex-row justify-between">
              {/* Total Parts Card */}
              <TouchableOpacity
                onPress={handleTotalPartsClick}
                className={`flex-row items-center justify-between rounded-xl p-3 flex-1 mr-2 border ${
                  activeFilter === '' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-green-50 border-green-500'
                }`}
                activeOpacity={0.7}
                disabled={loading || refreshing}
              >
                <View className="flex-1">
                  <Text className={`text-xs ${activeFilter === '' ? 'text-blue-700' : 'text-green-700'}`}>
                    Total Parts
                  </Text>
                  <View className='flex-row items-center justify-between w-full mt-2'>
                    <Text className={`text-lg font-bold ${activeFilter === '' ? 'text-blue-700' : 'text-gray-900'}`}>
                      {counts.AllPart}
                    </Text>
                    <Package size={20} color={activeFilter === '' ? "#3B82F6" : "#88D8C0"} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Technician Parts Card */}
              <TouchableOpacity
                onPress={handleTechPartsClick}
                className={`flex-row items-center justify-between rounded-xl p-3 flex-1 mx-2 border ${
                  activeFilter === 'No' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-yellow-50 border-yellow-500'
                }`}
                activeOpacity={0.7}
                disabled={loading || refreshing}
              >
                <View className="flex-1">
                  <Text className={`text-xs ${activeFilter === 'No' ? 'text-blue-700' : 'text-yellow-700'}`}>
                    Pending
                  </Text>
                  <View className='flex-row items-center justify-between w-full mt-2'>
                    <Text className={`text-lg font-bold ${activeFilter === 'No' ? 'text-blue-700' : 'text-gray-900'}`}>
                      {counts.TechParts}
                    </Text>
                    <RefreshCw size={20} color={activeFilter === 'No' ? "#3B82F6" : "#F0B27A"} />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Admin Parts Card */}
              <TouchableOpacity
                onPress={handleAdminPartsClick}
                className={`flex-row items-center justify-between rounded-xl p-3 flex-1 ml-2 border ${
                  activeFilter === 'Yes' 
                    ? 'bg-blue-50 border-blue-500' 
                    : 'bg-violet-50 border-violet-500'
                }`}
                activeOpacity={0.7}
                disabled={loading || refreshing}
              >
                <View className="flex-1">
                  <Text className={`text-xs ${activeFilter === 'Yes' ? 'text-blue-700' : 'text-violet-700'}`}>
                    Returned
                  </Text>
                  <View className='flex-row items-center justify-between w-full mt-2'>
                    <Text className={`text-lg font-bold ${activeFilter === 'Yes' ? 'text-blue-700' : 'text-gray-900'}`}>
                      {counts.AdminParts}
                    </Text>
                    <Wrench size={20} color={activeFilter === 'Yes' ? "#3B82F6" : "#9370DB"} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Filter Indicator */}
          {activeFilter !== '' && (
            <View className="px-4 mt-2">
              <View className="rounded-lg p-2 border bg-blue-50 border-blue-500">
                <Text className="text-blue-700 text-sm text-center">
                  Showing: {activeFilter === 'Yes' ? 'Admin Parts (Returned)' : 'Technician Parts (Pending)'}
                </Text>
              </View>
            </View>
          )}

          {/* Search Bar */}
          <View className="px-4 mt-2">
            <View className="flex-row items-center bg-white rounded-2xl border border-gray-200 px-3 py-0 shadow-sm">
              <Search size={20} color="#999999" />
              <TextInput
                className="flex-1 ml-2 text-gray-900 py-3"
                placeholder="Search by part name, QR code, description..."
                placeholderTextColor="#999999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Results Count */}
          <View className="px-4 mt-2">
            <Text className="text-gray-500 text-sm">
              Showing {filteredParts.length} of {parts.length} parts
            </Text>
          </View>

          {/* Parts List */}
          {filteredParts.length > 0 ? (
            filteredParts.map((part) => {
              const status = getPartStatus(part.accept_by_admin)
              // Apply status filter from dropdown
              if (selectedStatus !== 'all' && status !== selectedStatus) return null

              return (
                <TouchableOpacity
                  key={part.id}
                  className="bg-white rounded-xl p-4 mb-3 mx-4 border border-gray-200 shadow-sm"
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedPart(part)
                    setShowImageModal(true)
                  }}
                >
                  <View className="flex-row">
                    {/* Part Image */}
                    <View className="mr-3">
                      <Image
                        source={{ uri: part.part_image || 'https://via.placeholder.com/100' }}
                        className="w-20 h-20 rounded-lg bg-gray-50"
                        resizeMode="cover"
                        onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                      />
                    </View>

                    {/* Part Details */}
                    <View className="flex-1">
                      {/* Header with ID and Status */}
                      <View className="flex-row justify-between items-start mb-1">
                        <View className="flex-row items-center">
                          <Hash size={14} color="#666666" />
                          <Text className="text-gray-900 font-bold text-sm ml-1">{part.qr_code || part.id}</Text>
                        </View>
                        <View className={`px-2 py-1 rounded-full ${getStatusColor(status)}`}>
                          <Text className="text-white text-xs capitalize">{status}</Text>
                        </View>
                      </View>

                      {/* Part Name */}
                      <Text className="text-gray-900 font-semibold text-base">
                        {part.part_name}
                      </Text>

                      {/* Description (limited) */}
                      <Text className="text-gray-600 text-sm mb-1" numberOfLines={2}>
                        {part.description || 'No description available'}
                      </Text>

                      {/* Price */}
                      <View className="flex-row items-center mb-2">
                        <Text className="text-gray-900 font-semibold">
                          ₹{part.part_price}
                        </Text>
                        <Text className="text-gray-500 text-xs ml-2">
                          Transfer by: {part.transfer_by}
                        </Text>
                      </View>

                      
                    </View>
                  </View>
                </TouchableOpacity>
              )
            })
          ) : (
            <View className="flex-1 items-center justify-center py-10">
              <Package size={48} color="#CCCCCC" />
              <Text className="text-gray-500 text-center mt-4">
                No parts found matching your search
              </Text>
            </View>
          )}

          {/* Bottom Spacing */}
          <View className="h-4" />
        </ScrollView>
      )}

      {/* Image Modal */}
      {showImageModal && selectedPart && (
        <View className="absolute inset-0 bg-black/80 justify-center items-center z-50">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10 bg-black/50 rounded-full p-2"
            onPress={() => setShowImageModal(false)}
          >
            <Text className="text-white text-xl">✕</Text>
          </TouchableOpacity>

          <View className="w-full px-4">
            <Text className="text-white text-lg font-bold mb-2">
              {selectedPart.part_name}
            </Text>
            <Image
              source={{ uri: selectedPart.part_image || 'https://via.placeholder.com/300' }}
              className="w-full h-80 bg-gray-100 rounded-xl"
              resizeMode="contain"
              onError={(e) => console.log('Modal image error:', e.nativeEvent.error)}
            />

            <View className="bg-white rounded-lg p-4 mt-4">
              <Text className="text-gray-900 font-semibold mb-2">Part Details:</Text>
              <Text className="text-gray-600">Complaint ID: {selectedPart.id}</Text>
              <Text className="text-gray-600">QR Code: {selectedPart.qr_code}</Text>
              <Text className="text-gray-600">Transfer By: {selectedPart.transfer_by}</Text>
              <Text className="text-gray-600">Price: ₹{selectedPart.part_price}</Text>
              <Text className="text-gray-600 mt-2">Description:</Text>
              <Text className="text-gray-600">{selectedPart.description || 'No description available'}</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default ReplaceParts

const styles = StyleSheet.create({})