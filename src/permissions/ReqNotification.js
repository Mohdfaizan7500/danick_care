import { PermissionsAndroid } from "react-native"


export const  requestUserPermissions = async()=>{
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    if(granted=== PermissionsAndroid.RESULTS.GRANTED){
        console.log('Notification permission granted')

    }
    else{
        console.log("Notification Permission denied");
    }

}