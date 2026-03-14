import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Mock data for transactions
const mockTransactions = [
  { id: '1', description: 'Grocery Store', amount: -45.99, date: '2025-03-14' },
  { id: '2', description: 'Salary Deposit', amount: 2500.00, date: '2025-03-13' },
  { id: '3', description: 'Uber Ride', amount: -12.50, date: '2025-03-12' },
  { id: '4', description: 'Coffee Shop', amount: -4.75, date: '2025-03-11' },
];

const Wallet = () => {
  const [balance, setBalance] = useState(2436.76); // example balance
  const [showBalance, setShowBalance] = useState(true);
  const [transactions] = useState(mockTransactions);

  const toggleBalance = () => setShowBalance(!showBalance);

  const handleTopUp = () => Alert.alert('Top Up', 'Navigate to top-up screen');
  const handleSend = () => Alert.alert('Send', 'Navigate to send money screen');
  const handleReceive = () => Alert.alert('Receive', 'Navigate to receive screen');

  const renderTransaction = ({ item }) => (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
      <View className="flex-row items-center flex-1">
        <Icon
          name={item.amount > 0 ? 'arrow-downward' : 'arrow-upward'}
          size={20}
          color={item.amount > 0 ? '#10b981' : '#ef4444'}
          className="mr-3"
        />
        <View>
          <Text className="text-base font-medium text-gray-800">{item.description}</Text>
          <Text className="text-xs text-gray-500">{item.date}</Text>
        </View>
      </View>
      <Text
        className={`text-base font-semibold ${
          item.amount > 0 ? 'text-green-600' : 'text-red-600'
        }`}
      >
        {item.amount > 0 ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-blue-600 pt-12 pb-6 px-4 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-white text-2xl font-bold">Wallet</Text>
          <TouchableOpacity onPress={toggleBalance} className="p-2">
            <Icon
              name={showBalance ? 'visibility' : 'visibility-off'}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        <Text className="text-white text-sm opacity-80">Total Balance</Text>
        <Text className="text-white text-4xl font-bold mt-1">
          {showBalance ? `$${balance.toFixed(2)}` : '••••••'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-around mx-4 -mt-6">
        <TouchableOpacity
          onPress={handleTopUp}
          className="bg-white shadow-md rounded-xl p-4 items-center flex-1 mx-1"
        >
          <Icon name="add-circle" size={28} color="#3b82f6" />
          <Text className="text-gray-700 font-medium mt-1">Top Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSend}
          className="bg-white shadow-md rounded-xl p-4 items-center flex-1 mx-1"
        >
          <Icon name="send" size={28} color="#3b82f6" />
          <Text className="text-gray-700 font-medium mt-1">Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReceive}
          className="bg-white shadow-md rounded-xl p-4 items-center flex-1 mx-1"
        >
          <Icon name="download" size={28} color="#3b82f6" />
          <Text className="text-gray-700 font-medium mt-1">Receive</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <View className="flex-1 mt-6 px-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">Recent Transactions</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
};

export default Wallet;