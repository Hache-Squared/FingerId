import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAppTheme, useExploreStore, useFingerId, useLocalStorage } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';
import { CameraView } from '../views/CameraView';
import { PhotoData, usePhotoManagement } from '../../shared/hooks/usePhotoManagement';
import { usePhotoManagementWithStorage } from '../../shared/hooks/usePhotoManagementWithStorage';
import { PhotoFile } from 'react-native-vision-camera';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StackExploreParams } from '../../routes/StackExplore';

const LoginUserScreen = () => {
  const { primaryColor, secondaryColor } = useAppTheme()
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const [userId, setUserId] = useState<string>('')
  const [photo, setPhoto] = useState<PhotoFile | null>(null)
  const [openModal, setOpenModal] = useState(false)
 
  const { savePhoto, getUsers} = usePhotoManagement()

  const validateFields = () => {
  
    const trimmedUserIdText = userId.trim();

    if (!trimmedUserIdText) {
      Alert.alert('Error', 'El campo de id no puede estar vacío o contener solo espacios en blanco.');
      return false;
    }

    return true;
  };
  const handleLogin = async() => {
    if (validateFields() && photo) {
      const currentUsers = await getUsers()
      let index = currentUsers.findIndex(x => x.userId === userId);
      if(index === -1){
        Alert.alert("Error","Error, el usuario no existe") 
        return;
      }

      const res = await savePhoto(userId,"fotosHistorial", {
        id: userId,
        path: photo.path
      })

      if(!res){
        Alert.alert("Error al guardar")
        return;
      }
      navigation.navigate("ExploreContent")

    }
  }

  // return ;

  return (
    <>
      <View 
      className='flex-1 w-full justify-center self-center bg-white '>

      <View className='w-5/6 self-center flex flex-row items-center justify-end bg-red-00 ' >
        <TouchableOpacity onPress={() => null} className='p-2 rounded-full bg-gray-200'>
          <Icon name='key-outline' size={30} color={"#111"} className='mx-4'/>
        </TouchableOpacity>
      </View>
      <Text className='w-full text-center font-bold text-black text-2xl'>Bienvenido a Checker</Text>
       
      <>
         
        <View className='w-11/12 self-center  rounded-lg p-3'>
          <Text className='font-bold text-lg text-black text-center'>Matrícula:</Text>
          <TextInput
            className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
            style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
            value={userId}
            placeholder='Matrícula de alumno'
            placeholderTextColor={primaryColor}
            onChangeText={(text) => setUserId(text)}
            />
          
        </View>
        {photo && <Image source={{ uri: `file://${photo.path}` }} style={styles.image} />}
        <View className='w-11/12 self-center  rounded-lg p-3'>
        
          <TouchableOpacity 
            onPress={() => {
              setOpenModal(true)
              
            }} 
            className='w-4/12 rounded-full my-2 p-3 flex self-center items-center justify-center'
            style={{backgroundColor: primaryColor}}
            >
            <Icon name='camera' size={50} color={"#fff"}/>

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
                Registrar asistencia
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

export { LoginUserScreen }