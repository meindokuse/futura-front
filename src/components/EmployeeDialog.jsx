import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  List,
  ListItem
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { API_URL, capitalize, compressImage } from '../utils/utils';
import CropImageDialog from './CropImageDialog';

// Константы
const roleOptions = [
  { value: 'admin-employer', label: 'Админ сотрудников' },
  { value: 'admin-events', label: 'Админ событий' },
  { value: 'admin-workdays', label: 'Админ расписания' },
  { value: 'admin-info', label: 'Админ методичек' },
  { value: 'admin-residents', label: 'Админ постоянников' },
];

const workTypeOptions = ['Бармен', 'Кальянщик', 'Хостес', 'Администратор'];

const locationMapper = [
  { value: 1, label: 'Проспект мира' },
  { value: 2, label: 'Страстной' },
  { value: 3, label: 'Никольская' }
];

const initialFormData = (locationId) => ({
  email: '',
  password: '',
  roles: ['employee'],
  date_of_birth: dayjs().subtract(18, 'year'),
  fio: '',
  work_type: '',
  contacts: [],
  description: '',
  photo: null,
  location_id: locationId
});

const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': { borderColor: '#424242' },
    '&:hover fieldset': { borderColor: '#c83a0a' },
    '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
  },
  '& .MuiInputLabel-root': { color: '#ffffff', '&.Mui-focused': { color: '#c83a0a' } },
  '& .MuiInputBase-input': { color: '#ffffff' }
};

