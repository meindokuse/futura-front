import HomePage from '../pages/Home'
import { NavLink as BaseNavLink, Outlet } from 'react-router-dom';
import { Box, Typography, Button, Grid, CircularProgress, Pagination } from '@mui/material';


export default function AccessDeniedPage() {
    return (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}>
          <Typography variant="h4" color="error">
            Нет доступа!
          </Typography>
          <Button 
            variant="contained" 
            color="error"
            component={BaseNavLink}
            to="/"
          >
            На главную
          </Button>
        </Box>
      );
}