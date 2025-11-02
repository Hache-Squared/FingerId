import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  SectionList,
  TouchableOpacity,
  Alert, // <--- AGREGADO: Para mostrar mensajes de éxito/error
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Importación del hook y tipos
import { useReports, UserCreationReport } from '../../../shared/hooks/useReports'; 

// Importación del hook de generación de PDF
import { usePdfGenerator } from '../../../shared/hooks/usePdfGenerator'; // <--- AGREGADO: Asegúrate de ajustar la ruta

// --- Tipado para la SectionList ---
interface CreatorSection {
    title: string; // Nombre del Administrador/Creador
    data: UserCreationReport[]; // Lista de usuarios que creó
}

// ===================================================================
// UTILITY: FORMATO DE FECHA
// ===================================================================
const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// ===================================================================
// FUNCIÓN AUXILIAR: GENERACIÓN DE HTML para PDF (NUEVA LÓGICA)
// ===================================================================

/**
 * Genera el string HTML para el reporte de Usuarios Creados en formato de tabla.
 * @param reportData El array de secciones agrupadas (CreatorSection[]).
 */
const generateUserCreationReportHtml = (sections: CreatorSection[]): string => {
    // Definir estilos para el PDF
    const styles = `
        <style>
            body { font-family: sans-serif; margin: 20px; font-size: 10px; }
            h1 { color: #1f2937; text-align: center; margin-bottom: 20px; font-size: 18px; }
            .report-date { text-align: center; color: #6b7280; margin-bottom: 30px; font-size: 11px; }
            
            /* Estilos de Sección (Creador) */
            .section-header { 
                background-color: #e5e7eb; 
                padding: 10px 15px; 
                margin-top: 15px;
                border-bottom: 2px solid #d1d5db;
                font-size: 14px; 
                font-weight: 800;
                color: #1f2937;
                page-break-after: avoid;
            }
            .section-count {
                font-size: 12px;
                font-weight: 500;
                color: #4b5563;
                margin-left: 10px;
            }

            /* Estilos de Tabla */
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; vertical-align: top; }
            th { background-color: #f3f4f6; color: #1f2937; font-weight: 700; font-size: 11px; }
            
            /* Colores de las celdas de Rol */
            .role-admin { background-color: #dbeafe; color: #1e40af; font-weight: 700; }
            .role-user { background-color: #f0fdf4; color: #065f46; font-weight: 700; }
            
            .empty { color: #9ca3af; text-align: center; font-style: italic; padding: 10px; }
        </style>
    `;
    
    // Mapeo de la data agrupada a elementos HTML
    const reportHtml = sections.map(section => {
        const userCount = section.data.length;
        
        // Cabecera de la sección
        let htmlContent = `<h3 class="section-header">${section.title} <span class="section-count">(${userCount} usuario${userCount !== 1 ? 's' : ''} creados)</span></h3>`;

        // Cuerpo de la tabla
        const tableBody = section.data.map(item => `
            <tr>
                <td class="${item.user.role === 'admin' ? 'role-admin' : 'role-user'}">${item.user.role.toUpperCase()}</td>
                <td>${item.user.firstName} ${item.user.lastName}</td>
                <td>${item.user.email}</td>
            </tr>
        `).join('');

        // Estructura de la tabla
        htmlContent += `
            <table>
                <thead>
                    <tr>
                        <th style="width: 15%;">Rol</th>
                        <th style="width: 30%;">Nombre Completo</th>
                        <th style="width: 35%;">Email</th>
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
            <h1>REPORTE DE CREACIÓN DE USUARIOS</h1>
            <p class="report-date">Generado el: ${formatDate(Date.now())}</p>
            ${reportHtml}
            <div style="margin-top: 50px; text-align: center; font-size: 9px; color: #9ca3af;">
                <p>Sistema de Gestión de Activos - Reporte Confidencial</p>
            </div>
        </body>
        </html>
    `;
};


// -------------------------------------------------------------------
// COMPONENTE INTERNO: UserItem (Se mantiene)
// -------------------------------------------------------------------

interface UserItemProps {
  reportItem: UserCreationReport;
}

const UserItem: React.FC<UserItemProps> = React.memo(({ reportItem }) => {
  const { user } = reportItem;
  
  const iconColor = user.role === 'admin' ? '#3b82f6' : '#1f2937';
  
  return (
    <View style={styles.userItemContainer}>
        <Icon 
            name={user.role === 'admin' ? 'person-circle' : 'person-outline'} 
            size={24} 
            color={iconColor} 
        />
        <View style={styles.userNameContainer}>
            <Text style={styles.userName}>
                {user.firstName} {user.lastName} 
                <Text style={styles.userRole}> ({user.role.toUpperCase()})</Text>
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
        </View>
    </View>
  );
});


// -------------------------------------------------------------------
// COMPONENTE PRINCIPAL: UserCreationReportTab (MODIFICADO)
// -------------------------------------------------------------------

const UserCreationReportTab: React.FC = () => {
  // Consumimos el estado pre-calculado y el loading específico
  const { userCreationReport, loadingUserCreationReport } = useReports(); 
  
  // <--- AGREGADO: Integrar hook de PDF --->
  const { generatePdf, loading: loadingPdf, error: pdfError } = usePdfGenerator();

  // 1. AGRUPACIÓN: Transformamos la lista plana en secciones agrupadas
  const groupedReport = useMemo<CreatorSection[]>(() => {
    if (!userCreationReport || userCreationReport.length === 0) return [];
    
    // 1. Agrupar por el nombre del creador (createdByAdminName)
    const groupedMap = userCreationReport.reduce((acc, item) => {
        const creatorName = item.createdByAdminName;
        if (!acc[creatorName]) {
            acc[creatorName] = [];
        }
        acc[creatorName].push(item);
        return acc;
    }, {} as Record<string, UserCreationReport[]>);

    // 2. Convertir el mapa de grupos en un array de secciones para SectionList
    return Object.keys(groupedMap)
        .sort() 
        .map(creatorName => ({
            title: creatorName,
            data: groupedMap[creatorName],
        }));

  }, [userCreationReport]);

    // Función para manejar la generación del PDF
    const handleGeneratePdf = async () => {
        if (groupedReport.length === 0) {
            Alert.alert('Advertencia', 'No hay datos en el reporte para generar el PDF.');
            return;
        }
        
        // Generar el contenido HTML usando la función auxiliar
        const htmlContent = generateUserCreationReportHtml(groupedReport);

        // Llamar al hook de generación de PDF
        const result = await generatePdf(htmlContent, `Reporte_Usuarios_Creados_${Date.now()}`);

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


  // 2. Renderizado de estado de carga
  if (loadingUserCreationReport || loadingPdf) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>
            {loadingPdf ? 'Generando PDF...' : 'Calculando reporte de usuarios...'}
        </Text>
      </View>
    );
  }

  // 3. Renderizado de lista vacía o sin data
  if (groupedReport.length === 0) {
    return (
      <View style={styles.centered}>
        <Icon name="people-circle-outline" size={50} color="#9ca3af" />
        <Text style={styles.emptyText}>No se encontraron usuarios o la información de creación.</Text>
      </View>
    );
  }

  // 4. Renderizado de la SectionList agrupada
  return (
    <View style={styles.container}>
      <Text style={styles.title}>USUARIOS CREADOS POR ADMINISTRADOR</Text>
      <SectionList
        sections={groupedReport}
        keyExtractor={item => item.user.uid}
        renderItem={({ item }) => <UserItem reportItem={item} />}
        renderSectionHeader={({ section: { title, data } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <Text style={styles.sectionCount}>({data.length} usuario{data.length !== 1 ? 's' : ''})</Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        stickySectionHeadersEnabled={true}
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
        onPress={handleGeneratePdf} // <--- LLAMADA A LA FUNCIÓN DE GENERACIÓN
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
  listContainer: {
    paddingBottom: 20,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 45, // Alineado con el contenido del ítem
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
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    textAlign: 'center',
  },

  // --- Estilos de Sección (Creador) ---
  sectionHeader: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#d1d5db',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1f2937',
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
  },

  // --- Estilos de Ítem (Usuario Creado) ---
  userItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    paddingLeft: 15,
    borderLeftWidth: 5,
    borderLeftColor: '#3b82f6', // Color de reporte
  },
  userNameContainer: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4b5563',
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default UserCreationReportTab;