import React, { FC, useEffect, useState } from 'react'
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAppTheme, useFingerId } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';
import { CameraView } from '../views/CameraView';
import { PhotoData, usePhotoManagement } from '../../shared/hooks/usePhotoManagement'; 
import { PhotoFile } from 'react-native-vision-camera';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { StackExploreParams } from '../../routes/StackExplore';
import axios from 'axios';

const RegisterUserScreen = () => {
  const { typeOfForm = "register", userInfo } = useRoute<RouteProp<StackExploreParams, 'Register'>>().params;
  const { texts, primaryColor, secondaryColor, screens } = useAppTheme()
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const [userName, setUserName] = useState<string>(typeOfForm == "register" ? "" : userInfo?.userName)
  const [userId, setUserId] = useState<string>(typeOfForm == "register" ? "" : userInfo?.userId)
  const [photo, setPhoto] = useState<PhotoFile | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openModalWaiting, setOpenModalWaiting] = useState(false)

  const { saveUserData, getUsers } = usePhotoManagement()

  const validateFields = () => {
    const trimmedUserNameText = userName.trim();
    const trimmedUserIdText = userId.trim();

    if (!trimmedUserNameText) {
      Alert.alert('Error', 'El campo de nombre no puede estar vacío o contener solo espacios en blanco.');
      return false;
    }

    if (!trimmedUserIdText) {
      Alert.alert('Error', 'El campo de matrícula no puede estar vacío o contener solo espacios en blanco.');
      return false;
    }

    if (!photo) {
      Alert.alert('Error', 'El campo de Foto no puede estar vacío.');
      return false;
    }

    return true;
  };

  const handleChooseOption = async() => {
    if(typeOfForm == "register"){
      await handleCreateUser();
    }else{
      await handleUpdateUser();
    }
  }

  const handleCreateUser = async () => {
    setOpenModalWaiting(true)
    if (!validateFields() || !photo) {
      setOpenModalWaiting(false)
      return
    };
  
    const formData = new FormData();
    formData.append('employee_number', userId);
    formData.append('full_name', userName);
    formData.append('image', {
      uri: `file://${photo.path}`,
      type: 'image/jpeg',
      name: 'profile.jpg'
    });
  
    try {
      const response = await axios.post('http://testingdev01.loclx.io/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setOpenModalWaiting(false)
      if (response.status === 201) {
        Alert.alert('Éxito', 'Empleado registrado correctamente');
        const res = await saveUserData(userId,{
          userName,
          userId
        }, photo)
        if(!res){
          Alert.alert("Error al guardar")
          return;
        }
        navigation.goBack();
      }
    } catch (error) {
      setOpenModalWaiting(false)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          Alert.alert('Error', error.response?.data?.error || 'El usuario ya existe');
        } else {
          Alert.alert('Error', error.response?.data?.error || 'Error al registrar');
        }
      } else {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      }
    }
  };

  const handleUpdateUser = async () => {
    setOpenModalWaiting(true)
    if (!validateFields() || !photo) {
      setOpenModalWaiting(false)
      return
    };
  
    const formData = new FormData();
    formData.append('employee_number', userId);
    formData.append('full_name', userName);
    formData.append('image', {
      uri: `file://${photo.path}`,
      type: 'image/jpeg',
      name: 'profile.jpg'
    });
  
    try {
      const response = await axios.put('http://testingdev01.loclx.io/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setOpenModalWaiting(false)
      if (response.status === 200) {
        Alert.alert('Éxito', 'Empleado registrado correctamente');
        const res = await saveUserData(userId,{
          userName,
          userId
        }, photo)
        if(!res){
          Alert.alert("Error al guardar")
          return;
        }
        navigation.goBack();
      }
    } catch (error) {
      setOpenModalWaiting(false)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          Alert.alert('Error', error.response?.data?.error || 'El usuario ya existe');
        } else {
          Alert.alert('Error', error.response?.data?.error || 'Error al registrar');
        }
      } else {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
      }
    }
  };

  // return ;

  return (
    <>
      <View 
      className='w-full justify-center self-center bg-white '>

      
      <Text className='w-full text-center font-bold text-black text-2xl my-4'>{typeOfForm == "register" ? "Registrar" : "Actualizar"} Empleado</Text>
       
      <>
        
        <View className='w-11/12 self-center  rounded-lg p-3'>
          <Text className='font-bold text-lg text-black'>No. De Empleado:</Text>
          <TextInput
            className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
            value={userId}
            editable={typeOfForm == "register" ? true : false}
            placeholder='Numero De Empleado'
            placeholderTextColor={primaryColor}
            onChangeText={(text) => setUserId(text)}
            />
          
        </View>
        <View className='w-11/12 self-center  rounded-lg p-3'>
        <Text className='font-bold text-lg text-black'>Nombre De Empleado:</Text>
          <TextInput
            className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
            value={userName}
            placeholder={"Nombre De Empleado"}
            placeholderTextColor={primaryColor}
            onChangeText={(text) => setUserName(text)}
            />
          
        </View>
        {photo && <Image source={{ uri: `file://${photo.path}` }} style={styles.image} />}
        <View className='w-11/12 self-center  rounded-lg p-3'>
          <Text className='font-bold text-lg text-black'>Foto De Empleado:</Text>
          <TouchableOpacity 
            onPress={() => {
              setOpenModal(true)
              
            }} 
            className='w-4/12 rounded-full my-2 p-3 flex self-center items-center justify-center'
            style={{backgroundColor: primaryColor}}
            >
            <Icon name='person-add-outline' size={50} color={"#fff"}/>

          </TouchableOpacity>
          
        </View>
        <TouchableOpacity 
            onPress={handleChooseOption} 
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
                {typeOfForm == "register" ? "Generar" : "Actualizar"} Empleado
            </Text>
        </TouchableOpacity>
        
      </>
      

      </View>

      <Modal visible={openModal} onRequestClose={() => setOpenModal(false)}>
            <View className='flex-1 '>
            <CameraView
              onConfirmPhoto={(photo) => {
                console.log(photo);
                setPhoto(photo)
                setOpenModal(false)
                
              }}
            />
            </View>
      </Modal>

      <Modal visible={openModalWaiting}>
        <View className='flex-1 bg-blue-500 flex items-center justify-center'>
          <View className='w-full my-3 flex items-center justify-center'>
            <Icon name='checkmark-circle-outline' size={120} color={"#fff"}/>                
          </View>
          <Text className='w-full text-center font-bold text-white text-2xl'>
          {typeOfForm == "register" ? "Generando" : "Actualizando"} usuario ... espere por favor.
          </Text>
        </View>   
      </Modal>
    </>

    
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  image: {
    
    width: Dimensions.get("screen").width*0.9,
    height: 250,
    alignSelf: 'center',
    // marginTop: 20,
  },
});

export { RegisterUserScreen }