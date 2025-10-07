import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
// Se asume que react-native-svg está instalado y enlazado correctamente
import QRCode from 'react-native-qrcode-svg'; 
import Icon from 'react-native-vector-icons/Ionicons'; 

interface QrCodeGeneratorProps {
  assetId: string;
  assetName: string;
  size?: number;
}

/**
 * Componente reutilizable para generar y mostrar un Código QR.
 * Utiliza una exportación nombrada para coincidir con la importación en la pantalla.
 */
export const QrCodeGenerator: React.FC<QrCodeGeneratorProps> = ({ 
  assetId, 
  assetName,
  size = 200 
}) => {
  
  // Función simulada para imprimir el código
  const handlePrint = () => {
    Alert.alert(
      "Impresión Solicitada",
      `Preparando para imprimir el Código QR.\nContenido del código (ID): ${assetId}`,
      [
        { text: "Cancelar" },
        { text: "Imprimir (Simulado)", onPress: () => console.log('Simulación de impresión iniciada') }
      ]
    );
  };

  const qrSize = Math.max(150, size); 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Código QR del Activo</Text>

      {/* Área de Generación del Código QR */}
      <View style={[styles.qrCodeBox, { width: qrSize, height: qrSize }]}>
        <QRCode
          value={assetId} // El contenido del QR es el Asset ID
          size={qrSize - 20} 
          color="#1f2937"
          backgroundColor="white"
        />
      </View>
      {/* Fin Área de Generación del Código */}

      <Text style={styles.idLabel}>ID del Activo:</Text>
      <Text style={styles.idValue}>{assetId}</Text>
      
      <Text style={styles.nameLabel}>Nombre:</Text>
      <Text style={styles.nameValue}>{assetName}</Text>
      
      <TouchableOpacity 
        style={styles.printButton}
        onPress={handlePrint}
      >
        <Icon name="print-outline" size={20} color="#fff" style={styles.iconMargin} />
        <Text style={styles.printButtonText}>Imprimir Código</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
      android: { elevation: 5 },
    }),
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
