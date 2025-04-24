import { NavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Dimensions, FlatList, Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { StackExploreParams } from '../../routes/StackExplore'
import { useAppTheme } from '../../shared/hooks'
import { creators } from '../../data/Creators'
 
const CreatorsScreen = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const { primaryColor } = useAppTheme()
 

  return (
    <>
     <View className='w-full flex-1 bg-white'>
      <Text className='font-bold text-center text-xl' style={{color: primaryColor}}>Creadores</Text>
      <Text className='font-bold text-center text-xl' style={{color: primaryColor}}>Ingeniería De Dispositivos Móviles</Text>
      <Text className='font-bold text-center text-xl' style={{color: primaryColor}}>Equipo: 6</Text>
      <View className='my-2'/>
      <FlatList
        data={creators}
        renderItem={({item, index}) => {
          return(
 
              <View className='flex flex-col bg-slate-100 my-1' key={index}>
                <Text style={{color: "#111"}}  className='m-2 font-bold text-xl'>Nombre: {item.name}</Text>
                <Text style={{color: primaryColor}} className='m-2 font-bold text-base'>Matrícula: {item.id}</Text>
                <Text style={{color: primaryColor}} className='m-2 font-bold text-base'>Carrera: {item.career}</Text>
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
export  { CreatorsScreen }
