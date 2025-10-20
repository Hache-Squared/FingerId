import { useState, useCallback } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { 
  getDatabase, 
  ref as rtdbRef, // 'ref' ahora se importa como 'rtdbRef'
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

// AGREGADO: Tipos para los reportes
export type ReportKey = 'ASSIGNMENT' | 'ASSET_LOG' | 'USER_CREATION' | 'MAINT_ASSET' | 'MAINT_ADMIN';

// AGREGADO: Interfaz para la estructura de permisos
export interface ReportPermissions {
    // AGREGADO: Permiso para crear/registrar nuevos usuarios
    canCreateUsers: boolean; // <<<<<<<< ESTO ES LO QUE SE AGREGA
    canViewReports: boolean; // Control general (ver la pantalla de reportes)
    specificReports: Record<ReportKey, boolean>; // Control específico por reporte
}


// Data extendida del perfil de usuario (se guarda en RTDB)
export interface UserProfileData {
  uid: string; // ID de autenticación de Firebase
  email: string;
  firstName: string;
  lastName: string;
  department: string;
  role: UserRole; // 'admin' o 'user'
  employeeId: string; // Número de empleado o matrícula
  createdByUid: string;
  // AGREGADO: Permisos de reportes
  permissions: ReportPermissions;
}

/**
 * Hook para manejar la autenticación (registro/login) y la data de perfil en RTDB.
 */
export const useUsers = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfileData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  /**
   * Guarda los datos extendidos del perfil en la Realtime Database.
   * @param uid El UID de Firebase Auth.
   * @param data Los datos adicionales del perfil.
   */
  const saveUserProfileData = useCallback(async (uid: string, data: Omit<UserProfileData, 'uid' | 'email'> & { email: string }) => {
    try {
      const profilePath = `${USER_PROFILES_RTDB_PATH}/${uid}`;
      // NOTA: 'data' ahora incluye la propiedad 'permissions'
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
    // MODIFICADO: profileData ahora debe incluir los permisos
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
   * Inicia sesión con Email y Password.
   */
  const signInUser = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return userCredential.user; // Retorna el objeto User de Auth
    } catch (err: any) {
      console.error("Error durante el inicio de sesión:", err);
      let errorMessage = "Credenciales inválidas. Por favor, verifica el correo y la contraseña.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = "Usuario o contraseña incorrectos.";
      }
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  }, []);

  /**
   * Obtiene la data extendida de un usuario por su UID desde RTDB.
   */
  const getUserProfile = useCallback(async (uid: string): Promise<UserProfileData | null> => {
    try {
      const profilePath = `${USER_PROFILES_RTDB_PATH}/${uid}`;
      // Usamos rtdbRef y rtdbGet para una consulta única (no listener)
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


  /**
   * Carga la lista completa de perfiles de usuario desde RTDB (consulta única).
   */
  const fetchAllUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const usersRef = rtdbRef(db, USER_PROFILES_RTDB_PATH);
      const snapshot = await rtdbGet(usersRef);

      let usersArray: UserProfileData[] = [];
      if (snapshot.exists()) {
        const usersObject: Record<string, UserProfileData> = snapshot.val();
        // Convertimos el objeto de usuarios a un array
        usersArray = Object.values(usersObject);
      }
      setAllUsers(usersArray);
      return usersArray;
    } catch (err) {
      console.error("Error al obtener todos los perfiles de usuario:", err);
      setAllUsers([]);
      // No lanzamos error aquí, solo lo registramos
      return []; 
    } finally {
      setLoadingUsers(false);
    }
  }, []);


   return { 
    registerUser, 
    signInUser, 
    getUserProfile, 
    loading: loading || loadingUsers, 
    error,
    allUsers, 
    fetchAllUsers, 
    loadingUsers,
  };
};