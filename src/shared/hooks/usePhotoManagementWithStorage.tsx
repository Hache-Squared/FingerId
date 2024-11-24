import AsyncStorage from "@react-native-async-storage/async-storage";
import { PhotoData, usePhotoManagement } from "./usePhotoManagement";
import { PhotoFile } from "react-native-vision-camera";

export const usePhotoManagementWithStorage = () => {
  const {
      createUserFolders,
      savePhoto,
      saveProfilePhoto,
      getProfilePhoto,
      getPhotos,
      listUsersWithProfilePhotos,
  } = usePhotoManagement();

  const saveUserData = async (userId: string, userData: object, profilePhoto: PhotoFile): Promise<boolean> => {
    try {
        // Guardar la foto de perfil
        const res = await createUserFolders(userId)
        if(!res){
          console.log('Error generando directorios');
          return false;
        }
        const photoSaved = await saveProfilePhoto(userId, profilePhoto);
        if (!photoSaved) {
            console.log('No se pudo guardar la foto de perfil');
            return false;
        }

        // Guardar los datos del usuario en AsyncStorage
        const existingData = await AsyncStorage.getItem('users');
        const users = existingData ? JSON.parse(existingData) : {};

        users[userId] = { ...users[userId], ...userData };
        await AsyncStorage.setItem('users', JSON.stringify(users));

        console.log(`Datos del usuario ${userId} guardados en AsyncStorage junto con su foto de perfil`);
        return true;
    } catch (error) {
        console.log('Error al guardar los datos del usuario en AsyncStorage:', error);
        return false;
    }
};

  const getUserData = async (userId: string): Promise<object | null> => {
      try {
          const existingData = await AsyncStorage.getItem('users');
          const users = existingData ? JSON.parse(existingData) : {};

          return users[userId] || null;
      } catch (error) {
          console.log('Error al obtener los datos del usuario de AsyncStorage:', error);
          return null;
      }
  };

  return {
      createUserFolders,
      savePhoto,
      saveProfilePhoto,
      getProfilePhoto,
      getPhotos,
      listUsersWithProfilePhotos,
      saveUserData,
      getUserData,
  };
};
