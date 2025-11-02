import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator, 
    TouchableOpacity, 
    Alert 
} from 'react-native';

// Importación del hook y tipos de Reportes
import { 
    useReports, 
    AssetMaintenanceGroup, // <--- Tipo de Agrupación para esta pantalla
    MaintenanceExtended,
    MaintenanceLogExtended 
} from '../../../shared/hooks/useReports'; 
import Icon from 'react-native-vector-icons/Ionicons';

// AGREGADO: Importación del hook de generación de PDF
import { usePdfGenerator } from '../../../shared/hooks/usePdfGenerator'; 

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
  if (hours === null || hours === 0) return 'N/A';
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    // Mostrar < 1 min si es casi cero, para evitar "0 min"
    if (minutes === 0) return '< 1 min'; 
    return `${minutes} min`;
  }
  return `${hours.toFixed(1)} hrs`;
};

/**
 * Determina el color principal del estatus para la UI.
 */
const getStatusColor = (status: string): string => {
    switch (status) {
        case 'FINALIZED':
        case 'DELIVERED':
            return '#28a745'; // Verde éxito
        case 'IN_PROGRESS':
            return '#ffc107'; // Amarillo advertencia
        case 'PENDING':
            return '#007AFF'; // Azul primario
        case 'CANCELLED':
            return '#dc3545'; // Rojo peligro
        default:
            return '#6c757d'; // Gris
    }
}


// ===================================================================
// FUNCIÓN AUXILIAR: GENERACIÓN DE HTML para PDF (Implementación)
// ===================================================================

/**
 * Genera el string HTML para la sub-tabla de Logs de un mantenimiento.
 * @param logs Array de logs ya enriquecidos y ordenados.
 */
const generateLogTableHtml = (logs: MaintenanceExtended['logs']): string => { 
    if (!logs || logs.length === 0) {
        return '<p class="log-empty">No se registraron pasos de progreso.</p>';
    }

    const logRows = logs.map(log => `
        <tr>
            <td style="width: 25%;">${formatDate(log.timestamp)}</td>
            <td style="width: 25%;">${log.performedByAdminName || 'Admin/Sistema'}</td> 
            <td style="width: 20%;" class="log-status">${log.newStatus}</td>
            <td style="width: 30%;">${log.message || 'Sin mensaje'}</td>
        </tr>
    `).join('');

    return `
        <table class="log-subtable">
            <thead>
                <tr>
                    <th style="width: 25%;">Fecha/Hora</th>
                    <th style="width: 25%;">Realizado por</th>
                    <th style="width: 20%;">Nuevo Estatus</th>
                    <th style="width: 30%;">Mensaje/Detalle</th>
                </tr>
            </thead>
            <tbody>
                ${logRows}
            </tbody>
        </table>
    `;
};


/**
 * Genera el string HTML para el reporte de Mantenimientos por Activo.
 * @param groups El array de grupos de mant. por activo (AssetMaintenanceGroup[]).
 */
