import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { Filter, Search, Clock, MapPin, User, Wrench, ChevronDown } from 'lucide-react-native'

// Mock data for complaints
const mockComplaints = [
  {
    id: 'CMP001',
    csn: 'CSN24031501',
    customerName: 'Rajesh Kumar',
    serviceName: 'AC Gas Refill',
    slotDate: '2026-03-13T10:30:00',
    address: '123, Green Park, New Delhi',
    status: 'pending',
    priority: 'high',
  },
  {
    id: 'CMP002',
    csn: 'CSN24031502',
    customerName: 'Priya Sharma',
    serviceName: 'Compressor Repair',
    slotDate: '2026-03-13T14:00:00',
    address: '456, Model Town, Mumbai',
    status: 'in-progress',
    priority: 'medium',
  },
  {
    id: 'CMP003',
    csn: 'CSN24031401',
    customerName: 'Amit Patel',
    serviceName: 'AC Installation',
    slotDate: '2026-03-12T09:15:00',
    address: '789, Koregaon Park, Pune',
    status: 'resolved',
    priority: 'low',
  },
  {
    id: 'CMP004',
    csn: 'CSN24031402',
    customerName: 'Sneha Reddy',
    serviceName: 'Water Leakage',
    slotDate: '2026-03-12T16:30:00',
    address: '321, Jubilee Hills, Hyderabad',
    status: 'pending',
    priority: 'urgent',
  },
  {
    id: 'CMP005',
    csn: 'CSN24031001',
    customerName: 'Vikram Singh',
    serviceName: 'General Service',
    slotDate: '2026-03-10T11:00:00',
    address: '654, Civil Lines, Jaipur',
    status: 'resolved',
    priority: 'medium',
  },
  {
    id: 'CMP006',
    csn: 'CSN24030901',
    customerName: 'Anjali Desai',
    serviceName: 'Filter Cleaning',
    slotDate: '2026-03-09T13:45:00',
    address: '987, FC Road, Bangalore',
    status: 'cancelled',
    priority: 'low',
  },
  {
    id: 'CMP007',
    csn: 'CSN24030801',
    customerName: 'Mohan Das',
    serviceName: 'Thermostat Issue',
    slotDate: '2026-03-08T15:20:00',
    address: '147, Alwarpet, Chennai',
    status: 'resolved',
    priority: 'medium',
  },
]

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
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Filter complaints based on selected period
  const getFilteredComplaints = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const last7Days = new Date(today)
    last7Days.setDate(last7Days.getDate() - 7)
    
    const lastMonth = new Date(today)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    return mockComplaints.filter(complaint => {
      const complaintDate = new Date(complaint.slotDate)
      complaintDate.setHours(0, 0, 0, 0)

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          complaint.id.toLowerCase().includes(query) ||
          complaint.csn.toLowerCase().includes(query) ||
          complaint.customerName.toLowerCase().includes(query) ||
          complaint.serviceName.toLowerCase().includes(query) ||
          complaint.address.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Apply date filter
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
  }

  // Group complaints by date
  const groupComplaintsByDate = (complaints) => {
    const groups = {}
    
    complaints.forEach(complaint => {
      const date = new Date(complaint.slotDate)
      const dateKey = date.toDateString()
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(complaint)
    })
    
    return groups
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-status-away'
      case 'in-progress':
        return 'bg-status-active'
      case 'resolved':
        return 'bg-status-online'
      case 'cancelled':
        return 'bg-status-busy'
      default:
        return 'bg-gray-400'
    }
  }

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-status-busy'
      case 'high':
        return 'bg-status-away'
      case 'medium':
        return 'bg-status-active'
      case 'low':
        return 'bg-status-online'
      default:
        return 'bg-gray-400'
    }
  }

  // Format date for display
  const getDateTitle = (dateKey) => {
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
  }

  const filteredComplaints = getFilteredComplaints()
  const groupedComplaints = groupComplaintsByDate(filteredComplaints)

  // Calculate pending count
  const pendingCount = filteredComplaints.filter(c => c.status === 'pending' || c.status === 'in-progress').length

  // Get filter display text
  const getFilterDisplayText = () => {
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
  }

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <Header 
        title={'My Complaints'}
        titlePosition='left'
        containerStyle='bg-transaprent text-red-100 px-4 py-4 flex-row items-center justify-between'
        titleStyle='font-bold text-xl text-black'
      />


      {/* Search Bar */}
      <View className="px-4 mt-2">
        <View className="flex-row items-center bg-ui-card rounded-2xl border border-ui-border px-3 py-0">
          <Search size={20} color="#999999" />
          <TextInput
            className="flex-1 ml-2 text-text-primary"
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
              className="flex-row items-center bg-ui-card border border-ui-border rounded-lg px-3 py-1"
            >
              <Text className="text-text-primary mr-2">
                {getFilterDisplayText()}
              </Text>
              <ChevronDown size={16} color="#666666" />
            </TouchableOpacity>

            {showFilterDropdown && (
              <View className="absolute top-12 right-0 bg-ui-card border border-ui-border rounded-lg shadow-lg w-40">
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
                <Text className="text-text-inverse">Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Complaints List */}
      <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
        {Object.keys(groupedComplaints).length > 0 ? (
          Object.entries(groupedComplaints).map(([dateKey, complaints]) => (
            <View key={dateKey} className="mb-4">
              <Text className="text-text-secondary font-semibold mb-2">
                {getDateTitle(dateKey)}
              </Text>
              
              {complaints.map((complaint) => (
                <TouchableOpacity
                  key={complaint.id}
                  className="bg-ui-card rounded-xl p-4 mb-3 border border-ui-border"
                  activeOpacity={0.7}
                >
                  {/* Header with ID and Status */}
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Text className="text-text-primary font-bold">{complaint.id}</Text>
                      <Text className="text-text-tertiary text-xs ml-2">| {complaint.csn}</Text>
                    </View>
                    <View className="flex-row">
                      <View className={`px-2 py-1 rounded-full mr-2 ${getPriorityColor(complaint.priority)}`}>
                        <Text className="text-text-inverse text-xs capitalize">{complaint.priority}</Text>
                      </View>
                      <View className={`px-2 py-1 rounded-full ${getStatusColor(complaint.status)}`}>
                        <Text className="text-text-inverse text-xs capitalize">{complaint.status}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Customer Name */}
                  <View className="flex-row items-center mb-2">
                    <User size={16} color="#666666" />
                    <Text className="text-text-primary ml-2 font-medium">{complaint.customerName}</Text>
                  </View>

                  {/* Service Name */}
                  <View className="flex-row items-center mb-2">
                    <Wrench size={16} color="#666666" />
                    <Text className="text-text-secondary ml-2">{complaint.serviceName}</Text>
                  </View>

                  {/* Slot Date & Time */}
                  <View className="flex-row items-center mb-2">
                    <Clock size={16} color="#666666" />
                    <Text className="text-text-secondary ml-2">
                      {new Date(complaint.slotDate).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {/* Address */}
                  <View className="flex-row items-start">
                    <MapPin size={16} color="#666666" style={{ marginTop: 2 }} />
                    <Text className="text-text-secondary ml-2 flex-1">{complaint.address}</Text>
                  </View>

                  {/* Pending/Resolve Indicator */}
                  {complaint.status !== 'resolved' && complaint.status !== 'cancelled' && (
                    <View className="mt-3 pt-3 border-t border-ui-border">
                      <View className="flex-row items-center">
                        <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <View 
                            className="h-full bg-status-active rounded-full"
                            style={{ 
                              width: complaint.status === 'in-progress' ? '50%' : '25%' 
                            }} 
                          />
                        </View>
                        <Text className="text-text-tertiary text-xs ml-2">
                          {complaint.status === 'in-progress' ? 'In Progress' : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-10">
            <Text className="text-text-tertiary text-center">No complaints found</Text>
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