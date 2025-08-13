import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Button, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { capitalize, API_URL } from '../utils/utils'; 
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

// Кеш для фотографий резидентов
const residentPhotoCache = {};

export default function ResidentCard({ client, onEdit, onDelete }) {
  const {mode} = useOutletContext();
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgSrc, setImgSrc] = useState('default-employer.jpg');
  const abortControllerRef = useRef(null);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleImageError = () => {
    setImgSrc('default-employer.jpg');
  };

  useEffect(() => {
    const fetchPhoto = async () => {
      // Проверяем кеш перед запросом
      if (residentPhotoCache[client.id]) {
        setImgSrc(residentPhotoCache[client.id]);
        return;
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await axios.get(
          `${API_URL}files/resident/${client.id}/get-photo`,
          { 
            params: { expansion: 'png' },
            signal: abortControllerRef.current.signal
          }
        );
        
        if (response.data?.file_url) {
          const url = response.data.file_url.url;
          // Сохраняем в кеш
          residentPhotoCache[client.id] = url;
          setImgSrc(url);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Ошибка загрузки фото:', error);
          setImgSrc('default-employer.jpg');
        }
      }
    };

    fetchPhoto();

    return () => {
      // Отменяем запрос при размонтировании
      abortControllerRef.current?.abort();
    };
  }, [client.id]);

  return (
    <StyledWrapper>
      <div className="flip-card" onClick={handleFlip}>
        <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-front">
            <div className="image-container">
              <img 
                src={imgSrc} 
                alt={client.fio} 
                className="client-photo"
                onError={handleImageError}
                loading="lazy"
              />
            </div>
            <div className="info-container">
              <p className="title">{capitalize(client.fio)}</p>
              <p className="discount">Скидка: {client.discount_value}%</p>
              {mode === 'admin' && (
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  startIcon={<Edit />}
                  onClick={e => { e.stopPropagation(); onEdit(); }}
                  sx={{ color: '#ffffff', '&:hover': { color: '#e04b1a' } }}
                >
                  Редактировать
                </Button>
                <Button
                  startIcon={<Delete />}
                  onClick={e => { e.stopPropagation(); onDelete(client); }}
                  sx={{ color: '#ffffff', '&:hover': { color: '#e04b1a' } }}
                >
                  Удалить
                </Button>
              </Box>
              )}
            </div>
          </div>
          <div className="flip-card-back">
            <p className="description">{client.description || 'Описание отсутствует'}</p>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .flip-card {
    background-color: transparent;
    width: 350px;
    height: 500px;
    perspective: 1000px;
    font-family: sans-serif;
    cursor: pointer;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }

  .flip-card-inner.flipped {
    transform: rotateY(180deg);
  }

  .flip-card-front,
  .flip-card-back {
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border: 1px solid #c83a0a;
    border-radius: 1rem;
    overflow: hidden;
  }

  .flip-card-front {
    background: linear-gradient(120deg, #121212 60%, #1a0a03 88%, #424242 40%, rgba(200, 58, 10, 0.6) 48%);
    color: #ffffff;
  }

  .flip-card-back {
    background: linear-gradient(120deg, #121212 60%, #1a0a03 88%, #424242 40%, rgba(200, 58, 10, 0.6) 48%);
    color: #ffffff;
    transform: rotateY(180deg);
    padding: 20px;
    justify-content: center;
  }

  .image-container {
    height: 50%;
    width: 100%;
    overflow: hidden;
  }

  .client-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .info-container {
    height: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    padding: 20px;
  }

  .title {
    font-size: 1.8em;
    font-weight: 700;
    margin: 0;
    color: #ffffff;
  }

  .discount {
    font-size: 1.5em;
    color: #c83a0a;
    margin: 10px 0;
  }

  .description {
    font-size: 1.2em;
    color: #ffffff;
    text-align: center;
    overflow-y: auto;
    max-height: 100%;
  }
`;