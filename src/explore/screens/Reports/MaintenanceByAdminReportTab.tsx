import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Este componente se encargará de:
// 1. Llamar a useReports().getMaintenanceReportByAdmin().
// 2. Mostrar la lista de mantenimientos agrupados por el Administrador que los cerró.

const MaintenanceByAdminReportTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>REPORTE DE MANTENIMIENTOS POR ADMINISTRADOR</Text>
      <Text style={styles.placeholder}>
        [Contenido Placeholder] Lista de Administradores y los mantenimientos que han completado.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  placeholder: {
    color: '#666',
    fontStyle: 'italic',
  }
});

export default MaintenanceByAdminReportTab;