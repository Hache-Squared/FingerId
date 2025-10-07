import React, { useState, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons'; 

// Importación de hooks y tipos
import { StackExploreParams } from '../../routes/StackExplore';
import { useAssets } from '../../shared/hooks/useAssets';

// Componente de escáner (debe coincidir con la ruta anterior)
import { QrScannerComponent } from '../../shared/components/QrScannerComponent'; 

/**
 * Pantalla dedicada a escanear un código QR de un activo, buscarlo 
 * y redirigir a su vista de detalles.
 */
const ScanAssetScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<StackExploreParams>>();
  const { findAssetByAssetId } = useAssets();
  
  // Estado para controlar el proceso de escaneo y búsqueda
  const [isScanning, setIsScanning] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [scannedId, setScannedId] = useState<string | null>(null);

  /**
   * Maneja el código QR escaneado: busca el activo y navega.
   * @param data El AssetId que fue escaneado.
   */
  const handleScanSuccess = useCallback(async (data: string) => {
    // 1. Detener el escaneo para evitar lecturas múltiples
    if (!isScanning) return;
    setIsScanning(false);
    setScannedId(data);
    
    // 2. Iniciar la búsqueda
    setIsSearching(true);

    try {
      console.log(`Buscando activo con ID: ${data}`);
      
      // Asume que findAssetByAssetId recibe el ID y devuelve el objeto Asset o null
      const asset = await findAssetByAssetId(data); 

      if (asset && asset?.assetId) {
        Alert.alert("Éxito", `Activo encontrado: ${asset.asset_name}`);
        // 3. Redirigir a la vista de detalles
        navigation.navigate('AssetDetailScreen', { assetId: asset.assetId }); 

      } else {
        // Activo no encontrado (o la búsqueda falló)
        Alert.alert(
          "Activo No Encontrado", 
          `No se encontró un activo con el código ${data}. Verifique el código.`,
          [{ text: "Reintentar", onPress: () => restartScan() }]
        );
      }
    } catch (error) {
      console.error("Error al buscar el activo:", error);
      Alert.alert(
        "Error de Conexión", 
        "Hubo un problema al buscar el activo en la base de datos.",
        [{ text: "Reintentar", onPress: () => restartScan() }]
      );
    } finally {
      setIsSearching(false);
    }
  }, [isScanning, navigation, findAssetByAssetId]);

  // Función para reiniciar el proceso de escaneo
  const restartScan = () => {
    setIsScanning(true);
    setScannedId(null);
    setIsSearching(false);
  };
  
  // Mensaje a mostrar según el estado
  const statusMessage = isSearching 
    ? `Buscando activo: ${scannedId}`
    : isScanning 
      ? 'Preparado para escanear'
      : `Escaneo completado: ${scannedId}`;

  return (
    <SafeAreaView style={styles.flex1}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Icon name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Escáner de Activos QR
        </Text>
        <View style={styles.headerButton} /> 
      </View>

      <QrScannerComponent 
        onScan={handleScanSuccess} 
        isScanning={isScanning} 
      />

      <View style={styles.footerBar}>
        {isSearching ? (
          <ActivityIndicator color="#4f46e5" size="small" style={{ marginRight: 10 }}/>
        ) : (
          <Icon 
            name={isScanning ? "qr-code-outline" : "file-tray-full-outline"} 
            size={20} 
            color="#4f46e5" 
            style={{ marginRight: 10 }}
          />
        )}
        <Text style={styles.statusText}>{statusMessage}</Text>
        
        {!isScanning && (
            <TouchableOpacity onPress={restartScan} style={styles.retryButton}>
                <Text style={styles.retryText}>Reintentar</Text>
            </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1f2937', // Fondo oscuro
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  retryButton: {
    marginLeft: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#4f46e5',
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
  }
});

export default ScanAssetScreen;
