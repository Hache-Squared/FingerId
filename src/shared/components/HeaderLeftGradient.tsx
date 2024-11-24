import React from 'react'
import { Image } from 'react-native';
const vectorFime = require('../../assets/logos/vector_fime.png');
export const HeaderLeftGradient = () => {
  return (
    <>
    <Image
        source={vectorFime} 
        className='object-contain'
        style={{height: 200}} />
    </>
  )
}
