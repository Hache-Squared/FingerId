import React, { useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { TabView, SceneMap, TabBar, NavigationState } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/Ionicons';

// Importar los componentes genéricos de Reporte
import AssignmentReportTab from './AssignmentReportTab';
import AssetLogReportTab from './AssetLogReportTab';
import UserCreationReportTab from './UserCreationReportTab';
import MaintenanceByAssetReportTab from './MaintenanceByAssetReportTab';
import MaintenanceByAdminReportTab from './MaintenanceByAdminReportTab';

// NOTA: Define o importa tu tipo de navegación principal (por ejemplo, RootStackParams)
// Si esta pantalla está en el stack principal, podrías usar:
// type ReportsScreenNavigationProp = NavigationProp<RootStackParams, 'ReportsScreen'>;
// Por ahora, usamos un tipo genérico:
type ReportsScreenNavigationProp = NavigationProp<any>;


// Lista ordenada de reportes para la navegación por tabs
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
  const [index, setIndex] = useState(0);
  const [routes] = useState(REPORT_TABS.map(tab => ({ key: tab.key, title: tab.title })));

  // Custom TabBar
  const renderTabBar = (props: any & { navigationState: NavigationState<{ key: string, title: string }> }) => (
    <TabBar
      {...props}
      scrollEnabled // Permitir scroll lateral si hay muchas pestañas
      indicatorStyle={styles.indicator}
      style={styles.tabBar}
      labelStyle={styles.label}
      tabStyle={styles.tabStyle}
      activeColor="#1f2937"
      inactiveColor="#6b7280"
      renderLabel={({ route, focused, color } : any) => {
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
      fontSize: 12, // Fuente más pequeña para que quepa bien el texto
  },
});

export { ReportsScreen };