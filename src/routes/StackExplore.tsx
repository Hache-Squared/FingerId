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
import { AssignmentFormScreen } from '../explore/screens/AssignmentFormScreen';
import { UserAssetListScreen } from '../explore/screens/UserAssetListScreen';
import AssetDetailScreen from '../explore/screens/AssetDetailScreen';
import GenerateQrScreen from '../explore/screens/GenerateQrScreen';
import ScanAssetScreen from '../explore/screens/ScanAssetScreen';
import { MyAssignedAssetsScreen } from '../explore/screens/MyAssignedAssetsScreen';
import { AdminMaintenanceScreen } from '../explore/screens/AdminMaintenanceScreen';
import { MaintenanceDetailScreen } from '../explore/screens/MaintenanceDetailScreen';
import { ReportsScreen } from '../explore/screens/Reports/ReportsScreen';

export type StackExploreParams = {
  Admin: undefined,
  AssetForm: undefined,
  AssignmentFormScreen: undefined,
  UserAssetListScreen: undefined,
  AssetListScreen: undefined,
  MyAssignedAssetsScreen: undefined,
  AdminMaintenanceScreen: undefined,
  ReportsScreen: undefined,
  MaintenanceDetailScreen: {
    maintenanceId: string // Requerido para cargar la solicitud
  },
  AssetDetailScreen: {
    assetId: string 
  },
  GenerateQrScreen: {
    assetId: string,
    asset_name : string
  },
  ExploreContent: undefined,
  ScanAssetScreen: undefined,
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
             <Stack.Screen name="AssignmentFormScreen" component={AssignmentFormScreen} />
             <Stack.Screen name="UserAssetListScreen" component={UserAssetListScreen} />
             <Stack.Screen name="AssetDetailScreen" component={AssetDetailScreen} />
             <Stack.Screen name="GenerateQrScreen" component={GenerateQrScreen} />
             <Stack.Screen name="ScanAssetScreen" component={ScanAssetScreen} />
             <Stack.Screen name="MyAssignedAssetsScreen" component={MyAssignedAssetsScreen} />
             <Stack.Screen name="AdminMaintenanceScreen" component={AdminMaintenanceScreen} />
             <Stack.Screen name="MaintenanceDetailScreen" component={MaintenanceDetailScreen} />
             <Stack.Screen name="ReportsScreen" component={ReportsScreen} />
          </>    
        )
      }
    </Stack.Navigator>
  );
}