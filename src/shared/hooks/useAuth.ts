// src/shared/hooks/useAuth.ts
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser, logoutUser, setAuthLoading } from '../../store/auth/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebaseAuthFetch } from '../../shared/fetch/firebaseAuthFetch';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      dispatch(setAuthLoading(true));
      const response = await firebaseAuthFetch.signIn(email, password);
        console.log({
           responseFromFirebase: JSON.stringify(response) 
        });
        
      if (response.user) {
        // Guardar sesión local
        await AsyncStorage.setItem('@user', JSON.stringify(response.user));
        const cleanUser = {
          uid: response.user.uid,
          email: response.user.email || '',
        };
        dispatch(loginUser(cleanUser));
      } else {
        throw new Error('Invalid credentials');
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
      const response = await firebaseAuthFetch.signUp(email, password);
      if (response.user) {
        const cleanUser = {
          uid: response.user.uid,
          email: response.user.email || '',
        };
        dispatch(loginUser(cleanUser));
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
