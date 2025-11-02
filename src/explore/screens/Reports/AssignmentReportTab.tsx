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
  Alert, // Para mostrar mensajes de éxito o error
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Importación del hook y tipos
import { useReports, AssignedAssetExtended, UserAssignmentReport } from '../../../shared/hooks/useReports'; 
import { usePdfGenerator } from '../../../shared/hooks/usePdfGenerator'; // Asegúrate de ajustar la ruta real a tu hook

// Habilitar LayoutAnimation para animaciones fluidas de expansión/colapso
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ===================================================================
// UTILITY: FORMATO DE FECHA
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

// ===================================================================
// FUNCIÓN AUXILIAR: GENERACIÓN DE HTML para PDF
// ===================================================================

/**
 * Genera el string HTML para el reporte de asignaciones.
 * Incluye estilos CSS básicos para formato de impresión.
 */
const generateAssignmentHtml = (reportData: UserAssignmentReport[]): string => {
    // 1. Estilos CSS internos para el PDF
    const styles = `
        <style>
            body { font-family: sans-serif; margin: 20px; font-size: 10px; }
            h1 { color: #1f2937; text-align: center; margin-bottom: 20px; }
            .report-date { text-align: center; color: #6b7280; margin-bottom: 30px; font-size: 11px; }
            .user-card { margin-bottom: 15px; border: 1px solid #e5e7eb; border-left: 5px solid #10b981; padding: 10px; border-radius: 5px; }
            .user-header { font-weight: bold; font-size: 14px; color: #1f2937; margin-bottom: 5px; }
            .user-role { font-weight: normal; color: #6b7280; font-size: 11px; }
            .asset-count { font-size: 11px; color: #4b5563; margin-bottom: 8px; }
            .asset-list { margin-left: 10px; }
            .asset-item { margin-bottom: 8px; padding-left: 10px; border-left: 2px solid #9ca3af; }
            .asset-name { font-weight: 600; font-size: 12px; color: #1f2937; }
            .asset-detail, .asset-date { font-size: 10px; color: #4b5563; }
            .empty { color: #9ca3af; text-align: center; font-style: italic; margin-top: 10px; }
            .footer { margin-top: 30px; text-align: center; font-size: 9px; color: #9ca3af; }
        </style>
    `;

    // 2. Mapeo de la data a elementos HTML
    const reportHtml = reportData.map(reportItem => {
        const totalAssigned = reportItem.assignedAssets.length;
        
        // Contenido de los activos
        const assetsHtml = totalAssigned > 0
            ? reportItem.assignedAssets.map((asset: AssignedAssetExtended) => `
                <div class="asset-item">
                    <p class="asset-name">${asset.asset_name} (ID: ${asset.assetId})</p>
                    <p class="asset-detail">SN: ${asset.serial_number || 'N/A'}</p>
                    <p class="asset-date">Asignado desde: ${formatDate(asset.assignedDate)}</p>
                    <p class="asset-detail">Por Admin: ${asset.assignedByAdminName || 'N/A'}</p>
                </div>
              `).join('')
            : '<p class="empty">No tiene activos asignados actualmente.</p>';

        // Tarjeta de usuario
        return `
            <div class="user-card" style="border-left-color: ${totalAssigned > 0 ? '#10b981' : '#6b7280'};">
                <p class="user-header">
                    ${reportItem.user.firstName} ${reportItem.user.lastName} 
                    <span class="user-role">(${reportItem.user.role.toUpperCase()})</span>
                </p>
                <p class="asset-count">${totalAssigned} equipo(s) asignado(s)</p>
                <div class="asset-list">
                    ${assetsHtml}
                </div>
            </div>
        `;
    }).join('');

    // 3. Estructura HTML final
    return `
        <html>
        <head>${styles}</head>
        <body>
            <h1>REPORTE DE ASIGNACIONES ACTUALES</h1>
            <p class="report-date">Generado el: ${formatDate(Date.now())}</p>
            ${reportHtml}
            <div class="footer">
                <p>Sistema de Gestión de Activos - Reporte Confidencial</p>
            </div>
        </body>
        </html>
    `;
};

// -------------------------------------------------------------------
// COMPONENTE INTERNO: Tarjeta de Usuario con Asignaciones (SIN CAMBIOS RELEVANTES)
// -------------------------------------------------------------------

interface UserAssignmentCardProps {
  reportItem: UserAssignmentReport;
}

const UserAssignmentCard: React.FC<UserAssignmentCardProps> = ({ reportItem }) => {
  const [isExpanded, setIsExpanded] = React.useState(false); 
  const totalAssigned = reportItem.assignedAssets.length;
  
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };
  
  const cardColor = totalAssigned > 0 ? '#10b981' : '#6b7280'; 

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
// COMPONENTE PRINCIPAL: AssignmentReportTab (MODIFICADO)
// -------------------------------------------------------------------

const AssignmentReportTab: React.FC = () => {
  // Consumir los hooks
  const { assignmentReport, loadingAssignmentReport } = useReports(); 
  const { generatePdf, loading: loadingPdf, error: pdfError } = usePdfGenerator();

  // 1. Lógica de ordenación (sin cambios)
  const sortedReport = useMemo(() => {
    return [...(assignmentReport ?? [])].sort((a, b) => {
        if (a?.assignedAssets?.length > 0 && b?.assignedAssets?.length === 0) return -1;
        if (a?.assignedAssets?.length === 0 && b?.assignedAssets?.length > 0) return 1;
        return a?.user?.lastName?.localeCompare(b?.user?.lastName);
    });
  }, [assignmentReport]);
  
  // 2. Nueva función para generar el PDF
  const handleGeneratePdf = async () => {
    if (sortedReport.length === 0) {
        Alert.alert('Advertencia', 'No hay datos en el reporte para generar el PDF.');
        return;
    }
    
    // Generar el contenido HTML
    const htmlContent = generateAssignmentHtml(sortedReport);

    // Llamar al hook de generación de PDF
    const result = await generatePdf(htmlContent, `Reporte_Asignaciones_${Date.now()}`);

    if (result && result.filePath) {
        Alert.alert(
            'Éxito', 
            `PDF guardado exitosamente en la carpeta de Descargas`
        );
    } else if (pdfError) {
        Alert.alert('Error', `Fallo al generar el PDF: ${pdfError}`);
    } else {
        Alert.alert('Error', 'Fallo desconocido al generar el PDF.');
    }
  };


  // 3. Renderizado de estado
  if (loadingAssignmentReport || loadingPdf) { // <--- MODIFICADO: Incluir carga de PDF
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>
            {loadingPdf ? 'Generando PDF...' : 'Cargando reporte de asignaciones...'}
        </Text>
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

  // 4. Renderizado de la lista
  return (
    <>
      <Text style={styles.title}>REPORTE DE ASIGNACIONES DE LOS EQUIPOS A USUARIOS</Text>        
      <FlatList
        data={sortedReport}
        renderItem={({ item }) => <UserAssignmentCard reportItem={item} />}
        keyExtractor={item => item.user.uid}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
        {/* MODIFICADO: Botón flotante para la acción de generar PDF */}
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
          onPress={handleGeneratePdf} // <--- LLAMADA A LA FUNCIÓN DE GENERACIÓN
        >
          <Icon name="bar-chart-outline" size={28} color="#fff" />
        </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  // ... (Tus estilos existentes aquí) ...
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    textAlign: 'center',
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