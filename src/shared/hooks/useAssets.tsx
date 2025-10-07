import { useState, useCallback } from 'react';
import { useRealtimeFetch } from './useRealtimeFetch'; // Importamos el hook para Realtime Database
import { AssetFormData } from '../../explore/screens/AssetFormScreen'; 

// NOTA: Para RTDB usamos Date.now() en lugar de serverTimestamp de Firestore.

// RUTA SIMPLIFICADA PARA REALTIME DATABASE
// Este será el nodo raíz de tu inventario público.
const ASSETS_RTDB_PATH = `inventory/assets`; 

// Tipo de dato Asset (incluye el ID y los campos de RTDB)
export type Asset = AssetFormData & {
  id: string; // ID / Key del nodo en RTDB
  created_at: number; // Timestamp Unix en milisegundos
  created_by_uid: string;
  is_assigned: boolean;
  current_user_uid: string | null;
};

/**
 * Hook de aplicación para gestionar la data de inventario (Assets).
 * Usa useRealtimeFetch para la comunicación de bajo nivel con RTDB.
 */
export const useAssets = () => {
  // Cambiamos el hook a useRealtimeFetch, asumiendo que Asset es el tipo base de la data
  const { fetchData, mutateData, loading: rtdbLoading, error: rtdbError } = useRealtimeFetch<Asset>();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [localLoading, setLocalLoading] = useState(false); 
  
  const loading = rtdbLoading || localLoading;
  const error = rtdbError;


  /**
   * Carga la lista de activos. Aplica filtrado por rol (admin/usuario) y por texto de búsqueda.
   * @param userId El ID del usuario actual.
   * @param isAdmin Si el usuario tiene permisos de administrador (ver todo).
   * @param searchTerm Texto de búsqueda opcional (nombre o serial).
   * @param statusFilter Filtro por estado.
   */
  const loadAssets = useCallback(async (
    userId: string, 
    isAdmin: boolean,
    searchTerm: string = '', 
    statusFilter: string = 'all'
  ) => {
    setLocalLoading(true);
    
    try {
      // 1. LLAMADA RTDB: Cargamos todo el inventario público.
      const allFetchedAssets = await fetchData(ASSETS_RTDB_PATH);
      
      let filteredAssets = allFetchedAssets as Asset[];

      // 2. FILTRADO POR ROL (Admin vs Usuario normal)
      if (!isAdmin) {
        // Si no es admin, solo ve los activos que tiene asignados.
        filteredAssets = filteredAssets.filter(a => 
            a.is_assigned && a.current_user_uid === userId
        );
      }
      
      // 3. FILTRADO POR TÉRMINO DE BÚSQUEDA Y ESTADO
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filteredAssets = filteredAssets.filter(a => 
            a.asset_name.toLowerCase().includes(lowerSearch) || 
            a.serial_number.toLowerCase().includes(lowerSearch)
        );
      }

      if (statusFilter !== 'all') {
        filteredAssets = filteredAssets.filter(a => a.status === statusFilter);
      }
      
      setAssets(filteredAssets);
    } catch (e) {
      // El error ya fue manejado por useRealtimeFetch
      setAssets([]);
    } finally {
      setLocalLoading(false);
    }
  }, [fetchData]);
  
  /**
   * Crea un nuevo activo en RTDB usando 'push'.
   */
  const createAsset = useCallback(async (data: AssetFormData, createdByUid: string) => {
    setLocalLoading(true);
    try {
      // Prepara la data para ser guardada en el nodo de RTDB
      const assetDataForDb: Omit<Asset, 'id'> = {
        ...data,
        created_at: Date.now(), // Usamos timestamp Unix en milisegundos
        created_by_uid: createdByUid,
        is_assigned: false,
        current_user_uid: null,
      };
      
      // 1. LLAMADA RTDB: Usamos mutateData con la acción 'push' para añadir un nuevo nodo a la RUTA SIMPLIFICADA
      const newKey = await mutateData('push', ASSETS_RTDB_PATH, assetDataForDb);
      
      return newKey; // Retorna la clave (ID) generada por RTDB
    } catch (e) {
      // Relanzamos para que la UI (AssetFormScreen) pueda mostrar el error
      throw e; 
    } finally {
      setLocalLoading(false);
    }
  }, [mutateData]); 


  /**
   * Actualiza el estado del activo en RTDB.
   */
  const updateAsset = useCallback(async (assetId: string, data: Partial<Omit<Asset, 'id'>>) => {
    setLocalLoading(true);
    // En RTDB, la ruta de actualización es el path base + el ID del activo
    const updatePath = `${ASSETS_RTDB_PATH}/${assetId}`; 

    try {
      // Usamos mutateData con la acción 'update'
      await mutateData('update', updatePath, data);
      
      // La recarga completa aquí ya no es necesaria si solo actualizamos, pero la mantendremos por simplicidad
      // hasta que implementemos la escucha en tiempo real.
      // Si el componente de lista usa onSnapshot, esta recarga sería redundante.
      // Por ahora, solo lanzamos el error si falla la mutación.
    } catch (e) {
      throw e;
    } finally {
      setLocalLoading(false);
    }
  }, [mutateData]); // Eliminamos loadAssets de las dependencias para evitar recargas automáticas.

  return { assets, loadAssets, updateAsset, createAsset, loading, error };
};
