import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity,
  LayoutAnimation,
  Platform, 
  UIManager,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useReports, AssetLogReport } from '../../../shared/hooks/useReports'; 
import { AssetLogEntry } from '../../../types/Asset.types'; 

// Habilitar LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ===================================================================
// UTILITY: FORMATO DE FECHA
// ===================================================================
const formatDateAndTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// -------------------------------------------------------------------
// COMPONENTE INTERNO: LogItem (Se mantiene)
// -------------------------------------------------------------------

interface LogItemProps {
    log: AssetLogEntry;
}

const LogItem: React.FC<LogItemProps> = React.memo(({ log }) => {
    // Definir estilos basados en el tipo de acción
    const actionStyle = useMemo(() => {
        switch (log.action) {
            case 'ASSIGNED':
                return { icon: 'arrow-forward-circle', color: '#10b981', actionColor: '#059669' }; 
            case 'UNASSIGNED':
                return { icon: 'arrow-back-circle', color: '#f59e0b', actionColor: '#d97706' }; 
            case 'MAINTENANCE':
                return { icon: 'build', color: '#3b82f6', actionColor: '#2563eb' }; 
            case 'CREATED':
                return { icon: 'add-circle', color: '#8b5cf6', actionColor: '#7c3aed' }; 
            default:
                return { icon: 'information-circle', color: '#4b5563', actionColor: '#374151' }; 
        }
    }, [log.action]);

    return (
        <View style={styles.logItemContainer}>
            <Icon name={actionStyle.icon} size={20} color={actionStyle.color} style={styles.logIcon} />
            <View style={styles.logTextContent}>
                <Text style={[styles.logAction, { color: actionStyle.actionColor }]}>
                    {log.action.replace('_', ' ')}
                    <Text style={styles.logTimestamp}> ({formatDateAndTime(log.timestamp)})</Text>
                </Text>
                {/* Usamos 'message' en lugar de 'details' que es más común en logs */}
                <Text style={styles.logMessage}>{log.details}</Text> 
            </View>
        </View>
    );
});

// -------------------------------------------------------------------
// COMPONENTE INTERNO: AssetLogCard (Nuevo: Tarjeta por Equipo)
// -------------------------------------------------------------------

interface AssetLogCardProps {
    report: AssetLogReport;
}

const AssetLogCard: React.FC<AssetLogCardProps> = ({ report }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const logCount = report.logs.length;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    const cardColor = logCount > 0 ? '#1f2937' : '#9ca3af';

    return (
        <View style={styles.cardContainer}>
            <TouchableOpacity 
                onPress={toggleExpand} 
                style={[styles.cardHeader, { borderLeftColor: report.asset.is_assigned ? '#10b981' : '#f59e0b' }]}
            >
                <View style={styles.headerTextContainer}>
                    <Text style={styles.assetName}>
                        {report.asset.asset_name}
                    </Text>
                    <Text style={styles.assetDetailHeader}>ID: {report.asset.assetId} | SN: {report.asset.serial_number || 'N/A'}</Text>
                    <Text style={styles.logCountText}>
                        {logCount} eventos registrados
                    </Text>
                </View>
                <Icon 
                    name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} 
                    size={24} 
                    color={cardColor} 
                />
            </TouchableOpacity>

            {isExpanded && (
                <View style={styles.expandedContent}>
                    {/* Estado de Asignación */}
                    <View style={styles.assignmentStatus}>
                        <Icon 
                            name={report.asset.is_assigned ? 'checkmark-circle' : 'close-circle'} 
                            size={18} 
                            color={report.asset.is_assigned ? '#10b981' : '#f59e0b'} 
                        />
                        <Text style={styles.assigneeText}>
                            {report.asset.is_assigned 
                                ? `Asignado a: ${report.currentAssigneeName}` 
                                : 'Actualmente sin asignar'}
                        </Text>
                    </View>
                    
                    {/* Lista de Logs */}
                    {logCount === 0 ? (
                        <Text style={styles.emptyLogsText}>No hay historial de logs para mostrar.</Text>
                    ) : (
                        <View style={styles.logListContainer}>
                            {report.logs.map((log, index) => (
                                <LogItem key={index} log={log} />
                            ))}
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

// -------------------------------------------------------------------
// COMPONENTE PRINCIPAL: AssetLogReportTab
// -------------------------------------------------------------------

const AssetLogReportTab: React.FC = () => {
  // Consumimos el estado de todos los logs pre-calculados
  const { 
    allAssetLogReports, 
    loadingAllAssetLogReports,
  } = useReports(); 
  
  // 1. Renderizado de carga
  if (loadingAllAssetLogReports) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Cargando logs de activos...</Text>
      </View>
    );
  }

  // 2. Renderizado de lista vacía
  if (allAssetLogReports.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="hardware-chip-outline" size={50} color="#9ca3af" />
        <Text style={styles.emptyText}>No se encontraron activos o logs registrados.</Text>
      </View>
    );
  }
  
  // 3. Renderizado de la lista
  return (
    <View style={styles.container}>
      <Text style={styles.title}>REPORTE DE LOG DE TODOS LOS EQUIPOS</Text>
      
      <FlatList
        data={allAssetLogReports}
        keyExtractor={item => item.asset.assetId}
        renderItem={({ item }) => <AssetLogCard report={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};


const styles = StyleSheet.create({
  // --- Contenedores y Base ---
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9fafb',
  },
  listContent: {
    paddingVertical: 10,
  },
  separator: {
    height: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1f2937',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#9ca3af',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    textAlign: 'center',
  },

  // --- Estilos de Tarjeta (AssetLogCard) ---
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderLeftWidth: 5,
    backgroundColor: '#fff',
  },
  headerTextContainer: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  assetDetailHeader: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  logCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 4,
  },
  
  expandedContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  
  // --- Estado de Asignación ---
  assignmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  assigneeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
    color: '#1f2937',
  },
  emptyLogsText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  
  // --- Logs ---
  logListContainer: {
    marginTop: 5,
  },
  logItemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  logIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  logTextContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  logTimestamp: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9ca3af',
    textTransform: 'none',
  },
  logMessage: {
    fontSize: 13,
    color: '#4b5563',
    marginTop: 2,
  },
});

export default AssetLogReportTab;