import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, SafeAreaView, TouchableOpacity, StyleSheet, 
  ScrollView, ActivityIndicator, FlatList,
  Alert, Modal
} from 'react-native';
// Uso de las librerías correctas de React Native
import Icon from 'react-native-vector-icons/Ionicons'; 
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';

// NOTA: Estas importaciones deben coincidir con tu estructura de proyecto
import { useAssets } from '../../shared/hooks/useAssets';
import { useUsers } from '../../shared/hooks/useUsers'; 
import { StackExploreParams } from '../../routes/StackExplore';
// --- AÑADIDO: Importar el hook de mantenimiento y sus tipos ---
import { useMaintenance, Maintenance, MaintenanceStatus } from '../../shared/hooks/useMaintenance'; 

// Importación del componente de generación de QR
import { QrCodeGenerator } from '../../shared/components/QrCodeGenerator'; 
import { useUserProfile } from '../../shared/hooks/useUserProfile';

// --- DEFINICIONES DE TIPOS (EXISTENTES) ---
export interface AssetLogEntry {
  timestamp: number;
  action: 'CREATED' | 'ASSIGNED' | 'UNASSIGNED' | 'MAINTENANCE' | 'DECOMMISSIONED';
  performedByUid: string;
  details: string;
}

export interface Asset {
  assetId: string;
  asset_name: string;
  serial_number: string;
  description: string;
  status: 'active' | 'in_maintenance' | 'decommissioned';
  asset_type: string;
  
  make: string; 
  model: string; 
  approx_cost: number; 
  color: string; 
  important_data: string; 

  created_at: number;
  created_by_uid: string;
  is_assigned: boolean;
  current_user_uid: string | null;
  logs: AssetLogEntry[];
}


// --- COMPONENTE PRINCIPAL ---

// --- AÑADIDO: Tipo para los estados de las pestañas ---
type AssetDetailTab = 'logs' | 'assignment' | 'maintenance'; 

const AssetDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>()
  const { assetId } = useRoute<RouteProp<StackExploreParams, 'AssetDetailScreen'>>().params;

  const { getAssetById, loading: assetLoading } = useAssets();
  const { getUserProfile } = useUsers(); 
  // --- AÑADIDO: Hook de mantenimiento ---
  const { fetchAllMaintenance, loading: maintenanceLoading } = useMaintenance(); 

  const { userInfo, isLoadingProfile } = useUserProfile();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [assignedUser, setAssignedUser] = useState<{ displayName: string, email: string } | null>(null);
  // --- MODIFICADO: Añadido 'maintenance' al tipo de pestaña ---
  const [activeTab, setActiveTab] = useState<AssetDetailTab>('logs'); 
  
  // --- AÑADIDO: Nuevo estado para los mantenimientos del activo ---
  const [assetMaintenanceList, setAssetMaintenanceList] = useState<Maintenance[]>([]); 

  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  // Modificado: Incluir maintenanceLoading en el estado general de carga
  const isLoading = assetLoading || !asset || maintenanceLoading; 

  // 1. Cargar el activo por ID
  const loadAsset = useCallback(async () => {
    const fetchedAsset = await getAssetById(assetId); 
    setAsset(fetchedAsset as Asset);
  }, [assetId, getAssetById]);

  // --- AÑADIDO: Lógica de carga para Mantenimientos ---
  const loadAssetMaintenance = useCallback(async () => {
    // Nota: fetchAllMaintenance trae TODOS los mantenimientos
    const allMaintenance = await fetchAllMaintenance(); 
    
    // Filtramos solo los que corresponden a este activo
    const filteredMaintenance = allMaintenance
        .filter(m => m.assetId === assetId)
        .sort((a, b) => b.requestDate - a.requestDate); // Ordenamos por fecha más reciente
        
    setAssetMaintenanceList(filteredMaintenance);
  }, [assetId, fetchAllMaintenance]);
  // ---------------------------------------------------

  // 2. Cargar datos de la persona asignada
  const loadAssignedUser = useCallback(async (uid: string) => {
    const userProfile = await getUserProfile(uid);
    if (userProfile) {
      setAssignedUser({
        displayName: userProfile.firstName || 'Usuario Desconocido',
        email: userProfile.email || 'N/A',
      });
    } else {
      setAssignedUser(null);
    }
  }, [getUserProfile]);

  // Effect para la carga inicial del activo Y MANTENIMIENTOS
  useEffect(() => {
    loadAsset();
    loadAssetMaintenance(); // --- AÑADIDO: Cargar mantenimientos al iniciar ---
  }, [loadAsset, loadAssetMaintenance]);

  // Effect para cargar el usuario asignado cuando el activo cambie
  useEffect(() => {
    if (asset?.is_assigned && asset.current_user_uid) {
      loadAssignedUser(asset.current_user_uid);
    } else {
      setAssignedUser(null);
    }
  }, [asset, loadAssignedUser]); 


  // --- COMPONENTES DE VISTA INTERNA ---

  // Componente para mostrar una línea de dato (Existente)
  const DataRow: React.FC<{ label: string, value: string | number | undefined }> = ({ label, value }) => (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value === 0 ? '0.00' : value || 'N/A'}</Text>
    </View>
  );

  // Componente para la lista de Logs (Existente)
  const LogItem: React.FC<{ log: AssetLogEntry }> = ({ log }) => {
    const date = format(new Date(log.timestamp), 'dd MMM yyyy HH:mm');
    return (
      <View style={styles.logItemContainer}>
        <Text style={styles.logAction}>{log.action}</Text>
        <Text style={styles.logMetadata}>
          {date} - Por UID: {log.performedByUid}
        </Text>
        <Text style={styles.logDetails}>{log.details}</Text>
      </View>
    );
  };
  
  // --- AÑADIDO: Componente para los Mantenimientos del Activo ---
  const MaintenanceItem: React.FC<{ maintenance: Maintenance }> = ({ maintenance }) => {
    const statusColorMap = {
        PENDING: '#f59e0b',
        IN_PROGRESS: '#4f46e5',
        FINALIZED: '#10b981',
        DELIVERED: '#3b82f6',
        CANCELLED: '#ef4444',
    };
    const date = format(new Date(maintenance.requestDate), 'dd MMM yyyy');
    const statusColor = statusColorMap[maintenance.status] || '#6b7280';
    
    return (
      <TouchableOpacity 
          style={styles.logItemContainer}
          // Navegar a la pantalla de detalle de mantenimiento
          onPress={() => navigation.navigate('MaintenanceDetailScreen', { maintenanceId: maintenance.maintenanceId })}
      >
        <View style={styles.maintenanceHeader}>
            <Text style={[styles.logAction, { color: statusColor }]}>
                {maintenance.title}
            </Text>
            <Text style={[styles.maintenanceStatus, { color: statusColor, borderColor: statusColor }]}>
                {maintenance.status}
            </Text>
        </View>
        <Text style={styles.logMetadata}>
          Solicitado el: {date}
        </Text>
        <Text style={styles.logDetails} numberOfLines={2}>
            {maintenance.details}
        </Text>
      </TouchableOpacity>
    );
  };

  // Pestaña 3: Lista de Mantenimientos
  const MaintenanceTab = () => {
    return (
      <View style={styles.flex1}>
        {assetMaintenanceList.length > 0 ? (
          <FlatList
            data={assetMaintenanceList}
            renderItem={({ item }) => <MaintenanceItem maintenance={item} />}
            keyExtractor={item => item.maintenanceId}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <View style={[styles.tabContentCard, styles.centerContent]}>
            <Icon name="build-outline" size={40} color="#6366f1" />
            <Text style={styles.unassignedTitle}>No hay historial de mantenimiento.</Text>
            
             <TouchableOpacity 
                style={styles.assignButton}
                onPress={() => Alert.alert('Función Pendiente', 'Navegar a la pantalla de crear solicitud de mantenimiento.')}
              >
                <Text style={styles.assignButtonText}>CREAR SOLICITUD</Text>
              </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };
  // ---------------------------------------------------


  // Pestaña 1: Información de Asignación (Existente)
  const AssignmentTab = () => {
    if (!asset) return null; 
      
    if (asset.is_assigned) {
      return (
        <View style={styles.tabContentCard}>
          <Text style={styles.tabTitle}>Detalles de Persona Asignada</Text>
          
          <DataRow label="Estado" value="ASIGNADO" />
          <DataRow label="UID Asignado" value={asset.current_user_uid || 'N/A'} />
          
          {assignedUser ? (
            <>
              <Text style={styles.assignedUserTitle}>Detalles de Contacto</Text>
              <DataRow label="Nombre" value={assignedUser.displayName} />
              <DataRow label="Email" value={assignedUser.email} />
            </>
          ) : (
            <ActivityIndicator size="small" color="#4f46e5" style={styles.loadingMargin}/>
          )}

          {/* Botón de acción: Desasignar */}
          <TouchableOpacity 
            style={styles.unassignButton}
            onPress={() => navigation.navigate("UserAssetListScreen")}
          >
            <Text style={styles.unassignButtonText}>DESASIGNAR EQUIPO</Text>
          </TouchableOpacity>

        </View>
      );
    }
    
    return (
      <View style={[styles.tabContentCard, styles.centerContent]}>
        <Icon name="person-add-outline" size={40} color="#6366f1" />
        <Text style={styles.unassignedTitle}>Activo No Asignado</Text>
        <TouchableOpacity 
            style={styles.assignButton}
            onPress={() => navigation.navigate("AssignmentFormScreen")}
          >
            <Text style={styles.assignButtonText}>ASIGNAR A USUARIO</Text>
          </TouchableOpacity>
      </View>
    );
  };

  // Pestaña 2: Lista de Logs (Existente)
  const LogsTab = () => {
    const sortedLogs = [...(asset?.logs || [])].sort((a, b) => b?.timestamp - a?.timestamp);

    return (
      <View style={styles.flex1}>
        {(sortedLogs?.length ?? 0) > 0 ? (
          <FlatList
            data={sortedLogs}
            renderItem={({ item }) => <LogItem log={item} />}
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <View style={[styles.tabContentCard, styles.centerContent]}>
            <Icon name="receipt-outline" size={40} color="#6366f1" />
            <Text style={styles.unassignedTitle}>No hay registros de actividad.</Text>
          </View>
        )}
      </View>
    );
  };

  // --- FUNCIÓN PARA RENDERIZAR LA PESTAÑA ACTIVA ---
  const renderActiveTab = () => {
    switch(activeTab) {
        case 'assignment':
            return <AssignmentTab />;
        case 'maintenance': // --- AÑADIDO: Nuevo caso ---
            return <MaintenanceTab />; 
        case 'logs':
        default:
            return <LogsTab />;
    }
  }


  // --- RENDERIZADO PRINCIPAL ---

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.flex1, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loadingText}>Cargando detalles del activo...</Text>
      </SafeAreaView>
    );
  }
  
  // ... (Control de Activo no encontrado)

  if (!asset) {
    return (
      <SafeAreaView style={[styles.flex1, styles.loadingContainer]}>
        <Icon name="alert-circle-outline" size={40} color="#ef4444" />
        <Text style={[styles.loadingText, { color: '#ef4444' }]}>Activo no encontrado: {assetId}</Text>
        <TouchableOpacity 
            style={[styles.assignButton, { marginTop: 20, backgroundColor: '#4b5563' }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.assignButtonText}>Volver</Text>
          </TouchableOpacity>
      </SafeAreaView>
    );
  }


  const { 
    asset_name, serial_number, description, status, asset_type, 
    make, model, approx_cost, color, important_data, created_at
  } = asset;

  const statusColor = status === 'active' ? '#10b981' : status === 'in_maintenance' ? '#f59e0b' : '#ef4444';
  const statusBg = status === 'active' ? '#d1fae5' : status === 'in_maintenance' ? '#fef3c7' : '#fee2e2';


  return (
    <SafeAreaView style={styles.flex1}>
      
      {/* HEADER con Botón de Retroceso y COMPARTIR/IMPRIMIR */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back-outline" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Detalle del Activo
        </Text>
        {/* Botón de Imprimir/Compartir (Abre el Modal del QR) */}
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setIsQrModalVisible(true)}
        >
          <Icon name="share-social-outline" size={28} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* SECCIÓN 1: DATA DEL FORMULARIO E INFORMACIÓN GENERAL */}
        <View style={styles.infoCard}>
          <Text style={styles.assetName}>{asset_name}</Text>
          <Text style={styles.assetSubtitle}>{asset_type} | SN: {serial_number}</Text>
          
          <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              Estado: {status === 'active' ? 'Activo' : status === 'in_maintenance' ? 'Mantenimiento' : 'Retirado'}
            </Text>
          </View>

          <DataRow label="ID Activo" value={assetId} />
          <DataRow label="Fecha Creación" value={format(new Date(created_at), 'dd/MM/yyyy')} />

          <View style={styles.dividerSection}>
            <Text style={styles.sectionTitle}>Detalles Técnicos</Text>
            <DataRow label="Marca" value={make} />
            <DataRow label="Modelo" value={model} />
            <DataRow label="Costo Aprox." value={approx_cost ? `$${approx_cost.toFixed(2)}` : '0.00'} />
            <DataRow label="Color" value={color} />
          </View>
          
          <View style={styles.dividerSection}>
            <Text style={styles.sectionTitle}>Especificaciones</Text>
            <Text style={styles.detailText}>{description || 'No hay especificaciones técnicas registradas.'}</Text>
            
            <Text style={styles.sectionTitle}>Otros Datos Importantes</Text>
            <Text style={styles.detailText}>{important_data || 'No hay datos importantes adicionales.'}</Text>
          </View>
        </View>

        {/* SECCIÓN 2: TABS (Logs y Asignación) */}
        <View style={styles.tabsContainer}>
          {/* Controles de Tab */}
          <View style={styles.tabControls}>
            {
              userInfo?.role === "admin" && (
                <TouchableOpacity 
                  style={[styles.tabButton, activeTab === 'assignment' && styles.activeTab]}
                  onPress={() => setActiveTab('assignment')}
                >
                  <Text style={[styles.tabText, activeTab === 'assignment' && styles.activeTabText]}>
                    {asset.is_assigned ? 'Asignado' : 'Asignar'}
                  </Text>
                </TouchableOpacity>
              )
            }
            
            {/* --- AÑADIDO: Botón para la pestaña de Mantenimiento --- */}
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'maintenance' && styles.activeTab]}
              onPress={() => setActiveTab('maintenance')}
            >
              <Text style={[styles.tabText, activeTab === 'maintenance' && styles.activeTabText]}>
                Mantenimiento ({assetMaintenanceList.length})
              </Text>
            </TouchableOpacity>
            {/* ----------------------------------------------------- */}


            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'logs' && styles.activeTab]}
              onPress={() => setActiveTab('logs')}
            >
              <Text style={[styles.tabText, activeTab === 'logs' && styles.activeTabText]}>
                Actividad ({asset?.logs?.length ?? 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido del Tab */}
          <View style={styles.tabContent}>
            {renderActiveTab()} 
          </View>
        </View>

      </ScrollView>

      {/* MODAL DE GENERACIÓN DE QR */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isQrModalVisible}
        onRequestClose={() => {
          setIsQrModalVisible(!isQrModalVisible);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Botón de Cerrar */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setIsQrModalVisible(false)}
            >
              <Icon name="close-circle-outline" size={30} color="#ef4444" />
            </TouchableOpacity>

            {/* Componente Generador de QR */}
            <QrCodeGenerator 
              assetId={asset.assetId} 
              assetName={asset.asset_name} 
              size={250} 
            />
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: '#f3f4f6', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginRight: 36, 
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 16,
  },
  assetName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#4f46e5',
    marginBottom: 4,
  },
  assetSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dataLabel: {
    color: '#6b7280',
    fontWeight: '600',
    width: '35%',
  },
  dataValue: {
    color: '#1f2937',
    fontWeight: '700',
    width: '65%',
    textAlign: 'right',
  },
  dividerSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  detailText: {
    color: '#4b5563',
    marginBottom: 15,
    lineHeight: 22,
  },
  
  // Tabs
  tabsContainer: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  tabControls: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tabButton: {
    flex: 1, // --- MODIFICADO: Ahora las tres pestañas compartirán el espacio ---
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4f46e5',
  },
  tabText: {
    fontWeight: '700',
    color: '#6b7280',
    fontSize: 11,
  },
  activeTabText: {
    color: '#4f46e5',
  },
  tabContent: {
    paddingVertical: 15,
    minHeight: 300, 
  },
  tabContentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10,
  },
  centerContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  unassignedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 10,
    marginBottom: 20,
  },
  assignButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
  },
  assignButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  unassignButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  unassignButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
  assignedUserTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4b5563',
    marginTop: 15,
    marginBottom: 5,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 10,
  },
  loadingMargin: {
    marginVertical: 15,
  },

  // Logs/Maintenance styles
  flatListContent: {
    paddingHorizontal: 1,
    paddingBottom: 20,
  },
  logItemContainer: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  logAction: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4f46e5',
    textTransform: 'uppercase',
  },
  logMetadata: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
    marginBottom: 4,
  },
  logDetails: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  
  // --- AÑADIDO: Estilos específicos de mantenimiento ---
  maintenanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  maintenanceStatus: {
      fontSize: 10,
      fontWeight: '900',
      borderWidth: 1,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
  },
  // -----------------------------------------------------

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 450,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    padding: 5,
  }
});

export default AssetDetailScreen;