import React, { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet, View, Text, Image } from 'react-native';
import { Camera, useCameraDevices, PhotoFile, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

export const CameraView = () => {

  const cameraRef = useRef<Camera>(null);
  
  const device = useCameraDevice('back')
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
    }
  };

  if (!device) return <Text>Loading...</Text>;

  useEffect(() => {
    if(!hasPermission){
        requestPermission();
    }
    
    
  },[])

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />
      <Button title="Take Picture" onPress={takePicture} />
      {photo && <Image source={{ uri: `file://${photo.path}` }} style={styles.image} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginTop: 20,
  },
});

