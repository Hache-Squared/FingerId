import { useState, useCallback, useMemo } from 'react';
import { useRealtimeFetch } from './useRealtimeFetch'; // Hook de bajo nivel para RTDB
import { getAuth } from 'firebase/auth';

// Inicializamos Auth para obtener el UID de quien realiza la acción
const auth = getAuth();

// RUTA RTDB
const MAINTENANCE_RTDB_PATH = 'maintenance_requests';

// Estatus que definen el flujo
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'FINALIZED' | 'DELIVERED' | 'CANCELLED';

// Entidad de Mantenimiento
export interface Maintenance {
  id?: string;
  maintenanceId: string; // Clave de RTDB
  assetId: string;
  title: string;
  details: string;
  status: MaintenanceStatus;
  requestedByUid: string;
  requestDate: number; // Timestamp
  // Campos de seguimiento (futuro)
  progressLog: Record<string, {
    timestamp: number;
    message: string;
    newStatus: MaintenanceStatus;
    performedByUid: string;
  }>;
}

/**
 * Hook para manejar la lógica de Mantenimientos.
 * Gestiona la creación y consulta del nodo /maintenance_requests.
 */
export const useMaintenance = () => {
  // Definición del tipo base para la colección completa
  type MaintenanceCollection = Record<string, Maintenance>;

  const {
    fetchData,
    fetchOne,
    mutateData,
    loading: rtdbLoading,
    error: rtdbError
  } = useRealtimeFetch<MaintenanceCollection>();
  
  const loading = rtdbLoading;
  const error = rtdbError;
  
  /**
   * Procesa el objeto crudo de RTDB y lo convierte en un array de Maintenance.
   * Inyecta el 'maintenanceId' (la clave de RTDB) dentro de cada objeto.
   */
  const processFetchedMaintenance = useCallback((fetchedObject: Record<string, Omit<Maintenance, 'maintenanceId'>> | null): Maintenance[] => {
    if (!fetchedObject) return [];
    
    return Object.entries(fetchedObject).map(([id, data]) => ({
        ...data,
        maintenanceId: data?.id, // La clave de RTDB se convierte en el ID del Mantenimiento
    })) as Maintenance[];
  }, []);
  

  /**
   * Carga la lista completa de mantenimientos.
   */
  const fetchAllMaintenance = useCallback(async (): Promise<Maintenance[]> => {
    try {
      // FIX: Aseguramos que fetchData retorne el tipo correcto
      const fetchedObject = await fetchData(MAINTENANCE_RTDB_PATH);
      return processFetchedMaintenance(fetchedObject as any);
    } catch (e) {
      console.error("Error fetching all maintenance requests:", e);
      return [];
    }
  }, [fetchData, processFetchedMaintenance]);

  /**
   * Obtiene la solicitud de mantenimiento ACTIVA (no FINALIZED, DELIVERED, CANCELLED) para un activo.
   * Si no hay activa, retorna la más reciente (finalizada) para mostrar información.
   */
  const fetchActiveMaintenanceByAssetId = useCallback(async (assetId: string): Promise<Maintenance | null> => {
    try {
      // 1. Cargamos todos los mantenimientos (podríamos optimizar esto más tarde con un query)
      const allMaintenance = await fetchAllMaintenance();
      
      // 2. Filtramos por assetId
      const assetMaintenance = allMaintenance.filter(m => m.assetId === assetId);

      // 3. Buscamos el MANTENIMIENTO ACTIVO (PENDING, IN_PROGRESS)
      const activeMaintenance = assetMaintenance.find(m => 
        m.status === 'PENDING' || m.status === 'IN_PROGRESS'
      );
      
      if (activeMaintenance) {
          return activeMaintenance;
      }
      
      // 4. Si no hay activo, retornamos el más reciente finalizado para info.
      if (assetMaintenance.length > 0) {
          const sorted = assetMaintenance.sort((a, b) => b.requestDate - a.requestDate);
          return sorted[0]; 
      }
      
      return null;
      
    } catch (e) {
      console.error(`Error fetching active maintenance for asset ${assetId}:`, e);
      return null;
    }
  }, [fetchAllMaintenance]);


  /**
   * Crea una nueva solicitud de mantenimiento en RTDB.
   */
  const createMaintenanceRequest = useCallback(async (assetId: string, title: string, details: string) => {
    const requestedByUid = auth.currentUser?.uid || 'SYSTEM_UNAUTH';
    
    try {
      // 1. Data inicial
      const requestData: Omit<Maintenance, 'maintenanceId'> = {
        assetId,
        title,
        details,
        status: 'PENDING', // Estado inicial
        requestedByUid,
        requestDate: Date.now(),
        progressLog: {
            [Date.now()]: { // Primer log
                timestamp: Date.now(),
                message: `Solicitud de mantenimiento creada por el usuario.`,
                newStatus: 'PENDING',
                performedByUid: requestedByUid,
            }
        }
      };
      
      // 2. Usamos 'push' para generar una nueva clave única
      const newKey = await (mutateData as any)('push', MAINTENANCE_RTDB_PATH, requestData);
      
      return { ...requestData, maintenanceId: newKey }; 

    } catch (e: any) {
      console.error("Error creating maintenance request:", e);
      throw new Error(`Error al crear la solicitud: ${e.message || 'Desconocido'}`);
    }
  }, [mutateData]);
  
  /**
   * Función para cambiar el estatus de un mantenimiento (uso futuro en AdminScreen).
   */
  const updateMaintenanceStatus = useCallback(async (
    maintenanceId: string, 
    newStatus: MaintenanceStatus,
    message: string = '',
  ) => {
      const updatePath = `${MAINTENANCE_RTDB_PATH}/${maintenanceId}`;
      const performedByUid = auth.currentUser?.uid || 'SYSTEM_UNAUTH';

      try {
          // 1. Obtener el mantenimiento actual para el log (usando fetchData en el subnodo)
          const fetchedObject = await (fetchOne(`${updatePath}`)) as any;
          
          // Nota: Si el resultado de fetchData en un subnodo es null/undefined,
          // debemos asumir que no se encontró el mantenimiento.
          if (!fetchedObject) {
              throw new Error(`Mantenimiento con ID ${maintenanceId} no encontrado.`);
          }
          // Debemos reconstruir el objeto Maintenance temporalmente
          const maintenanceObject: Maintenance = { 
              ...fetchedObject, 
              maintenanceId 
          };


          // 2. Crear nueva entrada de log
          const newLogEntry = {
              timestamp: Date.now(),
              message: message || `Estatus actualizado a ${newStatus}.`,
              newStatus,
              performedByUid,
          };
          
          // 3. Actualizar la data
          const updatedProgressLog = {
              ...(maintenanceObject.progressLog || {}), // Aseguramos que sea un objeto
              [Date.now()]: newLogEntry,
          };

          await (mutateData as any)('update', updatePath, { 
              status: newStatus, 
              progressLog: updatedProgressLog 
          });
          
          return true;
      } catch (e) {
          console.error("Error updating maintenance status:", e);
          throw e;
      }
  }, [mutateData, fetchData]);
  
  // ======================================================
  // === ADICIONES NECESARIAS PARA LA PANTALLA DE ADMIN ===
  // ======================================================

  /**
   * Obtiene un solo mantenimiento por su ID.
   */
  const getMaintenanceById = useCallback(async (maintenanceId: string): Promise<Maintenance | null> => {
    const maintenancePath = `${MAINTENANCE_RTDB_PATH}/${maintenanceId}`;
    try {
        // Obtenemos el objeto directamente desde el subnodo
        const maintenanceData = await fetchOne(maintenancePath) as unknown as Omit<Maintenance, 'maintenanceId'>;
        
        if (maintenanceData) {
            return { ...maintenanceData, maintenanceId };
        }
        return null;
    } catch (e) {
        console.error("Error fetching single maintenance:", e);
        return null;
    }
  }, [fetchData]);


  return { 
    loading, 
    error, 
    fetchActiveMaintenanceByAssetId,
    createMaintenanceRequest,
    fetchAllMaintenance,
    updateMaintenanceStatus,
    getMaintenanceById, // EXPUESTO para la pantalla de detalles
  };
};