import { useOutletContext } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URL,capitalize } from '../utils/utils';

// Настройка dayjs с русской локалью
dayjs.locale('ru');


const locationMapper = [
    { value: 1, label: 'Проспект мира' },
    { value: 2, label: 'Страстной' },
    { value: 3, label: 'Никольская' }
  ];

const ScheduleEditDialog = ({
  open,
  onClose,
  onSave,
  workday,
  currentLocation
}) => {
  const { handleNotification } = useOutletContext();
  const [formData, setFormData] = useState({
    date: null,
    startTime: null,
    endTime: null,
    location_id: currentLocation || 1
  });


  useEffect(() => {
    if (workday) {
      setFormData({
        date: dayjs(workday.work_time),
        startTime: dayjs(workday.work_time),
        endTime: dayjs(workday.time_end, 'HH:mm'), // Парсим строку в dayjs объект
        location_id: currentLocation || workday.location_id
      });
    }
  }, [workday, currentLocation]);

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleStartTimeChange = (time) => {
    setFormData(prev => ({ ...prev, startTime: time }));
  };

  const handleEndTimeChange = (time) => {
    setFormData(prev => ({ ...prev, endTime: time }));
  };

  const handleLocationChange = (e) => {
    setFormData(prev => ({ ...prev, location_id: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.date || !formData.startTime || !formData.endTime) {
        handleNotification('Заполните все поля', 'error');
        return;
      }
  
      // Преобразуем в Day.js объекты, если они еще не являются таковыми
      const date = dayjs(formData.date);
      const startTime = dayjs(formData.startTime);
      const endTime = dayjs(formData.endTime);
  
      // Форматируем дату и время
      const workDateTime = date
        .hour(startTime.hour())
        .minute(startTime.minute())
        .second(0)
        .millisecond(0)
        .format('YYYY-MM-DDTHH:mm:ss');
  
      const formattedData = {
        id: workday.id,
        work_time: workDateTime,
        time_end: endTime.format('HH:mm:ss'),
        location_id: formData.location_id
      };
  
  
      handleNotification('Смена успешно обновлена!', 'success');
      onSave(formattedData);
      onClose();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      handleNotification('Ошибка при сохранении смены', 'error');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#121212', color: '#ffffff', borderRadius: '8px' } }}
      >
        <DialogTitle sx={{ textAlign: 'center', color: '#ffffff', py: 2, position: 'relative', borderBottom: '1px solid #c83a0a' }}>
          Редактировать смену
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8, color: '#ffffff', '&:hover': { color: '#c83a0a' } }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent sx={{ color: '#ffffff', p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <DatePicker
              label="Дата смены"
              value={formData.date}
              onChange={handleDateChange}
              format="DD.MM.YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#424242' },
                      '&:hover fieldset': { borderColor: '#c83a0a' },
                      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
                    },
                    '& .MuiInputLabel-root': { 
                      color: '#ffffff', 
                      '&.Mui-focused': { color: '#c83a0a' } 
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' }
                  }
                },
                openPickerButton: { 
                  sx: { 
                    color: '#ffffff', 
                    '&:hover': { color: '#c83a0a' } 
                  } 
                }
              }}
            />
            
            <TimePicker
              label="Время начала"
              value={formData.startTime}
              onChange={handleStartTimeChange}
              ampm={false}
              format="HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#424242' },
                      '&:hover fieldset': { borderColor: '#c83a0a' },
                      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
                    },
                    '& .MuiInputLabel-root': { 
                      color: '#ffffff', 
                      '&.Mui-focused': { color: '#c83a0a' } 
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' }
                  }
                },
                openPickerButton: { 
                  sx: { 
                    color: '#ffffff', 
                    '&:hover': { color: '#c83a0a' } 
                  } 
                }
              }}
            />
            
            <TimePicker
              label="Время окончания"
              value={formData.endTime}
              onChange={handleEndTimeChange}
              ampm={false}
              format="HH:mm"
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: {
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#424242' },
                      '&:hover fieldset': { borderColor: '#c83a0a' },
                      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
                    },
                    '& .MuiInputLabel-root': { 
                      color: '#ffffff', 
                      '&.Mui-focused': { color: '#c83a0a' } 
                    },
                    '& .MuiInputBase-input': { color: '#ffffff' }
                  }
                },
                openPickerButton: { 
                  sx: { 
                    color: '#ffffff', 
                    '&:hover': { color: '#c83a0a' } 
                  } 
                }
              }}
            />
            
            <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffffff' }}>Локация</Typography>
                <FormControl fullWidth>
                  <Select
                    value={formData.location_id || ''}
                    name="location_id"
                    onChange={handleLocationChange}
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
                    {locationMapper.map((loc) => (
                      <MenuItem key={loc.value} value={loc.value}>
                        {loc.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ py: 2, px: 3, borderTop: '1px solid #c83a0a', gap: 2 }}>
          <Button onClick={onClose} sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }}>
            Отмена
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.date || !formData.startTime || !formData.endTime}
            sx={{ bgcolor: '#c83a0a', '&:hover': { bgcolor: '#e04b1a' }, color: '#ffffff' }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ScheduleEditDialog;