import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { TabView, SceneMap, TabBar, NavigationState, SceneRendererProps } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';

// Importación de Hooks y Tipos
import { useMaintenance, Maintenance, MaintenanceStatus } from '../../shared/hooks/useMaintenance';
import { StackExploreParams } from '../../routes/StackExplore'; // Asegúrate de que esta ruta es correcta
import { useAssets } from '../../shared/hooks/useAssets'; // Para obtener el nombre del activo en la lista

// Tipos de navegación específicos para la pila (si usas un stack)
type AdminMaintenanceScreenNavigationProp = NavigationProp<StackExploreParams, 'AdminMaintenanceScreen'>;

// Lista ordenada de estatus para la navegación por tabs
const STATUS_TABS: { key: MaintenanceStatus, title: string, icon: string, color: string }[] = [
    { key: 'PENDING', title: 'Pendientes', icon: 'time-outline', color: '#f59e0b' },
    { key: 'IN_PROGRESS', title: 'En Curso', icon: 'hammer-outline', color: '#111' },
    { key: 'FINALIZED', title: 'Finalizados', icon: 'checkmark-done-circle-outline', color: '#10b981' },
    { key: 'DELIVERED', title: 'Entregados', icon: 'archive-outline', color: '#3b82f6' },
    { key: 'CANCELLED', title: 'Cancelados', icon: 'trash-bin-outline', color: '#eb4d4b' },
];

// -------------------------------------------------------------------
// COMPONENTE INTERNO: MaintenanceListTab
// Muestra una lista filtrada de mantenimientos para una pestaña específica
// -------------------------------------------------------------------

interface MaintenanceListTabProps {
  status: MaintenanceStatus;
  navigation: AdminMaintenanceScreenNavigationProp;
}

const MaintenanceListTab: React.FC<MaintenanceListTabProps> = ({ status, navigation }) => {
  const { fetchAllMaintenance, loading: loadingMaintenance, error: errorMaintenance } = useMaintenance();
  const { getAssetById, loading: loadingAssets } = useAssets();
  
  const [allMaintenanceRequests, setAllMaintenanceRequests] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mapa para almacenar el nombre del activo, para no recargarlo
  const [assetNamesMap, setAssetNamesMap] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const requests = await fetchAllMaintenance();
      console.log({
        requests
      });
      
      setAllMaintenanceRequests(requests);

      // Precargar nombres de activos para los que aparecen en la lista
      const assetIdsToFetch = Array.from(new Set(requests.map(r => r.assetId)));
      const namesMap: Record<string, string> = {};
      
      const assetPromises = assetIdsToFetch.map(async (assetId) => {
        const asset = await getAssetById(assetId);
        console.log({
          asset,assetId
        });
        
        namesMap[assetId] = asset?.asset_name || 'Activo Desconocido';
      });
      await Promise.all(assetPromises);
      setAssetNamesMap(namesMap);

    } catch (e) {
      console.error("Error loading maintenance data:", e);
      Alert.alert("Error", "No se pudieron cargar las solicitudes de mantenimiento.");
    } finally {
      setLoading(false);
    }
  }, [fetchAllMaintenance, getAssetById]);

  useEffect(() => {
    loadData();
    // Re-fetch cuando la pestaña esté activa o cuando se presione el botón (usando listeners)
    const unsubscribe = navigation.addListener('focus', () => {
        loadData();
    });
    return unsubscribe;
  }, [loadData, navigation]);

  // Filtrar los mantenimientos por el estado de la pestaña
  const filteredRequests = useMemo(() => {
    let requests = allMaintenanceRequests.filter(req => req.status === status);
    requests = requests?.sort((a, b) => b?.requestDate - a?.requestDate);
    return requests;
  }, [allMaintenanceRequests, status]);
  
  // Renderizado del item de la lista
  const renderItem = ({ item }: { item: Maintenance }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => {
        console.log({
          item
        });
        
        navigation.navigate('MaintenanceDetailScreen', { maintenanceId: item.maintenanceId })
      }}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Icon 
          name="chevron-forward-outline" 
          size={24} 
          color="#111" 
        />
      </View>
      <Text style={styles.cardSubtitle}>
        Activo: {assetNamesMap[item.assetId] || 'Cargando...'}
      </Text>
      <Text style={styles.cardDetail} numberOfLines={1}>
        Detalles: {item.details}
      </Text>
      <Text style={styles.cardDate}>
        Solicitado: {new Date(item.requestDate).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="reader-outline" size={50} color="#9ca3af" />
        <Text style={styles.emptyText}>No hay solicitudes con estatus "{status}".</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredRequests}
      renderItem={renderItem}
      keyExtractor={item => item.maintenanceId}
      contentContainerStyle={styles.listContainer}
    />
  );
};

// -------------------------------------------------------------------
// PANTALLA PRINCIPAL: AdminMaintenanceScreen
// -------------------------------------------------------------------

const AdminMaintenanceScreen: React.FC = () => {
  const navigation = useNavigation<AdminMaintenanceScreenNavigationProp>();
  const [index, setIndex] = useState(0);
  const [routes] = useState(STATUS_TABS.map(tab => ({ key: tab.key, title: tab.title })));

  // Creamos el SceneMap dinámicamente
  const renderScene = SceneMap(
    STATUS_TABS.reduce((acc, tab) => {
      acc[tab.key] = () => (
        <MaintenanceListTab 
          status={tab.key} 
          navigation={navigation as any} 
        />
      );
      return acc;
    }, {} as Record<string, () => React.ReactElement>)
  );
  
  // Custom TabBar para añadir estilos
  const renderTabBar = (props: any & { navigationState: NavigationState<{ key: string, title: string }> }) => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.label}
      tabStyle={styles.tabStyle}
      activeColor="#111"
      inactiveColor="#6b7280"
      renderLabel={({ route, focused, color } : any) => {
          const statusTab = STATUS_TABS.find(t => t.key === route.key);
          return (
              <View style={styles.tabLabelContent}>
                  <Icon name={statusTab?.icon || 'help-circle-outline'} size={18} color={color} />
                  <Text style={[styles.tabLabelText, { color }]}>
                      {route.title}
                  </Text>
              </View>
          );
      }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administración de Mantenimiento</Text>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 0 }} // El ancho se calculará automáticamente
        renderTabBar={renderTabBar}
      />
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
  // --- Tab Bar Styles ---
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabStyle: {
    width: 140, // Ancho fijo para las pestañas
  },
  indicator: {
    backgroundColor: '#111',
    height: 3,
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
  },
  tabLabelContent: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  tabLabelText: {
      marginLeft: 5,
      fontWeight: '700',
  },
  // --- List/Card Styles ---
  listContainer: {
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#111',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    flexShrink: 1,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 3,
  },
  cardDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 3,
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#111',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9ca3af',
  },
});

export  {AdminMaintenanceScreen};