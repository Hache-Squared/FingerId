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
  Alert, // Para mostrar mensajes de éxito/error
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Importación del hook y tipos
import { useReports, AssetLogReport } from '../../../shared/hooks/useReports'; 
import { AssetLogEntry } from '../../../types/Asset.types'; 

// Importación del hook de generación de PDF
import { usePdfGenerator } from '../../../shared/hooks/usePdfGenerator'; // Asegúrate de ajustar la ruta

// Habilitar LayoutAnimation
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ===================================================================
// UTILITY: FORMATO DE FECHA (Se mantiene)
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

// ===================================================================
// FUNCIÓN AUXILIAR: GENERACIÓN DE HTML para PDF (MODIFICADA A TABLA)
// ===================================================================

/**
 * Genera el string HTML para el reporte de Logs de Activos usando tablas.
 */
const generateAssetLogHtml = (reportData: AssetLogReport[]): string => {
    // Definir estilos para el PDF, enfocados en tablas
    const styles = `
        <style>
            body { font-family: sans-serif; margin: 20px; font-size: 10px; }
            h1 { color: #1f2937; text-align: center; margin-bottom: 20px; font-size: 18px; }
            .report-date { text-align: center; color: #6b7280; margin-bottom: 30px; font-size: 11px; }
            
            /* Estilos de Tarjeta de Activo */
            .asset-card { margin-bottom: 30px; border: 1px solid #e5e7eb; border-left: 5px solid #1f2937; padding: 15px; border-radius: 5px; page-break-inside: avoid; }
            .asset-name { font-weight: bold; font-size: 14px; color: #1f2937; margin-bottom: 3px; }
            .asset-detail { font-size: 11px; color: #6b7280; }
            .assignment-status { font-size: 12px; font-weight: 600; padding: 5px 0; border-bottom: 1px solid #e5e7eb; margin: 10px 0 15px 0; }
            
            /* Estilos de Tabla de Logs */
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f3f4f6; color: #1f2937; font-weight: 700; font-size: 11px; }
            
            /* Colores de las celdas de Acción */
            .action-assigned { background-color: #d1fae5; color: #065f46; font-weight: 700; }
            .action-unassigned { background-color: #fef3c7; color: #92400e; font-weight: 700; }
            .action-maintenance { background-color: #dbeafe; color: #1e40af; font-weight: 700; }
            .action-created { background-color: #ede9fe; color: #5b21b6; font-weight: 700; }
            
            .empty { color: #9ca3af; text-align: center; font-style: italic; padding: 10px; border: 1px solid #e5e7eb; }
        </style>
    `;
    
    // Función para obtener la clase CSS basada en la acción
    const logActionToClass = (action: string) => {
        switch (action) {
            case 'ASSIGNED': return 'action-assigned';
            case 'UNASSIGNED': return 'action-unassigned';
            case 'MAINTENANCE': return 'action-maintenance';
            case 'CREATED': return 'action-created';
            default: return '';
        }
    };

    // Mapeo de la data a elementos HTML
    const reportHtml = reportData.map(report => {
        const logCount = report.logs.length;
        const assignedColor = report.asset.is_assigned ? '#10b981' : '#f59e0b';
        
        // Contenido de la tabla de Logs
        const logsTableBody = logCount > 0
            ? report.logs.map((log: AssetLogEntry) => `
                <tr>
                    <td>${formatDateAndTime(log.timestamp)}</td>
                    <td class="${logActionToClass(log.action)}">${log.action.replace('_', ' ')}</td>
                    <td>${log.details}</td>
                </tr>
              `).join('')
            : `<tr><td colspan="3" class="empty">No hay historial de logs para mostrar.</td></tr>`;

        // Estructura de la tabla completa
        const logsHtml = `
            <table>
                <thead>
                    <tr>
                        <th style="width: 25%;">Fecha y Hora</th>
                        <th style="width: 20%;">Acción</th>
                        <th style="width: 55%;">Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    ${logsTableBody}
                </tbody>
            </table>
        `;

        // Tarjeta de Activo
        return `
            <div class="asset-card" style="border-left-color: ${assignedColor};">
                <p class="asset-name">
                    ${report.asset.asset_name}
                </p>
                <p class="asset-detail">ID: ${report.asset.assetId} | SN: ${report.asset.serial_number || 'N/A'}</p>
                
                <p class="assignment-status">
                    ${report.asset.is_assigned 
                        ? `Asignado a: ${report.currentAssigneeName || 'N/A'}` 
                        : 'Actualmente sin asignar'}
                </p>
                
                ${logsHtml}
            </div>
        `;
    }).join('');

    // Estructura HTML final
    return `
        <html>
        <head>${styles}</head>
        <body>
            <h1>REPORTE DE LOG DE TODOS LOS EQUIPOS</h1>
            <p class="report-date">Generado el: ${formatDateAndTime(Date.now())}</p>
            ${reportHtml}
            <div style="margin-top: 50px; text-align: center; font-size: 9px; color: #9ca3af;">
                <p>Sistema de Gestión de Activos - Reporte Confidencial</p>
            </div>
        </body>
        </html>
    `;
};


