import { NavLink as BaseNavLink, Outlet } from 'react-router-dom';
import { Button, Box, styled, Menu, MenuItem, Typography, } from '@mui/material';
import { useState,useEffect } from 'react';
import { Snackbar, Alert } from '@mui/material';
import {jwtDecode} from 'jwt-decode';


// Стилизованные компоненты
const StyledNav = styled('nav')(({ theme }) => ({
  backgroundColor: '#2a2a2a',
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  boxShadow: theme.shadows[2],
  borderBottom: '4px solid #c83a0a'
}));

const StyledNavLink = styled(BaseNavLink)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  margin: theme.spacing(0, 2),
  padding: theme.spacing(1, 3),
  borderRadius: '20px',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: '#3a3a3a',
  },
  '&.active': {
    backgroundColor: '#c83a0a',
    fontWeight: 'bold',
    boxShadow: theme.shadows[2],
    transform: 'scale(1.05)'
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
    fontSize: '0.9rem'
  }
}));

const LogoutButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  left: theme.spacing(2),
  color: 'white',
  borderColor: 'white',
  '&:hover': {
    borderColor: '#c83a0a',
    backgroundColor: 'rgba(200, 58, 10, 0.1)'
  }
}));

const LocationButton = styled(Button)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  color: 'white',
  borderColor: 'white',
  '&:hover': {
    borderColor: '#c83a0a',
    backgroundColor: 'rgba(200, 58, 10, 0.1)'
  }
}));

export default function AdminLayout({mode}) {
  const locations = ['Проспект мира', 'Страстной', 'Никольская'];
  const [currentLocation, setCurrentLocation] = useState(locations[0]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);


  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StyledNav>
        

        
      <LogoutButton 
        variant="outlined" 
        size="small"
        component={BaseNavLink}
        to="/"  
        sx={{
          color: 'white',
          borderColor: 'white',
          '&:hover': {
            borderColor: '#c83a0a',
            color: '#c83a0a'
          }
        }}
      >
        Выход
      </LogoutButton>
              
        {/* Центральное меню */}
        <Box sx={{ display: 'flex' }}>
          <StyledNavLink to="/admin/employers">Сотрудники</StyledNavLink>
          <StyledNavLink to="/admin/schedule">Расписание</StyledNavLink>
          <StyledNavLink to="/admin/events">События</StyledNavLink>
          <StyledNavLink to="/admin/residents">Постоянники</StyledNavLink>
          <StyledNavLink to="/admin/manuals">Методички</StyledNavLink>
        </Box>
        
        {/* Выпадающий список локаций справа */}
        <LocationButton
          variant="outlined"
          size="small"
          onClick={handleClick}
          aria-controls={open ? 'location-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          {currentLocation}
        </LocationButton>
        <Menu
          id="location-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'location-button',
          }}
        >
          {locations.map((location) => (
            <MenuItem 
              key={location}
              onClick={() => handleLocationSelect(location)}
              selected={location === currentLocation}
            >
              {location}
            </MenuItem>
          ))}
        </Menu>
      </StyledNav>

      {/* Единый Outlet с объединенным контекстом */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet context={{ handleNotification, currentLocation,mode }} />
      </Box>

      {/* Уведомление */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}