export default function EmployerDialog({
  open,
  onClose,
  onSave,
  employee,
  locationId,
  isAdminEdit = true
}) {
  const { handleNotification } = useOutletContext();
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [formData, setFormData] = useState(initialFormData(locationId));
  const [newContact, setNewContact] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropping, setCropping] = useState(false);

  // Инициализация формы
  useEffect(() => {
    if (open) {
      if (employee) {
        setFormData({
          ...employee,
          roles: employee.roles || ['employee'],
          work_type: employee.work_type || '',
          location_id: employee.location_id || locationId,
          date_of_birth: employee.date_of_birth ? dayjs(employee.date_of_birth) : dayjs().subtract(18, 'year'),
          contacts: employee.contacts || [],
          description: employee.description || '',
          photo: null
        });
        if (employee.photo_id) {
          setPhotoPreview(`${API_URL}files/employer/${employee.id}/photo`);
        }
      } else {
        setFormData(initialFormData(locationId));
        setPhotoPreview(null);
      }
    }
  }, [open, employee, locationId]);

  // Обработчики
  const handleDialogClose = () => {
    setFormData(initialFormData(locationId));
    setErrors({});
    setNewContact('');
    setPhotoPreview(null);
    setCropOpen(false);
    setCropImage(null);
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'fio' || name === 'work_type' ? capitalize(value) : value 
    }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleRoleChange = (roleValue) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(roleValue)
        ? prev.roles.filter(r => r !== roleValue)
        : [...prev.roles, roleValue]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      handleNotification('Пожалуйста, выберите изображение', 'error');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      handleNotification('Размер файла не должен превышать 5MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setCropImage(reader.result);
    reader.readAsDataURL(file);
    setCropOpen(true);
  };

  const handleCropComplete = async (croppedFile) => {
    setCropping(true);
    try {
      console.log('Crop compl')
      const compressedFile = await compressImage(croppedFile);
      setFormData(prev => ({ ...prev, photo: compressedFile }));
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      handleNotification('Ошибка при сжатии изображения', 'error');
    } finally {
      setCropping(false);
      setCropOpen(false);
      setCropImage(null);
    }
  };

  const handleAddContact = () => {
    if (newContact && !formData.contacts.includes(newContact)) {
      setFormData(prev => ({ ...prev, contacts: [...prev.contacts, newContact] }));
      setNewContact('');
    }
  };

  const handleRemoveContact = (contactToRemove) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact !== contactToRemove)
    }));
  };

  // API методы
  const uploadPhoto = async (employerId, photoFile) => {
    try {
      const comp_file = await compressImage(photoFile);
      const formData = new FormData();
      formData.append('photo', comp_file); 
      
      await axios.post(
        `${API_URL}files/employer/${employerId}/upload-photo?expansion=png`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      throw error;
    }
  };

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}auth/admin/register`,
        {
          email: data.email,
          hashed_password: data.password,
          roles: data.roles,
          date_of_birth: data.date_of_birth.format('YYYY-MM-DD'),
          fio: data.fio,
          work_type: data.work_type,
          contacts: data.contacts.length ? data.contacts : null,
          description: data.description || null,
          location_id: data.location_id
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (data.photo) {
        try {
          await uploadPhoto(response.data.id, data.photo);
          handleNotification('Сотрудник создан!', 'success');
        } catch {
          handleNotification('Сотрудник создан, но фото не загружено', 'warning');
        }
      }

      return response.data;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setLoading(true);
    try {
      await axios.put(
        `${API_URL}employers/admin/edit_employer?employer_id=${employee.id}`,
        {
          roles: data.roles,
          work_type: data.work_type,
          location_id: data.location_id,
          description: data.description || null
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (data.photo) {
        try {
          await uploadPhoto(employee.id, data.photo);
          handleNotification('Данные обновлены!', 'success');
        } catch {
          handleNotification('Данные обновлены, но фото не загружено', 'warning');
        }
      }

      return { ...employee, ...data };
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const result = employee 
        ? await handleUpdate(formData) 
        : await handleCreate(formData);
      
      onSave(result);
      handleDialogClose();
    } catch (error) {
      handleNotification(
        error.response?.data?.detail || 'Произошла ошибка', 
        'error'
      );
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Общие проверки
    if (!employee) {
      if (!formData.email) newErrors.email = 'Обязательное поле';
      if (!formData.password) newErrors.password = 'Обязательное поле';
    }
    
    if (!formData.work_type) {
      newErrors.work_type = 'Обязательное поле';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Рендер полей для админ-режима
  const renderFields = () => {
    if (!employee) {
      return (
        <>
          <TextField
            fullWidth
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            label="Пароль"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            sx={textFieldStyles}
          />
          <TextField
            fullWidth
            label="ФИО"
            name="fio"
            value={formData.fio}
            onChange={handleChange}
            error={!!errors.fio}
            helperText={errors.fio}
            sx={textFieldStyles}
          />
          <WorkTypeSelect 
            value={formData.work_type}
            onChange={handleChange}
            error={errors.work_type}
          />
          <DatePicker
            label="Дата рождения"
            value={formData.date_of_birth}
            onChange={(date) => setFormData(prev => ({ ...prev, date_of_birth: date }))}
            maxDate={dayjs().subtract(14, 'year')}
            slotProps={{
              textField: { fullWidth: true, sx: textFieldStyles },
              openPickerButton: { sx: { color: '#ffffff', '&:hover': { color: '#c83a0a' } } }
            }}
          />
          <RoleSelector 
            roles={formData.roles} 
            onChange={handleRoleChange} 
          />
          <PhotoUpload 
            photoPreview={photoPreview}
            onChange={handlePhotoChange}
            employee={employee}
          />
          <ContactManager
            contacts={formData.contacts}
            newContact={newContact}
            onAdd={handleAddContact}
            onChange={setNewContact}
            onRemove={handleRemoveContact}
          />
        </>
      );
    }
    
    return (
      <>
        <WorkTypeSelect 
          value={formData.work_type}
          onChange={handleChange}
          error={errors.work_type}
        />
        <RoleSelector 
          roles={formData.roles} 
          onChange={handleRoleChange} 
        />
        <LocationSelect 
          value={formData.location_id}
          onChange={handleChange}
        />
      </>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={handleDialogClose}
        fullScreen={fullScreen}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { backgroundColor: '#121212', color: '#ffffff', borderRadius: '8px' } }}
      >
        <DialogTitle sx={{ p: 2, borderBottom: '1px solid #c83a0a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            {employee ? 'Редактирование сотрудника' : 'Добавление сотрудника'}
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
            {renderFields()}
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
            {employee ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
      <CropImageDialog
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        image={cropImage}
        onCropComplete={handleCropComplete}
        loading={cropping}
      />
    </LocalizationProvider>
  );
}

// Вынесенные компоненты для читаемости
const WorkTypeSelect = ({ value, onChange, error }) => (
  <FormControl fullWidth>
    <Select
      value={value || ''}
      name="work_type"
      onChange={(e) => onChange({
        target: {
          name: e.target.name,
          value: e.target.value.toLowerCase()
        }
      })}
      displayEmpty
      error={!!error}
      sx={{
        color: '#ffffff',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#424242' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c83a0a' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#c83a0a' },
        '& .MuiSelect-icon': { color: '#ffffff' }
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: '#424242',
            color: '#ffffff',
            '& .MuiMenuItem-root': {
              '&:hover': { backgroundColor: 'rgba(200, 58, 10, 0.1)' },
              '&.Mui-selected': { backgroundColor: '#c83a0a' }
            }
          }
        }
      }}
      renderValue={(selected) => selected ? capitalize(selected) : <em>Выберите должность</em>}
    >
      <MenuItem value="" disabled sx={{ color: '#9e9e9e' }}>Выберите должность</MenuItem>
      {workTypeOptions.map((option) => (
        <MenuItem key={option} value={option.toLowerCase()} sx={{ color: '#ffffff' }}>
          {option}
        </MenuItem>
      ))}
    </Select>
    {error && (
      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
        {error}
      </Typography>
    )}
  </FormControl>
);

const RoleSelector = ({ roles, onChange }) => (
  <Box>
    <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffffff' }}>Роли</Typography>
    <List dense sx={{ bgcolor: '#1e1e1e', borderRadius: 1, p: 1 }}>
      {roleOptions.map((role) => (
        <ListItem key={role.value} dense disablePadding>
          <FormControlLabel
            control={
              <Checkbox
                checked={roles.includes(role.value)}
                onChange={() => onChange(role.value)}
                sx={{ color: '#c83a0a', '&.Mui-checked': { color: '#c83a0a' } }}
              />
            }
            label={role.label}
            sx={{ color: '#ffffff', '& .MuiTypography-root': { fontSize: '0.875rem' } }}
          />
        </ListItem>
      ))}
    </List>
  </Box>
);

const LocationSelect = ({ value, onChange }) => (
  <FormControl fullWidth>
    <Select
      value={value || ''}
      name="location_id"
      onChange={onChange}
      sx={{
        color: '#ffffff',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#424242' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c83a0a' },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#c83a0a' }
      }}
      MenuProps={{
        PaperProps: {
          sx: {
            bgcolor: '#424242',
            color: '#ffffff',
            '& .MuiMenuItem-root': {
              '&:hover': { backgroundColor: 'rgba(200, 58, 10, 0.1)' },
              '&.Mui-selected': { backgroundColor: '#c83a0a' }
            }
          }
        }
      }}
    >
      {locationMapper.map((loc) => (
        <MenuItem key={loc.value} value={loc.value}>
          {loc.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

const PhotoUpload = ({ photoPreview, onChange, employee }) => (
  <Box>
    <input 
      type="file" 
      accept="image/*" 
      onChange={onChange} 
      style={{ display: 'none' }} 
      id="photo-upload" 
    />
    <label htmlFor="photo-upload">
      <Button
        variant="outlined"
        component="span"
        sx={{
          color: '#ffffff',
          borderColor: '#c83a0a',
          '&:hover': { borderColor: '#e04b1a', backgroundColor: 'rgba(200, 58, 10, 0.1)' }
        }}
      >
        {photoPreview || (employee?.photo_id) ? 'Заменить фото' : 'Загрузить фото'}
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
);

const ContactManager = ({ contacts, newContact, onAdd, onChange, onRemove }) => (
  <Box sx={{ mt: 1 }}>
    <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffffff' }}>Контакты</Typography>
    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
      <TextField
        fullWidth
        size="small"
        value={newContact}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Добавить контакт"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: '#424242' },
            '&:hover fieldset': { borderColor: '#c83a0a' },
            '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
          },
          '& .MuiInputBase-input': { color: '#ffffff' }
        }}
      />
      <Button
        variant="outlined"
        onClick={onAdd}
        startIcon={<Add />}
        sx={{
          whiteSpace: 'nowrap',
          color: '#ffffff',
          borderColor: '#c83a0a',
          '&:hover': { borderColor: '#e04b1a', backgroundColor: 'rgba(200, 58, 10, 0.1)' }
        }}
      >
        Добавить
      </Button>
    </Box>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {contacts.map((contact) => (
        <Chip
          key={contact}
          label={contact}
          onDelete={() => onRemove(contact)}
          sx={{
            color: '#ffffff',
            backgroundColor: '#424242',
            '& .MuiChip-deleteIcon': { color: '#ffffff', '&:hover': { color: '#c83a0a' } }
          }}
        />
      ))}
    </Box>
  </Box>
);