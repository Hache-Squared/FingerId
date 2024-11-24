import { NavigationProp, useNavigation } from '@react-navigation/native'
import { StackNavigationOptions } from '@react-navigation/stack'
import React, { FC, PropsWithChildren, useEffect } from 'react'
import { StackExploreParams } from '../../routes/StackExplore'
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs'
import { useAppTheme } from '../hooks'

export const FullSpaceInScreen: FC<PropsWithChildren> = ({children}) => {
    const { tabBar } = useAppTheme()
    const navigation = useNavigation<NavigationProp<StackExploreParams>>()
    const optionsForStack: StackNavigationOptions = {
        headerShown: false,
    }
    const optionsForTab: BottomTabNavigationOptions = {
      tabBarStyle: {
        display: 'none'
      },
      
  
    }
  useEffect(() => {
    navigation.setOptions(optionsForStack)
    // navigation.getParent()?.setOptions(optionsForTab)
  
    return () => {
      navigation.setOptions({
        headerShown: true,
      })
      
      // navigation.getParent()?.setOptions({

      //       headerShown:false,
      //       tabBarLabelStyle: {
      //           marginBottom: 5
      //       },
      //       tabBarStyle: {
              
      //           borderTopWidth: 0,
      //           elevation: 0,
      //           backgroundColor: tabBar.backgroundColor,
      //           // borderTopRightRadius: 15,
      //           // borderTopLeftRadius: 15
      //       },
      //       tabBarIconStyle: {
      //         // color: tabBar.labelColorActive
      //       },
      //       tabBarActiveTintColor: tabBar.labelColorActive,
      //       tabBarInactiveTintColor: tabBar.labelColorInactive,
      // })
    }
  },[])
  return (
    <> 
    {
      children
    }
    </>
  )
}
