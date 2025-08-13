export const capitalize = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };


export const locationMapper = {
    'Проспект мира': 1,
    'Страстной': 2,
    'Никольская': 3
  };


export const textFieldStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#424242' },
      '&:hover fieldset': { borderColor: '#c83a0a' },
      '&.Mui-focused fieldset': { borderColor: '#c83a0a' }
    },
    '& .MuiInputLabel-root': { color: '#ffffff', '&.Mui-focused': { color: '#c83a0a' } },
    '& .MuiInputBase-input': { color: '#ffffff' }
  };

export const API_URL = 'http://localhost:8000/api';

export const locationImages = {
  1: [
    '/images/locations/prospect-mira/1.jpg',
    '/images/locations/prospect-mira/2.jpg',
    '/images/locations/prospect-mira/3.jpg'
  ],
  2: [
    '/images/locations/nikolskaya/1.jpg',
    '/images/locations/nikolskaya/2.jpg'
  ],
  3: [
    '/images/locations/strastnoy/1.jpg',
    '/images/locations/strastnoy/2.jpg',
    '/images/locations/strastnoy/3.jpg',
    '/images/locations/strastnoy/4.jpg'
  ]
};


// Функция для сжатия изображения
export const compressImage = async (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Рассчитываем новые размеры с сохранением пропорций
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        // Устанавливаем размеры canvas
        canvas.width = width;
        canvas.height = height;
        
        // Рисуем изображение с новыми размерами
        ctx.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в Blob с заданным качеством
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas to Blob conversion failed'));
              return;
            }
            
            // Создаем новый файл с оригинальным именем
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
};

