import { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, useMediaQuery, CircularProgress } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { API_URL, capitalize } from '../utils/utils';

const photoCache = {};

export default function EmployerCard({ employee, onEdit, onDelete }) {
  const { mode } = useOutletContext();
  const [photoUrl, setPhotoUrl] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const isMobile = useMediaQuery('(max-width:600px)');
  const abortControllerRef = useRef(null);
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/profile/${employee.id}`);
  };

  useEffect(() => {
    const fetchPhoto = async () => {
      if (employee.photo && employee.photo instanceof Blob) {
        setPhotoUrl(URL.createObjectURL(employee.photo));
        setLoadingPhoto(false);
        return;
      }

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
      abortControllerRef.current?.abort();
      if (employee.photo && photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [employee.id, employee.photo]);

  const handleImageError = () => {
    setPhotoUrl(null);
  };

  const getFontSize = (name) => {
    const nameLength = name?.length || 0;
    if (nameLength > 20) return isMobile ? '0.75rem' : '0.875rem';
    if (nameLength > 15) return isMobile ? '0.875rem' : '1rem';
    return isMobile ? '1rem' : '1.125rem';
  };

  return (
    <Box 
    sx={{ 
      width: '100%',
      display: 'flex',
      flexDirection: isMobile ? 'row' : 'column',
      backgroundColor: 'rgba(30, 30, 30, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '12px',
      color: '#ffffff',
      overflow: 'hidden',
      mb: isMobile ? 2 : 0,
      // Добавляем отступы по бокам только на мобилках
      mx: isMobile ? 0 : 'auto',
      // Убираем максимальную ширину на мобилках
      maxWidth: isMobile ? '100%' : 300,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 24px rgba(200, 58, 10, 0.2)',
        borderColor: 'rgb(200, 58, 10)',
      }
    }}
  >
      {/* Photo Area */}
      <Box 
        sx={{
          width: isMobile ? '120px' : '100%',
          height: isMobile ? '120px' : '180px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#2a2a2a',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={handleClick}
      >
        {loadingPhoto ? (
          <CircularProgress size={32} color="inherit" />
        ) : photoUrl ? (
          <Box
            component="img"
            src={photoUrl}
            alt={employee.fio}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
            onError={handleImageError}
          />
        ) : (
          <Box
            component="img"
            src="/default-employer.jpg"
            alt={employee.fio}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        )}
      </Box>

      {/* Content Area */}
      <Box 
        sx={{ 
          flex: 1,
          p: isMobile ? 1.5 : 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: isMobile ? '120px' : 'auto'
        }}
      >
        <Box>
          <Typography 
            gutterBottom 
            sx={{ 
              fontWeight: 600,
              lineHeight: 1.2,
              fontSize: getFontSize(employee.fio),
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {capitalize(employee.fio)}
          </Typography>
          
          <Typography 
            variant="body2"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {capitalize(employee.work_type)}
          </Typography>
        </Box>

        {mode === 'admin' && (
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'flex-end',
            mt: 'auto'
          }}>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(employee);
              }}
              size="small"
              sx={{ 
                color: 'inherit',
                '&:hover': { color: 'rgb(200, 58, 10)' }
              }}
            >
              <Edit fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
            <IconButton 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(employee);
              }}
              size="small"
              sx={{ 
                color: 'inherit',
                '&:hover': { color: 'rgb(200, 58, 10)' }
              }}
            >
              <Delete fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );
}