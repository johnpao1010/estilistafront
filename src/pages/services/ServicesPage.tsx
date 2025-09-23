import { useState } from 'react';
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
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  AccessTime as DurationIcon,
  AttachMoney as PriceIcon,
} from '@mui/icons-material';

interface Service {
  id: number;
  name: string;
  category: string;
  duration: number;
  price: number;
  active: boolean;
  description?: string;
}

// Datos de ejemplo - en una aplicación real, estos vendrían de una API
const services: Service[] = [
  { 
    id: 1, 
    name: 'Corte de Cabello', 
    category: 'Cortes', 
    duration: 45, 
    price: 300,
    active: true
  },
  { 
    id: 2, 
    name: 'Barba', 
    category: 'Barba', 
    duration: 30, 
    price: 150,
    active: true
  },
  { 
    id: 3, 
    name: 'Tinte', 
    category: 'Coloración', 
    duration: 120, 
    price: 600,
    active: true
  },
  { 
    id: 4, 
    name: 'Manicure', 
    category: 'Uñas', 
    duration: 60, 
    price: 250,
    active: false
  },
  { 
    id: 5, 
    name: 'Pedicure', 
    category: 'Uñas', 
    duration: 75, 
    price: 300,
    active: true
  },
];

const categories = [
  'Cortes',
  'Barba',
  'Coloración',
  'Tratamientos',
  'Uñas',
  'Otros'
];

export default function ServicesPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    duration: 30,
    price: 0,
    description: '',
    active: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const isEditMode = !!selectedService;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
        category: service.category,
        duration: service.duration,
        price: service.price,
        description: service.description || '',
        active: service.active
      });
    } else {
      setSelectedService(null);
      setFormData({
        name: '',
        category: '',
        duration: 30,
        price: 0,
        description: '',
        active: true
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' || name === 'duration' ? parseFloat(value) || 0 : value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'El nombre es requerido';
    if (!formData.category) errors.category = 'La categoría es requerida';
    if (formData.duration <= 0) errors.duration = 'La duración debe ser mayor a 0';
    if (formData.price < 0) errors.price = 'El precio no puede ser negativo';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Datos del servicio:', formData);
      // Aquí iría la lógica para guardar el servicio
      handleCloseDialog();
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
          <Button variant="outlined" startIcon={<CategoryIcon />}>
            Categorías
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Categoría</TableCell>
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
                    <TableCell>
                      <Chip 
                        label={service.category} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <DurationIcon color="action" sx={{ mr: 1 }} />
                        {service.duration} min
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" alignItems="center" justifyContent="flex-end">
                        <PriceIcon color="action" sx={{ mr: 1 }} />
                        ${service.price.toFixed(2)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={service.active ? 'Activo' : 'Inactivo'} 
                        color={service.active ? 'success' : 'default'}
                        size="small"
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
              
              <FormControl fullWidth variant="outlined" error={!!formErrors.category}>
                <InputLabel id="category-label">Categoría</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleSelectChange}
                  input={<OutlinedInput label="Categoría" />}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <FormHelperText>{formErrors.category}</FormHelperText>
                )}
              </FormControl>
              
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
                    checked={formData.active}
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
