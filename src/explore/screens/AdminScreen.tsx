import React, { useState, useMemo } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, 
  TouchableOpacityProps, FlatList, Dimensions, Modal, StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StackExploreParams } from '../../routes/StackExplore'; // Importación de tipos de navegación
import { useAuth } from '../../shared/hooks/useAuth'; 
import { useUserProfile } from '../../shared/hooks/useUserProfile'; 

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 5 * 2 * 2 - 4) / 2; 

// --- TIPOS ---

// Utilizamos el tipo de navegación para asegurar que las rutas existen
type AdminScreenNavigationProp = NavigationProp<StackExploreParams, 'Admin'>;


interface ActionItem {
  id: string;
  iconName: string;
  label: string;
  action: (navigation: AdminScreenNavigationProp) => void; // La acción recibe navigation
  role: 'admin' | 'user'; 
}

interface ActionButtonProps extends TouchableOpacityProps {
  item: ActionItem;
  navigation: AdminScreenNavigationProp; // Pasamos navigation al botón
}

interface UserModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  userInfo: Awaited<ReturnType<typeof useUserProfile>>['userInfo']; 
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
    // Usamos 'Register' que definiste en tu StackExploreParams
    action: (navigation) => navigation.navigate("Register", { typeOfForm: "register" }), 
    role: 'admin' 
  },
  { 
    id: '3', 
    iconName: 'scan-circle-outline', 
    label: 'Escanear Equipo', 
    action: (navigation) => console.log('Navegar a Escáner (Pendiente)'), 
    role: 'admin' 
  },
  { 
    id: '4', 
    iconName: 'list-outline', 
    label: 'Ver Asignaciones', 
    action: (navigation) => console.log('Navegar a Asignaciones (Pendiente)'), 
    role: 'admin' 
  },
  { 
    id: '5', 
    iconName: 'checkbox-outline', 
    label: 'Mantenimiento (Admin)', 
    action: (navigation) => console.log('Navegar a Gestión Mantenimiento (Pendiente)'), 
    role: 'admin' 
  },
];

const USER_ACTIONS: ActionItem[] = [
    { id: '7', iconName: 'cube-outline', label: 'Mis Equipos Asignados', action: (navigation) => console.log('Navegar a Mis Equipos (Pendiente)'), role: 'user' },
    { id: '9', iconName: 'build-outline', label: 'Reportar Mantenimiento', action: (navigation) => console.log('Navegar a Reporte Mantenimiento (Pendiente)'), role: 'user' },
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
    onPress={() => item.action(navigation)} // Ejecutamos la acción con el objeto navigation
    className="bg-white rounded-xl shadow-md p-4 items-center justify-center border border-gray-100 active:bg-gray-50 m-1"
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
  const displayName = `${userInfo?.first_name || ''} ${userInfo?.last_name || ''}`.trim() || 'Usuario Desconocido';
  const displayUID = userInfo?.uid || 'ID no disponible';

  return (
    <Modal
      animationType="slide"
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

          <View className="mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              <Text className="font-bold">Rol:</Text> {userRole}
            </Text>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              <Text className="font-bold">Nombre:</Text> {displayName}
            </Text>
            <Text className="text-lg font-semibold text-gray-800 mb-2">
              <Text className="font-bold">Email:</Text> {displayEmail}
            </Text>
             <Text className="text-sm text-gray-500 mt-2">
              <Text className="font-bold">UID:</Text> {displayUID}
            </Text>
          </View>

          <TouchableOpacity
            className="bg-black py-4 rounded-xl flex-row justify-center items-center"
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
  const navigation = useNavigation<AdminScreenNavigationProp>(); // Inicializamos la navegación tipada
  const [modalVisible, setModalVisible] = useState(false);
  const { signOut } = useAuth();
  const { userInfo, isLoadingProfile } = useUserProfile();

  const handleLogout = () => {
    console.log('Cerrar sesión iniciado.');
    setModalVisible(false);
    signOut(); 
  };

  const availableActions = useMemo(() => {
      const allActions = [...ADMIN_ACTIONS, ...USER_ACTIONS];
      const role = userInfo?.role;

      return allActions;
      if (role === 'admin') {
          return allActions.filter(action => action.role === 'admin');
      } else if (role === 'user') {
          return allActions.filter(action => action.role === 'user');
      }
      return []; 
  }, [userInfo?.role]);

  if (!userInfo) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <Text className="text-xl font-medium text-gray-600">
          Cargando perfil de AssetTrack...
        </Text>
      </SafeAreaView>
    );
  }

  const greetingName = userInfo.first_name || 'Usuario';
  const userRoleDisplay = userInfo.role === 'admin' ? 'Administrador' : 'Usuario en Piso';

  return (
    <SafeAreaView className="flex-1 bg-white pt-10"> 
      <FlatList
        data={availableActions}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <ActionButton item={item} navigation={navigation} />} // Pasamos el objeto navigation
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        
        ListHeaderComponent={
          <>
            <View className="flex-row justify-between items-center mb-6 px-5">
              <View>
                <Text className="text-3xl font-bold text-gray-900">
                  Hola, {greetingName} 👋
                </Text>
                <Text className="text-lg text-gray-500 mt-1">
                  {userRoleDisplay}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Image
                  source={{ uri: 'https://i.imgur.com/GzG4BfR.png' }} 
                  className="w-12 h-12 rounded-full border-2 border-gray-200"
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
