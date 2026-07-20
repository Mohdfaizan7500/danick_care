import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SalaryTab from './SalaryTab';
import CommissionTab from './CommissionTab';
import Header from '../../../components/Header';
import { useAuth } from '../../../context/AuthContext';
// import { CommissionPayout } from '../../../lib/api';
import { Toaster } from 'sonner-native';
import dummyData from '../../../lib/dummyData';

// ---------- Dummy Data ----------
const salaryData = dummyData.payoutSalary?.data?.result || [
  { id: '1', login: '09:00', logout: '18:00', hours: 9, amount: 900, datetime: '2026-07-14 09:00' },
  { id: '2', login: '08:30', logout: '17:30', hours: 9, amount: 900, datetime: '2026-07-13 08:30' },
  { id: '3', login: '10:00', logout: '19:00', hours: 9, amount: 900, datetime: '2026-07-12 10:00' },
  { id: '4', login: '09:15', logout: '18:15', hours: 9, amount: 900, datetime: '2026-07-11 09:15' },
  { id: '5', login: '08:45', logout: '17:45', hours: 9, amount: 900, datetime: '2026-07-10 08:45' },
  { id: '6', login: '09:30', logout: '18:30', hours: 9, amount: 900, datetime: '2026-07-09 09:30' },
  { id: '7', login: '08:00', logout: '17:00', hours: 9, amount: 900, datetime: '2026-07-08 08:00' },
  { id: '8', login: '09:45', logout: '18:45', hours: 9, amount: 900, datetime: '2026-07-07 09:45' },
  { id: '9', login: '08:15', logout: '17:15', hours: 9, amount: 900, datetime: '2026-07-06 08:15' },
  { id: '10', login: '09:00', logout: '18:00', hours: 9, amount: 900, datetime: '2026-07-05 09:00' },
  { id: '11', login: '10:30', logout: '19:30', hours: 9, amount: 900, datetime: '2026-07-04 10:30' },
];

const formatCurrency = (amount) => `₹${amount.toLocaleString()}`;

const PayOut = () => {
  const [title, setTitle] = useState('Payout');
  const [activeTab, setActiveTab] = useState('salary');
  const { profileData } = useAuth();

  // Get technician type from profile data
  const technicianType = profileData?.technician_type || '';

  // Normalize technician type for comparison (handle case sensitivity and spelling variations)
  const normalizedType = technicianType.toLowerCase().trim();

  // Determine which tabs to show
  const isSalaryOnly = normalizedType === 'salary' || normalizedType === 'sallary';
  const isCommissionOnly = normalizedType === 'commission';
  const isCombined = normalizedType === 'salary+commission' || normalizedType === 'sallary+commission';

  const showSalaryTab = isSalaryOnly || isCombined || (!isCommissionOnly);
  const showCommissionTab = isCommissionOnly || isCombined || (!isSalaryOnly);

  // Check if it's combined type (reuse the computed value)
  const isCombinedType = isCombined;


  // Set initial active tab based on technician type
  React.useEffect(() => {
    if (normalizedType === 'salary' || normalizedType === 'sallary') {
      setTitle('Salary Details');
      setActiveTab('salary');
    } else if (normalizedType === 'commission') {
      setTitle('Commission Details');
      setActiveTab('commission');
    } else if (isCombinedType) {
      // setTitle('Payout Details');
      setActiveTab('salary'); // Default to salary for combined type
    } else {
      setActiveTab('salary'); // Default to salary if both are shown
    }
  }, [technicianType]);

  // Salary state
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showMonthYearModal, setShowMonthYearModal] = useState(false);
  const [isSalaryLoading, setIsSalaryLoading] = useState(false);

  // Commission state
  const [startDate, setStartDate] = useState('2025-03-01');
  const [endDate, setEndDate] = useState('2025-03-31');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [isCommissionLoading, setIsCommissionLoading] = useState(false);

  // Summary (dummy)
  const salarySummary = { total: 9900, paid: 4500, balance: 5400 };

  const handleMonthYearConfirm = () => {
    setShowMonthYearModal(false);
    setIsSalaryLoading(true);
    setTimeout(() => setIsSalaryLoading(false), 1500);
  };

  const handleStartDateSelect = (day) => {
    setStartDate(day.dateString);
    setShowStartCalendar(false);
  };

  const handleEndDateSelect = (day) => {
    setEndDate(day.dateString);
    setShowEndCalendar(false);
  };

  const handleCommissionSubmit = () => {
    setIsCommissionLoading(true);
    setTimeout(() => setIsCommissionLoading(false), 1500);
  };

  // If no tabs to show (should not happen), show a message
  if (!showSalaryTab && !showCommissionTab) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <Header
          title="PayOut"
          titlePosition="left"
          titleStyle="font-bold text-2xl ml-5"
        />
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-500 text-lg">No payout options available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="absolute inset-0 z-50 w-90% pointer-events-none">
        <Toaster />
      </View>
      <Header
        title={title}
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
      />

      {/* Tabs - Show only if both tabs are enabled (combined type or empty) */}
      {showSalaryTab && showCommissionTab && (
        <View className="flex-row border-b border-gray-200">
          <TouchableOpacity
            onPress={() => setActiveTab('salary')}
            className={`flex-1 py-3 items-center ${activeTab === 'salary' ? 'border-b-2 border-teal-500' : ''}`}
          >
            <Text className={`text-base ${activeTab === 'salary' ? 'text-teal-500 font-semibold' : 'text-gray-600'}`}>
              Salary
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('commission')}
            className={`flex-1 py-3 items-center ${activeTab === 'commission' ? 'border-b-2 border-teal-500' : ''}`}
          >
            <Text className={`text-base ${activeTab === 'commission' ? 'text-teal-500 font-semibold' : 'text-gray-600'}`}>
              Commission
            </Text>
          </TouchableOpacity>
        </View>
      )}






      {/* Content */}
      {showSalaryTab && (activeTab === 'salary' || !showCommissionTab) && (
        <SalaryTab
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          showMonthYearModal={showMonthYearModal}
          setShowMonthYearModal={setShowMonthYearModal}
          isSalaryLoading={isSalaryLoading}
          salarySummary={salarySummary}
          salaryData={salaryData}
          handleMonthYearConfirm={handleMonthYearConfirm}
          formatCurrency={formatCurrency}
        />
      )}

      {showCommissionTab && (activeTab === 'commission' || !showSalaryTab) && (
          <CommissionTab
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            showStartCalendar={showStartCalendar}
            setShowStartCalendar={setShowStartCalendar}
            showEndCalendar={showEndCalendar}
            setShowEndCalendar={setShowEndCalendar}
            isCommissionLoading={isCommissionLoading}
            handleStartDateSelect={handleStartDateSelect}
            handleEndDateSelect={handleEndDateSelect}
            handleCommissionSubmit={handleCommissionSubmit}
            formatCurrency={formatCurrency}
          />
      )}
    </SafeAreaView>
  );
};

export default PayOut;
