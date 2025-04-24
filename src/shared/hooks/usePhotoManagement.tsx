import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import RNFS from 'react-native-fs';
import { PhotoFile } from 'react-native-vision-camera';

export type PhotoData = {
    id: string;
    path: string;
};

export type PhotoInfo = {
    id: string;
    name: string;
    path: string;
    createdAt: any | null;
};

export const usePhotoManagement = () => {
    // Ruta base de la aplicación
    const appBasePath = `${RNFS.DocumentDirectoryPath}/miApp`;
    const usersPath = `${appBasePath}/users`;

    useEffect(() => {
        createInitialFolders();
    }, []);

    // Crear la estructura inicial de carpetas
    const createInitialFolders = async (): Promise<void> => {
        try {
            // Verificar y crear appBasePath
            const appBasePathExists = await RNFS.exists(appBasePath);
            if (!appBasePathExists) {
                await RNFS.mkdir(appBasePath);
                console.log(`${appBasePath} creado`);
            }

            // Verificar y crear usersPath
            const usersPathExists = await RNFS.exists(usersPath);
            if (!usersPathExists) {
                await RNFS.mkdir(usersPath);
                console.log(`${usersPath} creado`);
            }
        } catch (error) {
            console.log('Error al crear los directorios iniciales:', error);
        }
    };

    // Crear carpetas por usuario
    const createUserFolders = async (userId: string): Promise<boolean> => {
        try {
            const userFolderPath = `${usersPath}/${userId}`;
            const profileFolderPath = `${userFolderPath}/fotoPerfil`;
            const historyFolderPath = `${userFolderPath}/fotosHistorial`;

            // Verificar y crear carpeta del usuario
            if (!(await RNFS.exists(userFolderPath))) {
                await RNFS.mkdir(userFolderPath);
                console.log(`Carpeta creada para usuario ${userId}`);
            }

            // Verificar y crear carpeta fotoPerfil
            if (!(await RNFS.exists(profileFolderPath))) {
                await RNFS.mkdir(profileFolderPath);
            }

            // Verificar y crear carpeta fotosHistorial
            if (!(await RNFS.exists(historyFolderPath))) {
                await RNFS.mkdir(historyFolderPath);
            }

            return true;
        } catch (error) {
            console.log('Error al crear carpetas del usuario:', error);
            return false;
        }
    };

    // Guardar una foto en una carpeta específica
    const savePhoto = async (userId: string, folder: string, photoData: PhotoData): Promise<boolean> => {
        try {
            const res = await createUserFolders(userId)
            if(!res){
                console.log('Error generando directorios');
                return false;
            }
            const folderPath = `${usersPath}/${userId}/${folder}`;

            if (!(await RNFS.exists(folderPath))) {
                console.log(`Carpeta no encontrada: ${folderPath}`);
                return false;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `${photoData.id}_${timestamp}.jpg`;
            const destinationPath = `${folderPath}/${fileName}`;

            await RNFS.copyFile(photoData.path, destinationPath);
            console.log(`Foto guardada en: ${destinationPath}`);
            return true;
        } catch (error) {
            console.log('Error al guardar la foto:', error);
            return false;
        }
    };

    // Guardar la foto de perfil
    const saveProfilePhoto = async (userId: string, photoData: PhotoFile): Promise<boolean> => {
        try {
            const profileFolderPath = `${usersPath}/${userId}/fotoPerfil`;
            const res = await createUserFolders(userId)
            if(!res){
            console.log('Error generando directorios');
            return false;
            }

            if (!(await RNFS.exists(profileFolderPath))) {
                console.log(`Carpeta no encontrada: ${profileFolderPath}`);
                return false;
            }

            const fileName = `profile-${userId}.jpg`;
            const destinationPath = `${profileFolderPath}/${fileName}`;

            await RNFS.copyFile(photoData.path, destinationPath);
            console.log(`Foto de perfil guardada en: ${destinationPath}`);
            return true;
        } catch (error) {
            console.log('Error al guardar la foto de perfil:', error);
            return false;
        }
    };

    // Obtener la foto de perfil
    const getProfilePhoto = async (userId: string): Promise<PhotoInfo | null> => {
        try {
            const profileFolderPath = `${usersPath}/${userId}/fotoPerfil`;
            const fileName = `profile-${userId}.jpg`;
            const filePath = `${profileFolderPath}/${fileName}`;

            if (!(await RNFS.exists(filePath))) {
                console.log(`Foto de perfil no encontrada: ${filePath}`);
                return null;
            }

            const fileStats = await RNFS.stat(filePath);

            return {
                id: userId,
                name: fileName,
                path: filePath,
                createdAt: fileStats.mtime,
            };
        } catch (error) {
            console.log('Error al obtener la foto de perfil:', error);
            return null;
        }
    };

    // Obtener todas las fotos de una carpeta
    const getPhotos = async (userId: string, folder: string): Promise<PhotoInfo[]> => {
        try {
            const folderPath = `${usersPath}/${userId}/${folder}`;

            if (!(await RNFS.exists(folderPath))) {
                console.log(`Carpeta no encontrada: ${folderPath}`);
                return [];
            }

            const files = await RNFS.readDir(folderPath);

            return files.map((file) => ({
                id: file.name.split('_')[0],
                name: file.name,
                path: file.path,
                createdAt: file.mtime,
            }));
        } catch (error) {
            console.log('Error al obtener las fotos:', error);
            return [];
        }
    };
    const listUsersWithProfilePhotos = async (): Promise<{ userId: string; userName: string; profilePhoto: PhotoInfo | null }[]> => {
        try {
            const userFolders = await RNFS.readDir(usersPath);
            const usersWithPhotos = await Promise.all(
                userFolders.map(async (folder) => {
                    const userId = folder.name;
                    const profilePhoto = await getProfilePhoto(userId);
                    const data = await getUserData(userId);
                    return { userId, profilePhoto, userName: (data?.userName || "") };
                })
            );

            return usersWithPhotos;
        } catch (error) {
            console.log('Error al listar usuarios con fotos de perfil:', error);
            return [];
        }
    };
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
    
      const getUserData = async (userId: string): Promise<{ userId: string; userName: string; } | null> => {
          try {
              const existingData = await AsyncStorage.getItem('users');
              const users = existingData ? JSON.parse(existingData) : {};
    
              return users[userId] || null;
          } catch (error) {
              console.log('Error al obtener los datos del usuario de AsyncStorage:', error);
              return null;
          }
      };
    
    
      
    const getUsers = async (): Promise<{ userId: string; userName: string; }[]> => {
        try {
            const existingData = await AsyncStorage.getItem('users');
            if (!existingData) {
                console.log('No se encontraron usuarios en AsyncStorage');
                return [];
            }
    
            const users = JSON.parse(existingData);
            let arr = Object.keys(users).map((userId) => ({
                ...users[userId],
            }));

            console.log({arr});
            return arr;
            
        } catch (error) {
            console.log('Error al obtener todos los usuarios de AsyncStorage:', error);
            return [];
        }
    };
    

    return {
        createUserFolders,
        savePhoto,
        saveProfilePhoto,
        getProfilePhoto,
        getPhotos,
        listUsersWithProfilePhotos,
        getUserData,
        saveUserData,
        getUsers
    };
};
