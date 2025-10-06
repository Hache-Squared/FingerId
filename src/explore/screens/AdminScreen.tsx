import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, Image, 
  TouchableOpacityProps, FlatList, Dimensions, Modal, StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { useAuth } from '../../shared/hooks/useAuth';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { StackExploreParams } from '../../routes/StackExplore';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 5 * 2 * 2 - 4) / 2; 

// --- TIPOS ---

interface ActionItem {
  id: string;
  iconName: string;
  label: string;
  action: () => void;
}

interface ActionButtonProps extends TouchableOpacityProps {
  item: ActionItem;
}

interface UserModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

// --- DATOS ---


const userData = {
  username: 'john123',
  name: 'John Doe',
  email: 'john@email.com',
};

// --- COMPONENTES ---

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

const ActionButton: React.FC<ActionButtonProps> = ({ item }) => (
  <TouchableOpacity
    onPress={item.action}
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

const UserModal: React.FC<UserModalProps> = ({ visible, onClose, onLogout }) => (
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

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            <Text className="font-bold">Usuario:</Text> {userData.username}
          </Text>
          <Text className="text-lg font-semibold text-gray-800 mb-2">
            <Text className="font-bold">Nombre:</Text> {userData.name}
          </Text>
          <Text className="text-lg font-semibold text-gray-800">
            <Text className="font-bold">Email:</Text> {userData.email}
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

// --- PANTALLA PRINCIPAL ---

const AdminScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const [modalVisible, setModalVisible] = useState(false);
  const { signOut } = useAuth();
  const DATA: ActionItem[] = [
    { 
        id: '1', 
        iconName: 'person-add-outline', 
        label: 'Crear Usuario', 
        action: () => navigation.navigate("Register", {
            typeOfForm: "register",
            userInfo: null
        }) 
    },
    { id: '2', iconName: 'scan-circle-outline', label: 'Escanear Equipo', action: () => console.log('Escanear Equipo') },
    { id: '3', iconName: 'list-outline', label: 'Inventario', action: () => console.log('Inventario') },
    { id: '4', iconName: 'checkbox-outline', label: 'Asignación', action: () => console.log('Asignación') },
    { id: '5', iconName: 'cloud-upload-outline', label: 'Subir Datos', action: () => console.log('Subir Datos') },
    { id: '6', iconName: 'stats-chart-outline', label: 'Ver Reportes', action: () => console.log('Ver Reportes') },
    { id: '7', iconName: 'settings-outline', label: 'Configuración', action: () => console.log('Configuración') },
    { id: '8', iconName: 'mail-outline', label: 'Notificaciones', action: () => console.log('Notificaciones') },
    ];


  const handleLogout = () => {
    console.log('Cerrar sesión');
    setModalVisible(false);
    signOut()
  };

  return (
    <SafeAreaView className="flex-1 bg-white pt-10"> 
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={({ item }) => <ActionButton item={item} />}
        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 20 }}
        
        ListHeaderComponent={
          <>
            <View className="flex-row justify-between items-center mb-6 px-5">
              <View>
                <Text className="text-3xl font-bold text-gray-900">
                  Hola, John 👋
                </Text>
                <Text className="text-lg text-gray-500 mt-1">
                  Administrador
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
                placeholder="HP"
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
      />
    </SafeAreaView>
  );
};

export { AdminScreen };