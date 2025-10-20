import { useEffect, useState, useMemo } from 'react';
import { useAssets } from './useAssets';
import { useUsers, UserProfileData } from './useUsers';
import { useMaintenance, Maintenance, MaintenanceStatus } from './useMaintenance';
// Modificado: Importar también el hook de asignaciones
import { useAssignments } from './useAssignments'; 
// Modificado: Importar también el tipo Assignment para usarlo en generateAssignmentReport
import { Asset, AssetLogEntry, Assignment } from '../../types/Asset.types';

// ==========================================================
// --- INTERFACES DE SALIDA (Data Estructurada para UI) ---
// ==========================================================

// 1. REPORTE DE ASIGNACIONES ACTUALES
export interface AssignedAssetExtended extends Asset {
    assignedDate: number; // FECHA DE ASIGNACIÓN AÑADIDA
    assignedByAdminName: string; // <--- AGREGADO: Nombre del admin que asignó
}

export interface UserAssignmentReport {
    user: UserProfileData;
    assignedAssets: AssignedAssetExtended[]; // Usamos el tipo extendido
}

// 2. REPORTE DE LOG DE EQUIPO (GLOBAL)
// Estructura simplificada para el reporte de todos los logs
export interface AssetLogReport {
    asset: Asset;
    currentAssigneeName: string; // Nombre completo del usuario asignado
    logs: AssetLogEntry[];
}
// Reporte global es un array de AssetLogReport

// 3. REPORTE DE CREACIÓN DE USUARIOS
export interface UserCreationReport {
    user: UserProfileData;
    createdByAdminName: string; // Nombre completo del administrador que lo creó
}

// 4 & 5. REPORTE DE MANTENIMIENTOS ENRIQUECIDO (ORIGINAL)
// NOTA: No agregamos el progressLog aquí para mantener compatibilidad con reportes 4 y 5
export interface EnrichedMaintenanceReport {
    maintenanceId: string;
    assetName: string; // Nombre del equipo
    assetId: string;
    adminName: string; // Nombre del administrador que cerró el último estatus
    status: MaintenanceStatus;
    requestDate: number; // Timestamp de inicio
    closeDate: number | null; // Timestamp de cierre (FINALIZED, DELIVERED, CANCELLED)
    totalTimeInHours: number | null; // Tiempo total en horas (cierre - inicio)
    details: string;
    requestedBy: string;
}
// Reporte global de mantenimiento es un array de EnrichedMaintenanceReport


// ==========================================================
// --- INTERFACES AGREGADAS PARA REPORTE AGRUPADO POR ACTIVO (Reporte 6) ---
// ==========================================================

// Log de Progreso Enriquecido (para el componente de detalle)
export interface MaintenanceLogExtended {
    timestamp: number;
    message: string;
    newStatus: MaintenanceStatus;
    performedByUid: string;
    performedByAdminName: string; // Nombre completo del Admin que realizó la acción
}

// Mantenimiento Enriquecido extendido con logs para la UI
export interface MaintenanceExtended {
    assetName: string; // <--- AGREGAR: Nombre del equipo
    assetId: string;
    maintenanceId: string;
    title: string; // Título del mantenimiento
    status: MaintenanceStatus;
    performedByAdminName: string; // Nombre del admin que cerró (o "Pendiente")
    requestedBy: string;
    requestDate: number; // Timestamp de inicio
    closeDate: number | null; // Timestamp de cierre
    totalTimeInHours: number | null; // Tiempo total en horas
    details: string;
    logs: MaintenanceLogExtended[]; // Logs detallados
}

// Reporte Agrupado por Activo (la estructura final)
export interface AssetMaintenanceGroup {
    asset: Asset;
    maintenanceEntries: MaintenanceExtended[];
}


// ==========================================================
// --- INTERFACES AGREGADAS PARA REPORTE AGRUPADO POR PERFORMER (Reporte 7) ---
// ==========================================================

