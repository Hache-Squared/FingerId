import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebaseConfig'; // Asumo que ya existe
import { User } from 'firebase/auth'; // Usamos el tipo User de Firebase Auth

// Inicialización de la aplicación para obtener Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const APP_ID = 'asset-track'; // Usaremos un ID de colección fijo para los datos públicos/base
const USERS_COLLECTION_PATH = `artifacts/${APP_ID}/users`;

// Tipo de dato para el perfil de usuario en Firestore
export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'user'; // Roles definidos
  first_name: string;
  last_name: string;
  phone?: string;
  department_id?: string;
  // Añadir más campos según necesites
}

/**
 * Escucha en tiempo real el documento de perfil del usuario en Firestore.
 * Si el documento no existe, lo crea con un rol por defecto.
 */
export const subscribeToUserProfile = (
  user: User, 
  callback: (profile: UserProfile) => void,
  onError: (error: Error) => void
) => {
  const userDocRef = doc(db, USERS_COLLECTION_PATH, user.uid);

  return onSnapshot(userDocRef, async (docSnap) => {
    const defaultProfile: UserProfile = {
      uid: user.uid,
      email: user.email || 'no-email@assettrack.com',
      role: 'admin', // Asignamos 'admin' por defecto para que el usuario pueda empezar a usar el dashboard.
      first_name: 'Admin',
      last_name: 'Demo',
    };

    if (docSnap.exists()) {
      const data = docSnap.data() as Omit<UserProfile, 'uid' | 'email'>;
      callback({ ...defaultProfile, ...data, email: user.email || defaultProfile.email });
    } else {
      // Si el documento no existe (primer login), lo creamos.
      await setDoc(userDocRef, defaultProfile, { merge: true });
      callback(defaultProfile);
    }
  }, (error) => {
    console.error("Error subscribing to user profile:", error);
    onError(error);
  });
};
