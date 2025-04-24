import React, { FC, useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, TouchableOpacity } from 'react-native';
import { Button, StyleSheet, View, Text, Image } from 'react-native';
import { Camera, useCameraDevices, PhotoFile, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import Icon from 'react-native-vector-icons/Ionicons';

export interface CameraViewProps {
  onConfirmPhoto: (photo: PhotoFile | null) => void,
}
export const CameraView: FC<CameraViewProps> = ({onConfirmPhoto}) => {

  const cameraRef = useRef<Camera>(null);
  const [openModal, setOpenModal] = useState(false)
  const device = useCameraDevice('front')
  const { hasPermission, requestPermission } = useCameraPermission()

  //if (!hasPermission) return <Text> No tiene permiso </Text>;
  if (device == null) return <Text> No tiene camara </Text>;

  const [photo, setPhoto] = useState<PhotoFile | null>(null);


  const takePicture = async () => {

    requestPermission();
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      setPhoto(photo);
      setOpenModal(true);
    }
  };

  const confirmPhoto = () => {

    onConfirmPhoto(photo)
    setOpenModal(false)
  }
  const retryPhoto = () => {
    setOpenModal(false)
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
      <View className='w-full flex items-center justify-center bg-[rgba(1,1,1,.7)]'>
        <TouchableOpacity className='w-auto rounded-md flex flex-row items-center justify-center  my-2 p-2 bg-blue-500 ' onPress={takePicture} >
          
          <Icon name='camera' size={40} color={"#fff"}/>
          {/* <Text className='text-white text-center'>Tomar foto asistencia</Text> */}
        </TouchableOpacity>
      </View>
      
      
      {/* {photo && <Image source={{ uri: `file://${photo.path}` }} style={styles.image} />} */}
    </View>
    <Modal visible={openModal} onRequestClose={() => setOpenModal(false)}>
            <View className='flex-1 '>
            {photo && <Image source={{ uri: `file://${photo.path}` }} style={styles.image} />}
              <View className='w-full flex flex-row flex-nowrap items-center justify-center bg-[rgba(1,1,1,.7)]'>
              <TouchableOpacity className='w-auto rounded-md flex flex-row items-center justify-center my-2 p-2 bg-blue-500 mx-2' onPress={confirmPhoto} >
                
                <Icon name='checkmark-done-outline' size={40} color={"#fff"}/>
                {/* <Text className='text-white text-center'>Tomar foto asistencia</Text> */}
              </TouchableOpacity>
              <TouchableOpacity className='w-auto rounded-md flex flex-row items-center justify-center  my-2 p-2 bg-blue-500 mx-2' onPress={retryPhoto} >
                
                <Icon name='reload-outline' size={40} color={"#fff"}/>
                {/* <Text className='text-white text-center'>Tomar foto asistencia</Text> */}
              </TouchableOpacity>
            </View>
              
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

