import { createStackNavigator } from '@react-navigation/stack';
import { ExploreContentScreen  } from '../explore/screens';
import { useAppTheme } from '../shared/hooks';
import { HeaderLeftGradient, HeaderLogo } from '../shared/components';
import { BookListItem } from '../types';
import { RegisterUserScreen } from '../explore/screens/RegisterUserScreen';
import { LoginUserScreen } from '../explore/screens/LoginUserScreen';
import { RegistersByUserScreen } from '../explore/screens/RegistersByUserScreen';
import { useSecurity } from '../shared/hooks/useSecurity';

export type StackExploreParams = {
  ExploreContent: undefined,
   
  RegistersByUser: {
    id: string,
  },
  Register: undefined,
  LoginUserScreen: undefined
}


const Stack = createStackNavigator<StackExploreParams>();

export const StackExplore = () => {
  const { screens, secondaryColor } = useAppTheme()
  const { isLocked, startLockingState } = useSecurity();
  return (
    <Stack.Navigator
    screenOptions={{
      headerShown: false,    
   
    
    }}
    >
      {
        isLocked ? (
          <Stack.Screen name="LoginUserScreen" component={LoginUserScreen} />
        ) : (
          <>
          <Stack.Screen name="ExploreContent" options={{title: 'Explorar Contenido'}} component={ExploreContentScreen} />
          <Stack.Screen name="Register" component={RegisterUserScreen} />
          <Stack.Screen name="RegistersByUser" component={RegistersByUserScreen} />
          </>    
          
        )
      }
      
      
      
      

      
    </Stack.Navigator>
  );
}