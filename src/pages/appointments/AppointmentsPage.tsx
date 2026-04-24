import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// Material-UI Components
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Tabs, 
  Tab, 
  TextField, 
  InputAdornment,
  Menu,
  MenuItem,
  Chip,
  Card,
  CardContent,
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress,
  Alert,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';

// Material-UI Icons
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  FilterList as FilterIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as PendingIcon
} from '@mui/icons-material';

// Appointment Service
import { 
  getAllAppointments, 
  createAppointment,
  getEmployeeSchedule
} from '../../services/appointment/appointment.service';
import type { 
  Appointment, 
  CreateAppointmentData 
} from '../../services/appointment/appointment.service';

// Service Service
import { getAllServices } from '../../services/service/service.service';
import type { Service } from '../../services/service/service.service';

// Employee Service
import { getAllEmployees } from '../../services/employee/employee.service';
import type { Employee } from '../../services/employee/employee.service';

// Date Picker Components
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';


const statusColors = {
  scheduled: 'warning',
  completed: 'success',
  cancelled: 'error',
  'no-show': 'error',
};

const statusIcons = {
  scheduled: <PendingIcon color="warning" />,
  completed: <CheckCircleIcon color="success" />,
  cancelled: <CancelIcon color="error" />,
  'no-show': <CancelIcon color="error" />,
};

