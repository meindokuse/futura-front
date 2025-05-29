import { NavLink as BaseNavLink, Outlet } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { Box, styled, Menu, MenuItem, Typography, IconButton } from '@mui/material';
import { AccountCircle,LocationOn } from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../utils/utils';

const StyledNav = styled('nav')(({ theme }) => ({
  backgroundColor: '#121212',
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: theme.shadows[2],
  borderBottom: '2px solid #c83a0a',
  fontFamily: "'Montserrat', sans-serif",
}));

const LogoLink = styled(BaseNavLink)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  '& img': {
    height: '40px',
    transition: 'transform 0.3s ease',
  },
  '&:hover img': {
    transform: 'scale(1.1)'
  }
}));

const NavCenterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)'
}));

const NavDivider = styled(Box)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.3)',
  userSelect: 'none'
}));

const NavItem = styled(BaseNavLink)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  padding: theme.spacing(1, 2),
  position: 'relative',
  transition: 'all 0.3s ease',
  fontWeight: 500,
  fontSize: '1rem',
  '&:hover': {
    color: '#c83a0a'
  },
  '&.active': {
    color: '#c83a0a',
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -10,
      left: 0,
      right: 0,
      height: '2px',
      backgroundColor: '#c83a0a'
    }
  }
}));

const ProfileIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  transition: 'all 0.3s ease',
  '&:hover': {
    color: '#c83a0a',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
}));

const LocationIconButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  transition: 'all 0.3s ease',
  marginLeft: theme.spacing(2),
  '&:hover': {
    color: '#c83a0a',
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  }
}));

export default function MainLayout() {
  const locations = ['Проспект мира', 'Страстной', 'Никольская'];
  const [locationAnchorEl, setLocationAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(locations[0]);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const fetchLatestEvent = async () => {
    try {
      const response = await axios.post(`${API_URL}auth/logout`,{
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          withCredentials: true
        }
      );
      return response.status
    } catch (err) {
      console.error('Ошибка загрузки событий:', err);
    } 
  };

  const checkAdmin = async () => {
      try {
        const response = await axios.get(`${API_URL}auth/check_admin`, {
          withCredentials: true, // Для передачи куков
        });
        setIsAdmin(response.status === 200);
      } catch (error) {
        setIsAdmin(false);
      }
  };

  useEffect(() => {
    checkAdmin();
  }, []);



  const handleLocationClick = (event) => {
    setLocationAnchorEl(event.currentTarget);
  };

  const handleLocationClose = () => {
    setLocationAnchorEl(null);
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    handleLocationClose();
  };

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    const status_code = await fetchLatestEvent()
    if (status_code === 200) {
      setProfileAnchorEl(null);
    }
  };

  const handleNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StyledNav>
        <LogoLink to="/">
          <img src="/logo.svg" alt="HP Futura Logo" />
        </LogoLink>

        <NavCenterContainer>
          <NavItem to="/employers">Работники</NavItem>
          <NavDivider>|</NavDivider>
          <NavItem to="/schedule">Расписание</NavItem>
          <NavDivider>|</NavDivider>
          <NavItem to="/events">События</NavItem>
          <NavDivider>|</NavDivider>
          <NavItem to="/residents">Постоянники</NavItem>
          <NavDivider>|</NavDivider>
          <NavItem to="/manuals">Методички</NavItem>
        </NavCenterContainer>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LocationIconButton 
            onClick={handleLocationClick}
            size="large"
            aria-label="Выбор локации"
            title="Выбрать локацию"
          >
            <LocationOn fontSize="medium" />
          </LocationIconButton>

          <Menu
            anchorEl={locationAnchorEl}
            open={Boolean(locationAnchorEl)}
            onClose={handleLocationClose}
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

          <ProfileIconButton 
            onClick={handleProfileClick}
            size="large"
            aria-label="Личный кабинет"
          >
            <AccountCircle fontSize="large" />
          </ProfileIconButton>

          <Menu
            anchorEl={profileAnchorEl}
            open={Boolean(profileAnchorEl)}
            onClose={handleProfileClose}
          >
            <MenuItem 
              onClick={handleProfileClose}
              component={BaseNavLink}
              to="/profile"  
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(200, 58, 10, 0.1)'
                }
              }}
            >
              Профиль
            </MenuItem>
            {isAdmin && (
              <MenuItem 
                onClick={handleProfileClose}
                component={BaseNavLink}
                to="/admin"  
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(200, 58, 10, 0.1)'
                  }
                }}
              >
                Админ панель
              </MenuItem>
            )}
            <MenuItem 
              onClick={handleLogout}
              component={BaseNavLink}
              to="/login"  
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(200, 58, 10, 0.1)'
                }
              }}
            >
              Выход
            </MenuItem>
          </Menu>
        </Box>
      </StyledNav>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet context={{ handleNotification, currentLocation }} />
      </Box>

      <Box component="footer" sx={{ 
        backgroundColor: '#121212',
        color: 'white',
        py: 3,
        textAlign: 'center',
        borderTop: '2px solid #c83a0a'
      }}>
        <Typography>© {new Date().getFullYear()} HP Futura. Все права защищены.</Typography>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}