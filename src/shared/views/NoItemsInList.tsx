import React from 'react'
import { Image , Text, View } from 'react-native'
import { useAppTheme } from '../../shared/hooks'
const imageNoData = require('../../assets/illustrations/no_data.png')

export const NoItemsInList = () => {
  const { screens, primaryColor } = useAppTheme()
  return (
        <View 
        style={{backgroundColor: screens.secondaryColor}}
        className='flex-1 items-center justify-center '>
            <Text 
            className='w-full text-2xl text-center font-bold'
            style={{color: primaryColor}}></Text>
            <Image source={imageNoData} className='w-full object-contain'/>
            <Text 
            className='w-full text-lg text-center font-semibold'
            style={{color: primaryColor}}>Sin Elementos A Mostrar</Text>
        </View>
    
  )
}
