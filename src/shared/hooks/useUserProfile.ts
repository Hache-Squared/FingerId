import { useState, useEffect } from 'react';
import { useAuth } from './useAuth'; // Usa el hook de auth del usuario
import { useUsers, UserProfileData } from './useUsers'; 

interface UserProfileState {
  userInfo: UserProfileData | null;
  isLoadingProfile: boolean;
  error: Error | null;
}

/**
 * Hook para obtener la data extendida del perfil de usuario (nombre, rol, etc.) 
 * desde Realtime Database. Realiza un fetch ÚNICO (no listener) cuando el UID cambia.
 * * Este reemplaza la versión anterior basada en listeners de Firestore.
 */
export const useUserProfile = (): UserProfileState => {
  // Obtenemos el usuario autenticado (UID, email) desde Redux a través de useAuth
  const { user } = useAuth(); 
  // Obtenemos la función de consulta de perfil de nuestro hook unificado
  const { getUserProfile } = useUsers(); 
  
  const [state, setState] = useState<UserProfileState>({
    userInfo: null,
    isLoadingProfile: true,
    error: null,
  });

  useEffect(() => {
    // 1. Reiniciar estado si no hay usuario
    if (!user || !user.uid) {
      setState({ userInfo: null, isLoadingProfile: false, error: null });
      return;
    }

    // 2. Si hay usuario, iniciar la carga del perfil con un GET único.
    setState(prevState => ({ ...prevState, isLoadingProfile: true, error: null }));

    const fetchProfile = async () => {
      try {
        const profile = await getUserProfile(user.uid);
        
        if (profile) {
          // Éxito: Guardamos la data
          setState({ userInfo: profile, isLoadingProfile: false, error: null });
        } else {
          // Error: No se encontró data de perfil en RTDB
          const profileError = new Error("No se encontró data de perfil extendida para este usuario.");
          setState({ userInfo: null, isLoadingProfile: false, error: profileError });
        }
      } catch (e: any) {
        console.error("Error fetching user profile:", e);
        setState({ userInfo: null, isLoadingProfile: false, error: e });
      }
    };

    fetchProfile();

    // Importante: No hay función de limpieza porque no hay listener (`onSnapshot`)
  }, [user?.uid, getUserProfile]); // Se ejecuta si el UID de Auth cambia o si getUserProfile cambia (que no debería)

  return state;
};
