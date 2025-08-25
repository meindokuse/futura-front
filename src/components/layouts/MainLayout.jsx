import { NavLink as BaseNavLink, Outlet } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { 
  Box, 
  styled, 
  Menu, 
  MenuItem, 
  Typography, 
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  AccountCircle, 
  LocationOn, 
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../utils/utils';

// Стилизованные компоненты
const StyledNav = styled('nav')(({ theme }) => ({
  backgroundColor: '#121212',
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: theme.shadows[2],
  borderBottom: '2px solid #c83a0a',
  fontFamily: "'Montserrat', sans-serif",
  position: 'relative',
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
  },
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)'
  }
}));

const NavCenterContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
}));

const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block',
    marginRight: 'auto' // Добавлено для выравнивания
  }
}));

const RightContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginLeft: 'auto', // Добавлено для выравнивания
  [theme.breakpoints.down('md')]: {
    marginLeft: 0
  }
}));

const NavDivider = styled(Box)(({ theme }) => ({
  color: 'rgba(255, 255, 255, 0.3)',
  userSelect: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  }
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
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    padding: theme.spacing(2),
    '&.active::after': {
      display: 'none'
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

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: '#121212',
    color: 'white',
    width: '80%',
    maxWidth: '300px',
    padding: theme.spacing(2),
    boxSizing: 'border-box',
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  alignSelf: 'flex-end',
  marginBottom: theme.spacing(2),
  '&:hover': {
    color: '#c83a0a'
  }
}));

export default function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const locations = ['Проспект мира', 'Страстной', 'Никольская'];
  const [locationAnchorEl, setLocationAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
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
          withCredentials: true,
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

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { to: "/employers", label: "Персонал" },
    { to: "/schedule", label: "Расписание" },
    { to: "/events", label: "События" },
    { to: "/residents", label: "Постоянные гости" },
    { to: "/manuals", label: "Методички" },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StyledNav>
        {isMobile && (
          <MobileMenuButton 
            onClick={toggleMobileMenu}
            size="large"
            aria-label="Открыть меню"
          >
            <MenuIcon fontSize="large" />
          </MobileMenuButton>
        )}

        <LogoLink to="/">
          <img src="/logo.svg" alt="HP Futura Logo" />
        </LogoLink>

        {!isMobile && (
          <NavCenterContainer>
            {navItems.map((item, index) => (
              <Box key={item.to} sx={{ display: 'flex', alignItems: 'center' }}>
                <NavItem to={item.to}>{item.label}</NavItem>
                {index < navItems.length - 1 && <NavDivider>|</NavDivider>}
              </Box>
            ))}
          </NavCenterContainer>
        )}

        <RightContainer>
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
        </RightContainer>
      </StyledNav>

      {/* Мобильное меню */}
      <MobileDrawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleMobileMenu}
      >
        <CloseButton onClick={toggleMobileMenu}>
          <CloseIcon fontSize="large" />
        </CloseButton>
        
        <List>
          {navItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton 
                component={BaseNavLink}
                to={item.to}
                onClick={toggleMobileMenu}
                sx={{
                  color: 'white',
                  '&.active': {
                    color: '#c83a0a',
                    backgroundColor: 'rgba(200, 58, 10, 0.1)'
                  }
                }}
              >
                {item.label}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />

        <List>
          <ListItem disablePadding>
            <ListItemButton 
              component={BaseNavLink}
              to="/profile"
              onClick={toggleMobileMenu}
              sx={{
                color: 'white',
                '&.active': {
                  color: '#c83a0a',
                  backgroundColor: 'rgba(200, 58, 10, 0.1)'
                }
              }}
            >
              Профиль
            </ListItemButton>
          </ListItem>
          {isAdmin && (
            <ListItem disablePadding>
              <ListItemButton 
                component={BaseNavLink}
                to="/admin"
                onClick={toggleMobileMenu}
                sx={{
                  color: 'white',
                  '&.active': {
                    color: '#c83a0a',
                    backgroundColor: 'rgba(200, 58, 10, 0.1)'
                  }
                }}
              >
                Админ панель
              </ListItemButton>
            </ListItem>
          )}
          <ListItem disablePadding>
            <ListItemButton 
              component={BaseNavLink}
              to="/login"
              onClick={() => {
                toggleMobileMenu();
                handleLogout();
              }}
              sx={{
                color: 'white',
                '&.active': {
                  color: '#c83a0a',
                  backgroundColor: 'rgba(200, 58, 10, 0.1)'
                }
              }}
            >
              Выход
            </ListItemButton>
          </ListItem>
        </List>
      </MobileDrawer>

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