import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Header from '../../components/Header'
import { Search, Package, Wrench, Calendar, User, Hash, Camera, RefreshCw, Filter, ChevronDown } from 'lucide-react-native'

// Mock data for replaced parts
const mockReplacedParts = [
  {
    id: 'RPL001',
    serviceId: 'SVC24031501',
    partName: 'Compressor',
    partModel: 'CMP-5KS92',
    brand: 'LG',
    customerName: 'Rajesh Kumar',
    oldPartImage: 'https://5.imimg.com/data5/SELLER/Default/2023/11/363929662/KP/HY/ZY/6746485/bluestar-air-conditioner-compressor.jpg',
    returnDate: '2026-03-13T10:30:00',
    status: 'returned',
    condition: 'faulty',
  },
  {
    id: 'RPL002',
    serviceId: 'SVC24031502',
    partName: 'PCB Board',
    partModel: 'PCB-7890-X',
    brand: 'Samsung',
    customerName: 'Priya Sharma',
    oldPartImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRv4GkSP-T9c-gYrcyCAZ-iO0cXseG_iCrqTg&s',
    returnDate: '2026-03-13T14:00:00',
    status: 'returned',
    condition: 'damaged',
  },
  {
    id: 'RPL003',
    serviceId: 'SVC24031401',
    partName: 'Fan Motor',
    partModel: 'FM-450W',
    brand: 'Voltas',
    customerName: 'Amit Patel',
    oldPartImage: 'data:image/jpeg;base64,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',
    returnDate: '2026-03-12T09:15:00',
    status: 'returned',
    condition: 'worn-out',
  },
  {
    id: 'RPL004',
    serviceId: 'SVC24031402',
    partName: 'Capacitor',
    partModel: 'CAP-50uF',
    brand: 'Blue Star',
    customerName: 'Sneha Reddy',
    oldPartImage: 'data:image/jpeg;base64,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',
    returnDate: '2026-03-12T16:30:00',
    status: 'pending',
    condition: 'to-be-returned',
  },
  {
    id: 'RPL005',
    serviceId: 'SVC24031301',
    partName: 'Thermostat',
    partModel: 'TH-7890',
    brand: 'Whirlpool',
    customerName: 'Vikram Singh',
    oldPartImage: 'data:image/jpeg;base64,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',
    returnDate: '2026-03-11T11:00:00',
    status: 'returned',
    condition: 'faulty',
  },
  {
    id: 'RPL006',
    serviceId: 'SVC24031302',
    partName: 'Remote Control',
    partModel: 'RC-8765',
    brand: 'Carrier',
    customerName: 'Anjali Desai',
    oldPartImage: 'https://5.imimg.com/data5/ANDROID/Default/2024/3/399135013/HB/UP/OM/38879366/pbr-500x500.jpg',
    returnDate: '2026-03-11T13:45:00',
    status: 'returned',
    condition: 'damaged',
  },
  {
    id: 'RPL007',
    serviceId: 'SVC24031201',
    partName: 'Expansion Valve',
    partModel: 'EXV-234',
    brand: 'Daikin',
    customerName: 'Mohan Das',
    oldPartImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQagUJ8XwLUici1Guon2nhRBsXK_fEv5bLFsA&s',
    returnDate: '2026-03-10T15:20:00',
    status: 'returned',
    condition: 'faulty',
  },
  {
    id: 'RPL008',
    serviceId: 'SVC24031202',
    partName: 'Condenser Coil',
    partModel: 'CC-5MM',
    brand: 'Hitachi',
    customerName: 'Deepa Nair',
    oldPartImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyw3U-D2YncWAC3OcZCFmU-zgGEbJ9MD0AaA&s',
    returnDate: '2026-03-10T10:30:00',
    status: 'pending',
    condition: 'to-be-returned',
  },
  {
    id: 'RPL009',
    serviceId: 'SVC24031101',
    partName: 'Evaporator Coil',
    partModel: 'EC-3MM',
    brand: 'Godrej',
    customerName: 'Sanjay Gupta',
    oldPartImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmR7wshcxF_ukO6CpC_X8sXNafhYrsFLN7yA&s',
    returnDate: '2026-03-09T09:15:00',
    status: 'returned',
    condition: 'faulty',
  },
  {
    id: 'RPL010',
    serviceId: 'SVC24031102',
    partName: 'Fan Blade',
    partModel: 'FB-18IN',
    brand: 'Lloyd',
    customerName: 'Kavita Sharma',
    oldPartImage: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRixo_ZORR_W2tq0MCMK2uNaTP_emCDc0gAEA&s',
    returnDate: '2026-03-09T14:30:00',
    status: 'returned',
    condition: 'worn-out',
  },
  {
    id: 'RPL011',
    serviceId: 'SVC24031002',
    partName: 'Compressor',
    partModel: 'CMP-8KS94',
    brand: 'LG',
    customerName: 'Rahul Mehta',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Compressor',
    returnDate: '2026-03-08T16:45:00',
    status: 'returned',
    condition: 'faulty',
  },
  {
    id: 'RPL012',
    serviceId: 'SVC24030901',
    partName: 'PCB Board',
    partModel: 'PCB-1234',
    brand: 'Samsung',
    customerName: 'Pooja Malhotra',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=PCB',
    returnDate: '2026-03-07T11:30:00',
    status: 'returned',
    condition: 'damaged',
  },
  {
    id: 'RPL013',
    serviceId: 'SVC24030801',
    partName: 'Capacitor',
    partModel: 'CAP-40uF',
    brand: 'Voltas',
    customerName: 'Arjun Reddy',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Capacitor',
    returnDate: '2026-03-06T13:15:00',
    status: 'pending',
    condition: 'to-be-returned',
  },
  {
    id: 'RPL014',
    serviceId: 'SVC24030701',
    partName: 'Thermostat',
    partModel: 'TH-5678',
    brand: 'Blue Star',
    customerName: 'Neha Singh',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Thermostat',
    returnDate: '2026-03-05T10:00:00',
    status: 'returned',
    condition: 'faulty',
  },
  {
    id: 'RPL015',
    serviceId: 'SVC24030601',
    partName: 'Remote Control',
    partModel: 'RC-4321',
    brand: 'Carrier',
    customerName: 'Vivek Kumar',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Remote',
    returnDate: '2026-03-04T15:30:00',
    status: 'returned',
    condition: 'damaged',
  },
  {
    id: 'RPL016',
    serviceId: 'SVC24030501',
    partName: 'Fan Motor',
    partModel: 'FM-350W',
    brand: 'Daikin',
    customerName: 'Swati Joshi',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Fan+Motor',
    returnDate: '2026-03-03T09:45:00',
    status: 'returned',
    condition: 'worn-out',
  },
  {
    id: 'RPL017',
    serviceId: 'SVC24030401',
    partName: 'Expansion Valve',
    partModel: 'EXV-567',
    brand: 'Hitachi',
    customerName: 'Nitin Sharma',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Valve',
    returnDate: '2026-03-02T14:20:00',
    status: 'pending',
    condition: 'to-be-returned',
  },
  {
    id: 'RPL018',
    serviceId: 'SVC24030301',
    partName: 'Condenser Coil',
    partModel: 'CC-7MM',
    brand: 'Godrej',
    customerName: 'Meera Nair',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Condenser',
    returnDate: '2026-03-01T11:00:00',
    status: 'returned',
    condition: 'faulty',
  },
  {
    id: 'RPL019',
    serviceId: 'SVC24030201',
    partName: 'Evaporator Coil',
    partModel: 'EC-5MM',
    brand: 'Lloyd',
    customerName: 'Karan Mehra',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Evaporator',
    returnDate: '2026-02-28T16:15:00',
    status: 'returned',
    condition: 'faulty',
  },
  {
    id: 'RPL020',
    serviceId: 'SVC24030101',
    partName: 'Fan Blade',
    partModel: 'FB-24IN',
    brand: 'LG',
    customerName: 'Divya Kapoor',
    oldPartImage: 'https://via.placeholder.com/100/88D8C0/ffffff?text=Fan+Blade',
    returnDate: '2026-02-27T10:30:00',
    status: 'returned',
    condition: 'worn-out',
  },
]

