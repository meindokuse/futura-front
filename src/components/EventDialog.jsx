import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  Typography,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../utils/utils';

const locationOptions = [
  { value: 1, label: 'Проспект мира' },
  { value: 2, label: 'Страстной' },
  { value: 3, label: 'Никольская' },
  { value: 0, label: 'Общее событие' }
];

// Функции для работы с временем
const toLocalDateTimeString = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const EventDialog = ({ open, onClose, onSave, event, locationId, handleNotification }) => {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date_start: '',
    description: '',
    location_id: locationId 
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        date_start: toLocalDateTimeString(event.date_start),
        description: event.description || '',
        location_id: locationId || 0
      });
    } else {
      setFormData({
        name: '',
        date_start: '',
        description: '',
        location_id: locationId || 0
      });
    }
  }, [event, locationId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === 'null' ? null : value 
    }));
  };

  const handleNullLocation = (data) => {
    if (data === 0 || data === '0') {
      return null;
    }
    return data;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const data = {
        name: formData.name,
        date_start: formData.date_start,
        description: formData.description,
        location_id: handleNullLocation(formData.location_id)
      };

      let response;
      if (event) {
        // Update event
        response = await axios.put(`${API_URL}events/admin/update_event?id=${event.id}`, data);
      } else {
        // Create event
        response = await axios.post(`${API_URL}events/admin/create_event`, data);
      }

      handleNotification('Успешно сохранено!', 'success');
      onSave(); // Вызываем callback для обновления списка
      onClose(); // Закрываем диалог
      
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      handleNotification('Ошибка при сохранении!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      scroll="paper"
      PaperProps={{ sx: { backgroundColor: '#121212', color: '#ffffff', borderRadius: '8px' } }}
    >
      <DialogTitle sx={{ textAlign: 'center', color: '#ffffff', py: 2, position: 'relative' }}>
        {event ? 'Редактировать событие' : 'Добавить событие'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: '#ffffff', '&:hover': { color: '#c83a0a' } }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ color: '#ffffff', p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            name="name"
            label="Название"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ sx: { color: '#ffffff', '&.Mui-focused': { color: '#c83a0a' } } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#ffffff' },
                '&:hover fieldset': { borderColor: '#c83a0a' },
                '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
              },
              '& .MuiInputBase-input': { color: '#ffffff' },
              '& .MuiOutlinedInput-notchedOutline': { borderRadius: '6px' }
            }}
          />

          <TextField
            name="date_start"
            label="Дата и время начала"
            type="datetime-local"
            value={formData.date_start}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ 
              shrink: true, 
              sx: { color: '#ffffff', '&.Mui-focused': { color: '#c83a0a' } } 
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#ffffff' },
                '&:hover fieldset': { borderColor: '#c83a0a' },
                '&.Mui-focused fieldset': { borderColor: '#c83a0a' },
              },
              '& .MuiInputBase-input': { 
                color: '#ffffff',
                '&::-webkit-calendar-picker-indicator': { filter: 'invert(1)' },
                '&::-moz-calendar-picker-indicator': { filter: 'invert(1)' }
              },
              '& .MuiOutlinedInput-notchedOutline': { borderRadius: '6px' }
            }}
          />

          <TextField
            name="description"
            label="Описание"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            InputLabelProps={{ sx: { color: '#ffffff', '&.Mui-focused': { color: '#c83a0a' } } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#ffffff' },
                '&:hover fieldset': { borderColor: '#c83a0a' },
                '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
              },
              '& .MuiInputBase-input': { color: '#ffffff' },
              '& .MuiOutlinedInput-notchedOutline': { borderRadius: '6px' }
            }}
          />

          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffffff' }}>
              Локация
            </Typography>
            <FormControl fullWidth>
              <Select
                value={formData.location_id}
                name="location_id"
                onChange={handleChange}
                sx={{
                  color: '#ffffff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#424242'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c83a0a'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#c83a0a'
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      bgcolor: '#424242',
                      color: '#ffffff',
                      '& .MuiMenuItem-root': {
                        '&:hover': { backgroundColor: 'rgba(200, 58, 10, 0.1)' },
                        '&.Mui-selected': {
                          backgroundColor: '#c83a0a',
                          '&:hover': { backgroundColor: '#e04b1a' }
                        }
                      }
                    }
                  }
                }}
              >
                {locationOptions.map((option) => (
                  <MenuItem 
                    key={option.value} 
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', py: 2, px: 3 }}>
        <Button disabled sx={{ visibility: 'hidden' }}>
          Назад
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            onClick={onClose}
            disabled={loading}
            sx={{
              color: '#ffffff',
              '&:hover': { color: '#c83a0a' },
              minWidth: '120px'
            }}
          >
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.name || !formData.date_start || !formData.description}
            sx={{
              bgcolor: '#c83a0a',
              '&:hover': { bgcolor: '#e04b1a' },
              '&:disabled': {
                bgcolor: '#b0b0b0',
                color: '#ffffff'
              },
              color: '#ffffff',
              minWidth: '120px',
              borderRadius: '6px',
              position: 'relative'
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ color: 'white', position: 'absolute' }} />
                <span style={{ opacity: 0 }}>Сохранить</span>
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EventDialog;