import React, { useState, } from 'react';
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



export default function ProfileDialog({ 
  open, 
  onClose, 
  onSave, 
  initialValue, 
  handleNotification,
  type 
}) {
  const [value, setValue] = useState(initialValue || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!value) {
      setError(type === 'contacts' ? 'Контакты обязательны' : 'Описание обязательно');
      return false;
    }
    if (type === 'contacts' && !/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) {
      setError('Формат: +7 (999) 123-45-67');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave(type === 'contacts' ? { contacts: value } : { description: value });
      handleNotification(
        type === 'contacts' 
          ? 'Контакты успешно обновлены' 
          : 'Описание успешно обновлено', 
        'success'
      );
      onClose();
    } catch (error) {
      setError('Ошибка при сохранении');
      handleNotification(
        type === 'contacts' 
          ? 'Ошибка при обновлении контактов' 
          : 'Ошибка при обновлении описания', 
        'error'
      );
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
        <IconButton sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={onClose}>
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
          label={type === 'contacts' ? 'Контакты' : 'Описание'}
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          error={!!error}
          helperText={type === 'contacts' ? error || 'Формат: +7 (999) 123-45-67' : error}
          multiline={type === 'description'}
          rows={type === 'description' ? 4 : 1}
          sx={textFieldStyles}
          margin="normal"
        />
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #c83a0a' }}>
        <Button sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={onClose}>
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