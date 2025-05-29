import { createTheme } from '@mui/material/styles';

export default createTheme({
  palette: {
    primary: {
      main: '#c83a0a', // Ваш цвет
      contrastText: '#fff'
    },
    secondary: {
      main: '#'
    }
  },
  typography: {
    fontFamily: '"Roboto Condensed", sans-serif',
    h1: {
      fontSize: '3rem',
      fontWeight: 700
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px'
        }
      }
    }
  }
});