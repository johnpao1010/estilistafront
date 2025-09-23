import { useState } from 'react';
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
  Stack
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

// Date Picker Components
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

// Datos de ejemplo - en una aplicación real, estos vendrían de una API
const appointments = [
  { 
    id: 1, 
    client: 'María García', 
    service: 'Corte de Cabello', 
    date: '2023-06-15T10:00:00', 
    duration: 60,
    status: 'confirmada',
    stylist: 'Juan Pérez'
  },
  { 
    id: 2, 
    client: 'Carlos López', 
    service: 'Barba', 
    date: '2023-06-15T11:30:00', 
    duration: 30,
    status: 'pendiente',
    stylist: 'Ana Martínez'
  },
  { 
    id: 3, 
    client: 'Laura Fernández', 
    service: 'Tinte + Corte', 
    date: '2023-06-15T14:00:00', 
    duration: 120,
    status: 'confirmada',
    stylist: 'Juan Pérez'
  },
  { 
    id: 4, 
    client: 'Roberto Sánchez', 
    service: 'Corte de Cabello', 
    date: '2023-06-15T16:00:00', 
    duration: 45,
    status: 'cancelada',
    stylist: 'Ana Martínez'
  },
];

const statusColors = {
  confirmada: 'success',
  pendiente: 'warning',
  cancelada: 'error',
};

const statusIcons = {
  confirmada: <CheckCircleIcon color="success" />,
  pendiente: <PendingIcon color="warning" />,
  cancelada: <CancelIcon color="error" />,
};

export default function AppointmentsPage() {
  const [tabValue, setTabValue] = useState('hoy');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [currentAppointment, setCurrentAppointment] = useState<number | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setCurrentAppointment(id);
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Citas</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Nueva Cita
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ mb: { xs: 2, sm: 0 } }}
          >
            <Tab label="Hoy" value="hoy" />
            <Tab label="Próximas" value="proximas" />
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Citas del Día
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                {[10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => (
                  <Card key={hour} sx={{ minWidth: 120 }}>
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">
                        {hour}:00
                      </Typography>
                      <Box sx={{ mt: 1, minHeight: 100 }}>
                        {appointments
                          .filter(app => new Date(app.date).getHours() === hour)
                          .map(app => (
                            <Chip
                              key={app.id}
                              label={`${app.client} - ${app.service}`}
                              size="small"
                              color={statusColors[app.status as keyof typeof statusColors] as any}
                              sx={{ mb: 0.5, width: '100%', justifyContent: 'flex-start' }}
                              icon={statusIcons[app.status as keyof typeof statusIcons]}
                            />
                          ))}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Detalles de la Cita
              </Typography>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Selecciona una cita para ver los detalles
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Box>
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
    </Box>
  );
}
