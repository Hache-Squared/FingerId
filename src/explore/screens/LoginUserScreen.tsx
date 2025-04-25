import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAppTheme, useFingerId } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';
import { CameraView } from '../views/CameraView';
import { PhotoData, usePhotoManagement } from '../../shared/hooks/usePhotoManagement'; 
import { PhotoFile } from 'react-native-vision-camera';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StackExploreParams } from '../../routes/StackExplore';
import { useSecurity } from '../../shared/hooks/useSecurity';
import { CameraLogin, ResponseAuth } from '../views/CameraLogin';

const LoginUserScreen = () => {
  const { primaryColor, secondaryColor } = useAppTheme()
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const [superPass, setSuperPass] = useState<string>('')
  const [photo, setPhoto] = useState<PhotoFile | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openSuperModal, setOpenSuperModal] = useState(false)
  const { savePhoto, getUsers} = usePhotoManagement()
  const {isLocked, startUnlockingState, startUsingSuperPass} = useSecurity()


  const handleAuth = async() => {
    const res = await startUnlockingState();
    if(!res){
      setOpenSuperModal(true)
    }
  }

  const handleSuperPass = async() =>{
    if(superPass === "admin"){
      await startUsingSuperPass()
    }else{
      
      Alert.alert("Error", "Contraseña invalida")
    }
  }

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  const handleCleanFields = async() => {
    await delay(2000);
    setSuperPass("")
    setPhoto(null)
  }


  // return ;

  return (
    <>
      <View 
      className='flex-1 w-full justify-center self-center bg-white '>

      <Text className='w-full text-center font-bold text-black text-2xl'>Registro De Asistencia</Text>
       
      <>
         
        {photo && <Image source={{ uri: `file://${photo.path}` }} style={styles.image} />}
        <View className='w-11/12 self-center  rounded-lg p-3'>
        
          <TouchableOpacity 
            onPress={() => {
              setOpenModal(true)
              
            }} 
            className='w-4/12 rounded-md my-2 p-3 flex self-center items-center justify-center'
            style={{backgroundColor: primaryColor}}
            >
            <Icon name='scan-circle-outline' size={50} color={"#fff"}/>
            <Text 
            className='text-base text-center'
            style={{
                color: secondaryColor,
                fontWeight: 'bold'
            }}
            >
                Escanear
            </Text>
          </TouchableOpacity>
          
        </View>

        <TouchableOpacity 
            onPress={() => handleAuth()} 
            className='w-10/12 rounded-full m-2 p-2 flex flex-row flex-nowrap items-center justify-center  self-center'
            style={{backgroundColor: primaryColor}}
            >
            <Icon name='lock-open-outline' size={30} color={secondaryColor} style={{margin: 5}}/>
            <Text 
            className='text-lg text-center'
            style={{
                color: secondaryColor,
                fontWeight: 'bold'
            }}
            >
                Administrador
            </Text>
        </TouchableOpacity>

      </>
      

      </View>

      <Modal visible={openModal} onRequestClose={() => setOpenModal(false)}>
            <View className='flex-1 '>
            <CameraLogin
              onLoginFail={(photo, response: ResponseAuth) => {
                console.log("onLoginFail: ", {photo, response});
                setPhoto(photo)
                setOpenModal(false)
                handleCleanFields()
              }}
              onLoginSuccess={(photo, response) => {
                console.log("onLoginSuccess: ",{photo, response});
                setPhoto(photo)
                setOpenModal(false)
                handleCleanFields()
              }}
            />
            </View>
      </Modal>

      <Modal visible={openSuperModal} 
        onRequestClose={() => {
          setSuperPass("")
          setOpenSuperModal(false)
        }}>
            <View className='flex-1 my-3 flex items-center justify-center'>
            <Text className='w-full text-center font-bold text-black text-2xl'>Ingresar como super usuario</Text>
            <View className='w-11/12 self-center  rounded-lg p-3'>
                <Text className='font-bold text-lg text-black text-center'>Contraseña:</Text>
                <TextInput
                  className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
                  style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
                  value={superPass}
                  placeholder='Super usuario'
                  placeholderTextColor={primaryColor}
                  onChangeText={(text) => setSuperPass(text)}
                  />
                
              </View>
              <View className='w-11/12 self-center flex flex-row items-center justify-center gap-2  rounded-lg p-3'>      
                <TouchableOpacity 
                  onPress={() => {
                    setSuperPass("")
                    setOpenSuperModal(false)
                    
                  }} 
                  className='w-4/12 rounded-full my-2 p-3 flex self-center items-center justify-center'
                  style={{backgroundColor: primaryColor}}
                  >
                  <Icon name='close-circle-outline' size={50} color={"#fff"}/>

                </TouchableOpacity>
                 <TouchableOpacity 
                  onPress={() => {
                    handleSuperPass()
                  }} 
                  className='w-4/12 rounded-full my-2 p-3 flex self-center items-center justify-center'
                  style={{backgroundColor: primaryColor}}
                  >
                  <Icon name='lock-open-outline' size={50} color={"#fff"}/>

                </TouchableOpacity>
                
              </View>
              
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