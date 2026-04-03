import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SalaryTab from './SalaryTab';
import CommissionTab from './CommissionTab';
import Header from '../../../components/Header';

// ---------- Dummy Data ----------
const salaryData = [
  { id: '1', login: '09:00', logout: '18:00', hours: 9, amount: 900, datetime: '2025-03-14 09:00' },
  { id: '2', login: '08:30', logout: '17:30', hours: 9, amount: 900, datetime: '2025-03-13 08:30' },
  { id: '3', login: '10:00', logout: '19:00', hours: 9, amount: 900, datetime: '2025-03-12 10:00' },
  { id: '4', login: '09:15', logout: '18:15', hours: 9, amount: 900, datetime: '2025-03-11 09:15' },
  { id: '5', login: '08:45', logout: '17:45', hours: 9, amount: 900, datetime: '2025-03-10 08:45' },
  { id: '6', login: '09:30', logout: '18:30', hours: 9, amount: 900, datetime: '2025-03-09 09:30' },
  { id: '7', login: '08:00', logout: '17:00', hours: 9, amount: 900, datetime: '2025-03-08 08:00' },
  { id: '8', login: '09:45', logout: '18:45', hours: 9, amount: 900, datetime: '2025-03-07 09:45' },
  { id: '9', login: '08:15', logout: '17:15', hours: 9, amount: 900, datetime: '2025-03-06 08:15' },
  { id: '10', login: '09:00', logout: '18:00', hours: 9, amount: 900, datetime: '2025-03-05 09:00' },
];

const commissionData = [
  { id: '1', csn: 'C001 - John Doe', total: 1500, tech: 900, admin: 600, status: 'credit', date: '2025-03-14' },
  { id: '2', csn: 'C002 - Jane Smith', total: 2000, tech: 1200, admin: 800, status: 'debit', date: '2025-03-13' },
  { id: '3', csn: 'C003 - Bob Johnson', total: 1200, tech: 720, admin: 480, status: 'credit', date: '2025-03-12' },
  { id: '4', csn: 'C004 - Alice Brown', total: 1800, tech: 1080, admin: 720, status: 'credit', date: '2025-03-11' },
  { id: '5', csn: 'C005 - Mike Wilson', total: 2200, tech: 1320, admin: 880, status: 'debit', date: '2025-03-10' },
  { id: '6', csn: 'C006 - Sarah Lee', total: 1700, tech: 1020, admin: 680, status: 'credit', date: '2025-03-09' },
  { id: '7', csn: 'C007 - David Kim', total: 1900, tech: 1140, admin: 760, status: 'credit', date: '2025-03-08' },
  { id: '8', csn: 'C008 - Emily Chen', total: 2100, tech: 1260, admin: 840, status: 'debit', date: '2025-03-07' },
];

const formatCurrency = (amount) => `₹${amount.toLocaleString()}`;

const PayOut = () => {
  const [activeTab, setActiveTab] = useState('salary');

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
  const salarySummary = { total: 9000, paid: 4500, balance: 4500 };
  const commissionSummary = { total: 14400, tech: 8640, admin: 5760, paid: 5000, balance: 9400 };

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

  return (
    <SafeAreaView className="flex-1 bg-white">
      <Header
        title="PayOut"
        titlePosition="left"
        titleStyle="font-bold text-2xl ml-5"
      />
      {/* Tabs */}
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
          className={`flex-1 py-3 items-center ${activeTab === 'commission' ? 'border-b-2 border-teal-500 ' : ''}`}
        >
          <Text className={`text-base ${activeTab === 'commission' ? 'text-teal-500 font-semibold' : 'text-gray-600'}`}>
            Commission
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'salary' ? (
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
      ) : (
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
          commissionSummary={commissionSummary}
          commissionData={commissionData}
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