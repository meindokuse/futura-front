import { Box, Button } from '@mui/material';
import { useState, useEffect, useOutletContext } from 'react';


export default function PhotoUploader({ formData, setFormData, employee }) {
    const { handleNotification } = useOutletContext();

  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    if (employee?.photo_id && !formData.photo) {
      setPhotoPreview(`http://176.114.90.207:8000/files/employer/${employee.id}/photo`);
    }
  }, [employee, formData.photo]);

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

  return (
    <Box>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handlePhotoChange} 
        style={{ display: 'none' }} 
        id="photo-upload" 
      />
      <label htmlFor="photo-upload">
        <Button
          variant="outlined"
          component="span"
          sx={uploadButtonStyles}
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
  );
}