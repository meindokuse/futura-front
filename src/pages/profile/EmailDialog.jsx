import React, { useState, useEffect } from 'react';
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

export default function EmailDialog({ open, onClose, onSave, initialEmail, handleNotification }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState(1); // 1 - ввод email, 2 - ввод кода
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const validateEmail = () => {
    if (!email) {
      setError('Email обязателен');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Некорректный формат email');
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    if (!validateEmail()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}auth/send-verification-code`, 
        { email },  // Отправляем как JSON
        { withCredentials: true }
      );
      
      setCountdown(60);
      setStep(2);
      setAttemptsLeft(3);
      handleNotification('Код подтверждения отправлен', 'success');
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка при отправке кода';
      setError(message);
      handleNotification(message, 'error');
      
      if (error.response?.status === 409) {
        // Обработка случая, когда email уже занят
        setStep(1); // Возвращаем на шаг ввода email
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('Введите код подтверждения');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}auth/verify-email`, 
        {
          email: email.trim(),  // Убедимся, что нет лишних пробелов
          code: verificationCode.trim()
        }, 
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'  // Явно указываем Content-Type
          }
        }
      );
      
      await onSave({ email: email.trim() });
      handleNotification(response.data.message || 'Email успешно подтверждён и обновлён', 'success');
      onClose();
      resetForm();
    } catch (error) {
      console.log(error)
      let message = 'Ошибка при подтверждении email';
      
      if (error.response) {
        message = error.response.data?.detail || message;
        
        // Обработка кодов ошибок
        if (error.response.status === 400) {
          message = message || 'Неверный код подтверждения';
        } else if (error.response.status === 409) {
          message = message || 'Email уже используется';
        }
      }
      
      setError(message);
      handleNotification(message, 'error');
      
      // Обновляем количество оставшихся попыток
      if (error.response?.status === 429) {
        setAttemptsLeft(0);
        setCountdown(error.response.data.retry_after || 300);
      } else {
        setAttemptsLeft(prev => Math.max(0, prev - 1));
      }
      } finally {
        setLoading(false);
        }
    };

  const resetForm = () => {
    setStep(1);
    setVerificationCode('');
    setError('');
    setCountdown(0);
    setAttemptsLeft(3);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { backgroundColor: 'black', color: '#ffffff', borderRadius: '8px', border: '1px solid #c83a0a' } }}
    >
      <DialogTitle sx={{ p: 2, borderBottom: '1px solid #c83a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#c83a0a' }}>
          {step === 1 ? 'Изменить email' : 'Подтверждение email'}
        </Typography>
        <IconButton sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={handleClose} disabled={loading}>
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
        
        {step === 1 ? (
          <TextField
            fullWidth
            label="Новый email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            error={!!error}
            helperText={error}
            sx={textFieldStyles}
            margin="normal"
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography>Код подтверждения отправлен на {email}</Typography>
            <TextField
              fullWidth
              label="Код подтверждения"
              value={verificationCode}
              onChange={(e) => { setVerificationCode(e.target.value); setError(''); }}
              error={!!error}
              helperText={error || (attemptsLeft < 3 && `Осталось попыток: ${attemptsLeft}`)}
              sx={textFieldStyles}
              margin="normal"
            />
            {countdown > 0 ? (
              <Typography variant="body2">
                Отправить код повторно можно через {countdown} сек.
              </Typography>
            ) : (
              <Button 
                onClick={handleSendCode}
                sx={{ 
                  color: '#c83a0a', 
                  textTransform: 'none',
                  alignSelf: 'flex-start'
                }}
                disabled={loading}
              >
                Отправить код повторно
              </Button>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #c83a0a', backgroundColor: 'transparent' }}>
        <Button 
          sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} 
          onClick={step === 1 ? handleClose : () => setStep(1)}
          disabled={loading}
        >
          {step === 1 ? 'Отмена' : 'Назад'}
        </Button>
        <Button
          onClick={step === 1 ? handleSendCode : handleVerifyCode}
          variant="contained"
          disabled={loading || (step === 2 && (!verificationCode || attemptsLeft <= 0))}
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
          {step === 1 ? 'Отправить код' : 'Подтвердить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}