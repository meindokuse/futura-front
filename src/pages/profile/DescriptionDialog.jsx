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

export default function DescriptionDialog({ open, onClose, handleNotification }) {
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description) {
      setError('Описание обязательно');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_URL}edit_employer`,
        { description },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      handleNotification('success', 'Описание успешно обновлено');
      onClose();
    } catch (error) {
      console.error('Ошибка при обновлении описания:', error);
      const message = error.response?.data?.detail || 'Ошибка при обновлении описания';
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
      maxWidth="sm"
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
          Редактировать описание
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
          label="Описание"
          value={description}
          onChange={(e) => { setDescription(e.target.value); setError(''); }}
          error={!!error}
          helperText={error}
          multiline
          rows={4}
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
          disabled={loading || !description}
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