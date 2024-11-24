import React from 'react'
import { useAppDispatch, useAppSelector } from '../../store';
import { checkPermission, requestPermission } from '../utils/permissions';
import { onChangePermissionStorageStatus } from '../../store/permissions';

export const usePermissionsStore = () => {
  const state = useAppSelector(state => state.permissions)
  const dispatch = useAppDispatch();
  
  const startRequestStoragePermission = async() => {
    const status = await requestPermission();
    dispatch( onChangePermissionStorageStatus(status ) );
    return status;
  }

  const startCheckStoragePermission = async() => {
    const status = await checkPermission();
    dispatch( onChangePermissionStorageStatus(status ) );
    return status;
  }

  return {
    //properties
    ...state,

    //actions
    startRequestStoragePermission,
    startCheckStoragePermission
  }
}