const generateMaintenanceByAssetHtml = (groups: AssetMaintenanceGroup[]): string => {
    // Definir estilos para el PDF
    const styles = `
        <style>
            body { font-family: sans-serif; margin: 20px; font-size: 10px; }
            h1 { color: #1f2937; text-align: center; margin-bottom: 20px; font-size: 18px; }
            .report-date { text-align: center; color: #6b7280; margin-bottom: 30px; font-size: 11px; }
            
            /* Estilos de Sección (Activo) */
            .section-header { 
                background-color: #007AFF; /* Azul primario para activo */
                color: #ffffff; 
                padding: 10px 15px; 
                margin-top: 15px;
                font-size: 14px; 
                font-weight: 800;
                border-radius: 4px 4px 0 0;
                page-break-after: avoid;
            }
            .section-count {
                font-size: 12px;
                font-weight: 500;
                margin-left: 10px;
            }

            /* Estilos de Tabla Principal */
            table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 15px; font-size: 9px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f3f4f6; color: #1f2937; font-weight: 700; font-size: 10px; }
            
            /* Estilos específicos del contenido */
            .status-FINALIZED { background-color: #d1e7dd; color: #0f5132; font-weight: 600; }
            .status-DELIVERED { background-color: #cfe2ff; color: #084298; font-weight: 600; }
            .time { font-weight: 700; }
            
            /* Estilos de Sub-Tabla (Logs) */
            .log-row-container td { 
                padding: 0 !important; 
                background-color: #fafafa;
                border: none;
            }
            .log-subtable {
                width: 100%;
                border-collapse: collapse; 
                margin: 0;
            }
            .log-subtable th {
                background-color: #e6f7ff; 
                color: #004085;
                font-weight: 600;
                font-size: 9px;
                padding: 5px 8px;
                border: 1px solid #cce5ff;
            }
            .log-subtable td {
                font-size: 9px;
                padding: 5px 8px;
                border: 1px solid #e5e7eb;
            }
            .log-status { font-weight: 700; }
            .log-empty { 
                text-align: center; 
                color: #9ca3af; 
                font-style: italic; 
                padding: 10px;
                background-color: #fafafa;
            }

            .row-separator {
              width: 100%;
              height: 15px;
            }
        </style>
    `;
    
    // Mapeo de la data agrupada a elementos HTML
    const reportHtml = groups.map(group => {
        const maintenanceCount = group.maintenanceEntries.length;
        const closedCount = group.maintenanceEntries.filter(e => e.closeDate !== null).length;
        
        // Cabecera de la sección (Activo)
        let htmlContent = `
            <h3 class="section-header">
                ${group.asset.asset_name} (${group.asset.assetId})
                <span class="section-count">(${closedCount}/${maintenanceCount} mantenimientos cerrados)</span>
            </h3>
        `;

        // Cuerpo de la tabla
        const tableBody = group.maintenanceEntries.map(item => { // item es MaintenanceExtended
            const logTableHtml = generateLogTableHtml(item.logs); 
            
            return `
                <tr>
                    <td>${item.performedByAdminName || 'N/A'}</td>
                    <td>${item.maintenanceId}</td>
                    <td>${item.title || item.details || 'Sin título'}</td>
                    <td class="status-${item.status}">${item.status}</td>
                    <td>${formatDate(item.requestDate)}</td>
                    <td>${formatDate(item.closeDate)}</td>
                    <td class="time">${formatTimeInHours(item.totalTimeInHours)}</td>
                </tr>
                <tr class="log-row-container">
                    <td colspan="7">
                        <h4 style="font-size: 10px; font-weight: 700; margin: 5px 0 0 0; padding: 5px 8px; color: #333; border-bottom: 1px solid #e5e7eb;">Registro de Progreso:</h4>
                        ${logTableHtml}
                    </td>
                </tr>
                <tr class="log-row-container">
                    <td colspan="7">
                        <div class="row-separator"></div>
                    </td>
                </tr>
            `;
        }).join('');

        // Estructura de la tabla
        htmlContent += `
            <table>
                <thead>
                    <tr>
                        <th style="width: 18%;">Realizado por</th>
                        <th style="width: 10%;">ID Mant.</th>
                        <th style="width: 25%;">Título/Detalles</th>
                        <th style="width: 10%;">Estatus</th>
                        <th style="width: 12%;">Solicitud</th>
                        <th style="width: 12%;">Cierre</th>
                        <th style="width: 13%;">Tiempo Inv.</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBody}
                </tbody>
            </table>
        `;

        return htmlContent;
    }).join('');

    // Estructura HTML final
    return `
        <html>
        <head>${styles}</head>
        <body>
            <h1>REPORTE DE MANTENIMIENTOS POR EQUIPO</h1>
            <p class="report-date">Generado el: ${formatDate(Date.now())}</p>
            ${reportHtml}
            <div style="margin-top: 50px; text-align: center; font-size: 9px; color: #9ca3af;">
                <p>Sistema de Gestión de Activos - Reporte Confidencial</p>
            </div>
        </body>
        </html>
    `;
};


// --- COMPONENTE: UN SOLO MANTENIMIENTO (VISTA UI) ---

interface MaintenanceEntryProps {
  entry: MaintenanceExtended;
}

const MaintenanceEntry: React.FC<MaintenanceEntryProps> = ({ entry }) => {
    const statusColor = getStatusColor(entry?.status ?? '');

  return (
    <View style={maintenanceStyles.card}>
      {/* Barra de Estatus Lateral para destacar */}
      <View style={[maintenanceStyles.statusIndicator, { backgroundColor: statusColor }]} />
      
      <Text style={maintenanceStyles.maintenanceTitle}>{entry?.title ?? "Mantenimiento sin título"}</Text>
      
      {/* Resumen */}
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Estatus Actual:</Text>
        <Text style={[maintenanceStyles.summaryValue, { color: statusColor, fontWeight: 'bold' }]}>{entry?.status ?? ""}</Text>
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
        <Text style={maintenanceStyles.summaryValue}>{entry?.requestedBy ?? "N/A"}</Text>
      </View>
      <View style={maintenanceStyles.summaryRow}>
        <Text style={maintenanceStyles.summaryText}>Cerrado por:</Text>
        <Text style={maintenanceStyles.summaryValue}>{entry?.performedByAdminName ?? "Pendiente"}</Text>
      </View>

      {/* Historial de Estatus (Logs) */}
      {entry.logs.length > 0 && (
        <View>
            <Text style={maintenanceStyles.historyTitle}>Historial de Estatus:</Text>
            {entry.logs.map((log: MaintenanceLogExtended, index: number) => (
            <View key={index} style={maintenanceStyles.logRow}>
                <Text style={[maintenanceStyles.logStatus, { color: getStatusColor(log?.newStatus ?? '') }]}>
                    {/* Añadimos un pequeño icono para el flujo de estado */}
                    <Icon name="chevron-forward-outline" size={10} color={getStatusColor(log?.newStatus ?? '')} /> {log?.newStatus ?? ""}
                </Text>
                <Text style={maintenanceStyles.logAdmin}>
                    {log?.performedByAdminName ?? "Sistema"}
                </Text>
                <Text style={maintenanceStyles.logTime}>{formatDate(log?.timestamp)}</Text>
            </View>
            ))}
        </View>
      )}
    </View>
  );
};

