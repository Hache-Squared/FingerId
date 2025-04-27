import { NavigationProp, RouteProp, useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { Alert, Button, Dimensions, FlatList, Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { StackExploreParams } from '../../routes/StackExplore'
import { useAppTheme } from '../../shared/hooks'
import { PhotoInfo, usePhotoManagement } from '../../shared/hooks/usePhotoManagement'
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios'

const RegistersByUserScreen = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const { getPhotos, getUserData, deleteUser: deleteUserPhoto } = usePhotoManagement()
  const { primaryColor } = useAppTheme()
  const [data, setData] = useState<PhotoInfo[]>([]);
  const [user, setUser] = useState<{ userId: string; userName: string; photoPath: string } | null>(null);
  
  const { id } = useRoute<RouteProp<StackExploreParams, 'RegistersByUser'>>().params;
  
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
    setData([])
    setUser(null)
    const d = await getPhotos(id,"fotosHistorial" )
    setData(d)

    const u = await getUserData(id)
    setUser(u)
    
    console.log(d);
    
  }
  const formatAttendanceDate = (dateParam: any): string => {
    const date = new Date(dateParam)
    const daysOfWeek = [
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ];
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const dayOfWeek = daysOfWeek[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

    return `${dayOfWeek}, ${day} de ${month} de ${year}, ${formattedHours}:${formattedMinutes} ${period}`;
};

const deleteUserPrompt = async(id: string) => {
  Alert.alert('Eliminar Empleado', '¿Esta seguro de borrar el usuario?, este cambio es irreversible.', [
    {
      text: 'Cancelar',
      onPress: () => console.log('Cancel Pressed'),
      style: 'cancel',
    },
    {text: 'Borrar', onPress: async() => deleteUser(id)},
  ]);
}

const deleteUser = async (employeeNumber: string) => {
  try {
    console.log({
      employeeNumber
    });
    
    const res = await axios.delete(`http://testingdev01.loclx.io/delete/${employeeNumber}`);
    console.log('Usuario eliminado:', res.data);
    await deleteUserPhoto(employeeNumber)
    navigation.goBack();
    return true;
  } catch (error: any) {
    console.error('Error eliminando usuario:', error?.response?.data || error.message);
    return false;
  }
};

  return (
    <>
     <View className='w-full flex-1 bg-white'>
     <Text className='font-bold text-center text-xl' style={{color: primaryColor}}>Entradas y salidas</Text>
      <View  className='w-11/12 bg-gray-100 self-center rounded-md my-0.5 flex flex-row-reverse items-center justify-center' >
        
        <Image 
          source={{ uri: `file://${user?.photoPath}?timestamp=${Date.now()}` }} 
          style={styles.image} />
        
        <View className='flex-1'>
          <Text style={{color: primaryColor}}  className='m-2 font-bold text-xl'>No. Empleado: {user?.userId}</Text>
          <Text style={{color: primaryColor}} className='m-2 font-bold text-base'>Nombre: {user?.userName}</Text>
        </View>
        

      </View>
      <View className='w-full flex flex-row flex-nowrap items-center justify-center gap-3 my-0.5'>
        <TouchableOpacity onPress={() => deleteUserPrompt(user?.userId ?? "")} className=' flex flex-row flex-nowrap items-center justify-center px-2 py-1 rounded-full bg-gray-200'>
          <Icon name='person-remove-outline' size={25} color={"#111"} />
          <Text className='m-3 text-black font-bold'>Borrar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {
        navigation.navigate("Register", {
          typeOfForm: "update",
          userInfo:user
        })
      }} className=' flex flex-row flex-nowrap items-center justify-center px-2 py-1 rounded-full bg-gray-200'>
          <Icon name='accessibility-outline' size={25} color={"#111"} />
          <Text className='m-3 text-black font-bold'>Editar</Text>
        </TouchableOpacity>
      </View>
        
      <View className='my-2'/>
      <FlatList
        data={data?.map((item, index) => {
          return ({
            ...item,
            id: index
          })
        })}
        renderItem={({item, index}) => {
          return(
            <View className='w-11/12 bg-gray-100 self-center rounded-md my-0.5 flex flex-row items-center justify-center' key={index}>
              
              <Image 
                source={{ uri: `file://${item.path}` }} 
                style={styles.image} />
              
              <View className='flex-1'>
                <Text style={{color: primaryColor}} className='m-2 font-bold text-base'>Fecha: {formatAttendanceDate(item.createdAt)}</Text>
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
