import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { StackExploreParams } from '../../routes/StackExplore';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAssignments } from '../../shared/hooks/useAssignments';
import { useAssets } from '../../shared/hooks/useAssets';
import { Asset } from '../../types/Asset.types';
import { UserProfileData } from '../../shared/hooks/useUsers';
import { useAuth } from '../../shared/hooks/useAuth';
// import { useAppTheme } from '../../shared/hooks'; // Asumo este hook existe (comentado si no lo tienes)


const AssignmentFormScreen: React.FC = ({ }) => {
  // const { primaryColor } = useAppTheme(); // Si no existe, usamos un color fijo
  const primaryColor = '#4F46E5'; 
  
  // Hooks para datos
  const { 
    fetchAllUsers, allUsers, loading, 
    fetchAllAssignments, assignedAssetIds, 
    createAssignment, error 
  } = useAssignments();
  // Solo necesitamos la lista completa de assets, la obtenemos y filtramos en el cliente
  const { assets, loadAssets, loading: loadingAssets } = useAssets();
  const { user } = useAuth(); // Necesario para obtener el UID si se necesita.
  
  // Estados locales para los selectores
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const isLoading = loading || loadingAssets; // Combinamos cargas

  // 1. Efecto para cargar usuarios, assets y asignaciones (todo con consulta única)
  useEffect(() => {
    // Usamos el UID y asumimos que el usuario es admin para ver todos los assets.
    // En una app real, la verificación del rol de admin se haría aquí.
    if (user?.uid) {
        fetchAllUsers();
        fetchAllAssignments();
        loadAssets(user.uid, true); // Admin ve todos los assets
    }
  }, [user?.uid, fetchAllUsers, fetchAllAssignments, loadAssets]);

  // 2. Filtrar Assets No Asignados
  const unassignedAssets = useMemo(() => {
    // El filtro ya es correcto: aquellos cuyo assetId NO está en el Set de asignados
    return assets.filter(asset => !assignedAssetIds.has(asset.assetId));
  }, [assets, assignedAssetIds]);


  // 3. Manejar Asignación
  const handleAssign = async () => {
    if (!selectedUser || !selectedAsset) {
      setMessage({ type: 'error', text: 'Debe seleccionar un usuario y un equipo.' });
      return;
    }
    setMessage(null);

    const assignedUserName = `${selectedUser.firstName} ${selectedUser.lastName}`;

    try {
        const success = await createAssignment(
            selectedAsset.assetId, 
            selectedUser.uid, 
            assignedUserName
        );

        setMessage({ type: 'success', text: `¡Asset ${selectedAsset.assetId} asignado a ${assignedUserName}!` });
        // Limpiar selección después de asignar
        setSelectedUser(null);
        setSelectedAsset(null);

    } catch (e: any) {
        setMessage({ type: 'error', text: e.message || 'Error desconocido al asignar.' });
    }
  };


  // --- COMPONENTES SELECTORES SIMULADOS ---
  const UserSelector = () => (
    <View className="mb-6 border border-gray-300 rounded-xl p-3">
      <Text className="text-lg font-bold text-gray-800 mb-2">Seleccionar Usuario ({allUsers.length})</Text>
      <ScrollView horizontal className="flex-row max-h-32">
        {allUsers.length === 0 ? (
            <Text className="text-gray-500 p-2">No hay usuarios disponibles.</Text>
        ) : (
            allUsers.map((user:any) => (
              <TouchableOpacity
                key={user.uid}
                onPress={() => setSelectedUser(user)}
                className={`p-3 m-1 rounded-lg border ${selectedUser?.uid === user.uid ? 'border-2 border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}
              >
                <Text className="font-semibold text-gray-800">{`${user.firstName} ${user.lastName}`}</Text>
                <Text className="text-xs text-gray-500">{user.role.toUpperCase()}</Text>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </View>
  );

  const AssetSelector = () => (
    <View className="mb-6 border border-gray-300 rounded-xl p-3">
      <Text className="text-lg font-bold text-gray-800 mb-2">Assets No Asignados ({unassignedAssets.length})</Text>
      <ScrollView horizontal className="flex-row max-h-32">
        {unassignedAssets.length === 0 ? (
            <Text className="text-gray-500 p-2">Todos los assets están asignados o no hay inventario.</Text>
        ) : (
            unassignedAssets.map(asset => (
              <TouchableOpacity
                key={asset.assetId}
                onPress={() => setSelectedAsset(asset)}
                className={`p-3 m-1 rounded-lg border ${selectedAsset?.assetId === asset.assetId ? 'border-2 border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}
              >
                <Text className="font-semibold text-gray-800">{asset.asset_name}</Text>
                <Text className="text-xs text-gray-500">SN: {asset.serial_number}</Text>
              </TouchableOpacity>
            ))
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text className="text-3xl font-bold text-gray-900 mb-6">Nueva Asignación</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={primaryColor} className="mt-10" />
        ) : (
          <>
            {/* Mensaje de estado */}
            {message && (
              <View className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
                <Text className={`font-semibold ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</Text>
              </View>
            )}

            <UserSelector />
            <AssetSelector />

            <View className="my-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <Text className="text-lg font-bold text-gray-900 mb-2">Resumen de Asignación</Text>
                <Text className="text-base text-gray-700">Usuario: <Text className="font-semibold">{selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : 'N/A'}</Text></Text>
                <Text className="text-base text-gray-700">Asset: <Text className="font-semibold">{selectedAsset ? `${selectedAsset.asset_name} (${selectedAsset.assetId})` : 'N/A'}</Text></Text>
            </View>

            <TouchableOpacity 
              onPress={handleAssign}
              disabled={!selectedUser || !selectedAsset}
              className={`py-4 rounded-xl flex-row justify-center items-center ${(!selectedUser || !selectedAsset) ? 'bg-gray-400' : 'bg-indigo-600'}`}
              style={{backgroundColor: (!selectedUser || !selectedAsset) ? '#9CA3AF' : primaryColor}}
            >
              <Icon name='link-outline' size={24} color="#fff" style={{marginRight: 8}}/>
              <Text className="text-white text-lg font-semibold">Confirmar Asignación</Text>
            </TouchableOpacity>

            {error && <Text className="text-red-500 mt-4 text-center">{error}</Text>}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollContent: {
    padding: 20,
  }
});

export { AssignmentFormScreen };
