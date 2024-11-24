import React, { FC } from 'react'
import { Alert, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../shared/hooks';

interface NotebookItemProps {
    logoImg?: string,
    name: string,
    onPress: () => void
}

const NotebookItem: FC<NotebookItemProps> = ({ name, logoImg, onPress }) => {
  const { buttons } = useAppTheme()
  return (
    <TouchableOpacity 
    onPress={onPress}
    style={{ backgroundColor: buttons.backgroundColor }}
    className='w-11/12 py-3 rounded-lg flex self-center flex-row items-center gap-1 shadow-sm shadow-purple-50'>
        {logoImg ? <Text>logo</Text> : <Icon name="book" size={40} color={buttons.textColor} />} 
        
        <Text 
        style={{color: buttons.textColor}}
        className='font-semibold text-lg ml-2'>{name}</Text>
    </TouchableOpacity>
  )
}

export  {NotebookItem}
