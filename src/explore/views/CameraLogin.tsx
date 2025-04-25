import React, { FC, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, TouchableOpacity, Platform, Alert } from 'react-native';
import { Button, StyleSheet, View, Text, Image } from 'react-native';
import { Camera, useCameraDevices, PhotoFile, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { usePhotoManagement } from '../../shared/hooks/usePhotoManagement';

export interface ResponseAuth {
  match:  boolean;
  reason: string | null;
  user:   User   | null;
}

export interface User {
  employee_number: string;
  full_name:       string;
}

export interface CameraLoginProps {
  onLoginFail:    (photo: PhotoFile | null, response: any) => void,
  onLoginSuccess: (photo: PhotoFile | null, response: any) => void
}
export const CameraLogin: FC<CameraLoginProps> = ({onLoginFail, onLoginSuccess}) => {

  const [openSuccessModal, setOpenSuccessModal] = useState(false)
  const [openAnalysingModal, setOpenAnalysingModal] = useState(false)
  const [openErrorModal, setOpenErrorModal] = useState(false)

  const [responseApi, setResponseApi] = useState<ResponseAuth | null>(null);  
  
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('front')
  const { hasPermission, requestPermission } = useCameraPermission()
  const { savePhoto, getUsers} = usePhotoManagement()
  //if (!hasPermission) return <Text> No tiene permiso </Text>;
  if (device == null) return <Text> No tiene camara </Text>;

  const [photo, setPhoto] = useState<PhotoFile | null>(null);


  const takePicture = async () => {

    requestPermission();
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        enableAutoDistortionCorrection: true,
        enableAutoRedEyeReduction: true,
        enableShutterSound: true,
        flash: 'off',
      });
      setPhoto(photo);
      uploadPhoto(photo);
    }
  };

  // Función para subir la foto al servidor
  const uploadPhoto = async (photo: PhotoFile) => {
    setOpenAnalysingModal(true)
    const formData = new FormData();
    formData.append('image', {
      uri: Platform.OS === 'android' ? `file://${photo.path}` : photo.path,
      type: 'image/jpeg', // O el tipo de imagen adecuado
      name: 'photo.jpg',
    });

    try {
      const response = await axios.post<ResponseAuth>('http://testingdev01.loclx.io/identify', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setOpenAnalysingModal(false)
      if(!response?.data){
        setResponseApi({
          match: false,
          reason: "Error desconocido",
          user: null
        })
        setOpenErrorModal(true)
        return;
      }
      if(response?.data?.match === false){
        setResponseApi(response.data)
        setOpenErrorModal(true)
        return;
      }

      setResponseApi(response.data)
      setOpenSuccessModal(true)
      await handleLogin(photo, response.data);
      //const response = await axios.get('http://testingdev01.loclx.io/users');
      console.log('Imagen subida correctamente:', response.data);
    } catch (error) {
      setOpenAnalysingModal(false)
      let res = {
        match: false,
        reason: "Error al momento de enviar la fotografia",
        user: null
      }
      setResponseApi(res)
      setOpenErrorModal(true)
      console.error('Error al subir la imagen:', error);
    } finally {
      setOpenAnalysingModal(false)
    }
  };

  const handleLogin = async(photo: PhotoFile, responseApi: ResponseAuth) => {
    if (photo) {
      const currentUsers = await getUsers()
      let index = currentUsers.findIndex(x => x.userId == responseApi?.user?.employee_number);
      console.log({
        currentUsers,
        responseApi
      });
      
      if(index === -1){
        Alert.alert("Error","Error, el usuario no existe") 
        console.log("Error, el usuario no existe");
        return;
      }

      const res = await savePhoto(responseApi?.user?.employee_number ?? "","fotosHistorial", {
        id: responseApi?.user?.employee_number ?? "",
        path: photo.path
      })

      if(!res){
        Alert.alert("Error al guardar")
        console.log("Error al guardar");
        return;
      }
    }
  }


  if (!device) return <Text>Loading...</Text>;

  useEffect(() => {
    if(!hasPermission){
        requestPermission();
    }
  },[])


  return (
    <>
    
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        //style={StyleSheet.absoluteFill}
        className='flex-1'
        device={device}
        isActive={true}
        photo={true}
      />
      <View className='w-full flex items-center justify-center bg-white'>
        <TouchableOpacity className='w-auto rounded-md flex flex-row items-center justify-center  my-2 p-2 bg-black ' onPress={takePicture} >
          
          <Icon name='camera' size={40} color={"#fff"}/>
          <Text className='text-white text-center'>Tomar foto asistencia</Text>
        </TouchableOpacity>
        {/* {photoPath && !isUploading && <Text className='text-black text-center'>Foto tomada: {photoPath}</Text>}
        {isUploading && <Text className='text-black text-center'>Subiendo imagen...</Text>} */}
      </View>
    </View>

      <Modal visible={openSuccessModal}>
            <View className='flex-1 bg-green-500 flex items-center justify-center'>
              <View className='w-full my-3 flex items-center justify-center'>
                <Icon name='checkmark-circle-outline' size={120} color={"#fff"}/>                
              </View>
            <Text className='w-full text-center font-bold text-white text-2xl'>
              Asistencia tomada correctamente.
            </Text>
            <Text className='w-full text-center font-bold text-white text-2xl'>
              Bienvenido {responseApi?.user?.full_name ?? ""}.
            </Text>
            </View>
            <View className='w-full flex flex-row flex-nowrap items-center justify-center bg-white'>
              <TouchableOpacity 
              className='w-auto rounded-md flex flex-row items-center justify-center my-2 p-2 bg-black mx-2' 
              onPress={() => {
                onLoginSuccess(photo, responseApi)
              }} >  
                <Icon name='checkmark-done-outline' size={40} color={"#fff"}/>
                <Text className='text-white text-center'>Aceptar</Text>
              </TouchableOpacity>
            </View>
      </Modal>

      <Modal visible={openAnalysingModal}>
            <View className='flex-1 bg-blue-500 flex items-center justify-center'>
              <View className='w-full my-3 flex items-center justify-center'>
                <Icon name='checkmark-circle-outline' size={120} color={"#fff"}/>                
              </View>
              <Text className='w-full text-center font-bold text-white text-2xl'>
                Analizando fotografia, un minuto por favor
              </Text>
            </View>
            
      </Modal>

      <Modal visible={openErrorModal} 
        onRequestClose={() => {
          setOpenErrorModal(false)
        }}>
            <View className='flex-1 bg-red-500 flex items-center justify-center'>
              <View className='w-full my-3 flex items-center justify-center'>
                <Icon name='checkmark-circle-outline' size={120} color={"#fff"}/>                
              </View>
              <Text className='w-full text-center font-bold text-white text-2xl'>
                Hubo un error al momento de analizar la fotografia: {responseApi?.reason ?? "Error desconocido."}
              </Text>
              
            </View>
            <View className='w-full flex flex-row flex-nowrap items-center justify-center bg-white'>
              <TouchableOpacity 
              className='w-auto rounded-md flex flex-row items-center justify-center my-2 p-2 bg-black mx-2' 
              onPress={() => {
                onLoginFail(photo, responseApi)
              }}>
                
                <Icon name='checkmark-done-outline' size={40} color={"#fff"}/>
                <Text className='text-white text-center'>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
              className='w-auto rounded-md flex flex-row items-center justify-center  my-2 p-2 bg-black mx-2' 
              onPress={() => {
                setOpenErrorModal(false)
              }} >
                
                <Icon name='reload-outline' size={40} color={"#fff"}/>
                <Text className='text-white text-center'>Reintentar</Text>
              </TouchableOpacity>
            </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  image: {
    flex:1,
    width: Dimensions.get("screen").width*0.9,
    height: 500,
    alignSelf: 'center',
    // marginTop: 20,
  },
});

