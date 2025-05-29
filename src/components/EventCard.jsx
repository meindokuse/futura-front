import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, Box } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useOutletContext } from 'react-router-dom';

const EventCard = ({ event, onEdit, onDelete }) => {
  const {mode } = useOutletContext();
  const [isFlipped, setIsFlipped] = useState(false);

  const formattedDate = new Date(event.date_start).toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  return (
    <StyledWrapper>
      <div className="flip-card" onClick={handleFlip}>
        <div className={`flip-card-inner ${isFlipped ? 'flipped' : ''}`}>
          <div className="flip-card-front">
            <p className="title">{event.name}</p>
            <p className="date">{formattedDate}</p>
            {mode === 'admin' && (
              <Box sx={{ position: 'absolute', left:20,bottom: 20, display: 'flex', gap: 2 }}>
              <Button
                startIcon={<Edit />}
                onClick={e => { e.stopPropagation(); onEdit(); }}
                sx={{ color: '#ffffff', '&:hover': { color: '#e04b1a' }, fontSize: '1rem' }}
              >
                Редактировать
              </Button>
              <Button
                startIcon={<Delete />}
                onClick={e => { e.stopPropagation(); onDelete(event.id); }}
                sx={{ color: '#ffffff', '&:hover': { color: '#e04b1a' }, fontSize: '1rem' }}
              >
                Удалить
              </Button>
            </Box>
            )}
            
          </div>
          <div className="flip-card-back">
            <p className="description">{event.description}</p>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .flip-card {
    background-color: transparent;
    width: 500px; /* 190px * 3 */
    height: 408px; /* 254px * 2 */
    perspective: 1000px;
    font-family: sans-serif;
    cursor: pointer;
  }

  .title {
    font-size: 2.5em; /* Увеличен для соответствия размеру */
    font-weight: 900;
    text-align: center;
    margin: 0;
    color: #ffffff;
  }

  .date {
    font-size: 1.5em; /* Увеличен */
    text-align: center;
    color: #ffffff;
    margin-top: 20px;
  }

  .description {
    font-size: 1.5em; /* Увеличен */
    text-align: center;
    color: #ffffff;
    padding: 20px;
    overflow-y: auto;
    max-height: 100%;
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
    box-shadow: 0 8px 14px 0 rgba(0, 0, 0, 0.2);
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border: 1px solid #c83a0a;
    border-radius: 1rem;
  }

  .flip-card-front {
    background: linear-gradient(120deg,rgb(0, 0, 0) 60%,rgb(22, 7, 2) 88%, #424242 40%, rgba(200, 58, 10, 0.603) 48%);
    color: #ffffff;
  }

  .flip-card-back {
    background: linear-gradient(120deg,rgb(0, 0, 0) 60%,rgb(22, 7, 2) 88%, #424242 40%, rgba(200, 58, 10, 0.603) 48%);
    color: #ffffff;
    transform: rotateY(180deg);
  }
`;

export default EventCard;