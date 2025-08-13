import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import {API_URL} from '../utils/utils'

const initialFormData = {
  fio: '',
  discount_value: 0,
  description: '',
  photo: null,
};

export default function ResidentDialog({
  open,
  onClose,
  onSave,
  resident,
}) {
  const { handleNotification } = useOutletContext();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (open) {
      if (resident) {
        setFormData({
          fio: resident.fio || '',
          discount_value: resident.discount_value || 0,
          description: resident.description || '',
          photo: null
        });
        
      } else {
        setFormData(initialFormData);
        setPhotoPreview(null);
      }
    }
  }, [open, resident]);

  const handleDialogClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setPhotoPreview(null);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        handleNotification('Пожалуйста, выберите изображение', 'error');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        handleNotification('Размер файла не должен превышать 5MB', 'error');
        return;
      }

      setFormData(prev => ({ ...prev, photo: file }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (residentId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await axios.post(
        `${API_URL}files/resident/${residentId}/upload-photo?expansion=png`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      throw error;
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!resident && !formData.fio) {
      newErrors.fio = 'Обязательное поле';
    }
    if (formData.discount_value < 0 || formData.discount_value > 100) {
      newErrors.discount_value = 'Скидка должна быть от 0 до 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      let result;

      if (!resident) {
        // Создание нового резидента
        const createResponse = await axios.post(
          `${API_URL}residents/admin/add_resident`,
          {
            fio: formData.fio,
            discount_value: formData.discount_value,
            description: formData.description,
            location_id: 1
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        result = createResponse.data;

        // Загрузка фото после создания
        if (formData.photo) {
          try {
            await uploadPhoto(result.id, formData.photo);
          } catch {
            handleNotification('Резидент создан, но фото не загружено', 'warning');
          }
        }
      } else {
        // Обновление существующего резидента
        const updateResponse = await axios.put(
          `${API_URL}residents/admin/update_resident?id=${resident.id}`,
          {
            fio:null,
            discount_value: formData.discount_value,
            description: formData.description
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        result = updateResponse.data;

        // Загрузка фото при обновлении
        if (formData.photo) {
          try {
            await uploadPhoto(resident.id, formData.photo);
          } catch {
            handleNotification('Данные обновлены, но фото не загружено', 'warning');
          }
        }
      }

      onSave(result);
      handleDialogClose();
      handleNotification(
        !resident ? 'Резидент создан!' : 'Данные обновлены!',
        'success'
      );
    } catch (error) {
      console.error('Ошибка:', error);
      handleNotification(
        error.response?.data?.detail || 'Произошла ошибка',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { backgroundColor: '#121212', color: '#ffffff', borderRadius: '8px' } }}
    >
      <DialogTitle sx={{ p: 2, borderBottom: '1px solid #c83a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          {!resident ? 'Добавить резидента' : 'Редактировать резидента'}
        </Typography>
        <IconButton sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={handleDialogClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 2 }}>
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
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {!resident && (
            <TextField
              fullWidth
              label="ФИО"
              name="fio"
              value={formData.fio}
              onChange={handleChange}
              error={!!errors.fio}
              helperText={errors.fio}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: '#424242' },
                  '&:hover fieldset': { borderColor: '#c83a0a' },
                  '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
                },
                '& .MuiInputLabel-root': { color: '#ffffff' },
                '& .MuiInputBase-input': { color: '#ffffff' }
              }}
            />
          )}
          
          <TextField
            fullWidth
            label="Размер скидки (%)"
            name="discount_value"
            type="number"
            value={formData.discount_value}
            onChange={handleChange}
            error={!!errors.discount_value}
            helperText={errors.discount_value}
            inputProps={{ min: 0, max: 100 }}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#424242' },
                '&:hover fieldset': { borderColor: '#c83a0a' },
                '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
              },
              '& .MuiInputLabel-root': { color: '#ffffff' },
              '& .MuiInputBase-input': { color: '#ffffff' }
            }}
          />
          
          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#424242' },
                '&:hover fieldset': { borderColor: '#c83a0a' },
                '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
              },
              '& .MuiInputLabel-root': { color: '#ffffff' },
              '& .MuiInputBase-input': { color: '#ffffff' }
            }}
          />

          {/* Компонент загрузки фото */}
          <Box>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoChange} 
              style={{ display: 'none' }} 
              id="resident-photo-upload" 
            />
            <label htmlFor="resident-photo-upload">
              <Button
                variant="outlined"
                component="span"
                sx={{
                  color: '#ffffff',
                  borderColor: '#c83a0a',
                  '&:hover': { borderColor: '#e04b1a', backgroundColor: 'rgba(200, 58, 10, 0.1)' }
                }}
              >
                {photoPreview ? 'Заменить фото' : 'Загрузить фото'}
              </Button>
            </label>
            {photoPreview && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} 
                />
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, borderTop: '1px solid #c83a0a' }}>
        <Button sx={{ color: '#ffffff', '&:hover': { color: '#c83a0a' } }} onClick={handleDialogClose}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ bgcolor: '#c83a0a', color: '#ffffff', '&:hover': { bgcolor: '#e04b1a' } }}
        >
          {!resident ? 'Создать' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}