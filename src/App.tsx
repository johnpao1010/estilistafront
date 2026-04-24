import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import ServicesPage from './pages/services/ServicesPage';

// Types
type PrivateRouteProps = {
  children?: React.ReactNode;
};

type AuthRouteProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
  },
});

// Componente de ruta protegida
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

// Componente de ruta de autenticación
const AuthRoute: React.FC<AuthRouteProps> = ({ children, title, subtitle = '' }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {children}
    </AuthLayout>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Ruta de inicio redirige a dashboard */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              {/* Rutas públicas */}
              <Route
                path="/login"
                element={
                  <AuthRoute title="Iniciar Sesión" subtitle="Ingresa tus credenciales para acceder">
                    <LoginPage />
                  </AuthRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <AuthRoute title="Registro" subtitle="Crea una nueva cuenta">
                    <RegisterPage />
                  </AuthRoute>
                }
              />

              {/* Rutas protegidas */}
              <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
                <Route path="services" element={<ServicesPage />} />
                {/* Agrega aquí más rutas protegidas */}
              </Route>

              {/* Ruta 404 - Not Found */}
              <Route 
                path="*" 
                element={
                  <div style={{ padding: '2rem' }}>
                    <h1>404 - Página no encontrada</h1>
                    <p>La página que estás buscando no existe.</p>
                  </div>
                } 
              />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