// MODIFICADO: Usamos MaintenanceExtended que ya contiene todos los datos enriquecidos y logs.
export interface PerformerMaintenanceGroup {
    performerName: string; // Nombre del Administrador/Usuario que cerró el mantenimiento
    performedMaintenances: MaintenanceExtended[]; // <--- MODIFICADO
}


/**
 * Hook centralizado para generar todos los reportes, orquestando
 * la data de Assets, Users y Maintenance.
 */
export const useReports = () => {
    // Hooks de data fuente
    const { fetchAllUsers, allUsers } = useUsers();
    // NOTA: 'loadAssets' en useAssets usa la lista 'assets' como dependencia interna si no se llama.
    const { loadAssets, assets, loading: loadingAssets } = useAssets(); 
    const { fetchAllMaintenance, loading: loadingMaintenance } = useMaintenance();
    const { fetchAllAssignments, assignments, loading: loadingAssignments } = useAssignments(); // <--- AGREGADO: Obtener data de asignaciones

    // === ESTADOS INTERNOS PARA CADA REPORTE GLOBAL (EXISTENTES) ===
    const [assignmentReport, setAssignmentReport] = useState<UserAssignmentReport[]>([]);
    const [allAssetLogReports, setAllAssetLogReports] = useState<AssetLogReport[]>([]);
    const [userCreationReport, setUserCreationReport] = useState<UserCreationReport[]>([]);
    const [allAssetMaintenanceReports, setAllAssetMaintenanceReports] = useState<EnrichedMaintenanceReport[]>([]);
    const [maintenanceReportByAdmin, setMaintenanceReportByAdmin] = useState<Record<string, EnrichedMaintenanceReport[]>>({});
    
    // === NUEVOS ESTADOS AGREGADOS (Reportes 6 y 7) ===
    const [maintenanceReportByAssetGroup, setMaintenanceReportByAssetGroup] = useState<AssetMaintenanceGroup[]>([]);
    const [maintenanceReportByPerformerGroup, setMaintenanceReportByPerformerGroup] = useState<PerformerMaintenanceGroup[]>([]); // REPORTE 7
    
    // === ESTADOS DE CARGA (EXISTENTES) ===
    const [loadingAssignmentReport, setLoadingAssignmentReport] = useState(true);
    const [loadingAllAssetLogReports, setLoadingAllAssetLogReports] = useState(true);
    const [loadingUserCreationReport, setLoadingUserCreationReport] = useState(true);
    const [loadingAllMaintenanceReports, setLoadingAllMaintenanceReports] = useState(true);
    const [loadingMaintenanceReportByAdmin, setLoadingMaintenanceReportByAdmin] = useState(true);

    // === NUEVOS ESTADOS DE CARGA AGREGADOS (Reportes 6 y 7) ===
    const [loadingMaintenanceReportByAssetGroup, setLoadingMaintenanceReportByAssetGroup] = useState(true);
    const [loadingMaintenanceReportByPerformerGroup, setLoadingMaintenanceReportByPerformerGroup] = useState(true); // REPORTE 7
    
    // Bandera para saber si la data base (users/assets/assignments) ya está lista
    const baseDataReady = allUsers.length > 0 && assets.length > 0 && assignments.length > 0; // <--- MODIFICADO: Incluir assignments

    /**
     * Función interna de utilidad para precargar toda la data necesaria.
     */
    const loadDependencies = async () => {
        try {
            if (allUsers.length === 0) {
                await fetchAllUsers();
            }
            if (assets.length === 0) {
                // Forzamos la carga de todos los assets (null, true)
                await (loadAssets as any)(null, true);
            }
            if (assignments.length === 0) { // <--- AGREGADO: Cargar asignaciones
                await fetchAllAssignments();
            }
        } catch(e) {
            console.error("Error initial loading for reports:", e);
        }
    };
    
    /**
     * Devuelve el nombre completo del usuario a partir de su UID.
     */
    const getFullName = (uid: string): string => {
        const user = allUsers.find(u => u.uid === uid);
        return user ? `${user.firstName} ${user.lastName}` : `Usuario Desconocido (${uid})`;
    };

    /**
     * Utilidad para calcular el tiempo entre dos timestamps en horas.
     */
    const calculateTimeInHours = (start: number, end: number): number => {
        const diffMs = end - start;
        return diffMs / (1000 * 60 * 60);
    };

    // ==========================================================
    // --- 1. FUNCIÓN DE CÁLCULO: REPORTE DE ASIGNACIONES (MODIFICADO) ---
    // ==========================================================
    const generateAssignmentReport = (
        users: UserProfileData[], 
        allAssets: Asset[],
        allAssignments: Assignment[] // <--- MODIFICADO: Aceptar allAssignments
    ): UserAssignmentReport[] => {
        
        // 1. Crear un mapa de asignaciones (AssetId -> Assignment) para fácil acceso
        const assignmentMap = allAssignments.reduce((acc, a) => {
            if (a.assetId) {
                acc[a.assetId] = a;
            }
            return acc;
        }, {} as Record<string, Assignment>);
        
        // 2. Agrupar los assets por el UID del usuario asignado
        const assignedAssetsMap = allAssets
            .filter(a => a.is_assigned && a.current_user_uid)
            .reduce((acc, asset) => {
                const uid = asset.current_user_uid!;
                if (!acc[uid]) acc[uid] = [];
                
                // Buscar la fecha de asignación en logs (Lógica existente)
                const assignmentLog = asset.logs?.find(log => log.action === 'ASSIGNED');
                const assignedDate = assignmentLog ? assignmentLog.timestamp : 0; 

                // OBTENER EL NOMBRE DEL ADMINISTRADOR QUE ASIGNÓ USANDO EL MAPA
                const assignmentData = assignmentMap[asset.assetId];
                const assignedByAdminName = assignmentData?.assignedFrom 
                    ? getFullName(assignmentData.assignedFrom) // Usar assignedFrom
                    : 'Desconocido/Sistema'; // Fallback si no está el dato en la colección de asignaciones
                
                acc[uid].push({
                    ...asset,
                    assignedDate,
                    assignedByAdminName, // <--- AGREGADO: Nombre del admin
                } as AssignedAssetExtended);
                return acc;
            }, {} as Record<string, AssignedAssetExtended[]>);

        // 3. Generar el reporte para todos los usuarios
        return users.map(user => ({
            user,
            assignedAssets: assignedAssetsMap[user.uid] || [],
        }));
    };
    
    // ==========================================================
    // --- 2. FUNCIÓN DE CÁLCULO: REPORTE DE LOG DE TODOS LOS EQUIPOS (ORIGINAL) ---
    // ==========================================================
    const generateAllAssetLogReports = (allAssets: Asset[]): AssetLogReport[] => {
        // ... (Lógica original de generateAllAssetLogReports)
        return allAssets.map(asset => {
            const currentAssigneeName = asset.current_user_uid
                ? getFullName(asset.current_user_uid)
                : 'Nadie';
            
            return {
                asset,
                currentAssigneeName,
                // Logs ordenados cronológicamente inverso
                logs: (asset?.logs ?? [])?.sort((a, b) => b.timestamp - a.timestamp), 
            };
        });
    };

    // ==========================================================
    // --- 3. FUNCIÓN DE CÁLCULO: REPORTE DE CREACIÓN DE USUARIOS (ORIGINAL) ---
    // ==========================================================
    const generateUserCreationReport = (users: UserProfileData[]): UserCreationReport[] => {
        // ... (Lógica original de generateUserCreationReport)
        return users
            .filter(u => u.createdByUid) 
            .map(user => {
                const createdByUid = user.createdByUid || 'SYSTEM_UNAUTH'; 
                const createdByAdminName = getFullName(createdByUid);
                
                return {
                    user,
                    createdByAdminName: createdByAdminName === `Usuario Desconocido (${createdByUid})` 
                        ? 'Sistema/Admin Inicial' 
                        : createdByAdminName,
                };
            })
            .sort((a, b) => (a.createdByAdminName > b.createdByAdminName ? 1 : -1));
    };

    // ==========================================================
    // --- 4 & 5. AUXILIAR: ENRIQUECIMIENTO DE MANTENIMIENTOS (ORIGINAL) ---
    // ==========================================================
    const enrichMaintenanceData = (
        maintenanceList: Maintenance[], 
        assetsList: Asset[]
    ): EnrichedMaintenanceReport[] => {
        // ... (Lógica original de enrichMaintenanceData)
        return maintenanceList.map(m => {
            const asset = assetsList.find(a => a.assetId === m.assetId);
            const assetName = asset?.asset_name || `Activo Desconocido (${m.assetId})`;
            
            const latestTerminalLogKey = Object.keys(m.progressLog)
                .sort((a, b) => Number(b) - Number(a)) 
                .find(key => {
                    const status = m.progressLog[key].newStatus;
                    return status === 'FINALIZED' || status === 'DELIVERED' || status === 'CANCELLED';
                });

            const closeDate = latestTerminalLogKey ? Number(latestTerminalLogKey) : null;
            const adminUid = latestTerminalLogKey ? m.progressLog[latestTerminalLogKey].performedByUid : 'N/A';
            const adminName = adminUid !== 'N/A' ? getFullName(adminUid) : 'Pendiente';
            const requestedBy = getFullName(m.requestedByUid) ?? '';
            
            const totalTimeInHours = closeDate
                ? calculateTimeInHours(m.requestDate, closeDate)
                : null;
            
            return {
                maintenanceId: m.maintenanceId,
                assetName,
                assetId: m.assetId,
                adminName,
                status: m.status,
                requestDate: m.requestDate,
                closeDate,
                totalTimeInHours,
                details: m.details,
                requestedBy
            };
        });
    };
    
    // ==========================================================
    // --- 4. FUNCIÓN DE CÁLCULO: REPORTE DE MANTENIMIENTO DE TODOS LOS EQUIPOS (ORIGINAL) ---
    // ==========================================================
    const generateAllAssetMaintenanceReports = async (assetsList: Asset[]): Promise<EnrichedMaintenanceReport[]> => {
        const allMaintenance = await fetchAllMaintenance(); // Aseguramos que se obtengan todos
        const report = enrichMaintenanceData(allMaintenance, assetsList);
        return report.sort((a, b) => b.requestDate - a.requestDate);
    };

    // ==========================================================
    // --- 5. FUNCIÓN DE CÁLCULO: REPORTE DE MANTENIMIENTOS POR ADMIN (ORIGINAL) ---
    // ==========================================================
    const generateMaintenanceReportByAdmin = async (assetsList: Asset[]): Promise<Record<string, EnrichedMaintenanceReport[]>> => {
        const allMaintenance = await fetchAllMaintenance();
        const enrichedList = enrichMaintenanceData(allMaintenance, assetsList);
        
        // Agrupar por el nombre del administrador que cerró (o 'Pendiente')
        const report = enrichedList.reduce((acc, reportItem) => {
            const adminKey = reportItem.adminName;
            if (!acc[adminKey]) acc[adminKey] = [];
            acc[adminKey].push(reportItem);
            return acc;
        }, {} as Record<string, EnrichedMaintenanceReport[]>);
        
        return report;
    };


    // ==========================================================
    // --- LOGICA AGREGADA: REPORTE AGRUPADO POR ACTIVO (Reporte 6) ---
    // ==========================================================

    /**
     * Auxiliar: Aplana y enriquece el progressLog de un mantenimiento, incluyendo el nombre del Admin.
     */
    const getExtendedLogs = (maintenance: Maintenance): MaintenanceLogExtended[] => {
        if (!maintenance.progressLog) return [];
        
        return Object.keys(maintenance.progressLog)
            .sort((a, b) => Number(a) - Number(b)) // Ordenar cronológicamente ascendente
            .map(timestampKey => {
                const log = maintenance.progressLog[timestampKey];
                return {
                    ...log,
                    timestamp: Number(timestampKey), // Asegurar que el timestamp es un número
                    performedByAdminName: getFullName(log.performedByUid),
                };
            });
    };
    
    /**
     * Auxiliar: Convierte el Maintenance crudo a MaintenanceExtended (con logs y Admin Name).
     */
    const toMaintenanceExtended = (maintenance: Maintenance, assetName: string): MaintenanceExtended => {
        const extendedLogs = getExtendedLogs(maintenance);
        
        // Buscar la última entrada terminal (para el cierre)
        const latestTerminalLog = extendedLogs
            .filter(log => ['FINALIZED', 'DELIVERED', 'CANCELLED'].includes(log.newStatus))
            .pop(); // Obtener el último de ellos
            
        const closeDate = latestTerminalLog?.timestamp ?? null;
        const adminName = latestTerminalLog ? getFullName(latestTerminalLog.performedByUid) : 'Pendiente';

        const totalTimeInHours = closeDate
            ? calculateTimeInHours(maintenance.requestDate, closeDate)
            : null;

        return {
            maintenanceId: maintenance.maintenanceId,
            title: maintenance.title,
            status: maintenance.status,
            assetName, // <--- AGREGAR
            assetId: maintenance.assetId,
            performedByAdminName: adminName,
            requestedBy: getFullName(maintenance.requestedByUid) ?? "",
            requestDate: maintenance.requestDate,
            closeDate,
            totalTimeInHours,
            details: maintenance.details,
            logs: extendedLogs,
        };
    };

    /**
     * 6. FUNCIÓN DE CÁLCULO: REPORTE DE MANTENIMIENTOS POR EQUIPO (AGRUPADO)
     */
    const generateMaintenanceReportByAssetGroup = async (assetsList: Asset[]): Promise<AssetMaintenanceGroup[]> => {
        const allMaintenance = await fetchAllMaintenance(); // Aseguramos que se obtengan todos

        // 1. Agrupar mantenimientos crudos por AssetId
        const maintenanceMap = allMaintenance.reduce((acc, m) => {
            if (!acc[m.assetId]) acc[m.assetId] = [];
            acc[m.assetId].push(m);
            return acc;
        }, {} as Record<string, Maintenance[]>);

        // 2. Crear las secciones AssetMaintenanceGroup
        return assetsList
            .map(asset => {
                const maintenanceList = maintenanceMap[asset.assetId] || [];
                
                // Enriquecer y ordenar los mantenimientos para este activo
                const maintenanceEntries: MaintenanceExtended[] = maintenanceList
                    .map(m => toMaintenanceExtended(m, asset.asset_name))
                    .sort((a, b) => b.requestDate - a.requestDate); // Más reciente primero

                return {
                    asset,
                    maintenanceEntries,
                };
            })
            // Ordenar por nombre de activo para la UI
            .sort((a, b) => a.asset.asset_name.localeCompare(b.asset.asset_name)); 
    };
    
    // ==========================================================
    // --- LOGICA AGREGADA: REPORTE AGRUPADO POR PERFORMER (Reporte 7) ---
    // ==========================================================

    /**
     * 7. FUNCIÓN DE CÁLCULO: REPORTE DE MANTENIMIENTOS POR ADMINISTRADOR QUE LO REALIZÓ (CERRÓ)
     * MODIFICADO: Ahora usa toMaintenanceExtended para obtener los logs.
     */
    const generateMaintenanceReportByPerformerGroup = async (assetsList: Asset[]): Promise<PerformerMaintenanceGroup[]> => {
        const allMaintenance = await fetchAllMaintenance(); 

        // 1. Crear un mapa de AssetId a Asset
        const assetMap = assetsList.reduce((acc, a) => {
            acc[a.assetId] = a;
            return acc;
        }, {} as Record<string, Asset>);
        
        // 2. Convertir todos los mantenimientos a MaintenanceExtended (incluyendo logs)
        const extendedMaintenanceList: MaintenanceExtended[] = allMaintenance
            .map(m => {
                const asset = assetMap[m.assetId];
                const assetName = asset?.asset_name || `Activo Desconocido (${m.assetId})`;
                return toMaintenanceExtended(m, assetName); // Usamos la utilidad que ya tiene logs
            })
            .filter(m => m.status === 'FINALIZED' || m.status === 'DELIVERED' || m.status === 'CANCELLED'); // Solo mantenimientos cerrados
        
        // 3. Agrupar por el nombre del administrador que CERRÓ (performedByAdminName)
        const performerMap = extendedMaintenanceList.reduce((acc, m) => {
            const performerName = m.performedByAdminName;
            // Solo incluimos si hay un nombre de performer (no 'Pendiente')
            if (performerName === 'Pendiente') return acc;
            
            if (!acc[performerName]) acc[performerName] = [];
            acc[performerName].push(m); 
            return acc;
        }, {} as Record<string, MaintenanceExtended[]>); // Nota: El tipo de acumulador es MaintenanceExtended[]

        // 4. Convertir el mapa a un array de PerformerMaintenanceGroup
        return Object.keys(performerMap)
            .map(performerName => ({
                performerName,
                // Ordenar mantenimientos por fecha de solicitud (o cierre)
                performedMaintenances: performerMap[performerName].sort((a, b) => b.requestDate - a.requestDate),
            }))
            // Ordenar grupos por nombre del performer
            .sort((a, b) => a.performerName.localeCompare(b.performerName));
    };


    // ==========================================================
    // --- EFECTO PRINCIPAL: CARGA Y CÁLCULO DE TODOS LOS REPORTES ---
    // ==========================================================
    useEffect(() => {
        let isMounted = true;
        
        loadDependencies(); // Aseguramos que la data base se cargue

        // Solo ejecutar los cálculos si la data base está lista
        if (baseDataReady) {
            
            // --- CÁLCULO 1, 2, 3 (EXISTENTE) ---
            setLoadingAssignmentReport(true);
            try {
                // MODIFICADO: Pasamos el array de assignments
                const report = generateAssignmentReport(allUsers, assets, assignments);
                if (isMounted) setAssignmentReport(report);
            } catch (e) {
                console.error("Error generating assignment report:", e);
                if (isMounted) setAssignmentReport([]);
            } finally {
                if (isMounted) setLoadingAssignmentReport(false);
            }
            
            setLoadingAllAssetLogReports(true);
            try {
                const report = generateAllAssetLogReports(assets);
                if (isMounted) setAllAssetLogReports(report);
            } catch (e) {
                console.error("Error generating all asset log reports:", e);
                if (isMounted) setAllAssetLogReports([]);
            } finally {
                if (isMounted) setLoadingAllAssetLogReports(false);
            }

            setLoadingUserCreationReport(true);
            try {
                const report = generateUserCreationReport(allUsers);
                if (isMounted) setUserCreationReport(report);
            } catch (e) {
                console.error("Error generating user creation report:", e);
                if (isMounted) setUserCreationReport([]);
            } finally {
                if (isMounted) setLoadingUserCreationReport(false);
            }
            
            // --- CÁLCULO 4, 5, 6 & 7: REPORTES DE MANTENIMIENTO (ASÍNCRONOS) ---
            const calculateMaintenanceReports = async () => {
                setLoadingAllMaintenanceReports(true);
                setLoadingMaintenanceReportByAdmin(true);
                setLoadingMaintenanceReportByAssetGroup(true); 
                setLoadingMaintenanceReportByPerformerGroup(true); // REPORTE 7: START

                try {
                    // CÁLCULO 4: Mantenimiento de todos los equipos (ORIGINAL)
                    const allMaintReport = await generateAllAssetMaintenanceReports(assets);
                    if (isMounted) setAllAssetMaintenanceReports(allMaintReport);

                    // CÁLCULO 5: Mantenimiento por Admin (ORIGINAL)
                    const maintByAdminReport = await generateMaintenanceReportByAdmin(assets);
                    if (isMounted) setMaintenanceReportByAdmin(maintByAdminReport);
                    
                    // CÁLCULO 6: Mantenimiento por Equipo (Agrupado) (NUEVO)
                    const maintByAssetGroupReport = await generateMaintenanceReportByAssetGroup(assets);
                    if (isMounted) setMaintenanceReportByAssetGroup(maintByAssetGroupReport); 
                    
                    // CÁLCULO 7: Mantenimiento por Performer (Agrupado) (NUEVO)
                    const maintByPerformerGroupReport = await generateMaintenanceReportByPerformerGroup(assets);
                    if (isMounted) setMaintenanceReportByPerformerGroup(maintByPerformerGroupReport);

                } catch (e) {
                    console.error("Error generating maintenance reports:", e);
                    if (isMounted) {
                        setAllAssetMaintenanceReports([]);
                        setMaintenanceReportByAdmin({});
                        setMaintenanceReportByAssetGroup([]); 
                        setMaintenanceReportByPerformerGroup([]); // REPORTE 7: FALLBACK
                    }
                } finally {
                    if (isMounted) {
                        setLoadingAllMaintenanceReports(false);
                        setLoadingMaintenanceReportByAdmin(false);
                        setLoadingMaintenanceReportByAssetGroup(false); 
                        setLoadingMaintenanceReportByPerformerGroup(false); // REPORTE 7: END
                    }
                }
            };
            calculateMaintenanceReports();
        }

        return () => { isMounted = false; };
        // El efecto se re-ejecuta cuando la data base (users/assets/assignments) está lista
    }, [allUsers, assets, assignments, fetchAllUsers, loadAssets, fetchAllMaintenance, baseDataReady, fetchAllAssignments]); // <--- MODIFICADO: Añadir dependencias de assignments


    // ==========================================================
    // --- GETTERS FUNCIONALES (ORIGINALES) ---
    // ==========================================================

    /**
     * REPORTE: Muestra el log de un equipo específico. (Getter simple, no guarda estado)
     */
    const getAssetLogReportById = (assetId: string): AssetLogReport | null => {
        return allAssetLogReports.find(r => r.asset.assetId === assetId) || null;
    };

    /**
     * REPORTE: Muestra todos los mantenimientos de un equipo. (Getter simple, no guarda estado)
     * NOTA: Sigue usando el estado original 'allAssetMaintenanceReports'.
     */
    const getMaintenanceReportByAssetId = (assetId: string): EnrichedMaintenanceReport[] => {
        return allAssetMaintenanceReports.filter(r => r.assetId === assetId);
    };

    // --- Retorno del Hook ---
    return {
        // --- ESTADOS DE REPORTE (EXISTENTES) ---
        assignmentReport,
        allAssetLogReports,
        userCreationReport,
        allAssetMaintenanceReports,
        maintenanceReportByAdmin,
        maintenanceReportByAssetGroup, 
        maintenanceReportByPerformerGroup, // REPORTE 7: ESTADO

        // --- ESTADOS DE CARGA AGRUPADOS ---
        loadingAssignmentReport,
        loadingAllAssetLogReports,
        loadingUserCreationReport,
        // Agregamos el nuevo loading al cálculo de carga general de mantenimientos
        loadingAllMaintenanceReports: loadingAllMaintenanceReports || loadingMaintenanceReportByAdmin || loadingMaintenanceReportByAssetGroup || loadingMaintenanceReportByPerformerGroup,
        loadingMaintenanceReportByAssetGroup, // EXPOSICIÓN INDIVIDUAL
        loadingMaintenanceReportByPerformerGroup, // REPORTE 7: LOADING
        
        // --- GETTERS POR ID (EXISTENTES) ---
        getAssetLogReportById,
        getMaintenanceReportByAssetId,

        // --- ESTADO DE CARGA GENERAL (para otros reportes que se hagan on-demand) ---
        loading: loadingAssets || loadingMaintenance || loadingAssignments, // <--- MODIFICADO: Añadir loadingAssignments
    };
};