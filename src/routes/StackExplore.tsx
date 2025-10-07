import { createStackNavigator } from '@react-navigation/stack';
import { ExploreContentScreen  } from '../explore/screens';
import { RegisterUserScreen } from '../explore/screens/RegisterUserScreen';
import { LoginUserScreen } from '../explore/screens/LoginUserScreen';
import { RegistersByUserScreen } from '../explore/screens/RegistersByUserScreen';
import { useSecurity } from '../shared/hooks/useSecurity';
import { CreatorsScreen } from '../explore/screens/CreatorsScreen';
import { useAuth } from '../shared/hooks/useAuth';
import { AdminScreen } from '../explore/screens/AdminScreen';
import { AssetFormScreen } from '../explore/screens/AssetFormScreen';
import { AssetListScreen } from '../explore/screens/AssetListScreen';

export type StackExploreParams = {
  Admin: undefined,
  AssetForm: undefined,
  AssetListScreen: undefined,
  ExploreContent: undefined,
  RegistersByUser: {
    id: string,
  },
  Register: {
    typeOfForm: string,
    userInfo?: any | null
  },
  LoginUserScreen: undefined,
  CreatorsScreen: undefined
}
const Stack = createStackNavigator<StackExploreParams>();
export const StackExplore = () => {
  const { isLocked, startLockingState } = useSecurity();
  const { user } = useAuth();
  return (
    <Stack.Navigator
    screenOptions={{
      headerShown: false,    
    }}
    >
      {
        !user ? (
          <Stack.Screen name="LoginUserScreen" component={LoginUserScreen} />
        ) : (
          <>
            <Stack.Screen name="Admin" options={{title: 'Explorar Contenido'}} component={AdminScreen} />
            <Stack.Screen name="ExploreContent" options={{title: 'Explorar Contenido'}} component={ExploreContentScreen} />
            <Stack.Screen name="Register" component={RegisterUserScreen} />
            <Stack.Screen name="RegistersByUser" component={RegistersByUserScreen} />
            <Stack.Screen name="CreatorsScreen" component={CreatorsScreen} />
             <Stack.Screen name="AssetForm" component={AssetFormScreen} />
             <Stack.Screen name="AssetListScreen" component={AssetListScreen} />
          </>    
        )
      }
    </Stack.Navigator>
  );
}