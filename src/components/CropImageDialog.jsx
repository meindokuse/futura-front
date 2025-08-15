import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { Close } from '@mui/icons-material';
import Cropper from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';

const TARGET_SIZE = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_CROP_SIZE = 100;

const CropImageDialog = ({ open, onClose, image, onCropComplete, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  // Устанавливаем размер контейнера при открытии диалога
  useEffect(() => {
    if (open && containerRef.current) {
      const width = containerRef.current.clientWidth;
      const height = isMobile ? window.innerHeight * 0.6 : Math.min(window.innerHeight * 0.6, 500);
      setContainerSize({ width, height });
    }
  }, [open, isMobile]);

  // Инициализация зума при загрузке изображения
  const initializeZoom = useCallback(() => {
    if (!containerRef.current || !image) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const { width: containerWidth, height: containerHeight } = containerSize;
      const scale = Math.min(
        containerWidth / img.naturalWidth,
        containerHeight / img.naturalHeight,
        1
      );
      setZoom(scale);
    };
  }, [image, containerSize]);

  useEffect(() => {
    initializeZoom();
  }, [initializeZoom]);

  const onCropChange = useCallback((newCrop) => {
    setCrop(newCrop);
  }, []);

  const onZoomChange = useCallback((newZoom) => {
    setZoom(Math.max(1, Math.min(newZoom, 3))); // Ограничиваем зум от 1 до 3
  }, []);

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Автоматическое масштабирование при изменении области обрезки
  useEffect(() => {
    if (!croppedAreaPixels || !containerSize.width) return;

    const cropSize = Math.min(croppedAreaPixels.width, croppedAreaPixels.height);
    const targetCropSize = Math.min(containerSize.width, containerSize.height) * 0.5;
    const newZoom = Math.max(1, targetCropSize / cropSize);
    setZoom(Math.min(newZoom, 3)); // Ограничиваем максимальный зум
  }, [croppedAreaPixels, containerSize]);

  const getCroppedImg = useCallback(async () => {
    if (!croppedAreaPixels) return null;

    try {
      const imageElement = new Image();
      imageElement.src = image;
      await new Promise((resolve) => { imageElement.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = TARGET_SIZE;
      canvas.height = TARGET_SIZE;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(
        imageElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        TARGET_SIZE,
        TARGET_SIZE
      );

      const compressImage = (quality = 0.9) => {
        return new Promise((resolve) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              resolve(null);
              return;
            }

            if (blob.size > MAX_FILE_SIZE && quality > 0.1) {
              const newQuality = Math.max(0.1, quality * 0.7);
              compressImage(newQuality).then(resolve);
            } else {
              resolve(new File([blob], 'cropped.png', { type: 'image/png' }));
            }
          }, 'image/png', quality);
        });
      };

      return await compressImage();
    } catch (error) {
      console.error('Ошибка обрезки:', error);
      return null;
    }
  }, [croppedAreaPixels, image]);

  const handleSave = useCallback(async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) onCropComplete(croppedImage);
  }, [getCroppedImg, onCropComplete]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { backgroundColor: '#121212', color: '#ffffff', borderRadius: isMobile ? 0 : '8px' } }}
    >
      <DialogTitle sx={{ p: 2, borderBottom: '1px solid #c83a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">Обрезка фото</Typography>
        <IconButton sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent 
        ref={containerRef}
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 2,
          height: isMobile ? 'auto' : '60vh',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
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
        
        <Box sx={{ 
          position: 'relative',
          width: '100%', 
          height: containerSize.height || '60vh',
          minHeight: isMobile ? '300px' : '400px'
        }}>
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            minZoom={1}
            maxZoom={3}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            showGrid={false}
            restrictPosition={false}
            cropSize={{ width: MIN_CROP_SIZE * 2, height: MIN_CROP_SIZE * 2 }}
            style={{
              containerStyle: { 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#121212' 
              },
              mediaStyle: { 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain' 
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #c83a0a' }}>
        <Button sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={onClose}>
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!croppedAreaPixels || loading}
          sx={{ bgcolor: '#c83a0a', color: '#ffffff', '&:hover': { bgcolor: '#e04b1a' } }}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CropImageDialog;