import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
// Asumo que el path es correcto, importa el hook y las interfaces necesarias.
import { 
    useReports, 
    AssetMaintenanceGroup, 
    MaintenanceExtended,
    MaintenanceLogExtended 
} from '../../../shared/hooks/useReports'; 

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
  return `${hours.toFixed(1)} hrs`;
};


// --- COMPONENTE: UN SOLO MANTENIMIENTO ---

interface MaintenanceEntryProps {
  entry: MaintenanceExtended;
}

const MaintenanceEntry: React.FC<MaintenanceEntryProps> = ({ entry }) => {
  return (
    <View style={maintenanceStyles.card}>
      <Text style={maintenanceStyles.maintenanceTitle}>{entry?.title ?? ""}</Text>
      
      {/* Resumen */}
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Estatus Actual:</Text>
        <Text style={maintenanceStyles.summaryValue}>{entry?.status ?? ""}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Solicitud:</Text>
        <Text style={maintenanceStyles.summaryValue}>{formatDate(entry?.requestDate)}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Cierre:</Text>
        <Text style={maintenanceStyles.summaryValue}>{formatDate(entry?.closeDate)}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Tiempo Total:</Text>
        <Text style={maintenanceStyles.summaryValue}>{formatTimeInHours(entry?.totalTimeInHours)}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Solicitado por:</Text>
        <Text style={maintenanceStyles.summaryValue}>{entry?.requestedBy ?? ""}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Cerrado por:</Text>
        <Text style={maintenanceStyles.summaryValue}>{entry?.performedByAdminName ?? ""}</Text>
      </View>

      {/* Historial de Estatus (Logs) */}
      <Text style={maintenanceStyles.historyTitle}>Historial de Estatus:</Text>
      {entry.logs.map((log: MaintenanceLogExtended, index: number) => (
        <View key={index} style={maintenanceStyles.logRow}>
          <Text style={maintenanceStyles.logStatus}>- {log?.newStatus ?? ""}</Text>
          <Text style={maintenanceStyles.logAdmin}>({log?.performedByAdminName ?? ""})</Text>
          <Text style={maintenanceStyles.logTime}>{formatDate(log?.timestamp)}</Text>
        </View>
      ))}
    </View>
  );
};

// --- COMPONENTE: GRUPO DE ACTIVO ---

interface AssetGroupProps {
  assetGroup: AssetMaintenanceGroup;
}

const AssetGroup: React.FC<AssetGroupProps> = ({ assetGroup }) => {
    // Solo renderizar si tiene mantenimientos
    if (assetGroup.maintenanceEntries.length === 0) return null;

    return (
        <View style={assetGroupStyles.groupContainer}>
            <Text style={assetGroupStyles.assetName}>
                {assetGroup?.asset?.asset_name ?? ""} ({assetGroup?.asset?.assetId ?? ""})
            </Text>
            
            {/* Mapeo de los mantenimientos del Asset */}
            {assetGroup.maintenanceEntries.map((entry) => (
                <MaintenanceEntry key={entry.maintenanceId} entry={entry} />
            ))}
        </View>
    );
};


// --- COMPONENTE PRINCIPAL ---

const MaintenanceByAssetReportTab: React.FC = () => {
  // 1. Obtener la data agrupada y el estado de carga
  const { 
    maintenanceReportByAssetGroup, 
    loadingMaintenanceReportByAssetGroup,
  } = useReports();
  
  if (loadingMaintenanceReportByAssetGroup) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Cargando Reporte de Mantenimiento por Equipo...</Text>
      </View>
    );
  }

  // 2. Filtrar grupos que tengan mantenimientos para evitar mostrar activos sin historial
  const groupsWithMaintenance = maintenanceReportByAssetGroup.filter(
    group => group.maintenanceEntries.length > 0
  );
  
  if (groupsWithMaintenance.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>REPORTE DE MANTENIMIENTOS POR EQUIPO</Text>
        <Text style={styles.placeholder}>No se encontraron mantenimientos registrados en ningún activo.</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>REPORTE DE MANTENIMIENTOS POR EQUIPO</Text>
      
      {groupsWithMaintenance.map((assetGroup) => (
        <AssetGroup 
            key={assetGroup.asset.assetId} 
            assetGroup={assetGroup} 
        />
      ))}
      
      <View style={{ height: 50 }} /> 
    </ScrollView>
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

const assetGroupStyles = StyleSheet.create({
    groupContainer: {
        marginBottom: 25,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderLeftWidth: 5,
        borderLeftColor: '#007AFF', // Azul primario para destacar el activo
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    assetName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
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
    historyTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#333',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 5,
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
        paddingHorizontal: 5,
    },
    logStatus: {
        fontSize: 12,
        fontWeight: '600',
        color: '#007AFF', // Color de estatus
        marginRight: 8,
        width: 100, // Ayuda a alinear el contenido
    },
    logAdmin: {
        fontSize: 12,
        color: '#888',
        marginRight: 8,
        flex: 1, // Toma el espacio restante
    },
    logTime: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    }
});

export default MaintenanceByAssetReportTab;