// -------------------------------------------------------------------
// COMPONENTE INTERNO: LogItem (Se mantiene)
// -------------------------------------------------------------------
// ... (El componente LogItem se mantiene sin cambios) ...
interface LogItemProps {
    log: AssetLogEntry;
}

const LogItem: React.FC<LogItemProps> = React.memo(({ log }) => {
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
                <Text style={styles.logMessage}>{log.details}</Text> 
            </View>
        </View>
    );
});


// -------------------------------------------------------------------
// COMPONENTE INTERNO: AssetLogCard (Se mantiene)
// -------------------------------------------------------------------
// ... (El componente AssetLogCard se mantiene sin cambios) ...
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
// COMPONENTE PRINCIPAL: AssetLogReportTab (Se mantiene la lógica de PDF)
// -------------------------------------------------------------------

const AssetLogReportTab: React.FC = () => {
  // Consumimos el estado de todos los logs pre-calculados
  const { 
    allAssetLogReports, 
    loadingAllAssetLogReports,
  } = useReports(); 
  
  // Integrar hook de PDF
  const { generatePdf, loading: loadingPdf, error: pdfError } = usePdfGenerator();
  
  // Función para manejar la generación del PDF
  const handleGeneratePdf = async () => {
    if (allAssetLogReports.length === 0) {
        Alert.alert('Advertencia', 'No hay datos en el reporte para generar el PDF.');
        return;
    }
    
    // Generar el contenido HTML usando la función auxiliar (MODIFICADA ARRIBA)
    const htmlContent = generateAssetLogHtml(allAssetLogReports);

    // Llamar al hook de generación de PDF
    const result = await generatePdf(htmlContent, `Log_Equipos_${Date.now()}`);

    if (result && result.filePath) {
        Alert.alert(
            'Éxito', 
            `PDF guardado exitosamente en la carpeta de Descargas/Documentos: ${result.filePath}`
        );
    } else if (pdfError) {
        Alert.alert('Error', `Fallo al generar el PDF: ${pdfError}`);
    } else {
        Alert.alert('Error', 'Fallo desconocido al generar el PDF.');
    }
  };


  // 1. Renderizado de carga (MODIFICADO para incluir loadingPdf)
  if (loadingAllAssetLogReports || loadingPdf) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>
            {loadingPdf ? 'Generando PDF...' : 'Cargando logs de activos...'}
        </Text>
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
        onPress={handleGeneratePdf} // LLAMADA A LA FUNCIÓN DE GENERACIÓN
      >
        <Icon name="bar-chart-outline" size={28} color="#fff" />
      </TouchableOpacity>
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