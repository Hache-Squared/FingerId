import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    ActivityIndicator, 
    TouchableOpacity, 
    Alert, 
} from 'react-native';

// Importación del hook y tipos de Reportes
import { 
    useReports, 
    PerformerMaintenanceGroup,
    MaintenanceExtended, 
    MaintenanceLogExtended, 
} from '../../../shared/hooks/useReports'; 
import Icon from 'react-native-vector-icons/Ionicons';

// Importación del hook de generación de PDF
import { usePdfGenerator } from '../../../shared/hooks/usePdfGenerator'; 

// --- UTILERÍAS DE FORMATO ---

/**
 * Formatea un timestamp a una fecha y hora legible.
 */
const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return 'N/A';
  // Usamos es-ES para el formato de fecha y hora local
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

/**
 * Determina el color principal del estatus para la UI. (AGREGADA)
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
// FUNCIÓN AUXILIAR: GENERACIÓN DE HTML para PDF (SIN CAMBIOS REQUERIDOS)
// ===================================================================

/**
 * Genera el string HTML para la sub-tabla de Logs de un mantenimiento.
 * @param logs Array de logs ya enriquecidos y ordenados.
 */
const generateLogTableHtml = (logs: MaintenanceExtended['logs']): string => {
    // Check if the log is empty or null
    if (!logs || logs.length === 0) {
        return '<p class="log-empty">No se registraron pasos de progreso.</p>';
    }

    // Los logs ya están ordenados y enriquecidos desde el hook.
    const logRows = logs.map(log => `
        <tr>
            <td style="width: 25%;">${formatDate(log.timestamp)}</td>
            <td style="width: 25%;">${log.performedByAdminName || 'Admin/Sistema'}</td> 
            <td style="width: 20%;" class="log-status">${log.newStatus}</td>
            <td style="width: 30%;">${log.message}</td>
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
 * Genera el string HTML para el reporte de Mantenimientos por Ejecutor.
 * @param reportData El array de grupos de mant. por ejecutor (PerformerMaintenanceGroup[]).
 */
const generateMaintenanceByPerformerHtml = (groups: PerformerMaintenanceGroup[]): string => {
    // Definir estilos para el PDF
    const styles = `
        <style>
            body { font-family: sans-serif; margin: 20px; font-size: 10px; }
            h1 { color: #1f2937; text-align: center; margin-bottom: 20px; font-size: 18px; }
            .report-date { text-align: center; color: #6b7280; margin-bottom: 30px; font-size: 11px; }
            
            /* Estilos de Sección (Ejecutor) */
            .section-header { 
                background-color: #f7931e;
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
            /* Se deben agregar más clases de estatus aquí si se quieren colores específicos */
            .time { font-weight: 700; }
            
            /* Estilos de Sub-Tabla (Logs) - NUEVOS */
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
        const maintenanceCount = group.performedMaintenances.length;
        
        // Cabecera de la sección (Ejecutor)
        let htmlContent = `
            <h3 class="section-header">
                ${group.performerName} 
                <span class="section-count">(${maintenanceCount} mantenimientos completados)</span>
            </h3>
        `;

        // Cuerpo de la tabla
        const tableBody = group.performedMaintenances.map(item => { // item ahora es MaintenanceExtended
            const logTableHtml = generateLogTableHtml(item.logs); // <--- Usa el array de logs
            
            // Log Table is displayed in a row that spans all 7 columns
            return `
                <tr>
                    <td>${item.assetName} (${item.assetId})</td>
                    <td>${item.maintenanceId}</td>
                    <td>${item.details}</td>
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
                        <th style="width: 18%;">Activo</th>
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
            <h1>REPORTE DE MANTENIMIENTOS POR EJECUTOR</h1>
            <p class="report-date">Generado el: ${formatDate(Date.now())}</p>
            ${reportHtml}
            <div style="margin-top: 50px; text-align: center; font-size: 9px; color: #9ca3af;">
                <p>Sistema de Gestión de Activos - Reporte Confidencial</p>
            </div>
        </body>
        </html>
    `;
};


// --- COMPONENTE: UN SOLO MANTENIMIENTO (Versión Enriched) ---

interface MaintenanceEntryProps {
  entry: MaintenanceExtended; // <--- MODIFICADO
}

const MaintenanceEntry: React.FC<MaintenanceEntryProps> = ({ entry }) => {
  // AGREGADO: Obtener el color del estatus para la UI
  const statusColor = getStatusColor(entry?.status ?? '');
    
  return (
    // MODIFICADO: Añadir estilos para el indicador lateral
    <View style={[maintenanceStyles.card, { overflow: 'hidden', position: 'relative' }]}>
        {/* AGREGADO: Barra de Estatus Lateral para destacar */}
        <View style={[maintenanceStyles.statusIndicator, { backgroundColor: statusColor }]} />
        
        {/* MODIFICADO: Añadir marginLeft para evitar que el texto esté debajo de la barra */}
        <Text style={[maintenanceStyles.maintenanceTitle, {marginLeft: 8}]}> 
            {/* Usamos assetName que ya está en MaintenanceExtended */}
            {entry?.assetName ?? "Activo Desconocido"} ({entry?.assetId ?? "N/A"})
        </Text>
        
        <View style={maintenanceStyles.summaryRow}>
            <Text style={maintenanceStyles.summaryText}>Título:</Text>
            <Text style={maintenanceStyles.summaryValue}>{entry?.details ?? ""}</Text>
        </View>
        <View style={maintenanceStyles.summaryRow}>
            <Text style={maintenanceStyles.summaryText}>Estatus de Cierre:</Text>
            {/* MODIFICADO: Aplicar color al estatus */}
            <Text 
                style={[
                    maintenanceStyles.summaryValue, 
                    { color: statusColor, fontWeight: 'bold' } 
                ]}
            >
                {entry?.status ?? ""}
            </Text>
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

  // <--- AGREGADO: Integrar hook de PDF --->
  const { generatePdf, loading: loadingPdf, error: pdfError } = usePdfGenerator();
  
  // 2. Filtrar grupos que tengan mantenimientos cerrados
  const groupsWithMaintenance = maintenanceReportByPerformerGroup.filter(
    group => group.performedMaintenances.length > 0
  );

  // Función para manejar la generación del PDF
  const handleGeneratePdf = async () => {
    if (groupsWithMaintenance.length === 0) {
        Alert.alert('Advertencia', 'No hay datos de mantenimientos completados para generar el PDF.');
        return;
    }
    
    // Generar el contenido HTML usando la función auxiliar
    const htmlContent = generateMaintenanceByPerformerHtml(groupsWithMaintenance);

    // Llamar al hook de generación de PDF
    const result = await generatePdf(htmlContent, `Reporte_Mantenimientos_Ejecutor_${Date.now()}`);

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


  if (loadingMaintenanceReportByPerformerGroup || loadingPdf) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>
            {loadingPdf ? 'Generando PDF...' : 'Cargando Reporte de Mantenimiento por Administrador...'}
        </Text>
      </View>
    );
  }
  
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
        onPress={handleGeneratePdf} 
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
        // MODIFICADO: Para soportar el indicador lateral
        position: 'relative',
        overflow: 'hidden',
    },
    // AGREGADO: Estilo para el indicador de estatus lateral
    statusIndicator: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: 4, 
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
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