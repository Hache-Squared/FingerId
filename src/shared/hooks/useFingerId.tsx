import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import { Alert } from 'react-native';
 

export const useFingerId = () => {
 
  // Autenticación de usuario (para usuarios ya registrados)
  const authenticateUser = async (): Promise<boolean> => {
    try {
      const rnBiometrics = new ReactNativeBiometrics();
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();

      if (!available) {
        Alert.alert('Error', 'Sensor biometrico no disponible');
        return false;
      }

      const message = 'Utilice el lector por favor' ;

      const { success } = await rnBiometrics.simplePrompt({ promptMessage: message });

      if (!success) {
        Alert.alert('Error', 'Autenticación fallida');
        return false;
      }
 
      return true;

    } catch (error) {
      Alert.alert('Error', 'Autenticación fallida');
      return false;
    }
  };

  return {
        authenticateUser,
  };
};