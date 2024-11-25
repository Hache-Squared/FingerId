import React, { useEffect, useState } from 'react'
import { darkColorsTheme, lightColorsTheme } from '../utils';
import {  useAppDispatch, useAppSelector } from '../../store';
import { ThemeSelected } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';


const nameThemeAsyncStorage: string = 'themeColor';

export const useAppTheme = () => {
  
  const { colors, theme: themeSeleted} = useAppSelector(state => state.appTheme)
  const dispatch = useAppDispatch();




  useEffect(() => {
    
  },[])

  return {
    //properties
    ...colors,
    themeSeleted,
    

    
  }
}

