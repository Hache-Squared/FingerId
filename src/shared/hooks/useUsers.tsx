import { useState, useCallback } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getDatabase, 
  ref as rtdbRef, // <--- CORRECCIÓN: 'ref' ahora se importa como 'rtdbRef'
  set as rtdbSet, 
  get as rtdbGet, 
  push as rtdbPush, 
  child as rtdbChild 
} from 'firebase/database';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { firebaseConfig } from '../config/firebaseConfig';
import { useRealtimeFetch } from './useRealtimeFetch'; // Usamos el hook de RTDB para operaciones simples

// --- Inicialización de Firebase (Aseguramos una sola instancia) ---
// NOTA: Asegúrate de que firebaseConfig esté correctamente definido en '../../config/firebaseConfig'
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);

// --- Rutas Simplificadas de RTDB ---
// Los perfiles se guardarán bajo `users/{UID}`
const USER_PROFILES_RTDB_PATH = 'userProfiles'; 

// --- Tipos ---
export type UserRole = 'admin' | 'user';

// Data extendida del perfil de usuario (se guarda en RTDB)
export interface UserProfileData {
  uid: string; // ID de autenticación de Firebase
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  role: UserRole; // 'admin' o 'user'
  employeeId: string; // Número de empleado o matrícula
  // Agrega otros campos de data que necesites
}

/**
 * Hook para manejar la autenticación (registro/login) y la data de perfil en RTDB.
 */
export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Guarda los datos extendidos del perfil en la Realtime Database.
   * @param uid El UID de Firebase Auth.
   * @param data Los datos adicionales del perfil.
   */
  const saveUserProfileData = useCallback(async (uid: string, data: Omit<UserProfileData, 'uid' | 'email'> & { email: string }) => {
    try {
      const profilePath = `${USER_PROFILES_RTDB_PATH}/${uid}`;
      await rtdbSet(rtdbRef(db, profilePath), {
        ...data,
        uid: uid,
        created_at: Date.now(),
      });
      console.log(`Perfil de usuario ${uid} guardado en RTDB.`);
    } catch (err: any) {
      console.error("Error al guardar el perfil de usuario en RTDB:", err);
      throw new Error("Error al guardar la información del perfil.");
    }
  }, []);

  /**
   * Registra un nuevo usuario con Email y Password y guarda su perfil extendido en RTDB.
   */
  const registerUser = useCallback(async (
    email: string, 
    password: string, 
    profileData: Omit<UserProfileData, 'uid' | 'email'>
  ) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Guardar el perfil extendido en RTDB
      await saveUserProfileData(user.uid, { ...profileData, email });
      
      setLoading(false);
      return user.uid;

    } catch (err: any) {
      console.error("Error durante el registro:", err);
      // Firebase Auth errors a friendly message
      let errorMessage = "Ocurrió un error al registrar el usuario.";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo electrónico ya está registrado.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'El formato del correo es inválido.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      }
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, [saveUserProfileData]);

  /**
   * Obtiene la data extendida de un usuario por su UID desde RTDB.
   */
  const getUserProfile = useCallback(async (uid: string): Promise<UserProfileData | null> => {
    try {
      const profilePath = `${USER_PROFILES_RTDB_PATH}/${uid}`;
      const snapshot = await rtdbGet(rtdbChild(rtdbRef(db), profilePath));
      
      if (snapshot.exists()) {
        return snapshot.val() as UserProfileData;
      }
      return null;
    } catch (err) {
      console.error("Error al obtener el perfil de usuario:", err);
      return null;
    }
  }, []);

  // También puedes añadir funciones para signIn, signOut, etc., aquí si es necesario.
  
  return { registerUser, getUserProfile, loading, error };
};
