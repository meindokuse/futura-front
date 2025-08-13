import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const TARGET_SIZE = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_CROP_SIZE = 100;

const CropImageDialog = ({ open, onClose, image, onCropComplete, loading }) => {
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageRef, setImageRef] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Инициализация и центрирование
  const initializeCrop = useCallback((img) => {
    const container = containerRef.current;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    setContainerSize({ width: containerWidth, height: containerHeight });

    const scale = Math.min(
      containerWidth / img.naturalWidth,
      containerHeight / img.naturalHeight,
      1
    );

    const displayedWidth = img.naturalWidth * scale;
    const displayedHeight = img.naturalHeight * scale;

    // Начальный размер области обрезки (меньший из размеров, но не больше TARGET_SIZE)
    const cropSize = Math.min(
      Math.min(displayedWidth, displayedHeight),
      TARGET_SIZE * (Math.max(img.naturalWidth, img.naturalHeight) / TARGET_SIZE)
    );

    // Центрируем область обрезки
    const initialCrop = {
      unit: 'px',
      width: cropSize,
      height: cropSize,
      x: (displayedWidth - cropSize) / 2,
      y: (displayedHeight - cropSize) / 2
    };

    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, []);

  const onLoad = useCallback((img) => {
    setImageRef(img);
    initializeCrop(img);
  }, [initializeCrop]);

  // Автомасштабирование при изменении области обрезки
  useEffect(() => {
    if (!crop || !imgRef.current || !imageRef) return;

    const handleCropChange = (newCrop) => {
      const img = imgRef.current;
      const scaleX = imageRef.naturalWidth / img.width;
      const scaleY = imageRef.naturalHeight / img.height;

      // Рассчитываем новые координаты, чтобы сохранить центр
      const centerX = newCrop.x + newCrop.width / 2;
      const centerY = newCrop.y + newCrop.height / 2;

      // Автомасштабирование - уменьшаем область при увеличении размеров
      const targetRatio = TARGET_SIZE / Math.min(imageRef.naturalWidth, imageRef.naturalHeight);
      const sizeRatio = newCrop.width / (TARGET_SIZE / targetRatio);

      if (sizeRatio > 1.1) {
        const adjustedSize = newCrop.width / sizeRatio;
        const adjustedCrop = {
          ...newCrop,
          width: Math.max(adjustedSize, MIN_CROP_SIZE),
          height: Math.max(adjustedSize, MIN_CROP_SIZE),
          x: centerX - adjustedSize / 2,
          y: centerY - adjustedSize / 2
        };
        setCrop(adjustedCrop);
        return;
      }

      // Проверяем границы
      const maxX = img.width - newCrop.width;
      const maxY = img.height - newCrop.height;

      const clampedCrop = {
        ...newCrop,
        x: Math.max(0, Math.min(newCrop.x, maxX)),
        y: Math.max(0, Math.min(newCrop.y, maxY))
      };

      if (clampedCrop.x !== newCrop.x || clampedCrop.y !== newCrop.y) {
        setCrop(clampedCrop);
      }
    };

    handleCropChange(crop);
  }, [crop, imageRef]);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imageRef || !imgRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;
    const ctx = canvas.getContext('2d');

    const scaleX = imageRef.naturalWidth / imgRef.current.width;
    const scaleY = imageRef.naturalHeight / imgRef.current.height;

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      imageRef,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
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
  }, [completedCrop, imageRef]);

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
      PaperProps={{ sx: { backgroundColor: '#121212', color: '#ffffff', borderRadius: '8px' } }}
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
          height: '60vh',
          overflow: 'hidden'
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
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'relative'
        }}>
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={setCompletedCrop}
            aspect={1}
            minWidth={MIN_CROP_SIZE}
            minHeight={MIN_CROP_SIZE}
            keepSelection
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          >
            <img
              ref={imgRef}
              src={image}
              alt="Crop preview"
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onLoad={(e) => onLoad(e.currentTarget)}
            />
          </ReactCrop>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #c83a0a' }}>
        <Button sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={onClose}>
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!completedCrop || loading}
          sx={{ bgcolor: '#c83a0a', color: '#ffffff', '&:hover': { bgcolor: '#e04b1a' } }}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CropImageDialog;