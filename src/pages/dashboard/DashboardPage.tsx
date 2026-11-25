import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Card, CardContent, Divider, Stack, CircularProgress, Alert } from '@mui/material';
import { People, CalendarToday, Spa, AttachMoney } from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { getAllServices } from '../../services/service/service.service';
import { getAllAppointments, getEmployeeSchedule } from '../../services/appointment/appointment.service';
import type { Appointment } from '../../services/appointment/appointment.service';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: SvgIconComponent;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  loading?: boolean;
}

const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getAppointmentDate = (appointment: Appointment & { appointment_date?: string }): string =>
  appointment.appointment_date || appointment.appointmentDate || '';


const StatCard = ({ title, value, icon: Icon, color = 'primary', loading = false }: StatCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {loading ? (
            <CircularProgress size={32} sx={{ mt: 1 }} />
          ) : (
            <Typography variant="h4">{value}</Typography>
          )}
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.light`,
            color: `${color}.dark`,
            borderRadius: '50%',
            width: 56,
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon fontSize="large" />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user, isEmployee } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [totalServices, setTotalServices] = useState(0);

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user) return;

      setLoading(true);
      setError(null);

      const today = formatDateLocal(new Date());

      try {
        const usersPromise = userService.getUsers().catch(() => []);
        const servicesPromise = getAllServices().catch(() => []);

        const appointmentsPromise = isEmployee
          ? getEmployeeSchedule(user.id.toString(), today, today).catch(() => [])
          : getAllAppointments()
              .then((response) => response.data || [])
              .catch(() => []);

        const [users, services, appointments] = await Promise.all([
          usersPromise,
          servicesPromise,
          appointmentsPromise,
        ]);

        setTotalUsers(users.length);
        setTotalServices(services.filter((service) => service.is_active).length);

        const todayCount = appointments.filter(
          (appointment) => getAppointmentDate(appointment) === today
        ).length;
        setTodayAppointments(todayCount);
      } catch (err) {
        console.error('Error loading dashboard stats:', err);
        setError('No se pudieron cargar las estadísticas del panel.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [user, isEmployee]);

  const appointmentsTitle = isEmployee ? 'Mis Citas Hoy' : 'Citas Hoy';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Panel de Control
      </Typography>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ mb: 4, flexWrap: 'wrap' }}
        useFlexGap
      >
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
          <StatCard
            title="Total Usuarios"
            value={totalUsers.toLocaleString('es-CO')}
            icon={People}
            color="primary"
            loading={loading}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
          <StatCard
            title={appointmentsTitle}
            value={todayAppointments.toLocaleString('es-CO')}
            icon={CalendarToday}
            color="secondary"
            loading={loading}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
          <StatCard
            title="Servicios"
            value={totalServices.toLocaleString('es-CO')}
            icon={Spa}
            color="success"
            loading={loading}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
          <StatCard
            title="Ingresos"
            value="—"
            icon={AttachMoney}
            color="warning"
          />
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mt: 3 }}>
        <Box sx={{ width: { xs: '100%', md: '66.666%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Citas Recientes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography color="textSecondary">
              Gráfico de citas recientes aparecerá aquí
            </Typography>
          </Paper>
        </Box>
        <Box sx={{ width: { xs: '100%', md: '33.333%' } }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Actividad Reciente
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography color="textSecondary">
              Lista de actividades recientes aparecerá aquí
            </Typography>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
