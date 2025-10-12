import React, { useState, useMemo } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, 
  TouchableOpacityProps, FlatList, Dimensions, Modal, StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StackExploreParams } from '../../routes/StackExplore'; 
import { useAuth } from '../../shared/hooks/useAuth'; 
// Importamos el hook que ya no usa listener
import { useUserProfile } from '../../shared/hooks/useUserProfile'; 
// Importamos el tipo correcto de RTDB
import { UserProfileData } from '../../shared/hooks/useUsers'; 

const { width } = Dimensions.get('window');
// Ajuste de ancho para 2 columnas con margen
const ITEM_WIDTH = (width - 25 - 25) / 2; 

// --- TIPOS ---

type AdminScreenNavigationProp = NavigationProp<StackExploreParams, 'Admin'>;


interface ActionItem {
  id: string;
  iconName: string;
  label: string;
  action: (navigation: AdminScreenNavigationProp) => void; 
  role: 'admin' | 'user'; 
}

interface ActionButtonProps extends TouchableOpacityProps {
  item: ActionItem;
  navigation: AdminScreenNavigationProp; 
}

interface UserModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  // Usamos el tipo directo de la data de RTDB
  userInfo: UserProfileData | null; 
}

// --- DATOS DE ACCIONES ---

const ADMIN_ACTIONS: ActionItem[] = [
  { 
    id: '1', 
    iconName: 'document-text-outline', 
    label: 'Creación De Inventario (Assets)', 
    action: (navigation) => navigation.navigate("AssetForm"), 
    role: 'admin' 
  },
  { 
    id: '100', 
    iconName: 'document-text-outline', 
    label: 'Listado De Inventario (Assets)', 
    action: (navigation) => navigation.navigate("AssetListScreen"), 
    role: 'admin' 
  },
  { 
    id: '2', 
    iconName: 'person-add-outline', 
    label: 'Registrar Usuario', 
    action: (navigation) => navigation.navigate("Register", { typeOfForm: "register" }), 
    role: 'admin' 
  },
  { 
    id: '3', 
    iconName: 'scan-circle-outline', 
    label: 'Escanear Equipo', 
    action: (navigation) => navigation.navigate("ScanAssetScreen"), 
    role: 'admin' 
  },
  { 
    id: '4', 
    iconName: 'list-outline', 
    label: 'Ver Asignaciones', 
    action: (navigation) => navigation.navigate("UserAssetListScreen"), 
    role: 'admin' 
  },
  { 
    id: '40', 
    iconName: 'list-outline', 
    label: 'Crear Asignación', 
    action: (navigation) => navigation.navigate("AssignmentFormScreen"), 
    role: 'admin' 
  },
  { 
    id: '5', 
    iconName: 'checkbox-outline', 
    label: 'Mantenimiento (Admin)', 
    action: (navigation) => console.log('Navegar a Gestión Mantenimiento (Pendiente)'), 
    role: 'admin' 
  },
  { id: '7', iconName: 'cube-outline', label: 'Mis Equipos Asignados', action: (navigation) => navigation.navigate("MyAssignedAssetsScreen"), role: 'admin' },
];

const USER_ACTIONS: ActionItem[] = [
    { id: '7', iconName: 'cube-outline', label: 'Mis Equipos Asignados', action: (navigation) => navigation.navigate("MyAssignedAssetsScreen"), role: 'user' },
];


// --- COMPONENTES ---

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

const ActionButton: React.FC<ActionButtonProps> = ({ item, navigation }) => (
  <TouchableOpacity
    onPress={() => item.action(navigation)} 
    className="bg-white rounded-xl shadow-md p-4 items-center justify-center border border-gray-100 active:bg-gray-50 m-2" // Ajuste de margen
    style={{
      width: ITEM_WIDTH,
      height: 144,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    }}
  >
    <Icon name={item.iconName} size={45} color="#1f2937" />
    <Text className="text-base font-medium text-gray-800 mt-3 text-center">
      {item.label}
    </Text>
  </TouchableOpacity>
);

