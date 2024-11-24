import React, { useEffect, useState } from 'react'
import { darkColorsTheme, lightColorsTheme } from '../utils';
import { onChangeTheme, useAppDispatch, useAppSelector } from '../../store';
import { ThemeSelected } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';


const nameThemeAsyncStorage: string = 'themeColor';

export const useAppTheme = () => {
  
  const { colors, theme: themeSeleted} = useAppSelector(state => state.appTheme)
  const dispatch = useAppDispatch();


  
  const changeTheme = async(themeSelected: ThemeSelected) => {
    try{
      
      if(themeSelected === 'light'){
          dispatch( onChangeTheme({ 
            colors: {
              ...lightColorsTheme
            },
            theme: 'light'
          }));
      }
      if(themeSelected === 'dark'){
        
          dispatch( onChangeTheme({ 
            colors: {
              ...darkColorsTheme
            },
            theme: 'dark'
          }));
      }
      await AsyncStorage.setItem(nameThemeAsyncStorage, themeSelected);

    }catch(err){
      console.log("Error saving theme color: ", err);
      
    }
  }

  const loadThemeSaved = async() => {
    
      try {
        const value = await AsyncStorage.getItem(nameThemeAsyncStorage);
        if (value !== null && value !== themeSeleted) {
          changeTheme(value as ThemeSelected);
          // console.log("Cambiando Theme");
          
        }
      } catch (e) {
        console.log("Error obteniendo el theme");
        changeTheme('dark');
      }
    
  }

  useEffect(() => {
    loadThemeSaved()
  },[])

  return {
    //properties
    ...colors,
    themeSeleted,
    

    //actions
    changeTheme
  }
}

