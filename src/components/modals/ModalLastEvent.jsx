import { Dialog, DialogTitle, DialogContent, Typography, IconButton, Box } from '@mui/material';
import { Close, CalendarToday, LocationOn } from '@mui/icons-material';
import dayjs from 'dayjs';

export default function ModalLastEvent({ 
  open, 
  onClose, 
  event 
}) {
  if (!event) return null;

  // Форматирование даты с проверкой
  const formattedDate = event.date_start 
    ? dayjs(event.date_start).format('DD.MM.YYYY HH:mm')
    : 'Дата не указана';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ 
        sx: { 
          backgroundColor: '#121212', 
          color: '#ffffff',
          borderRadius: '8px',
        } 
      }}
    >
      <DialogTitle sx={{ 
        p: 2, 
        borderBottom: '1px solid #c83a0a',
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography variant="h6" fontWeight="bold">
          {event.name} {/* Исправлено с title на name */}
        </Typography>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'inherit' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Box mb={3}>
          <Typography variant="subtitle1" color="#c83a0a" gutterBottom>
            Детали события:
          </Typography>
          
          <Box display="flex" alignItems="center" mb={1.5}>
            <CalendarToday sx={{ mr: 1, color: '#c83a0a' }} />
            <Typography>{formattedDate}</Typography>
          </Box>
          
          {event.location_name && (
            <Box display="flex" alignItems="center" mb={1.5}>
              <LocationOn sx={{ mr: 1, color: '#c83a0a' }} />
              <Typography>{event.location_name}</Typography>
            </Box>
          )}
        </Box>
        
        {event.description ? (
          <Typography 
            variant="body1"
            sx={{
              whiteSpace: 'pre-line', // Сохраняет переносы строк
              maxHeight: '400px',
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c83a0a',
                borderRadius: '3px',
              }
            }}
          >
            {event.description}
          </Typography>
        ) : (
          <Typography color="text.secondary">
            Описание отсутствует
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}