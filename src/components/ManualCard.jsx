import { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  useMediaQuery,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack
} from '@mui/material';
import { Edit, Delete, Download, Close } from '@mui/icons-material';
import axios from 'axios';
import { capitalize, API_URL } from '../utils/utils'; 
import { useOutletContext } from 'react-router-dom';


export default function ManualCard({ manual, onEdit, onDelete }) {
  const { mode } = useOutletContext();
  const [isDownloading, setIsDownloading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width:600px)');

  const handleDownload = async (e) => {
    e.stopPropagation();
    setIsDownloading(true);
    try {
      const response = await axios.get(
        `${API_URL}files/manuals/${manual.id}/get-photo`,
        { 
          params: { expansion: manual.exp },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${manual.title}.${manual.exp}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Ошибка скачивания:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      {/* Карточка */}
      <Box 
        sx={{ 
          width: '100%',
          maxWidth: isSmallScreen ? '100%' : 250,
          minWidth: 200,
          height: 250,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'transparent',
          border: '2px solid white',
          borderRadius: '8px',
          color: '#ffffff',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          p: 2,
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 5px 15px rgba(200, 58, 10, 0.2)',
            border: '2px solid rgb(200, 58, 10)',
          }
        }}
        onClick={handleOpenModal}
      >
        {/* Заголовок и кнопка скачивания */}
        <Stack 
          direction="column" 
          alignItems="center" 
          justifyContent="space-between"
          sx={{ height: '100%' }}
        >
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 600,
              textAlign: 'center',
              mt: 1,
              mb: 2
            }}
          >
            {capitalize(manual.title)}
          </Typography>
          
          <Button
            variant="contained"
            startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(e);
            }}
            sx={{ 
              bgcolor: '#c83a0a', 
              color: '#ffffff', 
              '&:hover': { 
                bgcolor: '#e04b1a' 
              },
              mb: 2,
              width: '80%'
            }}
            disabled={isDownloading}
          >
            {isDownloading ? '...' : 'Скачать'}
          </Button>

          {/* Кнопки редактирования и удаления */}
          {mode === 'admin' && (
            <Box sx={{ 
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            mt: 'auto'
          }}>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(manual);
              }}
              size="small"
              sx={{ 
                color: '#ffffff',
                '&:hover': {
                  color: 'rgb(200, 58, 10)'
                }
              }}
            >
              <Edit />
            </IconButton>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(manual.id);
              }}
              size="small"
              sx={{ 
                color: '#ffffff',
                '&:hover': {
                  color: 'rgb(200, 58, 10)'
                }
              }}
            >
              <Delete />
            </IconButton>
          </Box>
          )}
        </Stack>
      </Box>

      {/* Модальное окно */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{ 
          sx: { 
            backgroundColor: '#121212', 
            color: '#ffffff', 
            borderRadius: '8px' 
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
          <Typography variant="h6" fontWeight="bold">
            {capitalize(manual.title)}
          </Typography>
          <IconButton 
            sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} 
            onClick={handleCloseModal}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#ffffff',
              maxHeight: '400px',
              overflowY: 'auto',
              paddingRight: '10px',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c83a0a',
                borderRadius: '3px',
              }
            }}
          >
            {manual.description || 'Описание отсутствует'}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2, 
          borderTop: '1px solid #c83a0a',
          justifyContent: 'center'
        }}>
          <Button
            variant="contained"
            startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <Download />}
            onClick={handleDownload}
            sx={{ 
              bgcolor: '#c83a0a', 
              color: '#ffffff', 
              '&:hover': { 
                bgcolor: '#e04b1a' 
              },
              minWidth: '200px'
            }}
            disabled={isDownloading}
          >
            {isDownloading ? 'Скачивание...' : 'Скачать'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}