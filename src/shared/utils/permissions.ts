import { check, openSettings, PERMISSIONS, request, PermissionStatus as RNPermissionStatus } from "react-native-permissions"
import { PermissionStatus } from "../../types"
import { Platform } from "react-native";

export const requestPermission = async() : Promise<PermissionStatus> => {
    let status: RNPermissionStatus = 'unavailable';

    if( Platform.OS === 'ios') {
        status = await request( PERMISSIONS.IOS.PHOTO_LIBRARY );
    }else if( Platform.OS === 'android') {
        status = await request( PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE );
    } else {
        throw new Error('Unsupported platform');
    }
    if( status === 'blocked' ) {
        await openSettings();
        return await checkPermission();
    }

    const permissionMapper: Record<RNPermissionStatus, PermissionStatus> = {
        granted: 'granted',
        denied: 'denied',
        blocked: 'blocked',
        unavailable: 'unavailable',
        limited: 'limited',
    }

    return permissionMapper[status] ?? 'unavailable';

}

export const checkPermission = async(): Promise<PermissionStatus> => {
    let status: RNPermissionStatus = 'unavailable';
    if( Platform.OS === 'ios') {
        status = await check( PERMISSIONS.IOS.PHOTO_LIBRARY );
    }else if( Platform.OS === 'android') {
        status = await check( PERMISSIONS.ANDROID.ACCESS_MEDIA_LOCATION );
    } else {
        throw new Error('Unsupported platform');
    }

    const permissionMapper: Record<RNPermissionStatus, PermissionStatus> = {
        granted: 'granted',
        denied: 'denied',
        blocked: 'blocked',
        unavailable: 'unavailable',
        limited: 'limited',
    }

    return permissionMapper[status] ?? 'unavailable';

}

