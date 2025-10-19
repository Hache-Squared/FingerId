import { useCallback, useState } from 'react';
import { useAssets } from './useAssets';
import { useUsers, UserProfileData } from './useUsers';
import { useMaintenance, Maintenance, MaintenanceStatus } from './useMaintenance';
import { Asset, AssetLogEntry } from '../../types/Asset.types';

// ==========================================================
// --- INTERFACES DE SALIDA (Data Estructurada para UI) ---
// ==========================================================

// 1. REPORTE DE ASIGNACIONES ACTUALES
interface UserAssignmentReport {
    user: UserProfileData;
    assignedAssets: Asset[];
}

// 2. REPORTE DE LOG DE EQUIPO
interface AssetLogReport {
    asset: Asset;
    currentAssigneeName: string; // Nombre completo del usuario asignado
    logs: AssetLogEntry[];
}

// 3. REPORTE DE CREACIÓN DE USUARIOS
interface UserCreationReport {
    user: UserProfileData;
    createdByAdminName: string; // Nombre completo del administrador que lo creó
}

// 4 & 5. REPORTE DE MANTENIMIENTOS
interface EnrichedMaintenanceReport {
    maintenanceId: string;
    assetName: string; // Nombre del equipo
    assetId: string;
    adminName: string; // Nombre del administrador que cerró el último estatus
    status: MaintenanceStatus;
    requestDate: number; // Timestamp de inicio
    closeDate: number | null; // Timestamp de cierre (FINALIZED, DELIVERED, CANCELLED)
    totalTimeInHours: number | null; // Tiempo total en horas (cierre - inicio)
    details: string;
    // Logs simplificados si se necesitan
}


/**
 * Hook centralizado para generar todos los reportes, orquestando
 * la data de Assets, Users y Maintenance.
 */
