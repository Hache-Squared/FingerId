import { UserProfileData } from '../shared/hooks/useUsers';
import { AssetFormData } from '../explore/screens/AssetFormScreen'; // Necesario para definir el tipo base

// --- Trazabilidad y Logs ---

/**
 * Representa una entrada de trazabilidad en el historial de un asset.
 */
export interface AssetLogEntry {
    timestamp: number;
    action: 'ASSIGNED' | 'UNASSIGNED' | 'MAINTENANCE' | 'CREATED';
    performedByUid: string; // UID del usuario que realiza la acción
    details: string; // Descripción de la acción (ej: "Asignado a Juan Pérez", "Mantenimiento preventivo")
}

// --- Assets (Equipos) ---

/**
 * Tipo de dato Asset (incluye el ID y los campos de RTDB).
 * Combina la data del formulario con los metadatos de la base de datos.
 */
export type Asset = AssetFormData & {
  // Campos del Asset
  assetId: string; // ID / Key del nodo en RTDB (usado como 'id' en RTDB)
  // Campos de Asignación y Estado
  is_assigned: boolean;
  current_user_uid: string | null;
  id?: any;

  // Campos de Trazabilidad y Metadatos
  created_at: number; // Timestamp Unix en milisegundos
  created_by_uid: string;
  logs?: AssetLogEntry[]; // Historial de logs por Asset
};

// --- Asignaciones ---

/**
 * Estructura de la relación de Asignación, que será el nodo principal en RTDB: /assignments/{assetId}
 * Un asset solo puede estar asignado a UN usuario.
 */
export interface Assignment {
    assetId: string;
    id?: any;
    assignedToUid: string; // El UID del usuario al que está asignado el asset
    assignedDate: number; // Fecha de la asignación
    assignedFrom: string;
}

/**
 * Estructura para combinar Asset y UserProfile, útil para mostrar listas.
 */
export interface AssignedAssetDetails extends Assignment {
    asset: Asset;
    assignedUser: UserProfileData;
}
