import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native'
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import Header from '../../components/Header'
import { Filter, Search, Clock, MapPin, User, Wrench, ChevronDown, RotateCcw } from 'lucide-react-native'
import { getComplaints, getDeshBoardCount } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { toast, Toaster } from 'sonner-native'
import StatusMessage from '../../components/StatusMessage'

// Filter options as a constant object
const FILTER_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_MONTH: 'lastMonth',
  SPECIFIC: 'specific',
  ALL: 'all'
}

const MyComplaints = () => {
  const { user } = useAuth()
  const navigation = useNavigation()

  // State declarations
  const [selectedFilter, setSelectedFilter] = useState(FILTER_PERIODS.ALL)
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  // State for API data
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  // State for dashboard counts
  const [dashboardCounts, setDashboardCounts] = useState({
    all: 0,
    assign: 0,
    onworking: 0,
    completed: 0,
    cancel: 0,
    bucket: 0,
    prebooking: 0,
    amc: 0,
    payout: 0,
    allQr: 0,
    unusedQr: 0,
    usedQr: 0
  })

  // Refs to prevent double API calls
  const isInitialized = useRef(false)
  const isFetchingComplaints = useRef(false)
  const isFetchingDashboard = useRef(false)
  const toastShownRef = useRef(false)

  // Memoized technician ID
  const technicianId = useMemo(() => {
    return user?.id || user?.technician_id || null
  }, [user?.id, user?.technician_id])

  // Fetch dashboard counts - only once
  const fetchDashboardCounts = useCallback(async () => {
    // Prevent duplicate calls
    if (isFetchingDashboard.current) {
      console.log('Dashboard counts already fetching, skipping...')
      return
    }

    if (!technicianId) {
      console.error('No technician ID found')
      return
    }

    try {
      isFetchingDashboard.current = true
      const payload = {
        technician_id: technicianId.toString()
      }

      console.log('Fetching Dashboard Counts API...')
      const response = await getDeshBoardCount(payload)
      console.log('Dashboard Counts Response:', response?.data)

      if (response?.data?.success) {
        setDashboardCounts({
          all: response.data.all || 0,
          assign: response.data.assign || 0,
          onworking: response.data.onworking || 0,
          completed: response.data.completed || 0,
          cancel: response.data.cancel || 0,
          bucket: response.data.bucket || 0,
          prebooking: response.data.prebooking || 0,
          amc: response.data.amc || 0,
          payout: response.data.payout || 0,
          allQr: response.data.allQr || 0,
          unusedQr: response.data.unusedQr || 0,
          usedQr: response.data.usedQr || 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard counts:', error)
    } finally {
      isFetchingDashboard.current = false
    }
  }, [technicianId])

  // Fetch complaints from API - only once per page
  const fetchComplaints = useCallback(async (page = 1, isRefresh = false, showToast = false) => {
    // Prevent duplicate simultaneous fetches
    if (isFetchingComplaints.current) {
      console.log('Already fetching complaints, skipping...')
      return
    }

    if (!technicianId) {
      console.error('No technician ID found')
      toast.custom(
        <StatusMessage type='error' title='Error' message='Technician ID not found' />
      )
      return
    }

    try {
      isFetchingComplaints.current = true

      if (isRefresh) {
        setRefreshing(true)
      } else if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      console.log(`Fetching Complaints API - Page: ${page}, Refresh: ${isRefresh}`)
      // Always fetch with status 'success'
      const response = await getComplaints(technicianId, 'success', page)
      console.log('Complaints API Response:', response?.data)

      if (response?.data?.success && response?.data?.result) {
        const newComplaints = response.data.result

        if (isRefresh || page === 1) {
          setComplaints(newComplaints)
        } else {
          setComplaints(prev => [...prev, ...newComplaints])
        }

        // Check if there are more pages
        const currentPageNum = parseInt(response.data.page) || page
        const limit = parseInt(response.data.limit) || 10
        const hasMorePages = newComplaints.length === limit
        setHasMore(hasMorePages)
        setCurrentPage(currentPageNum)

        // Show success toast only if explicitly requested and not already shown
        if (showToast && !toastShownRef.current) {
          toastShownRef.current = true
          toast.custom(
            <StatusMessage
              type='success'
              title='Refresh Successful'
              message={`Loaded ${newComplaints.length} complaints`}
            />, { duration: 500 }
          )
          setTimeout(() => {
            toastShownRef.current = false
          }, 1000)
        }
      } else {
        if (page === 1) {
          setComplaints([])
        }
        setHasMore(false)

        // Show info toast on refresh if no data and explicitly requested
        if (showToast && !toastShownRef.current) {
          toastShownRef.current = true
          toast.custom(
            <StatusMessage
              type='info'
              title='No Data'
              message='No complaints found'
            />
          )
          setTimeout(() => {
            toastShownRef.current = false
          }, 1000)
        }
      }
    } catch (error) {
      console.error('Error fetching complaints:', error)

      // Show error toast on refresh if explicitly requested
      if (showToast && !toastShownRef.current) {
        toastShownRef.current = true
        toast.custom(
          <StatusMessage
            type='error'
            title='Refresh Failed'
            message={error.message || 'Failed to load complaints'}
          />
        )
        setTimeout(() => {
          toastShownRef.current = false
        }, 1000)
      } else if (page === 1 && !showToast) {
        toast.custom(
          <StatusMessage type='error' title='Error' message={error.message || 'Failed to load complaints'} />
        )
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
      isFetchingComplaints.current = false
    }
  }, [technicianId])

  // Initial load - ONLY ONCE
  useEffect(() => {
    // Check if already initialized
    if (isInitialized.current) {
      console.log('Already initialized, skipping initial load...')
      return
    }

    if (technicianId) {
      console.log('Initial load started...')
      isInitialized.current = true

      const initializeData = async () => {
        await Promise.all([
          fetchDashboardCounts(),
          fetchComplaints(1, false, false)
        ])
        console.log('Initial load completed')
      }
      initializeData()
    }

    // Cleanup function
    return () => {
      console.log('Component unmounting...')
    }
  }, [technicianId]) // Only run when technicianId changes

  // Handle refresh - reset refs to allow new fetch
  const onRefresh = useCallback(async () => {
    console.log('Manual refresh triggered...')

    // Reset fetching flags to allow new requests
    isFetchingDashboard.current = false
    isFetchingComplaints.current = false
    toastShownRef.current = false

    try {
      await Promise.all([
        fetchDashboardCounts(),
        fetchComplaints(1, true, true)
      ])
      console.log('Manual refresh completed')
    } catch (error) {
      console.error('Refresh error:', error)
      if (!toastShownRef.current) {
        toastShownRef.current = true
        toast.custom(
          <StatusMessage
            type='error'
            title='Refresh Failed'
            message='Unable to refresh data. Please try again.'
          />
        )
        setTimeout(() => {
          toastShownRef.current = false
        }, 1000)
      }
    }
  }, [fetchDashboardCounts, fetchComplaints])

  // Handle load more
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading && !refreshing && !isFetchingComplaints.current) {
      console.log(`Loading more - Page: ${currentPage + 1}`)
      fetchComplaints(currentPage + 1, false, false)
    }
  }, [loadingMore, hasMore, loading, refreshing, currentPage, fetchComplaints])

  // Handle card press - Navigate to complaint details
  const handleCardPress = useCallback((complaint) => {
    // Show toast with complaint ID
    toast.custom(
      <StatusMessage
        type='info'
        title='Complaint Selected'
        message={`Complaint #${complaint.id} - ${complaint.customer_name}`}
      />
    )

    // Navigate to complaint details screen
    navigation.navigate('QRCodeDetails', { complaint, status: "complaint" });
  }, [navigation])

  // Memoized filtered complaints based on search and date filter
  const filteredComplaints = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const last7Days = new Date(today)
    last7Days.setDate(last7Days.getDate() - 7)

    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    let filtered = [...complaints]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(complaint => {
        const matchesSearch =
          complaint.id?.toString().toLowerCase().includes(query) ||
          complaint.csn?.toLowerCase().includes(query) ||
          complaint.customer_name?.toLowerCase().includes(query) ||
          complaint.service_name?.toLowerCase().includes(query) ||
          complaint.service_address?.toLowerCase().includes(query)

        return matchesSearch
      })
    }

    // Apply date filter based on slot_date
    filtered = filtered.filter(complaint => {
      if (!complaint.slot_date) return true

      // Parse slot_date (format: "18-04-2026")
      const dateParts = complaint.slot_date.split('-')
      const complaintDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0])
      complaintDate.setHours(0, 0, 0, 0)

      switch (selectedFilter) {
        case FILTER_PERIODS.TODAY:
          return complaintDate.getTime() === today.getTime()
        case FILTER_PERIODS.YESTERDAY:
          return complaintDate.getTime() === yesterday.getTime()
        case FILTER_PERIODS.LAST_7_DAYS:
          return complaintDate >= last7Days
        case FILTER_PERIODS.LAST_MONTH:
          return complaintDate >= lastMonth
        case FILTER_PERIODS.SPECIFIC:
          if (selectedDate) {
            const filterDate = new Date(selectedDate)
            filterDate.setHours(0, 0, 0, 0)
            return complaintDate.getTime() === filterDate.getTime()
          }
          return true
        default:
          return true
      }
    })

    return filtered
  }, [complaints, searchQuery, selectedFilter, selectedDate])

  // Memoized grouped complaints
  const groupedComplaints = useMemo(() => {
    const groups = {}

    filteredComplaints.forEach(complaint => {
      if (complaint.slot_date) {
        const dateParts = complaint.slot_date.split('-')
        const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0])
        const dateKey = date.toDateString()

        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(complaint)
      } else {
        // Handle complaints without date
        if (!groups['No Date']) {
          groups['No Date'] = []
        }
        groups['No Date'].push(complaint)
      }
    })

    // Sort dates in descending order (newest first)
    const sortedGroups = Object.keys(groups).sort((a, b) => {
      if (a === 'No Date') return 1
      if (b === 'No Date') return -1
      return new Date(b) - new Date(a)
    })

    const sortedGroupedComplaints = {}
    sortedGroups.forEach(key => {
      sortedGroupedComplaints[key] = groups[key]
    })

    return sortedGroupedComplaints
  }, [filteredComplaints])

  // Memoized counts
  const totalCount = useMemo(() => dashboardCounts.completed, [dashboardCounts.completed])
  const filteredCount = useMemo(() => filteredComplaints.length, [filteredComplaints])

  // Memoized filter display text
  const getFilterDisplayText = useMemo(() => {
    switch (selectedFilter) {
      case FILTER_PERIODS.ALL:
        return 'All Time'
      case FILTER_PERIODS.TODAY:
        return 'Today'
      case FILTER_PERIODS.YESTERDAY:
        return 'Yesterday'
      case FILTER_PERIODS.LAST_7_DAYS:
        return 'Last 7 Days'
      case FILTER_PERIODS.LAST_MONTH:
        return 'Last Month'
      case FILTER_PERIODS.SPECIFIC:
        return selectedDate || 'Select Date'
      default:
        return 'All Time'
    }
  }, [selectedFilter, selectedDate])

  // Memoized status info function
  const getStatusInfo = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return { color: 'bg-green-500', text: 'Completed' }
      case 'pending':
        return { color: 'bg-yellow-500', text: 'Pending' }
      case 'in-progress':
        return { color: 'bg-blue-500', text: 'In Progress' }
      case 'cancel':
      case 'cancelled':
        return { color: 'bg-red-500', text: 'Cancelled' }
      default:
        return { color: 'bg-gray-400', text: status || 'Unknown' }
    }
  }, [])

  // Memoized rating color function
  const getRatingColor = useCallback((rating) => {
    if (!rating || rating === '0/0') return 'text-gray-400'
    const ratingValue = parseFloat(rating.split('/')[0])
    if (ratingValue >= 4) return 'text-green-600'
    if (ratingValue >= 3) return 'text-yellow-600'
    return 'text-red-600'
  }, [])

  // Memoized rating format function
  const formatRating = useCallback((rating) => {
    if (!rating || rating === '0/0') return 'Not rated'
    return rating
  }, [])

  // Memoized date title function
  const getDateTitle = useCallback((dateKey) => {
    if (dateKey === 'No Date') return 'No Date'

    const date = new Date(dateKey)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.getTime() === today.getTime()) {
      return 'Today'
    } else if (date.getTime() === yesterday.getTime()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }, [])

  // Memoized scroll handler
  const handleScrollEnd = useCallback((e) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent
    const isEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20
    if (isEnd && hasMore && !loadingMore && !loading && !refreshing && !isFetchingComplaints.current) {
      loadMore()
    }
  }, [hasMore, loadingMore, loading, refreshing, loadMore])

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-secondary">
        <Header
          title={'My Complaints'}
          titlePosition='left'
          containerStyle='bg-transparent px-4 py-4 flex-row items-center justify-between'
          titleStyle='font-bold text-xl text-black'
        />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#58A890" />
          <Text className="mt-4 text-text-secondary">Loading complaints...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <View className="absolute inset-0 z-50 pointer-events-none">
        <Toaster />
      </View>
      <Header
        title={'My Complaints'}
        titlePosition='left'
        containerStyle='bg-transparent px-4 py-4 flex-row items-center justify-between'
        titleStyle='font-bold text-xl text-black'
      />

      {/* Stats Banner */}
      <View className="px-4 mb-2">
        <View className="bg-primary-sage100 rounded-xl p-3 flex-row justify-between">
          <View>
            <Text className="text-text-secondary text-sm">Total Complaints</Text>
            <Text className="text-text-primary font-bold text-2xl">{totalCount}</Text>
          </View>
          <View>
            <Text className="text-text-secondary text-sm">Showing</Text>
            <Text className="text-text-primary font-bold text-2xl">{filteredCount}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 mt-2">
        <View className="flex-row items-center bg-ui-card rounded-2xl border border-ui-border px-3 py-0">
          <Search size={20} color="#999999" />
          <TextInput
            className="flex-1 ml-2 text-text-primary py-3"
            placeholder="Search by ID, name, service..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Section */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Filter size={18} color="#666666" />
            <Text className="text-text-secondary ml-2 font-medium">Filter by:</Text>
          </View>

          {/* Filter Dropdown */}
          <View className="relative z-10">
            <TouchableOpacity
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex-row items-center bg-ui-card border border-ui-border rounded-lg px-3 py-2"
            >
              <Text className="text-text-primary mr-2">
                {getFilterDisplayText}
              </Text>
              <ChevronDown size={16} color="#666666" />
            </TouchableOpacity>

            {showFilterDropdown && (
              <View className="absolute top-12 right-0 bg-ui-card border border-ui-border rounded-lg shadow-lg w-40 z-20">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(FILTER_PERIODS.ALL)
                    setShowFilterDropdown(false)
                  }}
                  className="px-4 py-3 border-b border-ui-border"
                >
                  <Text className="text-text-primary">All Time</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(FILTER_PERIODS.TODAY)
                    setShowFilterDropdown(false)
                  }}
                  className="px-4 py-3 border-b border-ui-border"
                >
                  <Text className="text-text-primary">Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(FILTER_PERIODS.YESTERDAY)
                    setShowFilterDropdown(false)
                  }}
                  className="px-4 py-3 border-b border-ui-border"
                >
                  <Text className="text-text-primary">Yesterday</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(FILTER_PERIODS.LAST_7_DAYS)
                    setShowFilterDropdown(false)
                  }}
                  className="px-4 py-3 border-b border-ui-border"
                >
                  <Text className="text-text-primary">Last 7 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(FILTER_PERIODS.LAST_MONTH)
                    setShowFilterDropdown(false)
                  }}
                  className="px-4 py-3 border-b border-ui-border"
                >
                  <Text className="text-text-primary">Last Month</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedFilter(FILTER_PERIODS.SPECIFIC)
                    setShowFilterDropdown(false)
                    setShowDatePicker(true)
                  }}
                  className="px-4 py-3"
                >
                  <Text className="text-text-primary">Specific Date</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Date Picker for Specific Date */}
        {showDatePicker && selectedFilter === FILTER_PERIODS.SPECIFIC && (
          <View className="mt-3 bg-ui-card border border-ui-border rounded-lg p-3">
            <Text className="text-text-secondary mb-2">Select Date (YYYY-MM-DD):</Text>
            <View className="flex-row items-center">
              <TextInput
                className="flex-1 border border-ui-border rounded-lg px-3 py-2 text-text-primary"
                placeholder="2026-03-13"
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholderTextColor="#999999"
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="ml-2 px-4 py-2 bg-primary-sage rounded-lg"
              >
                <Text className="text-white">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Complaints List */}
      <ScrollView
        className="flex-1 px-4 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#58A890']} />
        }
        onMomentumScrollEnd={handleScrollEnd}
      >
        {Object.keys(groupedComplaints).length > 0 ? (
          Object.entries(groupedComplaints).map(([dateKey, complaintsList]) => (
            <View key={dateKey} className="mb-4">
              <Text className="text-text-secondary font-semibold mb-2">
                {getDateTitle(dateKey)}
              </Text>

              {complaintsList.map((complaint) => {
                const statusInfo = getStatusInfo(complaint.status)
                const isRecomplaint = complaint.oldcomp_id && complaint.oldcomp_id !== null

                return (
                  <TouchableOpacity
                    key={complaint.id}
                    onPress={() => handleCardPress(complaint)}
                    className="bg-ui-card rounded-xl p-4 mb-3 border border-ui-border"
                    activeOpacity={0.7}
                  >
                    {/* Header with ID and Status */}
                    <View className="flex-row justify-between items-center mb-3">
                      <View className="flex-row items-center flex-1">
                        <Text className="text-text-primary font-bold">#{complaint.id}</Text>
                        <Text className="text-text-tertiary text-xs ml-2">| {complaint.csn}</Text>
                        <View className={`flex-row items-center ml-2 px-2 py-0.5 rounded-full ${isRecomplaint ? 'bg-orange-100' : 'bg-blue-100'}`}>
                          <Text className={`text-xs ml-1 font-medium ${isRecomplaint ? 'text-orange-600' : 'text-blue-600'}`}>
                            {isRecomplaint ? 'Recomplaint' : 'New'}
                          </Text>
                        </View>
                      </View>
                      <View className={`px-2 py-1 rounded-full ${statusInfo.color}`}>
                        <Text className="text-white text-xs capitalize">{statusInfo.text}</Text>
                      </View>
                    </View>

                    {/* Customer Name */}
                    <View className="flex-row items-center mb-2">
                      <User size={16} color="#666666" />
                      <Text className="text-text-primary ml-2 font-medium">{complaint.customer_name}</Text>
                    </View>

                    {/* Service Name */}
                    <View className="flex-row items-center mb-2">
                      <Wrench size={16} color="#666666" />
                      <Text className="text-text-secondary ml-2 flex-1">{complaint.service_name}</Text>
                    </View>

                    {/* Slot Date & Time */}
                    <View className="flex-row items-center mb-2">
                      <Clock size={16} color="#666666" />
                      <Text className="text-text-secondary ml-2">
                        {complaint.slot_date} | {complaint.slot_time || 'Time not specified'}
                      </Text>
                    </View>

                    {/* Address */}
                    <View className="flex-row items-start mb-2">
                      <MapPin size={16} color="#666666" style={{ marginTop: 2 }} />
                      <Text className="text-text-secondary ml-2 flex-1" numberOfLines={2}>
                        {complaint.service_address}
                      </Text>
                    </View>

                    {/* Rating and Amount */}
                    <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-ui-border">
                      <View className="flex-row items-center">
                        <Text className="text-text-secondary text-sm mr-2">Rating:</Text>
                        <Text className={`font-semibold ${getRatingColor(complaint.rating)}`}>
                          {formatRating(complaint.rating)}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-text-secondary text-sm">Amount:</Text>
                        <Text className="text-primary-sage font-bold">₹{complaint.tot_amt}</Text>
                      </View>
                    </View>

                    {/* Remark if available */}
                    {complaint.remark && complaint.remark !== 'A' && (
                      <View className="mt-2 pt-2 border-t border-ui-border">
                        <Text className="text-text-tertiary text-xs italic">
                          "{complaint.remark}"
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })}
            </View>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-text-tertiary text-center">No complaints found</Text>
          </View>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#58A890" />
            <Text className="text-text-tertiary text-xs mt-2">Loading more...</Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  )
}

export default MyComplaints

const styles = StyleSheet.create({})