export const useReports = () => {
    const { fetchAllUsers, allUsers } = useUsers();
    // Nota: allUsers debe estar precargado en la app o cargarse aquí.
    const { loadAssets, assets, loading: loadingAssets } = useAssets();
    const { fetchAllMaintenance, loading: loadingMaintenance } = useMaintenance();

    const [loading, setLoading] = useState(false);
    const hasUsers = allUsers.length > 0;

    /**
     * Función interna de utilidad para precargar toda la data necesaria.
     */
    const loadAllData = useCallback(async () => {
        if (!hasUsers) {
            await fetchAllUsers();
        }
    }, [hasUsers, fetchAllUsers]);

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
        return diffMs / (1000 * 60 * 60); // Convertir milisegundos a horas
    };
    
    // ==========================================================
    // --- 1. REPORTE DE ASIGNACIONES ACTUALES (GLOBAL) ---
    // ==========================================================

    /**
     * REPORTE: Muestra todos los usuarios y los equipos que tienen asignados.
     */
    const getAssignmentReport = useCallback(async (): Promise<UserAssignmentReport[]> => {
        setLoading(true);
        try {
            await loadAllData();
            // Carga todos los assets (necesitamos todos para ver las asignaciones)
            // Nota: Aquí se está usando el fetchData interno de useAssets para obtener TODOS
            // ya que loadAssets aplica filtros por defecto si no se llama con (null, true).
            // Usaremos una carga de todos los assets.
            // Puesto que useAssets no expone directamente el fetch sin filtros de admin/user,
            // asumiremos que la lista 'assets' ya fue precargada con TODOS los assets 
            // en la app para un admin (o la llamamos con loadAssets(null, true))
            
            // Alternativa segura si useAssets está siendo usado en una pantalla Admin:
            // await loadAssets(null, true); 
            // Usaremos la lista 'assets' ya cargada.
            
            if (assets.length === 0) {
                // Si la lista local está vacía, hacemos un fetch global sin filtros
                await (loadAssets as any)(null, true);
            }

            const report: UserAssignmentReport[] = [];
            
            // Agrupar los assets por el UID del usuario asignado
            const assignedAssetsMap = assets
                .filter(a => a.is_assigned && a.current_user_uid)
                .reduce((acc, asset) => {
                    const uid = asset.current_user_uid!;
                    if (!acc[uid]) acc[uid] = [];
                    acc[uid].push(asset);
                    return acc;
                }, {} as Record<string, Asset[]>);

            // Generar el reporte para todos los usuarios (incluyendo los que no tienen nada)
            allUsers.forEach(user => {
                report.push({
                    user,
                    assignedAssets: assignedAssetsMap[user.uid] || [],
                });
            });

            return report;
        } catch (e) {
            console.error("Error generating assignment report:", e);
            return [];
        } finally {
            setLoading(false);
        }
    }, [loadAllData, allUsers, assets, loadAssets]);
    
    // ==========================================================
    // --- 2. REPORTE DE LOG DE EQUIPO (POR EQUIPO) ---
    // ==========================================================

    /**
     * REPORTE: Muestra el log de un equipo específico.
     * @param assetId ID del equipo.
     */
    const getAssetLogReport = useCallback(async (assetId: string): Promise<AssetLogReport | null> => {
        setLoading(true);
        try {
            await loadAllData();
            
            // Buscamos el asset en la lista global (o lo obtenemos directamente)
            const asset = assets.find(a => a.assetId === assetId);

            if (!asset) {
                // Alternativa: Si no está en la lista local, intentar fetch de uno solo.
                // Aunque useAssets no expone un fetch global, se asumirá que asset está en 'assets'.
                return null; 
            }

            const currentAssigneeName = asset.current_user_uid
                ? getFullName(asset.current_user_uid)
                : 'Nadie';
            
            return {
                asset,
                currentAssigneeName,
                logs: (asset?.logs ?? [])?.sort((a, b) => b.timestamp - a.timestamp), // Ordenar cronológicamente inverso
            };

        } catch (e) {
            console.error(`Error generating log report for asset ${assetId}:`, e);
            return null;
        } finally {
            setLoading(false);
        }
    }, [loadAllData, assets, getFullName]);

    // ==========================================================
    // --- 3. REPORTE DE CREACIÓN DE USUARIOS (GLOBAL) ---
    // ==========================================================

    /**
     * REPORTE: Muestra quién creó a cada usuario.
     */
    const getUserCreationReport = useCallback(async (): Promise<UserCreationReport[]> => {
        setLoading(true);
        try {
            await loadAllData();
            
            const report: UserCreationReport[] = allUsers
                // Filtramos por usuarios creados por alguien más (tienen createdByUid)
                .filter(u => u.createdByUid) 
                .map(user => {
                    // Si no tiene createdByUid (ej: creado manualmente o primer admin)
                    const createdByUid = user.createdByUid || 'SYSTEM_UNAUTH'; 
                    const createdByAdminName = getFullName(createdByUid);
                    
                    return {
                        user,
                        createdByAdminName: createdByAdminName === `Usuario Desconocido (${createdByUid})` 
                            ? 'Sistema/Admin Inicial' 
                            : createdByAdminName,
                    };
                });

            return report.sort((a, b) => (a.createdByAdminName > b.createdByAdminName ? 1 : -1));

        } catch (e) {
            console.error("Error generating user creation report:", e);
            return [];
        } finally {
            setLoading(false);
        }
    }, [loadAllData, allUsers, getFullName]);

    // ==========================================================
    // --- 4 & 5. REPORTE DE MANTENIMIENTOS (AUXILIAR) ---
    // ==========================================================
    
    /**
     * Utilidad para enriquecer una lista de mantenimientos con nombres y tiempos.
     */
    const enrichMaintenanceData = useCallback((
        maintenanceList: Maintenance[], 
        assetsList: Asset[]
    ): EnrichedMaintenanceReport[] => {
        
        return maintenanceList.map(m => {
            const asset = assetsList.find(a => a.assetId === m.assetId);
            const assetName = asset?.asset_name || `Activo Desconocido (${m.assetId})`;
            
            // Buscar el último log de FINALIZED, DELIVERED o CANCELLED
            const latestTerminalLogKey = Object.keys(m.progressLog)
                .sort((a, b) => Number(b) - Number(a)) // Ordenar descendente por timestamp (key)
                .find(key => {
                    const status = m.progressLog[key].newStatus;
                    return status === 'FINALIZED' || status === 'DELIVERED' || status === 'CANCELLED';
                });

            const closeDate = latestTerminalLogKey ? Number(latestTerminalLogKey) : null;
            const adminUid = latestTerminalLogKey ? m.progressLog[latestTerminalLogKey].performedByUid : 'N/A';
            const adminName = adminUid !== 'N/A' ? getFullName(adminUid) : 'Pendiente';
            
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
            };
        });
    }, [getFullName]);


    // ==========================================================
    // --- 4. REPORTE DE MANTENIMIENTOS DE UN EQUIPO (POR EQUIPO) ---
    // ==========================================================

    /**
     * REPORTE: Muestra todos los mantenimientos de un equipo.
     * @param assetId ID del equipo.
     */
    const getMaintenanceReportByAsset = useCallback(async (assetId: string): Promise<EnrichedMaintenanceReport[]> => {
        setLoading(true);
        try {
            await loadAllData();
            
            // Cargar todos los mantenimientos y todos los assets
            const allMaintenance = await fetchAllMaintenance();
            
            if (assets.length === 0) { await (loadAssets as any)(null, true); }

            // 1. Filtrar solo los mantenimientos del equipo
            const filteredMaintenance = allMaintenance.filter(m => m.assetId === assetId);

            // 2. Enriquecer los datos
            const report = enrichMaintenanceData(filteredMaintenance, assets);

            return report.sort((a, b) => b.requestDate - a.requestDate); // Más reciente primero

        } catch (e) {
            console.error(`Error generating maintenance report for asset ${assetId}:`, e);
            return [];
        } finally {
            setLoading(false);
        }
    }, [loadAllData, fetchAllMaintenance, assets, loadAssets, enrichMaintenanceData]);
    
    // ==========================================================
    // --- 5. REPORTE DE MANTENIMIENTOS HECHOS POR ADMIN (GLOBAL) ---
    // ==========================================================

    /**
     * REPORTE: Muestra todos los mantenimientos agrupados por el Admin que los finalizó.
     */
    const getMaintenanceReportByAdmin = useCallback(async (): Promise<Record<string, EnrichedMaintenanceReport[]>> => {
        setLoading(true);
        try {
            await loadAllData();

            // Cargar todos los mantenimientos y todos los assets
            const allMaintenance = await fetchAllMaintenance();

            if (assets.length === 0) { await (loadAssets as any)(null, true); }

            // 1. Enriquecer todos los mantenimientos
            const enrichedList = enrichMaintenanceData(allMaintenance, assets);
            
            // 2. Agrupar por el nombre del administrador que cerró (o 'Pendiente')
            const report = enrichedList.reduce((acc, reportItem) => {
                const adminKey = reportItem.adminName;
                if (!acc[adminKey]) acc[adminKey] = [];
                acc[adminKey].push(reportItem);
                return acc;
            }, {} as Record<string, EnrichedMaintenanceReport[]>);

            return report;
        } catch (e) {
            console.error("Error generating maintenance report by admin:", e);
            return {};
        } finally {
            setLoading(false);
        }
    }, [loadAllData, fetchAllMaintenance, assets, loadAssets, enrichMaintenanceData]);

    return {
        loading: loading || loadingAssets || loadingMaintenance,
        // Funciones de Reporte
        getAssignmentReport,
        getAssetLogReport,
        getUserCreationReport,
        getMaintenanceReportByAsset,
        getMaintenanceReportByAdmin,
    };
};