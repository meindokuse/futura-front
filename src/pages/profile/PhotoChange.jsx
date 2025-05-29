import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  CircularProgress,
  Typography,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../utils/utils';

export default function PhotoUploadDialog({ open, onClose, userId, handleNotification, onPhotoChange }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (selectedFile) => {
    if (!selectedFile) {
      setError('Выберите файл');
      return false;
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Поддерживаются только JPEG или PNG');
      return false;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Файл не должен превышать 5MB');
      return false;
    }
    return true;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Выберите файл');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      const extension = 'png';
      formData.append('photo', file);

      const response = await axios.post(`${API_URL}files/employer/${userId}/upload-photo`, formData, {
        params:{expansion:extension},
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      const { file_url } = response.data;
      handleNotification('Фото успешно обновлено', 'success');
      onPhotoChange();
      onClose();
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка при загрузке фото';
      setError(message);
      handleNotification(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const buttonStyles = {
    color: '#ffffff',
    borderColor: '#c83a0a',
    textTransform: 'none',
    fontWeight: 'medium',
    padding: '8px 16px',
    width: '100%',
    '&:hover': {
      borderColor: '#e04b1a',
      backgroundColor: 'rgba(200, 58, 10, 0.1)'
    },
    '&.Mui-disabled': {
      color: '#ffffff',
      borderColor: '#c83a0a',
      opacity: 0.5
    }
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
      <DialogTitle
        sx={{
          p: 2,
          borderBottom: '1px solid #c83a0a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" fontWeight="bold" sx={{ color: '#c83a0a' }}>
          Загрузить фото
        </Typography>
        <IconButton
          sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }}
          onClick={onClose}
          disabled={loading}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, backgroundColor: 'transparent' }}>
        {loading && (
          <Box
            sx={{
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
            }}
          >
            <CircularProgress size={60} sx={{ color: '#c83a0a' }} />
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'center',
            pt: 3
          }}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            id="photo-upload"
            ref={fileInputRef}
          />
          <label htmlFor="photo-upload">
            <Button
              variant="outlined"
              component="span"
              sx={buttonStyles}
              disabled={loading}
            >
              {preview ? 'Заменить фото' : 'Загрузить фото'}
            </Button>
          </label>
          {preview && (
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <img
                src={preview}
                alt="Предпросмотр"
                style={{
                  maxWidth: '200px',
                  maxHeight: '200px',
                  borderRadius: '4px',
                  border: '1px solid #c83a0a'
                }}
              />
              <Button
                onClick={handleClear}
                sx={{
                  color: '#ffffff',
                  textTransform: 'none',
                  '&:hover': { color: '#c83a0a' }
                }}
                disabled={loading}
              >
                Очистить
              </Button>
            </Box>
          )}
          {error && (
            <Typography sx={{ color: '#c83a0a', mt: 1, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          borderTop: '1px solid #c83a0a',
          backgroundColor: 'transparent',
          justifyContent: 'space-between'
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            color: '#ffffff',
            textTransform: 'none',
            '&:hover': { color: '#c83a0a' }
          }}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="outlined"
          disabled={loading || !file}
          sx={buttonStyles}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
}