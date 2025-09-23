import { Box, Typography, Paper, Card, CardContent, Divider, Stack } from '@mui/material';
import { People, CalendarToday, Spa, AttachMoney } from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';


interface StatCardProps {
  title: string;
  value: string | number;
  icon: SvgIconComponent;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

const StatCard = ({ title, value, icon: Icon, color = 'primary' }: StatCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
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
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Panel de Control
      </Typography>
      
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={3} 
        sx={{ mb: 4, flexWrap: 'wrap' }}
        useFlexGap
      >
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
          <StatCard 
            title="Total Usuarios" 
            value="1,256" 
            icon={People} 
            color="primary" 
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
          <StatCard 
            title="Citas Hoy" 
            value="24" 
            icon={CalendarToday} 
            color="secondary" 
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
          <StatCard 
            title="Servicios" 
            value="15" 
            icon={Spa} 
            color="success" 
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 18px)' } }}>
          <StatCard 
            title="Ingresos" 
            value="$12,540" 
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
