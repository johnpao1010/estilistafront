import type { ReactNode } from 'react';
import { Box, Container, Paper, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import authClockImage from '../assets/portada.jpeg';

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
  '& img': {
    width: 90,
    height: 90,
    marginBottom: theme.spacing(1),
    objectFit: 'contain',
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
          <img src={authClockImage} alt="Pao W Studio logo" />
          <Typography variant="h4" component="h1" color="primary" fontWeight="bold">
            Pao W Studio    
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
          © {new Date().getFullYear()} Pao W Studio. All rights reserved.
        </Typography>
      </Box>
    </AuthContainer>
  );
}

// This component can be used as a wrapper in your routes like this:
// <AuthLayout title="Sign In" subtitle="Welcome back! Please sign in to continue.">
//   {/* Your login form */}
// </AuthLayout>
