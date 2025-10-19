import React, { useMemo } from 'react';
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

// Importación del hook y tipos
import { useReports, AssignedAssetExtended, UserAssignmentReport } from '../../../shared/hooks/useReports'; 

// Habilitar LayoutAnimation para animaciones fluidas de expansión/colapso
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ===================================================================
// UTILITY: FORMATO DE FECHA (Añadido)
// ===================================================================
const formatDate = (timestamp: number) => {
    if (timestamp === 0) return 'Fecha Desconocida';
    // Crea una fecha a partir del timestamp (milisegundos)
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
};


// -------------------------------------------------------------------
// COMPONENTE INTERNO: Tarjeta de Usuario con Asignaciones (MODIFICADO)
// -------------------------------------------------------------------

interface UserAssignmentCardProps {
  reportItem: UserAssignmentReport;
}

const UserAssignmentCard: React.FC<UserAssignmentCardProps> = ({ reportItem }) => {
  const [isExpanded, setIsExpanded] = React.useState(false); 
  const totalAssigned = reportItem.assignedAssets.length;
  
  const toggleExpand = () => {
    // Animación de la lista
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };
  
  const cardColor = totalAssigned > 0 ? '#10b981' : '#6b7280'; // Verde si tiene equipos, gris si no

  return (
    <View style={styles.cardContainer}>
        <TouchableOpacity 
            onPress={toggleExpand} 
            style={[styles.cardHeader, { borderLeftColor: cardColor }]}
        >
            <View style={{ flex: 1 }}>
                <Text style={styles.userName}>
                    {reportItem.user.firstName} {reportItem.user.lastName} 
                    <Text style={styles.userRole}> ({reportItem.user.role.toUpperCase()})</Text>
                </Text>
                <Text style={styles.assetCount}>
                    {totalAssigned} equipo(s) asignado(s)
                </Text>
            </View>
            <Icon 
                name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} 
                size={24} 
                color="#1f2937" 
            />
        </TouchableOpacity>

        {isExpanded && (
            <View style={styles.expandedContent}>
                {totalAssigned === 0 ? (
                    <Text style={styles.emptyAssets}>No tiene activos asignados actualmente.</Text>
                ) : (
                    // Aquí usamos AssignedAssetExtended, que incluye assignedDate
                    reportItem.assignedAssets.map((asset: AssignedAssetExtended) => (
                        <View key={asset.assetId} style={styles.assetItem}>
                            <Text style={styles.assetName}>
                                <Text style={{ fontWeight: '700' }}>{asset.asset_name}</Text>
                            </Text>
                            <Text style={styles.assetDate}>
                                Asignado por: {asset?.assignedByAdminName ?? "Admin"}
                            </Text>
                            <Text style={styles.assetDetail}>ID: {asset.assetId}</Text>
                            <Text style={styles.assetDetail}>SN: {asset.serial_number || 'N/A'}</Text>
                            {/* CAMBIO CLAVE: Mostrar la fecha de asignación */}
                            <Text style={styles.assetDate}>
                                Asignado desde: {formatDate(asset.assignedDate)}
                            </Text>
                        </View>
                    ))
                )}
            </View>
        )}
    </View>
  );
};


// -------------------------------------------------------------------
// COMPONENTE PRINCIPAL: AssignmentReportTab
// -------------------------------------------------------------------

const AssignmentReportTab: React.FC = () => {
  // Consumir el estado pre-calculado del hook
  const { assignmentReport, loadingAssignmentReport } = useReports(); 
  
  // 1. Filtrado y ordenación para la UI (usando el estado del hook: assignmentReport)
  const sortedReport = useMemo(() => {
    // Colocar primero a los usuarios con activos asignados
    return [...(assignmentReport ?? [])].sort((a, b) => {
        if (a?.assignedAssets?.length > 0 && b?.assignedAssets?.length === 0) return -1;
        if (a?.assignedAssets?.length === 0 && b?.assignedAssets?.length > 0) return 1;
        // Ordenar alfabéticamente por nombre si tienen el mismo estado de asignación
        return a?.user?.lastName?.localeCompare(b?.user?.lastName);
    });
  }, [assignmentReport]);
  
  // 2. Renderizado de estado
  // Usamos el estado de carga del hook
  if (loadingAssignmentReport) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Cargando reporte de asignaciones...</Text>
      </View>
    );
  }

  // Usamos la data del hook
  if (assignmentReport.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="people-outline" size={50} color="#9ca3af" />
        <Text style={styles.emptyText}>No se encontraron usuarios para este reporte.</Text>
      </View>
    );
  }

  // 3. Renderizado de la lista
  return (
    <FlatList
      data={sortedReport}
      renderItem={({ item }) => <UserAssignmentCard reportItem={item} />}
      keyExtractor={item => item.user.uid}
      contentContainerStyle={styles.listContainer}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  // --- Estados y Contenedores ---
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
  listContainer: {
    padding: 10,
  },
  separator: {
    height: 10,
  },
  
  // --- Estilos de Tarjeta (UserAssignmentCard) ---
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderLeftWidth: 5,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },
  assetCount: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  expandedContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  assetItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  assetName: {
    fontSize: 14,
    color: '#1f2937',
  },
  assetDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  // Nuevo estilo para la fecha
  assetDate: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '600',
    marginTop: 2,
  },
  emptyAssets: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default AssignmentReportTab;
