import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
// Asumo que el path es correcto, importa el hook y las interfaces necesarias.
import { 
    useReports, 
    PerformerMaintenanceGroup,
    EnrichedMaintenanceReport,
} from '../../../shared/hooks/useReports'; 
import Icon from 'react-native-vector-icons/Ionicons';
// --- UTILERÍAS DE FORMATO ---

/**
 * Formatea un timestamp a una fecha y hora legible.
 */
const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Formatea el tiempo total en horas a un string legible (minutos o horas).
 */
const formatTimeInHours = (hours: number | null): string => {
  if (hours === null) return 'N/A';
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes} min`;
  }
  return `${hours?.toFixed(1) ?? 0} hrs`;
};


// --- COMPONENTE: UN SOLO MANTENIMIENTO (Versión Enriched) ---

interface MaintenanceEntryProps {
  entry: EnrichedMaintenanceReport; // Usamos el tipo más simple, sin logs
}

const MaintenanceEntry: React.FC<MaintenanceEntryProps> = ({ entry }) => {
  return (
    <View style={maintenanceStyles.card}>
      <Text style={maintenanceStyles.maintenanceTitle}>
        {entry?.assetName ?? "Activo Desconocido"} ({entry?.assetId ?? "N/A"})
      </Text>
      
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Título:</Text>
        <Text style={maintenanceStyles.summaryValue}>{entry?.details ?? ""}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Estatus de Cierre:</Text>
        <Text style={maintenanceStyles.summaryValue}>{entry?.status ?? ""}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Solicitado por:</Text>
        <Text style={maintenanceStyles.summaryValue}>{entry?.requestedBy ?? ""}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Fecha de Solicitud:</Text>
        <Text style={maintenanceStyles.summaryValue}>{formatDate(entry?.requestDate) ?? "N/A"}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Fecha de Cierre:</Text>
        <Text style={maintenanceStyles.summaryValue}>{formatDate(entry?.closeDate) ?? "N/A"}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Tiempo Invertido:</Text>
        <Text style={maintenanceStyles.summaryValue}>{formatTimeInHours(entry?.totalTimeInHours)  ?? "N/A"}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>ID Mantenimiento:</Text>
        <Text style={maintenanceStyles.summaryValue}>{entry?.maintenanceId ?? "N/A"}</Text>
      </View>
    </View>
  );
};

// --- COMPONENTE: GRUPO DE PERFORMER ---

interface PerformerGroupProps {
  performerGroup: PerformerMaintenanceGroup;
}

const PerformerGroup: React.FC<PerformerGroupProps> = ({ performerGroup }) => {
    return (
        <View style={performerGroupStyles.groupContainer}>
            <Text style={performerGroupStyles.performerName}>
                {performerGroup?.performerName ?? ""}
            </Text>
            <Text style={performerGroupStyles.countText}>
                {performerGroup?.performedMaintenances?.length ?? 0} Mantenimientos Completados
            </Text>
            
            {/* Mapeo de los mantenimientos realizados por este Admin */}
            {performerGroup.performedMaintenances.map((entry) => (
                <MaintenanceEntry 
                    key={entry.maintenanceId} 
                    entry={entry} 
                />
            ))}
        </View>
    );
};


// --- COMPONENTE PRINCIPAL ---

const MaintenanceByAdminReportTab: React.FC = () => {
  // 1. Obtener la data agrupada y el estado de carga (Reporte 7)
  const { 
    maintenanceReportByPerformerGroup, 
    loadingMaintenanceReportByPerformerGroup,
  } = useReports();
  
  if (loadingMaintenanceReportByPerformerGroup) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando Reporte de Mantenimiento por Administrador...</Text>
      </View>
    );
  }

  // 2. Filtrar grupos que tengan mantenimientos cerrados (aunque el hook ya lo hace)
  const groupsWithMaintenance = maintenanceReportByPerformerGroup.filter(
    group => group.performedMaintenances.length > 0
  );
  
  if (groupsWithMaintenance.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>REPORTE DE MANTENIMIENTOS POR ADMINISTRADOR</Text>
        <Text style={styles.placeholder}>No se encontraron mantenimientos cerrados por Administradores/Usuarios.</Text>
      </View>
    );
  }


  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>REPORTE DE MANTENIMIENTOS POR ADMINISTRADOR</Text>
        
        {/* 3. Mapeo principal sobre los Performers agrupados */}
        {groupsWithMaintenance.map((performerGroup) => (
          <PerformerGroup 
              key={performerGroup?.performerName} 
              performerGroup={performerGroup} 
          />
        ))}
        
        <View style={{ height: 50 }} /> 
      </ScrollView>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: '#130f40',
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}
        onPress={() => console.log('Botón presionado')}
      >
        <Icon name="bar-chart-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </>
  );
};

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  placeholder: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  }
});

const performerGroupStyles = StyleSheet.create({
    groupContainer: {
        marginBottom: 25,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#f7931e', // Naranja/Amarillo para Administradores
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    performerName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    countText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    }
});

const maintenanceStyles = StyleSheet.create({
    card: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    maintenanceTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
        paddingHorizontal: 5,
    },
    summaryText: {
        fontSize: 14,
        color: '#555',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
});

export default MaintenanceByAdminReportTab;