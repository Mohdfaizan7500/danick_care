import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../../components/Header';

// Mock data for transactions
const mockTransactions = [
  { id: '1', description: 'Grocery Store', amount: -45.99, date: '2025-03-14' },
  { id: '2', description: 'Salary Deposit', amount: 2500.00, date: '2025-03-13' },
  { id: '3', description: 'Uber Ride', amount: -12.50, date: '2025-03-12' },
  { id: '4', description: 'Coffee Shop', amount: -4.75, date: '2025-03-11' },
];

const Wallet = () => {
  const [balance, setBalance] = useState(2436.76);
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
          color={item.amount > 0 ? '#58A890' : '#E86F6F'} // ui.success / ui.error
          style={{ marginRight: 12 }}
        />
        <View>
          <Text className="text-base font-medium text-text-primary">{item.description}</Text>
          <Text className="text-xs text-text-tertiary">{item.date}</Text>
        </View>
      </View>
      <Text
        className={`text-base font-semibold ${
          item.amount > 0 ? 'text-ui-success' : 'text-ui-error'
        }`}
      >
        {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#88D8C0', '#FFFFFF', '#FFFFFF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      className="flex-1"
    >
      {/* Header with visibility toggle */}
      <Header
        title="Wallet"
        
        titleStyle="text-2xl font-bold text-text-primary"
        titlePosition="left"
        showBackButton={true}
        showRightIcon={true}
        onRightIconPress={toggleBalance}
        customRightIconComponent={
          <Icon
            name={showBalance ? 'visibility' : 'visibility-off'}
            size={24}
            color="#333333" // text-primary
          />
        }
        containerStyle="flex-row items-center justify-between px-4 pt-12 pb-2 border-gray-100"
        // Remove default background and shadow
      />

      {/* Balance Section */}
      <View className="px-4 pb-6">
        <Text className="text-text-secondary text-sm">Total Balance</Text>
        <Text className="text-text-primary text-4xl font-bold mt-1">
          {showBalance ? `₹${balance.toFixed(2)}` : '••••••'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-around mx-4 -mt-6">
        <TouchableOpacity
          onPress={handleTopUp}
          className="bg-ui-card shadow-md rounded-xl p-4 items-center flex-1 mx-1"
        >
          <Icon name="add-circle" size={28} color="#88D8C0" />
          <Text className="text-text-secondary font-medium mt-1">Top Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSend}
          className="bg-ui-card shadow-md rounded-xl p-4 items-center flex-1 mx-1"
        >
          <Icon name="send" size={28} color="#88D8C0" />
          <Text className="text-text-secondary font-medium mt-1">Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleReceive}
          className="bg-ui-card shadow-md rounded-xl p-4 items-center flex-1 mx-1"
        >
          <Icon name="download" size={28} color="#88D8C0" />
          <Text className="text-text-secondary font-medium mt-1">Receive</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions List */}
      <View className="flex-1 mt-6 px-4">
        <Text className="text-lg font-bold text-text-primary mb-2">Recent Transactions</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </LinearGradient>
  );
};

export default Wallet;