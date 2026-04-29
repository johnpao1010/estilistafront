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
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { userService, type User } from '../../services/userService';

export default function UsersPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClickMenu = (event: React.MouseEvent<HTMLElement>, userId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedUserId(userId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    // Lógica para editar usuario
    console.log('Editar usuario:', selectedUserId);
    handleCloseMenu();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Error al cargar los usuarios. Por favor, intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    fetchUsers();
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.role.toLowerCase().includes(searchLower) ||
      user.phone.toLowerCase().includes(searchLower)
    );
  });

  const handleView = async () => {
    if (!selectedUserId) return;
    try {
      const user = await userService.getUserById(selectedUserId);
      console.log('Ver usuario:', user);
      // Aquí podrías abrir un modal o navegar a una página de detalles
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
    handleCloseMenu();
  };

  const handleDelete = async () => {
    if (!selectedUserId) return;
    
    if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
      try {
        await userService.deleteUser(selectedUserId);
        // Actualizar la lista de usuarios después de eliminar
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Error al eliminar el usuario. Por favor, intente de nuevo.');
      }
    }
    handleCloseMenu();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Usuarios</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />} 
            onClick={handleRefresh}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Actualizar
          </Button>
          <Button variant="contained" startIcon={<AddIcon />}>
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3, maxWidth: 400 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha de Registro</TableCell>
                <TableCell align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.role} 
                          size="small" 
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          variant={user.role === 'admin' ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.is_active ? 'Activo' : 'Inactivo'} 
                          color={user.is_active ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell align="right">
                        <IconButton 
                          onClick={(e) => handleClickMenu(e, user.id)}
                          disabled={loading}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    {searchTerm ? 'No se encontraron usuarios que coincidan con la búsqueda' : 'No hay usuarios registrados'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => {
                const countText = count !== -1 ? count.toString() : `más de ${to}`;
                return `${from}-${to} de ${countText}`;
              }}
            />
          </Box>
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
        <MenuItem onClick={handleView} disabled={loading}>
          <VisibilityIcon sx={{ mr: 1, color: 'text.secondary' }} /> Ver Detalles
        </MenuItem>
        <MenuItem onClick={handleEdit} disabled={loading}>
          <EditIcon sx={{ mr: 1, color: 'primary.main' }} /> Editar
        </MenuItem>
        <MenuItem onClick={handleDelete} disabled={loading} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
}
