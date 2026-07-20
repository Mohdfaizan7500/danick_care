import { PermissionsAndroid, Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Contacts from 'react-native-contacts';

/**
 * Request contacts permission and fetch all contacts.
 * Returns a promise that resolves with the contacts array.
 */
export const requestContactsPermissionAndFetch = async () => {
  try {
    let granted = false;

    // Android permission handling
    if (Platform.OS === 'android') {
      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {

          title: 'Contacts Permission',
          message: 'This app needs access to your contacts to suggest service providers.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      granted = granted === PermissionsAndroid.RESULTS.GRANTED;
    } 
    // iOS permission handling using react-native-permissions
    else if (Platform.OS === 'ios') {
      const status = await check(PERMISSIONS.IOS.CONTACTS);
      if (status === RESULTS.GRANTED) {
        granted = true;
      } else if (status === RESULTS.DENIED) {
        const result = await request(PERMISSIONS.IOS.CONTACTS);
        granted = result === RESULTS.GRANTED;
      } else if (status === RESULTS.BLOCKED) {
        granted = false;
      }
    }

    if (!granted) {
      return [];
    }

    // Fetch all contacts
    const contacts = await Contacts.getAll();
    
    // Store in array (already an array)
    const contactsArray = contacts;
    
    // Log each contact's name and phone numbers
    contactsArray.forEach((contact, index) => {
      const fullName = `${contact.givenName || ''} ${contact.familyName || ''}`.trim() || 'No name';
      const phoneNumbers = contact.phoneNumbers.map(pn => pn.number).join(', ');
    });
    
    return contactsArray;
    
  } catch (error) {
    return [];
  }
};

// Usage example:
// const contacts = await requestContactsPermissionAndFetch();
