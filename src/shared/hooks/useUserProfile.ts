import { useState, useEffect } from 'react';
import { useAuth } from './useAuth'; // Usa el hook de auth del usuario
import { UserProfile, subscribeToUserProfile } from '../fetch/firebaseFirestoreFetch';
import { Unsubscribe } from 'firebase/firestore'; // Tipo de Firebase

interface UserProfileState {
  userInfo: UserProfile | null;
  isLoadingProfile: boolean;
  error: Error | null;
}

export const useUserProfile = (): UserProfileState => {
  const { user } = useAuth(); // Obtiene el usuario autenticado (UID, email) desde Redux
  const [state, setState] = useState<UserProfileState>({
    userInfo: null,
    isLoadingProfile: true,
    error: null,
  });

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    if (user && user.uid) {
      // El usuario está logueado, iniciamos la suscripción al perfil de Firestore
      unsubscribe = subscribeToUserProfile(
        { uid: user.uid, email: user.email } as any, // Hacemos un cast simple ya que solo necesitamos uid/email
        (profile) => {
          setState({ userInfo: profile, isLoadingProfile: false, error: null });
        },
        (error) => {
          setState({ userInfo: null, isLoadingProfile: false, error });
        }
      );
    } else {
      // El usuario no está logueado o se ha deslogueado
      setState({ userInfo: null, isLoadingProfile: false, error: null });
    }

    // Limpieza de la suscripción al desmontar o si el usuario cambia
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user?.uid]); // Depende del UID del usuario

  return state;
};
