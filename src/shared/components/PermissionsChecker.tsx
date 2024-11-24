import React, { FC, PropsWithChildren, useEffect } from 'react'
import { AppState } from 'react-native';
import { usePermissionsStore } from '../hooks/usePermissionsStore';

export const PermissionsChecker: FC<PropsWithChildren> = ({children}) => {
  const { permissionStorageStatus, startCheckStoragePermission } = usePermissionsStore();
  
  useEffect(() => {
    startCheckStoragePermission();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      // console.log('AppState: ', nextAppState);
      
      if(nextAppState === 'active'){
        startCheckStoragePermission();
      }
      
    })

    return () => {
      subscription.remove();
    }
  },[]);
  return (
    <>
    {
        children
    }
    </>
  )
}
