import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { API_URL,capitalize } from '../utils/utils';
import { useOutletContext } from 'react-router-dom';

// Создаем кеш на уровне модуля (будет общий для всех экземпляров компонента)
const photoCache = {};

export default function EmployerCard({ employee, onEdit, onDelete }) {
  const { mode } = useOutletContext();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const abortControllerRef = useRef(null);

  useEffect(() => {
    const fetchPhoto = async () => {
      // Проверяем кеш перед запросом
      if (photoCache[employee.id]) {
        setPhotoUrl(photoCache[employee.id]);
        setLoadingPhoto(false);
        return;
      }

      try {
        setLoadingPhoto(true);
        abortControllerRef.current = new AbortController();
        
        const response = await axios.get(
          `${API_URL}files/employer/${employee.id}/get-photo`,
          { 
            params: { expansion: 'png' },
            signal: abortControllerRef.current.signal
          }
        );
        
        if (response.data?.file_url) {
          const url = response.data.file_url.url;
          // Сохраняем в кеш
          photoCache[employee.id] = url;
          setPhotoUrl(url);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Ошибка загрузки фото:', error);
          setPhotoUrl(null);
        }
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setLoadingPhoto(false);
        }
      }
    };

    fetchPhoto();

    return () => {
      // Отменяем запрос при размонтировании
      abortControllerRef.current?.abort();
    };
  }, [employee.id]);

  const handleImageError = () => {
    setPhotoUrl(null);
  };

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: isSmallScreen ? '100%' : 300,
      minWidth: 300,
      minHeight: 500,
      maxHeight: 500,
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'transparent',
      border: '3px solid white',
      borderRadius: '8px',
      color: '#ffffff',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 8px 24px rgba(200, 58, 10, 0.2)',
        border: '3px solid rgb(200, 58, 10)',
      }
    }}>
      {/* Область фото */}
      <Box sx={{
        width: '100%',
        height: 100,
        paddingTop: '90%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#2a2a2a'
      }}>
        {loadingPhoto ? (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#2a2a2a'
          }}>
            <CircularProgress color="inherit" />
          </Box>
        ) : photoUrl ? (
          <Box
            component="img"
            src={photoUrl}
            alt={employee.fio}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%'
            }}
            onError={handleImageError}
          />
        ) : (
          <Box
            component="img"
            src="/default-employer.jpg" // Используем абсолютный путь
            alt={employee.fio}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              transform: 'translate(-50%, -50%)',
              minWidth: '100%',
              minHeight: '100%'
            }}
          />
        )}
      </Box>

      {/* Контент */}
      <Box sx={{ 
        flexGrow: 1,
        px: 3,
        py: 2
      }}>
        <Typography 
          gutterBottom 
          variant={isSmallScreen ? 'h5' : 'h4'}
          sx={{ 
            fontWeight: 600,
            lineHeight: 1.2,
            fontSize: isSmallScreen ? '1.25rem' : '1.5rem'
          }}
        >
          {capitalize(employee.fio)}
        </Typography>
        <Typography 
          variant="body1"
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: isSmallScreen ? '1rem' : '1.125rem'
          }}
        >
          {capitalize(employee.work_type)}
        </Typography>
      </Box>

      {/* Кнопки */}
      { mode === 'admin' && (
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'flex-end',
                px: 2,
                py: 2
              }}>
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(employee);
                  }}
                  size="large"
                  sx={{ 
                    color: '#ffffff',
                    '&:hover': {
                      color: 'rgb(200, 58, 10)'
                    }
                  }}
                >
                  <Edit fontSize={isSmallScreen ? 'medium' : 'large'} />
                </IconButton>
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(employee.id);
                  }}
                  size="large"
                  sx={{ 
                    color: '#ffffff',
                    '&:hover': {
                      color: 'rgb(200, 58, 10)'
                    }
                  }}
                >
                  <Delete fontSize={isSmallScreen ? 'medium' : 'large'} />
                </IconButton>
              </Box>
      )}
    </Box>
  );
}