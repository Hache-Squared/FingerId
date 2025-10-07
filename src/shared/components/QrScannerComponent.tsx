import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// IMPORTS CLAVE PARA LA CÁMARA REAL (DEBES INSTALAR ESTA LIBRERÍA)
import { 
  Camera, 
  useCameraDevice, 
  useCodeScanner, 
  Code,
  // Asumimos que la aplicación ya tiene los permisos
  CameraPermissionStatus 
} from 'react-native-vision-camera';

interface QrScannerProps {
  // Función callback que se ejecuta cuando un código es escaneado exitosamente
  onScan: (data: string) => void; 
  // Controla si el escáner debe estar activo o no (para evitar múltiples lecturas)
  isScanning: boolean; 
}

/**
 * Componente que encapsula la funcionalidad de la cámara para leer códigos QR.
 * Utiliza react-native-vision-camera (requiere instalación nativa).
 */
export const QrScannerComponent: React.FC<QrScannerProps> = ({ onScan, isScanning }) => {
  const [hasPermission, setHasPermission] = useState(false);
  
  // Obtiene el dispositivo de cámara trasero
  const device = useCameraDevice('back');
  
  /**
   * 1. Lógica para solicitar y verificar permisos de cámara
   */
  useEffect(() => {
    const checkPermissions = async () => {
      // Intentamos obtener el permiso actual
      let cameraPermission = await Camera.getCameraPermissionStatus();
      
      if (cameraPermission !== 'granted') {
        // Si no está concedido, lo solicitamos
        const newPermission: CameraPermissionStatus = await Camera.requestCameraPermission();
        
        if (newPermission === 'granted') {
          setHasPermission(true);
        } else if (newPermission === 'denied') {
          // Si es denegado, ofrecemos al usuario ir a la configuración del sistema
          Alert.alert(
            "Permiso Denegado",
            "Necesitas activar el permiso de cámara en la configuración de tu dispositivo para escanear códigos QR.",
            [
              { text: "Cancelar", style: 'cancel' },
              { text: "Abrir Configuración", onPress: () => Linking.openSettings() }
            ]
          );
          setHasPermission(false);
        }
      } else {
        setHasPermission(true);
      }
    };

    checkPermissions();
  }, []);

  /**
   * 2. Hook de escaneo de códigos QR/Barras
   */
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13', 'code-128'], // Tipos de códigos de activos comunes
    onCodeScanned: (codes: Code[]) => {
      // Solo escaneamos si el estado es 'isScanning'
      if (isScanning && codes.length > 0) {
        const scannedData = codes[0].value;
        if (scannedData) {
          console.log(`[ESCÁNER] Código escaneado: ${scannedData}`);
          onScan(scannedData); // Llama al callback con el resultado
        }
      }
    },
  });

  // --- Renderizado de Estados ---

  if (!hasPermission) {
    return (
      <View style={[styles.container, styles.centerText, {backgroundColor: '#1f2937'}]}>
        <Icon name="camera-off-outline" size={50} color="#fcd34d" />
        <Text style={styles.permissionText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={[styles.container, styles.centerText, {backgroundColor: '#4b5563'}]}>
        <Icon name="alert-circle-outline" size={50} color="#f87171" />
        <Text style={styles.permissionText}>Cámara no disponible o no encontrada en el dispositivo.</Text>
      </View>
    );
  }
  
  // --- Renderizado de la Cámara ---
  return (
    <View style={styles.container}>
      
      {/* 3. El componente de la cámara que captura el flujo de video */}
      {/* isActive={isScanning} asegura que la cámara solo consuma recursos cuando se necesita */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isScanning} 
        codeScanner={codeScanner} 
        // Opcional: configurar si quieres capturar el audio (generalmente no es necesario para un escáner)
        // audio={false}
      />
      
      {/* OVERLAY VISUAL DE ESCANEO */}
      <View style={styles.overlay}>
        <Text style={styles.scanText}>
          {isScanning ? 'Alinee el Código QR en el centro' : 'Escaneo completado'}
        </Text>
        
        {/* Marco del Escáner */}
        <View style={[styles.square, { 
          borderColor: isScanning ? '#3b82f6' : '#10b981',
          borderWidth: isScanning ? 4 : 8,
        }]} />
        
        {/* Ícono de Estado */}
        <Icon 
          name={isScanning ? "scan-outline" : "checkmark-circle-outline"} 
          size={80} 
          color={isScanning ? "#3b82f6" : "#10b981"} 
          style={styles.scanIcon}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'transparent', 
  },
  centerText: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    fontWeight: '500',
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: -100, // Lo movemos hacia arriba del centro del overlay
    marginBottom: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  square: {
    width: 250,
    height: 250,
    borderRadius: 15,
    backgroundColor: 'transparent',
    borderStyle: 'solid', 
  },
  scanIcon: {
    position: 'absolute',
    bottom: 50,
  }
});
