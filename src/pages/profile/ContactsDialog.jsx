import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../utils/utils';

export default function ContactsDialog({ open, onClose, handleNotification }) {
  const [contacts, setContacts] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone) => {
    const regex = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;
    return regex.test(phone);
  };

  const handleSubmit = async () => {
    if (!contacts) {
      setError('Контакты обязательны');
      return;
    }
    
    if (!validatePhone(contacts)) {
      setError('Формат: +7 (999) 123-45-67');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}edit_employer`,
        { contacts: [contacts] }, // Отправляем как массив
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      handleNotification('success', 'Контакты успешно обновлены');
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении контактов:', error);
      const message = error.response?.data?.detail || 'Ошибка при обновлении контактов';
      setError(message);
      handleNotification('error', message);
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
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ 
        sx: { 
          backgroundColor: 'black', 
          color: '#ffffff', 
          borderRadius: '8px', 
          border: '1px solid #c83a0a' 
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
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#c83a0a' }}>
          Изменить контакты
        </Typography>
        <IconButton 
          sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} 
          onClick={onClose}
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, backgroundColor: 'transparent' }}>
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
          label="Телефон"
          value={contacts}
          onChange={(e) => { setContacts(e.target.value); setError(''); }}
          error={!!error}
          helperText={error || 'Формат: +7 (999) 123-45-67'}
          sx={textFieldStyles}
          margin="normal"
          placeholder="+7 (999) 123-45-67"
        />
      </DialogContent>
      <DialogActions sx={{ 
        p: 2, 
        borderTop: '1px solid #c83a0a', 
        backgroundColor: 'transparent' 
      }}>
        <Button 
          sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} 
          onClick={onClose}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !contacts || !validatePhone(contacts)}
          sx={{ 
            backgroundColor: '#c83a0a', 
            color: '#ffffff', 
            '&:hover': { backgroundColor: '#e04b1a' },
            '&.Mui-disabled': {
              backgroundColor: 'rgba(200, 58, 10, 0.5)',
              color: 'rgba(255, 255, 255, 0.5)'
            }
          }}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}