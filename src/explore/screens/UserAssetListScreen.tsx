import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator, Alert,
  ScrollView
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { StackExploreParams } from '../../routes/StackExplore';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAssignments } from '../../shared/hooks/useAssignments';
import { useAssets } from '../../shared/hooks/useAssets';
import { Asset, AssignedAssetDetails, Assignment } from '../../types/Asset.types';
import { UserProfileData } from '../../shared/hooks/useUsers';
import { useAppTheme } from '../../shared/hooks'; // Asumo este hook existe

type Props = StackScreenProps<StackExploreParams, 'UserAssetListScreen'>;

const UserAssetListScreen: React.FC<Props> = ({ navigation }) => {
  const { primaryColor } = useAppTheme();
  
  // Hooks para datos
    
    const { 
    fetchAllUsers, allUsers, 
    fetchAllAssignments, assignments, 
    deleteAssignment, loading: loadingAssignments // Añadimos el loading del hook
    } = useAssignments();
    // Cambiamos el nombre de la propiedad 'assets' por 'filteredAssets'
    const { assets: filteredAssets, loading: loadingAssets, loadAssets } = useAssets();

  const isLoading = loadingAssignments || loadingAssets;
  const [selectedUserUid, setSelectedUserUid] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // 1. Efecto para cargar datos
  useEffect(() => {
    fetchAllUsers();
    fetchAllAssignments();
    // La carga de assets se maneja en el siguiente useEffect, ya que depende del rol.
  }, [fetchAllUsers, fetchAllAssignments]);

  useEffect(() => {
      // Simulamos que obtenemos el UID y el rol del usuario actual desde un hook de Auth
      const currentUserId = "ADMIN_UID"; // Placeholder para el usuario actual
      const isAdmin = true; // Solo un admin debería ver esta pantalla

      loadAssets(currentUserId, isAdmin);
  }, [loadAssets]);

  // 2. Mapeo para facilitar la búsqueda
  const userMap = useMemo(() => {
    return new Map(allUsers.map(user => [user.uid, user]));
  }, [allUsers]);

   const assetMap = useMemo(() => {
    // Usamos filteredAssets, que es el estado del hook useAssets
    return new Map(filteredAssets.map(asset => [asset.assetId, asset]));
  }, [filteredAssets]);


  // 3. Obtener Assets Asignados al usuario seleccionado
  const assignedAssetsDetails: AssignedAssetDetails[] = useMemo(() => {
    if (!selectedUserUid) return [];

    const userAssignments = assignments.filter(a => a.assignedToUid === selectedUserUid);
    const assignedUser = userMap.get(selectedUserUid);

    if (!assignedUser) return [];

    return userAssignments
      .map(assignment => {
        const asset = assetMap.get(assignment.assetId);
        if (asset) {
          return {
            ...assignment,
            asset,
            assignedUser,
          } as AssignedAssetDetails;
        }
        return null;
      })
      .filter((item): item is AssignedAssetDetails => item !== null);
  }, [selectedUserUid, assignments, userMap, assetMap]);


  // 4. Manejador de Desasignación
  const handleUnassign = (assetId: string, assetName: string, assignedUserName: string) => {
    Alert.alert(
      "Confirmar Desasignación",
      `¿Está seguro de desasignar el equipo "${assetName}" de ${assignedUserName}?`,
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        { 
          text: "Sí, Desasignar", 
          onPress: async () => {
            const success = await deleteAssignment(assetId, assignedUserName);
            if (success) {
              setMessage({ type: 'success', text: `¡Asset ${assetName} desasignado correctamente!` });
            } else {
              setMessage({ type: 'error', text: 'Error al desasignar el activo.' });
            }
          }
        }
      ]
    );
  };


  // --- COMPONENTES ---

  const UserSelector = () => (
    <View className="mb-6 border border-gray-300 rounded-xl p-3">
      <Text className="text-lg font-bold text-gray-800 mb-2">Seleccionar Usuario ({allUsers.length})</Text>
      <ScrollView horizontal className="flex-row max-h-20">
        {allUsers.map(user => (
          <TouchableOpacity
            key={user.uid}
            onPress={() => setSelectedUserUid(user.uid)}
            className={`p-3 m-1 rounded-lg border ${selectedUserUid === user.uid ? 'border-2 border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}
          >
            <Text className="font-semibold text-gray-800">{`${user.firstName} ${user.lastName}`}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderItem = ({ item }: { item: AssignedAssetDetails }) => (
    <View className="p-4 mb-3 bg-white rounded-xl shadow-md border border-gray-100 flex-row justify-between items-center">
      <View className='flex-1 pr-3'>
        <Text className="text-lg font-bold text-gray-900">{item.asset.asset_name}</Text>
        <Text className="text-sm text-gray-600">ID: {item.assetId}</Text>
        <Text className="text-sm text-gray-500">SN: {item.asset.serial_number}</Text>
        <Text className="text-xs text-gray-500 mt-1">Asignado: {new Date(item.assignedDate).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleUnassign(item.assetId, item.asset.asset_name, `${item.assignedUser.firstName} ${item.assignedUser.lastName}`)}
        className="bg-red-500 p-3 rounded-full shadow-lg"
      >
        <Icon name='trash-outline' size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );


  return (
    <SafeAreaView style={styles.container}>
      <View className="px-5 pt-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">Equipos Asignados</Text>
        
        {isLoading ? (
          <ActivityIndicator size="large" color={primaryColor} className="mt-10" />
        ) : (
          <UserSelector />
        )}

        {/* Mensaje de estado */}
        {message && (
          <View className={`p-4 rounded-lg mb-4 mx-5 ${message.type === 'success' ? 'bg-green-100 border border-green-400' : 'bg-red-100 border border-red-400'}`}>
            <Text className={`font-semibold ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</Text>
          </View>
        )}
      </View>
      
      <Text className="text-xl font-semibold text-gray-800 mb-3 px-5 mt-3">
        Assets Asignados ({assignedAssetsDetails.length})
      </Text>

      <FlatList
        data={assignedAssetsDetails}
        keyExtractor={(item) => item.assetId}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 50 }}
        ListEmptyComponent={
            <View className='mt-10 items-center'>
                <Icon name='search-outline' size={60} color="#ccc"/>
                <Text className='text-lg text-gray-500 mt-2'>
                    {selectedUserUid ? 'Este usuario no tiene assets asignados.' : 'Seleccione un usuario para ver sus assets.'}
                </Text>
            </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});

export { UserAssetListScreen };