export default function AppointmentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tabValue, setTabValue] = useState('hoy');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentAppointment, setCurrentAppointment] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAppointmentDialog, setNewAppointmentDialog] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [newAppointment, setNewAppointment] = useState<CreateAppointmentData>({
    serviceId: '',
    employeeId: '',
    appointmentDate: '',
    startTime: '',
    notes: ''
  });

  // Load appointments and services on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load appointments based on user role
        try {
          console.log('=== STARTING APPOINTMENTS LOADING ===');
          console.log('=== CURRENT USER ===', user);
          console.log('=== USER ROLE ===', user?.role);
          
          let appointmentsData;
          if (user?.role === 'employee') {
            // Load all employee's appointments (no date filter)
            const employeeId = user.id.toString(); // Use current user's ID
            console.log('=== LOADING ALL EMPLOYEE APPOINTMENTS FOR ===', employeeId);
            appointmentsData = await getEmployeeSchedule(employeeId); // No date parameters
          } else {
            // Load all appointments (admin view)
            const response = await getAllAppointments();
            appointmentsData = response.data || [];
          }
          
          console.log('=== RAW API RESPONSE ===', JSON.stringify(appointmentsData, null, 2));
          console.log('=== RESPONSE DATA ===', appointmentsData);
          
          if (appointmentsData && Array.isArray(appointmentsData)) {
            console.log('=== FOUND ARRAY WITH ===', appointmentsData.length, 'APPOINTMENTS');
            if (appointmentsData.length > 0) {
              console.log('=== FIRST APPOINTMENT ===', appointmentsData[0]);
            }
            
            const appointments = appointmentsData;
            console.log('Appointments array length:', appointments?.length || 0);
            
            // Log individual appointments
            appointments.forEach((app: any, index: number) => {
              console.log(`Appointment ${index + 1} - ALL FIELDS:`, app);
              console.log(`Appointment ${index + 1} - DATE FIELDS:`, {
                appointmentDate: app.appointmentDate,
                appointment_date: app.appointment_date,
                date: app.date,
                createdAt: app.createdAt,
                created_at: app.created_at,
                startTime: app.startTime,
                start_time: app.start_time
              });
            });
            
            setAllAppointments(appointments);
          } else {
            console.log('=== NOT AN ARRAY OR NO DATA ===');
            setAllAppointments([]);
            setAppointments([]);
          }
        } catch (appointmentErr) {
          console.error('Error loading appointments:', appointmentErr);
        }
        
        // Load services
        try {
          const servicesResponse = await getAllServices();
          
          if (servicesResponse && servicesResponse.length > 0) {
            setServices(servicesResponse);
            setNewAppointment(prev => ({ ...prev, serviceId: servicesResponse[0].id }));
          } else {
            setServices([]);
            setNewAppointment(prev => ({ ...prev, serviceId: '' }));
          }
        } catch (servicesErr) {
          console.error('Error loading services:', servicesErr);
          setError('Error al cargar los servicios');
          setServices([]);
          setNewAppointment(prev => ({ ...prev, serviceId: '' }));
        }
        
        // Load employees
        try {
          const employeesResponse = await getAllEmployees();
          
          if (employeesResponse && employeesResponse.length > 0) {
            setEmployees(employeesResponse);
            setNewAppointment(prev => ({ ...prev, employeeId: employeesResponse[0].id }));
          } else {
            setEmployees([]);
            setNewAppointment(prev => ({ ...prev, employeeId: '' }));
          }
        } catch (employeesErr) {
          console.error('Error loading employees:', employeesErr);
          setError('Error al cargar los empleados');
          setEmployees([]);
          setNewAppointment(prev => ({ ...prev, employeeId: '' }));
        }
        
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter appointments by selected date
  useEffect(() => {
    if (selectedDate && allAppointments.length > 0) {
      const selectedDateStr = selectedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
      console.log('Filtering appointments for date:', selectedDateStr);
      
      const filteredAppointments = allAppointments.filter((app: any) => {
        const appointmentDate = app.appointment_date;
        console.log(`Checking appointment ${app.id}: ${appointmentDate} === ${selectedDateStr}`);
        return appointmentDate === selectedDateStr;
      });
      
      console.log(`Found ${filteredAppointments.length} appointments for ${selectedDateStr}`);
      setAppointments(filteredAppointments);
    } else {
      // If no date selected, show all appointments
      setAppointments(allAppointments);
    }
  }, [selectedDate, allAppointments]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  // Get current week days
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1); // Adjust to start on Monday
    const monday = new Date(today.setDate(diff));
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      weekDays.push(day);
    }
    
    return weekDays;
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return allAppointments.filter(app => {
      const appointmentDate = (app as any).appointment_date;
      return appointmentDate === dateStr;
    });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentAppointment(id);
    
    // Find and set the selected appointment for details display
    const appointment = allAppointments.find(app => app.id === id);
    if (appointment) {
      setSelectedAppointment(appointment);
    }
  };

  const handleDayClick = (day: Date) => {
    // Format date as YYYY-MM-DD for the appointment form
    const formattedDate = day.toISOString().split('T')[0];
    
    // Reset new appointment form and set the date
    setNewAppointment({
      serviceId: '',
      employeeId: '',
      appointmentDate: formattedDate,
      startTime: '',
      notes: ''
    });
    
    // Open the new appointment dialog
    setNewAppointmentDialog(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    console.log('Editar cita:', currentAppointment);
    handleCloseMenu();
  };

  const handleCancel = () => {
    console.log('Cancelar cita:', currentAppointment);
    handleCloseMenu();
  };

  const handleComplete = () => {
    console.log('Completar cita:', currentAppointment);
    handleCloseMenu();
  };

  const handleNewAppointment = () => {
    setNewAppointmentDialog(true);
  };

  const handleCloseNewAppointmentDialog = () => {
    setNewAppointmentDialog(false);
    setNewAppointment({
      serviceId: '',
      employeeId: '',
      appointmentDate: '',
      startTime: '',
      notes: ''
    });
  };

  const handleCreateAppointment = async () => {
    console.log('Create appointment button clicked');
    console.log('New appointment data:', newAppointment);
    
    // Validate required fields
    if (!newAppointment.serviceId) {
      console.log('Missing serviceId');
      setError('Por favor selecciona un servicio');
      return;
    }
    
    if (!newAppointment.employeeId) {
      console.log('Missing employeeId');
      setError('Por favor selecciona un empleado');
      return;
    }
    
    if (!newAppointment.appointmentDate) {
      console.log('Missing appointmentDate');
      setError('Por favor selecciona una fecha');
      return;
    }
    
    if (!newAppointment.startTime) {
      console.log('Missing startTime');
      setError('Por favor selecciona una hora');
      return;
    }
    
    console.log('Validation passed, creating appointment...');
    
    try {
      const createdAppointment = await createAppointment(newAppointment);
      console.log('Appointment created successfully:', createdAppointment);
      console.log('Current appointments state before update:', appointments);
      
      // Fix the iterable error by ensuring prev is an array
      setAppointments(prev => {
        console.log('Previous appointments in setState:', prev);
        console.log('Is prev an array?', Array.isArray(prev));
        
        if (!Array.isArray(prev)) {
          console.log('prev is not an array, using empty array');
          return [createdAppointment];
        }
        
        return [...prev, createdAppointment];
      });
      
      handleCloseNewAppointmentDialog();
      setError(null);
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError('Error al crear la cita');
    }
  };

  const handleNewAppointmentChange = (field: keyof CreateAppointmentData, value: string) => {
    setNewAppointment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Citas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNewAppointment}>
          Nueva Cita
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange}
                sx={{ mb: { xs: 2, sm: 0 } }}
              >
                <Tab label="Hoy" value="hoy" />
                <Tab label="Semana" value="semana" />
                <Tab label="Todas" value="todas" />
              </Tabs>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                  <DatePicker
                    label="Seleccionar fecha"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    slotProps={{
                      textField: {
                        size: 'small',
                        sx: { width: 200 }
                      }
                    }}
                  />
                </LocalizationProvider>
                <TextField
                  size="small"
                  placeholder="Buscar citas..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 250 }}
                />
                <Button variant="outlined" startIcon={<FilterIcon />}>
                  Filtros
                </Button>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
                {tabValue === 'hoy' && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Citas del Día
                    </Typography>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { 
                        xs: '1fr', 
                        sm: 'repeat(2, 1fr)', 
                        md: 'repeat(3, 1fr)', 
                        lg: 'repeat(4, 1fr)' 
                      }, 
                      gap: 2 
                    }}>
                      {[10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => {
                        console.log(`Rendering hour slot ${hour}:00`);
                        const hourAppointments = appointments && appointments.length > 0 
                          ? appointments.filter(app => {
                              // Parse the start_time field (e.g., "16:00:00") to get hour
                              const startTime = (app as any).start_time || (app as any).startTime;
                              const appointmentHour = parseInt(startTime?.split(':')[0] || '0');
                              console.log(`Appointment ${app.id} at ${(app as any).appointment_date} ${startTime}, hour: ${appointmentHour}, target: ${hour}`);
                              return appointmentHour === hour;
                            })
                          : [];
                        
                        console.log(`Found ${hourAppointments.length} appointments for hour ${hour}`);
                        
                        return (
                          <Card key={hour} sx={{ minHeight: 150 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Typography variant="h6" color="primary" sx={{ mr: 1 }}>
                                  {hour}:00
                                </Typography>
                                <Chip 
                                  size="small" 
                                  label={`${hourAppointments.length} citas`}
                                  color={hourAppointments.length > 0 ? 'primary' : 'default'}
                                />
                              </Box>
                              <Box sx={{ minHeight: 80 }}>
                                {hourAppointments.length > 0 ? (
                                  hourAppointments.map(app => (
                                    <Paper
                                      key={app.id}
                                      sx={{ 
                                        p: 1, 
                                        mb: 1, 
                                        cursor: 'pointer',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        '&:hover': {
                                          backgroundColor: 'action.hover',
                                          borderColor: 'primary.main'
                                        }
                                      }}
                                      onClick={(e: React.MouseEvent<HTMLElement>) => handleMenuClick(e, app.id)}
                                    >
                                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        {statusIcons[app.status]}
                                        <Typography variant="caption" sx={{ ml: 0.5 }}>
                                          {(app as any).start_time?.substring(0, 5) || ''}
                                        </Typography>
                                      </Box>
                                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                        {app.user?.first_name} {app.user?.last_name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {app.service?.name}
                                      </Typography>
                                    </Paper>
                                  ))
                                ) : (
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    height: 80,
                                    color: 'text.secondary'
                                  }}>
                                    <Typography variant="body2">
                                      Sin citas
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {tabValue === 'semana' && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Vista de Semana
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                      {getWeekDays().map((day, index) => {
                        const dayAppointments = getAppointmentsForDate(day);
                        const dayName = day.toLocaleDateString('es-ES', { weekday: 'short' });
                        const dayNumber = day.getDate();
                        const monthName = day.toLocaleDateString('es-ES', { month: 'short' });
                        
                        return (
                          <Card 
                            key={index} 
                            sx={{ 
                              minHeight: 200,
                              cursor: 'pointer',
                              '&:hover': {
                                backgroundColor: 'action.hover',
                                boxShadow: 4
                              }
                            }}
                            onClick={() => handleDayClick(day)}
                          >
                            <CardContent>
                              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                {dayName} {dayNumber} {monthName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                {dayAppointments.length} cita{dayAppointments.length !== 1 ? 's' : ''}
                              </Typography>
                              <Box sx={{ maxHeight: 140, overflowY: 'auto' }}>
                                {dayAppointments.length > 0 ? (
                                  dayAppointments.map(app => (
                                    <Chip
                                      key={app.id}
                                      label={`${(app as any).start_time?.substring(0, 5) || ''} - ${app.user?.first_name || 'Cliente'}`}
                                      size="small"
                                      color={statusColors[app.status] as any}
                                      sx={{ mb: 0.5, width: '100%', fontSize: '0.7rem' }}
                                      onClick={(e: React.MouseEvent<HTMLElement>) => {
                                        e.stopPropagation();
                                        handleMenuClick(e, app.id);
                                      }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    Sin citas
                                  </Typography>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {tabValue === 'todas' && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Todas las Citas
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {appointments && appointments.length > 0 ? (
                        appointments.map(app => (
                          <Card key={app.id} sx={{ minWidth: 200, maxWidth: 250 }}>
                            <CardContent>
                              <Typography variant="subtitle2">
                                {(app as any).appointment_date} - {(app as any).start_time?.substring(0, 5) || ''}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {app.user?.first_name} {app.user?.last_name}
                              </Typography>
                              <Typography variant="body2">
                                {app.service?.name}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No hay citas programadas
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>
              
              <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
                <Box sx={{ position: 'sticky', top: 20 }}>
                  <Typography variant="h6" gutterBottom>
                    Detalles de la Cita
                  </Typography>
                  <Paper sx={{ p: 2 }}>
                    {selectedAppointment ? (
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Información de la Cita
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Fecha y Hora
                          </Typography>
                          <Typography variant="body1">
                            {(selectedAppointment as any).appointment_date} - {(selectedAppointment as any).start_time?.substring(0, 5) || ''}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Cliente
                          </Typography>
                          <Typography variant="body1">
                            {selectedAppointment.user?.first_name} {selectedAppointment.user?.last_name}
                          </Typography>
                          {selectedAppointment.user?.email && (
                            <Typography variant="body2" color="text.secondary">
                              {selectedAppointment.user.email}
                            </Typography>
                          )}
                          {selectedAppointment.user?.phone && (
                            <Typography variant="body2" color="text.secondary">
                              {selectedAppointment.user.phone}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Servicio
                          </Typography>
                          <Typography variant="body1">
                            {selectedAppointment.service?.name}
                          </Typography>
                          {selectedAppointment.service?.duration && (
                            <Typography variant="body2" color="text.secondary">
                              Duración: {selectedAppointment.service.duration} minutos
                            </Typography>
                          )}
                          {selectedAppointment.service?.price && (
                            <Typography variant="body2" color="text.secondary">
                              Precio: ${selectedAppointment.service.price}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="text.secondary">
                            Estado
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {statusIcons[selectedAppointment.status]}
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                              {selectedAppointment.status === 'scheduled' ? 'Programada' :
                               selectedAppointment.status === 'completed' ? 'Completada' :
                               selectedAppointment.status === 'cancelled' ? 'Cancelada' :
                               selectedAppointment.status === 'no-show' ? 'No asistió' : selectedAppointment.status}
                            </Typography>
                          </Box>
                        </Box>

                        {(selectedAppointment as any).notes && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Notas
                            </Typography>
                            <Typography variant="body2">
                              {(selectedAppointment as any).notes}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            startIcon={<EditIcon />}
                            onClick={() => handleEdit()}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="success"
                            startIcon={<CheckCircleIcon />}
                            onClick={() => handleComplete()}
                          >
                            Completar
                          </Button>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancel()}
                          >
                            Cancelar
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="subtitle2" color="text.secondary">
                        Selecciona una cita para ver los detalles
                      </Typography>
                    )}
                  </Paper>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Paper>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleComplete}>
          <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} /> Marcar como Completada
        </MenuItem>
        <MenuItem onClick={handleCancel} sx={{ color: 'error.main' }}>
          <CancelIcon sx={{ mr: 1 }} /> Cancelar Cita
        </MenuItem>
      </Menu>

      {/* New Appointment Dialog */}
      <Dialog open={newAppointmentDialog} onClose={handleCloseNewAppointmentDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Cita</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="service-select-label">Servicio</InputLabel>
              <Select
                labelId="service-select-label"
                value={newAppointment.serviceId}
                onChange={(e) => handleNewAppointmentChange('serviceId', e.target.value)}
                label="Servicio"
                disabled={loading}
              >
                {loading ? (
                  <MenuItem disabled>Cargando servicios...</MenuItem>
                ) : Array.isArray(services) && services.length > 0 ? (
                  services.map((service) => (
                    <MenuItem key={service.id} value={service.id}>
                      {service.name} - ${service.price} ({service.duration}min)
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay servicios disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="employee-select-label">Empleado</InputLabel>
              <Select
                labelId="employee-select-label"
                value={newAppointment.employeeId}
                onChange={(e) => handleNewAppointmentChange('employeeId', e.target.value)}
                label="Empleado"
                disabled={loading}
              >
                {loading ? (
                  <MenuItem disabled>Cargando empleados...</MenuItem>
                ) : Array.isArray(employees) && employees.length > 0 ? (
                  employees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay empleados disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
            <TextField
              label="Fecha de la Cita"
              type="date"
              value={newAppointment.appointmentDate}
              onChange={(e) => handleNewAppointmentChange('appointmentDate', e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { shrink: "true" } }}
            />
            <TextField
              label="Hora de Inicio"
              type="time"
              value={newAppointment.startTime}
              onChange={(e) => handleNewAppointmentChange('startTime', e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { shrink: "true" } }}
            />
            <TextField
              label="Notas"
              multiline
              rows={3}
              value={newAppointment.notes}
              onChange={(e) => handleNewAppointmentChange('notes', e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewAppointmentDialog}>Cancelar</Button>
          <Button onClick={handleCreateAppointment} variant="contained">Crear Cita</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
