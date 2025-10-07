import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { firebaseConfig } from '../config/firebaseConfig'; // Tu configuración de Firebase

// Inicializar Firebase (Aseguramos una sola instancia)
// NOTA: firebaseConfig debe ser definido en el archivo de configuración.
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

/**
 * Este fetcher se utiliza para operaciones directas de Firebase Auth.
 * Solo mantenemos `signOut` aquí, ya que `signIn` y `signUp` fueron movidos a `useUsers` 
 * para centralizar la lógica de auth + RTDB profile.
 */
export const firebaseAuthFetch = {
  // Las funciones signIn y signUp se manejan a través de useUsers.ts
  
  async signOut() {
    await signOut(auth);
  },
};
