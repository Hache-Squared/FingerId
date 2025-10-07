import { useState, useCallback } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getDatabase, Database, ref, set, update, push, get, child, DataSnapshot,
  // NOTA: Se ha quitado la lógica de Auth innecesaria para los hooks de data
} from 'firebase/database';
import { DocumentData } from 'firebase/firestore'; 
import { firebaseConfig } from '../config/firebaseConfig'; // Usamos tu configuración local

// --- INICIALIZACIÓN DE FIREBASE (ÚNICA) ---
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db: Database = getDatabase(app);

// Este hook maneja la lógica de comunicación directa con Realtime Database
export const useRealtimeFetch = <T extends DocumentData>() => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga datos de una ruta específica de RTDB una sola vez.
   * @param path Ruta del nodo (Ej: 'artifacts/app-id/public/assets').
   * @returns Una promesa que resuelve con un objeto de datos (clave: valor).
   */
  const fetchData = useCallback(async (path: string): Promise<T[]> => {
    setLoading(true);
    setError(null);
    try {
      const dbRef = ref(db);
      const snapshot: DataSnapshot = await get(child(dbRef, path));
      
      let data: T[] = [];
      if (snapshot.exists()) {
        const value = snapshot.val();
        
        // RTDB retorna un objeto de objetos (clave: objeto). Convertimos a array de objetos con ID.
        data = Object.keys(value).map(key => ({
          id: key, // La clave de RTDB se convierte en el ID del objeto
          ...(value[key] as T),
        })) as T[];
      }

      setLoading(false);
      return data;
    } catch (err: any) {
      console.error("Error fetching data from RTDB:", err);
      setError(err.message || 'Error al cargar los datos.');
      setLoading(false);
      return [];
    }
  }, []);

  /**
   * Mutación genérica para RTDB.
   */
  const mutateData = useCallback(async (
    action: 'push' | 'set' | 'update' | 'remove', 
    path: string, 
    data?: Partial<T>
  ) => {
    setLoading(true);
    setError(null);
    try {
      const nodeRef = ref(db, path);

      if (action === 'push') {
        // 'push' es equivalente a addDoc en Firestore (añade con una clave única)
        const pushedRef = await push(nodeRef, data);
        setLoading(false);
        return pushedRef.key; // Retorna la clave generada
      } else if (action === 'set') {
        // 'set' sobrescribe completamente la ruta
        await set(nodeRef, data);
        setLoading(false);
        return path;
      } else if (action === 'update') {
        // 'update' actualiza solo los campos especificados
        await update(nodeRef, data as any);
        setLoading(false);
        return path;
      } else if (action === 'remove') {
        // 'remove' elimina la ruta
        await set(nodeRef, null); // set(ref, null) es equivalente a remove
        setLoading(false);
        return path;
      }
      return null;
    } catch (err: any) {
      console.error(`Error performing ${action} in RTDB:`, err);
      setError(err.message || `Error al ejecutar la acción ${action}.`);
      setLoading(false);
      throw err; 
    }
  }, []);

  return { fetchData, mutateData, loading, error };
};
