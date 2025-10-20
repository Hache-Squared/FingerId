import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
} from 'react-native';
// MODIFICADO: Importamos el hook de perfil de usuario
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { TabView, SceneMap, TabBar, NavigationState } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUserProfile } from '../../../shared/hooks/useUserProfile'; // AGREGADO

// Importar los componentes genéricos de Reporte
import AssignmentReportTab from './AssignmentReportTab';
import AssetLogReportTab from './AssetLogReportTab';
import UserCreationReportTab from './UserCreationReportTab';
import MaintenanceByAssetReportTab from './MaintenanceByAssetReportTab';
import MaintenanceByAdminReportTab from './MaintenanceByAdminReportTab';

// Tipo de navegación genérico
type ReportsScreenNavigationProp = NavigationProp<any>;

// Lista ordenada de reportes para la navegación por tabs (Mismo listado, pero ahora lo usamos como fuente)
const REPORT_TABS = [
    { key: 'ASSIGNMENT', title: 'Asignaciones', icon: 'people-outline' },
    { key: 'ASSET_LOG', title: 'Logs de Equipo', icon: 'file-tray-full-outline' },
    { key: 'USER_CREATION', title: 'Creación Usuarios', icon: 'person-add-outline' },
    { key: 'MAINT_ASSET', title: 'Maint. por Equipo', icon: 'build-outline' },
    { key: 'MAINT_ADMIN', title: 'Maint. por Admin', icon: 'hammer-outline' },
];

// Creamos el SceneMap que mapea las claves a los componentes
const renderScene = SceneMap({
    ASSIGNMENT: AssignmentReportTab,
    ASSET_LOG: AssetLogReportTab,
    USER_CREATION: UserCreationReportTab,
    MAINT_ASSET: MaintenanceByAssetReportTab,
    MAINT_ADMIN: MaintenanceByAdminReportTab,
});


const ReportsScreen: React.FC = () => {
  const navigation = useNavigation<ReportsScreenNavigationProp>();
  // AGREGADO: Obtener la info del usuario y estado de carga
  const { userInfo, isLoadingProfile } = useUserProfile(); 
  const [index, setIndex] = useState(0);

  // Lógica para filtrar los reportes basado en permisos
  const availableReportTabs = React.useMemo(() => {
    // Si la info del usuario no está cargada o no tiene permisos, retornar vacío
    if (isLoadingProfile || !userInfo?.permissions) {
        return [];
    }

    // 1. Verificar el permiso general
    if (!userInfo.permissions.canViewReports) {
        return [];
    }
    
    // 2. Filtrar por permisos específicos
    const specificPermissions = userInfo.permissions.specificReports || {};

    return REPORT_TABS.filter(tab => {
        // Aseguramos que el tipo de la clave sea correcto
        const key = tab.key as keyof typeof specificPermissions;
        return specificPermissions[key] === true;
    });
  }, [userInfo, isLoadingProfile]); // Se recalcula cuando la info del usuario cambia

  // Rutas dinámicas basadas en los reportes disponibles
  const routes = availableReportTabs.map(tab => ({ key: tab.key, title: tab.title }));

  // Ajustar el índice si la ruta seleccionada desaparece (ej. cambio de permisos)
  useEffect(() => {
    if (index >= routes.length && routes.length > 0) {
        setIndex(0);
    } else if (routes.length === 0) {
        setIndex(0);
    }
  }, [routes.length]);


  if (isLoadingProfile) {
    // Manejo de carga de perfil
    return (
      <SafeAreaView style={[styles.container, styles.center]}>
        <Text style={styles.headerTitle}>Reportes y Auditoría</Text>
        <Text style={styles.placeholder}>Cargando permisos de usuario...</Text>
      </SafeAreaView>
    );
  }

  // Si el usuario no tiene acceso a reportes o no tiene reportes específicos asignados
  if (routes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Reportes y Auditoría</Text>
        </View>
        <View style={styles.accessDenied}>
            <Icon name="lock-closed-outline" size={50} color="#dc3545" />
            <Text style={styles.accessDeniedTitle}>Acceso Denegado</Text>
            <Text style={styles.accessDeniedSubText}>
                {/* Mensaje basado en si tiene la estructura de permisos o no */}
                {userInfo?.permissions?.canViewReports === false 
                    ? 'El acceso a reportes está deshabilitado para tu perfil.' 
                    : 'No tienes reportes asignados a tu perfil. Contacta a un administrador.'}
            </Text>
        </View>
      </SafeAreaView>
    );
  }


  // Custom TabBar
  const renderTabBar = (props: any & { navigationState: NavigationState<{ key: string, title: string }> }) => (
    <TabBar
      {...props}
      scrollEnabled
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.label}
      tabStyle={styles.tabStyle}
      activeColor="#1f2937"
      inactiveColor="#6b7280"
      renderLabel={({ route, focused, color } : any) => {
          // Buscamos en la lista ORIGINAL de REPORT_TABS para obtener el ícono correcto
          const reportTab = REPORT_TABS.find(t => t.key === route.key);
          return (
              <View style={styles.tabLabelContent}>
                  <Icon name={reportTab?.icon || 'help-circle-outline'} size={18} color={color} />
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
        <Text style={styles.headerTitle}>Reportes y Auditoría</Text>
      </View>
      <TabView
        // MODIFICADO: Usamos las rutas filtradas
        navigationState={{ index, routes }} 
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 0 }}
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
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
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
  // ESTILOS DE ACCESO DENEGADO
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
  },
  accessDeniedTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 10,
  },
  accessDeniedSubText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  placeholder: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  // --- Tab Bar Styles ---
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabStyle: {
    paddingVertical: 10,
    width: 150, // Ancho fijo para las pestañas
  },
  indicator: {
    backgroundColor: '#1f2937', // Color de acento
    height: 3,
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
  },
  tabLabelContent: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
  },
  tabLabelText: {
      marginLeft: 5,
      fontWeight: '700',
      fontSize: 12, 
  },
});

export { ReportsScreen };