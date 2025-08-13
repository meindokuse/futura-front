import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Box
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useMediaQuery } from '@mui/material';
import { capitalize } from '../utils/utils';

const DeleteConfirmationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title = "Подтверждение удаления",
  content,
}) => {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isDeleting ? undefined : onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#121212', color: '#ffffff', borderRadius: '8px' } }}
    >
      <DialogTitle sx={{ 
        p: 2, 
        borderBottom: '1px solid #c83a0a', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <Typography variant="h6" fontWeight="bold">
          {title}
        </Typography>
        {!isDeleting && (
          <IconButton 
            sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} 
            onClick={onClose}
          >
            <Close />
          </IconButton>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 2 }}>
        <Typography variant="body1" sx={{ textAlign: 'left' }}>
          {content}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 2, 
        borderTop: '1px solid #c83a0a',
        justifyContent: 'space-between'
      }}>
        <Button 
          onClick={onClose}
          disabled={isDeleting}
          sx={{ 
            color: '#ffffff', 
            '&:hover': { color: '#c83a0a' },
            minWidth: 100
          }}
        >
          Отмена
        </Button>
        {isDeleting ? (
          <CircularProgress size={24} sx={{ color: '#c83a0a' }} />
        ) : (
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{ 
              bgcolor: '#c83a0a', 
              color: '#ffffff', 
              '&:hover': { bgcolor: '#e04b1a' },
              minWidth: 100
            }}
          >
            Удалить
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;