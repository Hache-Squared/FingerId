import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, SafeAreaView, FlatList, TouchableOpacity, TextInput, 
  ActivityIndicator, RefreshControl, StyleSheet 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAssets, Asset } from '../../shared/hooks/useAssets';
import { useUserProfile } from '../../shared/hooks/useUserProfile'; // Necesitamos el perfil/UID del usuario

// --- Variables de Simulación ---
// NOTA: Cuando implementes roles, debes obtener esta variable de tu hook de autenticación/perfil.
const IS_ADMIN_SIMULATION = true; 

// Función auxiliar para obtener el color del estado
const getStatusBadge = (status: Asset['status']) => {
  switch (status) {
    case 'active':
      return { text: 'Activo', className: 'bg-green-100 text-green-700' };
    case 'in_maintenance':
      return { text: 'Mantenimiento', className: 'bg-yellow-100 text-yellow-700' };
    case 'decommissioned':
      return { text: 'Retirado', className: 'bg-red-100 text-red-700' };
    default:
      return { text: 'Desconocido', className: 'bg-gray-100 text-gray-500' };
  }
};

// Componente individual para mostrar un Asset
const AssetListItem: React.FC<{ item: Asset, navigation: any }> = ({ item, navigation }) => {
  const { text, className } = getStatusBadge(item.status);

  return (
    <View style={styles.listItem}>
      <View className="flex-1">
        <View className="flex-row items-center mb-1">
          <Icon name="cube-outline" size={20} color="#4f46e5" className="mr-2" />
          <Text className="text-lg font-bold text-gray-800 flex-1">{item.asset_name}</Text>
        </View>
        
        <Text className="text-sm text-gray-500 mb-1 ml-6">
          <Text className="font-semibold">S/N:</Text> {item.serial_number}
        </Text>
        <Text className="text-sm text-gray-500 ml-6">
          <Text className="font-semibold">Tipo:</Text> {item.asset_type}
        </Text>
        
        {item.is_assigned && (
          <View className="flex-row items-center mt-2 ml-6">
            <Icon name="person-outline" size={16} color="#000" />
            <Text className="text-xs font-medium text-gray-700 ml-1">
              Asignado (UID: {item.current_user_uid?.substring(0, 8)}...)
            </Text>
          </View>
        )}
      </View>
      
      <View className="items-end">
        <Text className={`text-xs font-semibold px-3 py-1 rounded-full ${className}`}>
          {text}
        </Text>
        <TouchableOpacity 
          className="mt-3 p-2 rounded-lg bg-indigo-500 active:bg-indigo-600"
          onPress={() => navigation.navigate('AssetDetailScreen', { assetId: item.id })}
        >
           {/* La navegación a 'AssetDetail' se implementará después */}
          <Icon name="eye-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Pantalla principal de la lista
const AssetListScreen: React.FC = () => {
  const navigation = useNavigation();
  // Obtenemos el UID del usuario
  const { userInfo } = useUserProfile(); 
  const currentUserId = userInfo?.uid || 'anonymous'; // Fallback a 'anonymous'
  
  const { assets, loadAssets, loading, error } = useAssets();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Función de carga unificada
  const handleLoadAssets = useCallback((term: string) => {
    // LLAMADA AL HOOK: Pasamos el UID, el rol y el término de búsqueda
    loadAssets(currentUserId, IS_ADMIN_SIMULATION, term);
  }, [loadAssets, currentUserId]); 
  
  // Carga inicial de datos (SOLO al montar el componente)
  useEffect(() => {
    handleLoadAssets(searchTerm);
  }, [handleLoadAssets, searchTerm]); 
  
  // Función para refrescar manualmente
  const onRefresh = useCallback(() => {
    handleLoadAssets(searchTerm);
  }, [handleLoadAssets, searchTerm]);

  // Manejar búsqueda
  const handleSearch = () => {
    handleLoadAssets(searchTerm);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Icon name="arrow-back-outline" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-gray-800 mr-10">
          Inventario ({IS_ADMIN_SIMULATION ? 'Admin' : 'Usuario'}) ({assets.length})
        </Text>
      </View>
      
      <View className="p-4">
        {/* Barra de Búsqueda */}
        <View className="flex-row items-center border border-gray-300 rounded-lg p-3 bg-white mb-4 shadow-sm">
          <TextInput
            className="flex-1 text-base text-gray-800 mr-2"
            placeholder="Buscar por Nombre o Serial..."
            placeholderTextColor="#9ca3af"
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch} // Ejecuta búsqueda al presionar Enter
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleSearch} disabled={loading} className="p-1">
            <Icon name="search" size={24} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        {/* Mensaje de Error */}
        {error && (
            <Text className="text-red-600 text-center mb-4 font-medium">
                Error al cargar: {error}
            </Text>
        )}
      </View>
      
      {/* Lista de Activos */}
      {loading && assets.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
          <Text className="mt-3 text-gray-600 text-lg">Cargando inventario...</Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item.id}
          // Pasamos navigation al Item para la acción de ver detalle
          renderItem={({ item }) => <AssetListItem item={item} navigation={navigation} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="mt-10 items-center">
              <Icon name="archive-outline" size={60} color="#9ca3af" />
              <Text className="mt-4 text-xl text-gray-500 font-semibold">
                No hay activos que coincidan con la búsqueda.
              </Text>
            </View>
          )}
          // Implementamos el Pull-to-Refresh
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#4f46e5" />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  }
});


export { AssetListScreen };
