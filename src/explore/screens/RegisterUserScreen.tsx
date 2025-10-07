import React, { FC, useState } from 'react';
import { 
  Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, 
  TouchableOpacity, View, ActivityIndicator, 
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useUsers, UserRole } from '../../shared/hooks/useUsers';
import { Dropdown } from 'react-native-element-dropdown'; // Usaremos Dropdown simple para el rol
import { useUserProfile } from '../../shared/hooks/useUserProfile'; // Para obtener el UID actual

// Opciones de Rol para el Dropdown
const roleOptions = [
  { label: 'Administrador (Admin)', value: 'admin' },
  { label: 'Usuario Estándar (User)', value: 'user' },
];

// Opciones de Departamento (Ejemplo)
const departmentOptions = [
  { label: 'IT', value: 'IT' },
  { label: 'Operaciones', value: 'Operations' },
  { label: 'Ventas', value: 'Sales' },
  { label: 'Recursos Humanos', value: 'HR' },
];

const RegisterUserScreen: FC = () => {
  const navigation = useNavigation();
  const { registerUser, loading: usersLoading, error: usersError } = useUsers();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState(departmentOptions[0].value);
  const [role, setRole] = useState<UserRole>(roleOptions[1].value as UserRole); // Por defecto: User

  // Eliminamos lógica antigua de 'typeOfForm' y 'photo'
  const typeOfForm = 'register'; 

  const validateFields = () => {
    if (!firstName || !lastName || !email || !password || !employeeId) {
      Alert.alert('Error', 'Todos los campos de Nombre, Apellido, Correo, Contraseña y Matrícula son obligatorios.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    // Añadir validación de correo más estricta si es necesario
    return true;
  };

  const handleRegisterUser = async () => {
    if (!validateFields()) return;

    const profileData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      employeeId: employeeId.trim(),
      department: department,
      role: role,
    };

    const newUid = await registerUser(email.trim(), password.trim(), profileData);
    
    if (newUid) {
      Alert.alert('Éxito', `Usuario ${firstName} (${newUid.substring(0, 8)}...) registrado correctamente.`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else if (usersError) {
      Alert.alert('Error de Registro', usersError);
    }
  };


  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                <Icon name="arrow-back-outline" size={28} color="#1f2937" />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-xl font-bold text-gray-800 mr-10">
                {typeOfForm == "register" ? "Registrar" : "Actualizar"} Empleado
            </Text>
        </View>

        <View className='w-full p-4'>
            
            {/* Campos de Nombre y Apellido */}
            <View className='flex-row space-x-3 mb-3'>
                <View style={styles.inputGroup} className='flex-1'>
                    <Text style={styles.label}>Nombre:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={firstName}
                        placeholder='Nombre(s)'
                        onChangeText={setFirstName}
                    />
                </View>
                <View style={styles.inputGroup} className='flex-1'>
                    <Text style={styles.label}>Apellido:</Text>
                    <TextInput
                        style={styles.textInput}
                        value={lastName}
                        placeholder='Apellido(s)'
                        onChangeText={setLastName}
                    />
                </View>
            </View>

            {/* Correo y Contraseña */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo Electrónico:</Text>
                <TextInput
                    style={styles.textInput}
                    value={email}
                    placeholder='ejemplo@empresa.com'
                    keyboardType='email-address'
                    autoCapitalize='none'
                    onChangeText={setEmail}
                />
            </View>
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña Temporal:</Text>
                <TextInput
                    style={styles.textInput}
                    value={password}
                    placeholder='Mínimo 6 caracteres'
                    secureTextEntry
                    onChangeText={setPassword}
                />
            </View>
            
            {/* Matrícula / ID de Empleado */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Matrícula / ID de Empleado:</Text>
                <TextInput
                    style={styles.textInput}
                    value={employeeId}
                    editable={typeOfForm == "register" ? true : false}
                    placeholder='Ej. 1000234'
                    keyboardType='numeric'
                    onChangeText={setEmployeeId}
                />
            </View>

            {/* Departamento (Dropdown) */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Departamento:</Text>
                <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={departmentOptions}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Selecciona el departamento"
                    value={department}
                    onChange={(item: any) => {
                        setDepartment(item.value);
                    }}
                />
            </View>

            {/* Rol (Dropdown) */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Rol de Acceso:</Text>
                <Dropdown
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={roleOptions}
                    maxHeight={300}
                    labelField="label"
                    valueField="value"
                    placeholder="Selecciona el rol"
                    value={role}
                    onChange={(item: any) => {
                        setRole(item.value as UserRole);
                    }}
                />
            </View>
            
            {/* Botón de Registro */}
            <TouchableOpacity 
                onPress={handleRegisterUser} 
                disabled={usersLoading}
                className={`w-full rounded-xl m-2 p-4 self-center ${usersLoading ? 'bg-indigo-300' : 'bg-indigo-600'} shadow-lg`}
            >
                {usersLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text className='text-xl text-center font-bold text-white'>
                        {typeOfForm == "register" ? "Generar" : "Actualizar"} Empleado
                    </Text>
                )}
            </TouchableOpacity>

            {/* Mensaje de Error */}
            {usersError && (
              <Text className="text-red-600 text-center mt-3 font-medium">
                  {usersError}
              </Text>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937', // Dark gray
    marginBottom: 4,
  },
  textInput: {
    height: 50,
    borderColor: '#d1d5db', // Gray 300
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  // Estilos específicos para Dropdown (react-native-element-dropdown)
  dropdown: {
    height: 50,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#1f2937',
  },
});

export { RegisterUserScreen };
