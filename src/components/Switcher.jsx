import { Switch, FormControlLabel, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledSwitch = styled(Switch)(() => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#c83a0a',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#333333',
    width: 32,
    height: 32,
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#555555',
    borderRadius: 20,
  },
}));

export default function LocationToggle({ currentLocation, onToggle, isGeneralEvent }) {
  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      minHeight: '48px', // Такая же высота как у Finder
      borderRadius: '6px',
      border: '2px solid',
      borderColor: isGeneralEvent ? '#c83a0a' : '#373737',
      backgroundColor: 'transparent',
      transition: 'border-color 0.3s ease',
      px: 2,
      '&:hover': {
        borderColor: '#c83a0a'
      }
    }}>
      <FormControlLabel
        control={
          <StyledSwitch 
            checked={isGeneralEvent}
            onChange={onToggle}
            sx={{ mr: 1 }}
          />
        }
        label={
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#c5c5c5',
              fontSize: '16px',
              whiteSpace: 'nowrap'
            }}
          >
            {isGeneralEvent ? 'Общие события' : currentLocation}
          </Typography>
        }
        sx={{ 
          m: 0,
          '& .MuiFormControlLabel-label': {
            marginLeft: '8px'
          }
        }}
      />
    </Box>
  );
}