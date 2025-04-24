import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Dimensions, FlatList, Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { StackExploreParams } from '../../routes/StackExplore'
import { useAppTheme } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';

import { PhotoInfo, usePhotoManagement } from '../../shared/hooks/usePhotoManagement'
import { useSecurity } from '../../shared/hooks/useSecurity'

const ExploreContentScreen = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const { primaryColor } = useAppTheme()
  const { listUsersWithProfilePhotos } = usePhotoManagement()
  const [data, setData] = useState<{ userId: string;userName: string; profilePhoto: PhotoInfo | null }[]>([]);
  const { isLocked, startLockingState } = useSecurity();
  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      handleGetData()
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, []))

  const handleGetData = async() => {
    const d = await listUsersWithProfilePhotos()
    setData(d)
  }
 
  // if( isLocked ){
  //   navigation.navigate("LoginUserScreen")
  // }

  return (
    <>
     <View className='w-full flex-1 bg-white'>
      <View className='w-full flex flex-row items-center justify-around my-3'>
        <Text className='font-bold text-center text-xl' style={{color: primaryColor}}>Usuarios registrados</Text>

        <TouchableOpacity onPress={() => navigation.navigate("CreatorsScreen")} className=''>
          <Icon name='help-circle-outline' size={30} color={"#111"} />
        </TouchableOpacity>
      </View>
      
      <View className='my-2'/>
      <FlatList
        data={data}
        renderItem={({item, index}) => {
          return(
            <TouchableOpacity onPress={() => {
              navigation.navigate("RegistersByUser", {
                id: item.userId
              })
            }} className='w-11/12 bg-gray-100 self-center rounded-md my-0.5 flex flex-row items-center justify-center' key={index}>
              
              <Image 
                source={{ uri: `file://${item.profilePhoto?.path}` }} 
                style={styles.image} />
              
              <View className='flex-1'>
                <Text style={{color: primaryColor}}  className='m-2 font-bold text-xl'>Matrícula: {item.userId}</Text>
                <Text style={{color: primaryColor}} className='m-2 font-bold text-base'>Nombre: {item.userName}</Text>
              </View>
              

            </TouchableOpacity>
            
          )
        }}

      />
     </View>
     <TouchableOpacity onPress={() => startLockingState()} className='w-[60px] h-[60px] absolute flex items-center justify-center bottom-10 left-8 p-2 rounded-full bg-gray-200'>
        <Icon name='lock-closed-outline' size={40} color={"#111"} />
      </TouchableOpacity>

     <TouchableOpacity onPress={() => navigation.navigate("Register")} className='w-[60px] h-[60px] absolute flex items-center justify-center bottom-10 right-8 p-2 rounded-full bg-gray-200'>
        <Icon name='add-circle-outline' size={40} color={"#111"} />
      </TouchableOpacity>

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
export  { ExploreContentScreen }
