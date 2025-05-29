import { useState } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, IconButton, 
  Box, Typography, useMediaQuery, useTheme 
} from '@mui/material';
import { Close, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export default function ModalLocation({ 
  open, 
  onClose, 
  location 
}) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (!location || !location.images || location.images.length === 0) return null;

  const handleNextImage = () => {
    setCurrentImageIndex(prev => 
      prev === location.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? location.images.length - 1 : prev - 1
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ 
        sx: { 
          backgroundColor: '#121212', 
          color: '#ffffff', 
          borderRadius: '8px',
          overflow: 'hidden'
        } 
      }}
    >
      <DialogTitle sx={{ 
        p: 2, 
        borderBottom: '1px solid #c83a0a', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="h6" fontWeight="bold">
          {location.name}
        </Typography>
        <IconButton 
          sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} 
          onClick={onClose}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 0 }}>
        {/* Слайдер изображений */}
        <Box position="relative" height={isMobile ? 250 : 400}>
          <img 
            src={location.images[currentImageIndex]} 
            alt={`${location.name} ${currentImageIndex + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          
          {/* Навигация слайдера */}
          {location.images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  '&:hover': { backgroundColor: 'rgba(200,58,10,0.7)' }
                }}
              >
                <ArrowBackIos />
              </IconButton>
              
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'white',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  '&:hover': { backgroundColor: 'rgba(200,58,10,0.7)' }
                }}
              >
                <ArrowForwardIos />
              </IconButton>
              
              {/* Индикатор текущего изображения */}
              <Box sx={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1
              }}>
                {location.images.map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: index === currentImageIndex ? '#c83a0a' : 'rgba(255,255,255,0.5)'
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>

        {/* Информация о локации */}
        <Box p={3}>
          <Typography variant="body1" mb={3}>
            {location.description}
          </Typography>
          
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }} gap={2}>
            <Box display="flex" alignItems="center">
              <MapPin size={20} style={{ marginRight: 8, color: '#c83a0a' }} />
              <Typography>{location.address}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Phone size={20} style={{ marginRight: 8, color: '#c83a0a' }} />
              <Typography>{location.phone}</Typography>
            </Box>
            
            <Box display="flex" alignItems="center">
              <Clock size={20} style={{ marginRight: 8, color: '#c83a0a' }} />
              <Typography>{location.hours}</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}