import type { ReactNode } from 'react';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 450,
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: theme.shadows[3],
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}));

const Logo = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  '& svg': {
    width: 60,
    height: 60,
    marginBottom: theme.spacing(1),
  },
}));

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const theme = useTheme();

  return (
    <AuthContainer maxWidth={false}>
      <StyledPaper elevation={3}>
        <Logo>
          <svg viewBox="0 0 24 24" fill={theme.palette.primary.main}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
            <path d="M13 7h-2v6h6v-2h-4z" />
          </svg>
          <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
            Salon Belleza
          </Typography>
        </Logo>

        <Box width="100%" textAlign="center" mb={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="textSecondary">
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box width="100%">
          {children}
        </Box>
      </StyledPaper>
      
      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          © {new Date().getFullYear()} Salon Belleza. All rights reserved.
        </Typography>
      </Box>
    </AuthContainer>
  );
}

// This component can be used as a wrapper in your routes like this:
// <AuthLayout title="Sign In" subtitle="Welcome back! Please sign in to continue.">
//   {/* Your login form */}
// </AuthLayout>
