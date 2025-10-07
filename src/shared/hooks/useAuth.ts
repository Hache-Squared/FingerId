import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, logoutUser, setAuthLoading } from '../../store/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseAuthFetch } from '../../shared/fetch/firebaseAuthFetch';
import { useUsers } from './useUsers'; // Importar useUsers para signInUser

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const { signInUser, registerUser } = useUsers(); // Usamos las funciones del hook de users

  const signInWithEmail = async (email: string, password: string) => {
    try {
      dispatch(setAuthLoading(true));
      
      // CAMBIO CLAVE: Usamos signInUser de useUsers.ts
      const responseUser = await signInUser(email, password);
        
      if (responseUser) {
        // Guardar sesión local
        await AsyncStorage.setItem('@user', JSON.stringify(responseUser));
        const cleanUser = {
          uid: responseUser.uid,
          email: responseUser.email || '',
        };
        dispatch(loginUser(cleanUser));
      } else {
        // El error ya fue manejado y establecido en useUsers
        throw new Error('Fallo en la autenticación (ver errores de useUsers)'); 
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      dispatch(setAuthLoading(true));
      // Usamos registerUser de useUsers para crear usuario y perfil RTDB
      const uid = await registerUser(email, password, {
          // Aquí pasarías la data del perfil si fuera un registro en vivo
          firstName: 'Nuevo',
          lastName: 'Usuario',
          employeeId: 'TEMP',
          department: 'TEMP',
          role: 'user'
      });
      
      if (uid) {
        // Como registerUser también es signInUser, el usuario ya está autenticado.
        // Simulamos la estructura mínima para Redux/AsyncStorage
        const tempUser = { uid, email }; 
        await AsyncStorage.setItem('@user', JSON.stringify(tempUser));
        dispatch(loginUser(tempUser));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  const signOut = async () => {
    await firebaseAuthFetch.signOut();
    await AsyncStorage.removeItem('@user');
    dispatch(logoutUser());
  };

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  };
};
