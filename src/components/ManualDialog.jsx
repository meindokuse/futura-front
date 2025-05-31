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
  CircularProgress,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { API_URL } from '../utils/utils';

const locationMapper = [
  { value: null, label: 'Общая' },
  { value: 1, label: 'Проспект мира' },
  { value: 2, label: 'Страстной' },
  { value: 3, label: 'Никольская' }
];

const initialFormData = {
  title: '',
  description: '',
  exp: '',
  location_id: null,
  file: null
};

export default function ManualDialog({
  open,
  onClose,
  onSave,
  manual,
}) {
  const { handleNotification } = useOutletContext();
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [filePreview, setFilePreview] = useState(null);

  useEffect(() => {
    if (open) {
      if (manual) {
        setFormData({
          title: manual.title || '',
          description: manual.description || '',
          exp: manual.exp || '',
          location_id: manual.location_id,
          file: null
        });
        if (manual.photo_id) {
          setFilePreview(`${API_URL}files/manuals/${manual.id}/get-photo?expansion=${manual.exp}`);
        }
      } else {
        setFormData(initialFormData);
        setFilePreview(null);
      }
    }
  }, [open, manual]);

  const handleDialogClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setFilePreview(null);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        handleNotification('Размер файла не должен превышать 20MB', 'error');
        return;
      }

      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      setFormData(prev => ({
        ...prev,
        file,
        exp: fileExtension
      }));
      
      if (file.type.match('image.*')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const uploadFile = async (manualId, file, extension) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      
      const response = await axios.post(
        `${API_URL}files/manuals/${manualId}/upload-photo?expansion=${extension}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      throw error;
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = 'Обязательное поле';
    if (!formData.exp) newErrors.exp = 'Не удалось определить расширение файла';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      let result;

      if (!manual) {
        const createResponse = await axios.post(
          `${API_URL}cards/admin/add_card`,
          {
            title: formData.title,
            description: formData.description,
            exp: formData.exp,
            location_id: formData.location_id
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        result = createResponse.data;

        if (formData.file) {
          try {
            await uploadFile(result.id, formData.file, formData.exp);
          } catch {
            handleNotification('Карточка создана, но файл не загружен', 'warning');
          }
        }
      } else {
        const updateResponse = await axios.put(
          `${API_URL}manuals/admin/update_manual?id=${manual.id}`,
          {
            title: formData.title,
            description: formData.description,
            exp: formData.exp,
            location_id: formData.location_id
          },
          { headers: { 'Content-Type': 'application/json' } }
        );

        result = updateResponse.data;

        if (formData.file) {
          try {
            await uploadFile(manual.id, formData.file, formData.exp);
          } catch {
            handleNotification('Данные обновлены, но файл не загружен', 'warning');
          }
        }
      }

      onSave(result);
      handleDialogClose();
      handleNotification(
        !manual ? 'Карточка создана!' : 'Данные обновлены!',
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

  const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#424242' },
      '&:hover fieldset': { borderColor: '#c83a0a' },
      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
    },
    '& .MuiInputLabel-root': { color: '#ffffff', '&.Mui-focused': { color: '#c83a0a' } },
    '& .MuiInputBase-input': { color: '#ffffff' }
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
          {!manual ? 'Добавить методичку' : 'Редактировать методичку'}
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
          <TextField
            fullWidth
            label="Название"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            sx={textFieldStyles}
          />

          <FormControl fullWidth error={!!errors.location_id} sx={textFieldStyles}>
            <Select
              value={formData.location_id === undefined ? null : formData.location_id}
              name="location_id"
              onChange={handleChange}
              sx={{
                color: '#ffffff',
                '& .MuiSelect-icon': { color: '#ffffff' }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    bgcolor: '#424242',
                    color: '#ffffff',
                    '& .MuiMenuItem-root': {
                      '&:hover': { backgroundColor: 'rgba(200, 58, 10, 0.1)' },
                      '&.Mui-selected': {
                        backgroundColor: '#c83a0a',
                        '&:hover': { backgroundColor: '#e04b1a' }
                      }
                    }
                  }
                }
              }}
            >
              {locationMapper.map((loc) => (
                <MenuItem key={loc.value || 'general'} value={loc.value}>
                  {loc.label}
                </MenuItem>
              ))}
            </Select>
            {errors.location_id && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {errors.location_id}
              </Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Описание"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            sx={textFieldStyles}
          />

          <Box>
            <input 
              type="file" 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
              id="manual-file-upload" 
            />
            <label htmlFor="manual-file-upload">
              <Button
                variant="outlined"
                component="span"
                sx={{
                  color: '#ffffff',
                  borderColor: '#c83a0a',
                  '&:hover': { borderColor: '#e04b1a', backgroundColor: 'rgba(200, 58, 10, 0.1)' }
                }}
              >
                {filePreview ? 'Заменить файл' : 'Загрузить файл'}
              </Button>
            </label>
            {filePreview && formData.file?.type.match('image.*') && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }} 
                />
              </Box>
            )}
            {formData.file && !formData.file.type.match('image.*') && (
              <Typography variant="body2" sx={{ mt: 2, color: '#ffffff' }}>
                Выбран файл: {formData.file.name}
              </Typography>
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
          {!manual ? 'Создать' : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}