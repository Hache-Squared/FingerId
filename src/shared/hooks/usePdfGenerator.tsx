import { useState, useCallback } from 'react';
import { generatePDF } from 'react-native-html-to-pdf';
import RNFS from 'react-native-fs'; // <--- AGREGADO: Importar react-native-fs
import { Platform } from 'react-native';

// Definimos el tipo de resultado que devuelve la librería
interface PdfGenerationResult {
  filePath: string;
  numberOfPages: number;
}

interface PdfGeneratorHook {
  /**
   * Genera un archivo PDF a partir del contenido HTML y lo mueve a la carpeta de Descargas.
   * @param htmlContent El string con el marcado HTML.
   * @param fileName El nombre deseado para el archivo (Ej: 'ReporteAsignaciones').
   * @returns Una promesa que resuelve con la RUTA FINAL del archivo.
   */
  generatePdf: (htmlContent: string, fileName: string) => Promise<{ filePath: string } | null>;
  
  /** Indica si el proceso de generación está en curso. */
  loading: boolean;
  
  /** Almacena cualquier error ocurrido durante la generación. */
  error: string | null;
}

/**
 * Hook para generar archivos PDF en React Native y guardarlos en Descargas.
 */
export const usePdfGenerator = (): PdfGeneratorHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePdf = useCallback(async (htmlContent: string, fileName: string): Promise<{ filePath: string } | null> => {
    setLoading(true);
    setError(null);

    // Aseguramos que el nombre tenga la extensión
    const finalFileName = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    try {
      // 1. GENERAR EL PDF EN UN DIRECTORIO TEMPORAL (CACHE)
      // Cambiamos 'Documents' por 'CacheStorage' para que sea temporal y sea fácil de mover.
      const options = {
        html: htmlContent,
        fileName: finalFileName.replace(/\s/g, '_'), 
        directory: 'CacheStorage', // Directorio temporal de RNHTMLtoPDF
        base64: false,
      };

      const results: any = await generatePDF(options);
      
      if (!results || !results.filePath) {
        throw new Error('La generación del PDF falló o no se encontró la ruta temporal.');
      }

      const tempFilePath = results.filePath;
      
      // 2. DEFINIR LA RUTA FINAL: CARPETA DE DESCARGAS
      let downloadDirectory: string;

      if (Platform.OS === 'ios') {
        // En iOS, el concepto de 'Descargas' directamente accesible por el usuario es limitado.
        // Lo más común es guardarlo en Documentos/Directorio de la app. Usaremos DocumentDirectory.
        // Opcionalmente, puedes usar RNFS.TemporaryDirectoryPath para algo más seguro antes de compartir.
        // Mantendremos la convención de guardado en la carpeta visible al usuario (DocumentDirectory).
        downloadDirectory = RNFS.DocumentDirectoryPath;
      } else { 
        // Android: La ruta estándar para Descargas.
        // NOTA: Para Android 10+ puede que necesites el Storage Access Framework (SAF)
        // o permisos MANAGE_EXTERNAL_STORAGE para acceder libremente. RNFS.DownloadDirectoryPath
        // funciona en la mayoría de los casos si los permisos básicos de almacenamiento están bien.
        downloadDirectory = RNFS.DownloadDirectoryPath;
      }
      
      const finalFilePath = `${downloadDirectory}/${finalFileName}`;
      
      // 3. MOVER EL ARCHIVO GENERADO A LA RUTA FINAL DE DESCARGAS
      // Primero, nos aseguramos de que el directorio exista (útil si usamos subdirectorios, aunque no aplica aquí directamente).
      // RNFS.mkdir(downloadDirectory, { NSURLIsExcludedFromBackupKey: true }); // Opcional, si usas subcarpetas
      
      // Si el archivo ya existe en la ruta destino, es mejor eliminarlo primero (RNFS.moveFile puede fallar si existe).
      if (await RNFS.exists(finalFilePath)) {
          await RNFS.unlink(finalFilePath);
      }
      
      // Mover el archivo
      await RNFS.moveFile(tempFilePath, finalFilePath);

      return { filePath: finalFilePath };

    } catch (e: any) {
      console.error("Error generating or moving PDF:", e);
      // Incluimos una advertencia si se trata de Android.
      const platformError = Platform.OS === 'android' 
        ? ' (Verifica los permisos de almacenamiento en Android.)' 
        : '';

      setError(`Error al crear o guardar el PDF: ${e.message || 'Desconocido'}${platformError}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generatePdf,
    loading,
    error,
  };
};