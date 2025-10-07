import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';

import {QrCodeGenerator} from '../../shared/components/QrCodeGenerator'; // Importamos el componente
// Asumiendo que tu stack de exploración se llama 'StackExplore' y tiene una ruta 'AdminDashboard'
import { StackExploreParams } from '../../routes/StackExplore'; 

const GenerateQrScreen: React.FC = () => {
   const navigation = useNavigation<NavigationProp<StackExploreParams>>()
    // El assetId viene de la navegación 
    const { assetId,  asset_name = "Asset new"  } = useRoute<RouteProp<StackExploreParams, 'GenerateQrScreen'>>().params;

    useEffect(()=>{
        console.log({
            assetId, asset_name
        });
        
    },[])

  // Función para regresar al Dashboard
  const handleFinish = () => {
    // Navegamos de vuelta al inicio del módulo, limpiando el stack si es necesario
    // Usamos .popToTop() o navigate('AdminDashboard') dependiendo de tu stack
    navigation.navigate('Admin');
  };

  return (
    <SafeAreaView style={styles.flex1}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Encabezado de Confirmación */}
        <View style={styles.confirmationHeader}>
            <Icon name="checkmark-circle-outline" size={60} color="#10b981" />
            <Text style={styles.mainTitle}>¡Activo Creado con Éxito!</Text>
            <Text style={styles.subtitle}>
                A continuación, genera e imprime el código QR para el nuevo activo.
            </Text>
        </View>

        {/* COMPONENTE GENERADOR DE QR */}
        <QrCodeGenerator 
          assetId={assetId ?? "ID_ASSET"} 
          assetName={asset_name ?? "NAME_ASSET"} 
          size={250} // Puedes ajustar el tamaño aquí
        />
        
        {/* BOTÓN DE FINALIZAR */}
        <TouchableOpacity 
          style={styles.finishButton}
          onPress={handleFinish}
        >
          <Icon name="home-outline" size={20} color="#fff" style={styles.iconMargin} />
          <Text style={styles.finishButtonText}>Finalizar y Volver al Dashboard</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
    backgroundColor: '#f3f4f6', // Fondo claro
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  confirmationHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 15,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1f2937',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4f46e5', // Morado
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 40,
    width: '100%',
    maxWidth: 350,
    justifyContent: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  iconMargin: {
    marginRight: 10,
  }
});

export default GenerateQrScreen;