const UserModal: React.FC<UserModalProps> = ({ visible, onClose, onLogout, userInfo }) => {
  const userRole = userInfo?.role === 'admin' ? 'Administrador' : 'Usuario en Piso';
  const displayEmail = userInfo?.email || 'N/A';
  // CORRECCIÓN: Usar firstName y lastName
  const displayName = `${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`.trim() || 'Usuario Desconocido';
  const displayUID = userInfo?.uid || 'ID no disponible';
  const displayEmployeeId = userInfo?.employeeId || 'N/A';
  const displayDepartment = userInfo?.department || 'N/A';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.centeredView} 
        activeOpacity={1}
        onPressOut={onClose}
      >
        <View 
          className="bg-white rounded-t-3xl p-6 shadow-lg w-full absolute bottom-0"
          onTouchStart={(e) => e.stopPropagation()} 
        >
          <View className="w-16 h-1 bg-gray-300 rounded-full self-center mb-5" />

          <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Información del Perfil
          </Text>

          <View className="mb-6 space-y-2">
            <Text className="text-lg font-semibold text-gray-800">
              <Text className="font-bold">Rol:</Text> {userRole}
            </Text>
            <Text className="text-lg font-semibold text-gray-800">
              <Text className="font-bold">Nombre:</Text> {displayName}
            </Text>
            <Text className="text-lg font-semibold text-gray-800">
              <Text className="font-bold">Departamento:</Text> {displayDepartment}
            </Text>
            <Text className="text-lg font-semibold text-gray-800">
              <Text className="font-bold">ID Empleado:</Text> {displayEmployeeId}
            </Text>
            <Text className="text-lg font-semibold text-gray-800">
              <Text className="font-bold">Email:</Text> {displayEmail}
            </Text>
            <Text className="text-sm text-gray-500 pt-1">
              <Text className="font-bold">UID:</Text> {displayUID}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-red-600 py-4 rounded-xl flex-row justify-center items-center"
            onPress={onLogout}
          >
            <Text className="text-white text-lg font-semibold mr-2">
              Cerrar sesión
            </Text>
            <Icon name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// --- PANTALLA PRINCIPAL ---

const AdminScreen: React.FC = () => {
  const navigation = useNavigation<AdminScreenNavigationProp>(); 
  const [modalVisible, setModalVisible] = useState(false);
  const { signOut } = useAuth();
  // useUserProfile ahora usa el GET único de RTDB
  const { userInfo, isLoadingProfile } = useUserProfile();

  const handleLogout = () => {
    console.log('Cerrar sesión iniciado.');
    setModalVisible(false);
    signOut(); 
  };

  const availableActions = useMemo(() => {
      const allActions = [...ADMIN_ACTIONS, ...USER_ACTIONS];
      const role = userInfo?.role;
      
      if (role === 'admin') {
          return allActions.filter(action => action.role === 'admin');
      } else if (role === 'user') {
          // Si es usuario, solo mostramos las acciones de usuario más Escanear Equipo
          return allActions.filter(action => action.role === 'user' || action.id === '3');
      }
      return []; 
  }, [userInfo?.role]);

  // Manejo de estados de carga
  if (isLoadingProfile || !userInfo) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-xl font-medium text-gray-600">
          Cargando perfil de AssetTrack...
        </Text>
        {/* Aquí iría un componente de carga (spinner) */}
      </SafeAreaView>
    );
  }

  // CORRECCIÓN: Usar firstName
  const greetingName = userInfo.firstName || 'Usuario';
  const userRoleDisplay = userInfo.role === 'admin' ? 'Administrador' : 'Usuario en Piso';

  return (
    <SafeAreaView className="flex-1 bg-white pt-10"> 
      <FlatList
        data={availableActions}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <ActionButton item={item} navigation={navigation} />} 
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        
        ListHeaderComponent={
          <>
            <View className="flex-row justify-between items-center mb-6 px-5">
              <View>
                <Text className="text-3xl font-bold text-gray-900">
                  Hola, {greetingName} 👋
                </Text>
                <Text className="text-lg text-gray-500 mt-1">
                  {userRoleDisplay} | {userInfo.department}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image
                  source={{ uri: 'https://i.imgur.com/GzG4BfR.png' }} // Placeholder de Avatar
                  className="w-12 h-12 rounded-full border-2 border-indigo-500/50 shadow-md"
                />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center border border-gray-300 rounded-lg p-3 mb-8 bg-gray-50 mx-5">
              <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder="Buscar equipo por HP / Serial"
                placeholderTextColor="#9ca3af"
              />
              <Icon name="search" size={24} color="#6b7280" />
            </View>
            
            <Text className="text-xl font-semibold text-gray-800 mb-5 px-5">
              Acciones Principales
            </Text>
          </>
        }
      />
      
      {/* Modal de Usuario */}
      <UserModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onLogout={handleLogout}
        userInfo={userInfo}
      />
    </SafeAreaView>
  );
};

export { AdminScreen };
