import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Este componente se encargará de:
// 1. Llamar a useReports().getUserCreationReport().
// 2. Mostrar la lista de todos los usuarios y quién los creó.

const UserCreationReportTab: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>REPORTE DE CREACIÓN DE USUARIOS</Text>
      <Text style={styles.placeholder}>
        [Contenido Placeholder] Lista de Usuarios y el Admin que los registró.
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

export default UserCreationReportTab;