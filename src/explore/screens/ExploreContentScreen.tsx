import { NavigationProp, useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, Button, FlatList, ImageBackground, Modal, Text, TouchableOpacity, View } from 'react-native'
import { StackExploreParams } from '../../routes/StackExplore'
import { useAppTheme, useBackpackStore, useExploreStore } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';
import { usePhotoManagementWithStorage } from '../../shared/hooks/usePhotoManagementWithStorage'
import { PhotoInfo } from '../../shared/hooks/usePhotoManagement'

const ExploreContentScreen = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const { backpackList, startLoadingBackpackList, isLoadingExplore, isUserAdmin } = useExploreStore();
  const { listUsersWithProfilePhotos } = usePhotoManagementWithStorage()
  const [data, setData] = useState<{ userId: string; profilePhoto: PhotoInfo | null }[]>([]);
  useEffect(() => {
    
    handleGetData()
  }, [])
  const handleGetData = async() => {
    const d = await listUsersWithProfilePhotos()
    setData(d)
  }
 

  return (
    <>
     <View className='w-full flex-1 bg-red-500'>
      <Text className=''>Hola contenido </Text>
      <FlatList
        data={data}
        renderItem={({item, index}) => {
          return(
            <Text key={index}>{item.userId}</Text>
          )
        }}

      />
     </View>
    </>
  )
}

export  { ExploreContentScreen }
