import React, { useState } from 'react'
import { Alert, Dimensions, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useAppTheme } from '../../shared/hooks'
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../shared/hooks/useAuth';
/* @ts-ignore */
import Logo from '../../assets/logo.png';

const LoginUserScreen = () => {
  const { primaryColor, secondaryColor } = useAppTheme()
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const { signInWithEmail, loading } = useAuth();


  const handleAuth = async() => {
    try {
      let _username = username?.trim();
      let _password = password?.trim();
      await signInWithEmail(_username, _password);
      
    } catch (error) {
      Alert.alert("Error", "Usuario y/o contraseña invalidos")
    }
  }

  return (
    <>
      <View className='flex-1 my-3 flex items-center justify-center'>
          <Image source={Logo} style={styles.image} />
          <Text className='w-full text-center font-bold text-black text-2xl'>AssetTrack</Text>
          <View className='w-11/12 self-center  rounded-lg p-3'>
            <Text className='font-bold text-lg text-black text-left'>Correo:</Text>
            <TextInput
              className='w-full self-center shadow-md shadow-slate-300 p-1.5 rounded-lg  border-2 border-black text-center'
              style={{ height: 50, borderColor: 'gray', borderWidth: 1, color: primaryColor }}
              value={username}
              placeholder='Correo de usuario'
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
              secureTextEntry
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
              <Text className='font-bold text-lg text-white text-left'>{loading ? 'Cargando...' : 'Iniciar Sesión'}</Text>
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