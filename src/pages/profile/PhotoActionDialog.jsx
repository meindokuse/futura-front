import React, { useState } from 'react';
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

export default function PhotoActionDialog({ open, onClose, userId, handleNotification, onPhotoChange, onOpenUploadDialog }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}files/employer/${userId}/delete-photo`, {
        params: {expansion:'png'},
        withCredentials: true
      });
      handleNotification('Фото успешно удалено', 'success');
      onPhotoChange(`../../../public/default-employer.jpg`);
      onClose();
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка при удалении фото';
      handleNotification(message, 'error');
    } finally {
      setLoading(false);
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
          Управление фото
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
          <Button
            variant="outlined"
            onClick={handleDelete}
            disabled={loading}
            sx={buttonStyles}
          >
            Удалить фото
          </Button>
          <Button
            variant="outlined"
            onClick={onOpenUploadDialog}
            disabled={loading}
            sx={buttonStyles}
          >
            Изменить фото
          </Button>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          p: 2,
          borderTop: '1px solid #c83a0a',
          backgroundColor: 'transparent',
          justifyContent: 'center'
        }}
      >
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: '#ffffff',
            textTransform: 'none',
            '&:hover': { color: '#c83a0a' }
          }}
        >
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  );
}