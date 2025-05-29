import { TextField, Box } from '@mui/material';
import PhotoUploader from './PhotoUploader';

export default function PersonalEmployerForm({ formData, setFormData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        fullWidth
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        sx={textFieldStyles}
      />
      
      <TextField
        fullWidth
        label="Пароль"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        sx={textFieldStyles}
      />
      
      <TextField
        fullWidth
        label="ФИО"
        name="fio"
        value={formData.fio}
        onChange={handleChange}
        sx={textFieldStyles}
      />
      
      <PhotoUploader 
        formData={formData}
        setFormData={setFormData}
      />
    </Box>
  );
}