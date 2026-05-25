import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { requestContactsPermissionAndFetch } from '../../hooks/contectPermission';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ContactScreen = () => {
  const [contacts, setContacts] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const handleFetchContacts = async () => {
    setLoading(true);
    const contactsList = await requestContactsPermissionAndFetch();
    setContacts(contactsList);
    setLoading(false);
    
    Alert.alert('Success', `Fetched ${contactsList.length} contacts`);
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, padding: insets.top }}>
      <TouchableOpacity
        onPress={handleFetchContacts}
        style={{ backgroundColor: '#58A890', padding: 12, borderRadius: 8, marginBottom: 20 }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
          {loading ? 'Fetching...' : 'Get Contacts'}
        </Text>
      </TouchableOpacity>

      <ScrollView>
        {contacts.map((contact, idx) => (
          <View key={idx} style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}>
            <Text style={{ fontWeight: 'bold' }}>
              {contact.givenName} {contact.familyName}
            </Text>
            {contact.phoneNumbers.map((phone, i) => (
              <Text key={i} style={{ color: '#555' }}>{phone.number}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default ContactScreen;