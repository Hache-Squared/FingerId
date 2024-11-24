import { NavigationProp, useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, Button, FlatList, ImageBackground, Modal, Text, TouchableOpacity, View } from 'react-native'
import { StackExploreParams } from '../../routes/StackExplore'
import { useAppTheme, useBackpackStore, useExploreStore } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';

const ExploreContentScreen = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const { backpackList, startLoadingBackpackList, isLoadingExplore, isUserAdmin } = useExploreStore();

  useEffect(() => {
     
    startLoadingBackpackList();
  }, [])
 

  return (
    <>
     <View className='w-full flex-1 bg-red-500'>
      <Text className=''>Hola contenido </Text>
     </View>
    </>
  )
}

export  { ExploreContentScreen }
