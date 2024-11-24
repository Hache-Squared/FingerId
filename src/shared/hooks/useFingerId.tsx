import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage'; // Usamos AsyncStorage para guardar datos localmente

const optionalConfigObject = {
  title: 'Authentication Required', 
  imageColor: '#e00606', 
  imageErrorColor: '#ff0000', 
  sensorDescription: 'Touch sensor', 
  sensorErrorDescription: 'Failed', 
  cancelText: 'Cancel', 
  fallbackLabel: 'Show Passcode', 
  unifiedErrors: false, 
  passcodeFallback: false, 
};

export const useFingerId = () => {

  // Registro de usuario
  const registerUser = async (userName: string, userId: string) => {
    try {
      // Comprobamos si el dispositivo tiene un sensor biométrico disponible
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert('Error', 'Biometric sensor not available');
        return false;
      }

      const message = biometryType === BiometryTypes.TouchID ? 'Place your finger on the sensor' : 'Look at the device for FaceID';

      // Iniciamos la autenticación biométrica
      const { success } = await rnBiometrics.simplePrompt({ promptMessage: message });

      if (!success) {
        Alert.alert('Error', 'Authentication failed');
        return false;
      }

      // Si la autenticación es exitosa, guardamos el usuario en AsyncStorage
      const user = { userName, userId };
      await AsyncStorage.setItem(userId, JSON.stringify(user)); // Usamos userId como clave para guardar al usuario
      Alert.alert('Success', 'User registered successfully!');
      return true;

    } catch (error) {
      console.error('Error registering user:', error);
      Alert.alert('Error', 'Something went wrong during registration');
      return false;
    }
  };

  // Autenticación de usuario (para usuarios ya registrados)
  const authenticateUser = async () => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert('Error', 'Biometric sensor not available');
        return false;
      }

      const message = biometryType === BiometryTypes.TouchID ? 'Place your finger on the sensor' : 'Look at the device for FaceID';

      const { success } = await rnBiometrics.simplePrompt({ promptMessage: message });

      if (!success) {
        Alert.alert('Error', 'Authentication failed');
        return false;
      }

      // Si la autenticación es exitosa, buscamos al usuario en AsyncStorage
      const storedUsers = await AsyncStorage.getAllKeys(); // Obtener todas las claves
      for (const key of storedUsers) {
        const storedUser = await AsyncStorage.getItem(key) as any;
        const user = JSON.parse(storedUser);

        // En este caso, estamos usando el userId como clave única para cada usuario
        if (user) {
          Alert.alert('Success', `Welcome back, ${user.userName}`);
          return user; // Retorna el usuario autenticado
        }
      }

      Alert.alert('Error', 'No matching user found');
      return false;

    } catch (error) {
      console.error('Error during authentication:', error);
      Alert.alert('Error', 'Authentication failed');
      return false;
    }
  };

  return {
    registerUser,
    authenticateUser,
  };
};