import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Este componente se encargará de:
// 1. Mostrar un input/selector para elegir un AssetId.
// 2. Llamar a useReports().getAssetLogReport(assetId).
// 3. Mostrar la asignación actual y la lista de logs del equipo.

const AssetLogReportTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>REPORTE DE LOG DE EQUIPO</Text>
      <Text style={styles.placeholder}>
        [Contenido Placeholder] Selector de Equipo y su historial de logs.
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

export default AssetLogReportTab;