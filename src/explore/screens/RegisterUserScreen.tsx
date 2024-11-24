import React, { useEffect, useState } from 'react'
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAppTheme, useExploreStore, useFingerId, useLocalStorage } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';
import { CameraView } from '../views/CameraView';

const RegisterUserScreen = () => {
  const { texts, primaryColor, secondaryColor, screens } = useAppTheme()
  
  const [userName, setUserName] = useState<string>('')
  const [UserId, setUserId] = useState<string>('')
  const { startLoginUser } = useExploreStore()
  const { authenticateUser} = useFingerId()
  const validateFields = () => {
    const trimmedUserNameText = userName.trim();
    const trimmedUserIdText = UserId.trim();

    if (!trimmedUserNameText) {
      Alert.alert('Error', 'El campo de nombre no puede estar vacío o contener solo espacios en blanco.');
      return false;
    }

    if (!trimmedUserIdText) {
      Alert.alert('Error', 'El campo de id no puede estar vacío o contener solo espacios en blanco.');
      return false;
    }

    return true;
  };
  const handleLogin = () => {
    if (validateFields()) {
      
    }
  }

  return <CameraView/>;

  return (

      <View 
      className='w-full justify-center self-center bg-white '>

      
      <Text className='w-full text-center font-bold text-black text-2xl'>Registrar Usuario</Text>
       
      <>
        <View className='w-11/12 self-center  rounded-lg p-3'>
        <Text className='font-bold text-lg text-black'>Nombre:</Text>
          <TextInput
            className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
            value={userName}
            placeholder={"Nombre de alumno"}
            placeholderTextColor={primaryColor}
            onChangeText={(text) => setUserName(text)}
            />
          
        </View>
        <View className='w-11/12 self-center  rounded-lg p-3'>
          <Text className='font-bold text-lg text-black'>Matrícula:</Text>
          <TextInput
            className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
            value={UserId}
            placeholder='Matrícula de alumno'
            placeholderTextColor={primaryColor}
            onChangeText={(text) => setUserId(text)}
            />
          
        </View>
        <View className='w-11/12 self-center  rounded-lg p-3'>
          <Text className='font-bold text-lg text-black text-center'>Huella</Text>
          <TouchableOpacity 
            onPress={() => {
              authenticateUser()
              
            }} 
            className='w-4/12 rounded-full my-2 p-3 flex self-center items-center justify-center'
            style={{backgroundColor: primaryColor}}
            >
            <Icon name='finger-print-outline' size={50} color={"#fff"}/>

          </TouchableOpacity>
          
        </View>
        <TouchableOpacity 
            onPress={handleLogin} 
            className='w-10/12 rounded-full m-2 p-2 self-center'
            style={{backgroundColor: primaryColor}}
            >
            <Text 
            className='text-lg text-center'
            style={{
                color: secondaryColor,
                fontWeight: 'bold'
            }}
            >
                Generar Usuario
            </Text>
        </TouchableOpacity>
      </>
      

      </View>


    
  )
}



export { RegisterUserScreen }