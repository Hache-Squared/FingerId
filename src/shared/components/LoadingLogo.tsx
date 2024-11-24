import React from 'react'
import { useAppTheme } from '../hooks';
import { Image, View } from 'react-native';
import * as Animatable from 'react-native-animatable';

const logoWhite = require('../../assets/logos/oso_fime_blanco.png');
const logoBlack = require('../../assets/logos/oso_fime_negro.png');
const logoSlogan = require('../../assets/logos/slogan_fime.png');

const bounce = {
    0: {
      translateY: 0,
    },
    0.5: {
      translateY: 10,
    },
    1: {
      translateY: 0,
    },
  };

export const LoadingLogo = () => {
  const { themeSeleted } = useAppTheme()
  return (
    <View className={' items-center justify-center'}>

        <Animatable.Image 
        animation={bounce} 
        iterationCount="infinite"
        duration={1000}

        source={
            themeSeleted === 'light'
            ? logoBlack : logoWhite
        } 
        className='object-contain overflow-hidden my-2 '
        style={{width: 100, height: 100}} />
        
        <Image 
        source={logoSlogan} 
        className='object-cover my-2 w-full '
        style={{width: 120, height: 40}} />

    </View>
  )
}
