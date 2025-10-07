import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
// LIBRERÍAS CLAVE
import ViewShot from 'react-native-view-shot'; // Para tomar la captura de pantalla
import Share from 'react-native-share'; // PARA COMPARTIR/IMPRIMIR
import QRCode from 'react-native-qrcode-svg'; 
import Icon from 'react-native-vector-icons/Ionicons'; 

interface QrCodeGeneratorProps {
  assetId: string;
  assetName: string;
  size?: number;
}

/**
 * Componente reutilizable para generar, mostrar y COMPARTIR/IMPRIMIR un Código QR.
 * Utiliza react-native-share como alternativa a react-native-print.
 */
export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ 
  assetId, 
  assetName,
  size = 200 
}) => {
  
  // Referencia al View principal que queremos capturar para la impresión
  const viewShotRef = useRef<ViewShot>(null); 
  const [isProcessing, setIsProcessing] = React.useState(false); // Usamos 'Processing' en general
  const qrSize = Math.max(150, size); 

  // Función REAL para compartir o imprimir el código
  const handlePrint = async () => {
    if (!viewShotRef.current) {
      Alert.alert("Error", "No se pudo obtener la referencia del componente para la captura.");
      return;
    }

    setIsProcessing(true);

    try {
      // 1. CAPTURA DEL COMPONENTE (ViewShot)
      // Capturamos el contenido como una imagen (URI local en formato BASE64)
      /* @ts-ignore */
      const uri = await viewShotRef.current.capture?.({
        format: "png",
        quality: 1.0,
        result: "data-uri", // Pedimos el resultado como Base64 URI
      });
      
      if (!uri) {
        throw new Error("Fallo al capturar la imagen.");
      }

      // 2. PREPARAR EL CONTENIDO PARA COMPARTIR/IMPRIMIR
      // El URI Base64 se puede enviar directamente para compartir.
      const shareOptions = {
        title: `Código QR Activo: ${assetName}`,
        message: `Activo: ${assetName} (ID: ${assetId}). Escanee para ver detalles.`,
        url: uri, // URI con la imagen del QR en Base64
        type: 'image/png', // Tipo de contenido
      };

      // 3. ABRIR DIÁLOGO NATIVO DE COMPARTIR/EXPORTAR
      // El diálogo nativo incluye opciones como 'Guardar Imagen', 'Imprimir', 'Enviar por Email', etc.
      await Share.open(shareOptions);
      
      // No mostramos un Alert, ya que el diálogo nativo ya da feedback.

    } catch (error) {
      // Si el usuario cancela la acción, 'react-native-share' lanza un error, lo ignoramos.
      
        console.error("Error al compartir/imprimir:", error);
        //Alert.alert("Error de Proceso", "Hubo un problema al intentar generar el archivo. Asegúrate de que react-native-share se instaló correctamente.");
      
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
    <ViewShot 
      ref={viewShotRef} 
      options={{ format: "png", quality: 1.0 }} 
      style={styles.captureArea}
    >
      {/* Contenido que se va a imprimir */}
      <View style={styles.container}>
        <Text style={styles.title}>Código QR del Activo</Text>

        <View style={[styles.qrCodeBox, { width: qrSize, height: qrSize }]}>
          <QRCode
            value={assetId}
            size={qrSize - 20} 
            color="#1f2937"
            backgroundColor="white"
          />
        </View>

        <Text style={styles.idLabel}>ID del Activo:</Text>
        <Text style={styles.idValue}>{assetId}</Text>
        
        <Text style={styles.nameLabel}>Nombre:</Text>
        <Text style={styles.nameValue}>{assetName}</Text>
      </View>
    </ViewShot>

    {/* BOTÓN DE ACCIÓN (fuera del ViewShot) */}
    <TouchableOpacity 
      style={[styles.printButton, isProcessing && styles.printButtonDisabled]}
      onPress={handlePrint}
      disabled={isProcessing}
    >
      {isProcessing ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          <Icon name="share-social-outline" size={20} color="#fff" style={styles.iconMargin} />
          <Text style={styles.printButtonText}>Generar Código y Compartir</Text>
        </>
      )}
    </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  captureArea: {
    backgroundColor: '#fff', 
    width: '100%',
    alignItems: 'center',
    marginBottom: 20, 
  },
  container: {
    padding: 25,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4f46e5',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  qrCodeBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 5,
    borderColor: '#f3f4f6',
    marginBottom: 25,
  },
  idLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 10,
  },
  idValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  nameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 5,
  },
  nameValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4b5563',
    marginBottom: 15,
    textAlign: 'center',
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
      android: { elevation: 5 },
    }),
  },
  printButtonDisabled: {
    backgroundColor: '#ccc',
  },
  printButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  iconMargin: {
    marginRight: 10,
  }
});
