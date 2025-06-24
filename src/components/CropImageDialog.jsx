import React, { useState, useCallback } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, CircularProgress, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const TARGET_SIZE = 500;

const CropImageDialog = ({ open, onClose, image, onCropComplete, loading }) => {
  const [crop, setCrop] = useState({ unit: 'px', width: TARGET_SIZE, height: TARGET_SIZE, x: 0, y: 0 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [imageRef, setImageRef] = useState(null);

  const onLoad = useCallback((img) => {
    setImageRef(img);
    const minDimension = Math.min(img.naturalWidth, img.naturalHeight);
    const initialCrop = {
      unit: 'px',
      width: Math.min(minDimension, TARGET_SIZE),
      height: Math.min(minDimension, TARGET_SIZE),
      x: (img.naturalWidth - Math.min(minDimension, TARGET_SIZE)) / 2,
      y: (img.naturalHeight - Math.min(minDimension, TARGET_SIZE)) / 2
    };
    setCrop(initialCrop);
    setCompletedCrop(initialCrop);
  }, []);

  const getCroppedImg = useCallback(async () => {
    if (!completedCrop || !imageRef) return null;

    const canvas = document.createElement('canvas');
    canvas.width = TARGET_SIZE;
    canvas.height = TARGET_SIZE;
    const ctx = canvas.getContext('2d');

    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;

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

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob ? new File([blob], 'cropped.jpg', { type: 'image/jpeg' }) : null);
      }, 'image/jpeg', 0.9);
    });
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
      <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
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
        
        <Box sx={{ width: '100%', maxHeight: '60vh', overflow: 'auto' }}>
          <ReactCrop
            crop={crop}
            onChange={setCrop}
            onComplete={setCompletedCrop}
            aspect={1}
            minWidth={TARGET_SIZE}
            minHeight={TARGET_SIZE}
            keepSelection
            style={{ maxWidth: '100%' }}
          >
            <img
              src={image}
              alt="Crop preview"
              style={{ maxWidth: '100%', maxHeight: '60vh' }}
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