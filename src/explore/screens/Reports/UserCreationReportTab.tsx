import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  SectionList,
  TouchableOpacity, // Usaremos SectionList para agrupar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useReports, UserCreationReport } from '../../../shared/hooks/useReports'; 

// --- Tipado para la SectionList ---
interface CreatorSection {
    title: string; // Nombre del Administrador/Creador
    data: UserCreationReport[]; // Lista de usuarios que creó
}


// -------------------------------------------------------------------
// COMPONENTE INTERNO: UserItem (Ahora solo muestra al usuario creado)
// -------------------------------------------------------------------

interface UserItemProps {
  reportItem: UserCreationReport;
}

// Usamos memo para optimizar la renderización de ítems en la lista
const UserItem: React.FC<UserItemProps> = React.memo(({ reportItem }) => {
  const { user } = reportItem;
  
  // El color indica si el usuario creado es Admin o User
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
        .sort() // Opcional: ordenar los creadores alfabéticamente
        .map(creatorName => ({
            title: creatorName,
            data: groupedMap[creatorName],
        }));

  }, [userCreationReport]);

  // 2. Renderizado de estado de carga
  if (loadingUserCreationReport) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1f2937" />
        <Text style={styles.loadingText}>Calculando reporte de usuarios...</Text>
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
        onPress={() => console.log('Botón presionado')}
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