// --- COMPONENTE: GRUPO DE ACTIVO (VISTA UI) ---

interface AssetGroupProps {
  assetGroup: AssetMaintenanceGroup;
}

const AssetGroup: React.FC<AssetGroupProps> = ({ assetGroup }) => {
    // Solo renderizar si tiene mantenimientos
    if (assetGroup.maintenanceEntries.length === 0) return null;
    
    // Contar mantenimientos cerrados
    const closedCount = assetGroup.maintenanceEntries.filter(
        // Un mantenimiento se considera "cerrado" si tiene una fecha de cierre
        e => e.closeDate !== null
    ).length;

    return (
        <View style={assetGroupStyles.groupContainer}>
            <View style={assetGroupStyles.headerRow}>
                <Text style={assetGroupStyles.assetName}>
                    {assetGroup?.asset?.asset_name ?? "Activo Desconocido"}
                </Text>
                <Text style={assetGroupStyles.maintenanceCount}>
                    {closedCount}/{assetGroup.maintenanceEntries.length} Cerrados
                </Text>
            </View>
            <Text style={assetGroupStyles.assetIdText}>ID: {assetGroup?.asset?.assetId ?? "N/A"}</Text>
            
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
  
  // AGREGADO: Integrar hook de PDF
  const { generatePdf, loading: loadingPdf, error: pdfError } = usePdfGenerator();

  // Estado local para manejar la carga del reporte PDF (el hook de PDF ya tiene uno, lo usamos)
  const isGenerating = loadingPdf;
  
  // 2. Filtrar grupos que tengan mantenimientos para evitar mostrar activos sin historial
  const groupsWithMaintenance = maintenanceReportByAssetGroup.filter(
    group => group.maintenanceEntries.length > 0
  );
  
  // Función para manejar la generación del PDF
  const handleGeneratePdf = async () => {
    if (groupsWithMaintenance.length === 0) {
        Alert.alert('Advertencia', 'No hay datos de mantenimientos para generar el PDF.');
        return;
    }
    
    // Generar el contenido HTML usando la función auxiliar
    const htmlContent = generateMaintenanceByAssetHtml(groupsWithMaintenance);

    // Llamar al hook de generación de PDF
    const result = await generatePdf(htmlContent, `Reporte_Mantenimientos_Activo_${Date.now()}`);

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


  if (loadingMaintenanceReportByAssetGroup || isGenerating) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#130f40" />
        <Text style={styles.loadingText}>
            {isGenerating ? 'Generando PDF...' : 'Cargando Reporte de Mantenimiento por Equipo...'}
        </Text>
      </View>
    );
  }

  // Si no hay datos después de cargar
  if (groupsWithMaintenance.length === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.title}>REPORTE DE MANTENIMIENTOS POR EQUIPO</Text>
        <Text style={styles.placeholder}>No se encontraron mantenimientos registrados en ningún activo.</Text>
      </View>
    );
  }


  return (
    <>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>REPORTE DE MANTENIMIENTOS POR EQUIPO</Text>
        <Text style={styles.subtitle}>Historial detallado agrupado por activo.</Text>
        
        {groupsWithMaintenance.map((assetGroup) => (
          <AssetGroup 
              key={assetGroup.asset.assetId} 
              assetGroup={assetGroup} 
          />
        ))}
        
        <View style={{ height: 80 }} /> 
      </ScrollView>
      <TouchableOpacity
        style={[styles.floatingButton, isGenerating && styles.floatingButtonDisabled]}
        onPress={handleGeneratePdf}
        disabled={isGenerating || groupsWithMaintenance.length === 0}
      >
        {isGenerating ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="bar-chart-outline" size={28} color="#fff" />
        )}
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
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 5,
    color: '#130f40', 
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
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
  },
  floatingButton: {
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  floatingButtonDisabled: {
      backgroundColor: '#999',
  }
});

const assetGroupStyles = StyleSheet.create({
    groupContainer: {
        marginBottom: 25,
        padding: 15,
        backgroundColor: '#ffffff',
        borderRadius: 12, 
        borderLeftWidth: 6,
        borderLeftColor: '#007AFF', 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    assetName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        flexShrink: 1, 
    },
    assetIdText: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    maintenanceCount: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
        marginLeft: 10,
    }
});

const maintenanceStyles = StyleSheet.create({
    card: {
        marginTop: 12,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        position: 'relative',
        overflow: 'hidden', 
    },
    statusIndicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 4, 
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    maintenanceTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
        color: '#333',
        marginLeft: 8, 
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
        paddingHorizontal: 8,
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
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 5,
        color: '#333',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        paddingTop: 8,
        paddingHorizontal: 8,
    },
    logRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        paddingHorizontal: 8,
    },
    logStatus: {
        fontSize: 12,
        fontWeight: '700',
        marginRight: 8,
        width: 110, 
    },
    logAdmin: {
        fontSize: 12,
        color: '#888',
        marginRight: 8,
        flex: 1,
    },
    logTime: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        width: 90, 
        textAlign: 'right',
    }
});

export default MaintenanceByAssetReportTab;