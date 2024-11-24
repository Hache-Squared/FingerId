import React, { FC } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { useAppTheme } from '../hooks';


interface LoadingComponentProps{
    progress?: string;
}
export const LoadingComponent: FC<LoadingComponentProps> = ({progress}) => {
  const { statusBarColor} = useAppTheme();
  return (
    <View className='w-full flex-row flex-nowrap items-center justify-center '>
        <ActivityIndicator color={statusBarColor}/>
        {
            progress && (
                <Text style={{color: statusBarColor}} className='font-semibold text-lg text-textboxs text-left ml-4'>
                  {progress}%
                </Text>
            )
        }
        
    </View>
  )
}
