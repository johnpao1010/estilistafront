import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  FormHelperText,
  Switch,
  FormControlLabel,
  CircularProgress as MuiCircularProgress,
  Alert as MuiAlert
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccessTime as DurationIcon,
  AttachMoney as PriceIcon,
} from '@mui/icons-material';
import api from '../../api/axios';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: string; // Price comes as string from the API
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  deletedAt: string | null;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Service, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'deletedAt'>>({
    name: '',
    description: '',
    duration: 30,
    price: '0.00',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchServices = async () => {
    try {
      const response = await api.get('/services/');
      // Access services from response.data.data.services according to the API response structure
      const servicesData = response.data.data?.services || [];
      console.log('Services to render:', servicesData);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setError(null);
      return servicesData;
    } catch (err) {
      console.error('Error al obtener los servicios:', err);
      setError('No se pudieron cargar los servicios. Intente nuevamente más tarde.');
      setServices([]); // Ensure services is always an array
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const isEditMode = !!selectedService;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <MuiCircularProgress />
      </Box>
    );
  }

  // Mostrar mensaje de error si hay un error
  if (error) {
    return (
      <Box p={3}>
        <MuiAlert severity="error">{error}</MuiAlert>
      </Box>
    );
  }

  const handleClickMenu = (event: React.MouseEvent<HTMLElement>, service: Service) => {
    setAnchorEl(event.currentTarget);
    setSelectedService(service);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenDialog = (service: Service | null = null) => {
    if (service) {
      setSelectedService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        duration: service.duration,
        price: service.price,
        is_active: service.is_active
      });
    } else {
      setSelectedService(null);
      setFormData({
        name: '',
        description: '',
        duration: 30,
        price: '0.00',
        is_active: true
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? value.toString() : value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    
    const duration = parseFloat(formData.duration.toString());
    if (isNaN(duration) || duration <= 0) {
      errors.duration = 'La duración debe ser mayor a 0';
    }
    
    const price = parseFloat(formData.price.toString());
    if (isNaN(price) || price <= 0) {
      errors.price = 'El precio debe ser mayor a 0';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const serviceData = {
          ...formData,
          price: parseFloat(formData.price.toString()) // Ensure price is a number
        };
        
        if (isEditMode && selectedService) {
          // Update existing service
          await api.put(`/services/${selectedService.id}`, serviceData);
        } else {
          // Create new service
          await api.post('/services/', serviceData);
        }
        
        // Refresh services list
        fetchServices();
        handleCloseDialog();
      } catch (error) {
        console.error('Error al guardar el servicio:', error);
        setError('Ocurrió un error al guardar el servicio. Por favor, intente de nuevo.');
      }
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    console.log('Eliminar servicio:', selectedService?.id);
    setDeleteDialogOpen(false);
    handleCloseMenu();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Servicios</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Servicio
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <TextField
            variant="outlined"
            placeholder="Buscar servicios..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
        </Box>
          
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripcion</TableCell>
                <TableCell align="right">Duración (min)</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {services
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((service) => (
                  <TableRow key={service.id} hover>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>{service.description}</TableCell>
                    <TableCell>{service.duration} min</TableCell>
                    <TableCell>${parseFloat(service.price).toFixed(2)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={service.is_active ? 'Activo' : 'Inactivo'} 
                        color={service.is_active ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={(e) => handleClickMenu(e, service)}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={services.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Menú de acciones */}
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
        <MenuItem onClick={() => { handleOpenDialog(selectedService); handleCloseMenu(); }}>
          <EditIcon sx={{ mr: 1 }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>

      {/* Diálogo de confirmación de eliminación */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          ¿Eliminar servicio?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            ¿Estás seguro de que deseas eliminar el servicio "{selectedService?.name}"? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de formulario de servicio */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>{isEditMode ? 'Editar Servicio' : 'Nuevo Servicio'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
              <TextField
                autoFocus
                margin="dense"
                name="name"
                label="Nombre del servicio"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
              
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  margin="dense"
                  name="duration"
                  label="Duración (minutos)"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.duration}
                  onChange={handleInputChange}
                  error={!!formErrors.duration}
                  helperText={formErrors.duration}
                  InputProps={{
                    endAdornment: <DurationIcon color="action" />,
                  }}
                />
                
                <TextField
                  margin="dense"
                  name="price"
                  label="Precio"
                  type="number"
                  fullWidth
                  variant="outlined"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={!!formErrors.price}
                  helperText={formErrors.price}
                  InputProps={{
                    startAdornment: <PriceIcon color="action" />,
                  }}
                />
              </Box>
              
              <TextField
                margin="dense"
                name="description"
                label="Descripción"
                type="text"
                fullWidth
                multiline
                rows={3}
                variant="outlined"
                value={formData.description}
                onChange={handleInputChange}
              />
              
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_active}
                    onChange={handleSwitchChange}
                    name="active"
                    color="primary"
                  />
                }
                label="Servicio activo"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {isEditMode ? 'Guardar Cambios' : 'Crear Servicio'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
