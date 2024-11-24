import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Dimensions, FlatList, Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { StackExploreParams } from '../../routes/StackExplore'
import { useAppTheme, useBackpackStore, useExploreStore } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';
import { usePhotoManagementWithStorage } from '../../shared/hooks/usePhotoManagementWithStorage'
import { PhotoInfo, usePhotoManagement } from '../../shared/hooks/usePhotoManagement'

const RegistersByUserScreen = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const { getPhotos } = usePhotoManagement()
  const { primaryColor } = useAppTheme()
  const [data, setData] = useState<PhotoInfo[]>([]);
  const { id } = useRoute<RouteProp<StackExploreParams, 'RegistersByUser'>>().params;
  useEffect(() => {
    
    handleGetData()
  }, [])
  const handleGetData = async() => {
    const d = await getPhotos(id,"fotosHistorial" )
    setData(d)
    console.log(d);
    
  }
 

  return (
    <>
     <View className='w-full flex-1 bg-white'>
     <Text className='font-bold text-center text-xl' style={{color: primaryColor}}>Entradas y salidas</Text>
      <View className='my-2'/>
      <FlatList
        data={data}
        renderItem={({item, index}) => {
          return(
            <View className='w-11/12 bg-gray-100 self-center rounded-md my-0.5 flex flex-row items-center justify-center' key={index}>
              
              <Image 
                source={{ uri: `file://${item.path}` }} 
                style={styles.image} />
              
              <View className='flex-1'>
                <Text style={{color: primaryColor}} className='m-2 font-bold text-base'>Fecha: {new Date(item.createdAt).toISOString()}</Text>
              </View>

            </View>
            
          )
        }}

      />
     </View>
    </>
  )
}

const styles = StyleSheet.create({
  image: {
    
    width: 120,
    height: 120,
    alignSelf: 'center',
    borderRadius: 5
    // marginTop: 20,
  },
});
export  { RegistersByUserScreen }
