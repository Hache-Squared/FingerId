import React, { FC, useState } from 'react';
import { 
  Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, 
  TouchableOpacity, View, ActivityIndicator, 
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
// MODIFICADO: Importamos el tipo UserRole y UserProfileData para el tipado
import { useUsers, UserRole, ReportKey } from '../../shared/hooks/useUsers'; 
import { Dropdown } from 'react-native-element-dropdown'; 
import { useUserProfile } from '../../shared/hooks/useUserProfile'; 

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

// AGREGADO: Lista de reportes para los checkboxes
const REPORT_OPTIONS: { key: ReportKey; label: string }[] = [
  { key: 'ASSIGNMENT', label: 'Reporte de Asignaciones' },
  { key: 'ASSET_LOG', label: 'Reporte de Logs de Equipo' },
  { key: 'USER_CREATION', label: 'Reporte de Creación Usuarios' },
  { key: 'MAINT_ASSET', label: 'Reporte de Mantenimiento por Equipo' },
  { key: 'MAINT_ADMIN', label: 'Reporte de Mantenimiento por Admin' },
];

const RegisterUserScreen: FC = () => {
  const navigation = useNavigation();
  const { registerUser, loading: usersLoading, error: usersError } = useUsers();
  const { userInfo } = useUserProfile();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState(departmentOptions[0].value);
  const [role, setRole] = useState<UserRole>(roleOptions[1].value as UserRole); 
  
  // AGREGADO: Estados para los permisos de reportes
  const [canCreateUsers, setcanCreateUsers] = useState(false);
  const [canViewReports, setCanViewReports] = useState(false);
  const [specificReportPermissions, setSpecificReportPermissions] = useState<Record<string, boolean>>(() => 
    REPORT_OPTIONS.reduce((acc, curr) => ({ ...acc, [curr.key]: false }), {})
  );

  const typeOfForm = 'register'; 

  const validateFields = () => {
    // ... lógica de validación existente
    if (!firstName || !lastName || !email || !password || !employeeId) {
      Alert.alert('Error', 'Todos los campos de Nombre, Apellido, Correo, Contraseña y Matrícula son obligatorios.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }
    return true;
  };

  const handleRegisterUser = async () => {
    if (!validateFields()) return;

    // MODIFICADO: Ahora incluimos los permisos en profileData
    const profileData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      employeeId: employeeId.trim(),
      department: department,
      role: role,
      createdByUid: userInfo?.uid ?? "Admin",
      // AGREGADO: Estructura de permisos
      permissions: {
        canViewReports: canViewReports,
        canCreateUsers: canCreateUsers,
        specificReports: specificReportPermissions as Record<ReportKey, boolean>,
      }
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
            
            {/* Campos de Nombre, Apellido, Correo, Contraseña, Matrícula, Departamento y Rol... (SIN CAMBIOS) */}
            {/* ... */}
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
                    itemTextStyle={{
                      color: "#111"
                    }}
                    onChange={(item: any) => {
                        setDepartment(item.value);
                    }}
                />
            </View>

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
                    itemTextStyle={{
                      color: "#111"
                    }}
                    onChange={(item: any) => {
                        setRole(item.value as UserRole);
                    }}
                />
            </View>
            
            {/* ======================================= */}
            {/* AGREGADO: PERMISOS DE REPORTES SECTION */}
            {/* ======================================= */}

            <View style={styles.sectionHeader}>
                <Icon name="stats-chart-outline" size={20} color="#1f2937" />
                <Text style={styles.sectionTitle}>Permisos:</Text>
            </View>
            {/* Toggle Principal: Habilitar Reportes */}
            <View style={[styles.switchRow, {marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10}]}>
                <Text style={[styles.label, {marginBottom: 0}]}>Habilitar acceso a Crear Usuarios:</Text>
                <TouchableOpacity
                    style={[styles.switchContainer, canCreateUsers ? styles.switchActive : styles.switchInactive]}
                    onPress={() => {
                        setcanCreateUsers(!canCreateUsers);
                    }}
                >
                    <View style={[styles.switchHandle, canCreateUsers ? styles.handleActive : styles.handleInactive]} />
                </TouchableOpacity>
            </View>

            {/* Toggle Principal: Habilitar Reportes */}
            <View style={[styles.switchRow, {marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10}]}>
                <Text style={[styles.label, {marginBottom: 0}]}>Habilitar acceso a Reportes:</Text>
                <TouchableOpacity
                    style={[styles.switchContainer, canViewReports ? styles.switchActive : styles.switchInactive]}
                    onPress={() => {
                        setCanViewReports(!canViewReports);
                        // Opcional: Deseleccionar todos si se deshabilita el acceso general
                        if (canViewReports) {
                            setSpecificReportPermissions(REPORT_OPTIONS.reduce((acc, curr) => ({ ...acc, [curr.key]: false }), {}));
                        }
                    }}
                >
                    <View style={[styles.switchHandle, canViewReports ? styles.handleActive : styles.handleInactive]} />
                </TouchableOpacity>
            </View>

            {/* Lista de Checkboxes de Reportes */}
            {canViewReports && (
                <View style={styles.reportsListContainer}>
                    <Text style={{fontSize: 14, color: '#4b5563', fontWeight: '600', marginBottom: 8}}>Reportes específicos:</Text>
                    {REPORT_OPTIONS.map(report => (
                        <TouchableOpacity
                            key={report.key}
                            style={styles.checkboxRow}
                            onPress={() => 
                                setSpecificReportPermissions(prev => ({
                                    ...prev,
                                    [report.key]: !prev[report.key],
                                }))
                            }
                        >
                            <View 
                                style={[
                                    styles.checkbox, 
                                    specificReportPermissions[report.key] ? styles.checkboxChecked : styles.checkboxUnchecked
                                ]}
                            >
                                {specificReportPermissions[report.key] && (
                                    <Icon name="checkmark" size={14} color="#fff" />
                                )}
                            </View>
                            <Text style={styles.checkboxLabel}>{report.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

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

// ESTILOS ADICIONALES PARA LA PANTALLA DE REGISTRO
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
    color:"#111"
  },
  placeholderStyle: {
    fontSize: 16,
    color:"#111"
  },
  selectedTextStyle: {
    fontSize: 16,
    color:"#111"
  },
  // --- ESTILOS AGREGADOS PARA PERMISOS ---
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1', // Indigo 500
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  // Estilos Toggle (Switch)
  switchContainer: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  switchActive: {
    backgroundColor: '#3b82f6', // Azul más fuerte
  },
  switchInactive: {
    backgroundColor: '#ccc',
  },
  switchHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  handleActive: {
    transform: [{ translateX: 22 }],
  },
  handleInactive: {
    transform: [{ translateX: 0 }],
  },
  // Estilos Checkbox
  reportsListContainer: {
    marginTop: 5,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkboxUnchecked: {
    borderColor: '#9ca3af',
    backgroundColor: 'white',
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#374151',
  }
});

export { RegisterUserScreen };