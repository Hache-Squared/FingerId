import React from 'react'
import { useAppTheme } from '../hooks';
import { Image, Dimensions } from 'react-native';

const logoSlogan = require('../../assets/logos/slogan_fime.png');
const logoBlack = require('../../assets/logos/oso_fime_negro.png');
export const HeaderLogo = () => {
  const { themeSeleted } = useAppTheme()
  return (
    <Image source={
      logoSlogan
    } 
    className='object-contain overflow-hidden'
    style={{
      // width: Dimensions.get('screen').width * 0.8, 
      width: 100,
      height: 35
    }} />
  )
}
