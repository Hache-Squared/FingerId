import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert 
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useUsers } from '../../shared/hooks/useUsers';
// Importación de Hooks y Tipos
import { useMaintenance, MaintenanceStatus, Maintenance } from '../../shared/hooks/useMaintenance';
import { useAssets } from '../../shared/hooks/useAssets';
import { Asset } from '../../types/Asset.types';
import { StackExploreParams } from '../../routes/StackExplore';
import { useUserProfile } from '../../shared/hooks/useUserProfile';

// Tipos para la ruta
type MaintenanceDetailRouteProp = RouteProp<StackExploreParams, 'MaintenanceDetailScreen'>;

// Definición del flujo de estatus y las transiciones
const STATUS_FLOW: Record<MaintenanceStatus, { next?: MaintenanceStatus, text: string, color: string, requiresMessage: boolean }> = {
    'PENDING': { 
        next: 'IN_PROGRESS', 
        text: 'Iniciar Reparación', 
        color: '#4f46e5', 
        requiresMessage: true 
    },
    'IN_PROGRESS': { 
        next: 'FINALIZED', 
        text: 'Finalizar Reparación', 
        color: '#10b981', 
        requiresMessage: true 
    },
    'FINALIZED': { 
        next: 'DELIVERED', 
        text: 'Entregar Activo', 
        color: '#3b82f6', 
        requiresMessage: true 
    },
    'DELIVERED': { 
        text: 'Entregado', 
        color: '#9ca3af', 
        requiresMessage: false 
    },
    'CANCELLED': { 
        text: 'Cancelado', 
        color: '#ef4444', 
        requiresMessage: false 
    },
};

/**
 * Pantalla que muestra los detalles de una solicitud de mantenimiento
 * y permite al administrador cambiar su estatus.
 */