// Status filter options
const STATUS_FILTERS = {
  ALL: 'all',
  RETURNED: 'returned',
  PENDING: 'pending'
}

const ReplaceParts = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [selectedPart, setSelectedPart] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)

  // Filter parts based on search and status
  const getFilteredParts = () => {
    return mockReplacedParts.filter(part => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          part.id.toLowerCase().includes(query) ||
          part.serviceId.toLowerCase().includes(query) ||
          part.partName.toLowerCase().includes(query) ||
          part.partModel.toLowerCase().includes(query) ||
          part.brand.toLowerCase().includes(query) ||
          part.customerName.toLowerCase().includes(query)

        if (!matchesSearch) return false
      }

      // Apply status filter
      if (selectedStatus !== STATUS_FILTERS.ALL) {
        return part.status === selectedStatus
      }

      return true
    })
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'returned':
        return 'bg-status-online'
      case 'pending':
        return 'bg-status-away'
      default:
        return 'bg-gray-400'
    }
  }

  // Get condition badge color
  const getConditionColor = (condition) => {
    switch (condition) {
      case 'faulty':
        return 'bg-status-busy'
      case 'damaged':
        return 'bg-status-away'
      case 'worn-out':
        return 'bg-status-active'
      case 'to-be-returned':
        return 'bg-gray-400'
      default:
        return 'bg-gray-400'
    }
  }

  // Format condition text
  const formatCondition = (condition) => {
    return condition.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const filteredParts = getFilteredParts()

  // Calculate statistics
  const totalParts = mockReplacedParts.length
  const returnedCount = mockReplacedParts.filter(p => p.status === 'returned').length
  const pendingCount = mockReplacedParts.filter(p => p.status === 'pending').length

  return (
    <SafeAreaView className="flex-1 bg-background-secondary">
      <Header
        title={'Replace Parts'}
        titlePosition='left'
        containerStyle='bg-transaprent text-red-100 px-4 py-4 flex-row items-center justify-between'
        titleStyle='font-bold text-xl text-black'
      />


      {/* Statistics Cards */}
      <View className="px-4 mt-2">
        <View className="flex-row justify-between">
          <View className="bg-ui-card flex-row items-center justify-between rounded-xl p-3 flex-1 mr-2 border border-ui-border">
            <View>
              <Text className="text-text-tertiary text-xs">Total Parts</Text>

              <Text className="text-text-primary text-lg font-bold mt-1">{totalParts}</Text>
            </View>
            <Package size={20} color="#88D8C0" />

          </View>

          <View className="bg-ui-card flex-row items-center justify-between  rounded-xl p-3 flex-1 mx-2 border border-ui-border">
            <View>
              <Text className="text-text-tertiary text-xs">Returned</Text>
              <Text className="text-text-primary text-lg font-bold mt-1">{returnedCount}</Text>
            </View>
            <RefreshCw size={20} color="#58A890" />

          </View>

          <View className="bg-ui-card flex-row items-center justify-between  rounded-xl p-3 flex-1 ml-2 border border-ui-border">
            <View>
              <Text className="text-text-tertiary text-xs">Pending</Text>
              <Text className="text-text-primary text-lg font-bold mt-1">{pendingCount}</Text>
            </View>
            <Wrench size={20} color="#F0B27A" />

          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-4 mt-2">
        <View className="flex-row items-center bg-ui-card rounded-2xl border border-ui-border px-3 py-0">
          <Search size={20} color="#999999" />
          <TextInput
            className="flex-1 ml-2 text-text-primary"
            placeholder="Search by part name, model, service ID..."
            placeholderTextColor="#999999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Section */}
      <View className="px-4 mt-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Filter size={18} color="#666666" />
            <Text className="text-text-secondary ml-2 font-medium">Filter by:</Text>
          </View>
          {/* Results Count */}
          <View className="px-4 mt-2">
            <Text className="text-text-tertiary text-sm">
              Showing {filteredParts.length} of {totalParts} parts
            </Text>
          </View>

          {/* Status Filter Dropdown */}
          <View className="relative z-10">
            <TouchableOpacity
              onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex-row items-center bg-ui-card border border-ui-border rounded-lg px-3 py-2"
            >
              <Text className="text-text-primary mr-2 capitalize">
                {selectedStatus === 'all' ? 'All Status' : selectedStatus}
              </Text>
              <ChevronDown size={16} color="#666666" />
            </TouchableOpacity>

            {showStatusDropdown && (
              <View className="absolute top-12 right-0 bg-ui-card border border-ui-border rounded-lg shadow-lg w-40">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStatus(STATUS_FILTERS.ALL)
                    setShowStatusDropdown(false)
                  }}
                  className="px-4 py-3 border-b border-ui-border"
                >
                  <Text className="text-text-primary">All Status</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStatus(STATUS_FILTERS.RETURNED)
                    setShowStatusDropdown(false)
                  }}
                  className="px-4 py-3 border-b border-ui-border"
                >
                  <Text className="text-text-primary">Returned</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedStatus(STATUS_FILTERS.PENDING)
                    setShowStatusDropdown(false)
                  }}
                  className="px-4 py-3"
                >
                  <Text className="text-text-primary">Pending</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      
      {/* Parts List */}
      <ScrollView className="flex-1 px-4 mt-2" showsVerticalScrollIndicator={false}>
        {filteredParts.length > 0 ? (
          filteredParts.map((part) => (
            <TouchableOpacity
              key={part.id}
              className="bg-ui-card rounded-xl p-4 mb-3 border border-ui-border"
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
                    source={{ uri: part.oldPartImage }}
                    className="w-20 h-20 rounded-lg bg-gray-200"
                    resizeMode="cover"
                  />
                  <View className="absolute -top-1 -right-1">
                    <Camera size={14} color="#88D8C0" />
                  </View>
                </View>

                {/* Part Details */}
                <View className="flex-1">
                  {/* Header with ID and Status */}
                  <View className="flex-row justify-between items-start mb-1">
                    <View className="flex-row items-center">
                      <Hash size={14} color="#666666" />
                      <Text className="text-text-primary font-bold text-sm ml-1">{part.id}</Text>
                    </View>
                    <View className={`px-2 py-1 rounded-full ${getStatusColor(part.status)}`}>
                      <Text className="text-text-inverse text-xs capitalize">{part.status}</Text>
                    </View>
                  </View>

                  {/* Part Name and Model */}
                  <Text className="text-text-primary font-semibold text-base">
                    {part.partName}
                  </Text>
                  <Text className="text-text-secondary text-sm mb-1">
                    Model: {part.partModel} | {part.brand}
                  </Text>

                  {/* Service ID */}
                  <View className="flex-row items-center mb-1">
                    <Wrench size={12} color="#666666" />
                    <Text className="text-text-tertiary text-xs ml-1">
                      Service: {part.serviceId}
                    </Text>
                  </View>

                  {/* Customer Name */}
                  <View className="flex-row items-center mb-1">
                    <User size={12} color="#666666" />
                    <Text className="text-text-tertiary text-xs ml-1">
                      {part.customerName}
                    </Text>
                  </View>

                  {/* Return Date */}
                  <View className="flex-row items-center mb-2">
                    <Calendar size={12} color="#666666" />
                    <Text className="text-text-tertiary text-xs ml-1">
                      {new Date(part.returnDate).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>

                  {/* Condition Badge */}
                  <View className="flex-row">
                    <View className={`px-2 py-1 rounded-full ${getConditionColor(part.condition)}`}>
                      <Text className="text-text-inverse text-xs">
                        {formatCondition(part.condition)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center justify-center py-10">
            <Package size={48} color="#BBBBBB" />
            <Text className="text-text-tertiary text-center mt-4">
              No parts found matching your search
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View className="h-4" />
      </ScrollView>

      {/* Image Modal */}
      {showImageModal && selectedPart && (
        <View className="absolute inset-0 bg-black/90 justify-center items-center z-50">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10"
            onPress={() => setShowImageModal(false)}
          >
            <Text className="text-white text-xl">✕</Text>
          </TouchableOpacity>

          <View className="w-full px-4">
            <Text className="text-white text-lg font-bold mb-2">
              {selectedPart.partName} - {selectedPart.partModel}
            </Text>
            <Image
              source={{ uri: selectedPart.oldPartImage }}
              className="w-full h-80 rounded-xl"
              resizeMode="contain"
            />

            <View className="bg-ui-card rounded-lg p-4 mt-4">
              <Text className="text-text-primary font-semibold mb-2">Part Details:</Text>
              <Text className="text-text-secondary">ID: {selectedPart.id}</Text>
              <Text className="text-text-secondary">Service: {selectedPart.serviceId}</Text>
              <Text className="text-text-secondary">Customer: {selectedPart.customerName}</Text>
              <Text className="text-text-secondary">Brand: {selectedPart.brand}</Text>
              <Text className="text-text-secondary">Condition: {formatCondition(selectedPart.condition)}</Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

export default ReplaceParts

const styles = StyleSheet.create({})