import React, { useEffect } from 'react'; // <-- Importar useEffect
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, logoutUser, setAuthLoading } from '../../store/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseAuthFetch } from '../../shared/fetch/firebaseAuthFetch';
import { useUsers } from './useUsers'; // Importar useUsers para signInUser

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);
  const { signInUser, registerUser } = useUsers(); // Usamos las funciones del hook de users

  // --- LÓGICA DE PERSISTENCIA DE SESIÓN ---
  const checkUserSession = async () => {
    dispatch(setAuthLoading(true)); // Mostrar indicador de carga al iniciar
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      
      if (storedUser) {
        const user: { uid: string, email: string } = JSON.parse(storedUser);
        // Despachar la acción de login si hay datos en AsyncStorage
        dispatch(loginUser(user));
        console.log('Sesión restaurada desde AsyncStorage:', user.email);
      }else{
        await AsyncStorage.removeItem('@user'); 
        dispatch(logoutUser());
      }
    } catch (err) {
      console.error('Error al cargar la sesión de AsyncStorage:', err);
      // Opcional: Si falla, asegúrate de que el estado esté limpio.
      await AsyncStorage.removeItem('@user'); 
      dispatch(logoutUser());
    } finally {
      dispatch(setAuthLoading(false)); // Ocultar indicador de carga
    }
  };
  
  // Ejecutar la revisión de sesión una sola vez al montar el hook
  useEffect(() => {
    checkUserSession();
    // NOTA: El array de dependencias vacío asegura que se ejecute solo al montar.
  }, []); 
  // ----------------------------------------

  const signInWithEmail = async (email: string, password: string) => {
    try {
      dispatch(setAuthLoading(true));
      
      // CAMBIO CLAVE: Usamos signInUser de useUsers.ts
      const responseUser = await signInUser(email, password);
      console.log({
        responseUser
      });
      
      if (responseUser) {
        // Guardar sesión local
        const cleanUser = {
          uid: responseUser.uid,
          email: responseUser.email || '',
        };
        await AsyncStorage.setItem('@user', JSON.stringify(cleanUser)); // <-- Limpiado aquí
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
    // Asegurarse de que el usuario se desconecte de Firebase y de AsyncStorage
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
    checkUserSession, // Opcional, pero útil para re-chequeos
  };
};