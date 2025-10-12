import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  FlatList, 
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getAuth } from 'firebase/auth';

// Componentes y Hooks necesarios
import { useAssets } from '../../shared/hooks/useAssets';
import { useMaintenance, Maintenance } from '../../shared/hooks/useMaintenance';
import { Asset } from '../../types/Asset.types';
import { StackExploreParams } from '../../routes/StackExplore';

// Obtener el usuario actual (UID)
const auth = getAuth();

/**
 * Pantalla que lista los activos que están asignados al usuario actual 
 * y permite solicitar mantenimiento.
 */
const MyAssignedAssetsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  // Asumimos que useAssets devuelve solo los asignados si isAdmin: false
  const { loadAssets, assets, loading: loadingAssets, error: errorAssets } = useAssets(); 
  const { fetchActiveMaintenanceByAssetId, createMaintenanceRequest, loading: loadingMaintenance } = useMaintenance();
  
  // NOTA IMPORTANTE: Usamos un ID de prueba para compilación si no hay usuario autenticado
  const currentUserId = auth.currentUser?.uid || 'USER_ID_DE_PRUEBA'; 

  // Estado para guardar el estado de mantenimiento activo de cada asset (mapeo)
  const [assetMaintenanceMap, setAssetMaintenanceMap] = useState<Record<string, Maintenance | null>>({});
  const [loadingMaintenanceMap, setLoadingMaintenanceMap] = useState(false);
  
  // Estado para el modal de solicitud
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAssetForRequest, setSelectedAssetForRequest] = useState<Asset | null>(null);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Cargar Assets Asignados al iniciar
  useEffect(() => {
    // isAdmin: false, userId: currentUserId, searchTerm: ''
    // Esto carga solo los assets donde current_user_uid es igual a currentUserId
    loadAssets(currentUserId, false, ''); 
  }, [loadAssets, currentUserId]); 
  
  // 2. Cargar Estado de Mantenimiento para cada Asset
  useEffect(() => {
    if (assets.length > 0 && !loadingAssets) {
      const fetchMaintenanceStatus = async () => {
        setLoadingMaintenanceMap(true);
        const newMap: Record<string, Maintenance | null> = {};
        
        // Ejecutar todas las promesas en paralelo para mayor velocidad
        const maintenancePromises = assets.map(asset => 
          fetchActiveMaintenanceByAssetId(asset.assetId)
        );
        
        const results = await Promise.all(maintenancePromises);
        
        assets.forEach((asset, index) => {
          newMap[asset.assetId] = results[index];
        });
        
        setAssetMaintenanceMap(newMap);
        setLoadingMaintenanceMap(false);
      };
      
      fetchMaintenanceStatus();
    }
  }, [assets, loadingAssets, fetchActiveMaintenanceByAssetId]);

  // Manejador del botón de solicitud/estado
  const handleRequestPress = useCallback((asset: Asset, maintenanceStatus: Maintenance | null) => {
    const isActiveMaintenance = maintenanceStatus && (maintenanceStatus.status === 'PENDING' || maintenanceStatus.status === 'IN_PROGRESS');
    
    if (isActiveMaintenance) {
      // Si tiene mantenimiento activo, muestra los detalles del activo
      Alert.alert(
        "Mantenimiento Activo",
        `Este equipo ya tiene una solicitud (${maintenanceStatus.maintenanceId}) con estatus: ${maintenanceStatus.status}.`,
        [{ text: "OK" }]
      );
    } else {
      // No tiene mantenimiento activo (puede estar finalizado o no tener ninguno)
      // Abrir el modal para nueva solicitud.
      setSelectedAssetForRequest(asset);
      setModalVisible(true);
      setRequestTitle('');
      setRequestDetails('');
    }
  }, []);
  
  // Envío del mantenimiento
  const handleSubmitRequest = useCallback(async () => {
    if (!selectedAssetForRequest || !requestTitle.trim() || !requestDetails.trim()) {
      Alert.alert("Error", "Por favor, complete el título y los detalles del problema.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createMaintenanceRequest(
        selectedAssetForRequest.assetId,
        requestTitle,
        requestDetails
      );
      
      Alert.alert("Éxito", "Solicitud de mantenimiento enviada. El equipo de administración será notificado.");
      
      // Limpiar y cerrar modal
      setModalVisible(false);
      setSelectedAssetForRequest(null);
      // Recargar el mapa para actualizar el estado del asset recién solicitado
      // Llama a loadAssets para forzar el re-fetch de los activos y el useEffect de mantenimiento
      loadAssets(currentUserId, false, ''); 
      
    } catch (error) {
      console.error("Error al crear la solicitud:", error);
      Alert.alert("Error", "No se pudo enviar la solicitud de mantenimiento. Intente de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAssetForRequest, requestTitle, requestDetails, createMaintenanceRequest, loadAssets, currentUserId]);


  // --- Renderizado de Elemento de Lista (AssetCard) ---
  const renderAssetItem = ({ item: asset }: { item: Asset }) => {
    const maintenanceStatus = assetMaintenanceMap[asset.assetId];
    
    // El activo tiene un mantenimiento activo (PENDING/IN_PROGRESS)
    const isActiveMaintenance = maintenanceStatus && (maintenanceStatus.status === 'PENDING' || maintenanceStatus.status === 'IN_PROGRESS');
    
    // Icono y color del botón
    let iconName: string;
    let buttonColor: string;
    
    if (isActiveMaintenance) {
      iconName = "hammer-outline"; // Ícono de reparación en curso
      buttonColor = "#f59e0b"; // Naranja (Trabajando)
    } else {
      iconName = "build-outline"; // Ícono de perica (nueva solicitud)
      buttonColor = "#10b981"; // Verde (Solicitar)
    }
    
    return (
      <TouchableOpacity 
      onPress={() => navigation.navigate("AssetDetailScreen", {
        assetId: asset.assetId
      })}
      style={styles.card}>
        <View style={styles.infoContainer}>
          <Text style={styles.assetName}>{asset.asset_name}</Text>
          <Text style={styles.assetDetail}>ID: {asset.assetId}</Text>
          <Text style={styles.assetDetail}>Serie: {asset.serial_number}</Text>
          {isActiveMaintenance && (
            <View style={styles.statusBadge}>
                <Text style={styles.statusTextBadge}>STATUS: {maintenanceStatus?.status}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: buttonColor }]}
          onPress={() => handleRequestPress(asset, maintenanceStatus)}
        >
          <Icon name={iconName} size={24} color="#fff" />
          <Text style={styles.buttonText}>{isActiveMaintenance ? 'Ver Estado' : 'Solicitar Mantenimiento'}</Text>
        </TouchableOpacity>
        
        {/* El botón cambia a "Generar nuevo mantenimiento" si el último está finalizado */}
        {maintenanceStatus && !isActiveMaintenance && (
            <Text style={styles.finishedStatusText}>
                Último Mant.: {maintenanceStatus.status}. Presione para generar nuevo.
            </Text>
        )}
      </TouchableOpacity>
    );
  };
  
  const isDataLoading = loadingAssets || loadingMaintenanceMap || loadingMaintenance;
  
  if (isDataLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando activos asignados y estatus de mantenimiento...</Text>
      </View>
    );
  }
  
  if (errorAssets) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="warning-outline" size={50} color="#ef4444" />
        <Text style={styles.errorText}>Error al cargar los activos: {JSON.stringify(errorAssets) || 'Error desconocido'}</Text>
        <TouchableOpacity onPress={() => loadAssets(currentUserId, false, '')} style={styles.retryButton}>
            <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (assets.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Icon name="server-outline" size={50} color="#9ca3af" />
        <Text style={styles.emptyText}>No tienes activos asignados actualmente.</Text>
      </View>
    );
  }

  // --- Renderizado principal ---
  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Equipos Asignados ({assets.length})</Text>
      </View>
      
      <FlatList
        data={assets}
        renderItem={renderAssetItem}
        keyExtractor={(item) => item.assetId}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={{ height: 30 }} />} // Espacio al final
      />
      
      {/* MODAL DE SOLICITUD DE MANTENIMIENTO */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Solicitar Mantenimiento</Text>
            <Text style={styles.modalSubTitle}>Activo: {selectedAssetForRequest?.asset_name}</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Título del Problema (Ej: Pantalla rota)"
              value={requestTitle}
              onChangeText={setRequestTitle}
              editable={!isSubmitting}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalles del Problema (Ej: No enciende y huele a quemado.)"
              value={requestDetails}
              onChangeText={setRequestDetails}
              multiline={true}
              numberOfLines={4}
              editable={!isSubmitting}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={isSubmitting}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitRequest}
                disabled={isSubmitting || !requestTitle.trim() || !requestDetails.trim()} // Deshabilita si faltan campos
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Enviar Solicitud</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#4f46e5',
  },
  infoContainer: {
    marginBottom: 15,
  },
  assetName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  assetDetail: {
    fontSize: 14,
    color: '#6b7280',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 16,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#4f46e5',
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: '#9ca3af',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4f46e5',
    padding: 10,
    borderRadius: 8,
  },
  statusBadge: {
    marginTop: 8,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusTextBadge: {
    color: '#f59e0b',
    fontWeight: '700',
    fontSize: 12,
  },
  finishedStatusText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  modalSubTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#9ca3af',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
  },
});

export { MyAssignedAssetsScreen };