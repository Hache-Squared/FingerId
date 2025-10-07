import { useState, useCallback, useMemo } from 'react';
import { useRealtimeFetch } from './useRealtimeFetch'; 
import { 
  Assignment, 
} from '../../types/Asset.types';
import { useUsers } from './useUsers';
import { useAssets } from './useAssets'; // Importar el hook de assets actualizado

// Rutas de RTDB
const ASSIGNMENTS_RTDB_PATH = 'assignments'; 

/**
 * Hook para manejar la lógica de Asignaciones (Asset <-> User).
 * Usa consultas únicas (fetch) en lugar de suscripciones (onValue).
 */
export const useAssignments = () => {
  // Definición del tipo base para la colección completa de asignaciones
  type AssignmentCollection = Record<string, Assignment>;
  
  const { addLogToAsset, updateAsset } = useAssets();
  const { 
    fetchData, 
    mutateData, 
    loading: rtdbLoading, 
    error: rtdbError 
  } = useRealtimeFetch<AssignmentCollection>(); // Usamos la colección
  const { fetchAllUsers, allUsers, loadingUsers } = useUsers(); 

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const loading = rtdbLoading || loadingUsers || localLoading;

  // --- CONSULTAS ÚNICAS (FETCH) ---

  /**
   * Carga la lista completa de asignaciones (consulta única).
   */
  const fetchAllAssignments = useCallback(async () => {
    setLocalLoading(true);
    try {
      // fetchData con la ruta raíz debe retornar la colección
      
      const fetchedObject = await fetchData(ASSIGNMENTS_RTDB_PATH) as unknown as Record<string, Assignment> | null;
      
      let assignmentsArray: Assignment[] = [];
      if (fetchedObject) {
        assignmentsArray = Object.entries(fetchedObject).map(([assetId, assignmentData]) => ({
            ...assignmentData,
            assetId: assignmentData?.id, // El ID de la clave de la asignación es el assetId
        }));
      }
      
      setAssignments(assignmentsArray);
    } catch (e) {
      console.error("Error fetching all assignments:", e);
      setAssignments([]);
    } finally {
      setLocalLoading(false);
    }
  }, [fetchData]);

  // --- LÓGICA DE ASIGNACIÓN/DESASIGNACIÓN ---

  /**
   * Crea una nueva asignación y actualiza el estado del Asset.
   */
  const createAssignment = useCallback(async (assetId: string, assignedToUid: string, assignedUserName: string) => {
    setLocalLoading(true);
    
    // 1. Crear la entrada de asignación (un solo objeto)
    const assignment: Assignment = {
      assetId,
      assignedToUid,
      assignedDate: Date.now(),
    };
    
    const assignmentPath = `${ASSIGNMENTS_RTDB_PATH}/${assetId}`;

    console.log("createAssignment: ",{
      assignmentPath,
      assignment
    });
    
    try {
      // FIX: Usamos (mutateData as any) para permitir que un único objeto Assignment
      // sea enviado a la función, asumiendo que el hook de bajo nivel maneja la ruta completa.
      await (mutateData as any)('set', assignmentPath, assignment);
      
      // 1.2. Actualizar el estado del asset (is_assigned, current_user_uid)
      await updateAsset(assetId, { 
        is_assigned: true, 
        current_user_uid: assignedToUid 
      });
      
      // 1.3. Trazabilidad: Añadir log al asset
      await addLogToAsset(assetId, 'ASSIGNED', `Asignado a UID ${assignedToUid} (${assignedUserName}).`);

      return true;
    } catch (err: any) {
      console.error("Error creating assignment:", err);
      throw new Error(`Error al crear la asignación: ${err.message || 'Desconocido'}`);
    } finally {
      setLocalLoading(false);
      // Recargar datos para que la UI se actualice
      fetchAllAssignments();
    }
  }, [mutateData, addLogToAsset, updateAsset, fetchAllAssignments]);


  /**
   * Elimina una asignación existente y actualiza el estado del Asset.
   */
  const deleteAssignment = useCallback(async (assetId: string, assignedUserName: string) => {
    setLocalLoading(true);
    const assignmentPath = `${ASSIGNMENTS_RTDB_PATH}/${assetId}`;
    
    try {
      // 1. Eliminar la asignación
      // FIX: Usamos (mutateData as any) para permitir el comando 'remove'
      await (mutateData as any)('remove', assignmentPath);
      
      // 2. Actualizar el estado del asset (is_assigned, current_user_uid)
      await updateAsset(assetId, { 
        is_assigned: false, 
        current_user_uid: null 
      });
      
      // 3. Trazabilidad: Añadir log al asset
      await addLogToAsset(assetId, 'UNASSIGNED', `Desasignado de ${assignedUserName}.`);

      return true;
    } catch (err: any) {
      console.error("Error deleting assignment:", err);
      throw new Error(`Error al desasignar el activo: ${err.message || 'Desconocido'}`);
    } finally {
      setLocalLoading(false);
      // Recargar datos para que la UI se actualice
      fetchAllAssignments();
    }
  }, [mutateData, addLogToAsset, updateAsset, fetchAllAssignments]);


  // --- GETTERS COMPUTADOS ---

  /**
   * Devuelve los Assets IDs que ya tienen una asignación.
   */
  const assignedAssetIds = useMemo(() => {
    return new Set(assignments.map(a => a.assetId));
  }, [assignments]);


  return {
    assignments,
    allUsers,
    loading,
    error: rtdbError,
    fetchAllUsers,
    fetchAllAssignments,
    assignedAssetIds,
    createAssignment,
    deleteAssignment,
  };
};
