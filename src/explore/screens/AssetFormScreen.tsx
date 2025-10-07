import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, SafeAreaView, StyleSheet, 
  ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { useNavigation } from '@react-navigation/native';
import { useUserProfile } from '../../shared/hooks/useUserProfile';
import { useAssets } from '../../shared/hooks/useAssets'; // Importamos el hook de aplicación

// Tipado del formulario (exportado para ser usado en useAssets)
export interface AssetFormData {
  asset_name: string;
  serial_number: string;
  description: string;
  status: 'active' | 'in_maintenance' | 'decommissioned';
  asset_type: string; // Tipo de Activo: Computadora, Impresora, etc.
  
  make: string; // Marca
  model: string; // Modelo
  approx_cost: number; // Costo aproximado (0 si es null/no aplica)
  color: string; // Color del activo
  important_data: string; // Otros datos importantes
}

// Valores iniciales
const INITIAL_STATE: AssetFormData = {
  asset_name: '',
  serial_number: '',
  description: '',
  status: 'active',
  asset_type: '',
  
  // VALORES INICIALES PARA NUEVAS PROPIEDADES
  make: '',
  model: '',
  approx_cost: 0,
  color: '',
  important_data: '',
};

const AssetFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const { userInfo } = useUserProfile();
  
  // Usamos el hook de aplicación para la función de guardado
  const { createAsset, loading: hookLoading } = useAssets(); 

  const [formData, setFormData] = useState<AssetFormData>(INITIAL_STATE);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Combinamos el estado de carga del hook con el local de la UI
  const loading = hookLoading || localLoading; 
  
  const handleInputChange = (name: keyof AssetFormData, value: string | number) => {
    // Manejo especial para approx_cost (si es string vacío, lo pone a 0)
    if (name === 'approx_cost') {
        const numericValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
        setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveAsset = async () => {
    // 1. Validaciones de la UI
    if (!formData.asset_name || !formData.serial_number || !formData.asset_type) {
      Alert.alert('Faltan datos', 'Por favor, ingrese el Nombre, el Número de Serie y el Tipo de Activo.');
      return;
    }
    if (!userInfo?.uid) {
        Alert.alert('Error de Usuario', 'No se pudo identificar el usuario para registrar el activo. Intente re-iniciar sesión.');
        return;
    }

    setLocalLoading(true);
    
    try {
      // 2. LLAMADA AL HOOK: Delegamos la lógica de guardado a useAssets
      const newDocId = await createAsset(formData, userInfo.uid);
      
      console.log("Nuevo Asset guardado con ID:", newDocId);
      
      // 3. Feedback al usuario y navegación
      Alert.alert('Éxito', 'El equipo ha sido registrado exitosamente en el inventario.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
    } catch (error) {
      console.error("Error al guardar el equipo (vía hook):", error);
      Alert.alert('Error', 'No se pudo registrar el equipo. Revise su conexión o permisos.');
    } finally {
      setLocalLoading(false);
    }
  };

  // Botón de estado para la selección de tipo
  const StatusButton: React.FC<{ label: string, value: AssetFormData['asset_type'] }> = ({ label, value }) => (
    <TouchableOpacity
      className={`py-3 px-4 rounded-lg border-2 m-1 ${formData.asset_type === value ? 'bg-indigo-600 border-indigo-700' : 'bg-white border-gray-300'}`}
      onPress={() => handleInputChange('asset_type', value)}
    >
      <Text className={`font-semibold ${formData.asset_type === value ? 'text-white' : 'text-gray-700'}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center p-4 bg-white shadow-md border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Icon name="arrow-back-outline" size={28} color="#1f2937" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-xl font-bold text-gray-800 mr-10">
          Registrar Nuevo Equipo
        </Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Tipo de Activo */}
        <Text style={styles.label}>Tipo de Activo (*)</Text>
        <View className="flex-row flex-wrap mb-4">
          <StatusButton label="Computadora" value="Computer" />
          <StatusButton label="Monitor" value="Monitor" />
          <StatusButton label="Impresora" value="Printer" />
          <StatusButton label="Escáner" value="Scanner" />
          <StatusButton label="Otro" value="Other" />
        </View>

        {/* Nombre del Activo */}
        <Text style={styles.label}>Nombre del Activo (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Laptop Dell Latitude 5420"
          value={formData.asset_name}
          onChangeText={(text) => handleInputChange('asset_name', text)}
        />
        
        {/* Marca */}
        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Dell, HP, Samsung"
          value={formData.make}
          onChangeText={(text) => handleInputChange('make', text)}
        />

        {/* Modelo */}
        <Text style={styles.label}>Modelo</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Latitude 5420, EliteBook G8"
          value={formData.model}
          onChangeText={(text) => handleInputChange('model', text)}
        />
        
        {/* Número de Serie */}
        <Text style={styles.label}>Número de Serie / HP (*)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: XJ12345ABC678"
          value={formData.serial_number}
          onChangeText={(text) => handleInputChange('serial_number', text)}
        />
        
        {/* Costo Aproximado */}
        <Text style={styles.label}>Costo Aproximado (USD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: 850.50 (O 0 si no aplica)"
          value={formData.approx_cost === 0 ? '' : String(formData.approx_cost)}
          onChangeText={(text) => handleInputChange('approx_cost', text)}
          keyboardType="numeric"
        />

        {/* Color */}
        <Text style={styles.label}>Color</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Negro, Plateado"
          value={formData.color}
          onChangeText={(text) => handleInputChange('color', text)}
        />

        {/* Otros Datos Importantes */}
        <Text style={styles.label}>Otros Datos Importantes</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ej: Ubicación, Departamento de destino, Licencias asociadas."
          value={formData.important_data}
          onChangeText={(text) => handleInputChange('important_data', text)}
          multiline={true}
          numberOfLines={4}
        />

        {/* Descripción */}
        <Text style={styles.label}>Especificaciones Técnicas</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ej: Core i5, 16GB RAM, SSD 512GB"
          value={formData.description}
          onChangeText={(text) => handleInputChange('description', text)}
          multiline={true}
          numberOfLines={4}
        />
        
        {/* Indicador de Carga */}
        {loading && (
          <View className="flex-row justify-center items-center mt-4">
            <ActivityIndicator size="small" color="#4f46e5" />
            <Text className="text-gray-600 ml-2">Procesando...</Text>
          </View>
        )}

        {/* Botón de Guardar */}
        <TouchableOpacity
          onPress={handleSaveAsset}
          disabled={loading}
          className={`py-4 rounded-xl mt-6 mb-8 ${loading ? 'bg-gray-400' : 'bg-indigo-600'} shadow-md`}
        >
          <Text className="text-white text-lg font-bold text-center">
            {loading ? 'Guardando...' : 'Registrar Equipo'}
          </Text>
        </TouchableOpacity>
        
        <Text className="text-xs text-gray-500 mt-3 text-center">
          (*) Campos obligatorios
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: 'white',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1f2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
});

export { AssetFormScreen };
