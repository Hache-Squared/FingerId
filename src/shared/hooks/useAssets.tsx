import { useState, useCallback } from 'react';
import { useRealtimeFetch } from './useRealtimeFetch'; // Hook de bajo nivel para RTDB
import { AssetFormData } from '../../explore/screens/AssetFormScreen'; 
import { Asset, AssetLogEntry } from '../../types/Asset.types';
import { getAuth } from 'firebase/auth'; 

// Inicializamos Auth para obtener el UID de quien realiza la acción
const auth = getAuth();

// RUTA SIMPLIFICADA PARA REALTIME DATABASE
// Este será el nodo raíz de tu inventario público: inventory/assets
const ASSETS_RTDB_PATH = `inventory/assets`;

/**
 * Hook de aplicación para gestionar la data de inventario (Assets).
 * Implementa consultas únicas (fetchData) y mutaciones (mutateData).
 */
export const useAssets = () => {
  // Definición del tipo base para la colección completa
  type AssetCollection = Record<string, Omit<Asset, 'assetId'>>;

  // useRealtimeFetch manejará la colección
  const { 
    fetchData, 
    mutateData, 
    loading: rtdbLoading, 
    error: rtdbError 
  } = useRealtimeFetch<AssetCollection>();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [localLoading, setLocalLoading] = useState(false); 
  
  const loading = rtdbLoading || localLoading;
  const error = rtdbError;

  /**
   * Procesa el objeto crudo de RTDB y lo convierte en un array de tipo Asset.
   * Inyecta el 'assetId' (la clave de RTDB) dentro de cada objeto.
   */
  const processFetchedAssets = useCallback((fetchedObject: AssetCollection | null): Asset[] => {
    if (!fetchedObject) return [];
    
    return Object.entries(fetchedObject).map(([id, assetData]) => {
        // CORRECCIÓN CLAVE: Convertir el objeto de logs con claves numéricas a un array limpio.
        let logsArray: AssetLogEntry[] = [];
        if (assetData.logs && typeof assetData.logs === 'object' && !Array.isArray(assetData.logs)) {
             // Si logs es un objeto (como lo guarda RTDB para arrays), conviértelo.
             logsArray = Object.values(assetData.logs) as AssetLogEntry[];
        } else if (Array.isArray(assetData.logs)) {
             logsArray = assetData.logs;
        }
        
        return {
            ...assetData,
            assetId: assetData?.id ?? "", // La clave de RTDB se convierte en el ID del Asset
            logs: logsArray, // Usamos el array limpio
        };
    });
  }, []);

  /**
   * Carga la lista de activos aplicando filtros del lado del cliente.
   */
  const loadAssets = useCallback(async (
    userId: string | null, 
    isAdmin: boolean,
    searchTerm: string = '', 
  ) => {
    setLocalLoading(true);
    
    try {
      // 1. LLAMADA RTDB: Cargamos todo el inventario público.
      // Aquí fetchedObject es de tipo AssetCollection, lo cual es correcto.
      const fetchedObject = await fetchData(ASSETS_RTDB_PATH);
      
      let filteredAssets = processFetchedAssets(fetchedObject as any); // No hay error aquí
      // [Lógica de Filtrado...]
      if (!isAdmin && userId) {
        filteredAssets = filteredAssets.filter(a => 
            a.is_assigned && a.current_user_uid === userId
        );
      }
      
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filteredAssets = filteredAssets.filter(a => 
            (a.asset_name && a.asset_name.toLowerCase().includes(lowerSearch)) || 
            (a.serial_number && a.serial_number.toLowerCase().includes(lowerSearch))
        );
      }
      
      setAssets(filteredAssets);
    } catch (e) {
      console.error("Error loading assets:", e);
      setAssets([]);
    } finally {
      setLocalLoading(false);
    }
  }, [fetchData, processFetchedAssets]);
  
  /**
   * Crea un nuevo activo en RTDB usando 'push'.
   */
  const createAsset = useCallback(async (data: AssetFormData, createdByUid: string) => {
    setLocalLoading(true);
    try {
      // Data que se enviará al endpoint (un único objeto Asset sin ID)
      const assetDataForDb: Omit<Asset, 'assetId'> = {
        ...data,
        created_at: Date.now(), 
        created_by_uid: createdByUid,
        is_assigned: false,
        current_user_uid: null,
        // Inicializamos logs como un array (RTDB lo guardará como {0:{...}} )
        logs: [{
             timestamp: Date.now(),
             action: 'CREATED',
             performedByUid: createdByUid,
             details: `Asset creado por el usuario ${createdByUid}.`,
        }],
      };
      
      const newKey = await (mutateData as any)('push', ASSETS_RTDB_PATH, assetDataForDb);
      
      return { ...assetDataForDb, assetId: newKey }; 

    } catch (e) {
      throw e; 
    } finally {
      setLocalLoading(false);
    }
  }, [mutateData]); 


  /**
   * Actualiza el estado del activo en RTDB.
   */
  const updateAsset = useCallback(async (assetId: string, data: Partial<Omit<Asset, 'assetId'>>) => {
    setLocalLoading(true);
    const updatePath = `${ASSETS_RTDB_PATH}/${assetId}`; 

    try {
      // FIX: Usamos un cast a 'unknown' para que TypeScript permita que un objeto parcial
      // de Asset sea pasado a 'mutateData' con la acción 'update' en un subnodo.
      await (mutateData as any)('update', updatePath, data);
    } catch (e) {
      throw e;
    } finally {
      setLocalLoading(false);
    }
  }, [mutateData]);

  /**
   * Añade una entrada al log de un asset específico.
   */
  const addLogToAsset = useCallback(async (assetId: string, action: AssetLogEntry['action'], details: string) => {
    const assetPath = `${ASSETS_RTDB_PATH}/${assetId}`;
    console.log("addLogToAsset: ",{
      assetId, action, details
    });
    
    try {
      // 1. Obtener el asset actual
      // FIX: Aseguramos el tipo de retorno para un solo objeto
      const assetObject = await fetchData(assetPath) as unknown as Omit<Asset, 'assetId'> | null;
      if (!assetObject) {
        throw new Error(`Asset con ID ${assetId} no encontrado para el log.`);
      }
      
      // 2. Crear la nueva entrada de log
      const newLogEntry: AssetLogEntry = {
        timestamp: Date.now(),
        action,
        performedByUid: auth.currentUser?.uid || 'SYSTEM_UNAUTH',
        details,
      };

      // 3. Crear el nuevo array de logs
      
    const updatedLogs = [...(assetObject.logs || []), newLogEntry];

      // 4. Actualizar solo el campo 'logs' del asset
      console.log("addLogToAsset before updateAsset",{
        updatedLogs,
        assetId
      });
      
      await updateAsset(assetId, { logs: updatedLogs });
      
      return true;

    } catch (err) {
      console.error("Error al añadir log al asset:", err);
      return false;
    }
  }, [fetchData, updateAsset]);


  /**
   * Obtiene un solo activo por su ID.
   */
  const getAssetById = useCallback(async (assetId: string): Promise<Asset | null> => {
    setLocalLoading(true);
    const assetPath = `${ASSETS_RTDB_PATH}/${assetId}`;
    try {
        // FIX: Aseguramos el tipo de retorno para un solo objeto
        const assetData = await fetchData(assetPath) as unknown as Omit<Asset, 'assetId'>;
        if (assetData) {
            return { ...assetData, assetId };
        }
        return null;
    } catch (e) {
        console.error("Error fetching single asset:", e);
        return null;
    } finally {
        setLocalLoading(false);
    }
  }, [fetchData]);


  return { 
    assets, 
    loading, 
    error, 
    loadAssets, 
    getAssetById,
    updateAsset, 
    createAsset, 
    addLogToAsset,
  };
};
