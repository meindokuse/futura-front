import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { API_URL } from '../../utils/utils';
import axios from 'axios';

export default function ProfileDialog({ 
  open, 
  onClose, 
  initialValue, 
  handleNotification,
  type,
  userId
}) {
  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Автоматическое форматирование телефона
  useEffect(() => {
    if (type === 'contacts' && value) {
      const numbers = value.replace(/\D/g, '');
      let formatted = '+7 (';
      
      if (numbers.length > 1) {
        formatted += numbers.substring(1, 4);
      }
      if (numbers.length >= 4) {
        formatted += ') ' + numbers.substring(4, 7);
      }
      if (numbers.length >= 7) {
        formatted += '-' + numbers.substring(7, 9);
      }
      if (numbers.length >= 9) {
        formatted += '-' + numbers.substring(9, 11);
      }
      
      setValue(formatted);
    }
  }, [value, type]);

  const validate = () => {
    if (!value.trim()) {
      setError(type === 'contacts' ? 'Контакты обязательны' : 'Описание обязательно');
      return false;
    }
    if (type === 'contacts' && !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) {
      setError('Введите полный номер телефона');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const input = e.target.value;
    if (type === 'contacts') {
      if (input.replace(/\D/g, '').length > 11) return;
    }
    setValue(input);
    setError('');
  };

  const handleSubmit = async () => {
      if (!validate()) return;
      setLoading(true);
      
      try {
        // Подготавливаем данные в соответствии с EmployerUpdateBasic
        const dataToUpdate = {
          [type === 'contacts' ? 'contacts' : 'description']: 
            type === 'contacts' ? [value] : value
        };

        const response = await axios.put(`${API_URL}employers/edit_employer`, dataToUpdate, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.data.status === "ok") {
          handleNotification(
            type === 'contacts' 
              ? 'Контакты успешно обновлены' 
              : 'Описание успешно обновлено', 
            'success'
          );
          onClose(true, type === 'contacts' ? [value] : value);
        }
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
        
        if (error.response?.status === 422) {
          setError('Неверный формат данных');
          handleNotification('Ошибка валидации данных', 'error');
        } else {
          setError('Ошибка при сохранении');
          handleNotification(
            type === 'contacts' 
              ? 'Ошибка при обновлении контактов' 
              : 'Ошибка при обновлении описания', 
            'error'
          );
        }
      } finally {
        setLoading(false);
      }
    };

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#ffffff' },
      '&:hover fieldset': { borderColor: '#c83a0a' },
      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
    },
    '& .MuiInputLabel-root': { color: '#ffffff', '&.Mui-focused': { color: '#c83a0a' } },
    '& .MuiInputBase-input': { color: '#ffffff' },
    '& .MuiFormHelperText-root': { color: '#ffffff' }
  };

  return (
    <Dialog
      open={open}
      onClose={() => onClose(false)}
      maxWidth={type === 'description' ? 'sm' : 'xs'}
      fullWidth
      PaperProps={{ sx: { 
        backgroundColor: '#121212', 
        color: '#ffffff', 
        borderRadius: '8px', 
        border: '1px solid #c83a0a' 
      }}}
    >
      <DialogTitle sx={{ 
        p: 2, 
        borderBottom: '1px solid #c83a0a', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#c83a0a' }}>
          {type === 'contacts' ? 'Редактировать контакты' : 'Редактировать описание'}
        </Typography>
        <IconButton sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={() => onClose(false)}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            zIndex: 1 
          }}>
            <CircularProgress size={60} sx={{ color: '#c83a0a' }} />
          </Box>
        )}
        <TextField
          fullWidth
          label={type === 'contacts' ? 'Телефон' : 'Описание'}
          value={value}
          onChange={handleChange}
          error={!!error}
          helperText={error || (type === 'contacts' ? 'Формат: +7 (999) 123-45-67' : '')}
          multiline={type === 'description'}
          rows={type === 'description' ? 4 : 1}
          sx={textFieldStyles}
          margin="normal"
          inputProps={{
            maxLength: type === 'contacts' ? 18 : undefined
          }}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #c83a0a' }}>
        <Button sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={() => onClose(false)}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ backgroundColor: '#c83a0a', color: '#ffffff', '&:hover': { backgroundColor: '#e04b1a' } }}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}