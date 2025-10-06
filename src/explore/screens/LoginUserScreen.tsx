import React, { useState } from 'react'
import { Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAppTheme } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';
import { usePhotoManagement } from '../../shared/hooks/usePhotoManagement'; 
import { PhotoFile } from 'react-native-vision-camera';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StackExploreParams } from '../../routes/StackExplore';
import { useSecurity } from '../../shared/hooks/useSecurity';
/* @ts-ignore */
import Logo from '../../assets/logo.png';

const LoginUserScreen = () => {
  const { primaryColor, secondaryColor } = useAppTheme()
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [openSuperModal, setOpenSuperModal] = useState(false)
  const {isLocked, startUnlockingState, startUsingSuperPass} = useSecurity()


  const handleAuth = async() => {
    const res = await startUnlockingState();
    if(!res){
    }
  }

  return (
    <>
      <View className='flex-1 my-3 flex items-center justify-center'>
          <Image source={Logo} style={styles.image} />
          <Text className='w-full text-center font-bold text-black text-2xl'>AssetTrack</Text>
          <View className='w-11/12 self-center  rounded-lg p-3'>
            <Text className='font-bold text-lg text-black text-left'>Usuario:</Text>
            <TextInput
              className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
              style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
              value={username}
              placeholder='Nombre de usuario'
              placeholderTextColor={primaryColor}
              onChangeText={(text) => setUsername(text)}
              />
            
          </View>
          <View className='w-11/12 self-center  rounded-lg p-3'>
            <Text className='font-bold text-lg text-black text-left'>Contraseña:</Text>
            <TextInput
              className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
              style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
              value={password}
              placeholder='Contraseña'
              placeholderTextColor={primaryColor}
              onChangeText={(text) => setPassword(text)}
              />
            
          </View>

          <View className='w-11/12 self-center flex flex-row items-center justify-center my-2'>      
            <TouchableOpacity 
              onPress={() => {
                handleAuth()
              }} 
              className='w-full rounded-full p-1 flex flex-row gap-2 self-center items-center justify-center'
              style={{backgroundColor: primaryColor}}
              >
              <Text className='font-bold text-lg text-white text-left'>Iniciar Sesión</Text>
              <Icon name='enter-outline' size={50} color={"#fff"}/>
            </TouchableOpacity>
            
          </View>
          
        </View>
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