const MaintenanceDetailScreen: React.FC = () => {
    const route = useRoute<MaintenanceDetailRouteProp>();
    const navigation = useNavigation();
    const { maintenanceId } = route.params;
    console.log({
        maintenanceId
    });
    const { userInfo } = useUserProfile(); 
    

    const { getMaintenanceById, updateMaintenanceStatus, loading: loadingMaintenance } = useMaintenance();
    const { getAssetById, loading: loadingAssets } = useAssets();

    const { fetchAllUsers, allUsers, loadingUsers } = useUsers(); 
    
    const [maintenance, setMaintenance] = useState<Maintenance | null>(null);
    const [asset, setAsset] = useState<Asset | null>(null);
    const [statusMessage, setStatusMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isLoading = loadingMaintenance || loadingAssets || isSubmitting;

    // Cargar datos al iniciar
    const loadData = useCallback(async () => {
        const maint = await getMaintenanceById(maintenanceId);
        setMaintenance(maint);
        console.log({
            maint
        });
        
        await fetchAllUsers();

        if (maint) {
            const assetData = await getAssetById(maint.assetId);
            console.log({
                assetData
            });
            setAsset(assetData);
        }
    }, [getMaintenanceById, getAssetById, maintenanceId]);

    const getFullName = (uid: string): string => {
        const user = allUsers.find(u => u.uid === uid);
        return user ? `${user.firstName} ${user.lastName}` : `Usuario Desconocido (${uid})`;
    };

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    // El estatus actual y el siguiente paso en el flujo
    const currentStatus = maintenance?.status;
    const flowData = currentStatus ? STATUS_FLOW[currentStatus] : undefined;
    const nextStatus = flowData?.next;

    // Manejador del cambio de estatus
    const handleStatusChange = useCallback(async () => {
        if (!maintenance || !nextStatus) return;

        const isMessageRequired = flowData?.requiresMessage || false;
        if (isMessageRequired && !statusMessage.trim()) {
            Alert.alert("Mensaje Requerido", "Debe proporcionar un mensaje para avanzar a este estatus.");
            return;
        }

        setIsSubmitting(true);
        try {
            await updateMaintenanceStatus(maintenance.maintenanceId, nextStatus, statusMessage);
            Alert.alert("Éxito", `El estatus ha cambiado a ${nextStatus}.`);
            
            // Limpiar mensaje y recargar datos
            setStatusMessage('');
            await loadData();
            
            // Navegar hacia atrás después de la entrega
            if (nextStatus === 'DELIVERED') {
                navigation.goBack(); 
            }
        } catch (error) {
            console.error("Error al actualizar estatus:", error);
            Alert.alert("Error", "No se pudo actualizar el estatus. Intente de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    }, [maintenance, nextStatus, statusMessage, updateMaintenanceStatus, loadData, flowData, navigation]);
    
    // Renderizado de la información del log
    const renderLog = useMemo(() => {
        if (!maintenance || !maintenance.progressLog) return null;
        
        // Convertir el objeto de logs a un array y ordenar por fecha (clave del objeto)
        const logArray = Object.entries(maintenance.progressLog)
            .map(([key, value]) => ({ 
                timestampKey: key, 
                ...value,
                timestamp: parseInt(key) // Usamos la clave como timestamp
            }))
            .sort((a, b) => b.timestamp - a.timestamp); // Más reciente primero

        return (
            <View style={styles.logContainer}>
                <Text style={styles.sectionTitle}>Historial de Estatus</Text>
                {logArray.map((log) => (
                    <View key={log.timestampKey} style={styles.logItem}>
                        <Text style={styles.logDate}>
                            {new Date(log.timestamp).toLocaleString()}
                        </Text>
                        <Text style={[styles.logStatus, { color: STATUS_FLOW[log.newStatus]?.color || '#000' }]}>
                            {log.newStatus}
                        </Text>
                        <Text style={styles.logMessage}>
                            {log.message}
                        </Text>
                        <Text style={styles.logUser}>
                            UID: {log.performedByUid}
                        </Text>
                    </View>
                ))}
            </View>
        );
    }, [maintenance]);

    if (isLoading && !maintenance) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Cargando detalles de la solicitud...</Text>
            </View>
        );
    }

    if (!maintenance) {
        return (
            <View style={styles.centeredContainer}>
                <Icon name="alert-circle-outline" size={50} color="#ef4444" />
                <Text style={styles.errorText}>Solicitud de mantenimiento no encontrada.</Text>
            </View>
        );
    }
    
    // Determinar si se puede avanzar (no entregado/cancelado)
    const canAdvance = nextStatus !== undefined;
    const showCancelButton = currentStatus !== 'CANCELLED' && currentStatus !== 'DELIVERED';
    
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* SECCIÓN DETALLES DE LA SOLICITUD */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Solicitud ID: {maintenance.maintenanceId}</Text>
                    
                    <Text style={styles.mainTitle}>{maintenance.title}</Text>
                    <Text style={styles.detailText}>
                        <Text style={{fontWeight: '700'}}>Detalles:</Text> {maintenance.details}
                    </Text>
                    <Text style={[styles.statusBadge, { backgroundColor: flowData?.color || '#9ca3af' }]}>
                        ESTATUS ACTUAL: {maintenance.status}
                    </Text>
                </View>

                {/* SECCIÓN DETALLES DEL ACTIVO */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Detalles del Activo</Text>
                    {asset ? (
                        <>
                            <Text style={styles.assetName}>{asset.asset_name}</Text>
                            <Text style={styles.assetDetail}>ID: {asset.assetId}</Text>
                            <Text style={styles.assetDetail}>Serie: {asset.serial_number}</Text>
                            <Text style={styles.assetDetail}>Asignado a: {getFullName(asset?.current_user_uid ?? "") || 'N/A'}</Text>
                        </>
                    ) : (
                        <Text style={styles.loadingText}>Cargando información del activo...</Text>
                    )}
                </View>
                
                {/* SECCIÓN LOG DE PROGRESO */}
                {renderLog}

            </ScrollView>

            {/* BARRA INFERIOR DE ACCIÓN */}
            {
                userInfo?.role === "admin" && (
                <View style={styles.actionBar}>
                    {canAdvance && (
                        <>
                            {/* Input para el mensaje requerido */}
                            {flowData?.requiresMessage && (
                                <TextInput
                                    style={styles.input}
                                    placeholder={`Mensaje para el estatus ${nextStatus}`}
                                    value={statusMessage}
                                    onChangeText={setStatusMessage}
                                    editable={!isSubmitting}
                                />
                            )}
                            
                            {/* Botón de Avance */}
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: flowData?.color }]}
                                onPress={handleStatusChange}
                                disabled={isSubmitting || (flowData?.requiresMessage && !statusMessage.trim())}
                            >
                                <Text style={styles.buttonText}>
                                    {isSubmitting ? 'Cambiando...' : flowData?.text}
                                </Text>
                            </TouchableOpacity>
                        </>
                    )}
                    
                    {/* Botón de Cancelar (si aplica) */}
                    {showCancelButton && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => {
                                // Implementar lógica de modal/confirmación para CANCELLED
                                Alert.alert("Cancelar Solicitud", "¿Está seguro de cancelar esta solicitud?", [
                                    { text: "No" },
                                    { 
                                        text: "Sí, Cancelar", 
                                        onPress: () => {
                                            setStatusMessage('Solicitud cancelada por el administrador.');
                                            updateMaintenanceStatus(maintenance.maintenanceId, 'CANCELLED', 'Solicitud cancelada por el administrador.')
                                                .then(() => loadData())
                                                .catch((e) => Alert.alert("Error", "Fallo al cancelar."));
                                        } 
                                    },
                                ]);
                            }}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    )}
                </View>
                )
            }
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    scrollContent: {
        padding: 16,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#4f46e5',
    },
    errorText: {
        marginTop: 10,
        fontSize: 16,
        color: '#ef4444',
        textAlign: 'center',
    },
    // --- Detalles ---
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4f46e5',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        paddingBottom: 5,
        marginBottom: 10,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1f2937',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 5,
    },
    statusBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        color: '#fff',
        fontWeight: '700',
        marginTop: 10,
        fontSize: 14,
    },
    assetName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    assetDetail: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 2,
    },
    // --- Log ---
    logContainer: {
        marginBottom: 20,
    },
    logItem: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#d1d5db',
    },
    logDate: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'right',
    },
    logStatus: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 3,
    },
    logMessage: {
        fontSize: 14,
        color: '#374151',
        marginTop: 5,
    },
    logUser: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 5,
        fontStyle: 'italic',
    },
    // --- Barra de Acción ---
    actionBar: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
        fontSize: 14,
        color: "#111"
    },
    actionButton: {
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ef4444',
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
    },
});

export { MaintenanceDetailScreen};