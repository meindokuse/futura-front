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

export default function PasswordDialog({ open, onClose, handleNotification }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!currentPassword) {
      setError('Текущий пароль обязателен');
      return false;
    }
    if (!newPassword) {
      setError('Новый пароль обязателен');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Пароль должен быть не короче 6 символов');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}auth/change-password`,
        {
          current_password: currentPassword,
          new_password: newPassword
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      handleNotification('success', response.data.message || 'Пароль успешно обновлен');
      onClose();
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Ошибка при обновлении пароля:', error);
      const message = error.response?.data?.detail || 
                     error.response?.data?.message || 
                     'Ошибка при обновлении пароля';
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
          Изменить пароль
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
          label="Текущий пароль"
          type="password"
          value={currentPassword}
          onChange={(e) => { setCurrentPassword(e.target.value); setError(''); }}
          sx={textFieldStyles}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Новый пароль"
          type="password"
          value={newPassword}
          onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
          error={!!error}
          helperText={error}
          sx={textFieldStyles}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Подтвердите новый пароль"
          type="password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
          error={!!error}
          sx={textFieldStyles}
          margin="normal"
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
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
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