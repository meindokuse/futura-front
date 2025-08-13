import { NavLink as BaseNavLink, Outlet } from 'react-router-dom';
import { 
  Button, 
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
import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { Menu as MenuIcon, Close as CloseIcon, LocationOn } from '@mui/icons-material';

const StyledNav = styled('nav')(({ theme }) => ({
  backgroundColor: '#121212',
  padding: theme.spacing(2),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  minHeight: '64px',
  position: 'relative',
  boxShadow: theme.shadows[2],
  borderBottom: '2px solid #c83a0a'
}));


const MobileMenuButton = styled(IconButton)(({ theme }) => ({
  color: 'white',
  position: 'absolute',
  left: theme.spacing(2),
  display: 'none',
  [theme.breakpoints.down('md')]: {
    display: 'block'
  }
}));

const StyledNavLink = styled(BaseNavLink)(({ theme }) => ({
  color: 'white',
  textDecoration: 'none',
  margin: theme.spacing(0, 1),
  padding: theme.spacing(1, 2),
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
  [theme.breakpoints.down('md')]: {
    width: '100%',
    margin: 0,
    borderRadius: 0,
    padding: theme.spacing(2),
    '&.active': {
      transform: 'none'
    }
  }
}));

const MobileDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    backgroundColor: '#2a2a2a',
    color: 'white',
    width: '80%',
    maxWidth: '300px'
  }
}));

const NavButton = styled(Button)(({ theme }) => ({
  color: 'white',
  borderColor: 'white',
  '&:hover': {
    borderColor: '#c83a0a',
    color: '#c83a0a'
  }
}));

export default function AdminLayout({ mode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const locations = ['Проспект мира', 'Страстной', 'Никольская'];
  const [currentLocation, setCurrentLocation] = useState(locations[0]);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const toggleMobileMenu = () => setMobileOpen(!mobileOpen);
  const handleNotification = (message, severity) => setNotification({ open: true, message, severity });
  const handleCloseNotification = () => setNotification(prev => ({ ...prev, open: false }));
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLocationSelect = (location) => {
    setCurrentLocation(location);
    handleClose();
  };

  const navItems = [
    { to: "/admin/employers", label: "Сотрудники" },
    { to: "/admin/schedule", label: "Расписание" },
    { to: "/admin/events", label: "События" },
    { to: "/admin/residents", label: "Постоянники" },
    { to: "/admin/manuals", label: "Методички" }
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <StyledNav>
        <MobileMenuButton onClick={toggleMobileMenu}>
          <MenuIcon fontSize="large" />
        </MobileMenuButton>

        <NavButton 
          variant="outlined" 
          size="small"
          component={BaseNavLink}
          to="/"
          sx={{
            position: 'absolute',
            left: isMobile ? '60px' : '16px'
          }}
        >
          Выход
        </NavButton>

        {!isMobile && (
          <Box sx={{ display: 'flex', marginLeft: 'auto', marginRight: 'auto' }}>
            {navItems.map(item => (
              <StyledNavLink key={item.to} to={item.to}>
                {item.label}
              </StyledNavLink>
            ))}
          </Box>
        )}

        <NavButton
          variant="outlined"
          size="small"
          onClick={handleClick}
          sx={{
            position: 'absolute',
            right: '16px'
          }}
        >
          {currentLocation}
        </NavButton>

        <Menu
          id="location-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
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

      <MobileDrawer
        anchor="left"
        open={mobileOpen}
        onClose={toggleMobileMenu}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={toggleMobileMenu}>
            <CloseIcon fontSize="large" sx={{ color: 'white' }} />
          </IconButton>
        </Box>
        
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
                    backgroundColor: '#c83a0a'
                  }
                }}
              >
                {item.label}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </MobileDrawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet context={{ handleNotification, currentLocation, mode }} />
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
        <Alert severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}